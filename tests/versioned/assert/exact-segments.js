/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const assert = require('node:assert')
const util = require('node:util')

const segments = require('./segments')

module.exports = function exactSegments(parent, _expected) {
  const stack = [[parent.children, _expected]]

  while (stack.length) {
    const current = stack.pop()
    const children = current[0]
    const expected = current[1]

    for (let i = 0; i < expected.length; ++i) {
      const expectedChild = expected[i]
      const child = children[i]
      if (!child) {
        return assert.fail(
          util.format(
            'Expected segment "%s" as child %d of "%s", found no child.',
            expectedChild.name,
            i,
            parent.name
          )
        )
      }
      if (child.name !== expectedChild.name) {
        return assert.fail(
          util.format(
            'Expected segment "%s" as child %d of "%s", found "%s" instead.',
            expectedChild.name,
            i,
            parent.name,
            child.name
          )
        )
      }

      if (expectedChild.children) {
        if (expectedChild.exact === false) {
          const res = segments(child, expectedChild.children)
          if (!res.success) {
            return res
          }
        } else {
          stack.push([child.children, expectedChild.children])
        }
      }
    }

    if (children.length !== expected.length) {
      return assert.fail(
        util.format(
          'Expected %d children for segment "%s", found %d instead.',
          expected.length,
          parent.name,
          children.length
        )
      )
    }
  }

  return assert.ok('Segments are exactly as expected.')
}
