/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { executeQuery, executeQueryBatch } = require('./test-client')

const ANON_PLACEHOLDER = '<anonymous>'
const UNKNOWN_OPERATION_PLACEHOLDER = '<operation unknown>'

/**
 * Creates a set of standard transction tests to run against various
 * apollo-server libraries.
 * It is required that t.context.helper and t.context.serverUrl are set.
 * @param {*} t a tap test instance
 */
function createSegmentsTests(t) {
  t.test('anonymous query, single level', (t) => {
    const { helper, serverUrl } = t.context

    const query = `query {
      hello
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      const operationPart = `query ${ANON_PLACEHOLDER}`
      const expectedSegments = [{
        name: `WebTransaction/apollo-server/${operationPart} hello`,
        children: [{
          name: 'Expressjs/Router: /',
          children: [{
            name: 'Nodejs/Middleware/Expressjs/<anonymous>',
            children: [{
              name: operationPart,
              children: [{
                name: 'resolve: hello'
              }]
            }]
          }]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named query, single level', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName = 'HeyThere'
    const query = `query ${expectedName} {
      hello
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      const operationPart = `query ${expectedName}`
      const expectedSegments = [{
        name: `WebTransaction/apollo-server/${operationPart} hello`,
        children: [{
          name: 'Expressjs/Router: /',
          children: [{
            name: 'Nodejs/Middleware/Expressjs/<anonymous>',
            children: [{
              name: operationPart,
              children: [{
                name: 'resolve: hello'
              }]
            }]
          }]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('anonymous query, multi-level', (t) => {
    const { helper, serverUrl } = t.context

    const query = `query {
      libraries {
        books {
          title
          author {
            name
          }
        }
      }
    }`

    const longestPath = 'libraries.books.author.name'

    helper.agent.on('transactionFinished', (transaction) => {
      const operationPart = `query ${ANON_PLACEHOLDER}`
      const expectedSegments = [{
        name: `WebTransaction/apollo-server/${operationPart} ${longestPath}`,
        children: [{
          name: 'Expressjs/Router: /',
          children: [{
            name: 'Nodejs/Middleware/Expressjs/<anonymous>',
            children: [{
              name: operationPart,
              children: [
                { name: 'resolve: libraries' },
                { name: 'resolve: libraries.books' },
                { name: 'resolve: libraries.books.author' },
                { name: 'resolve: libraries.books.author.name' }
              ]
            }]
          }]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named query, multi-level should return longest path', (t) => {
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

    const longestPath = 'libraries.books.author.name'

    helper.agent.on('transactionFinished', (transaction) => {
      const operationPart = `query ${expectedName}`
      const expectedSegments = [{
        name: `WebTransaction/apollo-server/${operationPart} ${longestPath}`,
        children: [{
          name: 'Expressjs/Router: /',
          children: [{
            name: 'Nodejs/Middleware/Expressjs/<anonymous>',
            children: [{
              name: operationPart,
              children: [
                { name: 'resolve: libraries' },
                { name: 'resolve: libraries.books' },
                { name: 'resolve: libraries.books.title'},
                { name: 'resolve: libraries.books.author' },
                { name: 'resolve: libraries.books.author.name' }
              ]
            }]
          }]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named query, multi-level, should choose *first* deepest-path', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName = 'GetBooksByLibrary'
    const query = `query ${expectedName} {
      libraries {
        books {
          title
          isbn
        }
      }
    }`

    // .isbn is the same length but title will be first so that path should be used
    const firstLongestPath = 'libraries.books.title'

    helper.agent.on('transactionFinished', (transaction) => {
      const operationPart = `query ${expectedName}`
      const expectedSegments = [{
        name: `WebTransaction/apollo-server/${operationPart} ${firstLongestPath}`,
        children: [{
          name: 'Expressjs/Router: /',
          children: [{
            name: 'Nodejs/Middleware/Expressjs/<anonymous>',
            children: [{
              name: operationPart,
              children: [
                { name: 'resolve: libraries' },
                { name: 'resolve: libraries.books' },
                { name: 'resolve: libraries.books.title' },
                { name: 'resolve: libraries.books.isbn' }
              ]
            }]
          }]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('anonymous mutation, single level', (t) => {
    const { helper, serverUrl } = t.context

    const query = `mutation {
      addThing(name: "added thing!")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      const operationPart = `mutation ${ANON_PLACEHOLDER}`
      const expectedSegments = [{
        name: `WebTransaction/apollo-server/${operationPart} addThing`,
        children: [{
          name: 'Expressjs/Router: /',
          children: [{
            name: 'Nodejs/Middleware/Expressjs/<anonymous>',
            children: [{
              name: operationPart,
              children: [{
                name: 'resolve: addThing',
                children: [{
                  name: 'timers.setTimeout',
                  children: [{
                    name: 'Callback: namedCallback'
                  }]
                }]
              }]
            }]
          }]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named mutation, single level, should use mutation name', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName = 'AddThing'
    const query = `mutation ${expectedName} {
      addThing(name: "added thing!")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      const operationPart = `mutation ${expectedName}`
      const expectedSegments = [{
        name: `WebTransaction/apollo-server/${operationPart} addThing`,
        children: [{
          name: 'Expressjs/Router: /',
          children: [{
            name: 'Nodejs/Middleware/Expressjs/<anonymous>',
            children: [{
              name: operationPart,
              children: [{
                name: 'resolve: addThing',
                children: [{
                  name: 'timers.setTimeout',
                  children: [{
                    name: 'Callback: namedCallback'
                  }]
                }]
              }]
            }]
          }]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('anonymous query, with params', (t) => {
    const { helper, serverUrl } = t.context

    const query = `query {
      paramQuery(blah: "blah", blee: "blee")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      const operationPart = `query ${ANON_PLACEHOLDER}`
      const expectedSegments = [{
        name: `WebTransaction/apollo-server/${operationPart} paramQuery`,
        children: [{
          name: 'Expressjs/Router: /',
          children: [{
            name: 'Nodejs/Middleware/Expressjs/<anonymous>',
            children: [{
              name: operationPart,
              children: [
                { name: 'resolve: paramQuery' }
              ]
            }]
          }]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named query, with params', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName = 'BlahQuery'
    const query = `query ${expectedName} {
      paramQuery(blah: "blah")
    }`

    helper.agent.on('transactionFinished', (transaction) => {
      const operationPart = `query ${expectedName}`
      const expectedSegments = [{
        name: `WebTransaction/apollo-server/${operationPart} paramQuery`,
        children: [{
          name: 'Expressjs/Router: /',
          children: [{
            name: 'Nodejs/Middleware/Expressjs/<anonymous>',
            children: [{
              name: operationPart,
              children: [
                { name: 'resolve: paramQuery' }
              ]
            }]
          }]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('named query, with params, multi-level', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName = 'GetBookForLibrary'
    const query = `query ${expectedName} {
      library(branch: "downtown") {
        books {
          title
          author {
            name
          }
        }
      }
    }`

    const longestPath = 'library.books.author.name'

    helper.agent.on('transactionFinished', (transaction) => {
      const operationPart = `query ${expectedName}`
      const expectedSegments = [{
        name: `WebTransaction/apollo-server/${operationPart} ${longestPath}`,
        children: [{
          name: 'Expressjs/Router: /',
          children: [{
            name: 'Nodejs/Middleware/Expressjs/<anonymous>',
            children: [{
              name: operationPart,
              children: [
                {
                  name: 'resolve: library',
                  children: [{
                    name: 'timers.setTimeout',
                    children: [{
                      name: 'Callback: <anonymous>'
                    }]
                  }]
                },
                { name: 'resolve: library.books' },
                { name: 'resolve: library.books.title'},
                { name: 'resolve: library.books.author' },
                { name: 'resolve: library.books.author.name' }
              ]
            }]
          }]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeQuery(serverUrl, query, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.end()
      })
    })
  })

  t.test('batch query should include segments for nested queries', (t) => {
    const { helper, serverUrl } = t.context

    const expectedName1 = 'GetBookForLibrary'
    const query1 = `query ${expectedName1} {
      library(branch: "downtown") {
        books {
          title
          author {
            name
          }
        }
      }
    }`

    const query2 = `mutation {
      addThing(name: "added thing!")
    }`

    const longestPath1 = 'library.books.author.name'

    const queries = [query1, query2]

    helper.agent.on('transactionFinished', (transaction) => {
      const operationPart1 = `query ${expectedName1}`
      const expectedQuery1Name = `${operationPart1} ${longestPath1}`
      const operationPart2 = `mutation ${ANON_PLACEHOLDER}`
      const expectedQuery2Name = `${operationPart2} addThing`

      const batchTransactionPrefix = 'WebTransaction/apollo-server/batch'

      const expectedSegments = [{
        name: `${batchTransactionPrefix}/${expectedQuery1Name}/${expectedQuery2Name}`,
        children: [{
          name: 'Expressjs/Router: /',
          children: [{
            name: 'Nodejs/Middleware/Expressjs/<anonymous>',
            children: [
              {
                name: operationPart1,
                children: [
                  {
                    name: 'resolve: library',
                    children: [{
                      name: 'timers.setTimeout',
                      children: [{
                        name: 'Callback: <anonymous>'
                      }]
                    }]
                  },
                  { name: 'resolve: library.books' },
                  { name: 'resolve: library.books.title'},
                  { name: 'resolve: library.books.author' },
                  { name: 'resolve: library.books.author.name' }
                ]
              },
              {
                name: operationPart2,
                children: [{
                  name: 'resolve: addThing',
                  children: [{
                    name: 'timers.setTimeout',
                    children: [{
                      name: 'Callback: namedCallback'
                    }]
                  }]
                }]
              }
            ]
          }]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeQueryBatch(serverUrl, queries, (err, result) => {
      t.error(err)
      checkResult(t, result, () => {
        t.equal(result.length, 2)

        t.end()
      })
    })
  })

  // there will be no document/AST nor resolved operation
  t.test('when the query cannot be parsed, should have operation placeholder', (t) => {
    const { helper, serverUrl } = t.context

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
      t.equal(
        transaction.name,
        'WebTransaction/apollo-server/*'
      )

      const expectedSegments = [{
        name: 'WebTransaction/apollo-server/*',
        children: [{
          name: 'Expressjs/Router: /',
          children: [{
            name: 'Nodejs/Middleware/Expressjs/<anonymous>',
            children: [{
              name: UNKNOWN_OPERATION_PLACEHOLDER
            }]
          }]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
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

  // if parse succeeds but validation fails, there will not be a resolved operation
  // but the document/AST can still be leveraged for what was intended.
  t.test('when cannot validate, should include operation segment', (t) => {
    const { helper, serverUrl } = t.context

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

    const longestPath = 'libraries.books.doesnotexist.name'

    helper.agent.on('transactionFinished', (transaction) => {
      const operationPart = `query ${ANON_PLACEHOLDER}`
      const expectedSegments = [{
        name: `WebTransaction/apollo-server/${operationPart} ${longestPath}`,
        children: [{
          name: 'Expressjs/Router: /',
          children: [{
            name: 'Nodejs/Middleware/Expressjs/<anonymous>',
            children: [{
              name: operationPart
            }]
          }]
        }]
      }]

      t.segments(transaction.trace.root, expectedSegments)
    })

    executeQuery(serverUrl, invalidQuery, (err, result) => {
      t.error(err)

      t.ok(result)
      t.ok(result.errors)
      t.equal(result.errors.length, 1) // should have one parsing error

      const [parseError] = result.errors
      t.equal(parseError.extensions.code, 'GRAPHQL_VALIDATION_FAILED')

      t.end()
    })
  })
}

/**
 * Verify we didn't break anything outright and
 * test is setup correctly for functioning calls.
 */
function checkResult(t, result, callback) {
  t.ok(result)

  if (result.errors) {
    result.errors.forEach((error) => {
      t.error(error)
    })
  }

  setImmediate(callback)
}

module.exports = {
  createSegmentsTests
}
