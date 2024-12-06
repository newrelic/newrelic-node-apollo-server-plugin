/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const assert = require('node:assert')

const { executeQuery, executeJson } = require('../test-client')
const { findSegmentByName } = require('../agent-testing')
const { match } = require('../custom-assertions')
const promiseResolvers = require('../promise-resolvers')

const SEGMENT_DESTINATION = 0x20
const SPAN_DESTINATION = 0x10
const ANON_PLACEHOLDER = '<anonymous>'
const OPERATION_PREFIX = 'GraphQL/operation/ApolloServer'

function assertCustomAttributes(segment, expected) {
  const customResolveAttributes = segment.getSpanContext().customAttributes.get(SPAN_DESTINATION)
  match(customResolveAttributes, expected)
}

const tests = []

tests.push({
  name: 'anon query should capture standard attributes except operation name',
  async fn(t) {
    const { helper, serverUrl } = t.nr
    const { promise, resolve } = promiseResolvers()

    const query = `query {
      hello
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${ANON_PLACEHOLDER}/hello`
      const operationSegment = findSegmentByName(transaction.trace.root, operationName)

      assertCustomAttributes(operationSegment, { clientName: 'ApolloTestClient' })

      const expectedOperationAttributes = {
        'graphql.operation.type': 'query'
      }

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)
      match(operationAttributes, expectedOperationAttributes)

      const hasAttribute = Object.hasOwnProperty.bind(operationAttributes)
      assert.equal(hasAttribute('graphql.operation.name'), false)

      const resolveHelloSegment = operationSegment.children[0]

      const expectedResolveAttributes = {
        'graphql.field.name': 'hello',
        'graphql.field.returnType': 'String',
        'graphql.field.parentType': 'Query',
        'graphql.field.path': 'hello'
      }

      const resolveAttributes = resolveHelloSegment.attributes.get(SEGMENT_DESTINATION)
      match(resolveAttributes, expectedResolveAttributes)

      assertCustomAttributes(resolveHelloSegment, { returnType: 'String' })
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'named query should capture all standard attributes',
  async fn(t) {
    const { helper, serverUrl } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'HeyThere'
    const query = `query ${expectedName} {
      hello
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${expectedName}/hello`
      const operationSegment = findSegmentByName(transaction.trace.root, operationName)

      const expectedOperationAttributes = {
        'graphql.operation.type': 'query',
        'graphql.operation.name': expectedName
      }

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)
      match(operationAttributes, expectedOperationAttributes)

      const resolveHelloSegment = operationSegment.children[0]

      const expectedResolveAttributes = {
        'graphql.field.name': 'hello',
        'graphql.field.returnType': 'String',
        'graphql.field.parentType': 'Query',
        'graphql.field.path': 'hello'
      }

      const resolveAttributes = resolveHelloSegment.attributes.get(SEGMENT_DESTINATION)
      match(resolveAttributes, expectedResolveAttributes)
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'named query, multi-level, should capture deepest unique path',
  async fn(t) {
    const { helper, serverUrl } = t.nr
    const { promise, resolve } = promiseResolvers()

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

    helper.agent.once('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${expectedName}/${deepestPath}`
      const operationSegment = findSegmentByName(transaction.trace.root, operationName)

      const expectedOperationAttributes = {
        'graphql.operation.type': 'query',
        'graphql.operation.name': expectedName
      }

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)
      match(operationAttributes, expectedOperationAttributes)

      const [resolveLibrariesSegment, resolveBooksSegment] = operationSegment.children

      const expectedLibrariesAttributes = {
        'graphql.field.name': 'libraries',
        'graphql.field.returnType': '[Library]',
        'graphql.field.parentType': 'Query',
        'graphql.field.path': 'libraries'
      }

      const resolveLibrariesAttributes = resolveLibrariesSegment.attributes.get(SEGMENT_DESTINATION)
      match(resolveLibrariesAttributes, expectedLibrariesAttributes)

      const expectedBooksAttributes = {
        'graphql.field.name': 'books',
        'graphql.field.returnType': '[Book!]',
        'graphql.field.parentType': 'Library',
        'graphql.field.path': 'libraries.books'
      }

      const resolveBooksAttributes = resolveBooksSegment.attributes.get(SEGMENT_DESTINATION)
      match(resolveBooksAttributes, expectedBooksAttributes)
      assertCustomAttributes(resolveBooksSegment, { sourceBranch: 'downtown' })
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'named mutation should capture all standard attributes',
  async fn(t) {
    const { helper, serverUrl } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'AddThing'
    const query = `mutation ${expectedName} {
      addThing(name: "added thing!")
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/mutation/${expectedName}/addThing`

      const operationSegment = findSegmentByName(transaction.trace.root, operationName)

      const expectedOperationAttributes = {
        'graphql.operation.type': 'mutation',
        'graphql.operation.name': expectedName
      }

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)
      match(operationAttributes, expectedOperationAttributes)

      const resolveHelloSegment = operationSegment.children[0]

      const expectedResolveAttributes = {
        'graphql.field.name': 'addThing',
        'graphql.field.returnType': 'String!',
        'graphql.field.parentType': 'Mutation',
        'graphql.field.path': 'addThing'
      }

      const resolveAttributes = resolveHelloSegment.attributes.get(SEGMENT_DESTINATION)
      match(resolveAttributes, expectedResolveAttributes)
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'named mutation should not capture args by default',
  async fn(t) {
    const { helper, serverUrl } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'AddThing'
    const query = `mutation ${expectedName} {
      addThing(name: "added thing!")
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/mutation/${expectedName}/addThing`

      const operationSegment = findSegmentByName(transaction.trace.root, operationName)
      const resolveHelloSegment = operationSegment.children[0]

      const resolveAttributes = resolveHelloSegment.attributes.get(SEGMENT_DESTINATION)

      const hasAttribute = Object.hasOwnProperty.bind(resolveAttributes)
      assert.equal(hasAttribute('graphql.field.args.name'), false)
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'named mutation should capture args when added to include list',
  async fn(t) {
    const { helper, serverUrl } = t.nr
    const { promise, resolve } = promiseResolvers()

    helper.agent.config.attributes.include = ['graphql.field.args.*']
    helper.agent.config.emit('attributes.include')

    const expectedName = 'AddThing'
    const query = `mutation ${expectedName} {
      addThing(name: "added thing!")
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/mutation/${expectedName}/addThing`

      const operationSegment = findSegmentByName(transaction.trace.root, operationName)
      const resolveHelloSegment = operationSegment.children[0]

      const resolveAttributes = resolveHelloSegment.attributes.get(SEGMENT_DESTINATION)
      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)
      match(resolveAttributes, { 'graphql.field.args.name': 'added thing!' })
      match(operationAttributes, { 'graphql.field.args.name': 'added thing!' })
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'named query should capture args when added to include list',
  async fn(t) {
    const { helper, serverUrl } = t.nr
    const { promise, resolve } = promiseResolvers()

    helper.agent.config.attributes.include = ['graphql.field.args.*']
    helper.agent.config.emit('attributes.include')

    const expectedName = 'BlahQuery'
    const query = `query ${expectedName} {
      paramQuery(blah: "first", blee: "second")
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${expectedName}/paramQuery`

      const operationSegment = findSegmentByName(transaction.trace.root, operationName)
      const resolveHelloSegment = operationSegment.children[0]

      const expectedArgAttributes = {
        'graphql.field.args.blah': 'first',
        'graphql.field.args.blee': 'second'
      }
      const resolveAttributes = resolveHelloSegment.attributes.get(SEGMENT_DESTINATION)
      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)
      match(resolveAttributes, expectedArgAttributes)
      match(operationAttributes, expectedArgAttributes)
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'query should capture nested args',
  async fn(t) {
    const { helper, serverUrl } = t.nr
    const { promise, resolve } = promiseResolvers()

    helper.agent.config.attributes.include = ['graphql.field.args.*']
    helper.agent.config.emit('attributes.include')

    const expectedName = 'BlahQuery'
    const query = `query ${expectedName} {
      searchByBook(book: { title: "Breaking production for dummies", author: { name: "10x Developer" }  } ) {
        title
        isbn
      }
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${expectedName}/searchByBook`

      const operationSegment = findSegmentByName(transaction.trace.root, operationName)
      const resolveHelloSegment = operationSegment.children[0]

      const expectedArgAttributes = {
        'graphql.field.args.book.author.name': '10x Developer',
        'graphql.field.args.book.title': 'Breaking production for dummies'
      }
      const resolveAttributes = resolveHelloSegment.attributes.get(SEGMENT_DESTINATION)
      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)
      match(resolveAttributes, expectedArgAttributes)
      match(operationAttributes, expectedArgAttributes)
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'query with variables should capture args when added to include list',
  async fn(t) {
    const { helper, serverUrl } = t.nr
    const { promise, resolve } = promiseResolvers()

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

    helper.agent.once('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${expectedName}/paramQuery`

      const operationSegment = findSegmentByName(transaction.trace.root, operationName)
      const resolveHelloSegment = operationSegment.children[0]

      const expectedArgAttributes = {
        'graphql.field.args.blah': 'first',
        'graphql.field.args.blee': 'second'
      }
      const resolveAttributes = resolveHelloSegment.attributes.get(SEGMENT_DESTINATION)
      match(resolveAttributes, expectedArgAttributes)

      assertCustomAttributes(resolveHelloSegment, { args: 'blah,blee' })
    })

    executeJson(serverUrl, queryJson, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'should capture query in operation segment attributes',
  async fn(t) {
    const { helper, serverUrl } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'Greetings'
    const query = `query ${expectedName} {
      ciao
    }`

    helper.agent.once('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${expectedName}/ciao`

      const operationSegment = findSegmentByName(transaction.trace.root, operationName)

      const expectedOperationAttributes = {
        'graphql.operation.query': query
      }

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)

      match(operationAttributes, expectedOperationAttributes)
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'union, should capture all expected attributes',
  async fn(t) {
    const { helper, serverUrl } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'GetSearchResult'
    const query = `query ${expectedName} {
      search(contains: "Ollies") {
        __typename
        ... on Book {
          title
        }
      }
    }`

    const deepestPath = 'search<Book>.title'

    helper.agent.once('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${expectedName}/${deepestPath}`
      const operationSegment = findSegmentByName(transaction.trace.root, operationName)
      const expectedOperationAttributes = {
        'graphql.operation.type': 'query',
        'graphql.operation.name': expectedName,
        'graphql.operation.query': query.replace('contains: "Ollies"', '***')
      }

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)
      match(operationAttributes, expectedOperationAttributes)

      const resolveHelloSegment = operationSegment.children[0]

      const expectedResolveAttributes = {
        'graphql.field.name': 'search',
        'graphql.field.returnType': '[SearchResult!]',
        'graphql.field.parentType': 'Query',
        'graphql.field.path': 'search'
      }

      const resolveAttributes = resolveHelloSegment.attributes.get(SEGMENT_DESTINATION)
      match(resolveAttributes, expectedResolveAttributes)
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'union, multiple inline fragments, should return expected attributes',
  async fn(t) {
    const { helper, serverUrl } = t.nr
    const { promise, resolve } = promiseResolvers()

    const expectedName = 'GetSearchResult'
    const query = `query ${expectedName} {
      search(contains: "Node") {
        __typename
        ... on Magazine {
          title
        }
        ... on Book {
          title
        }
      }
    }`

    const deepestPath = 'search'

    helper.agent.once('transactionFinished', (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${expectedName}/${deepestPath}`
      const operationSegment = findSegmentByName(transaction.trace.root, operationName)
      const expectedOperationAttributes = {
        'graphql.operation.type': 'query',
        'graphql.operation.name': expectedName,
        'graphql.operation.query': query.replace('contains: "Node"', '***')
      }

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)
      match(operationAttributes, expectedOperationAttributes)

      const resolveHelloSegment = operationSegment.children[0]

      const expectedResolveAttributes = {
        'graphql.field.name': 'search',
        'graphql.field.returnType': '[SearchResult!]',
        'graphql.field.parentType': 'Query',
        'graphql.field.path': 'search'
      }

      const resolveAttributes = resolveHelloSegment.attributes.get(SEGMENT_DESTINATION)
      match(resolveAttributes, expectedResolveAttributes)
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      resolve()
    })

    await promise
  }
})

tests.push({
  name: 'should capture all attributes on multiple queries',
  async fn(t) {
    const { helper, serverUrl } = t.nr
    const { promise, resolve, reject } = promiseResolvers()

    const expectedName = 'HeyThere'
    const query = `query ${expectedName} {
      hello
    }`

    let count = 0

    const transactionHandler = (transaction) => {
      const operationName = `${OPERATION_PREFIX}/query/${expectedName}/hello`

      const operationSegment = findSegmentByName(transaction.trace.root, operationName)
      if (!operationSegment) {
        const err = new Error(`Cannot find operation segment with name ${operationName}`)
        reject(err)
        return
      }

      const expectedOperationAttributes = {
        'graphql.operation.type': 'query',
        'graphql.operation.query': query,
        'graphql.operation.name': expectedName
      }

      const operationAttributes = operationSegment.attributes.get(SEGMENT_DESTINATION)

      match(operationAttributes, expectedOperationAttributes)
      count++
    }

    helper.agent.on('transactionFinished', transactionHandler)
    t.after(() => {
      helper.agent.removeListener('transactionFinished', transactionHandler)
    })

    executeQuery(serverUrl, query, (err) => {
      assert.ifError(err)
      process.nextTick(() => {
        executeQuery(serverUrl, query, (err) => {
          assert.ifError(err)
          assert.equal(count, 2, 'should have checked 2 transactions')
          resolve()
        })
      })
    })

    await promise
  }
})

module.exports = {
  tests,
  suiteName: 'attributes',
  pluginConfig: {
    customResolverAttributes({ source, args, info }) {
      return {
        args: Object.keys(args).join(','),
        returnType: info.returnType.name,
        sourceBranch: source?.branch
      }
    },
    customOperationAttributes(context) {
      return {
        clientName: context.request.http.headers.get('client-name')
      }
    }
  }
}
