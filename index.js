/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const newrelic = require('newrelic')
const createPlugin = require('./lib/create-plugin')

// TODO: need to grab instrumentation API from agent via
// supported means that will not disappear when agent disabled.
module.exports = createPlugin.bind(null, newrelic.shim)
