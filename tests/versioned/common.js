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
common.checkResult = function checkResult(assert, result, callback) {
  assert.ok(result)

  if (result.errors) {
    result.errors.forEach((error) => {
      assert.ok(!error)
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

/**
 * Creates the root segment based on a prefix and operation part
 */
common.baseSegment = function baseSegment(operationPart, prefix) {
  return `${prefix}//${operationPart}`
}

/**
 * Creates the appropriate sibling hierarchy of segments
 * In apollo 4 they tweaked how the apollo server express instance is constructed.
 * It lacks a / router and routes everything through a global middleware
 */
common.constructSegments = function constructSegments(firstSegmentName, operationSegments) {
  return [firstSegmentName, [...operationSegments]]
}

/**
 * Creates the tree of operation segments. If this is using apollo-express or apollo server < 5
 * it adds an express middleware handler
 * @param {string} prefix transaction prefix
 * @param {array} operationSegments operation segments
 * @returns {array} array of segments
 */
common.constructOperationSegments = function constructOperationSegments(prefix, operationSegments) {
  if (prefix.includes('Nodejs')) {
    return operationSegments
  }
  return ['Nodejs/Middleware/Expressjs/<anonymous>', operationSegments]
}
