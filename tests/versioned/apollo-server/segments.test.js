/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')

const { afterEach, setupCoreTest } = require('../../lib/test-tools')

const expressSegmentsTests = require('../express-segments-tests')

test.afterEach(async (ctx) => {
  await afterEach({ t: ctx, testDir: __dirname })
})

for (const defTest of expressSegmentsTests.tests) {
  test(`non-scalar: ${defTest.name}`, async (t) => {
    await setupCoreTest({ t, testDir: __dirname })
    t.nr.TRANSACTION_PREFIX = 'WebTransaction/Expressjs/POST'
    await defTest.fn(t)
  })
}

const { pluginConfig } = { captureScalars: true }
for (const scalarTest of expressSegmentsTests.tests) {
  test(`scalar: ${scalarTest.name}`, async (t) => {
    await setupCoreTest({ t, testDir: __dirname, pluginConfig })
    t.nr.TRANSACTION_PREFIX = 'WebTransaction/Expressjs/POST'
    await scalarTest.fn(t)
  })
}
