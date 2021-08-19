/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { executeQuery } = require('../test-client')
const { setupEnvConfig } = require('../agent-testing')
const { setupApolloServerTests } = require('../apollo-server-setup')
const queries = [
  `{
    __schema {
      queryType {
        fields {
          name
        }
      }
    }
  }`,
  `query introspectionType {
    __type(name: "Library") {
      fields {
        name
      }
    }
  }`
]

setupApolloServerTests({
  suiteName: 'default',
  createTests: createCaptureIntrospectionTests.bind(null, true)
})

setupApolloServerTests({
  suiteName: 'captureIntrospectionQueries: true',
  createTests: createCaptureIntrospectionTests.bind(null, false),
  pluginConfig: {
    captureIntrospectionQueries: true
  }
})

setupApolloServerTests({
  suiteName: 'captureIntrospectionQueries: false',
  createTests: createCaptureIntrospectionTests.bind(null, true),
  pluginConfig: {
    captureIntrospectionQueries: false
  }
})

function createCaptureIntrospectionTests(ignore, t) {
  setupEnvConfig(t)

  queries.forEach((query) => {
    t.test(
      `should ${ignore ? '' : 'not '}ignore transaction when
captureIntrospectionQuery is ${!ignore} and query contains
introspection types`,
      (t) => {
        const { helper, serverUrl } = t.context

        helper.agent.on('transactionFinished', (transaction) => {
          t.equal(transaction.ignore, ignore, `should set transaction.ignore to ${ignore}`)
        })

        executeQuery(serverUrl, query, (err) => {
          t.error(err)
          t.end()
        })
      }
    )
  })

  t.test(
    `should not ignore transaction when
captureIntrospectionQuery is ${!ignore} and query
does not contain an introspection type`,
    (t) => {
      const { helper, serverUrl } = t.context

      helper.agent.on('transactionFinished', (transaction) => {
        t.notOk(
          transaction.ignore,
          'should set transaction.ignore to false when not an introspection type'
        )
      })

      const query = `query GetAllForLibrary {
        library(branch: "downtown") {
          books {
            title
          }
        }
      }`
      executeQuery(serverUrl, query, (err) => {
        t.error(err)
        t.end()
      })
    }
  )
}
