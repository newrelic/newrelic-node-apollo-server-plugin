/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { setupApolloServerKoaTests } = require('./apollo-server-koa-setup')
const attributesTests = require('../attributes-tests')

setupApolloServerKoaTests(attributesTests)
