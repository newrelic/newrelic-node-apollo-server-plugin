/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const ErrorHelper = require('./error-helper.js')
const errorHelper = new ErrorHelper

const { separateOperations } = require('graphql')

var DESTINATIONS = {
  NONE: 0x00,
  TRANS_EVENT: 0x01,
  TRANS_TRACE: 0x02,
  ERROR_EVENT: 0x04,
  BROWSER_EVENT: 0x08,
  SPAN_EVENT: 0x10,
  TRANS_SEGMENT: 0x20
}

DESTINATIONS.SEGMENT_SCOPE = DESTINATIONS.SPAN_EVENT | DESTINATIONS.TRANS_SEGMENT

DESTINATIONS.TRANS_COMMON =
  DESTINATIONS.TRANS_EVENT |
  DESTINATIONS.TRANS_TRACE |
  DESTINATIONS.ERROR_EVENT |
  DESTINATIONS.SEGMENT_SCOPE


function createPlugin(instrumentationApi) {
  if (!instrumentationApi) {
    return {}
  }

  return {
    requestDidStart() {
      const requestParent = instrumentationApi.getActiveSegment()

      // We do not set to active here as batched queries will hit this
      // back to back and we'd prefer those not nest with each-other.
      const operationSegment = instrumentationApi.createSegment(
        '<operation unknown>',
        requestParent
      )
      operationSegment.start()

      const longestResolvedPath = {
        depth: 0,
        formatted: null
      }

      return {
        didEncounterErrors(requestContext) {
          errorHelper.addErrorsFromApolloRequestContext(
            instrumentationApi,
            requestContext
          )
        },
        executionDidStart() {
          return {
            willResolveField({info}) {
              const currentSeg = instrumentationApi.getActiveSegment()

              // Nest everything under operation as resolvers start/finish
              // in order but instrumentation such as promise tracking might
              // try to treat as nested.
              const resolverSegment = instrumentationApi.createSegment(
                `resolve: ${info.fieldName}`,
                operationSegment
              )

              resolverSegment.start()
              instrumentationApi.setActiveSegment(resolverSegment)

              const pathArray = flattenToArray(info.path)
              const formattedPath = pathArray.reverse().join('.')

              resolverSegment.name = `resolve: ${formattedPath}`

              if (pathArray.length > longestResolvedPath.depth) {
                longestResolvedPath.depth = pathArray.length
                longestResolvedPath.formatted = formattedPath
              }

              return () => {
                resolverSegment.end()
                instrumentationApi.setActiveSegment(currentSeg)
              }
            }
          }
        },
        willSendResponse(responseContext) {
          // default. only used if failed to parse
          let transactionName = '*'
          let segmentName = '<operation unknown>'
          let query = responseContext.request.query

          if (responseContext.operation) {
            // Resolved operation: parsed and validated, will execute resolvers

            const operationType = responseContext.operation.operation
            const operationName = responseContext.operationName || '<anonymous>'
            const longestPath = longestResolvedPath.formatted

            const operationDetails = `${operationType} ${operationName}`

            segmentName = operationDetails
            transactionName = `${operationDetails} ${longestPath}`


            // attempt to extract arguments to strip from query
            extractArgsFromDef(responseContext.document.definitions[0], query)
          } else if (responseContext.document) {
            // Failed validation, fallback to document AST

            const {
              operationType,
              operationName,
              longestPath
            } = getDetailsFromDocument(responseContext.document)

            const operationDetails = `${operationType} ${operationName}`

            segmentName = operationDetails
            transactionName = `${operationDetails} ${longestPath}`
          }

          setTransactionProperties(
            instrumentationApi.agent,
            responseContext.request,
            transactionName)

          operationSegment.name = segmentName
          operationSegment.end()
        }
      }
    }
  }
}

function extractArgsFromDef(definition, query) {
  definition.selectionSet.selections.forEach((selection) => {
    if (selection.arguments.length > 0) {
      selection.arguments.forEach((argument) => {
        query = query.replace(argument.value.value, '***')
      })
    }
  })

  console.log(query)
}

function getDetailsFromDocument(document) {
  // TODO: when would there be multiple document definitions?
  const definition = document.definitions[0]

  const longestSelectionPath = getLongestSelectionPath(definition)

  return {
    operationType: definition.operation,
    operationName: definition.name || '<anonymous>',
    longestPath: longestSelectionPath.join('.')
  }
}

function flattenToArray(fieldPath) {
  const pathArray = []

  let thisPath = fieldPath
  while (thisPath) {
    if (typeof thisPath.key !== 'number') {
      pathArray.push(thisPath.key)
    }
    thisPath = thisPath.prev
  }

  return pathArray
}

// TODO: setup so don't need special internals
// forcing will prevent custom names via API from working
function setTransactionProperties(agent, request, name) {
  const transaction = agent.tracer.getTransaction()

  transaction.trace.attributes.addAttribute(
    DESTINATIONS.TRANS_COMMON,
    'query.0',
    request.query
  )

  // TODO: ideally set via normal framework mechanisms as naming gets resolved
  const framework = 'apollo-server'

  if (!transaction.forceName) {
    transaction.forceName = `${framework}/${name}`
    return
  }

  transaction.forceName = transaction.forceName.replace(framework, `${framework}/batch`)
  const batchName = `${transaction.forceName}/${name}`
  transaction.forceName = batchName
}

/**
 * Returns the longest path as an array of parts
 * from an apollo-server document definition.
 */
function getLongestSelectionPath(definition) {
  let longestPath = null

  definition.selectionSet.selections.forEach((selection) => {
    searchSelection(selection)
  })

  return longestPath

  /**
   * Search each selection path until no-more sub-selections
   * exist. If the curent path is longer than longestPath,
   * longestPath is replaced.
   */
  function searchSelection(selection, currentParts) {
    const parts = currentParts ? [...currentParts] : []
    parts.push(selection.name.value)

    if (selection.selectionSet) {
      selection.selectionSet.selections.forEach((innerSelection) => {
        searchSelection(innerSelection, parts)
      })
    } else if (!longestPath || parts.length > longestPath.length) {
      longestPath = parts
    }
  }
}

module.exports = createPlugin
