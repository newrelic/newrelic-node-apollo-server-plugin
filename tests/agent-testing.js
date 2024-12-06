/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

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

function findSegmentByName(root, name) {
  if (root.name === name) {
    return root
  } else if (root.children && root.children.length) {
    for (let i = 0; i < root.children.length; i++) {
      const child = root.children[i]
      const found = findSegmentByName(child, name)
      if (found) {
        return found
      }
    }
  }

  return null
}

module.exports = {
  getErrorTraces,
  getSpanEvents,
  findSpanById,
  findSegmentByName
}
