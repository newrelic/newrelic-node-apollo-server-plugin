/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const assert = require('node:assert')

const { executeQuery, executeQueryBatch } = require('../test-client')
const { checkResult } = require('./common')
const { assertSegments } = require('../custom-assertions')
const promiseResolvers = require('./promise-resolvers')

const ANON_PLACEHOLDER = '<anonymous>'
const UNKNOWN_OPERATION = '<unknown>'
const OPERATION_PREFIX = 'GraphQL/operation/ApolloServer'
const RESOLVE_PREFIX = 'GraphQL/resolve/ApolloServer'

/**
 * Creates the root segment based on a prefix and operation part
 */
function baseSegment(operationPart, prefix) {
  return `${prefix}//${operationPart}`
}

/**
 * Creates the appropriate sibling hierarchy of segments
 * In apollo 4 they tweaked how the apollo server express instance is constructed.
 * It lacks a / router and routes everything through a global middleware
 */
function constructSegments(firstSegmentName, operationSegments, isApollo4) {
  if (isApollo4) {
    return [firstSegmentName, [...operationSegments]]
  }
  return ['Express/Router: /', [...operationSegments]]
}

const tests = []

tests.push({
  name: 'anonymous query, single level',
  async fn(t) {
    const {
      helper,
      serverUrl,
      apolloServerPkg: { isApollo4 },
      TRANSACTION_PREFIX
    } = t.nr
    const { promise, resolve } = promiseResolvers()

    const query = `query {
      hello
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      const operationPart = `query/${ANON_PLACEHOLDER}/hello`
      const firstSegmentName = baseSegment(operationPart, TRANSACTION_PREFIX)
      const operationSegments = [
        'Nodejs/Middleware/Expressjs/<anonymous>',
        [`${OPERATION_PREFIX}/${operationPart}`, [`${RESOLVE_PREFIX}/hello`]]
      ]
      const expectedSegments = constructSegments(firstSegmentName, operationSegments, isApollo4)

      assertSegments(transaction.trace.root, expectedSegments, { exact: false })
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(assert, result, () => {
        resolve()
      })
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
      apolloServerPkg: { isApollo4 },
      TRANSACTION_PREFIX
    } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'HeyThere'
    const query = `query ${expectedName} {
      hello
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      const operationPart = `query/${expectedName}/hello`
      const firstSegmentName = baseSegment(operationPart, TRANSACTION_PREFIX)
      const operationSegments = [
        'Nodejs/Middleware/Expressjs/<anonymous>',
        [`${OPERATION_PREFIX}/${operationPart}`, [`${RESOLVE_PREFIX}/hello`]]
      ]
      const expectedSegments = constructSegments(firstSegmentName, operationSegments, isApollo4)
      assertSegments(transaction.trace.root, expectedSegments, { exact: false })
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(assert, result, () => {
        resolve()
      })
    })

    await promise
  }
})

