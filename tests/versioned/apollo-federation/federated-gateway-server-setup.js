/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')
const utils = require('@newrelic/test-utilities')

const federatedData = require('./federated-data-definitions')
const { clearCachedModules } = require('../../utils')

const WEB_FRAMEWORK = 'Expressjs'

function setupFederatedGatewayServerTests(options, agentConfig) {
  const { suiteName, createTests, pluginConfig } = options

  test(`apollo-federation: ${suiteName}`, async (t) => {
    t.beforeEach(async (ctx) => {
      // load default instrumentation. express being critical
      const helper = utils.TestAgent.makeFullyInstrumented(agentConfig)
      const createPlugin = require('../../../lib/create-plugin')
      const nrApi = helper.getAgentApi()

      const startingPlugins = initializePlugins(nrApi, options.startingPlugins)

      const instrumentationPlugin = createPlugin(nrApi, pluginConfig)

      // Do after instrumentation to ensure express isn't loaded too soon.
      const apollo = require('apollo-server')

      const subGraphPlugins = []

      if (options.instrumentSubGraphs) {
        subGraphPlugins.push(instrumentationPlugin)
      } else {
        // Sub-graph services are currently auto-instrumented via express.
        // Ignore transaction plugin will prevent creation of standard data and indicate
        // to tests we do not intend to assert on these transactions.
        const ignoreTransactionPlugin = createIgnoreTransactionPlugin(nrApi)
        subGraphPlugins.push(ignoreTransactionPlugin)
      }

      // Services are not instrumented
      const libraryService = await loadLibraries(apollo, subGraphPlugins)
      const libraryServer = libraryService.server

      const bookService = await loadBooks(apollo, subGraphPlugins)
      const bookServer = bookService.server

      const magazineService = await loadMagazines(apollo, subGraphPlugins)
      const magazineServer = magazineService.server

      const services = [
        { name: libraryService.name, url: libraryService.url },
        { name: bookService.name, url: bookService.url },
        { name: magazineService.name, url: magazineService.url }
      ]

      const plugins = [...startingPlugins, instrumentationPlugin]

      const gatewayService = await loadGateway(apollo, services, plugins)
      const gatewayServer = gatewayService.server

      ctx.nr = {
        helper,
        gatewayServer,
        magazineServer,
        bookServer,
        libraryServer,
        serverUrl: gatewayService.url,
        libraryUrl: libraryService.url,
        bookUrl: bookService.url,
        magazineUrl: magazineService.url
      }
    })

    t.afterEach((ctx) => {
      const { gatewayServer, magazineServer, bookServer, libraryServer, helper } = ctx.nr
      gatewayServer.stop()
      magazineServer.stop()
      bookServer.stop()
      libraryServer.stop()

      helper.unload()

      clearCachedModules(
        ['express', 'apollo-server', '@apollo/gateway', '@apollo/subgraph'],
        __dirname
      )
    })

    await createTests(t, WEB_FRAMEWORK)
  })
}

async function loadGateway({ ApolloServer }, services, plugins) {
  const name = 'Gateway'

  const { ApolloGateway, IntrospectAndCompose } = require('@apollo/gateway')

  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: services
    })
  })

  const server = new ApolloServer({
    gateway,
    subscriptions: false,
    plugins: plugins
  })

  const { url } = await server.listen({ port: 0 })

  // eslint-disable-next-line no-console
  console.log(`${name} ready at ${url}`)

  return { name, url, server, gateway }
}

async function loadLibraries({ ApolloServer, gql }, plugins) {
  const config = federatedData.getLibraryConfiguration(gql)
  return await loadServer(ApolloServer, config, plugins)
}

async function loadBooks({ ApolloServer, gql }, plugins) {
  const config = federatedData.getBookConfiguration(gql)
  return await loadServer(ApolloServer, config, plugins)
}

async function loadMagazines({ ApolloServer, gql }, plugins) {
  const config = federatedData.getMagazineConfiguration(gql)
  return await loadServer(ApolloServer, config, plugins)
}

async function loadServer(ApolloServer, config, plugins) {
  const { buildSubgraphSchema } = require('@apollo/subgraph')

  const { name, typeDefs, resolvers } = config

  const server = new ApolloServer({
    schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
    plugins
  })

  const { url } = await server.listen({ port: 0 })

  // eslint-disable-next-line no-console
  console.log(`${name} service ready at ${url}`)

  return { name, url, server }
}

function createIgnoreTransactionPlugin(nrApi) {
  return {
    requestDidStart() {
      const transactionHandle = nrApi.getTransaction()
      transactionHandle.ignore()
    }
  }
}

function initializePlugins(instrumentationApi, plugins) {
  plugins = plugins || []
  return plugins.map((plugin) => {
    if (typeof plugin === 'function') {
      return plugin(instrumentationApi)
    }

    return plugin
  })
}

module.exports = {
  setupFederatedGatewayServerTests,
  loadLibraries,
  loadGateway
}
