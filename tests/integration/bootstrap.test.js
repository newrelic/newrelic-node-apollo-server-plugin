/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const tap = require('tap')

const INDEX_PATH = '../..'

tap.test('Should export plugin when loaded', (t) => {
  const plugin = require(INDEX_PATH)
  t.ok(plugin)

  resetModuleCache(() => {
    t.end()
  })
})

tap.test('should export noop plugin when agent disabled', (t) => {
  // w/o a config file the agent will be disabled by default
  const plugin = require('../..')
  t.ok(plugin)

  t.notOk(plugin.requestDidStart)

  resetModuleCache(() => {
    t.end()
  })
})

tap.test('should export full plugin when agent enabled', (t) => {
  temporarySetEnv(t, 'NEW_RELIC_NO_CONFIG_FILE', true)
  temporarySetEnv(t, 'NEW_RELIC_ENABLED', true)
  temporarySetEnv(t, 'NEW_RELIC_APP_NAME', 'P L U G I N')

  const plugin = require('../..')
  t.ok(plugin)
  t.ok(plugin.requestDidStart)

  resetModuleCache(() => {
    t.end()
  })
})

function temporarySetEnv(t, key, value) {
  const existing = process.env[key]
  process.env[key] = value

  t.tearDown(() => {
    if (existing === undefined) {
      delete process.env[key]
      return
    }

    process.env[key] = existing
  })
}

function resetModuleCache(callback) {
  const indexPath = require.resolve(INDEX_PATH)
  const newrelicPath = require.resolve('newrelic')

  delete require.cache[indexPath]
  delete require.cache[newrelicPath]
  delete require.cache.__NR_cache

  callback()
}
