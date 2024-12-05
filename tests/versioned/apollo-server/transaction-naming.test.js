/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')

const { afterEach, setupCoreTest } = require('../test-tools')

const transactionNamingTests = require('../transaction-naming-tests')

for (const txTest of transactionNamingTests.tests) {
  test(txTest.name, async (t) => {
    await setupCoreTest({ t, testDir: __dirname })
    t.nr.EXPECTED_PREFIX = `WebTransaction/Expressjs/POST`
    await txTest.fn(t)
    await afterEach({ t, testDir: __dirname })
  })
}
