/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const test = require('node:test')
const assert = require('node:assert')
const utils = require('@newrelic/test-utilities')
const createPlugin = require('../../../lib/create-plugin')

const { loadLibraries, loadGateway } = require('./federated-gateway-server-setup')

async function setup(pluginConfig) {
  const helper = utils.TestAgent.makeInstrumented()

  const nrApi = helper.getAgentApi()

  const instrumentationPlugin = createPlugin(nrApi, pluginConfig)
  const plugins = [instrumentationPlugin]

  // Do after instrumentation to ensure express isn't loaded too soon.
  const apollo = require('apollo-server')

  const libraryService = await loadLibraries(apollo, plugins)
  const libraryServer = libraryService.server

  const services = [{ name: libraryService.name, url: libraryService.url }]
  return { apollo, helper, plugins, services, libraryServer }
}

test(
  'Capture/Ignore Service Definition and Health Check ' +
    'query transaction from sub-graph servers',
  async (t) => {
    await t.test('Should ignore Service Definiion query by default', async (t) => {
      const pluginConfig = {}
      const { helper, apollo, services, plugins, libraryServer } = await setup(pluginConfig)
      const ignore = true

      let tx
      helper.agent.on('transactionFinished', (transaction) => {
        tx = transaction
      })

      const gatewayService = await loadGateway(apollo, services, plugins)
      t.after(() => {
        helper.unload()
        libraryServer.stop()
        gatewayService.server.stop()
      })
      assert.equal(tx.ignore, ignore, `should set transaction.ignore to ${ignore}`)
    })

    await t.test(
      'Should not ignore Service Definition query ' +
        'when captureServiceDefinitionQueries set to true',
      async (t) => {
        const pluginConfig = {
          captureServiceDefinitionQueries: true
        }
        const { helper, apollo, services, plugins, libraryServer } = await setup(pluginConfig)
        const ignore = false

        let tx
        helper.agent.on('transactionFinished', (transaction) => {
          tx = transaction
        })

        const gatewayService = await loadGateway(apollo, services, plugins)
        t.after(() => {
          helper.unload()
          libraryServer.stop()
          gatewayService.server.stop()
        })
        assert.equal(tx.ignore, ignore, `should set transaction.ignore to ${ignore}`)
      }
    )

    await t.test('Should ignore Health Check query by default', async (t) => {
      const pluginConfig = {}
      const { helper, apollo, services, plugins, libraryServer } = await setup(pluginConfig)
      const ignore = true

      let tx
      helper.agent.on('transactionFinished', (transaction) => {
        if (transaction.name.includes('__ApolloServiceHealthCheck__')) {
          tx = transaction
        }
      })

      const gatewayService = await loadGateway(apollo, services, plugins)
      t.after(() => {
        helper.unload()
        libraryServer.stop()
        gatewayService.server.stop()
      })

      // trigger the healthcheck
      await gatewayService.gateway.serviceHealthCheck()
      assert.equal(tx.ignore, ignore, `should set transaction.ignore to ${ignore}`)
    })

    await t.test(
      'Should not ignore Health Check query when ' + 'captureHealthCheckQueries set to true',
      async (t) => {
        const pluginConfig = {
          captureHealthCheckQueries: true
        }
        const { helper, apollo, services, plugins, libraryServer } = await setup(pluginConfig)
        const ignore = false

        let tx
        helper.agent.on('transactionFinished', (transaction) => {
          if (transaction.name.includes('__ApolloServiceHealthCheck__')) {
            tx = transaction
          }
        })

        const gatewayService = await loadGateway(apollo, services, plugins)
        t.after(() => {
          helper.unload()
          libraryServer.stop()
          gatewayService.server.stop()
        })

        // trigger the healthcheck
        await gatewayService.gateway.serviceHealthCheck()
        assert.equal(tx.ignore, ignore, `should set transaction.ignore to ${ignore}`)
      }
    )
  }
)
