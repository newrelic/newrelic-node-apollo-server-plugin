/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { setupApolloServerExpressTests } = require('./apollo-server-express-setup')
const segmentsTests = require('../express-segments-tests')

setupApolloServerExpressTests(segmentsTests)
