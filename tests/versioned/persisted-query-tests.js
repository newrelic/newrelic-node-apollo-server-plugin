/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { makeRequest } = require('../test-client')
const crypto = require('crypto')

const ANON_PLACEHOLDER = '<anonymous>'

/**
 * It is required that t.context.helper and t.context.serverUrl are set.
 * @param {*} t a tap test instance
 */
function createPersistedTests(t) {
  const OPERATION_PREFIX = 'GraphQL/operation/ApolloServer'
  const RESOLVE_PREFIX = 'GraphQL/resolve/ApolloServer'

  t.test('should use the context.source when executing a persisted query', (t) => {
    const { helper, serverUrl } = t.context

    const query = '{ libraries { books { title author { name } } } }'
    const path = 'libraries.books'
    const querySha = crypto.createHash('sha256').update(query).digest('hex')
    const withQuery = `${serverUrl}?extensions={"persistedQuery":{"version":1,
      "sha256Hash":"${querySha}"}}&query=${query}`
    const persistedQuery = `${serverUrl}?extensions={"persistedQuery":{"version":1,
      "sha256Hash":"${querySha}"}}`

    helper.agent.once('transactionFinished', () => {
      const operationPart = `query/${ANON_PLACEHOLDER}/${path}`

      t.metrics([
        `${OPERATION_PREFIX}/${operationPart}`,
        `${RESOLVE_PREFIX}/libraries`,
        `${RESOLVE_PREFIX}/books`,
        `${RESOLVE_PREFIX}/author`
      ])
    })

    // first make a request with persistedQuery extension enabled and the query to persist
    makeRequest(withQuery, null, (err) => {
      t.error(err)

      // lastly, make a request with persistedQuery extension enabled
      // and without the query it should properly pull from query cache
      makeRequest(persistedQuery, null, (err) => {
        t.error(err)
        t.end()
      })
    })
  })
}

module.exports = {
  suiteName: 'persisted queries',
  createTests: createPersistedTests
}
