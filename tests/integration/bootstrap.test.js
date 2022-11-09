/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const tap = require('tap')

const { setupEnvConfig } = require('../agent-testing')

const INDEX_PATH = '../..'

tap.test('Should export createPlugin when loaded', (t) => {
  const createPlugin = require(INDEX_PATH)
  t.ok(createPlugin)

  resetModuleCache(() => {
    t.end()
  })
})

tap.test('should create noop plugin when agent disabled', (t) => {
  // w/o a config file the agent will be disabled by default
  const createPlugin = require('../..')
  t.ok(createPlugin)

  const plugin = createPlugin()
  t.ok(plugin)
  t.notOk(plugin.requestDidStart)

  resetModuleCache(() => {
    t.end()
  })
})

tap.test('should create full plugin when agent enabled', (t) => {
  setupEnvConfig(t)

  const createPlugin = require('../..')
  t.ok(createPlugin)

  const plugin = createPlugin()
  t.ok(plugin)
  t.ok(plugin.requestDidStart)

  resetModuleCache(() => {
    t.end()
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
