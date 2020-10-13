/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { setupApolloServerTests } = require('../../apollo-server-setup')
const expressSegmentsDefaultTests = require('../express-segments-default-tests')
const expressSegmentsScalarTests = require('../express-segments-scalar-tests')

setupApolloServerTests(expressSegmentsDefaultTests)
setupApolloServerTests(expressSegmentsScalarTests)
