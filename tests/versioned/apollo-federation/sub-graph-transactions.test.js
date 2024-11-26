/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const assert = require('node:assert')

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
async function createFederatedSegmentsTests(t) {
  await t.test('should properly name when inline fragments exist', (t, end) => {
    const { helper, serverUrl } = t.nr

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

    const transactions = []
    const expectedTransactions = [
      /WebTransaction\/Expressjs\/POST\/\/query\/SubGraphs__Library__[\d]+\/libraries.branch/,
      /WebTransaction\/Expressjs\/POST\/\/query\/SubGraphs__Book__[\d]+\/_entities<Library>.booksInStock/,
      // eslint-disable-next-line max-len
      /WebTransaction\/Expressjs\/POST\/\/query\/SubGraphs__Magazine__[\d]+\/_entities<Library>.magazinesInStock/,
      /WebTransaction\/Expressjs\/POST\/\/query\/SubGraphs\/libraries/
    ]

    helper.agent.on('transactionFinished', (transaction) => {
      transactions.push(transaction.name)
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.equal(transactions.length, 4, 'should create 4 transactions')
      const transactionMatches = transactions.filter((transaction) => {
        return expectedTransactions.some((expectedTransaction) =>
          transaction.match(expectedTransaction)
        )
      })
      assert.equal(transactionMatches.length, 4, 'transactions should match proper names')

      assert.ifError(err)
      checkResult(t, result, () => {
        end()
      })
    })
  })

  await t.test('should filter id and __typename fields from unique naming', (t, end) => {
    const { helper, serverUrl } = t.nr

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

    const transactions = []
    const expectedPath = 'libraries.branch'
    const expectedTransaction = `WebTransaction/Expressjs/POST//query/SubGraphs__Library__0/${expectedPath}`

    helper.agent.on('transactionFinished', (transaction) => {
      transactions.push(transaction.name)
    })

    executeQuery(serverUrl, query, (err, result) => {
      const hasTransaction = transactions.indexOf(expectedTransaction) >= 0

      assert.ok(hasTransaction, `should have a transaction named: '${expectedTransaction}'`)

      assert.ifError(err)
      checkResult(t, result, () => {
        end()
      })
    })
  })
}
