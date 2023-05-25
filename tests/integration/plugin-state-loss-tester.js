/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

function createStateLossPlugin(stateLossConfig, api) {
  const instrumentationApi = api.shim
  return {
    requestDidStart() {
      triggerStateLoss(stateLossConfig.onRequestDidStart)

      return new Promise((resolve) => {
        resolve({
          willSendResponse() {
            triggerStateLoss(stateLossConfig.onWillSendResponse)
          }
        })
      })
    }
  }

  function triggerStateLoss(shouldTrigger) {
    if (shouldTrigger) {
      // Setting active segment to null to mimic state loss
      instrumentationApi.setActiveSegment(null)
    }
  }
}

class PluginStateLossTester {
  constructor() {
    this.stateLossConfig = {
      onRequestDidStart: false,
      onWillSendResponse: false
    }
  }

  getCreatePlugin() {
    return createStateLossPlugin.bind(null, this.stateLossConfig)
  }

  clearStateLoss() {
    Object.keys(this.stateLossConfig).forEach((key) => {
      this.stateLossConfig[key] = false
    })
  }

  triggerOnRequestDidStart() {
    this.stateLossConfig.onRequestDidStart = true
  }

  tiggerOnWillSendResponse() {
    this.stateLossConfig.onWillSendResponse = true
  }
}

module.exports = PluginStateLossTester
