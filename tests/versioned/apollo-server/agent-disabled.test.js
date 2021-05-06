/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const tap = require('tap')
const { ApolloServer, gql } = require('apollo-server')

const { getTypeDefs, resolvers } = require('../../data-definitions')
const { executeQuery } = require('../../test-client')

// This is a versioned test to ensure this approach continues to
// work with future versions of Apollo Server's plugin execution.
tap.test('Agent disabled', (t) => {
  t.autoend()

  let server = null
  let serverUrl = null

  t.beforeEach(() => {
    const createPlugin = require('../../../lib/create-plugin')

    // when the agent is disabled, the agent API will be a no-op API
    const plugin = createPlugin()

    server = new ApolloServer({
      typeDefs: getTypeDefs(gql),
      resolvers,
      plugins: [plugin]
    })

    return server.listen().then(({ url }) => {
      serverUrl = url
    })
  })

  t.afterEach(() => {
    server.stop()

    server = null
    serverUrl = null
  })


  t.test('should not break existing functionality', (t) => {
    const query = `query {
      hello
    }`

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)

      t.ok(result)
      t.deepEqual(result.data, { hello: 'hello world' })

      if (result.errors) {
        result.errors.forEach((error) => {
          t.error(error)
        })
      }

      t.end()
    })
  })
})
