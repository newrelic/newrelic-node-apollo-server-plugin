/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')
const assert = require('node:assert')

const { executeQuery } = require('../test-client')
const { afterEach, setupCoreTest } = require('../test-tools')
const promiseResolvers = require('../promise-resolvers')

const queries = [
  `{
    __schema {
      queryType {
        fields {
          name
        }
      }
    }
  }`,
  `query introspectionType {
    __type(name: "Library") {
      fields {
        name
      }
    }
  }`
]

const defaultTests = generateTests(true)
const captureTrueTests = generateTests(false)
const captureFalseTests = generateTests(true)

runTests({ tests: defaultTests })
  .then(() =>
    runTests({
      tests: captureTrueTests,
      suiteName: 'captureIntrospectionQueries: true',
      pluginConfig: { captureIntrospectionQueries: true }
    })
  )
  .then(() =>
    runTests({
      tests: captureFalseTests,
      suiteName: 'captureIntrospectionQueries: false',
      pluginConfig: { captureIntrospectionQueries: false }
    })
  )

async function runTests({ tests, suiteName = 'default', pluginConfig = {} } = {}) {
  for (const tst of tests) {
    test(`(${suiteName}) ${tst.name}`, async (t) => {
      await setupCoreTest({ t, pluginConfig, testDir: __dirname })
      await tst.fn(t)
      await afterEach({ t, testDir: __dirname })
    })
  }
}

function generateTests(ignore) {
  const tests = []

  for (const [qi, query] of queries.entries()) {
    tests.push({
      name: `should ${
        ignore ? '' : 'not '
      }ignore transaction when captureIntrospectionQuery is ${!ignore} and query contains introspection types (query ${qi})`,
      async fn(t) {
        const { helper, serverUrl } = t.nr
        const { promise, resolve } = promiseResolvers()

        helper.agent.once('transactionFinished', (transaction) => {
          assert.equal(transaction.ignore, ignore, `should set transaction.ignore to ${ignore}`)
        })

        executeQuery(serverUrl, query, (err) => {
          assert.ifError(err)
          resolve()
        })

        await promise
      }
    })

    tests.push({
      name: `should not ignore transaction when captureIntrospectionQuery is ${!ignore} and query does not contain an introspection type (query ${qi})`,
      async fn(t) {
        const { helper, serverUrl } = t.nr
        const { promise, resolve } = promiseResolvers()

        helper.agent.once('transactionFinished', (transaction) => {
          assert.equal(
            transaction.ignore,
            false,
            'should set transaction.ignore to false when not an introspection type'
          )
        })

        const query = `query GetAllForLibrary {
        library(branch: "downtown") {
          books {
            title
          }
        }
      }`
        executeQuery(serverUrl, query, (err) => {
          assert.ifError(err)
          resolve()
        })

        await promise
      }
    })
  }

  return tests
}
