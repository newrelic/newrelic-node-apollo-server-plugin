/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { executeQuery, executeQueryBatch } = require('../../test-client')

const ANON_PLACEHOLDER = '<anonymous>'

const { setupFederatedGatewayServerTests } = require('./federated-gateway-server-setup')
const { checkResult, shouldSkipTransaction } = require('../common')

setupFederatedGatewayServerTests({
  suiteName: 'federated transaction names',
  createTests: createFederatedTransactionNamingTests
})

/**
 * Creates a set of standard transaction naming tests to run
 * against express-based apollo-server libraries.
 * It is required that t.context.helper and t.context.serverUrl are set.
 * @param {*} t a tap test instance
 */
function createFederatedTransactionNamingTests(t, frameworkName) {
  const TRANSACTION_PREFIX = `WebTransaction/${frameworkName}/POST`

  t.test('should properly name transaction when an anonymous federated query', (t) => {
    const { helper, serverUrl } = t.context

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

    helper.agent.on('transactionFinished', (transaction) => {
      if (shouldSkipTransaction(transaction)) {
        return
      }

      const operationPart = `query/${ANON_PLACEHOLDER}/libraries`
      t.equal(transaction.name,
      `${TRANSACTION_PREFIX}//${operationPart}`)
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('should properly name transaction when a named, federated query', (t) => {
    const { helper, serverUrl } = t.context

    const query = `query booksInStock {
      libraries {
        branch
        booksInStock {
          title,
          author
        }
      }
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      if (shouldSkipTransaction(transaction)) {
        return
      }

      const operationPart = 'query/booksInStock/libraries.booksInStock'
      t.equal(transaction.name,
      `${TRANSACTION_PREFIX}//${operationPart}`)
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('should properly name transaction when a named, batch federated query', (t) => {
    const { helper, serverUrl } = t.context

    const booksQueryName = 'GetBooksForLibraries'
    const booksQuery = `query ${booksQueryName} {
      libraries {
        branch
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
        branch
        magazinesInStock {
          issue,
          title
        }
      }
    }`

    const queries = [booksQuery, magazineQuery]

    helper.agent.on('transactionFinished', (transaction) => {
      if (shouldSkipTransaction(transaction)) {
        return
      }
      const operationPart1 = `query/${booksQueryName}/libraries.booksInStock`
      const operationPart2 = `query/${magazineQueryName}/libraries.magazinesInStock`

      const batchTransactionPrefix = `${TRANSACTION_PREFIX}//batch`

      t.equal(transaction.name,
        `${batchTransactionPrefix}/${operationPart1}/${operationPart2}`
      )
    })

    executeQueryBatch(serverUrl, queries, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.equal(result.length, 2)

        t.end()
      })
    })
  })
}
