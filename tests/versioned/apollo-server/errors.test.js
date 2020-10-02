/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { setupApolloServerTests } = require('./apollo-server-setup')
const errorsTests = require('../errors-tests')

setupApolloServerTests(errorsTests, {
  distributed_tracing: { enabled: true } // enable span testing
})
