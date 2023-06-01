/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { setupApolloServerFastifyTests } = require('./apollo-server-fastify-setup')
const metricsTests = require('../metrics-tests')

setupApolloServerFastifyTests({
  suiteName: 'metrics',
  createTests: metricsTests.bind(null, false)
})

setupApolloServerFastifyTests({
  suiteName: 'capture field metrics',
  createTests: metricsTests.bind(null, true),
  pluginConfig: { captureFieldMetrics: true }
})
