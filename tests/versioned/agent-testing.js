/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// TODO: ideally, we wouldn't be reachign into internals
// and would have an API (in agent package?) to get what we need.
// This sort of thing makes future refactors more difficult even
// when extracted to a single location in the external module.

function getErrorTraces(agent) {
  const errorTraces = agent.errors.traceAggregator.errors
  return errorTraces
}

function getSpanEvents(agent) {
  const spans = agent.spanEventAggregator.getEvents()
  return spans
}

function findSpanById(agent, spanId) {
  const spans = getSpanEvents(agent)

  const matchingSpan = spans.find((value) => {
    const {intrinsics} = value
    return intrinsics.guid === spanId
  })

  return matchingSpan
}

module.exports = {
  getErrorTraces,
  getSpanEvents,
  findSpanById
}
