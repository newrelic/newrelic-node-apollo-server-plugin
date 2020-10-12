/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { setupApolloServerFastifyTests } = require('./apollo-server-fastify-setup')
const transactionNamingTests = require('../transaction-naming-tests')

setupApolloServerFastifyTests(transactionNamingTests)
