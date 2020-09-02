/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const tap = require('tap')
const { ApolloServer } = require('apollo-server')

const utils = require('@newrelic/test-utilities')
const { typeDefs, resolvers } = require('../data-definitions')
const { executeQuery, executeQueryBatch } = require('../test-client')

const ANON_PLACEHOLDER = '<anonymous>'

tap.test('apollo-server', (t) => {
  t.autoend()

  let server = null
  let serverUrl = null
  let helper = null

  t.beforeEach((done) => {
    // load default instrumentation. express being critical
    helper = utils.TestAgent.makeInstrumented()
    const createPlugin = require('../../../lib/create-plugin')
    const nrApi = helper.getAgentApi()

    // TODO: eventually use proper function for instrumenting and not .shim
    const plugin = createPlugin(nrApi.shim)

    server = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [plugin]
    })

    server.listen().then(({ url }) => {
      serverUrl = url
      done()
    })
  })

  t.afterEach((done) => {
    server.stop()

    helper.unload()
    server = null
    serverUrl = null
    helper = null

    done()
  })

  t.test('anonymous query, single level, should use anonymous placeholder', (t) => {
    const query = `query {
      hello
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `WebTransaction/apollo-server/query ${ANON_PLACEHOLDER} hello`
      )
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named query, single level, should use query name', (t) => {
    const expectedName = 'HeyThere'
    const query = `query ${expectedName} {
      hello
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `WebTransaction/apollo-server/query ${expectedName} hello`
      )
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('anonymous query, multi-level should return longest path', (t) => {
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

    const longestPath = 'libraries.books.author.name'

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `WebTransaction/apollo-server/query ${ANON_PLACEHOLDER} ${longestPath}`
      )
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named query, multi-level should return longest path', (t) => {
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

    const longestPath = 'libraries.books.author.name'

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `WebTransaction/apollo-server/query ${expectedName} ${longestPath}`
      )
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named query, multi-level, should choose *first* deepest-path', (t) => {
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
    const firstLongestPath = 'libraries.books.title'

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `WebTransaction/apollo-server/query ${expectedName} ${firstLongestPath}`
      )
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('anonymous mutation, single level, should use anonymous placeholder', (t) => {
    const query = `mutation {
      addThing(name: "added thing!")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `WebTransaction/apollo-server/mutation ${ANON_PLACEHOLDER} addThing`
      )
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named mutation, single level, should use mutation name', (t) => {
    const expectedName = 'AddThing'
    const query = `mutation ${expectedName} {
      addThing(name: "added thing!")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `WebTransaction/apollo-server/mutation ${expectedName} addThing`
      )
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('anonymous query, with params, should use anonymous placeholder', (t) => {
    const query = `query {
      paramQuery(blah: "blah", blee: "blee")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `WebTransaction/apollo-server/query ${ANON_PLACEHOLDER} paramQuery`
      )
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named query, with params, should use query name', (t) => {
    const expectedName = 'BlahQuery'
    const query = `query ${expectedName} {
      paramQuery(blah: "blah")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `WebTransaction/apollo-server/query ${expectedName} paramQuery`
      )
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named query, with params, should return longest path', (t) => {
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

    const longestPath = 'library.books.author.name'

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `WebTransaction/apollo-server/query ${expectedName} ${longestPath}`
      )
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('batch query should include "batch" all queries separated by delimeter', (t) => {
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

    const longestPath1 = 'library.books.author.name'

    const queries = [query1, query2]

    helper.agent.on('transactionFinished', (transaction) => {
      const expectedQuery1Name = `query ${expectedName1} ${longestPath1}`
      const expectedQuery2Name = `mutation ${ANON_PLACEHOLDER} addThing`
      t.equal(
        transaction.name,
        `WebTransaction/apollo-server/batch/${expectedQuery1Name}/${expectedQuery2Name}`
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

  // there will be no document/AST nor resolved operation
  t.test('if the query cannot be parsed, should be named ????', (t) => {
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
      t.equal(
        transaction.name,
        'WebTransaction/apollo-server/*'
      )
    })

    executeQuery(serverUrl, invalidQuery, (err, result) => {
      t.error(err)

      t.ok(result)
      t.ok(result.errors)
      t.equal(result.errors.length, 1) // should have one parsing error

      const [parseError] = result.errors
      t.equal(parseError.extensions.code, 'GRAPHQL_PARSE_FAILED')

      t.end()
    })
  })

  // if parse succeeds but validation fails, there will not be a resolved operation
  // but the document/AST can still be leveraged for what was intended.
  t.test('if cannot validate, should use document/AST for intended longest path', (t) => {
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

    const longestPath = 'libraries.books.doesnotexist.name'

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.name,
        `WebTransaction/apollo-server/query ${ANON_PLACEHOLDER} ${longestPath}`
      )
    })

    executeQuery(serverUrl, invalidQuery, (err, result) => {
      t.error(err)

      t.ok(result)
      t.ok(result.errors)
      t.equal(result.errors.length, 1) // should have one parsing error

      const [parseError] = result.errors
      t.equal(parseError.extensions.code, 'GRAPHQL_VALIDATION_FAILED')

      t.end()
    })
  })
})

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
