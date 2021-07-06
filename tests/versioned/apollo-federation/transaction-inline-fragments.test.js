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
     * which lack name properites on all the selections within document
     * without the fix in https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/100
     * they would crash and not properly name the transactions, also the query request
     * would fail
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
      'WebTransaction/Expressjs/POST//query/<anonymous>/libraries',
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
}
