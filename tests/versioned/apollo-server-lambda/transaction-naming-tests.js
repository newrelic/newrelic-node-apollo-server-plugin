/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { executeQueryWithLambdaHandler, executeBatchQueriesWithLambdaHandler }
  = require('./lambda-test-utils')

const ANON_PLACEHOLDER = '<anonymous>'

const { setupApolloServerLambdaTests } = require('./apollo-server-lambda-setup')

setupApolloServerLambdaTests({
  suiteName: 'lambda transaction naming',
  createTests: createTransactionTests,
  pluginConfig: {
    captureScalars: true
  }
})

/**
 * Creates a set of standard transction tests to run against various
 * apollo-server libraries.
 * It is required that t.context.helper and t.context.serverUrl are set.
 * @param {*} t a tap test instance
 */
function createTransactionTests(t, frameworkName) {
  const EXPECTED_PREFIX = `WebTransaction/${frameworkName}`

  t.test('anonymous query, single level, should use anonymous placeholder', (t) => {
    const { helper, patchedHandler, stubContext } = t.context

    const query = `query {
      hello
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${ANON_PLACEHOLDER}/hello`
      )
    })

    executeQueryWithLambdaHandler(patchedHandler, query, stubContext, (err, result) => {
      t.error(err)

      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named query, single level, should use query name', (t) => {
    const { helper, patchedHandler, stubContext } = t.context

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

    executeQueryWithLambdaHandler(patchedHandler, query, stubContext, (err, result) => {
      t.error(err)

      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('anonymous query, multi-level should return deepest path', (t) => {
    const { helper, patchedHandler, stubContext } = t.context

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

    const deepestPath = 'libraries.books.author.name'

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${ANON_PLACEHOLDER}/${deepestPath}`
      )
    })

    executeQueryWithLambdaHandler(patchedHandler, query, stubContext, (err, result) => {
      t.error(err)

      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named query, multi-level should return deepest path', (t) => {
    const { helper, patchedHandler, stubContext } = t.context

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

    const deepestPath = 'libraries.books.author.name'

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${expectedName}/${deepestPath}`
      )
    })

    executeQueryWithLambdaHandler(patchedHandler, query, stubContext, (err, result) => {
      t.error(err)

      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named query, multi-level, should choose *first* deepest-path', (t) => {
    const { helper, patchedHandler, stubContext } = t.context

    const expectedName = 'GetBooksByLibrary'
    const query = `query ${expectedName} {
      libraries {
        books {
          title
          isbn
        }
      }
    }`

    // .isbn is the same length but title will be first so that path should be used
    const firstDeepestPath = 'libraries.books.title'

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${expectedName}/${firstDeepestPath}`
      )
    })

    executeQueryWithLambdaHandler(patchedHandler, query, stubContext, (err, result) => {
      t.error(err)

      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('anonymous mutation, single level, should use anonymous placeholder', (t) => {
    const { helper, patchedHandler, stubContext } = t.context

    const query = `mutation {
      addThing(name: "added thing!")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//mutation/${ANON_PLACEHOLDER}/addThing`
      )
    })

    executeQueryWithLambdaHandler(patchedHandler, query, stubContext, (err, result) => {
      t.error(err)

      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named mutation, single level, should use mutation name', (t) => {
    const { helper, patchedHandler, stubContext } = t.context

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

    executeQueryWithLambdaHandler(patchedHandler, query, stubContext, (err, result) => {
      t.error(err)

      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('anonymous query, with params, should use anonymous placeholder', (t) => {
    const { helper, patchedHandler, stubContext } = t.context

    const query = `query {
      paramQuery(blah: "blah", blee: "blee")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${ANON_PLACEHOLDER}/paramQuery`
      )
    })

    executeQueryWithLambdaHandler(patchedHandler, query, stubContext, (err, result) => {
      t.error(err)

      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named query, with params, should use query name', (t) => {
    const { helper, patchedHandler, stubContext } = t.context

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

    executeQueryWithLambdaHandler(patchedHandler, query, stubContext, (err, result) => {
      t.error(err)

      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named query, with params, should return deepest path', (t) => {
    const { helper, patchedHandler, stubContext } = t.context

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

    const deepestPath = 'library.books.author.name'

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${expectedName}/${deepestPath}`
      )
    })

    executeQueryWithLambdaHandler(patchedHandler, query, stubContext, (err, result) => {
      t.error(err)

      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('batch query should include "batch" all queries separated by delimeter', (t) => {
    const { helper, patchedHandler, stubContext } = t.context

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

    const DeepestPath1 = 'library.books.author.name'

    const queries = [query1, query2]

    helper.agent.on('transactionFinished', (transaction) => {
      const expectedQuery1Name = `query/${expectedName1}/${DeepestPath1}`
      const expectedQuery2Name = `mutation/${ANON_PLACEHOLDER}/addThing`
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//batch/${expectedQuery1Name}/${expectedQuery2Name}`
      )
    })

    executeBatchQueriesWithLambdaHandler
    (patchedHandler, queries, stubContext, (err, result) => {
      t.error(err)

      t.ok(result.body)

      const jsonResult = JSON.parse(result.body)

      checkResult(t, jsonResult, () => {
        t.equal(jsonResult.length, 2)

        t.end()
      })
    })
  })

  // there will be no document/AST nor resolved operation
  t.test('if the query cannot be parsed, should be named /*', (t) => {
    const { helper, patchedHandler, stubContext } = t.context

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

    executeQueryWithLambdaHandler
    (patchedHandler, invalidQuery, stubContext, (err, result) => {
      t.error(err)

      t.ok(result.body)

      const jsonResult = JSON.parse(result.body)

      t.ok(jsonResult)

      t.ok(jsonResult.errors)
      t.equal(jsonResult.errors.length, 1) // should have one parsing error

      const [parseError] = jsonResult.errors
      t.equal(parseError.extensions.code, 'GRAPHQL_PARSE_FAILED')

      t.end()
    })
  })

  // if parse succeeds but validation fails, there will not be a resolved operation
  // but the document/AST can still be leveraged for what was intended.
  t.test('anonymous query, when cant validate, should use document/AST', (t) => {
    const { helper, patchedHandler, stubContext } = t.context

    const invalidQuery = `query {
      libraries {
        books {
          title
          doesnotexist {
            name
          }
        }
      }
    }`

    const deepestPath = 'libraries.books.doesnotexist.name'

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${ANON_PLACEHOLDER}/${deepestPath}`
      )
    })

    executeQueryWithLambdaHandler
    (patchedHandler, invalidQuery, stubContext, (err, result) => {
      t.error(err)

      t.ok(result.body)

      const jsonResult = JSON.parse(result.body)

      t.ok(jsonResult)

      t.ok(jsonResult.errors)
      t.equal(jsonResult.errors.length, 1) // should have one parsing error

      const [parseError] = jsonResult.errors
      t.equal(parseError.extensions.code, 'GRAPHQL_VALIDATION_FAILED')

      t.end()
    })
  })

  // if parse succeeds but validation fails, there will not be a resolved operation
  // but the document/AST can still be leveraged for what was intended.
  t.test('named query, when cant validate, should use document/AST', (t) => {
    const { helper, patchedHandler, stubContext } = t.context

    const expectedName = 'FailsToValidate'
    const invalidQuery = `query ${expectedName} {
      libraries {
        books {
          title
          doesnotexist {
            name
          }
        }
      }
    }`

    const deepestPath = 'libraries.books.doesnotexist.name'

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `${EXPECTED_PREFIX}//query/${expectedName}/${deepestPath}`
      )
    })

    executeQueryWithLambdaHandler
    (patchedHandler, invalidQuery, stubContext, (err, result) => {
      t.error(err)

      t.ok(result.body)

      const jsonResult = JSON.parse(result.body)

      t.ok(jsonResult)

      t.ok(jsonResult.errors)
      t.equal(jsonResult.errors.length, 1) // should have one parsing error

      const [parseError] = jsonResult.errors
      t.equal(parseError.extensions.code, 'GRAPHQL_VALIDATION_FAILED')

      t.end()
    })
  })
}

/**
 * Verify we didn't break anything outright and
 * test is setup correctly for functioning calls.
 */
function checkResult(t, result, callback) {
  t.ok(result)

  if (result.errors) {
    result.errors.forEach((error) => {
      t.error(error)
    })
  }

  setImmediate(callback)
}

module.exports = {
  suiteName: 'transaction naming',
  createTests: createTransactionTests
}
