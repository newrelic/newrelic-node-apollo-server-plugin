/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { existsSync } = require('fs')
const tap = require('tap')

const utils = require('@newrelic/test-utilities')
utils.assert.extendTap(tap)

const { getTypeDefs, resolvers } = require('../../data-definitions')
const setupErrorSchema = require('../error-setup')
const { clearCachedModules } = require('../../utils')

const WEB_FRAMEWORK = 'Expressjs'

function setupApolloServerExpressTests({ suiteName, createTests, pluginConfig }, config) {
  tap.test(`apollo-server-express: ${suiteName}`, (t) => {
    t.autoend()

    let server = null
    let expressServer = null
    let serverUrl = null
    let helper = null
    let isApollo4 = false

    t.before(async () => {
      // load default instrumentation. express being critical
      helper = utils.TestAgent.makeInstrumented(config)
      const createPlugin = require('../../../lib/create-plugin')
      const nrApi = helper.getAgentApi()

      // TODO: eventually use proper function for instrumenting and not .shim
      const plugin = createPlugin(nrApi.shim, pluginConfig)

      const express = require('express')

      // Do after instrumentation to ensure express isn't loaded too soon.
      let expressServerPkg

      /**
       * We have to use fs.existsSync because the root of this project
       * has both apollo-sever-express and @apollo/server.
       * We cannot use require.resolve to look up a module because it will start from
       * here and go up every path until it hits `/` to find a module.
       */
      isApollo4 = existsSync('./node_modules/@apollo/server')
      if (isApollo4) {
        expressServerPkg = require('@apollo/server')
        expressServerPkg.gql = require('graphql-tag')
        expressServerPkg.bodyParser = require('body-parser')
        const { expressMiddleware } = require('@apollo/server/express4')
        expressServerPkg.expressMiddleware = expressMiddleware
        expressServerPkg.graphql = require('graphql')
      } else {
        expressServerPkg = require('apollo-server-express')
      }

      const { gql, ApolloServer } = expressServerPkg

      const schema = getTypeDefs(gql)
      const errorSchema = setupErrorSchema(expressServerPkg, resolvers, isApollo4)
      server = new ApolloServer({
        typeDefs: [schema, errorSchema],
        resolvers,
        plugins: [plugin],
        allowBatchedHttpRequests: true
      })

      const app = express()
      await server.start()

      if (isApollo4) {
        const { bodyParser, expressMiddleware } = expressServerPkg
        app.use('/graphql', bodyParser.json(), expressMiddleware(server))
      } else {
        server.applyMiddleware({ app })
      }

      return new Promise((resolve, reject) => {
        expressServer = app.listen(0, (err) => {
          if (err) {
            reject(err)
          }

          serverUrl = `http://localhost:${expressServer.address().port}${
            server.graphqlPath || '/graphql'
          }`

          t.context.helper = helper
          t.context.serverUrl = serverUrl
          resolve()
        })
      })
    })

    t.afterEach(() => {
      helper.agent.errors.traceAggregator.clear()
    })

    t.teardown(() => {
      expressServer && expressServer.close()
      server && server.stop()

      helper.unload()
      server = null
      serverUrl = null
      helper = null

      clearCachedModules(
        ['express', 'apollo-server-express', '@apollo/server', '@apollo/server/express4'],
        __dirname
      )
    })

    createTests(t, WEB_FRAMEWORK, isApollo4)
  })
}

module.exports = {
  setupApolloServerExpressTests
}
