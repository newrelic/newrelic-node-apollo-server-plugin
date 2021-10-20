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
  return require('apollo-server')
}

// Required to delete modules from same location.
function clearCachedModules(modules) {
  modules.forEach((moduleName) => {
    const requirePath = require.resolve(moduleName)
    delete require.cache[requirePath]
  })
}

module.exports = {
  setupApolloServerTests
}
