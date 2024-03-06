/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const ErrorHelper = require('./error-helper.js')
const errorHelper = new ErrorHelper()
const NOTICED_ERRORS = ErrorHelper.NOTICED_ERRORS
const DESTINATIONS = {
  NONE: 0x00
}
const FIELD_ARGS_ATTR = 'graphql.field.args'
const {
  DEFAULT_OPERATION_NAME,
  createOperationSegment,
  createResolverSegment,
  maybeCaptureFieldMetrics,
  setTransactionName,
  updateOperationSegmentName
} = require('./common')
const {
  flattenArgs,
  flattenToArray,
  isScalar,
  isTopLevelField,
  shouldIgnoreTransaction
} = require('./utils')

/**
 * Registers the hook for `requestDidStart` server event.  The `requestDidStart` event
 * fires whenever Apollo Server begins fulfilling a GraphQL request
 *
 * @param {object} params function params
 * @param {object} params.api the newrelic api
 * @param {object} params.shim shim instance
 * @param {object} params.logger logger instance
 * @param {object} params.config apollo plugin configuration
 * @param {GraphQLRequestContext} requestContext context on request start
 * @returns {object} request lifecycle events
 */
module.exports = function requestDidStart({ api, shim, logger, config }, requestContext) {
  logger.trace('Begin requestDidStart')

  const requestParent = shim.getActiveSegment()

  if (!requestParent) {
    logger.trace('No active segment found at query start. Not recording.')
    return null
  }

  const operationSegment = createOperationSegment(shim, requestParent)

  if (!operationSegment) {
    logger.trace('Operation segment was not created. Not recording.')
    return null
  }

  operationSegment.start()

  return {
    didResolveOperation: didResolveOperation.bind(null, {
      shim,
      config,
      logger,
      operationSegment
    }),
    didEncounterErrors: didEncounterErrors.bind(null, { shim, operationSegment }),
    executionDidStart() {
      // Needed for proper sub-graph external call nesting with federation gateway.
      // We do this here to avoid mis-nesting batch operation calls which
      // hit didResolveOperation back to back.
      shim.setActiveSegment(operationSegment)

      return {
        willResolveField: willResolveField.bind(null, {
          api,
          shim,
          config,
          logger,
          operationSegment,
          requestContext
        })
      }
    },
    willSendResponse: willSendResponse.bind(null, {
      api,
      shim,
      config,
      logger,
      operationSegment
    })
  }
}

/**
 * The didResolveOperation event fires after the graphql library successfully determines the operation to execute from a request's document AST.
 * At this stage, both the operationName string and operation AST are available.
 *
 * @param {object} params function params
 * @param {object} params.shim shim instance
 * @param {object} params.config apollo plugin configuration
 * @param {object} params.logger logger instance
 * @param {TraceSegment} params.operationSegment the segment capturing the operation
 * @param {GraphQLRequestContext} requestContext context on operation resolution
 */
function didResolveOperation({ shim, config, logger, operationSegment }, requestContext) {
  updateOperationSegmentName(requestContext, operationSegment)
  if (shouldIgnoreTransaction(requestContext.operation, config, logger)) {
    const activeSegment = shim.getActiveSegment()
    if (activeSegment) {
      const transaction = activeSegment.transaction
      transaction.setForceIgnore(true)
    }
  }
}

/**
 * The didEncounterErrors event fires when Apollo Server encounters errors while parsing, validating, or executing a GraphQL operation.
 * The errors are available on requestContext.errors.
 *
 * @param {object} params function params
 * @param {object} params.shim shim instance
 * @param {TraceSegment} params.operationSegment the segment capturing the operation
 * @param {GraphQLRequestContext} requestContext context on request errors
 */
function didEncounterErrors({ shim, operationSegment }, requestContext) {
  // Since we don't set the operation segment as active, we want to apply the
  // operation segment as active while setting the error to appropriately assign
  // error attributes for any errors we've not noticed on field resolve.
  shim.applySegment(function addErrors() {
    errorHelper.addErrorsFromApolloRequestContext(shim, requestContext)
  }, operationSegment)
}

