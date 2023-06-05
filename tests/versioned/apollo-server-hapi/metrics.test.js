/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { setupApolloServerHapiTests } = require('./apollo-server-hapi-setup')
const metricsTests = require('../../metrics-tests')

setupApolloServerHapiTests({
  suiteName: 'metrics',
  createTests: metricsTests.bind(null, false)
})

setupApolloServerHapiTests({
  suiteName: 'capture field metrics',
  createTests: metricsTests.bind(null, true),
  pluginConfig: { captureFieldMetrics: true }
})
