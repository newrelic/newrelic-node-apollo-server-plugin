/*
 * Copyright 2021 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const createApolloServerSetup = require('../../create-apollo-server-setup')

const setupApolloServerTests = createApolloServerSetup(loadApolloServer, __dirname)

/**
 * Gotta love require. We are trying apollo 4 based stuff
 * first because since we have apollo server as a dev dep of this
 * repo it'll always find that because it traverses up to look for node_modules
 */
function loadApolloServer() {
  try {
    const gql = require('graphql-tag')
    const apolloServer = require('@apollo/server')
    const { startStandaloneServer } = require('@apollo/server/standalone')
    return { gql, ...apolloServer, startStandaloneServer }
  } catch {
    return require('apollo-server')
  }
}

module.exports = {
  setupApolloServerTests
}
