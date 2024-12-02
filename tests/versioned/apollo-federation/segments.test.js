/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const test = require('node:test')
const { tspl } = require('@matteo.collina/tspl')
const { executeQuery, executeQueryBatch } = require('../../test-client')
const { assertSegments } = require('../../custom-assertions')

const ANON_PLACEHOLDER = '<anonymous>'
const OPERATION_PREFIX = 'GraphQL/operation/ApolloServer'
const EXTERNAL_PREFIX = 'External'
const TRANSACTION_PREFIX = `WebTransaction/Expressjs/POST`

const { setupFederatedGateway, teardownGateway } = require('./federated-gateway-server-setup')
const { checkResult, shouldSkipTransaction } = require('../common')

test('apollo-federation: federated segments', async (t) => {
  t.beforeEach(async (ctx) => {
    await setupFederatedGateway({ ctx })
  })

  t.afterEach((ctx) => {
    teardownGateway({ ctx })
  })

  await t.test('should nest sub graphs under operation', async (t) => {
    const plan = tspl(t, { plan: 9 })
    const { helper, gatewayService, libraryService, magazineService, bookService } = t.nr
    const serverUrl = gatewayService.url

    const query = `query {
      libraries {
        branch
        booksInStock {
          isbn,
          title,
          author
        }
        magazinesInStock {
          issue,
          title
        }
      }
    }`

    let tx
    const libraryExternal = formatExternalSegment(libraryService.url)
    const bookExternal = formatExternalSegment(bookService.url)
    const magazineExternal = formatExternalSegment(magazineService.url)
    const operationPart = `query/${ANON_PLACEHOLDER}/libraries`
    helper.agent.on('transactionFinished', (transaction) => {
      if (shouldSkipTransaction(transaction)) {
        return
      }
      tx = transaction
    })

    executeQuery(serverUrl, query, (err, result) => {
      plan.ok(!err)

      const expectedSegments = [
        `${TRANSACTION_PREFIX}//${operationPart}`,
        [
          'Expressjs/Router: /',
          [
            'Nodejs/Middleware/Expressjs/<anonymous>',
            [
              `${OPERATION_PREFIX}/${operationPart}`,
              [libraryExternal, bookExternal, magazineExternal]
            ]
          ]
        ]
      ]

      assertSegments(tx.trace.root, expectedSegments, { exact: false }, { assert: plan })
      checkResult(plan, result, () => {})
    })
    await plan.completed
  })

  await t.test('batch query should nest sub graphs under appropriate operations', async (t) => {
    const plan = tspl(t, { plan: 12 })
    const { helper, gatewayService, libraryService, bookService, magazineService } = t.nr
    const serverUrl = gatewayService.url

    const booksQueryName = 'GetBooksForLibraries'
    const booksQuery = `query ${booksQueryName} {
      libraries {
        booksInStock {
          isbn,
          title,
          author
        }
      }
    }`

    const magazineQueryName = 'GetMagazinesForLibraries'
    const magazineQuery = `query ${magazineQueryName} {
      libraries {
        magazinesInStock {
          issue,
          title
        }
      }
    }`

    const queries = [booksQuery, magazineQuery]

    const libraryExternal = formatExternalSegment(libraryService.url)
    const bookExternal = formatExternalSegment(bookService.url)
    const magazineExternal = formatExternalSegment(magazineService.url)
    const operationPart1 = `query/${booksQueryName}/libraries.booksInStock`
    const expectedQuery1Name = `${operationPart1}`
    const operationPart2 = `query/${magazineQueryName}/libraries.magazinesInStock`
    const expectedQuery2Name = `${operationPart2}`

    const batchTransactionPrefix = `${TRANSACTION_PREFIX}//batch`

    let tx
    helper.agent.on('transactionFinished', (transaction) => {
      if (shouldSkipTransaction(transaction)) {
        return
      }

      tx = transaction
    })

    executeQueryBatch(serverUrl, queries, (err, result) => {
      plan.ok(!err)

      const expectedSegments = [
        `${batchTransactionPrefix}/${expectedQuery1Name}/${expectedQuery2Name}`,
        [
          'Expressjs/Router: /',
          [
            'Nodejs/Middleware/Expressjs/<anonymous>',
            [
              `${OPERATION_PREFIX}/${operationPart1}`,
              [libraryExternal, bookExternal],
              `${OPERATION_PREFIX}/${operationPart2}`,
              [libraryExternal, magazineExternal]
            ]
          ]
        ]
      ]

      assertSegments(tx.trace.root, expectedSegments, { exact: false }, { assert: plan })
      checkResult(plan, result, () => {
        plan.equal(result.length, 2)
      })
    })
    await plan.completed
  })
})

function formatExternalSegment(url) {
  const hostAndPort = url.replace('http://', '')
  return `${EXTERNAL_PREFIX}/${hostAndPort}`
}