tests.push({
  name: 'anonymous query, multi-level',
  async fn(t) {
    const {
      helper,
      serverUrl,
      apolloServerPkg: { isApollo4 },
      TRANSACTION_PREFIX
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

    helper.agent.once('transactionFinished', (transaction) => {
      const operationPart = `query/${ANON_PLACEHOLDER}/${path}`
      const firstSegmentName = baseSegment(operationPart, TRANSACTION_PREFIX)
      const operationSegments = [
        'Nodejs/Middleware/Expressjs/<anonymous>',
        [
          `${OPERATION_PREFIX}/${operationPart}`,
          [
            `${RESOLVE_PREFIX}/libraries`,
            `${RESOLVE_PREFIX}/libraries.books`,
            `${RESOLVE_PREFIX}/libraries.books.author`,
            `${RESOLVE_PREFIX}/libraries.books.author.name`
          ]
        ]
      ]

      const expectedSegments = constructSegments(firstSegmentName, operationSegments, isApollo4)

      assertSegments(transaction.trace.root, expectedSegments, { exact: false })
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(assert, result, () => {
        resolve()
      })
    })

    await promise
  }
})

tests.push({
  name: 'named query, multi-level should return deepest unique path',
  async fn(t) {
    const {
      helper,
      serverUrl,
      apolloServerPkg: { isApollo4 },
      TRANSACTION_PREFIX
    } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'GetBooksByLibrary'
    const query = `query ${expectedName} {
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

    helper.agent.once('transactionFinished', (transaction) => {
      const operationPart = `query/${expectedName}/${path}`
      const firstSegmentName = baseSegment(operationPart, TRANSACTION_PREFIX)
      const operationSegments = [
        'Nodejs/Middleware/Expressjs/<anonymous>',
        [
          `${OPERATION_PREFIX}/${operationPart}`,
          [
            `${RESOLVE_PREFIX}/libraries`,
            `${RESOLVE_PREFIX}/libraries.books`,
            `${RESOLVE_PREFIX}/libraries.books.title`,
            `${RESOLVE_PREFIX}/libraries.books.author`,
            `${RESOLVE_PREFIX}/libraries.books.author.name`
          ]
        ]
      ]
      const expectedSegments = constructSegments(firstSegmentName, operationSegments, isApollo4)

      assertSegments(transaction.trace.root, expectedSegments, { exact: false })
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(assert, result, () => {
        resolve()
      })
    })

    await promise
  }
})

tests.push({
  name: 'named query with aliases should use alias in segment naming',
  async fn(t) {
    const {
      helper,
      serverUrl,
      apolloServerPkg: { isApollo4 },
      TRANSACTION_PREFIX
    } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'GetBooksByLibrary'
    const query = `query ${expectedName} {
      alias: libraries {
        books {
          title
          author {
            name
          }
        }
      }
    }`

    const path = 'libraries.books'

    helper.agent.once('transactionFinished', (transaction) => {
      const operationPart = `query/${expectedName}/${path}`
      const firstSegmentName = baseSegment(operationPart, TRANSACTION_PREFIX)
      const operationSegments = [
        'Nodejs/Middleware/Expressjs/<anonymous>',
        [
          `${OPERATION_PREFIX}/${operationPart}`,
          [
            `${RESOLVE_PREFIX}/alias`,
            `${RESOLVE_PREFIX}/alias.books`,
            `${RESOLVE_PREFIX}/alias.books.author`
          ]
        ]
      ]
      const expectedSegments = constructSegments(firstSegmentName, operationSegments, isApollo4)

      assertSegments(transaction.trace.root, expectedSegments, { exact: false })
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(assert, result, () => {
        resolve()
      })
    })

    await promise
  }
})

tests.push({
  name: 'anonymous mutation, single level',
  async fn(t) {
    const {
      helper,
      serverUrl,
      apolloServerPkg: { isApollo4 },
      TRANSACTION_PREFIX
    } = t.nr
    const { promise, resolve } = promiseResolvers()

    const query = `mutation {
      addThing(name: "added thing!")
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      const operationPart = `mutation/${ANON_PLACEHOLDER}/addThing`
      const firstSegmentName = baseSegment(operationPart, TRANSACTION_PREFIX)
      const operationSegments = [
        'Nodejs/Middleware/Expressjs/<anonymous>',
        [
          `${OPERATION_PREFIX}/${operationPart}`,
          [`${RESOLVE_PREFIX}/addThing`, ['timers.setTimeout', ['Callback: namedCallback']]]
        ]
      ]
      const expectedSegments = constructSegments(firstSegmentName, operationSegments, isApollo4)

      assertSegments(transaction.trace.root, expectedSegments, { exact: false })
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(assert, result, () => {
        resolve()
      })
    })

    await promise
  }
})

