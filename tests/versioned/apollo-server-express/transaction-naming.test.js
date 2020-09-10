/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const tap = require('tap')
const { ApolloServer, gql } = require('apollo-server-express')

const utils = require('@newrelic/test-utilities')
const { getTypeDefs, resolvers } = require('../data-definitions')
const { createTransactionTests } = require('../transaction-tests')

tap.test('apollo-server-express', (t) => {
  t.autoend()

  let server = null
  let expressServer = null
  let serverUrl = null
  let helper = null

  t.beforeEach((done) => {
    // load default instrumentation. express being critical
    helper = utils.TestAgent.makeInstrumented()
    const createPlugin = require('../../../lib/create-plugin')
    const nrApi = helper.getAgentApi()

    // TODO: eventually use proper function for instrumenting and not .shim
    const plugin = createPlugin(nrApi.shim)

    const express = require('express')

    server = new ApolloServer({
      typeDefs: getTypeDefs(gql),
      resolvers,
      plugins: [plugin]
    })

    const app = express()
    server.applyMiddleware({ app })

    expressServer = app.listen(0, () => {
      serverUrl = `http://localhost:${expressServer.address().port}${server.graphqlPath}`

      t.context.helper = helper
      t.context.serverUrl = serverUrl
      done()
    })
  })

  t.afterEach((done) => {
    expressServer.close()
    server.stop()

    helper.unload()
    server = null
    serverUrl = null
    helper = null

    done()
  })

  createTransactionTests(t)
})
