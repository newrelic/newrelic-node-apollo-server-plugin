/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const tap = require('tap')

const cleanQuery = require('../../lib/query-utils')

tap.test('Obfuscate GraphQL query args tests', (t) => {
  t.test('Should remove new line and tabs', (t) => {
    const query = `query {
      runner
    }`

    const newQuery = cleanQuery(query)

    t.equal(newQuery, query)

    t.end()
  })

  t.test('Should hide one arg', (t) => {
    const query = `query logans(run: 333) {
      runner
    }`

    const newQuery = cleanQuery(query)

    t.notOk(newQuery.includes('333'))

    t.end()
  })

  t.test('Should obfuscate multiple args', (t) => {
    const query = `query chickens(hens: 'yes', eggs: 0) {
      eggs(yolk: 'yes')
    }`
    
    const newQuery = cleanQuery(query)
  
    t.notOk(newQuery.includes('yes'))
    t.notOk(newQuery.includes('0'))
    t.ok('eggs:***')
    t.ok('yolk:***', 'subquery args')

    t.end()
  })

  t.test('Should not obfuscate aliases', (t) => {
    const query = `query {
      pony: horse(horseId: 4, color: 'brown') {
        horse
      }
    }`

    const newQuery = cleanQuery(query)

    t.ok(newQuery.includes('pony: horse'), 'alias is intact')
    t.ok(newQuery.includes('horseId:***'))
    t.ok(newQuery.includes('color:***'))

    t.end()
  })

  t.test('Should obfuscate mutation args', (t) => {
    const query = `mutation corn(husks: {
      husky: 'yes',
      id: 5
    })`

    const newQuery = cleanQuery(query)

    t.ok(newQuery.includes('husky:***'))
    t.ok(newQuery.includes('id:***'))
  
    t.end()
  })

  t.test('Should obfuscate variable placeholders', (t) => {
    const query = `query ParamQueryWithArgs($arg1: String!, $arg2: String) {
      paramQuery(blah: $arg1, blee: $arg2)
    }`

    const newQuery = cleanQuery(query)

    t.ok(newQuery.includes('$arg1:***'))
    t.ok(newQuery.includes('blah:***'))

    t.end()
  })

  t.end()
})

