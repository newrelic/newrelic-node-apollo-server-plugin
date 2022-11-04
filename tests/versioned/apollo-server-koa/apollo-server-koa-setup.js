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
const { clearCachedModules } = require('../../utils')

const WEB_FRAMEWORK = 'WebFrameworkUri/Koa'

function setupApolloServerKoaTests({ suiteName, createTests, pluginConfig }, config) {
  tap.test(`apollo-server-koa: ${suiteName}`, (t) => {
    t.autoend()

    let server = null
    let koaServer = null
    let app = null
    let serverUrl = null
    let helper = null

    t.beforeEach(async () => {
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
      const koaServerPkg = require('apollo-server-koa')
      const { ApolloServer, gql } = koaServerPkg
      const schema = getTypeDefs(gql)
      const errorSchema = setupErrorSchema(koaServerPkg, resolvers)
      server = new ApolloServer({
        typeDefs: [schema, errorSchema],
        resolvers,
        plugins: [plugin]
      })

      await server.start()
      server.applyMiddleware({ app, path: graphqlPath })

      return new Promise((resolve, reject) => {
        koaServer = app.listen(0, (err) => {
          if (err) {
            reject(err)
          }
          serverUrl = `http://localhost:${koaServer.address().port}${server.graphqlPath}`

          t.context.helper = helper
          t.context.serverUrl = serverUrl
          resolve()
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

      clearCachedModules(['koa', 'apollo-server-koa'], __dirname)
    })

    createTests(t, WEB_FRAMEWORK)
  })
}

module.exports = {
  setupApolloServerKoaTests
}
