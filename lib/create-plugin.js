/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const ErrorHelper = require('./error-helper.js')
const errorHelper = new ErrorHelper()
const cleanQuery = require('./query-utils')

const NOTICED_ERRORS = ErrorHelper.NOTICED_ERRORS

const ANON_PLACEHOLDER = '<anonymous>'
const UNKNOWN_OPERATION = '<unknown>'

const CATEGORY = 'GraphQL'
const FRAMEWORK = 'ApolloServer'
const OPERATION_PREFIX = CATEGORY + '/operation/' + FRAMEWORK
const RESOLVE_PREFIX = CATEGORY + '/resolve/' + FRAMEWORK
const BATCH_PREFIX = 'batch'

const FIELD_NAME_ATTR = 'graphql.field.name'
const RETURN_TYPE_ATTR = 'graphql.field.returnType'
const PARENT_TYPE_ATTR = 'graphql.field.parentType'
const FIELD_PATH_ATTR = 'graphql.field.path'
const FIELD_ARGS_ATTR = 'graphql.field.args'
const OPERATION_TYPE_ATTR = 'graphql.operation.type'
const OPERATION_NAME_ATTR = 'graphql.operation.name'
const OPERATION_PATH_ATTR = 'graphql.operation.deepestPath'
const OPERATION_QUERY_ATTR = 'graphql.operation.query'

const DESTINATIONS = {
  NONE: 0x00
}

/**
 * @typedef {object} PluginConfig
 * @property {boolean} [captureScalars=false]
 * Enable capture of timing of fields resolved with the `GraphQLScalarType` return type.
 * This may be desired when performing time intensive calculations to return a scalar
 * value.This is not recommended for queries that return a large number of pre-calculated
 * scalar fields.
 * NOTE: query/mutation resolvers will always be captured even if returning a scalar type.
 */

/**
 * Creates an Apollo Server plugin for capturing timing data
 * via the New Relic Node.js agent.
 * @param {*} instrumentationApi New Relic instrumentation API
 * @param {PluginConfig} [config]
 */
