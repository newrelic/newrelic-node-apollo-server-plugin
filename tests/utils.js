/*
 * Copyright 2022 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const utils = module.exports

/**
 * Attempts to remove a list of modules from the require cache.
 * If module does not exist or not in require cache it'll just swallow
 * the error
 *
 * @param {array} modules list of modules to remove from require cache
 */
utils.clearCachedModules = function clearCachedModules(modules, dir) {
  modules.forEach((moduleName) => {
    try {
      const requirePath = require.resolve(moduleName, { paths: [dir] })
      delete require.cache[requirePath]
    } catch (err) {
      // this is fine as the setup has packages
      // that may not be installed
    }
  })
}
