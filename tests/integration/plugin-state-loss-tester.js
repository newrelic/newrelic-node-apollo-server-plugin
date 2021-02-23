'use strict'

function createStateLossPlugin(stateLossConfig, instrumentationApi) {
  return {
    requestDidStart() {
      triggerStateLoss(stateLossConfig.onRequestDidStart)

      return {
        willSendResponse() {
          triggerStateLoss(stateLossConfig.onWillSendResponse)
        }
      }
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
