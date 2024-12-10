/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')

const { afterEach, setupCoreTest } = require('../../lib/test-tools')

const metricsTests = require('../../lib/metrics-tests')

test.afterEach(async (ctx) => {
  await afterEach({ t: ctx, testDir: __dirname })
})

for (const metricTest of metricsTests.tests) {
  test(metricTest.name, async (t) => {
    await setupCoreTest({ t, testDir: __dirname })
    await metricTest.fn(t)
  })
}

for (const metricTest of metricsTests.tests) {
  test(`capture field metrics: ${metricTest.name}`, async (t) => {
    await setupCoreTest({ t, pluginConfig: { captureFieldMetrics: true }, testDir: __dirname })
    await metricTest.fn(t)
  })
}
