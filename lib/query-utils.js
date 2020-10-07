/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const cleanQuery = (query) => {
  const regex = /\([\s\S]+?[^\)]\)/g

  return query.replace(regex, '(***)')
}

module.exports = cleanQuery
