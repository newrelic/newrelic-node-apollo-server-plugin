/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const assert = require('node:assert')

const segments = require('../assert/segments')
const { executeQuery, executeQueryBatch } = require('../../test-client')

const ANON_PLACEHOLDER = '<anonymous>'
const OPERATION_PREFIX = 'GraphQL/operation/ApolloServer'
const EXTERNAL_PREFIX = 'External'

const { setupFederatedGatewayServerTests } = require('./federated-gateway-server-setup')
const { checkResult, shouldSkipTransaction } = require('../common')

setupFederatedGatewayServerTests({
  suiteName: 'federated segments',
  createTests: createFederatedSegmentsTests
})

/**
 * Creates a set of standard segment naming and nesting tests to run
 * against express-based apollo-server libraries.
 *
 * It is required that t.nr.helper and t.nr.serverUrl are set.
 *
 * @param {*} t a `node:test` context instance
 */
async function createFederatedSegmentsTests(t, frameworkName) {
  const TRANSACTION_PREFIX = `WebTransaction/${frameworkName}/POST`

  await t.test('should nest sub graphs under operation', (t, end) => {
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

      const libraryExternal = formatExternalSegment(t.nr.libraryUrl)
      const bookExternal = formatExternalSegment(t.nr.bookUrl)
      const magazineExternal = formatExternalSegment(t.nr.magazineUrl)

      const operationPart = `query/${ANON_PLACEHOLDER}/libraries`
      const expectedSegments = [
        {
          name: `${TRANSACTION_PREFIX}//${operationPart}`,
          children: [
            {
              name: 'Expressjs/Router: /',
              children: [
                {
                  name: 'Nodejs/Middleware/Expressjs/<anonymous>',
                  children: [
                    {
                      name: `${OPERATION_PREFIX}/${operationPart}`,
                      children: [
                        { name: libraryExternal },
                        { name: bookExternal },
                        { name: magazineExternal }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]

      segments(transaction.trace.root, expectedSegments)
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(t, result, () => {
        end()
      })
    })
  })

  await t.test('batch query should nest sub graphs under appropriate operations', (t, end) => {
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

    const libraryExternal = formatExternalSegment(t.nr.libraryUrl)
    const bookExternal = formatExternalSegment(t.nr.bookUrl)
    const magazineExternal = formatExternalSegment(t.nr.magazineUrl)

    helper.agent.on('transactionFinished', (transaction) => {
      if (shouldSkipTransaction(transaction)) {
        return
      }

      const operationPart1 = `query/${booksQueryName}/libraries.booksInStock`
      const expectedQuery1Name = `${operationPart1}`
      const operationPart2 = `query/${magazineQueryName}/libraries.magazinesInStock`
      const expectedQuery2Name = `${operationPart2}`

      const batchTransactionPrefix = `${TRANSACTION_PREFIX}//batch`

      const expectedSegments = [
        {
          name: `${batchTransactionPrefix}/${expectedQuery1Name}/${expectedQuery2Name}`,
          children: [
            {
              name: 'Expressjs/Router: /',
              children: [
                {
                  name: 'Nodejs/Middleware/Expressjs/<anonymous>',
                  children: [
                    {
                      name: `${OPERATION_PREFIX}/${operationPart1}`,
                      children: [{ name: libraryExternal }, { name: bookExternal }]
                    },
                    {
                      name: `${OPERATION_PREFIX}/${operationPart2}`,
                      children: [{ name: libraryExternal }, { name: magazineExternal }]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]

      segments(transaction.trace.root, expectedSegments)
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

function formatExternalSegment(url) {
  const hostAndPort = url.replace('http://', '')
  return `${EXTERNAL_PREFIX}/${hostAndPort}`
}
