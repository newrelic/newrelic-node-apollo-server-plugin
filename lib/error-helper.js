'use strict'
class ErrorHelper {
  isValidRequestContext(instrumentationApi, requestContext) {
    if (
      !requestContext || !requestContext.errors ||
      !Array.isArray(requestContext.errors)
    ) {
      instrumentationApi.logger.trace(
        'didEncounterErrors received malformed arguments, skipping'
      )
      return false
    }
    return true
  }

  addErrorsFromApolloRequestContext(instrumentationApi, requestContext) {
    if (!this.isValidRequestContext(instrumentationApi, requestContext)) {
      return
    }

    for (const error of requestContext.errors) {
      instrumentationApi.agent.errors.add(
        instrumentationApi.tracer.getTransaction(),
        error
      )
    }
  }
}

module.exports = ErrorHelper
