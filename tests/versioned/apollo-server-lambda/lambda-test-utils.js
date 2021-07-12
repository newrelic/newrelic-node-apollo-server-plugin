/*
* Copyright 2020 New Relic Corporation. All rights reserved.
* SPDX-License-Identifier: Apache-2.0
*/

'use strict'

function executeQueryWithLambdaHandler(handler, query, context) {
  const jsonQuery = JSON.stringify({ query })
  const event = createApiEvent(jsonQuery)

  return handler(event, context)
}

function executeBatchQueriesWithLambdaHandler(handler, queries, context) {
  const data = queries.map((innerQuery) => {
    return { query: innerQuery }
  })
  const jsonQuery = JSON.stringify(data)
  const event = createApiEvent(jsonQuery)

  return handler(event, context)
}

function executeQueryJson(handler, query, context) {
  const event = createApiEvent(JSON.stringify(query))

  return handler(event, context)
}


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
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6)',
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
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6)',
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

module.exports = {
  executeQueryWithLambdaHandler,
  executeBatchQueriesWithLambdaHandler,
  executeQueryJson
}
