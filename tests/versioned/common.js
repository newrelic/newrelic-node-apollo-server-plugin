/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const common = module.exports

/**
 * Verify we didn't break anything outright and
 * test is setup correctly for functioning calls.
 */
common.checkResult = function checkResult(t, result, callback) {
  t.ok(result)

  if (result.errors) {
    result.errors.forEach((error) => {
      t.error(error)
    })
  }

  setImmediate(callback)
}

/**
 * Sub-graph transactions are flagged as ignore via 'createIgnoreTransactionPlugin'
 * to indicate we are not intending to check data for those in these tests.
 */
common.shouldSkipTransaction = function shouldSkipTransaction(transaction) {
  return !!transaction.forceIgnore
}
