/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const {
  executeBatchAssertResult,
  executeQueryAssertResult,
  executeQueryAssertErrors
} = require('./lambda-test-utils')

const ANON_PLACEHOLDER = '<anonymous>'

const { setupApolloServerLambdaTests } = require('./apollo-server-lambda-setup')

setupApolloServerLambdaTests({
  suiteName: 'lambda transaction naming',
  createTests: createTransactionTests,
  pluginConfig: {
    captureScalars: true
  }
})

function createTransactionTests(t, frameworkName) {
  const EXPECTED_PREFIX = `WebTransaction/${frameworkName}`

  t.test('anonymous query, single level, should use anonymous placeholder', (t) => {
    const { helper, patchedHandler, stubContext, modVersion } = t.context

    const query = `query {
      hello
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${ANON_PLACEHOLDER}/hello`
      )
    })

    executeQueryAssertResult({
      handler: patchedHandler,
      query,
      context: stubContext,
      modVersion,
      t
    })
  })

  t.test('named query, single level, should use query name', (t) => {
    const { helper, patchedHandler, stubContext, modVersion } = t.context

    const expectedName = 'HeyThere'
    const query = `query ${expectedName} {
      hello
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${expectedName}/hello`
      )
    })

    executeQueryAssertResult({
      handler: patchedHandler,
      query,
      context: stubContext,
      modVersion,
      t
    })
  })

  t.test('anonymous query, multi-level should return deepest unique path', (t) => {
    const { helper, patchedHandler, stubContext, modVersion } = t.context

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

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${ANON_PLACEHOLDER}/${path}`
      )
    })

    executeQueryAssertResult({
      handler: patchedHandler,
      query,
      context: stubContext,
      modVersion,
      t
    })
  })

  t.test('named query, multi-level should return deepest unique path', (t) => {
    const { helper, patchedHandler, stubContext, modVersion } = t.context

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

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${expectedName}/${path}`
      )
    })

    executeQueryAssertResult({
      handler: patchedHandler,
      query,
      context: stubContext,
      modVersion,
      t
    })
  })

  t.test('anonymous mutation, single level, should use anonymous placeholder', (t) => {
    const { helper, patchedHandler, stubContext, modVersion } = t.context

    const query = `mutation {
      addThing(name: "added thing!")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//mutation/${ANON_PLACEHOLDER}/addThing`
      )
    })

    executeQueryAssertResult({
      handler: patchedHandler,
      query,
      context: stubContext,
      modVersion,
      t
    })
  })

  t.test('named mutation, single level, should use mutation name', (t) => {
    const { helper, patchedHandler, stubContext, modVersion } = t.context

    const expectedName = 'AddThing'
    const query = `mutation ${expectedName} {
      addThing(name: "added thing!")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//mutation/${expectedName}/addThing`
      )
    })

    executeQueryAssertResult({
      handler: patchedHandler,
      query,
      context: stubContext,
      modVersion,
      t
    })
  })

  t.test('anonymous query, with params, should use anonymous placeholder', (t) => {
    const { helper, patchedHandler, stubContext, modVersion } = t.context

    const query = `query {
      paramQuery(blah: "blah", blee: "blee")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${ANON_PLACEHOLDER}/paramQuery`
      )
    })

    executeQueryAssertResult({
      handler: patchedHandler,
      query,
      context: stubContext,
      modVersion,
      t
    })
  })

  t.test('named query, with params, should use query name', (t) => {
    const { helper, patchedHandler, stubContext, modVersion } = t.context

    const expectedName = 'BlahQuery'
    const query = `query ${expectedName} {
      paramQuery(blah: "blah")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${expectedName}/paramQuery`
      )
    })

    executeQueryAssertResult({
      handler: patchedHandler,
      query,
      context: stubContext,
      modVersion,
      t
    })
  })

  t.test('named query, with params, should return deepest unique path', (t) => {
    const { helper, patchedHandler, stubContext, modVersion } = t.context

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

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${expectedName}/${path}`
      )
    })

    executeQueryAssertResult({
      handler: patchedHandler,
      query,
      context: stubContext,
      modVersion,
      t
    })
  })

  t.test('batch query should include "batch" all queries separated by delimeter', (t) => {
    const { helper, patchedHandler, stubContext, modVersion } = t.context

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

    const path = 'library.books'

    const queries = [query1, query2]

    helper.agent.on('transactionFinished', (transaction) => {
      const expectedQuery1Name = `query/${expectedName1}/${path}`
      const expectedQuery2Name = `mutation/${ANON_PLACEHOLDER}/addThing`
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//batch/${expectedQuery1Name}/${expectedQuery2Name}`
      )
    })

    executeBatchAssertResult({
      handler: patchedHandler,
      queries,
      context: stubContext,
      modVersion,
      t
    })
  })

  t.test('union, should return deepest unique path', (t) => {
    const { helper, patchedHandler, stubContext, modVersion } = t.context

    const expectedName = 'GetSearchResults'
    const query = `query ${expectedName} {
      search(contains: "Ollies") {
        __typename
        ... on Book {
          title
        }
      }
    }`


    const deepestPath = 'search<Book>.title'
    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${expectedName}/${deepestPath}`
      )
    })

    executeQueryAssertResult({
      handler: patchedHandler,
      query,
      context: stubContext,
      modVersion,
      t
    })
  })

  t.test('union, multiple inline fragments, should return deepest unique path', (t) => {
    const { helper, patchedHandler, stubContext, modVersion } = t.context

    const expectedName = 'GetSearchResults'
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

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${expectedName}/${deepestPath}`
      )
    })

    executeQueryAssertResult({
      handler: patchedHandler,
      query,
      context: stubContext,
      modVersion,
      t
    })
  })

  // there will be no document/AST nor resolved operation
  t.test('if the query cannot be parsed, should be named /*', (t) => {
    const { helper, patchedHandler, stubContext, modVersion } = t.context

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

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(transaction.name, `${EXPECTED_PREFIX}//*`)
    })

    executeQueryAssertErrors({
      handler: patchedHandler,
      query: invalidQuery,
      context: stubContext,
      modVersion,
      t,
      code: 'GRAPHQL_PARSE_FAILED'
    })
  })

  // if parse succeeds but validation fails, there will not be a resolved operation
  // but the document/AST can still be leveraged for what was intended.
  t.test('anonymous query, when cant validate, should use document/AST', (t) => {
    const { helper, patchedHandler, stubContext, modVersion } = t.context

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

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${ANON_PLACEHOLDER}/${path}`
      )
    })

    executeQueryAssertErrors({
      handler: patchedHandler,
      query: invalidQuery,
      context: stubContext,
      modVersion,
      t,
      code: 'GRAPHQL_VALIDATION_FAILED'
    })
  })

  // if parse succeeds but validation fails, there will not be a resolved operation
  // but the document/AST can still be leveraged for what was intended.
  t.test('named query, when cant validate, should use document/AST', (t) => {
    const { helper, patchedHandler, stubContext, modVersion } = t.context

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

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${expectedName}/${path}`
      )
    })

    executeQueryAssertErrors({
      handler: patchedHandler,
      query: invalidQuery,
      context: stubContext,
      modVersion,
      t,
      code: 'GRAPHQL_VALIDATION_FAILED'
    })
  })
}
