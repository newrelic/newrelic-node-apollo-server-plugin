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
const UNKNOWN_OPERATION = '<operation unknown>'

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

function createPlugin(instrumentationApi) {
  if (!instrumentationApi) {
    return {}
  }

  return {
    requestDidStart(requestContext) {
      const requestParent = instrumentationApi.getActiveSegment()

      // We do not set to active here as batched queries will hit this
      // back to back and we'd prefer those not nest with each-other.
      const operationSegment = instrumentationApi.createSegment(
        UNKNOWN_OPERATION,
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
              const currentSeg = instrumentationApi.getActiveSegment()

              // Nest everything under operation as resolvers start/finish
              // in order but instrumentation such as promise tracking might
              // try to treat as nested.
              const resolverSegment = instrumentationApi.createSegment(
                `resolve: ${info.fieldName}`,
                operationSegment
              )

              resolverSegment.start()
              instrumentationApi.setActiveSegment(resolverSegment)

              const pathArray = flattenToArray(info.path)
              const formattedPath = pathArray.reverse().join('.')

              resolverSegment.name = `resolve: ${formattedPath}`

              if (pathArray.length > deepestResolvedPath.depth) {
                deepestResolvedPath.depth = pathArray.length
                deepestResolvedPath.formatted = formattedPath
              }
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
          
          // attempt to extract arguments to strip from query
          query = cleanQuery(query)
          
          operationSegment.attributes.addAttribute(
            DESTINATIONS.NONE,
            OPERATION_QUERY_ATTR,
            query)

          const operationDetails
            = getOperationDetails(responseContext, deepestResolvedPath.formatted)

          if (operationDetails) {
            const {operationName, operationType, deepestPath} = operationDetails

            operationSegment.addAttribute(OPERATION_TYPE_ATTR, operationType)

            if (operationName) {
              operationSegment.addAttribute(OPERATION_NAME_ATTR, operationName)
            }

            const formattedName = operationName || ANON_PLACEHOLDER
            const formattedOperation = `${operationType} ${formattedName}`

            segmentName = formattedOperation
            transactionName = formattedOperation

            // Certain requests, such as introspection, won't hit any resolvers
            if (deepestPath) {
              operationSegment.addAttribute(OPERATION_PATH_ATTR, deepestPath)

              transactionName += ` ${deepestPath}`
            }
          }

          setTransactionName(instrumentationApi.agent, transactionName)

          operationSegment.name = segmentName
          operationSegment.end()
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

// TODO: setup so don't need special internals
// forcing will prevent custom names via API from working
function setTransactionName(agent, name) {
  const transaction = agent.tracer.getTransaction()

  // TODO: ideally set via normal framework mechanisms as naming gets resolved
  const framework = 'apollo-server'

  if (!transaction.forceName) {
    transaction.forceName = `${framework}/${name}`
    return
  }

  transaction.forceName = transaction.forceName.replace(framework, `${framework}/batch`)
  const batchName = `${transaction.forceName}/${name}`
  transaction.forceName = batchName
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

module.exports = createPlugin
