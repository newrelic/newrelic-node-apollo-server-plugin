/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const cleanQuery = require('./query-utils')
const INTROSPECTION_TYPES = ['__schema', '__type']
const IGNORED_PATH_FIELDS = ['id', '__typename']
const SERVICE_DEFINITION_QUERY_NAME = '__ApolloGetServiceDefinition__'
const HEALTH_CHECK_QUERY_NAME = '__ApolloServiceHealthCheck__'

function isIntrospectionQuery(operation) {
  return operation?.selectionSet?.selections?.every((selection) => {
    const fieldName = selection?.name?.value
    return INTROSPECTION_TYPES.includes(fieldName)
  })
}

function isServiceDefinitionQuery(operation) {
  return operation?.name?.value === SERVICE_DEFINITION_QUERY_NAME
}

function isHealthCheckQuery(operation) {
  return operation?.name?.value === HEALTH_CHECK_QUERY_NAME
}

function shouldIgnoreTransaction(operation, config, logger) {
  if (!operation) {
    logger.trace('`operation` is undefined. Skipping query type check.')
    return false
  }

  if (!config.captureIntrospectionQueries && isIntrospectionQuery(operation)) {
    logger.trace(
      'Request is an introspection query and ' +
        '`config.captureIntrospectionQueries` is set to `false`. Force ignoring the transaction.'
    )

    return true
  }

  if (!config.captureServiceDefinitionQueries && isServiceDefinitionQuery(operation)) {
    logger.trace(
      'Request is an Apollo Federated Gateway service definition query and ' +
        '`config.captureServiceDefinitionQueries` is set to `false`. Force ignoring the transaction.'
    )

    return true
  }

  if (!config.captureHealthCheckQueries && isHealthCheckQuery(operation)) {
    logger.trace(
      'Request is an Apollo Federated Gateway health check query and ' +
        '`config.captureHealthCheckQueries` is set to `false`. ' +
        'Force ignoring the transaction.'
    )

    return true
  }

  return false
}

/**
 * Returns an object with the deepest path in the document definition selectionSet
 * along with query argument locations in raw query string.
 * Deepest path is built from field names where only one field is in selectionSet.
 *
 * 'id' and '__typename' fields are filtered out of consideration to improve
 * naming in sub graph scenarios.
 */
function getDeepestPathAndQueryArguments(definition) {
  let deepestPath = []
  let foundDeepestPath = false
  const argLocations = []

  definition?.selectionSet?.selections?.forEach((selection) => {
    searchSelection(selection)
  })

  return {
    deepestPath,
    argLocations
  }

  /**
   * Search each selection path until no-more sub-selections
   * exist. If the current path is deeper than deepestPath,
   * deepestPath is replaced.
   */
  function searchSelection(selection, currentParts) {
    const parts = currentParts ? [...currentParts] : []

    // capture the arguments for a selection
    if (selection?.arguments?.length > 0) {
      selection.arguments.forEach((arg) => {
        argLocations.push(arg?.loc)
      })
    }

    if (!foundDeepestPath) {
      // Build up deepest path
      if (isNamedType(selection)) {
        const lastItemIdx = parts.length - 1
        // add type to the last item in parts array
        // (i.e - `_entities<Human>`)
        parts[lastItemIdx] = `${parts[lastItemIdx]}<${selection?.typeCondition?.name?.value}>`
      } else {
        // Add selection name to deepest path
        selection?.name &&
          IGNORED_PATH_FIELDS.indexOf(selection?.name?.value) < 0 &&
          parts.push(selection?.name?.value)
      }
    }

    // end if no more selections
    if (selection.selectionSet) {
      // Filter selections used for naming
      const filtered = filterSelectionsForDeepestPath(selection.selectionSet.selections)

      // When no selections returned from filtering, deepest path is found
      if (filtered.length === 0 || filtered.length > 1) {
        foundDeepestPath = true
        deepestPath = parts
      }

      // Recurse through inner selections
      filtered.forEach((innerSelection) => {
        searchSelection(innerSelection, parts)
      })
    } else if (!deepestPath.length || parts.length > deepestPath.length) {
      // Add selection parts to deepest path if we're not done
      deepestPath = parts
    }
  }
}

