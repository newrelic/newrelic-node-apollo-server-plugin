/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const tap = require('tap')
const utils = require('@newrelic/test-utilities')
const createPlugin = require('../../../lib/create-plugin')

const { loadLibraries, loadGateway } = require('./federated-gateway-server-setup')

tap.test('Capture/Ignore Service Definition and Health Check ' +
  'query transaction from sub-graph servers', (t) => {
  t.autoend()

  let gatewayServer = null
  let libraryServer = null
  let helper = null
  let agentConfig = null

  t.afterEach(() => {
    helper.unload()

    gatewayServer = null
    libraryServer = null
    helper = null
    agentConfig = null
  })

  t.test('Should not ignore Service Definiion query by default', async (t) => {
    // load default instrumentation. express being critical
    helper = utils.TestAgent.makeInstrumented(agentConfig)
    let ignore = true

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.ignore,
        ignore,
        `should set transaction.ignore to ${ignore}`
      )
    })

    const pluginConfig = {}

    const nrApi = helper.getAgentApi()

    const instrumentationPlugin = createPlugin(nrApi.shim, pluginConfig)
    const plugins = [instrumentationPlugin]

    // Do after instrumentation to ensure express isn't loaded too soon.
    const apollo = require('apollo-server')

    const libraryService = await loadLibraries(apollo, plugins)
    libraryServer = libraryService.server

    const services = [
      { name: libraryService.name, url: libraryService.url }
    ]

    const gatewayService = await loadGateway(apollo, services, plugins)

    gatewayServer = gatewayService.server

    gatewayServer.stop()
    libraryServer.stop()
  })

  t.test('Should not ignore Service Definition query ' +
    'when captureServiceDefinitionQuery set to true', async (t) => {
    // load default instrumentation. express being critical
    helper = utils.TestAgent.makeInstrumented(agentConfig)
    let ignore = false

    helper.agent.on('transactionFinished', (transaction) => {
      t.equal(
        transaction.ignore,
        ignore,
        `should set transaction.ignore to ${ignore}`
      )
    })

    const pluginConfig = {
      captureServiceDefinitionQuery: true
    }

    const nrApi = helper.getAgentApi()

    const instrumentationPlugin = createPlugin(nrApi.shim, pluginConfig)
    const plugins = [instrumentationPlugin]

    // Do after instrumentation to ensure express isn't loaded too soon.
    const apollo = require('apollo-server')

    const libraryService = await loadLibraries(apollo, plugins)
    libraryServer = libraryService.server

    const services = [
      { name: libraryService.name, url: libraryService.url }
    ]

    const gatewayService = await loadGateway(apollo, services, plugins)

    gatewayServer = gatewayService.server

    gatewayServer.stop()
    libraryServer.stop()
  })

  t.test('Should ignore Health Check query by default', async (t) => {
    // load default instrumentation. express being critical
    helper = utils.TestAgent.makeInstrumented(agentConfig)
    let ignore = true

    helper.agent.on('transactionFinished', (transaction) => {
      if (transaction.name.includes('__ApolloServiceHealthCheck__')) {
        t.equal(
          transaction.ignore,
          ignore,
          `should set transaction.ignore to ${ignore}`
        )
      }
    })

    const pluginConfig = {}

    const nrApi = helper.getAgentApi()

    const instrumentationPlugin = createPlugin(nrApi.shim, pluginConfig)
    const plugins = [instrumentationPlugin]

    // Do after instrumentation to ensure express isn't loaded too soon.
    const apollo = require('apollo-server')

    const libraryService = await loadLibraries(apollo, plugins)
    libraryServer = libraryService.server

    const services = [
      { name: libraryService.name, url: libraryService.url }
    ]

    const gatewayService = await loadGateway(apollo, services, plugins)

    // trigger the healthcheck
    await gatewayService.gateway.serviceHealthCheck()

    gatewayServer = gatewayService.server

    gatewayServer.stop()
    libraryServer.stop()
  })

  t.test('Should not ignore Health Check query when ' +
    'captureHealthCheckQuery set to true', async (t) => {
    // load default instrumentation. express being critical
    helper = utils.TestAgent.makeInstrumented(agentConfig)
    let ignore = false

    helper.agent.on('transactionFinished', (transaction) => {
      if (transaction.name.includes('__ApolloServiceHealthCheck__')) {
        t.equal(
          transaction.ignore,
          ignore,
          `should set transaction.ignore to ${ignore}`
        )
      }
    })

    const pluginConfig = {
      captureHealthCheckQuery: true
    }

    const nrApi = helper.getAgentApi()

    const instrumentationPlugin = createPlugin(nrApi.shim, pluginConfig)
    const plugins = [instrumentationPlugin]

    // Do after instrumentation to ensure express isn't loaded too soon.
    const apollo = require('apollo-server')

    const libraryService = await loadLibraries(apollo, plugins)
    libraryServer = libraryService.server

    const services = [
      { name: libraryService.name, url: libraryService.url }
    ]

    const gatewayService = await loadGateway(apollo, services, plugins)

    // trigger the healthcheck
    await gatewayService.gateway.serviceHealthCheck()

    gatewayServer = gatewayService.server

    gatewayServer.stop()
    libraryServer.stop()
  })
})
