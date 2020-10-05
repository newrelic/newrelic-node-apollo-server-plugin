/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { setupApolloServerHapiTests } = require('./apollo-server-hapi-setup')
const errorsTests = require('../errors-tests')

setupApolloServerHapiTests(errorsTests, {
  distributed_tracing: { enabled: true } // enable span testing
})
