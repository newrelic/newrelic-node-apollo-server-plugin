/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

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
    title: "Ollies for O11y: A Sk8er's Guide to Observability",
    isbn: 'a-second-fake-isbn',
    author: 'Faux Hawk',
    branch: 'downtown'
  },
  {
    title: '[Redacted]',
    isbn: 'a-third-fake-isbn',
    author: 'Closed Telemetry',
    branch: 'riverside'
  },
  {
    title: 'Be a hero: fixing the things you broke',
    isbn: 'a-fourth-fake-isbn',
    author: '10x Developer',
    branch: 'downtown'
  }
]

const magazines = [
  {
    title: 'Reli Updates Weekly',
    issue: 1,
    branch: 'riverside'
  },
  {
    title: 'Reli Updates Weekly',
    issue: 2,
    branch: 'downtown'
  },
  {
    title: 'Node Weekly',
    issue: 1,
    branch: 'riverside'
  }
]

function getTypeDefs(gql) {
  const typeDefs = gql`
    union SearchResult = Book | Magazine

    type Library {
      branch: String!
      books: [Book!]
      magazines: [Magazine]
    }

    type Book {
      title: String!
      isbn: String
      author: Author!
    }

    type Author {
      name: String!
    }

    type Magazine {
      title: String!
      issue: Int
    }

    type Query {
      search(contains: String): [SearchResult!]
      books: [Book]
      hello: String
      boom: String
      paramQuery(blah: String!, blee: String): String!
      libraries: [Library]
      library(branch: String!): Library
    }

    type Mutation {
      addThing(name: String!): String!
    }
  `
  return typeDefs
}

const resolvers = {
  Query: {
    search: (_, { contains }) => {
      const filteredBooks = books.filter((book) => book.title.includes(contains))
      const filteredMagazines = magazines.filter((magazine) => magazine.title.includes(contains))
      return [...filteredBooks, ...filteredMagazines]
    },
    hello: () => {
      return 'hello world'
    },
    boom: () => {
      throw new Error('Boom goes the dynamite!')
    },
    paramQuery: (_, { blah, blee }) => {
      return blah + blee
    },
    libraries: () => {
      return libraries
    },
    library: (_, { branch }) => {
      const promise = new Promise((resolve) => {
        setTimeout(() => {
          const filtered = libraries.find((library) => library.branch === branch)
          resolve(filtered)
        }, 0)
      })

      return promise
    }
  },
  Mutation: {
    addThing: async (_, { name }) => {
      const promise = new Promise((resolve) => {
        setTimeout(function namedCallback() {
          resolve(name)
        }, 1)
      })
      const result = await promise
      return result
    }
  },
  Library: {
    books(parent) {
      return books.filter((book) => book.branch === parent.branch)
    },
    magazines(parent) {
      return magazines.filter((magazine) => magazine.branch === parent.branch)
    }
  },
  Book: {
    author(parent) {
      return {
        name: parent.author
      }
    }
  },
  SearchResult: {
    __resolveType(obj) {
      if (obj.issue) {
        return 'Magazine'
      }
      if (obj.isbn) {
        return 'Book'
      }
      return null // GraphQLError is thrown
    }
  }
}

module.exports = {
  getTypeDefs,
  resolvers
}
