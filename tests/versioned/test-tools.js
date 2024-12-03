/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// This file provides utility functions used to set up and teardown tests.

module.exports = {
  afterEach,
  teardown,
  requireApolloServer,
  setupCoreTest,
  unloadModules
}

const fs = require('node:fs')

const utils = require('@newrelic/test-utilities')
const setupErrorSchema = require('./error-setup')
const { getTypeDefs, resolvers } = require('../data-definitions')
const { clearCachedModules } = require('../utils')

function afterEach(ctx) {
  ctx.nr.helper.agent.errors.traceAggregator.clear()
}

async function teardown(ctx) {
  await ctx.nr.server.stop()
  ctx.nr.helper.unload()
}

async function setupCoreTest({ t, agentConfig = {}, pluginConfig = {} } = {}) {
  const helper = utils.TestAgent.makeFullyInstrumented(agentConfig)
  const createPlugin = require('../../lib/create-plugin')
  const nrApi = helper.getAgentApi()
  const instrumentationPlugin = createPlugin(nrApi, pluginConfig)

  const apolloServerPkg = requireApolloServer()
  const { isApollo4, ApolloServer, gql, startStandaloneServer } = apolloServerPkg
  const schema = getTypeDefs(gql)
  const errorSchema = setupErrorSchema(apolloServerPkg, resolvers, isApollo4)

  const server = new ApolloServer({
    typeDefs: [schema, errorSchema],
    resolvers,
    plugins: [instrumentationPlugin],
    allowBatchedHttpRequests: true
  })

  const { url } =
    isApollo4 === true
      ? await startStandaloneServer(server, { listen: { port: 0 } })
      : await server.listen({ port: 0 })
  const serverUrl = url

  t.nr = {
    helper,
    server,
    serverUrl,
    apolloServerPkg
  }
}

/**
 * This function is utilized to require the appropriate Apollo server modules
 * for the version of Apollo server that is under test (versioned tests cover
 * multiple versions, and the package has changed names over time).
 *
 * @returns {{isApollo4: boolean, ApolloServer, gql, startStandaloneServer, graphql}}
 */
function requireApolloServer() {
  const isApollo4 = fs.existsSync('./node_modules/@apollo/server')

  if (isApollo4 === false) {
    const ApolloServer = require('apollo-server')
    return { isApollo4, ApolloServer }
  }

  const gql = require('graphql-tag')
  const apolloServer = require('@apollo/server')
  const { startStandaloneServer } = require('@apollo/server/standalone')
  const graphql = require('graphql')
  return {
    isApollo4,
    ApolloServer: apolloServer.ApolloServer,
    gql,
    startStandaloneServer,
    graphql
  }
}

/**
 * Removes all Apollo server related modules from the require cache.
 *
 * @param {string} testDir The parent directory for the tests being run. This
 * is used to scope the algorithm to the correct `node_modules` directory.
 * Simply passing `__dirname` from the test suite should be sufficient.
 */
function unloadModules(testDir) {
  clearCachedModules(
    ['express', 'apollo-server', '@apollo/server', '@apollo/server/express4'],
    testDir
  )
}
