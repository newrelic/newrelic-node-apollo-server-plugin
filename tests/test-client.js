/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const http = require('http')

/**
 * Execute a GraphQL POST request with multiple queries batched.
 * Data will be sent up in form [{ query: <input 0> }, { query: <input 1> }, ...]
 */
function executeQueryBatch(url, queries, callback) {
  const data = queries.map((innerQuery) => {
    return { query: innerQuery }
  })

  const postData = JSON.stringify(data)

  makeRequest(url, postData, callback)
}

/**
 * Execute a GraphQL POST request for a single query.
 * Data will be sent up in form { query: <input> }
 */
function executeQuery(url, query, callback) {
  const postData = JSON.stringify({ query })

  makeRequest(url, postData, callback)
}

/**
 * Execute a GraphQL POST request with the given JSON.
 * Data will not be modified other than stringifying.
 */
function executeJson(url, json, callback) {
  const postData = JSON.stringify(json)
  makeRequest(url, postData, callback)
}

function makeRequest(url, postData, callback) {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  if (postData) {
    options.method = 'POST'
    options.headers['Content-Length'] = Buffer.byteLength(postData)
  }

  const req = http.request(url, options, (res) => {
    res.setEncoding('utf8')

    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', () => {
      const result = JSON.parse(data)
      callback(null, result)
    })
  })

  req.on('error', (e) => {
    callback(e)
  })

  if (postData) {
    req.write(postData)
  }
  req.end()
}

module.exports = {
  executeJson,
  executeQuery,
  executeQueryBatch,
  makeRequest
}
