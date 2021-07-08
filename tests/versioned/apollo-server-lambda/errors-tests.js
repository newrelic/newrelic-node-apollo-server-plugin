/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { executeQueryWithLambdaHandler } = require('./lambda-test-utils')
const agentTesting = require('../../agent-testing')

const ANON_PLACEHOLDER = '<anonymous>'
const UNKNOWN_OPERATION = '<unknown>'

const OPERATION_PREFIX = 'GraphQL/operation/ApolloServer'
const RESOLVE_PREFIX = 'GraphQL/resolve/ApolloServer'

const { setupApolloServerLambdaTests } = require('./apollo-server-lambda-setup')


function createErrorTests(t) {
  t.test('parsing error should be noticed and assigned to operation span', async (t) => {
    const { helper, patchedHandler, stubContext } = t.context

    const expectedErrorMessage = 'Syntax Error: Expected Name, found <EOF>.'
    const expectedErrorType = 'GraphQLError'

    const invalidQuery = `query {
      libraries {
        books {
          title
          author {
            name
          }
        }
      }
    ` // missing closing }

    helper.agent.on('transactionFinished', (transaction) => {
      const errorTraces = agentTesting.getErrorTraces(helper.agent)
      t.equal(errorTraces.length, 1)

      const errorTrace = errorTraces[0]

      const [, transactionName, errorMessage, errorType, params ] = errorTrace
      t.equal(transactionName, transaction.name)
      t.equal(errorMessage, expectedErrorMessage)
      t.equal(errorType, expectedErrorType)

      const { agentAttributes } = params

      t.ok(agentAttributes.spanId)

      const matchingSpan = agentTesting.findSpanById(helper.agent, agentAttributes.spanId)

      const {attributes, intrinsics} = matchingSpan
      t.equal(intrinsics.name, `${OPERATION_PREFIX}/${UNKNOWN_OPERATION}`)
      t.equal(attributes['error.message'], expectedErrorMessage)
      t.equal(attributes['error.class'], expectedErrorType)
    })

    const result = await executeQueryWithLambdaHandler(patchedHandler, invalidQuery, stubContext)

    t.ok(result.body)

    const jsonResult = JSON.parse(result.body)

    t.ok(jsonResult)

    t.ok(jsonResult.errors)
    t.equal(jsonResult.errors.length, 1) // should have one parsing error

    const [parseError] = jsonResult.errors
    t.equal(parseError.extensions.code, 'GRAPHQL_PARSE_FAILED')

    t.end()
  })

  t.test('validation error should be noticed and assigned to operation span', async (t) => {
    const { helper, patchedHandler, stubContext } = t.context

    const expectedErrorMessage = 'Cannot query field "doesnotexist" on type "Book".'
    const expectedErrorType = 'GraphQLError'

    const invalidQuery = `query {
      libraries {
        books {
          title
          doesnotexist {
            name
          }
        }
      }
    }`

    const deepestPath = 'libraries.books.doesnotexist.name'
    const expectedOperationName
      = `${OPERATION_PREFIX}/query/${ANON_PLACEHOLDER}/${deepestPath}`

    helper.agent.on('transactionFinished', (transaction) => {
      const errorTraces = agentTesting.getErrorTraces(helper.agent)
      t.equal(errorTraces.length, 1)

      const errorTrace = errorTraces[0]

      const [, transactionName, errorMessage, errorType, params] = errorTrace
      t.equal(transactionName, transaction.name)
      t.equal(errorMessage, expectedErrorMessage)
      t.equal(errorType, expectedErrorType)

      const { agentAttributes } = params

      t.ok(agentAttributes.spanId)

      const matchingSpan = agentTesting.findSpanById(helper.agent, agentAttributes.spanId)

      const {attributes, intrinsics} = matchingSpan
      t.equal(intrinsics.name, expectedOperationName)
      t.equal(attributes['error.message'], expectedErrorMessage)
      t.equal(attributes['error.class'], expectedErrorType)
    })

    const result = await executeQueryWithLambdaHandler(patchedHandler, invalidQuery, stubContext)

    t.ok(result.body)

    const jsonResult = JSON.parse(result.body)

    t.ok(jsonResult)

    t.ok(jsonResult.errors)
    t.equal(jsonResult.errors.length, 1) // should have one parsing error

    const [parseError] = jsonResult.errors
    t.equal(parseError.extensions.code, 'GRAPHQL_VALIDATION_FAILED')

    t.end()
  })

  t.test('resolver error should be noticed and assigned to resolve span', async (t) => {
    const { helper, patchedHandler, stubContext } = t.context

    const expectedErrorMessage = 'Boom goes the dynamite!'
    const expectedErrorType = 'Error'

    const expectedName = 'BOOM'
    const invalidQuery = `query ${expectedName} {
      boom
    }`

    const expectedResolveName = `${RESOLVE_PREFIX}/boom`

    helper.agent.on('transactionFinished', (transaction) => {
      const errorTraces = agentTesting.getErrorTraces(helper.agent)
      t.equal(errorTraces.length, 1)

      const errorTrace = errorTraces[0]

      const [, transactionName, errorMessage, errorType, params] = errorTrace
      t.equal(transactionName, transaction.name)
      t.equal(errorMessage, expectedErrorMessage)
      t.equal(errorType, expectedErrorType)

      const { agentAttributes } = params

      t.ok(agentAttributes.spanId)

      const matchingSpan = agentTesting.findSpanById(helper.agent, agentAttributes.spanId)

      const {attributes, intrinsics} = matchingSpan
      t.equal(intrinsics.name, expectedResolveName)
      t.equal(attributes['error.message'], expectedErrorMessage)
      t.equal(attributes['error.class'], expectedErrorType)
    })

    const result = await executeQueryWithLambdaHandler(patchedHandler, invalidQuery, stubContext)

    t.ok(result.body)

    const jsonResult = JSON.parse(result.body)

    t.ok(jsonResult)

    t.ok(jsonResult.errors)
    t.equal(jsonResult.errors.length, 1) // should have one parsing error

    const [parseError] = jsonResult.errors
    t.equal(parseError.extensions.code, 'INTERNAL_SERVER_ERROR')

    t.end()
  })
}

setupApolloServerLambdaTests({
  suiteName: 'lambda errors',
  createTests: createErrorTests,
  pluginConfig: {
    captureScalars: true
  }
})
