/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const ANON_PLACEHOLDER = '<anonymous>'
const CATEGORY = 'GraphQL'
const FRAMEWORK = 'ApolloServer'
const OPERATION_PREFIX = CATEGORY + '/operation/' + FRAMEWORK
const RESOLVE_PREFIX = CATEGORY + '/resolve/' + FRAMEWORK
const ARG_PREFIX = `${CATEGORY}/arg/${FRAMEWORK}`
const FIELD_PREFIX = `${CATEGORY}/field/${FRAMEWORK}`
const BATCH_PREFIX = 'batch'
const DEFAULT_OPERATION_NAME = `${OPERATION_PREFIX}/<unknown>`

const FIELD_NAME_ATTR = 'graphql.field.name'
const PARENT_TYPE_ATTR = 'graphql.field.parentType'
const RETURN_TYPE_ATTR = 'graphql.field.returnType'
const FIELD_PATH_ATTR = 'graphql.field.path'
const OPERATION_TYPE_ATTR = 'graphql.operation.type'
const OPERATION_NAME_ATTR = 'graphql.operation.name'
const OPERATION_QUERY_ATTR = 'graphql.operation.query'
const { getOperationDetails } = require('./utils')

function setTransactionName(transaction, transactionName) {
  const nameState = transaction.nameState
  if (!nameState.graphql) {
    // Override previously set path stack set thus far by web framework.
    nameState.setName(nameState.prefix, nameState.verb, nameState.delimiter, transactionName)

    // Indicate we've set a name via graphql and future attempts to name
    // are a part of a batch query request to apollo.
    nameState.graphql = true
  } else {
    // If this is a batch query, add 'batch' indicator to the first part of the
    // name unless we've already done so processing a prior query in the batch.
    const firstPart = nameState.pathStack[0]
    if (firstPart.path !== BATCH_PREFIX) {
      nameState.pathStack.unshift({ path: BATCH_PREFIX, params: null })
    }

    nameState.appendPath(transactionName)
  }
}

function createOperationSegment(shim, parent) {
  // We do not set to active here as batched queries will hit this
  // back to back and we'd prefer those not nest with each-other.
  return shim.createSegment(DEFAULT_OPERATION_NAME, recordOperationSegment, parent)
}

function createResolverSegment({ shim, parent, resolver, formattedPath }) {
  // Nest everything under operation as resolvers start/finish
  // in order but instrumentation such as promise tracking might
  // try to treat as nested.
  const resolverSegment = shim.createSegment(
    `${RESOLVE_PREFIX}/${resolver.fieldName}`,
    recordResolveSegment,
    parent
  )

  if (!resolverSegment) {
    return null
  }

  resolverSegment.start()
  shim.setActiveSegment(resolverSegment)

  resolverSegment.name = `${RESOLVE_PREFIX}/${formattedPath}`
  resolverSegment.addAttribute(FIELD_PATH_ATTR, formattedPath)
  resolverSegment.addAttribute(FIELD_NAME_ATTR, resolver.fieldName)
  resolverSegment.addAttribute(RETURN_TYPE_ATTR, resolver.returnType.toString())
  resolverSegment.addAttribute(PARENT_TYPE_ATTR, resolver.parentType.toString())
  return resolverSegment
}

/**
 * Creates metrics for resolver fields when transaction is ended.
 * This will record how long specific resolvers took.
 *
 * @param {Object} params.config plugin config
 * @param {Object} segment relevant resolver segment
 * @param {string} scope name of transaction
 * @param {Transaction} transaction active transaction
 */
function recordResolveSegment(segment, scope, transaction) {
  const duration = segment.getDurationInMillis()
  const exclusive = segment.getExclusiveDurationInMillis()

  const attributes = segment.getAttributes()
  const fieldName = attributes[FIELD_NAME_ATTR]
  const fieldType = attributes[PARENT_TYPE_ATTR]

  // The segment name uses the path to differentiate between duplicate
  // names resolving across different types. Here we use the field name
  // with parent type to compare resolver across usage and transactions.
  if (fieldName && fieldType) {
    const typedFieldMetric = `${RESOLVE_PREFIX}/${fieldType}.${fieldName}`
    createMetricPairs(transaction, typedFieldMetric, scope, duration, exclusive)
  }
}

