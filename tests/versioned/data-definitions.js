/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { gql } = require('apollo-server')

const libraries = [
  {
    branch: 'downtown'
  },
  {
    branch: 'riverside'
  }
]

const books = [
  {
    title: 'Node Agent: The Book',
    isbn: 'a-fake-isbn',
    author: 'Sentient Bits',
    branch: 'riverside'
  },
  {
    title: 'Ollies for O11y: A Sk8er\'s Guide to Observability',
    isbn: 'a-second-fake-isbn',
    author: 'Faux Hawk',
    branch: 'downtown'
  }
]

const typeDefs = gql`
  type Library {
    branch: String!
    books: [Book!]
  }

  type Book {
    title: String
    isbn: String
    author: Author!
  }

  type Author {
    name: String!
  }

  type Query {
    books: [Book]
    hello: String
    paramQuery(blah: String!, blee: String): String!
    libraries: [Library]
    library(branch: String!): [Library]
  }

  type Mutation {
    addThing(name: String!) : String!
  }
`

const resolvers = {
  Query: {
    hello: () => {
      return 'hello world'
    },
    paramQuery: (_, {blah, blee}) => {
      return blah + blee
    },
    libraries: () => {
      return libraries
    },
    library: (_, {branch}) => {
      return libraries.filter(library => library.branch === branch)
    }
  },
  Mutation: {
    addThing: (_, {name}) => {
      return name
    }
  },
  Library: {
    books(parent) {
      return books.filter(book => book.branch === parent.branch)
    }
  },
  Book: {
    author(parent) {
      return {
        name: parent.author
      }
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}
