/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')
const tspl = require('@matteo.collina/tspl')

const utils = require('@newrelic/test-utilities')
const createPlugin = require('../../../lib/create-plugin')

const { loadLibraries, loadGateway } = require('./federated-gateway-server-setup')

test(
  'Capture/Ignore Service Definition and Health Check ' +
    'query transaction from sub-graph servers',
  async (t) => {
    await t.test('Should ignore Service Definiion query by default', async (t) => {
      const plan = tspl(t, { plan: 1 })

      // load default instrumentation. express being critical
      const helper = utils.TestAgent.makeFullyInstrumented()
      const ignore = true

      helper.agent.on('transactionFinished', (transaction) => {
        plan.equal(transaction.ignore, ignore, `should set transaction.ignore to ${ignore}`)
      })

      const pluginConfig = {}

      const nrApi = helper.getAgentApi()

      const instrumentationPlugin = createPlugin(nrApi, pluginConfig)
      const plugins = [instrumentationPlugin]

      // Do after instrumentation to ensure express isn't loaded too soon.
      const apollo = require('apollo-server')

      const libraryService = await loadLibraries(apollo, plugins)
      const libraryServer = libraryService.server

      const services = [{ name: libraryService.name, url: libraryService.url }]

      const gatewayService = await loadGateway(apollo, services, plugins)

      const gatewayServer = gatewayService.server

      gatewayServer.stop()
      libraryServer.stop()
      helper.unload()

      await plan.completed
    })

    await t.test(
      'Should not ignore Service Definition query ' +
        'when captureServiceDefinitionQueries set to true',
      async (t) => {
        const plan = tspl(t, { plan: 1 })
        // load default instrumentation. express being critical
        const helper = utils.TestAgent.makeFullyInstrumented()
        const ignore = false

        helper.agent.on('transactionFinished', (transaction) => {
          plan.equal(transaction.ignore, ignore, `should set transaction.ignore to ${ignore}`)
        })

        const pluginConfig = {
          captureServiceDefinitionQueries: true
        }

        const nrApi = helper.getAgentApi()

        const instrumentationPlugin = createPlugin(nrApi, pluginConfig)
        const plugins = [instrumentationPlugin]

        // Do after instrumentation to ensure express isn't loaded too soon.
        const apollo = require('apollo-server')

        const libraryService = await loadLibraries(apollo, plugins)
        const libraryServer = libraryService.server

        const services = [{ name: libraryService.name, url: libraryService.url }]

        const gatewayService = await loadGateway(apollo, services, plugins)

        const gatewayServer = gatewayService.server

        gatewayServer.stop()
        libraryServer.stop()
        helper.unload()

        await plan.completed
      }
    )

    await t.test('Should ignore Health Check query by default', async (t) => {
      const plan = tspl(t, { plan: 1 })
      // load default instrumentation. express being critical
      const helper = utils.TestAgent.makeFullyInstrumented()
      const ignore = true

      helper.agent.on('transactionFinished', (transaction) => {
        if (transaction.name.includes('__ApolloServiceHealthCheck__')) {
          plan.equal(transaction.ignore, ignore, `should set transaction.ignore to ${ignore}`)
        }
      })

      const pluginConfig = {}

      const nrApi = helper.getAgentApi()

      const instrumentationPlugin = createPlugin(nrApi, pluginConfig)
      const plugins = [instrumentationPlugin]

      // Do after instrumentation to ensure express isn't loaded too soon.
      const apollo = require('apollo-server')

      const libraryService = await loadLibraries(apollo, plugins)
      const libraryServer = libraryService.server

      const services = [{ name: libraryService.name, url: libraryService.url }]

      const gatewayService = await loadGateway(apollo, services, plugins)

      // trigger the healthcheck
      await gatewayService.gateway.serviceHealthCheck()

      const gatewayServer = gatewayService.server

      gatewayServer.stop()
      libraryServer.stop()
      helper.unload()

      await plan.completed
    })

    await t.test(
      'Should not ignore Health Check query when ' + 'captureHealthCheckQueries set to true',
      async (t) => {
        const plan = tspl(t, { plan: 1 })
        // load default instrumentation. express being critical
        const helper = utils.TestAgent.makeFullyInstrumented()
        const ignore = false

        helper.agent.on('transactionFinished', (transaction) => {
          if (transaction.name.includes('__ApolloServiceHealthCheck__')) {
            plan.equal(transaction.ignore, ignore, `should set transaction.ignore to ${ignore}`)
          }
        })

        const pluginConfig = {
          captureHealthCheckQueries: true
        }

        const nrApi = helper.getAgentApi()

        const instrumentationPlugin = createPlugin(nrApi, pluginConfig)
        const plugins = [instrumentationPlugin]

        // Do after instrumentation to ensure express isn't loaded too soon.
        const apollo = require('apollo-server')

        const libraryService = await loadLibraries(apollo, plugins)
        const libraryServer = libraryService.server

        const services = [{ name: libraryService.name, url: libraryService.url }]

        const gatewayService = await loadGateway(apollo, services, plugins)

        // trigger the healthcheck
        await gatewayService.gateway.serviceHealthCheck()

        const gatewayServer = gatewayService.server

        gatewayServer.stop()
        libraryServer.stop()
        helper.unload()

        await plan.completed
      }
    )
  }
)
