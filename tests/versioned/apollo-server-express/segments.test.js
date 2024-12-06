/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')

const { afterEach, setupExpressTest } = require('../../test-tools')

const expressSegmentsTests = require('../express-segments-tests')

testDefaultTests(expressSegmentsTests.tests).then(() => testScalarTests(expressSegmentsTests.tests))

async function testDefaultTests(tests) {
  for (const defTest of tests) {
    test(`non-scalar: ${defTest.name}`, async (t) => {
      await setupExpressTest({ t, testDir: __dirname })
      t.nr.TRANSACTION_PREFIX = 'WebTransaction/Expressjs/POST'
      await defTest.fn(t)
      await afterEach({ t, testDir: __dirname })
    })
  }
}

async function testScalarTests(tests) {
  const { pluginConfig } = { captureScalars: true }
  for (const scalarTest of tests) {
    test(`scalar: ${scalarTest.name}`, async (t) => {
      await setupExpressTest({ t, testDir: __dirname })
      t.nr.TRANSACTION_PREFIX = 'WebTransaction/Expressjs/POST'
      await scalarTest.fn(t)
      await afterEach({ t, testDir: __dirname, pluginConfig })
    })
  }
}
