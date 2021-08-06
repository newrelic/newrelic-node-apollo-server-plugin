/*
 * Copyright 2021 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
module.exports = {
  rules: {
    'max-nested-callbacks': 'off',
    'no-shadow': ['warn', { allow: ['cb', 't', 'shim', 'error', 'err'] }]
  }
}
