/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const tap = require('tap')

const utils = require('@newrelic/test-utilities')
utils.assert.extendTap(tap)

const { getTypeDefs, resolvers } = require('../data-definitions')
const { executeQuery, executeQueryBatch } = require('../test-client')
const ANON_PLACEHOLDER = '<anonymous>'

tap.test('apollo-server: segments', (t) => {
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

    // Do after instrumentation to ensure express isn't loaded too soon.
    const { ApolloServer, gql } = require('apollo-server')
    server = new ApolloServer({
      typeDefs: getTypeDefs(gql),
      resolvers,
      plugins: [plugin]
    })

    server.listen().then(({ url }) => {
      serverUrl = url

      t.context.helper = helper
      t.context.serverUrl = serverUrl
      done()
    })
  })

  t.afterEach((done) => {
    server.stop()

    helper.unload()
    server = null
    serverUrl = null
    helper = null

    clearCachedModules(['express', 'apollo-server'], () => {
      done()
    })
  })

  t.test('batch query should include segments for nested queries', (t) => {
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
      const operationPart1 = `query ${expectedName1}`
      const expectedQuery1Name = `${operationPart1} ${longestPath1}`
      const operationPart2 = `mutation ${ANON_PLACEHOLDER}`
      const expectedQuery2Name = `${operationPart2} addThing`

      const batchTransactionPrefix = 'WebTransaction/apollo-server/batch'

      const expectedSegments = [{
        name: `${batchTransactionPrefix}/${expectedQuery1Name}/${expectedQuery2Name}`,
        children: [{
          name: 'Nodejs/Middleware/Hapi/handler//gql',
          children: [
            {
              name: operationPart1,
              children: [
                {
                  name: 'resolve: library',
                  children: [{
                    name: 'timers.setTimeout',
                    children: [{
                      name: 'Callback: <anonymous>'
                    }]
                  }]
                },
                { name: 'resolve: library.books' },
                { name: 'resolve: library.books.title'},
                { name: 'resolve: library.books.author' },
                { name: 'resolve: library.books.author.name' }
              ]
            },
            {
              name: operationPart2,
              children: [{
                name: 'resolve: addThing',
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
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeQueryBatch(serverUrl, queries, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.equal(result.length, 2)

        t.end()
      })
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

function clearCachedModules(modules, callback) {
  modules.forEach((moduleName) => {
    const requirePath = require.resolve(moduleName)
    delete require.cache[requirePath]
  })

  callback()
}
