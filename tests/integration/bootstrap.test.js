/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')
const assert = require('node:assert')

const INDEX_PATH = '../..'

test.beforeEach(() => {
  process.env.NEW_RELIC_APP_NAME = 'test'
  process.env.NEW_RELIC_LICENSE_KEY = 'test'
  process.env.NEW_RELIC_ENABLED = false
})

test.afterEach(() => {
  delete process.env.NEW_RELIC_APP_NAME
  delete process.env.NEW_RELIC_LICENSE_KEY
  delete process.env.NEW_RELIC_ENABLED
})

test('Should export createPlugin when loaded', (t, end) => {
  const createPlugin = require(INDEX_PATH)
  assert.ok(createPlugin)

  resetModuleCache(() => {
    end()
  })
})

test('should create noop plugin when agent disabled', (t, end) => {
  // w/o a config file the agent will be disabled by default
  const createPlugin = require('../..')
  assert.ok(createPlugin)

  const plugin = createPlugin()
  assert.ok(plugin)
  assert.equal(plugin.requestDidStart, undefined)

  resetModuleCache(() => {
    end()
  })
})

test('should create full plugin when agent enabled', (t, end) => {
  process.env.NEW_RELIC_NO_CONFIG_FILE = true
  process.env.NEW_RELIC_ENABLED = true

  t.after(() => {
    delete process.env.NEW_RELIC_NO_CONFIG_FILE
  })

  const createPlugin = require('../..')
  assert.ok(createPlugin)

  const plugin = createPlugin()
  assert.ok(plugin)
  assert.ok(plugin.requestDidStart)

  resetModuleCache(() => {
    end()
  })
})

function resetModuleCache(callback) {
  const indexPath = require.resolve(INDEX_PATH)
  const newrelicPath = require.resolve('newrelic')
  const newrelicLogger = require.resolve('newrelic/lib/logger')
  const newrelicConfig = require.resolve('newrelic/lib/config')

  delete require.cache[indexPath]
  delete require.cache[newrelicPath]
  delete require.cache[newrelicLogger]
  delete require.cache[newrelicConfig]

  // In 9.6.0 of the agent the cached agent moved from a property
  // to a symbol. Look up the symbol and then delete cached agent
  // from prop or symbol.
  const [agentCacheSym] = Object.getOwnPropertySymbols(require.cache).filter(
    (name) => name.toString() === 'Symbol(cache)'
  )

  if (require.cache.__NR_cache) {
    delete require.cache.__NR_cache
  } else {
    delete require.cache[agentCacheSym]
  }

  callback()
}
