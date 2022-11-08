/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { executeQuery } = require('../test-client')
const { setupEnvConfig } = require('../agent-testing')

const OPERATION_PREFIX = 'GraphQL/operation/ApolloServer'
const RESOLVE_PREFIX = 'GraphQL/resolve/ApolloServer'
const TRANSACTION_PREFIX = 'WebTransaction/Expressjs/POST'

const { setupApolloServerTests } = require('./apollo-server-setup')

setupApolloServerTests({
  suiteName: 'default',
  createTests: createNoScalarTests
})

setupApolloServerTests({
  suiteName: 'captureScalars: false',
  createTests: createNoScalarTests,
  pluginConfig: {
    captureScalars: false
  }
})

setupApolloServerTests({
  suiteName: 'captureScalars: true',
  createTests: createScalarTests,
  pluginConfig: {
    captureScalars: true
  }
})

function createNoScalarTests(t) {
  setupEnvConfig(t)

  t.test('multi-level, should not capture scalar fields', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName = 'GetAllForLibrary'
    const query = `query ${expectedName} {
      library(branch: "downtown") {
        books {
          title
          author {
            name
          }
        }
        magazines {
          title
          issue
        }
      }
    }`

    const path = 'library'

    helper.agent.once('transactionFinished', (transaction) => {
      const operationPart = `query/${expectedName}/${path}`
      const expectedSegments = [
        {
          name: `${TRANSACTION_PREFIX}//${operationPart}`,
          children: [
            { name: 'Nodejs/Middleware/Expressjs/query' },
            { name: 'Nodejs/Middleware/Expressjs/expressInit' },
            {
              name: 'Expressjs/Router: /',
              children: [
                { name: 'Nodejs/Middleware/Expressjs/corsMiddleware' },
                { name: 'Nodejs/Middleware/Expressjs/jsonParser' },
                {
                  name: 'Nodejs/Middleware/Expressjs/<anonymous>',
                  children: [
                    {
                      name: `${OPERATION_PREFIX}/${operationPart}`,
                      children: [
                        {
                          name: `${RESOLVE_PREFIX}/library`,
                          children: [
                            {
                              name: 'timers.setTimeout',
                              children: [
                                {
                                  name: 'Callback: <anonymous>'
                                }
                              ]
                            }
                          ]
                        },
                        { name: `${RESOLVE_PREFIX}/library.books` },
                        { name: `${RESOLVE_PREFIX}/library.books.author` },
                        { name: `${RESOLVE_PREFIX}/library.books.author` },
                        { name: `${RESOLVE_PREFIX}/library.magazines` }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]

      // Exact match to ensure no extra fields snuck in
      t.exactSegments(transaction.trace.root, expectedSegments)
    })

    executeQuery(serverUrl, query, (err) => {
      t.error(err)
      t.end()
    })
  })
}

function createScalarTests(t) {
  setupEnvConfig(t)

  t.test('multi-level, should capture scalar fields', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName = 'GetAllForLibrary'
    const query = `query ${expectedName} {
      library(branch: "downtown") {
        books {
          title
          author {
            name
          }
        }
        magazines {
          title
          issue
        }
      }
    }`

    const path = 'library'

    helper.agent.once('transactionFinished', (transaction) => {
      const operationPart = `query/${expectedName}/${path}`
      const expectedSegments = [
        {
          name: `${TRANSACTION_PREFIX}//${operationPart}`,
          children: [
            { name: 'Nodejs/Middleware/Expressjs/query' },
            { name: 'Nodejs/Middleware/Expressjs/expressInit' },
            {
              name: 'Expressjs/Router: /',
              children: [
                { name: 'Nodejs/Middleware/Expressjs/corsMiddleware' },
                { name: 'Nodejs/Middleware/Expressjs/jsonParser' },
                {
                  name: 'Nodejs/Middleware/Expressjs/<anonymous>',
                  children: [
                    {
                      name: `${OPERATION_PREFIX}/${operationPart}`,
                      children: [
                        {
                          name: `${RESOLVE_PREFIX}/library`,
                          children: [
                            {
                              name: 'timers.setTimeout',
                              children: [
                                {
                                  name: 'Callback: <anonymous>'
                                }
                              ]
                            }
                          ]
                        },
                        { name: `${RESOLVE_PREFIX}/library.books` },
                        { name: `${RESOLVE_PREFIX}/library.books.title` },
                        { name: `${RESOLVE_PREFIX}/library.books.author` },
                        { name: `${RESOLVE_PREFIX}/library.books.author.name` },
                        { name: `${RESOLVE_PREFIX}/library.books.title` },
                        { name: `${RESOLVE_PREFIX}/library.books.author` },
                        { name: `${RESOLVE_PREFIX}/library.books.author.name` },
                        { name: `${RESOLVE_PREFIX}/library.magazines` },
                        { name: `${RESOLVE_PREFIX}/library.magazines.title` },
                        { name: `${RESOLVE_PREFIX}/library.magazines.issue` }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]

      // Exact match to ensure no extra fields snuck in
      t.exactSegments(transaction.trace.root, expectedSegments)
    })

    executeQuery(serverUrl, query, (err) => {
      t.error(err)
      t.end()
    })
  })
}
