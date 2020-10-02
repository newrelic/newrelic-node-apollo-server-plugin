/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { executeQuery } = require('./test-client')
const agentTesting = require('./agent-testing')

const ANON_PLACEHOLDER = '<anonymous>'
const UNKNOWN_OPERATION_PLACEHOLDER = '<operation unknown>'

/**
 * Creates a set of standard error capture tests to run against various
 * apollo-server libraries.
 * It is required that t.context.helper and t.context.serverUrl are set.
 * @param {*} t a tap test instance
 */
function createErrorTests(t) {
  t.test('parsing error should be noticed and assigned to operation span', (t) => {
    const { helper, serverUrl } = t.context

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

      const [, transactionName, errorMessage, errorType, params] = errorTrace
      t.equal(transactionName, transaction.name)
      t.equal(errorMessage, expectedErrorMessage)
      t.equal(errorType, expectedErrorType)

      const { agentAttributes } = params

      t.ok(agentAttributes.spanId)

      const matchingSpan = agentTesting.findSpanById(helper.agent, agentAttributes.spanId)

      const {attributes, intrinsics} = matchingSpan
      t.equal(intrinsics.name, UNKNOWN_OPERATION_PLACEHOLDER)
      t.equal(attributes['error.message'], expectedErrorMessage)
      t.equal(attributes['error.class'], expectedErrorType)
    })

    executeQuery(serverUrl, invalidQuery, (err, result) => {
      t.error(err)

      t.ok(result)
      t.ok(result.errors)
      t.equal(result.errors.length, 1) // should have one parsing error

      const [parseError] = result.errors
      t.equal(parseError.extensions.code, 'GRAPHQL_PARSE_FAILED')

      t.end()
    })
  })

  t.test('validation error should be noticed and assigned to operation span', (t) => {
    const { helper, serverUrl } = t.context

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

    const expectedOperationName = `query ${ANON_PLACEHOLDER}`

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

    executeQuery(serverUrl, invalidQuery, (err, result) => {
      t.error(err)

      t.ok(result)
      t.ok(result.errors)
      t.equal(result.errors.length, 1) // should have one parsing error

      const [validationError] = result.errors
      t.equal(validationError.extensions.code, 'GRAPHQL_VALIDATION_FAILED')

      t.end()
    })
  })

  t.test('resolver error should be noticed and assigned to resolve span', (t) => {
    const { helper, serverUrl } = t.context

    const expectedErrorMessage = 'Boom goes the dynamite!'
    const expectedErrorType = 'Error'

    const expectedName = 'BOOM'
    const invalidQuery = `query ${expectedName} {
      boom
    }`

    const expectedResolveName = 'resolve: boom'

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

    executeQuery(serverUrl, invalidQuery, (err, result) => {
      t.error(err)

      t.ok(result)
      t.ok(result.errors)
      t.equal(result.errors.length, 1) // should have one parsing error

      const [resolverError] = result.errors
      t.equal(resolverError.extensions.code, 'INTERNAL_SERVER_ERROR')

      t.end()
    })
  })
}


module.exports = {
  suiteName: 'errors',
  createTests: createErrorTests
}
