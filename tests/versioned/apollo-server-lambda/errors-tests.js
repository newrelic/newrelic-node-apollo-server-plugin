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

setupApolloServerLambdaTests({
  suiteName: 'lambda errors',
  createTests: createErrorTests,
  pluginConfig: {
    captureScalars: true
  }
})

/**
 * Creates a set of standard error capture tests to run against various
 * apollo-server libraries.
 * It is required that t.context.helper and t.context.serverUrl are set.
 * @param {*} t a tap test instance
 */
function createErrorTests(t) {
  t.test('parsing error should be noticed and assigned to operation span', (t) => {
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

      const segment = agentTesting.findSegmentByName(
        transaction.trace.root,
        `${OPERATION_PREFIX}/${UNKNOWN_OPERATION}`)
      t.ok(segment)

      const { attributes } = segment.attributes
      t.equal(attributes['error.message'].value, expectedErrorMessage)
      t.equal(attributes['error.class'].value, expectedErrorType)
    })

    executeQueryWithLambdaHandler
    (patchedHandler, invalidQuery, stubContext, (err, result) => {
      t.error(err)

      t.ok(result.body)

      const jsonResult = JSON.parse(result.body)

      t.ok(jsonResult)

      t.ok(jsonResult.errors)
      t.equal(jsonResult.errors.length, 1) // should have one parsing error

      const [parseError] = jsonResult.errors
      t.equal(parseError.extensions.code, 'GRAPHQL_PARSE_FAILED')

      t.end()
    })
  })

  t.test('validation error should be noticed and assigned to operation span', (t) => {
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

      const segment = agentTesting.findSegmentByName(
        transaction.trace.root,
        expectedOperationName)
      t.ok(segment)

      const { attributes } = segment.attributes
      t.equal(attributes['error.message'].value, expectedErrorMessage)
      t.equal(attributes['error.class'].value, expectedErrorType)
    })

    executeQueryWithLambdaHandler
    (patchedHandler, invalidQuery, stubContext, (err, result) => {
      t.error(err)

      t.ok(result.body)

      const jsonResult = JSON.parse(result.body)

      t.ok(jsonResult)

      t.ok(jsonResult.errors)
      t.equal(jsonResult.errors.length, 1) // should have one parsing error

      const [validationError] = jsonResult.errors
      t.equal(validationError.extensions.code, 'GRAPHQL_VALIDATION_FAILED')

      t.end()
    })
  })

  t.test('resolver error should be noticed and assigned to resolve span', (t) => {
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

      const [, transactionName, errorMessage, errorType] = errorTrace
      t.equal(transactionName, transaction.name)
      t.equal(errorMessage, expectedErrorMessage)
      t.equal(errorType, expectedErrorType)

      const segment = agentTesting.findSegmentByName(
        transaction.trace.root,
        expectedResolveName)
      t.ok(segment)

      const { attributes } = segment.attributes
      t.equal(attributes['error.message'].value, expectedErrorMessage)
      t.equal(attributes['error.class'].value, expectedErrorType)
    })

    executeQueryWithLambdaHandler
      (patchedHandler, invalidQuery, stubContext, (err, result) => {
        t.error(err)

        t.ok(result.body)

        const jsonResult = JSON.parse(result.body)

        t.ok(jsonResult)

        t.ok(jsonResult.errors)
        t.equal(jsonResult.errors.length, 1) // should have one parsing error

        const [resolverError] = jsonResult.errors
        t.equal(resolverError.extensions.code, 'INTERNAL_SERVER_ERROR')

        t.end()
      })
  })
}


module.exports = {
  suiteName: 'errors',
  createTests: createErrorTests
}
