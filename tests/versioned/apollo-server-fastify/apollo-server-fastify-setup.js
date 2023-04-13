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

const WEB_FRAMEWORK = 'WebFrameworkUri/Fastify'

function setupApolloServerFastifyTests({ suiteName, createTests, pluginConfig }, config) {
  tap.test(`apollo-server-fastify: ${suiteName}`, (t) => {
    t.autoend()

    let server = null
    let app = null
    let serverUrl = null
    let helper = null

    t.beforeEach(async () => {
      // load default instrumentation
      helper = utils.TestAgent.makeFullyInstrumented(config)
      const createPlugin = require('../../../lib/create-plugin')
      const nrApi = helper.getAgentApi()

      app = require('fastify')()

      // TODO: eventually use proper function for instrumenting and not .shim
      const plugin = createPlugin(nrApi.shim, pluginConfig)

      // Do after instrumentation to ensure hapi isn't loaded too soon.
      const fastifyServerPkg = require('apollo-server-fastify')
      const { ApolloServer, gql } = fastifyServerPkg
      const schema = getTypeDefs(gql)
      const errorSchema = setupErrorSchema(fastifyServerPkg, resolvers)
      server = new ApolloServer({
        typeDefs: [schema, errorSchema],
        resolvers,
        plugins: [plugin]
      })

      await server.start()
      app.register(server.createHandler())

      return new Promise((resolve, reject) => {
        app.listen(0, (err, address) => {
          if (err) {
            reject(err)
          }
          serverUrl = `${address}${server.graphqlPath}`

          t.context.helper = helper
          t.context.serverUrl = serverUrl
          resolve()
        })
      })
    })

    t.afterEach(() => {
      server && server.stop()
      app && app.close()

      helper.unload()
      server = null
      app = null
      serverUrl = null
      helper = null

      clearCachedModules(['fastify', 'apollo-server-fastify'], __dirname)
    })

    createTests(t, WEB_FRAMEWORK)
  })
}

module.exports = {
  setupApolloServerFastifyTests
}