function createPlugin(instrumentationApi, config = {}) {
  if (!instrumentationApi) {
    return {}
  }

  const logger = instrumentationApi.logger.child({component: 'ApolloServerPlugin'})

  logger.info('Apollo Server plugin created.')

  config.captureScalars = config.captureScalars || false

  logger.debug('Plugin configuration: ', config)

  createModuleUsageMetric(instrumentationApi.agent)

  return {
    requestDidStart(requestContext) {
      logger.trace('Begin requestDidStart')

      const requestParent = instrumentationApi.getActiveSegment()

      // We do not set to active here as batched queries will hit this
      // back to back and we'd prefer those not nest with each-other.
      const operationSegment = instrumentationApi.createSegment(
        UNKNOWN_OPERATION,
        recordOperationSegment,
        requestParent
      )
      operationSegment.start()

      const deepestResolvedPath = {
        depth: 0,
        formatted: null
      }

      return {
        didEncounterErrors(errorsRequestContext) {
          // Since we don't set the operation segment as active, we want to apply the
          // operation segment as active while setting the error to appropriately assign
          // error attributes for any errors we've not noticed on field resolve.
          instrumentationApi.applySegment(function addErrors() {
            errorHelper.addErrorsFromApolloRequestContext(
              instrumentationApi,
              errorsRequestContext
            )
          }, operationSegment)
        },
        executionDidStart() {
          return {
            willResolveField({args, info}) {
              const pathArray = flattenToArray(info.path)
              const formattedPath = pathArray.reverse().join('.')

              if (pathArray.length > deepestResolvedPath.depth) {
                deepestResolvedPath.depth = pathArray.length
                deepestResolvedPath.formatted = formattedPath
              }

              if (!config.captureScalars && !isTopLevelField(info) && isScalar(info)) {
                return null
              }

              const currentSeg = instrumentationApi.getActiveSegment()

              // Nest everything under operation as resolvers start/finish
              // in order but instrumentation such as promise tracking might
              // try to treat as nested.
              const resolverSegment = instrumentationApi.createSegment(
                `${RESOLVE_PREFIX}/${info.fieldName}`,
                recordResolveSegment,
                operationSegment
              )

              resolverSegment.start()
              instrumentationApi.setActiveSegment(resolverSegment)

              resolverSegment.name = `${RESOLVE_PREFIX}/${formattedPath}`

              resolverSegment.addAttribute(FIELD_PATH_ATTR, formattedPath)
              resolverSegment.addAttribute(FIELD_NAME_ATTR, info.fieldName)
              resolverSegment.addAttribute(RETURN_TYPE_ATTR, info.returnType.toString())
              resolverSegment.addAttribute(PARENT_TYPE_ATTR, info.parentType.toString())


              for (const [key, value] of Object.entries(args)) {
                // Require adding to attribute 'include' configuration
                // so as not to accidentally send senstive info to New Relic.
                resolverSegment.attributes.addAttribute(
                  DESTINATIONS.NONE,
                  `${FIELD_ARGS_ATTR}.${key}`,
                  value
                )
              }

              return (error) => {
                if (error) {
                  // This handler is invoked prior to didEncounterErrors
                  // which means we need to handle the error now to capture
                  // in context of the appropriate span.
                  errorHelper.noticeError(instrumentationApi, error)
                  requestContext[NOTICED_ERRORS] = requestContext[NOTICED_ERRORS] || []
                  requestContext[NOTICED_ERRORS].push(error)
                }

                resolverSegment.end()
                instrumentationApi.setActiveSegment(currentSeg)
              }
            }
          }
        },
        willSendResponse(responseContext) {
          // default. only used if failed to parse
          let transactionName = '*'
          let segmentName = UNKNOWN_OPERATION
          let query = responseContext.request.query

          if (query) {
            // attempt to extract arguments to strip from query
            query = cleanQuery(query)

            operationSegment.addAttribute(
              OPERATION_QUERY_ATTR,
              query)
          }

          const operationDetails
            = getOperationDetails(responseContext, deepestResolvedPath.formatted)

          if (operationDetails) {
            const {operationName, operationType, deepestPath} = operationDetails

            operationSegment.addAttribute(OPERATION_TYPE_ATTR, operationType)

            if (operationName) {
              operationSegment.addAttribute(OPERATION_NAME_ATTR, operationName)
            }

            const formattedName = operationName || ANON_PLACEHOLDER
            let formattedOperation = `${operationType}/${formattedName}`

            // Certain requests, such as introspection, won't hit any resolvers
            if (deepestPath) {
              operationSegment.addAttribute(OPERATION_PATH_ATTR, deepestPath)

              formattedOperation += `/${deepestPath}`
            }

            segmentName = formattedOperation
            transactionName = formattedOperation
          }

          setTransactionName(instrumentationApi.agent, transactionName)

          operationSegment.name = `${OPERATION_PREFIX}/${segmentName}`
          operationSegment.end()

          logger.trace('End willSendResponse')
        }
      }
    }
  }
}

function getOperationDetails(responseContext, deepestPath) {
  if (responseContext.operation) {
    // Resolved operation: parsed and validated, will execute resolvers

    return {
      operationName: responseContext.operationName,
      operationType: responseContext.operation.operation,
      deepestPath: deepestPath
    }
  } else if (responseContext.document) {
    // Failed validation, fallback to document AST

    return getDetailsFromDocument(responseContext.document)
  }

  return null
}

function isScalar(fieldInfo) {
  const result =
    isScalarType(fieldInfo.returnType) || isNonNullScalarType(fieldInfo.returnType)
  return result
}

function isScalarType(typeInstance) {
  const typeName = typeInstance.constructor.name
  const result = typeName === 'GraphQLScalarType'
  return result
}

