/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { executeQuery } = require('../test-client')
const { setupEnvConfig } = require('../agent-testing')

const { setupApolloServerTests } = require('../apollo-server-setup')

setupApolloServerTests({
  suiteName: 'State Loss',
  createTests: createStateLossTests,
  startingPlugins: [createStateLossPlugin]
})

function createStateLossTests(t) {
  setupEnvConfig(t)

  t.test('should should not error when state loss prior to query', (t) => {
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

function createStateLossPlugin(instrumentationApi) {
  return {
    requestDidStart() {
      // Setting active segment to null to mimic state loss
      instrumentationApi.setActiveSegment(null)
    }
  }
}