function filterSelectionsForDeepestPath(selections) {
  return selections?.filter((currentSelection) => {
    // Inline fragments describe the prior element (_entities or unions) but contain
    // selections for further naming.
    if (currentSelection?.kind === 'InlineFragment') {
      return true
    }

    return IGNORED_PATH_FIELDS.indexOf(currentSelection?.name?.value) < 0
  })
}

/**
 * Checks if selection is an InlineFragment that is a
 * NamedType
 * see: https://graphql.org/learn/queries/#inline-fragments
 *
 * @param {Object} selection node in grapql document AST
 */
function isNamedType(selection) {
  return (
    selection?.kind === 'InlineFragment' &&
    selection?.typeCondition?.kind === 'NamedType' &&
    selection?.typeCondition?.name
  )
}

function flattenToArray(fieldPath) {
  const pathArray = []

  let thisPath = fieldPath
  while (thisPath) {
    if (typeof thisPath.key !== 'number') {
      pathArray.push(thisPath?.key)
    }
    thisPath = thisPath?.prev
  }

  return pathArray
}

/**
 * Takes a nested object and flattens the key/values
 * { book: { author: { name: 'George Orwell' }, title: '1984' }}
 * would flatten to { book.author.name: 'George Orwell', book.title: '1984' }
 *
 * @param {object} args
 * @param {object} result resulting object
 * @param {string} [prefix=''] prefix of key
 * @param {object} obj object to flatten
 */
function flattenArgs({ result = {}, prefix = '', obj }) {
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      flattenArgs({ result, prefix: prefix + key + '.', obj: obj[key] })
    } else {
      result[prefix + key] = obj[key]
    }
  }

  return result
}

function getOperationDetails(responseContext) {
  if (!responseContext.document) {
    return null
  }

  return getDetailsFromDocument(responseContext)
}

function isScalar(fieldInfo) {
  return isScalarType(fieldInfo?.returnType) || isNonNullScalarType(fieldInfo?.returnType)
}

function isScalarType(typeInstance) {
  const typeName = typeInstance?.constructor?.name
  return typeName === 'GraphQLScalarType'
}

function isNonNullScalarType(returnType) {
  const returnTypeName = returnType?.constructor?.name
  if (returnTypeName !== 'GraphQLNonNull' || !returnType?.ofType) {
    return false
  }

  const nestedType = returnType?.ofType
  return isScalarType(nestedType)
}

function isTopLevelField(fieldInfo) {
  const parentName = fieldInfo?.parentType?.name
  return parentName === 'Query' || parentName === 'Mutation'
}

/**
 * fragments could be defined for a given operation.  This iterates over the definitions
 * to find the operation definition to avoid issues with naming
 * see: https://github.com/newrelic/newrelic-node-apollo-server-plugin/issues/175
 *
 * @param {Array} definitions
 */
function findOperationDefinition(definitions) {
  return definitions?.find((definition) => definition?.kind === 'OperationDefinition')
}

function getDetailsFromDocument(responseContext) {
  const definition = findOperationDefinition(responseContext?.document?.definitions)

  const pathAndArgs = getDeepestPathAndQueryArguments(definition)

  // always use context.source so we can get both queries and persisted queries
  // see: https://github.com/apollographql/apollo-server/blob/2bccec2c5f5adaaf785f13ab98b6e52e22d5b22e/packages/apollo-server-core/src/requestPipeline.ts#L232
  const query = cleanQuery(responseContext?.source, pathAndArgs?.argLocations)

  const deepestUniquePath = pathAndArgs?.deepestPath

  const definitionName = definition?.name?.value

  return {
    operationType: definition.operation,
    operationName: definitionName,
    deepestUniquePath: deepestUniquePath.join('.'),
    cleanedQuery: query
  }
}

module.exports = {
  flattenArgs,
  flattenToArray,
  getOperationDetails,
  isScalar,
  isTopLevelField,
  shouldIgnoreTransaction
}
