/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')
const assert = require('node:assert')

const { executeQuery } = require('../test-client')
const { assertSegments } = require('../custom-assertions')
const { afterEach, setupCoreTest } = require('../test-tools')
const promiseResolvers = require('../promise-resolvers')

const OPERATION_PREFIX = 'GraphQL/operation/ApolloServer'
const RESOLVE_PREFIX = 'GraphQL/resolve/ApolloServer'
const TRANSACTION_PREFIX = 'WebTransaction/Expressjs/POST'

const tests = []

tests.push({
  name: 'multi-level, should not capture scalar fields',
  async fn(t) {
    const { helper, serverUrl, pluginConfig } = t.nr
    const { promise, resolve } = promiseResolvers()

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

    const path = 'library'

    helper.agent.once('transactionFinished', (transaction) => {
      const operationPart = `query/${expectedName}/${path}`

      const librarySiblings =
        pluginConfig?.captureScalars !== true
          ? [
              `${RESOLVE_PREFIX}/library.books`,
              `${RESOLVE_PREFIX}/library.books.author`,
              `${RESOLVE_PREFIX}/library.books.author`,
              `${RESOLVE_PREFIX}/library.magazines`
            ]
          : [
              `${RESOLVE_PREFIX}/library.books`,
              `${RESOLVE_PREFIX}/library.books.title`,
              `${RESOLVE_PREFIX}/library.books.author`,
              `${RESOLVE_PREFIX}/library.books.author.name`,
              `${RESOLVE_PREFIX}/library.books.title`,
              `${RESOLVE_PREFIX}/library.books.author`,
              `${RESOLVE_PREFIX}/library.books.author.name`,
              `${RESOLVE_PREFIX}/library.magazines`,
              `${RESOLVE_PREFIX}/library.magazines.title`,
              `${RESOLVE_PREFIX}/library.magazines.issue`
            ]

      const expectedSegments = [
        `${TRANSACTION_PREFIX}//${operationPart}`,
        [
          'Nodejs/Middleware/Expressjs/query',
          'Nodejs/Middleware/Expressjs/expressInit',
          'Nodejs/Middleware/Expressjs/corsMiddleware',
          'Nodejs/Middleware/Expressjs/jsonParser',

          'Nodejs/Middleware/Expressjs/<anonymous>',
          [
            `${OPERATION_PREFIX}/${operationPart}`,
            [
              `${RESOLVE_PREFIX}/library`,
              ['timers.setTimeout', ['Callback: <anonymous>']],
              ...librarySiblings
            ]
          ]
        ]
      ]

      // Exact match to ensure no extra fields snuck in
      assertSegments(transaction.trace.root, expectedSegments, { exact: true })
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

runTests({ tests })
  .then(() =>
    runTests({
      tests,
      suiteName: 'captureScalars: false',
      pluginConfig: { captureScalars: false }
    })
  )
  .then(() =>
    runTests({ tests, suiteName: 'captureScalars: true', pluginConfig: { captureScalars: true } })
  )

async function runTests({ tests, suiteName = 'default', pluginConfig = {} } = {}) {
  for (const tst of tests) {
    test(`(${suiteName}) ${tst.name})`, async (t) => {
      await setupCoreTest({ t, pluginConfig, testDir: __dirname })
      await tst.fn(t)
      await afterEach({ t, testDir: __dirname })
    })
  }
}
