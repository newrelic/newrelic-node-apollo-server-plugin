/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')

const { afterEach, setupExpressTest } = require('../../lib/test-tools')

const attributesTests = require('../attributes-tests')
const { pluginConfig } = attributesTests

test.afterEach(async (ctx) => {
  await afterEach({ t: ctx, testDir: __dirname })
})

for (const attrTest of attributesTests.tests) {
  test(attrTest.name, async (t) => {
    await setupExpressTest({ t, pluginConfig, testDir: __dirname })
    await attrTest.fn(t)
  })
}
