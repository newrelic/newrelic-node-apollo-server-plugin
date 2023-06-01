/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { setupApolloServerExpressTests } = require('./apollo-server-express-setup')
const metricsTests = require('../metrics-tests')

setupApolloServerExpressTests({
  suiteName: 'metrics',
  createTests: metricsTests.bind(null, false)
})

setupApolloServerExpressTests({
  suiteName: 'capture field metrics',
  createTests: metricsTests.bind(null, true),
  pluginConfig: { captureFieldMetrics: true }
})
