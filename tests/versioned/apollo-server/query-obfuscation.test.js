/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')

const { afterEach, setupCoreTest } = require('../../test-tools')

const queryObfuscationTests = require('../query-obfuscation-tests')
const { pluginConfig } = queryObfuscationTests

for (const qoTest of queryObfuscationTests.tests) {
  test(qoTest.name, async (t) => {
    await setupCoreTest({ t, pluginConfig, testDir: __dirname })
    await qoTest.fn(t)
    await afterEach({ t, testDir: __dirname })
  })
}
