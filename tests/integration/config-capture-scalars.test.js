/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')
const assert = require('node:assert')

const { executeQuery } = require('../lib/test-client')
const { assertSegments } = require('../lib/custom-assertions')
const { afterEach, setupCoreTest } = require('../lib/test-tools')
const promiseResolvers = require('../lib/promise-resolvers')

const OPERATION_PREFIX = 'GraphQL/operation/ApolloServer'
const RESOLVE_PREFIX = 'GraphQL/resolve/ApolloServer'
const TRANSACTION_PREFIX = 'WebTransaction/Expressjs/POST'

const tests = []

tests.push({
  name: 'multi-level, should not capture scalar fields',
  async fn(t) {
    const { helper, serverUrl, pluginConfig, isApollo4 } = t.nr
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

      let expectedSegments
      if (isApollo4 === true) {
        expectedSegments = [
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
      } else {
        // Less than Apollo4 has a different structure.
        expectedSegments = [
          `${TRANSACTION_PREFIX}//${operationPart}`,
          [
            'Nodejs/Middleware/Expressjs/query',
            'Nodejs/Middleware/Expressjs/expressInit',
            'Expressjs/Router: /',
            [
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
        ]
      }

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

test.afterEach(async (ctx) => {
  await afterEach({ t: ctx, testDir: __dirname })
})

for (const tst of tests) {
  test(`(captureScalars: false) ${tst.name})`, async (t) => {
    await setupCoreTest({ t, pluginConfig: { captureScalars: false }, testDir: __dirname })
    await tst.fn(t)
  })
}

for (const tst of tests) {
  test(`(captureScalars: true) ${tst.name})`, async (t) => {
    await setupCoreTest({ t, pluginConfig: { captureScalars: true }, testDir: __dirname })
    await tst.fn(t)
  })
}
