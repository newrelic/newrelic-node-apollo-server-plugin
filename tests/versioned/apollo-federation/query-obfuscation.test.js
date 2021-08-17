/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

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
 * Creates a set of standard transction tests to run against various
 * apollo-server libraries.
 * It is required that t.context.helper and t.context.serverUrl are set.
 * @param {*} t a tap test instance
 */
function createQueryObfuscaionTests(t) {
  const OPERATION_PREFIX = 'GraphQL/operation/ApolloServer/query'

  t.test('Obfuscates query arguments', (t) => {
    const { helper, serverUrl } = t.context

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

        t.ok(operationAttributes[QUERY_ATTRIBUTE_NAME].includes('library(***)') > 0)
      }
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
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