function recordOperationSegment(segment, scope, transaction) {
  const duration = segment.getDurationInMillis()
  const exclusive = segment.getExclusiveDurationInMillis()

  createMetricPairs(transaction, segment.name, scope, duration, exclusive)
}

function createMetricPairs(transaction, name, scope, duration, exclusive) {
  if (scope) {
    transaction.measure(name, scope, duration, exclusive)
  }

  transaction.measure(name, null, duration, exclusive)
}

function createModuleUsageMetric(agent) {
  agent.metrics
    .getOrCreateMetric('Supportability/ExternalModules/ApolloServerPlugin')
    .incrementCallCount()
}

/**
 * Attempts to extract the document from the request context and
 * add attributes for the query, operation type, operation name and
 * update the transaction name based on operation name as well
 *
 * @param {Object} context apollo request context
 * @param {Segment} operationSegment default segment created in request start
 * @param {Transaction} transaction active transaction
 * @return {Boolean} true if document could be parsed from context
 */
function updateOperationSegmentName(context, operationSegment, transaction) {
  const operationDetails = getOperationDetails(context)
  if (operationDetails) {
    const { operationName, operationType, deepestUniquePath, cleanedQuery } = operationDetails

    operationSegment.addAttribute(OPERATION_QUERY_ATTR, cleanedQuery)

    operationSegment.addAttribute(OPERATION_TYPE_ATTR, operationType)

    if (operationName) {
      operationSegment.addAttribute(OPERATION_NAME_ATTR, operationName)
    }

    const formattedName = operationName || ANON_PLACEHOLDER
    let formattedOperation = `${operationType}/${formattedName}`

    // Certain requests, such as introspection, won't hit any resolvers
    if (deepestUniquePath) {
      formattedOperation += `/${deepestUniquePath}`
    }

    const segmentName = formattedOperation
    const transactionName = formattedOperation
    setTransactionName(transaction, transactionName)
    operationSegment.name = `${OPERATION_PREFIX}/${segmentName}`
    return true
  }

  return false
}

/**
 * Captures both field and args of resolvers as metrics.
 *
 * This is intended to be used to determine if a field within a graphql schema is still being requested.
 *
 * @param {Object} params
 * @param {Object} params.config plugin config
 * @param {Object} params.info info key from resolver context
 * @param {Object} params.transaction active transaction
 * @param {Object} params.args args key from resolver context
 *
 */
function maybeCaptureFieldMetrics({ config, info, transaction, args }) {
  if (config.captureFieldMetrics) {
    const fieldName = info.fieldName
    const fieldType = info.parentType.toString()
    captureFieldMetrics({ transaction, args, fieldName, fieldType })
  }
}

/**
 * Used to create metrics that just increment call count.  Intended to be
 * used to report on when we see args in a resolver
 *
 * @param {Object} agent active agent instance
 * @param {String} name metric name
 */
function createCallCountMetric(transaction, name) {
  const metric = transaction.metrics.getOrCreateMetric(name)
  metric.incrementCallCount()
}

/**
 * Captures both field and args of resolvers as metrics.
 *
 * This is intended to be used to determine if a field within a graphql schema is still being requested.
 *
 * @param {Object} params
 * @param {Object} params.transaction active transaction
 * @param {Object} params.args args key from resolver context
 * @param {Object} params.fieldType parent type of field
 * @param {Object} params.fieldName name of field
 *
 */
function captureFieldMetrics({ transaction, args, fieldType, fieldName }) {
  const fieldMetric = `${FIELD_PREFIX}/${fieldType}.${fieldName}`
  createCallCountMetric(transaction, fieldMetric)
  Object.entries(args).forEach(([key]) => {
    const name = `${ARG_PREFIX}/${fieldType}.${fieldName}/${key}`
    createCallCountMetric(transaction, name)
  })
}

module.exports = {
  createModuleUsageMetric,
  createOperationSegment,
  createResolverSegment,
  DEFAULT_OPERATION_NAME,
  maybeCaptureFieldMetrics,
  setTransactionName,
  updateOperationSegmentName
}
