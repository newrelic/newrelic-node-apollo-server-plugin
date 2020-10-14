/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const tap = require('tap')

const utils = require('@newrelic/test-utilities')
utils.assert.extendTap(tap)

const { getTypeDefs, resolvers } = require('../../data-definitions')

const WEB_FRAMEWORK = 'WebFrameworkUri'

function setupApolloServerLambdaTests({suiteName, createTests, pluginConfig}) {
  tap.test(`apollo-server-lambda: ${suiteName}`, (t) => {
    t.autoend()

    let server = null
    let serverUrl = null
    let helper = null
    let handler = null
    let patchedHandler = null
    let stubEvent = null
    let stubContext = null

    t.beforeEach(async () => {
      const config = {
        allow_all_headers: true,
        attributes: {
          exclude: [
            'request.headers.x*',
            'response.headers.x*'
          ]
        },
        serverless_mode: {
          enabled: true
        }
      }

      helper = utils.TestAgent.makeInstrumented(config)
      const createPlugin = require('../../../lib/create-plugin')
      const nrApi = helper.getAgentApi()

      // TODO: eventually use proper function for instrumenting and not .shim
      const plugin = createPlugin(nrApi.shim, pluginConfig)

      // Do after instrumentation to ensure lambda server isn't loaded too soon.
      const { ApolloServer, gql } = require('apollo-server-lambda')

      stubEvent = {}
      stubContext = {
        done: () => {},
        succeed: () => {},
        fail: () => {},
        functionName: 'functionName',
        functionVersion: 'TestVersion',
        invokedFunctionArn: 'arn:test:function',
        memoryLimitInMB: '128',
        awsRequestId: 'testid'
      },

      server = new ApolloServer({
        typeDefs: getTypeDefs(gql),
        resolvers,
        plugins: [plugin],
        context: ({ event, context }) => ({
          headers: event.headers,
          functionName: context.functionName,
          event,
          context
        })
      })

      serverUrl = 'doodoo'

      handler = server.createHandler()

      patchedHandler = nrApi.setLambdaHandler(handler)

      t.context.helper = helper
      t.context.serverUrl = serverUrl
      t.context.patchedHandler = patchedHandler
      t.context.stubEvent = stubEvent
      t.context.stubContext = stubContext
    })

    t.afterEach((done) => {
      server && server.stop()

      helper.unload()
      server = null
      serverUrl = null
      helper = null
      handler = null
      patchedHandler = null
      stubEvent = null
      stubContext = null

      clearCachedModules(['apollo-server-lambda'], () => {
        done()
      })
    })

    createTests(t, WEB_FRAMEWORK)
  })
}

function clearCachedModules(modules, callback) {
  modules.forEach((moduleName) => {
    const requirePath = require.resolve(moduleName)
    delete require.cache[requirePath]
  })

  callback()
}

module.exports = {
  setupApolloServerLambdaTests
}
