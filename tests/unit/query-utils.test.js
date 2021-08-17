/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const tap = require('tap')

const cleanQuery = require('../../lib/query-utils')

tap.test('Obfuscate GraphQL query args tests', (t) => {
  t.test('Should obfuscate query args', (t) => {
    const query = `query logans(run: "(333") {
      runner
    }`

    const argLocations = [
      {
        start: 13,
        end: 24
      }
    ]

    const newQuery = cleanQuery(query, argLocations)

    t.notOk(newQuery.includes('333'))
    t.ok(newQuery.includes('logans(***)'))

    t.end()
  })

  t.test('Should obfuscate multiple args', (t) => {
    const query = `query chickens(hens: 'yes') {
      eggs(yolk: 'yes') {
        yolk
      }
    }`

    const argLocations = [
      {
        start: 15,
        end: 26
      },
      {
        start: 41,
        end: 52
      }
    ]

    const newQuery = cleanQuery(query, argLocations)

    t.notOk(newQuery.includes('hens'))
    t.notOk(newQuery.includes('yolk:'))
    t.ok(newQuery.includes('chickens(***)'))
    t.ok(newQuery.includes('eggs(***)'))

    t.end()
  })

  t.end()
})
