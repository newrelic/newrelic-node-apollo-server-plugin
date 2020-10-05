/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const cleanQuery = (query) => {
  // get rid of newline, tabs and spaces
  query = query.replace(/\s\s+/g, ' ')

  // matches arguments block
  const regex = /\(.*\:.*\)/g

  const innerRegex = /(\:).*?([\),])/g
  const matches = query.match(regex)
  
  if (matches) {
    matches.forEach((match) => {
      const newArgBlock = match.replace(innerRegex, '$1' + '***' + '$2')
      query = query.replace(match, newArgBlock)
    })
  }

  return query
}

module.exports = cleanQuery

// if no match should I just dump query
