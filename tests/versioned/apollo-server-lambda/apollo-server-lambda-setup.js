/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const tap = require('tap')

const agentTesting = require('../../agent-testing')
const utils = require('@newrelic/test-utilities')
utils.assert.extendTap(tap)

const { getTypeDefs, resolvers } = require('../../data-definitions')

const WEB_FRAMEWORK = 'WebFrameworkUri'

function setupApolloServerLambdaTests({suiteName, createTests, pluginConfig}, config) {
  tap.test(`apollo-server-lambda: ${suiteName}`, (t) => {
    t.autoend()

    let server = null
    let helper = null
    let handler = null
    let patchedHandler = null
    let stubContext = null

    /**
     * Account ID is required for serverless in order to enable
     * distributed tracing.
     */
    agentTesting.temporarySetEnv(t, 'NEW_RELIC_ACCOUNT_ID', 'eeeeee')

    t.beforeEach((done, t) => {
      const { ApolloServer, gql } = require('apollo-server-lambda')

      helper = utils.TestAgent.makeInstrumented(config)

      const createPlugin = require('../../../lib/create-plugin')
      const nrApi = helper.getAgentApi()

      // TODO: eventually use proper function for instrumenting and not .shim
      const plugin = createPlugin(nrApi.shim, pluginConfig)

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

      handler = server.createHandler()

      patchedHandler = nrApi.setLambdaHandler(handler)

      t.context.helper = helper
      t.context.patchedHandler = patchedHandler
      t.context.stubContext = stubContext

      done()
    })

    t.afterEach((done) => {
      server && server.stop()

      helper.unload()
      server = null
      helper = null
      handler = null
      patchedHandler = null
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
