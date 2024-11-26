/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const assert = require('node:assert')

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
async function createFederatedTransactionNamingTests(t, frameworkName) {
  const TRANSACTION_PREFIX = `WebTransaction/${frameworkName}/POST`

  await t.test('anonymous query, multi selections should return deepest unique path', (t, end) => {
    const { helper, serverUrl } = t.nr

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
      assert.equal(transaction.name, `${TRANSACTION_PREFIX}//${operationPart}`)
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(t, result, () => {
        end()
      })
    })
  })

  await t.test('anonymous query, single selections should return deepest unique path', (t, end) => {
    const { helper, serverUrl } = t.nr

    const query = `query {
      libraries {
        booksInStock {
          title
        }
      }
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      if (shouldSkipTransaction(transaction)) {
        return
      }

      const operationPart = `query/${ANON_PLACEHOLDER}/libraries.booksInStock.title`
      assert.equal(transaction.name, `${TRANSACTION_PREFIX}//${operationPart}`)
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(t, result, () => {
        end()
      })
    })
  })

  await t.test('named query, multi selections should return deepest unique path', (t, end) => {
    const { helper, serverUrl } = t.nr

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

      const operationPart = 'query/booksInStock/libraries'
      assert.equal(transaction.name, `${TRANSACTION_PREFIX}//${operationPart}`)
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(t, result, () => {
        end()
      })
    })
  })

  await t.test('named query, single selections should return deepest unique path', (t, end) => {
    const { helper, serverUrl } = t.nr

    const query = `query booksInStock {
      libraries {
        booksInStock {
          title
        }
      }
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      if (shouldSkipTransaction(transaction)) {
        return
      }

      const operationPart = 'query/booksInStock/libraries.booksInStock.title'
      assert.equal(transaction.name, `${TRANSACTION_PREFIX}//${operationPart}`)
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(t, result, () => {
        end()
      })
    })
  })

  await t.test('should properly name transaction when a named, batch federated query', (t, end) => {
    const { helper, serverUrl } = t.nr

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

    helper.agent.on('transactionFinished', (transaction) => {
      if (shouldSkipTransaction(transaction)) {
        return
      }
      const operationPart1 = `query/${booksQueryName}/libraries.booksInStock`
      const operationPart2 = `query/${magazineQueryName}/libraries.magazinesInStock`

      const batchTransactionPrefix = `${TRANSACTION_PREFIX}//batch`

      assert.equal(
        transaction.name,
        `${batchTransactionPrefix}/${operationPart1}/${operationPart2}`
      )
    })

    executeQueryBatch(serverUrl, queries, (err, result) => {
      assert.ifError(err)
      checkResult(t, result, () => {
        assert.equal(result.length, 2)
        end()
      })
    })
  })
}
