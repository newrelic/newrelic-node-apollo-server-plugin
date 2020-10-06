/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const cleanQuery = (query) => {
  const regex = /(\()[\sa-zA-Z0-9,\:\"\'\{\}\$\!]+(\))/g

  return query.replace(regex, '$1' + '***' + '$2')
}

module.exports = cleanQuery
