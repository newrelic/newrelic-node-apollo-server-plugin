/*
 * Copyright 2021 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const createApolloServerSetup = require('../../create-apollo-server-setup')

const setupApolloServerTests = createApolloServerSetup(loadApolloServer, clearCachedModules)

// Required to load modules starting from this folder.
// This is important so that versioned testing uses version permutations not the  dev dependency version.
function loadApolloServer() {
  const gql = require('graphql-tag')
  const apolloServer = require('@apollo/server')
  const { startStandaloneServer } = require('@apollo/server/standalone')
  return { gql, ...apolloServer, startStandaloneServer }
}

// Required to delete modules from same location.
function clearCachedModules(modules) {
  modules.push('@apollo/server')
  modules.forEach((moduleName) => {
    const requirePath = require.resolve(moduleName)
    delete require.cache[requirePath]
  })
}

module.exports = {
  setupApolloServerTests
}
