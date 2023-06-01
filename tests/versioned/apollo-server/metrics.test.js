/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { setupApolloServerTests } = require('./apollo-server-setup')
const metricsTests = require('../metrics-tests')

setupApolloServerTests({
  suiteName: 'metrics',
  createTests: metricsTests.bind(null, false)
})

setupApolloServerTests({
  suiteName: 'capture field metrics',
  createTests: metricsTests.bind(null, true),
  pluginConfig: { captureFieldMetrics: true }
})
