/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { executeQuery } = require('../test-client')
const { setupEnvConfig } = require('../agent-testing')

const { setupApolloServerTests } = require('../apollo-server-setup')

const PluginStateLossTester = require('./plugin-state-loss-tester')
const stateLossTester = new PluginStateLossTester()

setupApolloServerTests({
  suiteName: 'State Loss',
  createTests: createStateLossTests,
  startingPlugins: [stateLossTester.getCreatePlugin()]
})

function createStateLossTests(t) {
  setupEnvConfig(t)

  t.afterEach((done) => {
    stateLossTester.clearStateLoss()
    done()
  })

  t.test('should not error when state loss prior to query', (t) => {
    stateLossTester.triggerOnRequestDidStart()

    const { serverUrl } = t.context

    const expectedName = 'GetAllForLibrary'
    const query = `query ${expectedName} {
      library(branch: "downtown") {
        books {
          title
          author {
            name
          }
        }
        magazines {
          title
          issue
        }
      }
    }`

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)

      if (result.errors) {
        result.errors.forEach((error) => {
          t.error(error)
        })
      }

      t.ok(result.data)
      t.ok(result.data.library)

      t.end()
    })
  })

  t.test('should not error when state loss just before sending response', (t) => {
    stateLossTester.tiggerOnWillSendResponse()

    const { serverUrl } = t.context

    const expectedName = 'GetAllForLibrary'
    const query = `query ${expectedName} {
      library(branch: "downtown") {
        books {
          title
          author {
            name
          }
        }
        magazines {
          title
          issue
        }
      }
    }`

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)

      if (result.errors) {
        result.errors.forEach((error) => {
          t.error(error)
        })
      }

      t.ok(result.data)
      t.ok(result.data.library)

      t.end()
    })
  })
}
