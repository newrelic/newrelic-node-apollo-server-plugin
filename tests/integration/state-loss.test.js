/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')
const assert = require('node:assert')

const { executeQuery } = require('../lib/test-client')
const { afterEach, setupCoreTest } = require('../lib/test-tools')
const promiseResolvers = require('../lib/promise-resolvers')
const PluginStateLossTester = require('./plugin-state-loss-tester')

const tests = []

tests.push({
  name: 'should not error when state loss prior to query',
  async fn(t) {
    const { serverUrl, stateLossTester } = t.nr
    const { promise, resolve } = promiseResolvers()
    stateLossTester.triggerOnRequestDidStart()

    const expectedName = 'GetAllForLibrary'
    const query = `query ${expectedName} {
      library(branch: "downtown") {
        books {
          title
          author {
            name
          }
        }
        magazines {
          title
          issue
        }
      }
    }`

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)

      if (result.errors) {
        result.errors.forEach((error) => {
          assert.ifError(error)
        })
      }

      assert.ok(result.data)
      assert.ok(result.data.library)

      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'should not error when state loss just before sending response',
  async fn(t) {
    const { serverUrl, stateLossTester } = t.nr
    const { promise, resolve } = promiseResolvers()
    stateLossTester.tiggerOnWillSendResponse()

    const expectedName = 'GetAllForLibrary'
    const query = `query ${expectedName} {
      library(branch: "downtown") {
        books {
          title
          author {
            name
          }
        }
        magazines {
          title
          issue
        }
      }
    }`

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)

      if (result.errors) {
        result.errors.forEach((error) => {
          assert.ifError(error)
        })
      }

      assert.ok(result.data)
      assert.ok(result.data.library)

      resolve()
    })

    await promise
  }
})

test.afterEach(async (ctx) => {
  await afterEach({ t: ctx, testDir: __dirname })
})

for (const stateTest of tests) {
  test(stateTest.name, async (t) => {
    await setupCoreTest({ t, testDir: __dirname })
    t.nr.stateLossTester = new PluginStateLossTester()
    await stateTest.fn(t)
  })
}
