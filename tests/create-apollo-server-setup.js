/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const tap = require('tap')

const utils = require('@newrelic/test-utilities')
utils.assert.extendTap(tap)

const { getTypeDefs, resolvers } = require('./data-definitions')
const setupErrorSchema = require('./versioned/error-setup')
const { clearCachedModules } = require('./utils')

const WEB_FRAMEWORK = 'Expressjs'

const isApollo4 = (pkg) => !!pkg.startStandaloneServer

function createApolloServerSetup(loadApolloServer, testDir) {
  return setupApolloServerTests.bind(null, loadApolloServer, testDir)
}

function setupApolloServerTests(loadApolloServer, testDir, options, agentConfig) {
  const { suiteName, createTests, pluginConfig } = options

  tap.test(`apollo-server: ${suiteName}`, (t) => {
    t.autoend()

    let server = null
    let serverUrl = null
    let helper = null
    let apolloServerPkg = null

    t.before(async () => {
      // load default instrumentation. express being critical
      helper = utils.TestAgent.makeFullyInstrumented(agentConfig)
      const createPlugin = require('../lib/create-plugin')
      const nrApi = helper.getAgentApi()

      const startingPlugins = initializePlugins(nrApi.shim, options.startingPlugins)

      const instrumentationPlugin = createPlugin(nrApi.shim, pluginConfig)

      // Do after instrumentation to ensure express isn't loaded too soon.
      apolloServerPkg = loadApolloServer()
      const { ApolloServer, gql, startStandaloneServer } = apolloServerPkg
      const schema = getTypeDefs(gql)
      const errorSchema = setupErrorSchema(apolloServerPkg, resolvers, isApollo4(apolloServerPkg))

      server = new ApolloServer({
        typeDefs: [schema, errorSchema],
        resolvers,
        plugins: [...startingPlugins, instrumentationPlugin],
        allowBatchedHttpRequests: true
      })

      const { url } = startStandaloneServer
        ? await startStandaloneServer(server, { listen: { port: 0 } })
        : await server.listen({ port: 0 })

      serverUrl = url

      t.context.helper = helper
      t.context.serverUrl = serverUrl
    })

    t.afterEach(() => {
      helper.agent.errors.traceAggregator.clear()
    })

    t.teardown(async () => {
      await server.stop()

      helper.unload()
      server = null
      serverUrl = null
      helper = null
      clearCachedModules(
        ['express', 'apollo-server', '@apollo/server', '@apollo/server/express4'],
        testDir
      )
    })

    createTests(t, WEB_FRAMEWORK, isApollo4(apolloServerPkg))
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

module.exports = createApolloServerSetup
