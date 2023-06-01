/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { setupApolloServerKoaTests } = require('./apollo-server-koa-setup')
const metricsTests = require('../../metrics-tests')

setupApolloServerKoaTests({
  suiteName: 'metrics',
  createTests: metricsTests.bind(null, false)
})

setupApolloServerKoaTests({
  suiteName: 'capture field metrics',
  createTests: metricsTests.bind(null, true),
  pluginConfig: { captureFieldMetrics: true }
})
