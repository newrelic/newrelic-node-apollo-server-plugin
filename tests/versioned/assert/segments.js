/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const assert = require('node:assert')
const util = require('node:util')

const exactSegments = require('./exact-segments')

module.exports = function segments(parent, _expected) {
  // expected:
  //  [{name: "name", children: [{name: "child"}]}]
  const stack = [[parent.children, _expected]]

  function findFirstChild(children, name) {
    return children.find((child) => {
      if (name instanceof RegExp) {
        return name.test(child.name)
      }
      return child.name.indexOf(name) >= 0
    })
  }

  function findMatchingChildren(children, name) {
    return children.filter((child) => {
      if (name instanceof RegExp) {
        return name.test(child.name)
      }
      return child.name.indexOf(name) >= 0
    })
  }

  while (stack.length) {
    const current = stack.pop()
    const children = current[0]
    const expected = current[1]

    for (let i = 0; i < expected.length; ++i) {
      const expectedChild = expected[i]

      const matches = findMatchingChildren(children, expectedChild.name)

      let child = matches[0]
      if (matches.length > 1 && expectedChild.children) {
        // pre-test first grand-child to find appropriate match
        const firstMatchingChild = matches.find((matchChild) => {
          const firstGrandchildTest = expectedChild.children[0]
          return findFirstChild(matchChild.children, firstGrandchildTest.name)
        })

        child = firstMatchingChild || child
      }

      if (!child) {
        return assert.fail(util.format('Missing child segment "%s"', expectedChild.name))
      }

      if (expectedChild.children) {
        if (expectedChild.exact) {
          const res = exactSegments(child, expectedChild.children)
          if (!res.success) {
            return res
          }
        } else {
          stack.push([child.children, expectedChild.children])
        }
      }
    }
  }

  return assert.ok('Segments are as expected.')
}
