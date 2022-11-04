/*
 * Copyright 2021 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const createApolloServerSetup = require('../create-apollo-server-setup')
const { version: pkgVersion } = require('apollo-server/package.json')

const setupApolloServerTests = createApolloServerSetup(loadApolloServer, __dirname, pkgVersion)

// Required to load modules starting from this folder.
function loadApolloServer() {
  return require('apollo-server')
}

module.exports = {
  setupApolloServerTests
}