function isNonNullScalarType(returnType) {
  const returnTypeName = returnType.constructor.name
  if (returnTypeName !== 'GraphQLNonNull' || !returnType.ofType) {
    return false
  }

  const nestedType = returnType.ofType
  const result = isScalarType(nestedType)

  return result
}

function isTopLevelField(fieldInfo) {
  const parentName = fieldInfo.parentType.name
  const result = parentName === 'Query' || parentName === 'Mutation'
  return result
}

function getDetailsFromDocument(document) {
  const definition = document.definitions[0]

  const deepestSelectionPath = getDeepestSelectionPath(definition)
  const definitionName = definition.name && definition.name.value

  return {
    operationType: definition.operation,
    operationName: definitionName,
    deepestPath: deepestSelectionPath.join('.')
  }
}

function flattenToArray(fieldPath) {
  const pathArray = []

  let thisPath = fieldPath
  while (thisPath) {
    if (typeof thisPath.key !== 'number') {
      pathArray.push(thisPath.key)
    }
    thisPath = thisPath.prev
  }

  return pathArray
}

function setTransactionName(agent, transactionName) {
  const transaction = agent.tracer.getTransaction()

  const nameState = transaction.nameState
  if (!nameState.graphql) {
    // Override previously set path stack set thus far by web framework.
    nameState.setName(
      nameState.prefix,
      nameState.verb,
      nameState.delimiter,
      transactionName
    )

    // Indicate we've set a name via graphql and future attempts to name
    // are a part of a batch query request to apollo.
    nameState.graphql = true
  } else {
    // If this is a batch query, add 'batch' indicator to the first part of the
    // name unless we've already done so processing a prior query in the batch.
    const firstPart = nameState.pathStack[0]
    if (firstPart.path !== BATCH_PREFIX) {
      nameState.pathStack.unshift({path: BATCH_PREFIX, params: null})
    }

    nameState.appendPath(transactionName)
  }
}

/**
 * Returns the deepest path as an array of parts
 * from an apollo-server document definition.
 */
function getDeepestSelectionPath(definition) {
  let deepestPath = null

  definition.selectionSet.selections.forEach((selection) => {
    searchSelection(selection)
  })

  return deepestPath

  /**
   * Search each selection path until no-more sub-selections
   * exist. If the curent path is deeper than deepestPath,
   * deepestPath is replaced.
   */
  function searchSelection(selection, currentParts) {
    const parts = currentParts ? [...currentParts] : []
    parts.push(selection.name.value)

    if (selection.selectionSet) {
      selection.selectionSet.selections.forEach((innerSelection) => {
        searchSelection(innerSelection, parts)
      })
    } else if (!deepestPath || parts.length > deepestPath.length) {
      deepestPath = parts
    }
  }
}

function recordResolveSegment(segment, scope) {
  const duration = segment.getDurationInMillis()
  const exclusive = segment.getExclusiveDurationInMillis()

  const transaction = segment.transaction

  const attributes = segment.getAttributes()
  const fieldName = attributes[FIELD_NAME_ATTR]

  // The segment name uses the path to differentiate between duplicate
  // names resolving across different types. Here we use the field name
  // without the path to compare resolver across usage and transactions.
  if (fieldName) {
    const fieldNameMetric = `${RESOLVE_PREFIX}/${fieldName}`
    createMetricPairs(transaction, fieldNameMetric, scope, duration, exclusive)
  }
}

function recordOperationSegment(segment, scope) {
  const duration = segment.getDurationInMillis()
  const exclusive = segment.getExclusiveDurationInMillis()

  const transaction = segment.transaction

  createMetricPairs(transaction, segment.name, scope, duration, exclusive)
}

function createMetricPairs(transaction, name, scope, duration, exclusive) {
  if (scope) {
    transaction.measure(name, scope, duration, exclusive)
  }

  transaction.measure(name, null, duration, exclusive)
}

function createModuleUsageMetric(agent) {
  agent.metrics.getOrCreateMetric(
    'Supportability/ExternalModules/ApolloServerPlugin'
  ).incrementCallCount()
}

module.exports = createPlugin
