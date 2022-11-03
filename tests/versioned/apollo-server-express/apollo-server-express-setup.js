/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const tap = require('tap')

const utils = require('@newrelic/test-utilities')
utils.assert.extendTap(tap)

const { getTypeDefs, resolvers } = require('../../data-definitions')
const setupErrorSchema = require('../error-setup')

const WEB_FRAMEWORK = 'Expressjs'

function setupApolloServerExpressTests({ suiteName, createTests, pluginConfig }, config) {
  tap.test(`apollo-server-express: ${suiteName}`, (t) => {
    t.autoend()

    let server = null
    let expressServer = null
    let serverUrl = null
    let helper = null

    t.beforeEach(async () => {
      // load default instrumentation. express being critical
      helper = utils.TestAgent.makeInstrumented(config)
      const createPlugin = require('../../../lib/create-plugin')
      const nrApi = helper.getAgentApi()

      // TODO: eventually use proper function for instrumenting and not .shim
      const plugin = createPlugin(nrApi.shim, pluginConfig)

      const express = require('express')

      // Do after instrumentation to ensure express isn't loaded too soon.
      let expressServerPkg
      let isApollo4 = false
      try {
        expressServerPkg = require('apollo-server-express')
      } catch {
        expressServerPkg = require('@apollo/server')
        expressServerPkg.gql = require('graphql-tag')
        expressServerPkg.bodyParser = require('body-parser')
        expressServerPkg.expressMiddleware = require('@apollo/server/express4')
        isApollo4 = true
      }

      const { gql, ApolloServer } = expressServerPkg

      const schema = getTypeDefs(gql)
      const errorSchema = setupErrorSchema(expressServerPkg, resolvers, isApollo4)
      server = new ApolloServer({
        typeDefs: [schema, errorSchema],
        resolvers,
        plugins: [plugin]
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

          serverUrl = `http://localhost:${expressServer.address().port}${server.graphqlPath}`

          t.context.helper = helper
          t.context.serverUrl = serverUrl
          resolve()
        })
      })
    })

    t.afterEach(() => {
      expressServer && expressServer.close()
      server && server.stop()

      helper.unload()
      server = null
      serverUrl = null
      helper = null

      clearCachedModules(['express', 'apollo-server-express'])
    })

    createTests(t, WEB_FRAMEWORK)
  })
}

function clearCachedModules(modules) {
  modules.forEach((moduleName) => {
    const requirePath = require.resolve(moduleName)
    delete require.cache[requirePath]
  })
}

module.exports = {
  setupApolloServerExpressTests
}
