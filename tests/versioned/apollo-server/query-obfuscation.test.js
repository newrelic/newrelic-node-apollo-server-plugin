/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')

const { afterEach, setupCoreTest, teardown } = require('../test-tools')

const queryObfuscationTests = require('../query-obfuscation-tests')
const { pluginConfig } = queryObfuscationTests

for (const qoTest of queryObfuscationTests.tests) {
  test(qoTest.name, async (t) => {
    await setupCoreTest({ t, pluginConfig })
    await qoTest.fn(t)
    afterEach(t)
    await teardown(t)
  })
}
