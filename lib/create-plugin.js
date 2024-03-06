/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const requestDidStart = require('./hooks')
const { createModuleUsageMetric } = require('./common')

/**
 * Creates an Apollo Server plugin for capturing timing data
 * via the New Relic Node.js agent.
 * @param {*} shim New Relic instrumentation API
 * @param {PluginConfig} [config]
 */
function createPlugin(api, config = {}) {
  if (!api?.shim) {
    return {}
  }
  const { shim } = api

  const logger = shim.logger.child({ component: 'ApolloServerPlugin' })

  logger.info('Apollo Server plugin created.')

  config.captureScalars = config.captureScalars || false
  config.captureIntrospectionQueries = config.captureIntrospectionQueries || false
  config.captureServiceDefinitionQueries = config.captureServiceDefinitionQueries || false
  config.captureHealthCheckQueries = config.captureHealthCheckQueries || false
  config.customResolverAttributes = config.customResolverAttributes || null
  config.customOperationAttributes = config.customOperationAttributes || null
  config.captureFieldMetrics = config.captureFieldMetrics || false
  logger.debug('Plugin configuration: ', config)

  createModuleUsageMetric(shim.agent)

  return {
    requestDidStart: requestDidStart.bind(null, { api, shim, logger, config })
  }
}

module.exports = createPlugin
