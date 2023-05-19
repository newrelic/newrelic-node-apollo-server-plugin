/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const tap = require('tap')
const os = require('os')

const agentTesting = require('../../agent-testing')
const utils = require('@newrelic/test-utilities')
utils.assert.extendTap(tap)

const { getTypeDefs, resolvers } = require('../../data-definitions')
const setupErrorSchema = require('../error-setup')
const { clearCachedModules } = require('../../utils')

const WEB_FRAMEWORK = 'WebFrameworkUri'

function setupApolloServerLambdaTests({ suiteName, createTests, pluginConfig }, config) {
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
    agentTesting.temporarySetEnv(t, 'NEWRELIC_PIPE_PATH', os.devNull)

    t.beforeEach((t) => {
      const lambdaServerPkg = require('apollo-server-lambda')
      const { ApolloServer, gql } = lambdaServerPkg
      const schema = getTypeDefs(gql)
      const errorSchema = setupErrorSchema(lambdaServerPkg, resolvers)
      const { version } = require('apollo-server-lambda/package')

      helper = utils.TestAgent.makeFullyInstrumented(config)

      const createPlugin = require('../../../lib/create-plugin')
      const nrApi = helper.getAgentApi()

      // TODO: eventually use proper function for instrumenting and not .shim
      const plugin = createPlugin(nrApi.shim, pluginConfig)

      ;(stubContext = {
        done: () => {},
        succeed: () => {},
        fail: () => {},
        functionName: 'functionName',
        functionVersion: 'TestVersion',
        invokedFunctionArn: 'arn:test:function',
        memoryLimitInMB: '128',
        awsRequestId: 'testid'
      }),
        (server = new ApolloServer({
          typeDefs: [schema, errorSchema],
          resolvers,
          plugins: [plugin],
          context: ({ event, context }) => ({
            headers: event.headers,
            functionName: context.functionName,
            event,
            context
          })
        }))

      handler = server.createHandler()

      patchedHandler = nrApi.setLambdaHandler(handler)

      t.context.modVersion = version
      t.context.helper = helper
      t.context.patchedHandler = patchedHandler
      t.context.stubContext = stubContext
    })

    t.afterEach(() => {
      server && server.stop()

      helper.unload()
      server = null
      helper = null
      handler = null
      patchedHandler = null
      stubContext = null

      clearCachedModules(['apollo-server-lambda'], __dirname)
    })

    createTests(t, WEB_FRAMEWORK)
  })
}

module.exports = {
  setupApolloServerLambdaTests
}
