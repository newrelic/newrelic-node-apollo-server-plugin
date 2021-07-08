/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { executeQueryWithLambdaHandler, executeBatchQueriesWithLambdaHandler }
  = require('./lambda-test-utils')

const ANON_PLACEHOLDER = '<anonymous>'
const UNKNOWN_OPERATION = '<unknown>'

const OPERATION_PREFIX = 'GraphQL/operation/ApolloServer'
const RESOLVE_PREFIX = 'GraphQL/resolve/ApolloServer'

const { setupApolloServerLambdaTests } = require('./apollo-server-lambda-setup')
const { checkResult } = require('../common')

setupApolloServerLambdaTests({
  suiteName: 'lambda segments',
  createTests: createLambdaSegmentsTests,
  pluginConfig: {
    captureScalars: true
  }
})

function createLambdaSegmentsTests(t, frameworkName) {
  const TRANSACTION_PREFIX = `WebTransaction/${frameworkName}`

  t.test('anonymous query, single level', async (t) => {
    const { helper, patchedHandler, stubContext } = t.context

    const query = `query {
      hello
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      const operationPart = `query/${ANON_PLACEHOLDER}/hello`
      const expectedSegments = [{
        name: `${TRANSACTION_PREFIX}//${operationPart}`,
        children: [{
          name: `${OPERATION_PREFIX}/${operationPart}`,
          children: [{
            name: `${RESOLVE_PREFIX}/hello`
          }]
        }]
      }]
      t.segments(transaction.trace.root, expectedSegments)
    })

    const result = await executeQueryWithLambdaHandler(patchedHandler, query, stubContext)
    // TODO: request is failing with 400, invalid post body
    checkResult(t, result, () => {
      t.end()
    })
  })

  t.test('named query, single level', (t) => {
    const { helper, patchedHandler, stubContext } = t.context

    const expectedName = 'HeyThere'
    const query = `query ${expectedName} {
      hello
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      const operationPart = `query/${expectedName}/hello`
      const expectedSegments = [{
        name: `${TRANSACTION_PREFIX}//${operationPart}`,
        children: [{
          name: `${OPERATION_PREFIX}/${operationPart}`,
          children: [{
            name: `${RESOLVE_PREFIX}/hello`
          }]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeQueryWithLambdaHandler(patchedHandler, query, stubContext, (err, result) => {
      t.error(err)

      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('anonymous query, multi-level', (t) => {
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
      const operationPart = `query/${ANON_PLACEHOLDER}/${deepestPath}`
      const expectedSegments = [{
        name: `${TRANSACTION_PREFIX}//${operationPart}`,
        children: [{
          name: `${OPERATION_PREFIX}/${operationPart}`,
          children: [
            { name: `${RESOLVE_PREFIX}/libraries` },
            { name: `${RESOLVE_PREFIX}/libraries.books` },
            { name: `${RESOLVE_PREFIX}/libraries.books.author` },
            { name: `${RESOLVE_PREFIX}/libraries.books.author.name` }
          ]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
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
      const operationPart = `query/${expectedName}/${deepestPath}`
      const expectedSegments = [{
        name: `${TRANSACTION_PREFIX}//${operationPart}`,
        children: [{
          name: `${OPERATION_PREFIX}/${operationPart}`,
          children: [
            { name: `${RESOLVE_PREFIX}/libraries` },
            { name: `${RESOLVE_PREFIX}/libraries.books` },
            { name: `${RESOLVE_PREFIX}/libraries.books.title` },
            { name: `${RESOLVE_PREFIX}/libraries.books.author` },
            { name: `${RESOLVE_PREFIX}/libraries.books.author.name` }
          ]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
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
      const operationPart = `query/${expectedName}/${firstDeepestPath}`
      const expectedSegments = [{
        name: `${TRANSACTION_PREFIX}//${operationPart}`,
          children: [{
            name: `${OPERATION_PREFIX}/${operationPart}`,
            children: [
              { name: `${RESOLVE_PREFIX}/libraries` },
              { name: `${RESOLVE_PREFIX}/libraries.books` },
              { name: `${RESOLVE_PREFIX}/libraries.books.title` },
              { name: `${RESOLVE_PREFIX}/libraries.books.isbn` }
            ]
          }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeQueryWithLambdaHandler(patchedHandler, query, stubContext, (err, result) => {
      t.error(err)

      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('anonymous mutation, single level', (t) => {
    const { helper, patchedHandler, stubContext } = t.context

    const query = `mutation {
      addThing(name: "added thing!")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      const operationPart = `mutation/${ANON_PLACEHOLDER}/addThing`
      const expectedSegments = [{
        name: `${TRANSACTION_PREFIX}//${operationPart}`,
        children: [{
          name: `${OPERATION_PREFIX}/${operationPart}`,
          children: [{
            name: `${RESOLVE_PREFIX}/addThing`,
            children: [{
              name: 'timers.setTimeout',
              children: [{
                name: 'Callback: namedCallback'
              }]
            }]
          }]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
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
      const operationPart = `mutation/${expectedName}/addThing`
      const expectedSegments = [{
        name: `${TRANSACTION_PREFIX}//${operationPart}`,
        children: [{
          name: `${OPERATION_PREFIX}/${operationPart}`,
          children: [{
            name: `${RESOLVE_PREFIX}/addThing`,
            children: [{
              name: 'timers.setTimeout',
              children: [{
                name: 'Callback: namedCallback'
              }]
            }]
          }]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeQueryWithLambdaHandler(patchedHandler, query, stubContext, (err, result) => {
      t.error(err)

      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('anonymous query, with params', (t) => {
    const { helper, patchedHandler, stubContext } = t.context

    const query = `query {
      paramQuery(blah: "blah", blee: "blee")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      const operationPart = `query/${ANON_PLACEHOLDER}/paramQuery`
      const expectedSegments = [{
        name: `${TRANSACTION_PREFIX}//${operationPart}`,
        children: [{
          name: `${OPERATION_PREFIX}/${operationPart}`,
          children: [
            { name: `${RESOLVE_PREFIX}/paramQuery` }
          ]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeQueryWithLambdaHandler(patchedHandler, query, stubContext, (err, result) => {
      t.error(err)

      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named query, with params', (t) => {
    const { helper, patchedHandler, stubContext } = t.context

    const expectedName = 'BlahQuery'
    const query = `query ${expectedName} {
      paramQuery(blah: "blah")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      const operationPart = `query/${expectedName}/paramQuery`
      const expectedSegments = [{
        name: `${TRANSACTION_PREFIX}//${operationPart}`,
        children: [{
          name: `${OPERATION_PREFIX}/${operationPart}`,
          children: [
            { name: `${RESOLVE_PREFIX}/paramQuery` }
          ]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeQueryWithLambdaHandler(patchedHandler, query, stubContext, (err, result) => {
      t.error(err)

      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named query, with params, multi-level', (t) => {
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
      const operationPart = `query/${expectedName}/${deepestPath}`
      const expectedSegments = [{
        name: `${TRANSACTION_PREFIX}//${operationPart}`,
        children: [{
          name: `${OPERATION_PREFIX}/${operationPart}`,
          children: [
            {
              name: `${RESOLVE_PREFIX}/library`,
              children: [{
                name: 'timers.setTimeout',
                children: [{
                  name: 'Callback: <anonymous>'
                }]
              }]
            },
            { name: `${RESOLVE_PREFIX}/library.books` },
            { name: `${RESOLVE_PREFIX}/library.books.title` },
            { name: `${RESOLVE_PREFIX}/library.books.author` },
            { name: `${RESOLVE_PREFIX}/library.books.author.name` }
          ]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeQueryWithLambdaHandler(patchedHandler, query, stubContext, (err, result) => {
      t.error(err)

      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('batch query should include segments for nested queries', (t) => {
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

    const deepestPath1 = 'library.books.author.name'

    const queries = [query1, query2]

    helper.agent.on('transactionFinished', (transaction) => {
      const operationPart1 = `query/${expectedName1}/${deepestPath1}`
      const expectedQuery1Name = `${operationPart1}`
      const operationPart2 = `mutation/${ANON_PLACEHOLDER}/addThing`
      const expectedQuery2Name = `${operationPart2}`

      const batchTransactionPrefix = `${TRANSACTION_PREFIX}//batch`

      const expectedSegments = [{
        name: `${batchTransactionPrefix}/${expectedQuery1Name}/${expectedQuery2Name}`,
        children: [
          {
            name: `${OPERATION_PREFIX}/${operationPart1}`,
            children: [
              {
                name: `${RESOLVE_PREFIX}/library`,
                children: [{
                  name: 'timers.setTimeout',
                  children: [{
                    name: 'Callback: <anonymous>'
                  }]
                }]
              },
              { name: `${RESOLVE_PREFIX}/library.books` },
              { name: `${RESOLVE_PREFIX}/library.books.title` },
              { name: `${RESOLVE_PREFIX}/library.books.author` },
              { name: `${RESOLVE_PREFIX}/library.books.author.name` }
            ]
          },
          {
            name: `${OPERATION_PREFIX}/${operationPart2}`,
            children: [{
              name: `${RESOLVE_PREFIX}/addThing`,
              children: [{
                name: 'timers.setTimeout',
                children: [{
                  name: 'Callback: namedCallback'
                }]
              }]
            }]
          }
        ]
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeBatchQueriesWithLambdaHandler
    (patchedHandler, queries, stubContext, (err, result) => {
      t.error(err)

      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  // there will be no document/AST nor resolved operation
  t.test('when the query cannot be parsed, should have operation placeholder', (t) => {
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
      const expectedSegments = [{
        name: `${TRANSACTION_PREFIX}//*`,
        children: [{
          name: `${OPERATION_PREFIX}/${UNKNOWN_OPERATION}`
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
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
  t.test('when cannot validate, should include operation segment', (t) => {
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
      const operationPart = `query/${ANON_PLACEHOLDER}/${deepestPath}`
      const expectedSegments = [{
        name: `${TRANSACTION_PREFIX}//${operationPart}`,
        children: [{
          name: `${OPERATION_PREFIX}/${operationPart}`
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
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

