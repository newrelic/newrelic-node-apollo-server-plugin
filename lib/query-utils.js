/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const OBFUSCATION_STR = '***'

const cleanQuery = (query, argLocations) => {
  let cleanedQuery = query
  let offset = 0

  argLocations.forEach((loc) => {
    cleanedQuery =
      cleanedQuery.slice(0, loc.start - offset) +
      OBFUSCATION_STR +
      cleanedQuery.slice(loc.end - offset)

    offset = loc.end - loc.start - OBFUSCATION_STR.length
  })

  return cleanedQuery
}

module.exports = cleanQuery
