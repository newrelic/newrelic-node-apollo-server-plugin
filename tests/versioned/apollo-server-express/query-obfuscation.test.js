/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')

const { afterEach, setupExpressTest } = require('../../lib/test-tools')

const queryObfuscationTests = require('../query-obfuscation-tests')
const { pluginConfig } = queryObfuscationTests

test.afterEach(async (ctx) => {
  await afterEach({ t: ctx, testDir: __dirname })
})

for (const qoTest of queryObfuscationTests.tests) {
  test(qoTest.name, async (t) => {
    await setupExpressTest({ t, pluginConfig, testDir: __dirname })
    await qoTest.fn(t)
  })
}
