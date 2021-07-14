/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { executeQuery } = require('../../test-client')

const { setupFederatedGatewayServerTests } = require('./federated-gateway-server-setup')
const { checkResult } = require('../common')

setupFederatedGatewayServerTests({
  suiteName: 'sub graph transaction naming',
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
  t.test('should properly name when inline fragments exist', (t) => {
    const { helper, serverUrl } = t.context

    /**
     * This query gets deconstructed as such
     * `{libraries{branch __typename id}}`
     * `query($representations:[_Any!]!){
     *    _entities(representations:$representations){
     *      ...on Library{
     *        booksInStock{
     *          isbn title author
     *        }
     *      }
     *    }
     *  }`
     * `query($representations:[_Any!]!){
     *   _entities(representations:$representations){
     *     ...on Library{
     *       magazinesInStock{
     *         issue title
     *       }
     *     }
     *   }
     * }`
     * The ones with `...on Library` are [InlineFragments](https://graphql.org/learn/queries/#inline-fragments)
     * which lack name properites on all the selections within document.
     * Without the fix in https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/100
     * they would crash and not properly name the transactions, also the query request
     * would fail.
     */
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
      'WebTransaction/Expressjs/POST//query/<anonymous>/_entities.booksInStock',
      'WebTransaction/Expressjs/POST//query/<anonymous>/_entities.magazinesInStock',
      'WebTransaction/Expressjs/POST//query/SubGraphs/libraries'
    ]

    helper.agent.on('transactionFinished', (transaction) => {
      transactions.push(transaction.name)
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.equal(transactions.length, 4, 'should create 4 transactions')

      t.same(transactions, expectedTransactions, 'should properly name each transaction')
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('should filter id and __typename fields from unique naming', (t) => {
    const { helper, serverUrl } = t.context

    /**
     * The 'libraries' sub graph service gets queried as:
     * query {
     *   libraries {
     *     branch
     *     __typename
     *     id
     *   }
     * }
     *
     * 'id' and '__typename' should get filtered out for a
     * specific name of 'libraries.branch'.
     */
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
    const expectedPath = 'libraries.branch'
    const expectedTransaction
      = `WebTransaction/Expressjs/POST//query/<anonymous>/${expectedPath}`

    helper.agent.on('transactionFinished', (transaction) => {
      transactions.push(transaction.name)
    })

    executeQuery(serverUrl, query, (err, result) => {
      const hasTransaction = transactions.indexOf(expectedTransaction) >= 0

      t.ok(hasTransaction, `should have a transaction named: '${expectedTransaction}'`)

      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })
}
