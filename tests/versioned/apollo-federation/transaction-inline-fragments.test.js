/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { executeQuery } = require('../../test-client')

const { setupFederatedGatewayServerTests } = require('./federated-gateway-server-setup')
const { checkResult } = require('../common')

setupFederatedGatewayServerTests({
  suiteName: 'query with inline fragments',
  createTests: createFederatedSegmentsTests,
  instrumentSubGraphs: true
})

/**
 * Creates a federated server that instruments all sub graphs and makes a
 * query that will contain InlineFragments to a subgraph
 * It is required that t.context.helper and t.context.serverUrl are set.
 * @param {*} t a tap test instance
 */
function createFederatedSegmentsTests(t) {
  t.test('should nest sub graphs under operation', (t) => {
    const { helper, serverUrl } = t.context

    const query = `query SubGraphs {
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

    let transactions = []
    const expectedTransactions = [
      'WebTransaction/Expressjs/POST//query/<anonymous>/libraries.branch',
      'WebTransaction/Expressjs/POST//query/<anonymous>/_entities.booksInStock.isbn',
      'WebTransaction/Expressjs/POST//query/<anonymous>/_entities.magazinesInStock.issue',
      'WebTransaction/Expressjs/POST//query/SubGraphs/libraries.booksInStock.isbn'
    ]

    helper.agent.on('transactionFinished', (transaction) => {
      transactions.push(transaction.name)
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.equal(transactions.length, 4, 'should create 4 transactions')
      t.same(expectedTransactions, transactions, 'should properly name each transaction')
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })
}
