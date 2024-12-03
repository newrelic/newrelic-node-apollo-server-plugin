/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// const { setupApolloServerTests } = require('./apollo-server-setup')
// const metricsTests = require('../../metrics-tests')
//
// setupApolloServerTests({
//   suiteName: 'metrics',
//   createTests: metricsTests.bind(null, false)
// })
//
// setupApolloServerTests({
//   suiteName: 'capture field metrics',
//   createTests: metricsTests.bind(null, true),
//   pluginConfig: { captureFieldMetrics: true }
// })

const test = require('node:test')

const { afterEach, setupCoreTest, teardown } = require('../test-tools')

const metricsTests = require('../../metrics-tests')

testWithoutCapture(metricsTests.tests).then(() => testWithCapture(metricsTests.tests))

async function testWithoutCapture(tests) {
  for (const metricTest of tests) {
    test(metricTest.name, async (t) => {
      await setupCoreTest({ t })
      await metricTest.fn(t)
      afterEach(t)
      await teardown(t)
    })
  }
}

async function testWithCapture(metricsTests) {
  for (const metricTest of metricsTests) {
    test(`capture field metrics: ${metricTest.name}`, async (t) => {
      await setupCoreTest({ t, pluginConfig: { captureFieldMetrics: true } })
      await metricTest.fn(t)
      afterEach(t)
      await teardown(t)
    })
  }
}
