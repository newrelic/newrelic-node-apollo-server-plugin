/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const tap = require('tap')

// TODO: this is just to exercise initial module setup.
// delete/replace as real functionality is added.
tap.test('Should export plugin when loaded', (t) => {
  const plugin = require('../../')
  t.ok(plugin)

  t.end()
})