tests.push({
  name: 'named mutation, single level, should use mutation name',
  async fn(t) {
    const {
      helper,
      serverUrl,
      apolloServerPkg: { isApollo4 },
      TRANSACTION_PREFIX
    } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'AddThing'
    const query = `mutation ${expectedName} {
      addThing(name: "added thing!")
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      const operationPart = `mutation/${expectedName}/addThing`
      const firstSegmentName = baseSegment(operationPart, TRANSACTION_PREFIX)
      const operationSegments = [
        'Nodejs/Middleware/Expressjs/<anonymous>',
        [
          `${OPERATION_PREFIX}/${operationPart}`,
          [`${RESOLVE_PREFIX}/addThing`, ['timers.setTimeout', ['Callback: namedCallback']]]
        ]
      ]
      const expectedSegments = constructSegments(firstSegmentName, operationSegments, isApollo4)

      assertSegments(transaction.trace.root, expectedSegments, { exact: false })
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(assert, result, () => {
        resolve()
      })
    })

    await promise
  }
})

tests.push({
  name: 'anonymous query, with params',
  async fn(t) {
    const {
      helper,
      serverUrl,
      apolloServerPkg: { isApollo4 },
      TRANSACTION_PREFIX
    } = t.nr
    const { promise, resolve } = promiseResolvers()

    const query = `query {
      paramQuery(blah: "blah", blee: "blee")
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      const operationPart = `query/${ANON_PLACEHOLDER}/paramQuery`
      const firstSegmentName = baseSegment(operationPart, TRANSACTION_PREFIX)
      const operationSegments = [
        'Nodejs/Middleware/Expressjs/<anonymous>',
        [`${OPERATION_PREFIX}/${operationPart}`, [`${RESOLVE_PREFIX}/paramQuery`]]
      ]
      const expectedSegments = constructSegments(firstSegmentName, operationSegments, isApollo4)

      assertSegments(transaction.trace.root, expectedSegments, { exact: false })
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(assert, result, () => {
        resolve()
      })
    })

    await promise
  }
})

