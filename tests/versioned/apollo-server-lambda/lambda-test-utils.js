/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const { checkResult } = require('../common')
const utils = module.exports

/**
 * Apollo Server Lambda introduced promise-based handlers
 * in [2.21.1](https://github.com/apollographql/apollo-server/blob/release-3.0/CHANGELOG.md#v2211)
 * and in 3.0.0 requires promise-based handlers, this helper
 * checks and decides which method to execute lambda handler
 */
function requiresCallback(version) {
  return version < '2.21.1'
}

/**
 * callback that verifies no error occurred
 * and result is as expected
 *
 * @param {Tap.Test} t
 * @param {Error} err
 * @param {*} result of lambda handler
 */
function resultCallback(t, err, result) {
  t.error(err)
  checkResult(t, result, () => {
    t.end()
  })
}

/**
 * Executes a lambda handler and asserts no errors occurred
 * and result is as expected
 *
 * @param {Object} params
 * @param {Function} params.handler to execute
 * @param {string} params.query to execute
 * @param {Object} params.context lambda context
 * @param {string} params.modVersion version of lambda-server-lambda package
 * @param {Tap.Test} params.t
 */
utils.executeQueryAssertResult = async function executeQueryAssertResult({
  handler,
  query,
  context,
  modVersion,
  t
}) {
  const jsonQuery = JSON.stringify({ query })
  const event = createApiEvent(jsonQuery)

  if (requiresCallback(modVersion)) {
    handler(event, context, resultCallback.bind(null, t))
  } else {
    const result = await handler(event, context)
    checkResult(t, result, () => {
      t.end()
    })
  }
}

/**
 * Executes a lambda handler and asserts no errors occurred
 * Only diff between this and executeQueryAssertResult is the query
 * contains more than a query string
 *
 * @param {Object} params
 * @param {Function} params.handler to execute
 * @param {string} params.query to execute
 * @param {Object} params.context lambda context
 * @param {string} params.modVersion version of lambda-server-lambda package
 * @param {Tap.Test} params.t
 */
utils.executeQueryJson = async function executeQueryJson({
  handler,
  query,
  context,
  modVersion,
  t
}) {
  const jsonQuery = JSON.stringify(query)
  const event = createApiEvent(jsonQuery)

  if (requiresCallback(modVersion)) {
    handler(event, context, (err) => {
      t.error(err)
      t.end()
    })
  } else {
    await handler(event, context)
    t.end()
  }
}

/**
 * Executes a lambda handler with a batch of queries
 * and asserts no errors occurred and result is as
 * expected
 *
 * @param {Object} params
 * @param {Function} params.handler to execute
 * @param {string} params.queries to execute
 * @param {Object} params.context lambda context
 * @param {string} params.modVersion version of lambda-server-lambda package
 * @param {Tap.Test} params.t
 */
utils.executeBatchAssertResult = async function executeBatchAssertResult({
  handler,
  queries,
  context,
  modVersion,
  t
}) {
  const data = queries.map((innerQuery) => {
    return { query: innerQuery }
  })
  const jsonQuery = JSON.stringify(data)
  const event = createApiEvent(jsonQuery)

  if (requiresCallback(modVersion)) {
    handler(event, context, resultCallback.bind(null, t))
  } else {
    const result = await handler(event, context)
    t.ok(result.body)

    const jsonResult = JSON.parse(result.body)
    t.equal(jsonResult.length, 2)
    checkResult(t, result, () => {
      t.end()
    })
  }
}

/**
 * A series of assertions used to assert an error
 * occurred when executing a lambda handler
 *
 * @param {*} result of executing lambda handler
 * @param {string} code to assert in response body
 * @param {Tap.Test} t
 */
function assertErrorBody({ result, code, t }) {
  t.ok(result.body)
  const jsonResult = JSON.parse(result.body)
  t.ok(jsonResult)
  t.ok(jsonResult.errors)
  t.equal(jsonResult.errors.length, 1) // should have one parsing error
  const [parseError] = jsonResult.errors
  t.equal(parseError.extensions.code, code)
  t.end()
}

/**
 * callback that verifies an error occurred
 * and error result is as expected
 *
 * @param {Tap.Test} t
 * @param {string} code to assert in response body
 * @param {Error} err
 * @param {*} result of lambda handler
 */
function errorCallback(t, code, err, result) {
  t.error(err)
  assertErrorBody({ result, code, t })
}

/**
 * Executes a lambda handler and asserts an error occurred
 * and result is as expected
 *
 * @param {Object} params
 * @param {Function} params.handler to execute
 * @param {string} params.query to execute
 * @param {Object} params.context lambda context
 * @param {string} params.modVersion version of lambda-server-lambda package
 * @param {Tap.Test} params.t
 * @param {string} params.code to assert in response body
 */
utils.executeQueryAssertErrors = async function executeQueryAssertErrors({
  handler,
  query,
  context,
  modVersion,
  t,
  code
}) {
  const jsonQuery = JSON.stringify({ query })
  const event = createApiEvent(jsonQuery)

  if (requiresCallback(modVersion)) {
    handler(event, context, errorCallback.bind(null, t, code))
  } else {
    const result = await handler(event, context)
    assertErrorBody({ result, code, t })
  }
}

/**
 * Creates a formatted API Gateway Proxy event
 * to be used to execute a lambda handler
 *
 * @param {string} query to execute
 */
function createApiEvent(query) {
  const apiGatewayProxyEvent = {
    path: '/graphql',
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate, lzma, sdch, br',
      'Accept-Language': 'en-US,en;q=0.8',
      // must be lowercased as this is used in the bodyParser
      // and assumes the header is lowercased
      'content-type': 'application/json',
      'CloudFront-Forwarded-Proto': 'https',
      'CloudFront-Is-Desktop-Viewer': 'true',
      'CloudFront-Is-Mobile-Viewer': 'false',
      'CloudFront-Is-SmartTV-Viewer': 'false',
      'CloudFront-Is-Tablet-Viewer': 'false',
      'CloudFront-Viewer-Country': 'US',
      'Host': 'wt6mne2s9k.execute-api.us-west-2.amazonaws.com',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6)',
      'Via': '1.1 fb7cca60f0ecd82ce07790c9c5eef16c.cloudfront.net (CloudFront)',
      'X-Amz-Cf-Id': 'nBsWBOrSHMgnaROZJK1wGCZ9PcRcSpq_oSXZNQwQ10OTZL4cimZo3g==',
      'X-Forwarded-For': '192.168.100.1, 192.168.1.1',
      'X-Forwarded-Port': '443',
      'X-Forwarded-Proto': 'https'
    },
    requestContext: {
      accountId: '123456789012',
      resourceId: 'us4z18',
      stage: 'test',
      requestId: '41b45ea3-70b5-11e6-b7bd-69b5aaebc7d9',
      identity: {
        cognitoIdentityPoolId: '',
        accountId: '',
        cognitoIdentityId: '',
        caller: '',
        apiKey: '',
        sourceIp: '192.168.100.1',
        cognitoAuthenticationType: '',
        cognitoAuthenticationProvider: '',
        userArn: '',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6)',
        user: ''
      },
      resourcePath: '/{proxy+}',
      httpMethod: 'GET',
      apiId: 'wt6mne2s9k'
    },
    resource: '/{proxy+}',
    httpMethod: 'POST',
    body: query
  }

  return apiGatewayProxyEvent
}
