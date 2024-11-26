/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')
const assert = require('node:assert')

const cleanQuery = require('../../lib/query-utils')

test('Obfuscate GraphQL query args tests', async (t) => {
  await t.test('Should obfuscate query args', () => {
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

    assert.equal(newQuery.includes('333'), false)
    assert.ok(newQuery.includes('logans(***)'))
  })

  await t.test('Should obfuscate aliased query args for aliased', () => {
    const query = `query thing: logans(run: "(333") {
      runner
    }`

    const argLocations = [
      {
        start: 20,
        end: 31
      }
    ]

    const newQuery = cleanQuery(query, argLocations)

    assert.equal(newQuery.includes('333'), false)
    assert.ok(newQuery.includes('thing: logans', 'alias is intact'))
    assert.ok(newQuery.includes('logans(***)', 'args obfuscated'))
  })

  await t.test('Should obfuscate mutation args', () => {
    const argLocations = [
      {
        start: 14,
        end: 60
      }
    ]

    const query = `mutation corn(husks: {
      husky: 'yes',
      id: 5
    })`

    const newQuery = cleanQuery(query, argLocations)

    assert.ok(newQuery.includes('corn(***)'))
  })

  await t.test('Should obfuscate multiple args', () => {
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

    assert.equal(newQuery.includes('hens'), false)
    assert.equal(newQuery.includes('yolk:'), false)
    assert.ok(newQuery.includes('chickens(***)'))
    assert.ok(newQuery.includes('eggs(***)'))
  })
})
