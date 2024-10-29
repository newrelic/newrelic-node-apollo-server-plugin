/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
module.exports = function findSegmentByName(trace, root, name) {
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
  }
  return null
}