/**
 * The willResolveField event fires whenever Apollo Server is about to resolve a single field during the execution of an operation
 *
 * @param {object} params function params
 * @param {object} params.api the newrelic api
 * @param {object} params.shim shim instance
 * @param {object} params.config apollo plugin configuration
 * @param {object} params.logger logger instance
 * @param {TraceSegment} params.operationSegment the segment capturing the operation
 * @param {GraphQLRequestContext} requestContext context on operation resolution
 * @returns {Function} handler once field resolves, used to handle errors
 */
function willResolveField(
  { api, shim, logger, config, operationSegment, requestContext },
  resolverContext
) {
  const { info, args } = resolverContext
  const pathArray = flattenToArray(info.path)
  const formattedPath = pathArray.reverse().join('.')
  const flattenedArgs = flattenArgs({ obj: args })

  maybeCaptureFieldMetrics({ operationSegment, info, args: flattenedArgs, config })

  if (!config.captureScalars && !isTopLevelField(info) && isScalar(info)) {
    return null
  }

  const currentSegment = shim.getActiveSegment()

  const resolverSegment = createResolverSegment({
    shim,
    parent: operationSegment,
    resolver: info,
    formattedPath
  })

  if (!resolverSegment) {
    logger.trace('Resolver segment was not created (%s).', formattedPath)

    return null
  }

  if (shim.isFunction(config.customResolverAttributes)) {
    const customAttributes = config.customResolverAttributes(resolverContext)
    api.addCustomAttributes(customAttributes)
  }

  // Like our http and framework instrumentation, we add
  // the attributes on the operation segment. We also add
  // the attributes to resolver segments as they help
  // inform performance impacts.
  for (const segment of [operationSegment, resolverSegment]) {
    for (const [key, value] of Object.entries(flattenedArgs)) {
      // Require adding to attribute 'include' configuration
      // so as not to accidentally send sensitive info to New Relic.
      segment.attributes.addAttribute(DESTINATIONS.NONE, `${FIELD_ARGS_ATTR}.${key}`, value)
    }
  }

  return fieldResolver.bind(null, {
    shim,
    requestContext,
    resolverSegment,
    currentSegment
  })
}

/**
 * The end hook that's invoked  in `willResolveField` with the resolver's result (or the error that it throws).
 * The end hook is called when your resolver has fully resolved (e.g., if the resolver returns a Promise, the hook is called with the Promise's eventual resolved result).
 *
 * @param {object} params function params
 * @param {object} params.shim shim instance
 * @param {object} params.requestContext context from willResolveField
 * @param {TraceSegment} params.resolverSegment the segment capturing resolver
 * @param {TraceSegment} params.currentSegment the outer segment typically capturing the operation
 * @param {Error} error if exists will attach error to symbol on requestContext
 */
function fieldResolver({ shim, requestContext, resolverSegment, currentSegment }, error) {
  if (error) {
    // This handler is invoked prior to didEncounterErrors
    // which means we need to handle the error now to capture
    // in context of the appropriate span.
    errorHelper.noticeError(shim, error)
    requestContext[NOTICED_ERRORS] = requestContext[NOTICED_ERRORS] || []
    requestContext[NOTICED_ERRORS].push(error)
  }

  resolverSegment.end()
  shim.setActiveSegment(currentSegment)
}

/**
 * The willSendResponse event fires whenever Apollo Server is about to send a response for a GraphQL operation.
 * This event fires (and Apollo Server sends a response) even if the GraphQL operation encounters one or more errors.
 *
 * @param {object} params function params
 * @param {object} params.api the newrelic api
 * @param {object} params.shim shim instance
 * @param {object} params.config apollo plugin configuration
 * @param {object} params.logger logger instance
 * @param {TraceSegment} params.operationSegment the segment capturing the operation
 * @param {GraphQLRequestContext} requestContext context on operation resolution
 */
function willSendResponse({ api, shim, config, logger, operationSegment }, requestContext) {
  // check if operation segment was never updated from default name
  // If so, try to rename before setting the transaction name to `*`
  if (operationSegment.name === DEFAULT_OPERATION_NAME) {
    const updated = updateOperationSegmentName(requestContext, operationSegment)
    if (!updated) {
      setTransactionName(operationSegment.transaction, '*')
    }
  }

  if (shim.isFunction(config.customOperationAttributes)) {
    const customAttributes = config.customOperationAttributes(requestContext)
    api.addCustomAttributes(customAttributes)
  }

  operationSegment.end()

  logger.trace('End willSendResponse')
}
