/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const tap = require('tap')

const utils = require('@newrelic/test-utilities')
utils.assert.extendTap(tap)

const { getTypeDefs, resolvers } = require('./data-definitions')

const WEB_FRAMEWORK = 'Expressjs'

function setupApolloServerTests(options, agentConfig) {
  const {
    suiteName,
    createTests,
    pluginConfig
  } = options

  tap.test(`apollo-server: ${suiteName}`, (t) => {
    t.autoend()

    let server = null
    let serverUrl = null
    let helper = null

    t.beforeEach(() => {
      // load default instrumentation. express being critical
      helper = utils.TestAgent.makeInstrumented(agentConfig)
      const createPlugin = require('../lib/create-plugin')
      const nrApi = helper.getAgentApi()

      const startingPlugins = initializePlugins(nrApi.shim, options.startingPlugins)

      const instrumentationPlugin = createPlugin(nrApi.shim, pluginConfig)

      // Do after instrumentation to ensure express isn't loaded too soon.
      const { ApolloServer, gql } = require('apollo-server')
      server = new ApolloServer({
        typeDefs: getTypeDefs(gql),
        resolvers,
        plugins: [...startingPlugins, instrumentationPlugin]
      })

      return server.listen({port: 0}).then(({ url }) => {
        serverUrl = url

        t.context.helper = helper
        t.context.serverUrl = serverUrl
      })
    })

    t.afterEach(() => {
      server.stop()

      helper.unload()
      server = null
      serverUrl = null
      helper = null

      clearCachedModules(['express', 'apollo-server'])
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

function initializePlugins(instrumentationApi, plugins) {
  plugins = plugins || []
  const initializedPlugins = plugins.map((plugin) => {
    if (typeof plugin === 'function') {
      return plugin(instrumentationApi)
    }

    return plugin
  })

  return initializedPlugins
}

module.exports = {
  setupApolloServerTests
}
