/*
 * Copyright 2021 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const createApolloServerSetup = require('../../create-apollo-server-setup')

const setupApolloServerTests = createApolloServerSetup(loadApolloServer, __dirname)
const { existsSync } = require('fs')

/**
 * We have to use fs.existsSync because the root of this project
 * has both apollo-sever and @apollo/server for testing the types.
 * We cannot use require.resolve to look up a module because it will start from
 * here and go up every path until it hits `/` to find a module.
 */
function loadApolloServer() {
  const isApollo4 = existsSync('./node_modules/@apollo/server')

  if (isApollo4) {
    const gql = require('graphql-tag')
    const apolloServer = require('@apollo/server')
    const { startStandaloneServer } = require('@apollo/server/standalone')
    const graphql = require('graphql')
    return { gql, ...apolloServer, startStandaloneServer, graphql }
  }
  return require('apollo-server')
}

module.exports = {
  setupApolloServerTests
}
