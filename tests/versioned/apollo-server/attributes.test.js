/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')

const { afterEach, setupCoreTest } = require('../../test-tools')

const attributesTestSuite = require('../attributes-tests')
const { pluginConfig } = attributesTestSuite

for (const attrTest of attributesTestSuite.tests) {
  test(attrTest.name, async (t) => {
    await setupCoreTest({ t, pluginConfig, testDir: __dirname })
    await attrTest.fn(t)
    await afterEach({ t, testDir: __dirname })
  })
}
