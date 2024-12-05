/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')

const { afterEach, setupExpressTest } = require('../test-tools')

const errorsTests = require('../errors-tests')
const { pluginConfig } = errorsTests
const agentConfig = {
  distributed_tracing: { enabled: true } // enable span testing
}

for (const errorTest of errorsTests.tests) {
  test(errorTest.name, async (t) => {
    await setupExpressTest({ t, agentConfig, pluginConfig, testDir: __dirname })
    await errorTest.fn(t)
    await afterEach({ t, testDir: __dirname })
  })
}
