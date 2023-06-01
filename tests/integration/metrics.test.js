/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const createMetricsTests = require('../metrics-tests')
const { setupApolloServerTests } = require('./apollo-server-setup')

setupApolloServerTests({
  suiteName: 'metrics',
  createTests: createMetricsTests.bind(null, false)
})

setupApolloServerTests({
  suiteName: 'capture field metrics',
  createTests: createMetricsTests.bind(null, true),
  pluginConfig: { captureFieldMetrics: true }
})
