/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// const createMetricsTests = require('../metrics-tests')
// const { setupApolloServerTests } = require('./apollo-server-setup')
//
// setupApolloServerTests({
//   suiteName: 'metrics',
//   createTests: createMetricsTests.bind(null, false)
// })
//
// setupApolloServerTests({
//   suiteName: 'capture field metrics',
//   createTests: createMetricsTests.bind(null, true),
//   pluginConfig: { captureFieldMetrics: true }
// })

const test = require('node:test')

const { afterEach, setupExpressTest } = require('../test-tools')

const metricsTests = require('../metrics-tests')

testWithoutCapture(metricsTests.tests).then(() => testWithCapture(metricsTests.tests))

async function testWithoutCapture(tests) {
  for (const metricTest of tests) {
    test(metricTest.name, async (t) => {
      await setupExpressTest({ t, testDir: __dirname })
      await metricTest.fn(t)
      await afterEach({ t, testDir: __dirname })
    })
  }
}

async function testWithCapture(metricsTests) {
  for (const metricTest of metricsTests) {
    test(`capture field metrics: ${metricTest.name}`, async (t) => {
      await setupExpressTest({ t, pluginConfig: { captureFieldMetrics: true }, testDir: __dirname })
      await metricTest.fn(t)
      await afterEach({ t, testDir: __dirname })
    })
  }
}
