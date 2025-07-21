/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')

const { afterEach, setupExpressTest } = require('../../lib/test-tools')

const transactionNamingTests = require('../transaction-naming-tests')

test.afterEach(async (ctx) => {
  await afterEach({ t: ctx, testDir: __dirname })
})

for (const txTest of transactionNamingTests.tests) {
  test(txTest.name, async (t) => {
    await setupExpressTest({ t, testDir: __dirname })
    t.nr.EXPECTED_PREFIX = 'WebTransaction/Expressjs/POST'
    await txTest.fn(t)
  })
}
