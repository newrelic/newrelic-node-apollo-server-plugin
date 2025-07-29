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
const semver = require('semver')

const expressSegmentsTests = require('./express-segments-tests')
const { assertSegments, assertMetrics } = require('../../lib/custom-assertions')
const OPERATION_PREFIX = 'GraphQL/operation/ApolloServer'
const RESOLVE_PREFIX = 'GraphQL/resolve/ApolloServer'

test.afterEach(async (ctx) => {
  await afterEach({ t: ctx, testDir: __dirname })
})

for (const defTest of expressSegmentsTests.tests) {
  test(`non-scalar: ${defTest.name}`, async (t) => {
    await setupCoreTest({ t, testDir: __dirname })
    const prefix = semver.gte(t.nr.apolloServerPkg.apolloVersion, '5.0.0')
      ? 'WebTransaction/Nodejs/POST'
      : 'WebTransaction/Expressjs/POST'
    t.nr.TRANSACTION_PREFIX = prefix
    await defTest.fn(t)
  })
}

const { pluginConfig } = { captureScalars: true }
for (const scalarTest of expressSegmentsTests.tests) {
  test(`scalar: ${scalarTest.name}`, async (t) => {
    await setupCoreTest({ t, testDir: __dirname, pluginConfig })
    const prefix = semver.gte(t.nr.apolloServerPkg.apolloVersion, '5.0.0')
      ? 'WebTransaction/Nodejs/POST'
      : 'WebTransaction/Expressjs/POST'
    t.nr.TRANSACTION_PREFIX = prefix
    await scalarTest.fn(t)
  })
}

test('fragmented trace does not add segments to trace but still records metrics for operation/resolver actions', async (t) => {
  // set the max_trace_segments to 7 to exclude capturing the operation and resolver segments as part of tx trace
  // see: https://github.com/newrelic/newrelic-node-apollo-server-plugin/issues/344
  await setupCoreTest({ t, testDir: __dirname, agentConfig: { max_trace_segments: 7 } })
  const { helper, serverUrl } = t.nr
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
    const prefix = semver.gte(t.nr.apolloServerPkg.apolloVersion, '5.0.0')
      ? 'WebTransaction/Nodejs/POST'
      : 'WebTransaction/Expressjs/POST'
    const firstSegmentName = baseSegment(operationPart, prefix)
    const expectedSegments = [firstSegmentName]
    // apollo 4.x includes a handler for the express middleware
    if (prefix.includes('Express')) {
      expectedSegments.push(['Nodejs/Middleware/Expressjs/<anonymous>'])
    }
    // for apollo 5+ there are no express related segments because it doesn't use express
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
