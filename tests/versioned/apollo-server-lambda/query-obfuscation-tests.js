/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { executeQueryAssertResult } = require('./lambda-test-utils')
const { findSegmentByName } = require('../../agent-testing')

const SPAN_DESTINATION = 0x10
const SEGMENT_DESTINATION = 0x20

const QUERY_ATTRIBUTE_NAME = 'graphql.operation.query'

const OPERATION_PREFIX = 'GraphQL/operation/ApolloServer'
const RESOLVE_PREFIX = 'GraphQL/resolve/ApolloServer'

const { setupApolloServerLambdaTests } = require('./apollo-server-lambda-setup')

setupApolloServerLambdaTests({
  suiteName: 'lambda query obfuscation',
  createTests: createQueryObfuscationTests,
  pluginConfig: {
    captureScalars: true,
    customResolverAttributes({ context }) {
      return {
        stage: context.event.requestContext.stage
      }
    }
  }
})

function createQueryObfuscationTests(t) {
  t.test('Obfuscates query arguments', (t) => {
    const { helper, patchedHandler, stubContext, modVersion } = t.context

    const expectedName = 'GetBooksByLibrary'
    const query = `query ${expectedName} {
      library(branch: "rivers)i{de") {
        magazines {
          title
        }
      }
    }`

    const path = 'library.magazines.title'

    helper.agent.on('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${expectedName}/${path}`
      const operationSegment = findSegmentByName(transaction.trace.root, operationName)

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)

      t.ok(operationAttributes[QUERY_ATTRIBUTE_NAME].includes('library(***)') > 0)

      const resolverName = `${RESOLVE_PREFIX}/library`
      const resolverSegment = findSegmentByName(transaction.trace.root, resolverName)
      const resolverCustomAttributes = resolverSegment
        .getSpanContext()
        .customAttributes.get(SPAN_DESTINATION)
      t.match(
        resolverCustomAttributes,
        { stage: 'test' },
        'should have a contextual custom attribute'
      )
    })

    executeQueryAssertResult({
      handler: patchedHandler,
      query,
      context: stubContext,
      modVersion,
      t
    })
  })
}
