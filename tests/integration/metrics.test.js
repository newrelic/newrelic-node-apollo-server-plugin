/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const crypto = require('crypto')
const { executeQuery, executeQueryBatch, makeRequest } = require('../test-client')
const { setupEnvConfig } = require('../agent-testing')

const ANON_PLACEHOLDER = '<anonymous>'
const UNKNOWN_OPERATION = '<unknown>'

const OPERATION_PREFIX = 'GraphQL/operation/ApolloServer'
const RESOLVE_PREFIX = 'GraphQL/resolve/ApolloServer'

const { setupApolloServerTests } = require('./apollo-server-setup')

setupApolloServerTests({
  suiteName: 'metrics',
  createTests: createMetricsTests
})

function createMetricsTests(t) {
  setupEnvConfig(t)

  t.test('anonymous query, single level metrics', (t) => {
    const { helper, serverUrl } = t.context

    const query = `query {
      hello
    }`

    helper.agent.on('transactionFinished', () => {
      const operationPart = `query/${ANON_PLACEHOLDER}/hello`
      t.metrics([`${OPERATION_PREFIX}/${operationPart}`, `${RESOLVE_PREFIX}/hello`])
    })

    executeQuery(serverUrl, query, (err) => {
      t.error(err)
      t.end()
    })
  })

  t.test('named query, single level', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName = 'HeyThere'
    const query = `query ${expectedName} {
      hello
    }`

    helper.agent.on('transactionFinished', () => {
      const operationPart = `query/${expectedName}/hello`
      t.metrics([`${OPERATION_PREFIX}/${operationPart}`, `${RESOLVE_PREFIX}/hello`])
    })

    executeQuery(serverUrl, query, (err) => {
      t.error(err)
      t.end()
    })
  })

  t.test('multi-level, should use field name not path for resolve metrics', (t) => {
    const { helper, serverUrl } = t.context

    const query = `query {
      libraries {
        books {
          title
          author {
            name
          }
        }
      }
    }`

    const path = 'libraries.books'

    helper.agent.on('transactionFinished', () => {
      const operationPart = `query/${ANON_PLACEHOLDER}/${path}`

      t.metrics([
        `${OPERATION_PREFIX}/${operationPart}`,
        `${RESOLVE_PREFIX}/libraries`,
        `${RESOLVE_PREFIX}/books`,
        `${RESOLVE_PREFIX}/author`
      ])
    })

    executeQuery(serverUrl, query, (err) => {
      t.error(err)
      t.end()
    })
  })

  t.test('batch query should generate metrics for nested operations', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName1 = 'GetBookForLibrary'
    const query1 = `query ${expectedName1} {
      library(branch: "downtown") {
        books {
          title
          author {
            name
          }
        }
      }
    }`

    const query2 = `mutation {
      addThing(name: "added thing!")
    }`

    const path1 = 'library.books'

    const queries = [query1, query2]

    helper.agent.on('transactionFinished', () => {
      const operationPart1 = `query/${expectedName1}/${path1}`
      const operationPart2 = `mutation/${ANON_PLACEHOLDER}/addThing`

      const operationMetrics1 = [
        `${OPERATION_PREFIX}/${operationPart1}`,
        `${RESOLVE_PREFIX}/library`,
        `${RESOLVE_PREFIX}/books`,
        `${RESOLVE_PREFIX}/author`
      ]

      const operationMetrics2 = [
        `${OPERATION_PREFIX}/${operationPart2}`,
        `${RESOLVE_PREFIX}/addThing`
      ]

      t.metrics([...operationMetrics1, ...operationMetrics2])
    })

    executeQueryBatch(serverUrl, queries, (err) => {
      t.error(err)
      t.end()
    })
  })

  t.test('should use the context.source when executing a persisted query', (t) => {
    const { helper, serverUrl } = t.context

    const query = '{ libraries { books { title author { name } } } }'
    const path = 'libraries.books'
    const querySha = crypto.createHash('sha256').update(query).digest('hex')
    const withQuery = `${serverUrl}?extensions={"persistedQuery":{"version":1,
      "sha256Hash":"${querySha}"}}&query=${query}`
    const persistedQuery = `${serverUrl}?extensions={"persistedQuery":{"version":1,
      "sha256Hash":"${querySha}"}}`

    helper.agent.on('transactionFinished', () => {
      const operationPart = `query/${ANON_PLACEHOLDER}/${path}`

      t.metrics([
        `${OPERATION_PREFIX}/${operationPart}`,
        `${RESOLVE_PREFIX}/libraries`,
        `${RESOLVE_PREFIX}/books`,
        `${RESOLVE_PREFIX}/author`
      ])
    })

    // first make a request with persistedQuery extension enabled and the query to persist
    makeRequest(withQuery, null, (err) => {
      t.error(err)

      // lastly, make a request with persistedQuery extension enabled
      // and without the query it should properly pull from query cache
      makeRequest(persistedQuery, null, (err) => {
        t.error(err)
        t.end()
      })
    })
  })

  t.test('when cannot parse, should have unknown placeholder metric', (t) => {
    const { helper, serverUrl } = t.context

    const invalidQuery = `query {
      libraries {
        books {
          title
          author {
            name
          }
        }
      }
    ` // missing closing }

    helper.agent.on('transactionFinished', () => {
      t.metrics([`${OPERATION_PREFIX}/${UNKNOWN_OPERATION}`])
    })

    executeQuery(serverUrl, invalidQuery, (err) => {
      t.error(err)

      t.end()
    })
  })

  t.test('named query with fragment, query first', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName = 'GetBookForLibrary'
    const query = `query ${expectedName} {
      library(branch: "downtown") {
        books {
          ... LibraryBook
        }
      }
    }
    fragment LibraryBook on Book {
      title
      author {
        name
      }
    }`

    const path = 'library.books.LibraryBook'

    helper.agent.on('transactionFinished', () => {
      const operationPart = `query/${expectedName}/${path}`

      t.metrics([
        `${OPERATION_PREFIX}/${operationPart}`,
        `${RESOLVE_PREFIX}/library`,
        `${RESOLVE_PREFIX}/books`,
        `${RESOLVE_PREFIX}/author`
      ])
    })

    executeQuery(serverUrl, query, (err) => {
      t.error(err)
      t.end()
    })
  })

  t.test('named query with fragment, fragment first', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName = 'GetBookForLibrary'
    const query = `fragment LibraryBook on Book {
      title
      author {
        name
      }
    }
    query ${expectedName} {
      library(branch: "downtown") {
        books {
          ... LibraryBook
        }
      }
    }`

    const path = 'library.books.LibraryBook'

    helper.agent.on('transactionFinished', () => {
      const operationPart = `query/${expectedName}/${path}`

      t.metrics([
        `${OPERATION_PREFIX}/${operationPart}`,
        `${RESOLVE_PREFIX}/library`,
        `${RESOLVE_PREFIX}/books`,
        `${RESOLVE_PREFIX}/author`
      ])
    })

    executeQuery(serverUrl, query, (err) => {
      t.error(err)
      t.end()
    })
  })
}
