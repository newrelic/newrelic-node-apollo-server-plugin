/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const assert = require('node:assert')
const crypto = require('node:crypto')

const { executeQuery, executeQueryBatch, makeRequest } = require('./test-client')
const { assertMetrics } = require('./custom-assertions')
const promiseResolvers = require('./versioned/promise-resolvers')

const ANON_PLACEHOLDER = '<anonymous>'
const UNKNOWN_OPERATION = '<unknown>'
const OPERATION_PREFIX = 'GraphQL/operation/ApolloServer'
const FIELD_PREFIX = 'GraphQL/field/ApolloServer'
const RESOLVE_PREFIX = 'GraphQL/resolve/ApolloServer'
const ARG_PREFIX = 'GraphQL/arg/ApolloServer'

const tests = []

tests.push({
  name: 'anonymous query, single level metrics',
  async fn(t) {
    const {
      helper,
      serverUrl,
      pluginConfig: { captureFieldMetrics }
    } = t.nr
    const { promise, resolve } = promiseResolvers()

    const query = `query {
      hello
    }`

    helper.agent.once('transactionFinished', (tx) => {
      const operationPart = `query/${ANON_PLACEHOLDER}/hello`
      const expectedMetrics = [
        [{ name: `${OPERATION_PREFIX}/${operationPart}` }],
        [{ name: `${RESOLVE_PREFIX}/Query.hello` }]
      ]

      if (captureFieldMetrics) {
        expectedMetrics.push([{ name: `${FIELD_PREFIX}/Query.hello` }])
      }

      assertMetrics(tx.metrics, expectedMetrics)
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'named query, single level',
  async fn(t) {
    const {
      helper,
      serverUrl,
      pluginConfig: { captureFieldMetrics }
    } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'HeyThere'
    const query = `query ${expectedName} {
      hello
    }`

    helper.agent.once('transactionFinished', (tx) => {
      const operationPart = `query/${expectedName}/hello`
      const expectedMetrics = [
        [{ name: `${OPERATION_PREFIX}/${operationPart}` }],
        [{ name: `${RESOLVE_PREFIX}/Query.hello` }]
      ]

      if (captureFieldMetrics) {
        expectedMetrics.push([{ name: `${FIELD_PREFIX}/Query.hello` }])
      }

      assertMetrics(tx.metrics, expectedMetrics)
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'multi-level, should use field name not path for resolve metrics',
  async fn(t) {
    const {
      helper,
      serverUrl,
      pluginConfig: { captureFieldMetrics }
    } = t.nr
    const { promise, resolve } = promiseResolvers()

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

    helper.agent.once('transactionFinished', (tx) => {
      const operationPart = `query/${ANON_PLACEHOLDER}/${path}`

      const expectedMetrics = [
        [{ name: `${OPERATION_PREFIX}/${operationPart}` }],
        [{ name: `${RESOLVE_PREFIX}/Query.libraries` }],
        [{ name: `${RESOLVE_PREFIX}/Library.books` }],
        [{ name: `${RESOLVE_PREFIX}/Book.author` }]
      ]

      if (captureFieldMetrics) {
        const fieldMetrics = [
          [{ name: `${FIELD_PREFIX}/Query.libraries` }],
          [{ name: `${FIELD_PREFIX}/Library.books` }],
          [{ name: `${FIELD_PREFIX}/Book.title` }],
          [{ name: `${FIELD_PREFIX}/Book.author` }],
          [{ name: `${FIELD_PREFIX}/Author.name` }]
        ]

        expectedMetrics.push(...fieldMetrics)
      }

      assertMetrics(tx.metrics, expectedMetrics)
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'batch query should generate metrics for nested operations',
  async fn(t) {
    const {
      helper,
      serverUrl,
      pluginConfig: { captureFieldMetrics }
    } = t.nr
    const { promise, resolve } = promiseResolvers()

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

    helper.agent.once('transactionFinished', (tx) => {
      const operationPart1 = `query/${expectedName1}/${path1}`
      const operationPart2 = `mutation/${ANON_PLACEHOLDER}/addThing`

      const operationMetrics1 = [
        [{ name: `${OPERATION_PREFIX}/${operationPart1}` }],
        [{ name: `${RESOLVE_PREFIX}/Query.library` }],
        [{ name: `${RESOLVE_PREFIX}/Library.books` }],
        [{ name: `${RESOLVE_PREFIX}/Book.author` }]
      ]

      const operationMetrics2 = [
        [{ name: `${OPERATION_PREFIX}/${operationPart2}` }],
        [{ name: `${RESOLVE_PREFIX}/Mutation.addThing` }]
      ]

      if (captureFieldMetrics) {
        const fieldMetrics1 = [
          [{ name: `${FIELD_PREFIX}/Query.library` }],
          [{ name: `${ARG_PREFIX}/Query.library/branch` }],
          [{ name: `${FIELD_PREFIX}/Library.books` }],
          [{ name: `${FIELD_PREFIX}/Book.title` }],
          [{ name: `${FIELD_PREFIX}/Book.author` }],
          [{ name: `${FIELD_PREFIX}/Author.name` }]
        ]

        operationMetrics1.push(...fieldMetrics1)

        const fieldMetrics2 = [[{ name: `${ARG_PREFIX}/Mutation.addThing/name` }]]

        operationMetrics2.push(...fieldMetrics2)
      }

      assertMetrics(tx.metrics, [...operationMetrics1, ...operationMetrics2])
    })

    executeQueryBatch(serverUrl, queries, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'input type query with multiple fields',
  async fn(t) {
    const {
      helper,
      serverUrl,
      pluginConfig: { captureFieldMetrics }
    } = t.nr
    const { promise, resolve } = promiseResolvers()
    const expectedName = 'FindBooks'
    const path = 'searchByBook'

    const query = `query ${expectedName} {
      searchByBook(book: { author: { name: "10x Developer" }  } ) {
        title
        isbn
      }
    }`

    helper.agent.once('transactionFinished', (tx) => {
      const operationPart = `query/${expectedName}/${path}`
      const operationMetrics = [
        [{ name: `${OPERATION_PREFIX}/${operationPart}` }],
        [{ name: `${RESOLVE_PREFIX}/Query.${path}` }]
      ]

      if (captureFieldMetrics) {
        const fieldMetrics = [
          [{ name: `${ARG_PREFIX}/Query.${path}/book.author.name` }],
          [{ name: `${FIELD_PREFIX}/Book.title` }],
          [{ name: `${FIELD_PREFIX}/Book.isbn` }]
        ]
        operationMetrics.push(...fieldMetrics)
      }

      assertMetrics(tx.metrics, operationMetrics)
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'should use the context.source when executing a persisted query',
  async fn(t) {
    const {
      helper,
      serverUrl,
      pluginConfig: { captureFieldMetrics }
    } = t.nr
    const { promise, resolve } = promiseResolvers()

    const query = '{ libraries { books { title author { name } } } }'
    const path = 'libraries.books'
    const querySha = crypto.createHash('sha256').update(query).digest('hex')
    const withQuery = `${serverUrl}?extensions={"persistedQuery":{"version":1,
      "sha256Hash":"${querySha}"}}&query=${query}`
    const persistedQuery = `${serverUrl}?extensions={"persistedQuery":{"version":1,
      "sha256Hash":"${querySha}"}}`

    helper.agent.once('transactionFinished', (tx) => {
      const operationPart = `query/${ANON_PLACEHOLDER}/${path}`

      const expectedMetrics = [
        [{ name: `${OPERATION_PREFIX}/${operationPart}` }],
        [{ name: `${RESOLVE_PREFIX}/Query.libraries` }],
        [{ name: `${RESOLVE_PREFIX}/Library.books` }],
        [{ name: `${RESOLVE_PREFIX}/Book.author` }]
      ]

      if (captureFieldMetrics) {
        const fieldMetrics = [
          [{ name: `${FIELD_PREFIX}/Query.libraries` }],
          [{ name: `${FIELD_PREFIX}/Library.books` }],
          [{ name: `${FIELD_PREFIX}/Book.title` }],
          [{ name: `${FIELD_PREFIX}/Book.author` }],
          [{ name: `${FIELD_PREFIX}/Author.name` }]
        ]
        expectedMetrics.push(...fieldMetrics)
      }

      assertMetrics(tx.metrics, expectedMetrics)
    })

    // first make a request with persistedQuery extension enabled and the query to persist
    makeRequest(withQuery, null, (err) => {
      assert.ifError(err)

      // lastly, make a request with persistedQuery extension enabled
      // and without the query it should properly pull from query cache
      makeRequest(persistedQuery, null, (err) => {
        assert.ifError(err)
        resolve()
      })
    })

    await promise
  }
})

tests.push({
  name: 'when cannot parse, should have unknown placeholder metric',
  async fn(t) {
    const { helper, serverUrl } = t.nr
    const { promise, resolve } = promiseResolvers()

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

    helper.agent.once('transactionFinished', (tx) => {
      assertMetrics(tx.metrics, [[{ name: `${OPERATION_PREFIX}/${UNKNOWN_OPERATION}` }]])
    })

    executeQuery(serverUrl, invalidQuery, (err) => {
      assert.ifError(err)

      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'named query with fragment, query first',
  async fn(t) {
    const {
      helper,
      serverUrl,
      pluginConfig: { captureFieldMetrics }
    } = t.nr
    const { promise, resolve } = promiseResolvers()

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

    helper.agent.once('transactionFinished', (tx) => {
      const operationPart = `query/${expectedName}/${path}`

      const expectedMetrics = [
        [{ name: `${OPERATION_PREFIX}/${operationPart}` }],
        [{ name: `${RESOLVE_PREFIX}/Query.library` }],
        [{ name: `${RESOLVE_PREFIX}/Library.books` }],
        [{ name: `${RESOLVE_PREFIX}/Book.author` }]
      ]

      if (captureFieldMetrics) {
        const fieldMetrics = [
          [{ name: `${FIELD_PREFIX}/Query.library` }],
          [{ name: `${ARG_PREFIX}/Query.library/branch` }],
          [{ name: `${FIELD_PREFIX}/Library.books` }],
          [{ name: `${FIELD_PREFIX}/Book.title` }],
          [{ name: `${FIELD_PREFIX}/Book.author` }],
          [{ name: `${FIELD_PREFIX}/Author.name` }]
        ]

        expectedMetrics.push(...fieldMetrics)
      }

      assertMetrics(tx.metrics, expectedMetrics)
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'named query with fragment, fragment first',
  async fn(t) {
    const {
      helper,
      serverUrl,
      pluginConfig: { captureFieldMetrics }
    } = t.nr
    const { promise, resolve } = promiseResolvers()

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

    helper.agent.once('transactionFinished', (tx) => {
      const operationPart = `query/${expectedName}/${path}`

      const expectedMetrics = [
        [{ name: `${OPERATION_PREFIX}/${operationPart}` }],
        [{ name: `${RESOLVE_PREFIX}/Query.library` }],
        [{ name: `${RESOLVE_PREFIX}/Library.books` }],
        [{ name: `${RESOLVE_PREFIX}/Book.author` }]
      ]

      if (captureFieldMetrics) {
        const fieldMetrics = [
          [{ name: `${FIELD_PREFIX}/Query.library` }],
          [{ name: `${ARG_PREFIX}/Query.library/branch` }],
          [{ name: `${FIELD_PREFIX}/Library.books` }],
          [{ name: `${FIELD_PREFIX}/Book.title` }],
          [{ name: `${FIELD_PREFIX}/Book.author` }],
          [{ name: `${FIELD_PREFIX}/Author.name` }]
        ]

        expectedMetrics.push(...fieldMetrics)
      }

      assertMetrics(tx.metrics, expectedMetrics)
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

module.exports = {
  tests
}
