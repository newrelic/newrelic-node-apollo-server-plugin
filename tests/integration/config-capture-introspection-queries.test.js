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

test.afterEach(async (ctx) => {
  await afterEach({ t: ctx, testDir: __dirname })
})

for (const tst of defaultTests) {
  test(`(default) ${tst.name}`, async (t) => {
    await setupCoreTest({ t, pluginConfig: {}, testDir: __dirname })
    await tst.fn(t)
  })
}

for (const tst of captureTrueTests) {
  test(`(captureIntrospectionQueries: true) ${tst.name}`, async (t) => {
    await setupCoreTest({
      t,
      pluginConfig: { captureIntrospectionQueries: true },
      testDir: __dirname
    })
    await tst.fn(t)
  })
}

for (const tst of captureFalseTests) {
  test(`(captureIntrospectionQueries: false) ${tst.name}`, async (t) => {
    await setupCoreTest({
      t,
      pluginConfig: { captureIntrospectionQueries: false },
      testDir: __dirname
    })
    await tst.fn(t)
  })
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
