/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')
const semver = require('semver')

const { afterEach, setupCoreTest } = require('../../lib/test-tools')

const transactionNamingTests = require('./transaction-naming-tests')

test.afterEach(async (ctx) => {
  await afterEach({ t: ctx, testDir: __dirname })
})

for (const txTest of transactionNamingTests.tests) {
  test(txTest.name, async (t) => {
    await setupCoreTest({ t, testDir: __dirname })
    const prefix = semver.gte(t.nr.apolloServerPkg.apolloVersion, '5.0.0')
      ? 'WebTransaction/Nodejs/POST'
      : 'WebTransaction/Expressjs/POST'
    t.nr.EXPECTED_PREFIX = prefix
    await txTest.fn(t)
  })
}
