/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const assert = require('node:assert')

const { executeQuery, executeQueryBatch } = require('../test-client')
const { checkResult } = require('./common')
const promiseResolvers = require('./promise-resolvers')

const ANON_PLACEHOLDER = '<anonymous>'

const tests = []

tests.push({
  name: 'anonymous query, single level, should use anonymous placeholder',
  async fn(t) {
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
    const { promise, resolve } = promiseResolvers()

    const query = `query {
      hello
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//query/${ANON_PLACEHOLDER}/hello`)
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
  name: 'named query, single level, should use query name',
  async fn(t) {
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'HeyThere'
    const query = `query ${expectedName} {
      hello
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//query/${expectedName}/hello`)
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
  name: 'Federated Server health check query with only __typename in selection set should omit deepest unique path',
  async fn(t) {
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = '__ApolloServiceHealthCheck__'
    const query = `query ${expectedName} { __typename }`

    helper.agent.once('transactionFinished', (transaction) => {
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//query/${expectedName}`)
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
  name: 'Nested queries with arguments',
  async fn(t) {
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
    const { promise, resolve } = promiseResolvers()

    const query = `query {
      library(branch: "riverside") {
        magazines {
          title
        },
        books(category: NOVEL) {
          title
        }
      }
    }`

    const path = 'library'

    helper.agent.once('transactionFinished', (transaction) => {
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//query/${ANON_PLACEHOLDER}/${path}`)
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
  name: 'anonymous query, multi-level should return deepest unique path',
  async fn(t) {
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
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
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//query/${ANON_PLACEHOLDER}/${path}`)
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
  name: 'anonymous query, only returns reserved field(id) should return deepest unique path',
  async fn(t) {
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
    const { promise, resolve } = promiseResolvers()

    const query = `query {
        searchCollection(title: "True life") {
          id
        }
      }`

    helper.agent.once('transactionFinished', (transaction) => {
      assert.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${ANON_PLACEHOLDER}/searchCollection`
      )
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
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
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
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//query/${expectedName}/${path}`)
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
  name: 'named query, multi-level with aliases should ignore aliases in naming',
  async fn(t) {
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'GetBooksByLibrary'
    const query = `query ${expectedName} {
      libAlias: libraries {
        bookAlias: books {
          title
          author {
            name
          }
        }
      }
    }`

    const path = 'libraries.books'

    helper.agent.once('transactionFinished', (transaction) => {
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//query/${expectedName}/${path}`)
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
  name: 'anonymous mutation, single level, reserved field, should use anonymous placeholder',
  async fn(t) {
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
    const { promise, resolve } = promiseResolvers()

    const query = `mutation {
        addToCollection(title: "Don Quixote") {
          id
        }
      }`

    helper.agent.once('transactionFinished', (transaction) => {
      assert.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//mutation/${ANON_PLACEHOLDER}/addToCollection`
      )
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
  name: 'anonymous mutation, single level, should use anonymous placeholder',
  async fn(t) {
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
    const { promise, resolve } = promiseResolvers()

    const query = `mutation {
      addThing(name: "added thing!")
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//mutation/${ANON_PLACEHOLDER}/addThing`)
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
  name: 'named mutation, single level, reserved field, should use mutation name',
  async fn(t) {
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'addIt'
    const query = `mutation ${expectedName} {
      addToCollection(title: "Don Quixote") {
        id
      }
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//mutation/${expectedName}/addToCollection`)
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
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'AddThing'
    const query = `mutation ${expectedName} {
      addThing(name: "added thing!")
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//mutation/${expectedName}/addThing`)
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
  name: 'anonymous query, with params, should use anonymous placeholder',
  async fn(t) {
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
    const { promise, resolve } = promiseResolvers()

    const query = `query {
      paramQuery(blah: "blah", blee: "blee")
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//query/${ANON_PLACEHOLDER}/paramQuery`)
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
  name: 'named query, with params, should use query name',
  async fn(t) {
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'BlahQuery'
    const query = `query ${expectedName} {
      paramQuery(blah: "blah")
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//query/${expectedName}/paramQuery`)
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
  name: 'named query, with params, should return deepest unique path',
  async fn(t) {
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
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
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//query/${expectedName}/${path}`)
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
  name: 'batch query should include "batch" all queries separated by delimeter',
  async fn(t) {
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
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
      const expectedQuery1Name = `query/${expectedName1}/${path1}`
      const expectedQuery2Name = `mutation/${ANON_PLACEHOLDER}/addThing`
      assert.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//batch/${expectedQuery1Name}/${expectedQuery2Name}`
      )
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
  name: 'union, should return deepest unique path',
  async fn(t) {
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
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
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//query/${expectedName}/${deepestPath}`)
    })

    const expectedResult = [
      {
        __typename: 'Book',
        title: "Ollies for O11y: A Sk8er's Guide to Observability"
      }
    ]
    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      assert.deepStrictEqual(
        result.data.search,
        expectedResult,
        'should return expected results with union search query'
      )
      checkResult(assert, result, () => {
        resolve()
      })
    })

    await promise
  }
})

tests.push({
  name: 'union, multiple inline fragments, should return deepest unique path',
  async fn(t) {
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
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
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//query/${expectedName}/${deepestPath}`)
    })

    const expectedResult = [
      { __typename: 'Book', title: 'Node Agent: The Book' },
      { __typename: 'Magazine', title: 'Node Weekly' }
    ]
    executeQuery(serverUrl, query, (err, result) => {
      assert.deepStrictEqual(
        result.data.search,
        expectedResult,
        'should return expected results with union search query'
      )
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
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
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
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//query/${expectedName}/${path}`)
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
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
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
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//query/${expectedName}/${path}`)
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'if the query cannot be parsed, should be named /*',
  async fn(t) {
    // there will be no document/AST nor resolved operation
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
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
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//*`)
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
  name: 'anonymous query, when cant validate, should use document/AST',
  async fn(t) {
    // if parse succeeds but validation fails, there will not be a resolved operation
    // but the document/AST can still be leveraged for what was intended.
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
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
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//query/${ANON_PLACEHOLDER}/${path}`)
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

tests.push({
  name: 'named query, when cant validate, should use document/AST',
  async fn(t) {
    // if parse succeeds but validation fails, there will not be a resolved operation
    // but the document/AST can still be leveraged for what was intended.
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'FailsToValidate'
    const invalidQuery = `query ${expectedName} {
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
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//query/${expectedName}/${path}`)
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

tests.push({
  name: 'multiple queries do not affect transaction naming',
  async fn(t) {
    const { helper, serverUrl, EXPECTED_PREFIX } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'HeyThere'
    const query = `query ${expectedName} {
      hello
    }`
    let count = 0

    const transactionHandler = (transaction) => {
      assert.equal(transaction.name, `${EXPECTED_PREFIX}//query/${expectedName}/hello`)
      count++
    }

    helper.agent.on('transactionFinished', transactionHandler)
    t.after(() => {
      helper.agent.removeListener('transactionFinished', transactionHandler)
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(assert, result, () => {
        executeQuery(serverUrl, query, (err2, result2) => {
          assert.ifError(err2)
          checkResult(assert, result2, () => {
            assert.equal(count, 2, 'should have checked 2 transactions')
            resolve()
          })
        })
      })
    })

    await promise
  }
})

module.exports = {
  tests,
  suiteName: 'transaction naming'
}
