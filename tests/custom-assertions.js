/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

function isSimpleObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]' && obj !== null
}

/**
 * @param {Metrics} metrics         metrics under test
 * @param {Array} expected          Array of metric data where metric data is in this form:
 *                                  [
 *                                    {
 *                                      “name”:”name of metric”,
 *                                      “scope”:”scope of metric”,
 *                                    },
 *                                    [count,
 *                                      total time,
 *                                      exclusive time,
 *                                      min time,
 *                                      max time,
 *                                      sum of squares]
 *                                  ]
 * @param {boolean} exclusive       When true, found and expected metric lengths should match
 * @param {boolean} assertValues    When true, metric values must match expected
 * @param {object} [deps] Injected dependencies.
 * @param {object} [deps.assert] Assertion library to use.
 */
function assertMetrics(
  metrics,
  expected,
  exclusive = false,
  assertValues = false,
  { assert = require('node:assert') } = {}
) {
  // Assertions about arguments because maybe something returned undefined
  // unexpectedly and is passed in, or a return type changed. This will
  // hopefully help catch that and make it obvious.
  assert.ok(isSimpleObject(metrics), 'first argument required to be an Metrics object')
  assert.ok(Array.isArray(expected), 'second argument required to be an array of metrics')
  assert.ok(typeof exclusive === 'boolean', 'third argument required to be a boolean if provided')

  if (assertValues === undefined) {
    assertValues = true
  }

  for (let i = 0, len = expected.length; i < len; i++) {
    const expectedMetric = expected[i]
    const metric = metrics.getMetric(expectedMetric[0].name, expectedMetric[0].scope)
    assert.ok(metric, `should find ${expectedMetric[0].name}`)
    if (assertValues) {
      assert.deepEqual(metric.toJSON(), expectedMetric[1])
    }
  }

  if (exclusive) {
    const metricsList = metrics.toJSON()
    assert.equal(metricsList.length, expected.length)
  }
}

/**
 * @param {TraceSegment} parent     Parent segment
 * @param {Array} expected          Array of strings that represent segment names.
 *                                  If an item in the array is another array, it
 *                                  represents children of the previous item.
 * @param {boolean} options.exact   If true, then the expected segments must match
 *                                  exactly, including their position and children on all
 *                                  levels.  When false, then only check that each child
 *                                  exists.
 * @param {array} options.exclude   Array of segment names that should be excluded from
 *                                  validation.  This is useful, for example, when a
 *                                  segment may or may not be created by code that is not
 *                                  directly under test.  Only used when `exact` is true.
 * @param {object} [deps] Injected dependencies.
 * @param {object} [deps.assert] Assertion library to use.
 */
function assertSegments(parent, expected, options, { assert = require('node:assert') } = {}) {
  let child
  let childCount = 0

  // rather default to what is more likely to fail than have a false test
  let exact = true
  if (options && options.exact === false) {
    exact = options.exact
  } else if (options === false) {
    exact = false
  }

  function getChildren(_parent) {
    return _parent.children.filter(function (item) {
      if (exact && options && options.exclude) {
        return options.exclude.indexOf(item.name) === -1
      }
      return true
    })
  }

  const children = getChildren(parent)
  if (exact) {
    for (let i = 0; i < expected.length; ++i) {
      const sequenceItem = expected[i]

      if (typeof sequenceItem === 'string') {
        child = children[childCount++]
        assert.equal(
          child ? child.name : undefined,
          sequenceItem,
          'segment "' +
            parent.name +
            '" should have child "' +
            sequenceItem +
            '" in position ' +
            childCount
        )

        // If the next expected item is not array, then check that the current
        // child has no children
        if (!Array.isArray(expected[i + 1])) {
          assert.ok(
            getChildren(child).length === 0,
            'segment "' + child.name + '" should not have any children'
          )
        }
      } else if (typeof sequenceItem === 'object') {
        assertSegments(child, sequenceItem, options, { assert })
      }
    }

    // check if correct number of children was found
    assert.equal(children.length, childCount)
  } else {
    for (let i = 0; i < expected.length; i++) {
      const sequenceItem = expected[i]

      if (typeof sequenceItem === 'string') {
        // find corresponding child in parent
        for (let j = 0; j < parent.children.length; j++) {
          if (parent.children[j].name.startsWith(sequenceItem) === true) {
            child = parent.children[j]
          }
        }
        assert.ok(child, 'segment "' + parent.name + '" should have child "' + sequenceItem + '"')
        if (typeof expected[i + 1] === 'object') {
          assertSegments(child, expected[i + 1], { exact }, { assert })
        }
      }
    }
  }
}

const TYPE_MAPPINGS = {
  String: 'string',
  Number: 'number'
}

/**
 * Like `tap.prototype.match`. Verifies that `actual` satisfies the shape
 * provided by `expected`. This does actual assertions with `node:assert`
 *
 * There is limited support for type matching
 *
 * @example
 * match(obj, {
 *  key: String,
 *  number: Number
 * })
 *
 * @example
 * const input = {
 *   foo: /^foo.+bar$/,
 *   bar: [1, 2, '3']
 * }
 * match(input, {
 *   foo: 'foo is bar',
 *   bar: [1, 2, '3']
 * })
 * match(input, {
 *   foo: 'foo is bar',
 *   bar: [1, 2, '3', 4]
 * })
 *
 * @param {string|object} actual The entity to verify.
 * @param {string|object} expected What the entity should match against.
 * @param {object} [deps] Injected dependencies.
 * @param {object} [deps.assert] Assertion library to use.
 */
function match(actual, expected, { assert = require('node:assert') } = {}) {
  // match substring
  if (typeof actual === 'string' && typeof expected === 'string') {
    assert.ok(actual.indexOf(expected) > -1)
    return
  }

  for (const key in expected) {
    if (key in actual) {
      if (typeof expected[key] === 'function') {
        const type = expected[key]
        assert.ok(typeof actual[key] === TYPE_MAPPINGS[type.name])
      } else if (expected[key] instanceof RegExp) {
        assert.ok(expected[key].test(actual[key]))
      } else if (typeof expected[key] === 'object' && expected[key] !== null) {
        match(actual[key], expected[key], { assert })
      } else {
        assert.equal(actual[key], expected[key])
      }
    }
  }
}

module.exports = {
  assertMetrics,
  assertSegments,
  match
}
