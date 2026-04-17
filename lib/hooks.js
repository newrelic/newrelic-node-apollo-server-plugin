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
  const { tracer } = shim
  logger.trace('Begin requestDidStart')
  const ctx = tracer.getContext()
  const operationSegment = ctx?.segment
  const transaction = ctx?.transaction

  if (!operationSegment) {
    logger.trace('Operation segment was not created. Not recording.')
    return null
  }

  return {
    didResolveOperation: didResolveOperation.bind(null, {
      config,
      logger,
      operationSegment,
      transaction
    }),
    didEncounterErrors: didEncounterErrors.bind(null, { shim, operationSegment }),
    executionDidStart() {
      return {
        willResolveField: willResolveField.bind(null, {
          api,
          shim,
          config,
          logger,
          operationSegment,
          requestContext,
          transaction
        })
      }
    },
    willSendResponse: willSendResponse.bind(null, {
      api,
      shim,
      config,
      logger,
      operationSegment,
      transaction
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
 * @param params.transaction
 */
function didResolveOperation({ config, logger, operationSegment, transaction }, requestContext) {
  updateOperationSegmentName(requestContext, operationSegment, transaction)
  if (shouldIgnoreTransaction(requestContext.operation, config, logger)) {
    transaction.setForceIgnore(true)
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
function didEncounterErrors({ shim }, requestContext) {
  errorHelper.addErrorsFromApolloRequestContext(shim, requestContext)
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
 * @param params.requestContext
 * @param params.transaction
 * @param resolverContext
 * @returns {Function} handler once field resolves, used to handle errors
 */
function willResolveField(
  { api, shim, logger, config, operationSegment, requestContext, transaction },
  resolverContext
) {
  const { info, args } = resolverContext
  const pathArray = flattenToArray(info.path)
  const formattedPath = pathArray.reverse().join('.')
  const flattenedArgs = flattenArgs({ obj: args })

  maybeCaptureFieldMetrics({ transaction, info, args: flattenedArgs, config })

  if (!config.captureScalars && !isTopLevelField(info) && isScalar(info)) {
    return null
  }

  const resolverSegment = createResolverSegment({
    shim,
    parent: operationSegment,
    resolver: info,
    formattedPath
  })
  console.log('created resolver segment', resolverSegment?.name)

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
    resolverSegment
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
 * @param {Error} error if exists will attach error to symbol on requestContext
 */
function fieldResolver({ shim, requestContext, resolverSegment }, error) {
  if (error) {
    // This handler is invoked prior to didEncounterErrors
    // which means we need to handle the error now to capture
    // in context of the appropriate span.
    errorHelper.noticeError(shim, error)
    requestContext[NOTICED_ERRORS] = requestContext[NOTICED_ERRORS] || []
    requestContext[NOTICED_ERRORS].push(error)
  }

  resolverSegment.end()
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
 * @param params.transaction
 */
function willSendResponse(
  { api, shim, config, logger, operationSegment, transaction },
  requestContext
) {
  // check if operation segment was never updated from default name
  // If so, try to rename before setting the transaction name to `*`
  if (operationSegment.name === DEFAULT_OPERATION_NAME) {
    const updated = updateOperationSegmentName(requestContext, operationSegment, transaction)
    if (!updated) {
      setTransactionName(transaction, '*')
    }
  }

  if (shim.isFunction(config.customOperationAttributes)) {
    const customAttributes = config.customOperationAttributes(requestContext)
    api.addCustomAttributes(customAttributes)
  }

  operationSegment.end()

  logger.trace('End willSendResponse')
}
