/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { executeQuery, executeJson } = require('../test-client')
const { findSegmentByName } = require('../agent-testing')

const SEGMENT_DESTINATION = 0x20

const ANON_PLACEHOLDER = '<anonymous>'

const OPERATION_PREFIX = 'GraphQL/operation/ApolloServer'

/**
 * Creates a set of standard attribute tests to run against various
 * apollo-server libraries.
 * It is required that t.context.helper and t.context.serverUrl are set.
 * @param {*} t a tap test instance
 */
function createAttributesTests(t) {
  t.test('anon query should capture standard attributes except operation name', (t) => {
    const { helper, serverUrl } = t.context

    const query = `query {
      hello
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${ANON_PLACEHOLDER}/hello`
      const operationSegment = findSegmentByName(transaction.trace.root, operationName)

      const expectedOperationAttributes = {
        'graphql.operation.type': 'query'
      }

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)
      t.matches(
        operationAttributes,
        expectedOperationAttributes,
        'should have operation attributes'
      )

      const hasAttribute = Object.hasOwnProperty.bind(operationAttributes)
      t.notOk(hasAttribute('graphql.operation.name'))

      const resolveHelloSegment = operationSegment.children[0]

      const expectedResolveAttributes = {
        'graphql.field.name': 'hello',
        'graphql.field.returnType': 'String',
        'graphql.field.parentType': 'Query',
        'graphql.field.path': 'hello'
      }

      const resolveAttributes = resolveHelloSegment.attributes.get(SEGMENT_DESTINATION)
      t.matches(
        resolveAttributes,
        expectedResolveAttributes,
        'should have field resolve attributes'
      )
    })

    executeQuery(serverUrl, query, (err) => {
      t.error(err)
      t.end()
    })
  })

  t.test('named query should capture all standard attributes', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName = 'HeyThere'
    const query = `query ${expectedName} {
      hello
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${expectedName}/hello`
      const operationSegment = findSegmentByName(transaction.trace.root, operationName)

      const expectedOperationAttributes = {
        'graphql.operation.type': 'query',
        'graphql.operation.name': expectedName
      }

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)
      t.matches(
        operationAttributes,
        expectedOperationAttributes,
        'should have operation attributes'
      )

      const resolveHelloSegment = operationSegment.children[0]

      const expectedResolveAttributes = {
        'graphql.field.name': 'hello',
        'graphql.field.returnType': 'String',
        'graphql.field.parentType': 'Query',
        'graphql.field.path': 'hello'
      }

      const resolveAttributes = resolveHelloSegment.attributes.get(SEGMENT_DESTINATION)
      t.matches(
        resolveAttributes,
        expectedResolveAttributes,
        'should have field resolve attributes'
      )
    })

    executeQuery(serverUrl, query, (err) => {
      t.error(err)
      t.end()
    })
  })

  t.test('named query, multi-level, should capture deepest unique path', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName = 'GetBooksByLibrary'
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

    const deepestPath = 'libraries.books'

    helper.agent.on('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${expectedName}/${deepestPath}`
      const operationSegment = findSegmentByName(transaction.trace.root, operationName)

      const expectedOperationAttributes = {
        'graphql.operation.type': 'query',
        'graphql.operation.name': expectedName
      }

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)
      t.matches(
        operationAttributes,
        expectedOperationAttributes,
        'should have operation attributes'
      )

      const [resolveLibrariesSegment, resolveBooksSegment] = operationSegment.children

      const expectedLibrariesAttributes = {
        'graphql.field.name': 'libraries',
        'graphql.field.returnType': '[Library]',
        'graphql.field.parentType': 'Query',
        'graphql.field.path': 'libraries'
      }

      const resolveLibrariesAttributes
         = resolveLibrariesSegment.attributes.get(SEGMENT_DESTINATION)
      t.matches(
        resolveLibrariesAttributes,
        expectedLibrariesAttributes,
        'should have field resolve attributes for libraries'
      )

      const expectedBooksAttributes = {
        'graphql.field.name': 'books',
        'graphql.field.returnType': '[Book!]',
        'graphql.field.parentType': 'Library',
        'graphql.field.path': 'libraries.book'
      }

      const resolveBooksAttributes
         = resolveBooksSegment.attributes.get(SEGMENT_DESTINATION)
      t.matches(
        resolveBooksAttributes,
        expectedBooksAttributes,
        'should have field resolve attributes for books'
      )
    })

    executeQuery(serverUrl, query, (err) => {
      t.error(err)
      t.end()
    })
  })

  t.test('query with alias should use alias in path attributes', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName = 'GetBooksByLibrary'
    const query = `query ${expectedName} {
      alias: libraries {
        books {
          title
          author {
            name
          }
        }
      }
    }`

    const deepestPath = 'libraries.books'

    helper.agent.on('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${expectedName}/${deepestPath}`
      const operationSegment = findSegmentByName(transaction.trace.root, operationName)

      const expectedOperationAttributes = {
        'graphql.operation.type': 'query',
        'graphql.operation.name': expectedName
      }

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)
      t.matches(
        operationAttributes,
        expectedOperationAttributes,
        'should have operation attributes'
      )

      const [resolveLibrariesSegment, resolveBooksSegment] = operationSegment.children

      const expectedLibrariesAttributes = {
        'graphql.field.name': 'libraries',
        'graphql.field.returnType': '[Library]',
        'graphql.field.parentType': 'Query',
        'graphql.field.path': 'alias'
      }

      const resolveLibrariesAttributes
         = resolveLibrariesSegment.attributes.get(SEGMENT_DESTINATION)
      t.matches(
        resolveLibrariesAttributes,
        expectedLibrariesAttributes,
        'should have field resolve attributes for libraries'
      )

      const expectedBooksAttributes = {
        'graphql.field.name': 'books',
        'graphql.field.returnType': '[Book!]',
        'graphql.field.parentType': 'Library',
        'graphql.field.path': 'alias.book'
      }

      const resolveBooksAttributes
         = resolveBooksSegment.attributes.get(SEGMENT_DESTINATION)
      t.matches(
        resolveBooksAttributes,
        expectedBooksAttributes,
        'should have field resolve attributes for books'
      )
    })

    executeQuery(serverUrl, query, (err) => {
      t.error(err)
      t.end()
    })
  })

  t.test('named mutation should capture all standard attributes', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName = 'AddThing'
    const query = `mutation ${expectedName} {
      addThing(name: "added thing!")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/mutation/${expectedName}/addThing`

      const operationSegment = findSegmentByName(transaction.trace.root, operationName)

      const expectedOperationAttributes = {
        'graphql.operation.type': 'mutation',
        'graphql.operation.name': expectedName
      }

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)
      t.matches(
        operationAttributes,
        expectedOperationAttributes,
        'should have operation attributes'
      )

      const resolveHelloSegment = operationSegment.children[0]

      const expectedResolveAttributes = {
        'graphql.field.name': 'addThing',
        'graphql.field.returnType': 'String',
        'graphql.field.parentType': 'Mutation',
        'graphql.field.path': 'addThing'
      }

      const resolveAttributes = resolveHelloSegment.attributes.get(SEGMENT_DESTINATION)
      t.matches(
        resolveAttributes,
        expectedResolveAttributes,
        'should have field resolve attributes'
      )
    })

    executeQuery(serverUrl, query, (err) => {
      t.error(err)
      t.end()
    })
  })

  t.test('named mutation should not capture args by default', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName = 'AddThing'
    const query = `mutation ${expectedName} {
      addThing(name: "added thing!")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/mutation/${expectedName}/addThing`

      const operationSegment = findSegmentByName(transaction.trace.root, operationName)
      const resolveHelloSegment = operationSegment.children[0]

      const resolveAttributes = resolveHelloSegment.attributes.get(SEGMENT_DESTINATION)

      const hasAttribute = Object.hasOwnProperty.bind(resolveAttributes)
      t.notOk(hasAttribute('graphql.field.args.name'))
    })

    executeQuery(serverUrl, query, (err) => {
      t.error(err)
      t.end()
    })
  })

  t.test('named mutation should capture args when added to include list', (t) => {
    const { helper, serverUrl } = t.context

    helper.agent.config.attributes.include = ['graphql.field.args.*']
    helper.agent.config.emit('attributes.include')

    const expectedName = 'AddThing'
    const query = `mutation ${expectedName} {
      addThing(name: "added thing!")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/mutation/${expectedName}/addThing`

      const operationSegment = findSegmentByName(transaction.trace.root, operationName)
      const resolveHelloSegment = operationSegment.children[0]

      const resolveAttributes = resolveHelloSegment.attributes.get(SEGMENT_DESTINATION)
      t.matches(resolveAttributes, {'graphql.field.args.name': 'added thing!'})
    })

    executeQuery(serverUrl, query, (err) => {
      t.error(err)
      t.end()
    })
  })

  t.test('named query should capture args when added to include list', (t) => {
    const { helper, serverUrl } = t.context

    helper.agent.config.attributes.include = ['graphql.field.args.*']
    helper.agent.config.emit('attributes.include')

    const expectedName = 'BlahQuery'
    const query = `query ${expectedName} {
      paramQuery(blah: "first", blee: "second")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${expectedName}/paramQuery`

      const operationSegment = findSegmentByName(transaction.trace.root, operationName)
      const resolveHelloSegment = operationSegment.children[0]

      const expectedArgAttributes = {
        'graphql.field.args.blah': 'first',
        'graphql.field.args.blee': 'second'
      }
      const resolveAttributes = resolveHelloSegment.attributes.get(SEGMENT_DESTINATION)
      t.matches(resolveAttributes, expectedArgAttributes)
    })

    executeQuery(serverUrl, query, (err) => {
      t.error(err)
      t.end()
    })
  })

  t.test('query with variables should capture args when added to include list', (t) => {
    const { helper, serverUrl } = t.context

    helper.agent.config.attributes.include = ['graphql.field.args.*']
    helper.agent.config.emit('attributes.include')

    const expectedName = 'ParamQueryWithArgs'
    const query = `query ${expectedName}($arg1: String!, $arg2: String) {
      paramQuery(blah: $arg1, blee: $arg2)
    }`

    const queryJson = {
      operationName: expectedName,
      query: query,
      variables: {
        arg1: 'first',
        arg2: 'second'
      }
    }

    helper.agent.on('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${expectedName}/paramQuery`

      const operationSegment = findSegmentByName(transaction.trace.root, operationName)
      const resolveHelloSegment = operationSegment.children[0]

      const expectedArgAttributes = {
        'graphql.field.args.blah': 'first',
        'graphql.field.args.blee': 'second'
      }
      const resolveAttributes = resolveHelloSegment.attributes.get(SEGMENT_DESTINATION)
      t.matches(resolveAttributes, expectedArgAttributes)
    })

    executeJson(serverUrl, queryJson, (err) => {
      t.error(err)
      t.end()
    })
  })

  t.test('should capture query in operation segment attributes', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName = 'Greetings'
    const query = `query ${expectedName} {
      ciao
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${expectedName}/ciao`

      const operationSegment = findSegmentByName(transaction.trace.root, operationName)

      const expectedOperationAttributes = {
        'graphql.operation.query': query
      }

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)

      t.matches(
        operationAttributes,
        expectedOperationAttributes,
        'should have operation attributes'
      )
    })

    executeQuery(serverUrl, query, (err) => {
      t.error(err)
      t.end()
    })
  })

  t.test('query with args should have args obfuscated in raw query attribute', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName = 'ParamQueryWithArgs'
    const query = `query ${expectedName}($arg1: String!, $arg2: String) {
      paramQuery(blah: $arg1, blee: $arg2)
    }`

    const queryJson = {
      operationName: expectedName,
      query: query,
      variables: {
        arg1: 'first',
        arg2: 'second'
      }
    }

    helper.agent.on('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${expectedName}/paramQuery`

      const operationSegment = findSegmentByName(transaction.trace.root, operationName)

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)

      t.ok(operationAttributes['graphql.operation.query']
        .includes(`${expectedName}(***)`))
      t.ok(operationAttributes['graphql.operation.query'].includes('paramQuery(***)'))
    })

    executeJson(serverUrl, queryJson, (err) => {
      t.error(err)
      t.end()
    })
  })

  t.test('union, should capture all expected attributes', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName = 'GetSearchResult'
    const query = `query ${expectedName} {
      search(contains: "10x") {
        __typename
        ... on Author {
          name
        }
      }
    }`

    const deepestPath = 'search<Author>.name'

    helper.agent.on('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${expectedName}/${deepestPath}`
      const operationSegment = findSegmentByName(transaction.trace.root, operationName)
      const expectedOperationAttributes = {
        'graphql.operation.type': 'query',
        'graphql.operation.name': expectedName,
        'graphql.operation.query': query.replace('contains: "10x"', '***')
      }

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)
      t.matches(
        operationAttributes,
        expectedOperationAttributes,
        'should have operation attributes'
      )

      const resolveHelloSegment = operationSegment.children[0]

      const expectedResolveAttributes = {
        'graphql.field.name': 'search',
        'graphql.field.returnType': '[SearchResult!]',
        'graphql.field.parentType': 'Query',
        'graphql.field.path': 'search'
      }

      const resolveAttributes = resolveHelloSegment.attributes.get(SEGMENT_DESTINATION)
      t.matches(
        resolveAttributes,
        expectedResolveAttributes,
        'should have field resolve attributes'
      )
    })

    executeQuery(serverUrl, query, (err) => {
      t.error(err)
      t.end()
    })
  })

  t.test('union, multiple inline fragments, should return expected attributes', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName = 'GetSearchResult'
    const query = `query ${expectedName} {
      search(contains: "10x") {
        __typename
        ... on Author {
          name
        }
        ... on Book {
          title
        }
      }
    }`

    const deepestPath = 'search'

    helper.agent.on('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${expectedName}/${deepestPath}`
      const operationSegment = findSegmentByName(transaction.trace.root, operationName)
      const expectedOperationAttributes = {
        'graphql.operation.type': 'query',
        'graphql.operation.name': expectedName,
        'graphql.operation.query': query.replace('contains: "10x"', '***')
      }

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)
      t.matches(
        operationAttributes,
        expectedOperationAttributes,
        'should have operation attributes'
      )

      const resolveHelloSegment = operationSegment.children[0]

      const expectedResolveAttributes = {
        'graphql.field.name': 'search',
        'graphql.field.returnType': '[SearchResult!]',
        'graphql.field.parentType': 'Query',
        'graphql.field.path': 'search'
      }

      const resolveAttributes = resolveHelloSegment.attributes.get(SEGMENT_DESTINATION)
      t.matches(
        resolveAttributes,
        expectedResolveAttributes,
        'should have field resolve attributes'
      )
    })

    executeQuery(serverUrl, query, (err) => {
      t.error(err)
      t.end()
    })
  })
}

module.exports = {
  suiteName: 'attributes',
  createTests: createAttributesTests
}
