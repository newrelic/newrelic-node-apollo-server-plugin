/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// This file provides utility functions used to set up and teardown tests.

module.exports = {
  afterEach,
  requireApolloServer,
  setupCoreTest,
  unloadModules
}

const fs = require('node:fs')

const utils = require('@newrelic/test-utilities')
const setupErrorSchema = require('./error-setup')
const { getTypeDefs, resolvers } = require('../data-definitions')

async function afterEach({ t, testDir }) {
  await t.nr.server.stop()
  t.nr.helper.agent.errors.traceAggregator.clear()
  t.nr.helper.unload()
  unloadModules(testDir)
}

async function setupCoreTest({ t, testDir, agentConfig = {}, pluginConfig = {} } = {}) {
  const helper = utils.TestAgent.makeFullyInstrumented(agentConfig)
  const createPlugin = require('../../lib/create-plugin')
  const nrApi = helper.getAgentApi()
  const instrumentationPlugin = createPlugin(nrApi, pluginConfig)

  const apolloServerPkg = requireApolloServer(testDir)
  const { isApollo4, ApolloServer, gql, startStandaloneServer } = apolloServerPkg
  const schema = getTypeDefs(gql)
  const errorSchema = setupErrorSchema(apolloServerPkg, resolvers, isApollo4)

  const server = new ApolloServer({
    typeDefs: [schema, errorSchema],
    resolvers,
    plugins: [instrumentationPlugin],
    allowBatchedHttpRequests: true
  })

  const { url: serverUrl } =
    isApollo4 === true
      ? await startStandaloneServer(server, { listen: { port: 0 } })
      : await server.listen({ port: 0 })

  t.nr = {
    helper,
    server,
    serverUrl,
    apolloServerPkg,
    agentConfig,
    pluginConfig
  }
}

/**
 * This function is utilized to require the appropriate Apollo server modules
 * for the version of Apollo server that is under test (versioned tests cover
 * multiple versions, and the package has changed names over time).
 *
 * @returns {{isApollo4: boolean, ApolloServer, gql, startStandaloneServer, graphql}}
 */
function requireApolloServer(testDir) {
  const isApollo4 = fs.existsSync('./node_modules/@apollo/server')

  if (isApollo4 === false) {
    const ApolloServer = loadModule('apollo-server', testDir)
    return { isApollo4, ApolloServer }
  }

  const gql = loadModule('graphql-tag', testDir)
  const apolloServer = loadModule('@apollo/server', testDir)
  const { startStandaloneServer } = loadModule('@apollo/server/standalone', testDir)
  const graphql = loadModule('graphql', testDir)
  return {
    isApollo4,
    ApolloServer: apolloServer.ApolloServer,
    gql,
    startStandaloneServer,
    graphql
  }
}

/**
 * Require a module relative to the tests being run.
 *
 * @param {string} name The module to load.
 * @param {string} rootDir The path to the versioned test directory, e.g.
 * the path to the `apollo-server` tests.
 *
 * @returns {*}
 */
function loadModule(name, rootDir) {
  return require(require.resolve(name, { paths: [rootDir] }))
}

/**
 * Removes all Apollo server related modules from the require cache.
 *
 * @param {string} testDir The parent directory for the tests being run. This
 * is used to scope the algorithm to the correct `node_modules` directory.
 * Simply passing `__dirname` from the test suite should be sufficient.
 */
function unloadModules(testDir) {
  const modules = [
    'express',
    'apollo-server',
    '@apollo/server',
    '@apollo/server/express4',
    '@apollo/server/standalone'
  ]
  for (const mod of modules) {
    try {
      const found = require.resolve(mod, { paths: [testDir] })
      delete require.cache[found]
    } catch {}
  }
}