tests.push({
  name: 'named query, with params',
  async fn(t) {
    const {
      helper,
      serverUrl,
      apolloServerPkg: { isApollo4 },
      TRANSACTION_PREFIX
    } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'BlahQuery'
    const query = `query ${expectedName} {
      paramQuery(blah: "blah")
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      const operationPart = `query/${expectedName}/paramQuery`
      const firstSegmentName = baseSegment(operationPart, TRANSACTION_PREFIX)
      const operationSegments = [
        'Nodejs/Middleware/Expressjs/<anonymous>',
        [`${OPERATION_PREFIX}/${operationPart}`, [`${RESOLVE_PREFIX}/paramQuery`]]
      ]
      const expectedSegments = constructSegments(firstSegmentName, operationSegments, isApollo4)

      assertSegments(transaction.trace.root, expectedSegments, { exact: false })
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(assert, result, () => {
        resolve()
      })
    })

    await promise
  }
})

tests.push({
  name: 'named query, with params, multi-level',
  async fn(t) {
    const {
      helper,
      serverUrl,
      apolloServerPkg: { isApollo4 },
      TRANSACTION_PREFIX
    } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'GetBookForLibrary'
    const query = `query ${expectedName} {
      library(branch: "downtown") {
        books {
          title
          author {
            name
          }
        }
      }
    }`

    const path = 'library.books'

    helper.agent.once('transactionFinished', (transaction) => {
      const operationPart = `query/${expectedName}/${path}`
      const firstSegmentName = baseSegment(operationPart, TRANSACTION_PREFIX)
      const operationSegments = [
        'Nodejs/Middleware/Expressjs/<anonymous>',
        [
          `${OPERATION_PREFIX}/${operationPart}`,
          [
            `${RESOLVE_PREFIX}/library`,
            ['timers.setTimeout', ['Callback: <anonymous>']],
            `${RESOLVE_PREFIX}/library.books`,
            `${RESOLVE_PREFIX}/library.books.title`,
            `${RESOLVE_PREFIX}/library.books.author`,
            `${RESOLVE_PREFIX}/library.books.author.name`
          ]
        ]
      ]
      const expectedSegments = constructSegments(firstSegmentName, operationSegments, isApollo4)

      assertSegments(transaction.trace.root, expectedSegments, { exact: false })
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(assert, result, () => {
        resolve()
      })
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
      apolloServerPkg: { isApollo4 },
      TRANSACTION_PREFIX
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

    helper.agent.once('transactionFinished', (transaction) => {
      const operationPart = `query/${expectedName}/${path}`
      const firstSegmentName = baseSegment(operationPart, TRANSACTION_PREFIX)
      const operationSegments = [
        'Nodejs/Middleware/Expressjs/<anonymous>',
        [
          `${OPERATION_PREFIX}/${operationPart}`,
          [
            `${RESOLVE_PREFIX}/library`,
            ['timers.setTimeout', ['Callback: <anonymous>']],
            `${RESOLVE_PREFIX}/library.books`,
            `${RESOLVE_PREFIX}/library.books.title`,
            `${RESOLVE_PREFIX}/library.books.author`,
            `${RESOLVE_PREFIX}/library.books.author.name`
          ]
        ]
      ]
      const expectedSegments = constructSegments(firstSegmentName, operationSegments, isApollo4)

      assertSegments(transaction.trace.root, expectedSegments, { exact: false })
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
      apolloServerPkg: { isApollo4 },
      TRANSACTION_PREFIX
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

    helper.agent.once('transactionFinished', (transaction) => {
      const operationPart = `query/${expectedName}/${path}`
      const firstSegmentName = baseSegment(operationPart, TRANSACTION_PREFIX)
      const operationSegments = [
        'Nodejs/Middleware/Expressjs/<anonymous>',
        [
          `${OPERATION_PREFIX}/${operationPart}`,
          [
            `${RESOLVE_PREFIX}/library`,
            ['timers.setTimeout', ['Callback: <anonymous>']],
            `${RESOLVE_PREFIX}/library.books`,
            `${RESOLVE_PREFIX}/library.books.title`,
            `${RESOLVE_PREFIX}/library.books.author`,
            `${RESOLVE_PREFIX}/library.books.author.name`
          ]
        ]
      ]
      const expectedSegments = constructSegments(firstSegmentName, operationSegments, isApollo4)

      assertSegments(transaction.trace.root, expectedSegments, { exact: false })
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'batch query should include segments for nested queries',
  async fn(t) {
    const {
      helper,
      serverUrl,
      apolloServerPkg: { isApollo4 },
      TRANSACTION_PREFIX
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

    helper.agent.once('transactionFinished', (transaction) => {
      const operationPart1 = `query/${expectedName1}/${path1}`
      const expectedQuery1Name = `${operationPart1}`
      const operationPart2 = `mutation/${ANON_PLACEHOLDER}/addThing`
      const expectedQuery2Name = `${operationPart2}`

      const batchTransactionPrefix = `${TRANSACTION_PREFIX}//batch`
      const operationPart = `${expectedQuery1Name}/${expectedQuery2Name}`
      const firstSegmentName = baseSegment(operationPart, batchTransactionPrefix).replace(
        'batch//',
        'batch/'
      )
      const operationSegments = [
        'Nodejs/Middleware/Expressjs/<anonymous>',
        [
          [
            `${OPERATION_PREFIX}/${operationPart1}`,
            [
              [`${RESOLVE_PREFIX}/library`, ['timers.setTimeout', ['Callback: <anonymous>']]],
              `${RESOLVE_PREFIX}/library.books`,
              `${RESOLVE_PREFIX}/library.books.title`,
              `${RESOLVE_PREFIX}/library.books.author`,
              `${RESOLVE_PREFIX}/library.books.author.name`
            ]
          ],
          [
            `${OPERATION_PREFIX}/${operationPart2}`,
            [`${RESOLVE_PREFIX}/addThing`, ['timers.setTimeout', ['Callback: namedCallback']]]
          ]
        ]
      ]
      const expectedSegments = constructSegments(firstSegmentName, operationSegments, isApollo4)

      assertSegments(transaction.trace.root, expectedSegments, { exact: false })
    })

    executeQueryBatch(serverUrl, queries, (err, result) => {
      assert.ifError(err)
      checkResult(assert, result, () => {
        assert.equal(result.length, 2)

        resolve()
      })
    })

    await promise
  }
})

tests.push({
  name: 'union, single level',
  async fn(t) {
    const {
      helper,
      serverUrl,
      apolloServerPkg: { isApollo4 },
      TRANSACTION_PREFIX
    } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'GetSearchResult'
    const query = `query ${expectedName} {
      search(contains: "Ollies") {
        __typename
        ... on Book {
          title
        }
      }
    }`

    const deepestPath = 'search<Book>.title'

    helper.agent.once('transactionFinished', (transaction) => {
      const operationPart = `query/${expectedName}/${deepestPath}`
      const firstSegmentName = baseSegment(operationPart, TRANSACTION_PREFIX)
      const operationSegments = [
        'Nodejs/Middleware/Expressjs/<anonymous>',
        [`${OPERATION_PREFIX}/${operationPart}`, [`${RESOLVE_PREFIX}/search`]]
      ]
      const expectedSegments = constructSegments(firstSegmentName, operationSegments, isApollo4)
      assertSegments(transaction.trace.root, expectedSegments, { exact: false })
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(assert, result, () => {
        resolve()
      })
    })

    await promise
  }
})

