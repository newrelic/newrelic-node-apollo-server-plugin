/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const tap = require('tap')

const utils = require('@newrelic/test-utilities')
utils.assert.extendTap(tap)

const { getTypeDefs, resolvers } = require('../../data-definitions')

const WEB_FRAMEWORK = 'WebFrameworkUri/Koa'

function setupApolloServerKoaTests({suiteName, createTests, pluginConfig}, config) {
  tap.test(`apollo-server-koa: ${suiteName}`, (t) => {
    t.autoend()

    let server = null
    let koaServer = null
    let app = null
    let serverUrl = null
    let helper = null

    t.beforeEach(() => {
      // load default instrumentation
      helper = utils.TestAgent.makeInstrumented(config)
      const createPlugin = require('../../../lib/create-plugin')
      const nrApi = helper.getAgentApi()

      const Koa = require('koa')

      app = new Koa()

      // TODO: eventually use proper function for instrumenting and not .shim
      const plugin = createPlugin(nrApi.shim, pluginConfig)

      const graphqlPath = '/gql'

      // Do after instrumentation to ensure hapi isn't loaded too soon.
      const { ApolloServer, gql } = require('apollo-server-koa')
      server = new ApolloServer({
        typeDefs: getTypeDefs(gql),
        resolvers,
        plugins: [plugin]
      })

      server.applyMiddleware({ app, path: graphqlPath })

      return new Promise((resolve, reject) => {
        koaServer = app.listen(0, (err) => {
          if (err) reject(err)
          serverUrl = `http://localhost:${koaServer.address().port}${server.graphqlPath}`

          t.context.helper = helper
          t.context.serverUrl = serverUrl
          resolve();
        })
      })
    })

    t.afterEach(() => {
      server && server.stop()
      koaServer && koaServer.close()

      helper.unload()
      server = null
      app = null
      serverUrl = null
      helper = null

      clearCachedModules(['koa', 'apollo-server-koa'])
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
  setupApolloServerKoaTests
}
