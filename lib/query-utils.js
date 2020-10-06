/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const cleanQuery = (query) => {
  const regex = /\([\sa-zA-Z0-9,\:\"\'\{\}]+\)/g

  const innerRegex = /(\:)[\sa-zA-Z0-9\"\']+([^\{]?[,\s\}\)])/g

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