tests.push({
  name: 'union, multiple inline fragments, single level',
  async fn(t) {
    const {
      helper,
      serverUrl,
      apolloServerPkg: { isApollo4 },
      TRANSACTION_PREFIX
    } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'GetSearchResult'
    const query = `query ${expectedName} {
      search(contains: "Node") {
        __typename
        ... on Magazine {
          title
        }
        ... on Book {
          title
        }
      }
    }`

    const deepestPath = 'search'

    helper.agent.once('transactionFinished', (transaction) => {
      const operationPart = `query/${expectedName}/${deepestPath}`
      const firstSegmentName = baseSegment(operationPart, TRANSACTION_PREFIX)
      const operationSegments = [
        'Nodejs/Middleware/Expressjs/<anonymous>',
        [`${OPERATION_PREFIX}/${operationPart}`, [`${RESOLVE_PREFIX}/search`]]
      ]
      const expectedSegments = constructSegments(firstSegmentName, operationSegments, isApollo4)
      assertSegments(transaction.trace.root, expectedSegments, { exact: false })
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(assert, result, () => {
        resolve()
      })
    })

    await promise
  }
})

tests.push({
  name: 'when the query cannot be parsed, should have operation placeholder',
  async fn(t) {
    // there will be no document/AST nor resolved operation
    const {
      helper,
      serverUrl,
      apolloServerPkg: { isApollo4 },
      TRANSACTION_PREFIX
    } = t.nr
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

    helper.agent.once('transactionFinished', (transaction) => {
      const firstSegmentName = baseSegment('*', TRANSACTION_PREFIX)
      const operationSegments = [
        'Nodejs/Middleware/Expressjs/<anonymous>',
        [`${OPERATION_PREFIX}/${UNKNOWN_OPERATION}`]
      ]
      const expectedSegments = constructSegments(firstSegmentName, operationSegments, isApollo4)

      assertSegments(transaction.trace.root, expectedSegments, { exact: false })
    })

    executeQuery(serverUrl, invalidQuery, (err, result) => {
      assert.ifError(err)

      assert.ok(result)
      assert.ok(result.errors)
      assert.equal(result.errors.length, 1) // should have one parsing error

      const [parseError] = result.errors
      assert.equal(parseError.extensions.code, 'GRAPHQL_PARSE_FAILED')

      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'when cannot validate, should include operation segment',
  async fn(t) {
    // if parse succeeds but validation fails, there will not be a resolved operation
    // but the document/AST can still be leveraged for what was intended.
    const {
      helper,
      serverUrl,
      apolloServerPkg: { isApollo4 },
      TRANSACTION_PREFIX
    } = t.nr
    const { promise, resolve } = promiseResolvers()

    const invalidQuery = `query {
      libraries {
        books {
          doesnotexist {
            name
          }
        }
      }
    }`

    const path = 'libraries.books.doesnotexist.name'

    helper.agent.once('transactionFinished', (transaction) => {
      const operationPart = `query/${ANON_PLACEHOLDER}/${path}`
      const firstSegmentName = baseSegment(operationPart, TRANSACTION_PREFIX)
      const operationSegments = [
        'Nodejs/Middleware/Expressjs/<anonymous>',
        [`${OPERATION_PREFIX}/${operationPart}`]
      ]
      const expectedSegments = constructSegments(firstSegmentName, operationSegments, isApollo4)

      assertSegments(transaction.trace.root, expectedSegments, { exact: false })
    })

    executeQuery(serverUrl, invalidQuery, (err, result) => {
      assert.ifError(err)

      assert.ok(result)
      assert.ok(result.errors)
      assert.equal(result.errors.length, 1) // should have one parsing error

      const [parseError] = result.errors
      assert.equal(parseError.extensions.code, 'GRAPHQL_VALIDATION_FAILED')

      resolve()
    })

    await promise
  }
})

module.exports = {
  tests,
  suiteName: 'express segments'
}
