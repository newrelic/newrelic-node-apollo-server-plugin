/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const tap = require('tap')
tap.Test.prototype.addAssert('assertSegments', 4, assertSegments)

// TODO: ideally, we wouldn't be reaching into internals
// and would have an API (in agent package?) to get what we need.
// This sort of thing makes future refactors more difficult even
// when extracted to a single location in the external module.

function getErrorTraces(agent) {
  return agent.errors.traceAggregator.errors
}

function getSpanEvents(agent) {
  return agent.spanEventAggregator.getEvents()
}

function findSpanById(agent, spanId) {
  const spans = getSpanEvents(agent)

  return spans.find((value) => {
    const { intrinsics } = value
    return intrinsics.guid === spanId
  })
}

function findSegmentByName(trace, root, name) {
  const children = trace.getChildren(root.id)
  if (root.name === name) {
    return root
  } else if (children.length) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const found = findSegmentByName(trace, child, name)
      if (found) {
        return found
      }
    }
    return null
  }
  return null
}

function temporarySetEnv(t, key, value) {
  const existing = process.env[key]
  process.env[key] = value

  t.teardown(() => {
    if (existing === undefined) {
      delete process.env[key]
      return
    }

    process.env[key] = existing
  })
}

function setupEnvConfig(t, enabled = true, appName = 'test app') {
  temporarySetEnv(t, 'NEW_RELIC_NO_CONFIG_FILE', true)
  temporarySetEnv(t, 'NEW_RELIC_ENABLED', enabled)
  temporarySetEnv(t, 'NEW_RELIC_APP_NAME', appName)
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
 */
function assertSegments(trace, parent, expected, options) {
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
    const children = trace.getChildren(_parent.id)
    return children.filter(function (item) {
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
        this.equal(
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
          this.ok(
            getChildren(child).length === 0,
            'segment "' + child.name + '" should not have any children'
          )
        }
      } else if (typeof sequenceItem === 'object') {
        this.assertSegments(trace, child, sequenceItem, options)
      }
    }

    // check if correct number of children was found
    this.equal(children.length, childCount)
  } else {
    for (let i = 0; i < expected.length; i++) {
      const sequenceItem = expected[i]

      if (typeof sequenceItem === 'string') {
        // find corresponding child in parent
        for (let j = 0; j < children.length; j++) {
          if (children[j].name === sequenceItem) {
            child = children[j]
          }
        }
        this.ok(child, 'segment "' + parent.name + '" should have child "' + sequenceItem + '"')
        if (typeof expected[i + 1] === 'object') {
          this.assertSegments(trace, child, expected[i + 1], exact)
        }
      }
    }
  }
}

module.exports = {
  getErrorTraces,
  getSpanEvents,
  findSpanById,
  findSegmentByName,
  temporarySetEnv,
  setupEnvConfig
}
