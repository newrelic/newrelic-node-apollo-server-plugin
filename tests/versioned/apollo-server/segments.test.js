/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')
const promiseResolvers = require('../../lib/promise-resolvers')
const { executeQuery } = require('../../lib/test-client')
const { afterEach, setupCoreTest } = require('../../lib/test-tools')
const { checkResult, baseSegment } = require('../common')
const assert = require('node:assert')

const expressSegmentsTests = require('../express-segments-tests')
const { assertSegments, assertMetrics } = require('../../lib/custom-assertions')
const OPERATION_PREFIX = 'GraphQL/operation/ApolloServer'
const RESOLVE_PREFIX = 'GraphQL/resolve/ApolloServer'

test.afterEach(async (ctx) => {
  await afterEach({ t: ctx, testDir: __dirname })
})

for (const defTest of expressSegmentsTests.tests) {
  test(`non-scalar: ${defTest.name}`, async (t) => {
    await setupCoreTest({ t, testDir: __dirname })
    t.nr.TRANSACTION_PREFIX = 'WebTransaction/Expressjs/POST'
    await defTest.fn(t)
  })
}

const { pluginConfig } = { captureScalars: true }
for (const scalarTest of expressSegmentsTests.tests) {
  test(`scalar: ${scalarTest.name}`, async (t) => {
    await setupCoreTest({ t, testDir: __dirname, pluginConfig })
    t.nr.TRANSACTION_PREFIX = 'WebTransaction/Expressjs/POST'
    await scalarTest.fn(t)
  })
}

test('fragmented trace does not add segments to trace but still records metrics for operation/resolver actions', async (t) => {
  // set the max_trace_segments to 7 to exclude capturing the operation and resolver segments as part of tx trace
  // see: https://github.com/newrelic/newrelic-node-apollo-server-plugin/issues/344
  await setupCoreTest({ t, testDir: __dirname, agentConfig: { max_trace_segments: 7 } })
  const {
    helper,
    serverUrl,
    apolloServerPkg: { isApollo4 }
  } = t.nr
  const { promise, resolve } = promiseResolvers()
  const expectedName = 'testQuery'
  const query = `query ${expectedName} {
    libraries {
      books {
        title
        author {
          name
        }
      }
    }
  }`

  const path = 'libraries.books'

  helper.agent.once('transactionFinished', (transaction) => {
    const operationPart = `query/${expectedName}/${path}`
    const firstSegmentName = baseSegment(operationPart, 'WebTransaction/Expressjs/POST')
    const expectedSegments = [firstSegmentName]
    if (isApollo4) {
      expectedSegments.push(['Nodejs/Middleware/Expressjs/<anonymous>'])
    } else {
      expectedSegments.push(['Expressjs/Router: /'])
    }
    assertSegments(transaction.trace, transaction.trace.root, expectedSegments, { exact: false })

    const expectedMetrics = [
      [{ name: `${OPERATION_PREFIX}/${operationPart}` }],
      [{ name: `${RESOLVE_PREFIX}/Query.libraries` }],
      [{ name: `${RESOLVE_PREFIX}/Library.books` }],
      [{ name: `${RESOLVE_PREFIX}/Book.author` }]
    ]

    assertMetrics(transaction.metrics, expectedMetrics)
  })

  executeQuery(serverUrl, query, (err, result) => {
    assert.ifError(err)
    checkResult(assert, result, resolve)
  })

  await promise
})
