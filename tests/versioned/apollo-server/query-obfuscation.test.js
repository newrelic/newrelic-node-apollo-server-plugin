/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')

const { afterEach, setupCoreTest } = require('../../lib/test-tools')
const assert = require('node:assert')
const { executeQuery, executeJson } = require('../../lib/test-client')
const { checkResult } = require('../common')
const promiseReolvers = require('../../lib/promise-resolvers')
const findSegmentByName = require('../../lib/find-segment')

const SEGMENT_DESTINATION = 0x20
const ANON_PLACEHOLDER = '<anonymous>'
const QUERY_ATTRIBUTE_NAME = 'graphql.operation.query'
const OPERATION_PREFIX = 'GraphQL/operation/ApolloServer/query'
const UNKNOWN_OPERATION_NAME = 'GraphQL/operation/ApolloServer/<unknown>'

const pluginConfig = {}
const queryObfuscationTests = []

queryObfuscationTests.push({
  name: 'Obfuscates query arguments and nested query arguments',
  async fn(t) {
    const { helper, serverUrl } = t.nr
    const { promise, resolve } = promiseReolvers()

    const query = `query {
      library(branch: "riverside") {
        magazines {
          title
        },
        books(category: NOVEL) {
          title
        }
      }
    }`

    const path = 'library'

    helper.agent.once('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/${ANON_PLACEHOLDER}/${path}`
      const operationSegment = findSegmentByName(
        transaction.trace,
        transaction.trace.root,
        operationName
      )

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)

      assert.ok(operationAttributes[QUERY_ATTRIBUTE_NAME].includes('library(***)') > 0)
      assert.ok(operationAttributes[QUERY_ATTRIBUTE_NAME].includes('books(***)') > 0)
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(assert, result, () => {
        resolve()
      })
    })

    await promise
  }
})

queryObfuscationTests.push({
  name: 'Obfuscates query arguments with parenthesis and brackets',
  async fn(t) {
    const { helper, serverUrl } = t.nr
    const { promise, resolve } = promiseReolvers()

    const query = `query {
      library(branch: "rivers)i{de") {
        magazines {
          title
        }
      }
    }`

    const path = 'library.magazines.title'

    helper.agent.once('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/${ANON_PLACEHOLDER}/${path}`
      const operationSegment = findSegmentByName(
        transaction.trace,
        transaction.trace.root,
        operationName
      )

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)

      assert.ok(operationAttributes[QUERY_ATTRIBUTE_NAME].includes('library(***)') > 0)
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      checkResult(assert, result, () => {
        resolve()
      })
    })

    await promise
  }
})

queryObfuscationTests.push({
  name: 'Obfuscates parameterized query arguments',
  async fn(t) {
    const { helper, serverUrl } = t.nr
    const { promise, resolve } = promiseReolvers()
    const expectedName = 'ParamQueryWithArgs'
    const query = `query ${expectedName}($branch: String!) {
      library(branch: $branch) {
          magazines {
            title
          }
        }
      }`

    const queryJson = {
      operationName: expectedName,
      query,
      variables: {
        branch: 'riverside'
      }
    }

    const path = 'library.magazines.title'

    helper.agent.once('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/${expectedName}/${path}`
      const operationSegment = findSegmentByName(
        transaction.trace,
        transaction.trace.root,
        operationName
      )

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)

      assert.ok(operationAttributes[QUERY_ATTRIBUTE_NAME].includes('library(***)') > 0)
    })

    executeJson(serverUrl, queryJson, (err, result) => {
      assert.ifError(err)
      checkResult(assert, result, () => {
        resolve()
      })
    })

    await promise
  }
})

queryObfuscationTests.push({
  name: 'Obfuscates query arguments for failed query validation',
  async fn(t) {
    const { helper, serverUrl } = t.nr
    const { promise, resolve } = promiseReolvers()

    const query = `query {
      boooook(branch: "riverside") {
        magazines {
          title
        },
        books(category: NOVEL) {
          title
        }
      }
    }`

    const path = 'boooook'

    helper.agent.once('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/${ANON_PLACEHOLDER}/${path}`
      const operationSegment = findSegmentByName(
        transaction.trace,
        transaction.trace.root,
        operationName
      )

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)

      assert.ok(operationAttributes[QUERY_ATTRIBUTE_NAME].includes('boooook(***)') > 0)
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      assert.ok(result)
      assert.ok(result.errors)
      assert.equal(result.errors.length, 1) // should have one parsing error

      const [validationError] = result.errors
      assert.equal(validationError.extensions.code, 'GRAPHQL_VALIDATION_FAILED')
      resolve()
    })

    await promise
  }
})

queryObfuscationTests.push({
  name: 'Failed query parsing should not include query attribute',
  async fn(t) {
    const { helper, serverUrl } = t.nr
    const { promise, resolve } = promiseReolvers()

    const query = `query {
      blahblah()>>: "riverside") {
        magazines {
          title
      }
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      const operationName = UNKNOWN_OPERATION_NAME
      const operationSegment = findSegmentByName(
        transaction.trace,
        transaction.trace.root,
        operationName
      )

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)

      assert.equal(operationAttributes[QUERY_ATTRIBUTE_NAME], undefined)
    })

    executeQuery(serverUrl, query, (err, result) => {
      assert.ifError(err)
      assert.ok(result)
      assert.ok(result.errors)
      assert.equal(result.errors.length, 1) // should have one parsing error

      const [validationError] = result.errors
      assert.equal(validationError.extensions.code, 'GRAPHQL_PARSE_FAILED')
      resolve()
    })

    await promise
  }
})

test.afterEach(async (ctx) => {
  await afterEach({ t: ctx, testDir: __dirname })
})

for (const qoTest of queryObfuscationTests) {
  test(qoTest.name, async (t) => {
    await setupCoreTest({ t, pluginConfig, testDir: __dirname })
    await qoTest.fn(t)
  })
}
