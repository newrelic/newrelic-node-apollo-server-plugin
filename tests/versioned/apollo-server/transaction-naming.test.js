/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const tap = require('tap')
const { ApolloServer, gql } = require('apollo-server')

const utils = require('@newrelic/test-utilities')
const { getTypeDefs, resolvers } = require('../data-definitions')
const { createTransactionTests } = require('../transaction-tests')

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

    done()
  })

  createTransactionTests(t)
})
