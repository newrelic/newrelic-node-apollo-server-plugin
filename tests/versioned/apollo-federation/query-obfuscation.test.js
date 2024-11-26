/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const assert = require('node:assert')

const { setupFederatedGatewayServerTests } = require('./federated-gateway-server-setup')

const { executeQuery } = require('../../test-client')
const { checkResult } = require('../common')

const SEGMENT_DESTINATION = 0x20

const ANON_PLACEHOLDER = '<anonymous>'

const QUERY_ATTRIBUTE_NAME = 'graphql.operation.query'

setupFederatedGatewayServerTests({
  suiteName: 'query obfuscation',
  createTests: createQueryObfuscaionTests
})

/**
 * Creates a set of standard transaction tests to run against various
 * apollo-server libraries.
 *
 * It is required that t.nr.helper and t.nr.serverUrl are set.
 *
 * @param {*} t a `node:test` context instance
 */
async function createQueryObfuscaionTests(t) {
  const OPERATION_PREFIX = 'GraphQL/operation/ApolloServer/query'

  await t.test('Obfuscates query arguments', (t, end) => {
    const { helper, serverUrl } = t.nr

    const query = `query {
      library(id: 3) {
        booksInStock {
          title
        }
      }
    }`

    const path = 'library.booksInStock.title'

    helper.agent.on('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/${ANON_PLACEHOLDER}/${path}`
      const operationSegment = findSegmentByName(transaction.trace.root, operationName)

      // only test one operation segment of three federated server transactions
      if (operationSegment) {
        const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)

        assert.ok(operationAttributes[QUERY_ATTRIBUTE_NAME].includes('library(***)') > 0)
      }
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(t, result, () => {
        end()
      })
    })
  })
}

function findSegmentByName(root, name) {
  if (root.name === name) {
    return root
  } else if (root.children && root.children.length) {
    for (let i = 0; i < root.children.length; i++) {
      const child = root.children[i]
      const found = findSegmentByName(child, name)
      if (found) {
        return found
      }
    }
  }

  return null
}
