/*
 * Copyright 2021 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const test = require('node:test')
const assert = require('node:assert')

const createPlugin = require('../../lib/create-plugin')
const sinon = require('sinon')

test('createPlugin edge cases', async (t) => {
  t.beforeEach((ctx) => {
    ctx.nr = {}
    ctx.nr.operationSegment = {
      start: sinon.stub(),
      addAttribute: sinon.stub(),
      transaction: { nameState: { setName: sinon.stub() } },
      end: sinon.stub()
    }

    ctx.nr.instrumentationApi = {
      shim: {
        logger: {
          child: sinon
            .stub()
            .returns({ info: sinon.stub(), debug: sinon.stub(), trace: sinon.stub() })
        },
        agent: {
          metrics: {
            getOrCreateMetric: sinon.stub().returns({ incrementCallCount: sinon.stub() })
          }
        },
        getActiveSegment: sinon.stub().returns({}),
        tracer: {
          getTransaction: sinon.stub().returns({ nameState: { setName: sinon.stub() } })
        },
        createSegment: sinon.stub().callsFake((name) => {
          ctx.nr.operationSegment.name = name
          return ctx.nr.operationSegment
        }),
        setActiveSegment: sinon.stub(),
        isFunction: () => false
      },
      addCustomAttributes: sinon.stub()
    }
  })

  await t.test('should set deepest path to empty when not present', (t) => {
    const { instrumentationApi, operationSegment } = t.nr
    const responseContext = {
      document: {
        definitions: [
          {
            kind: 'OperationDefinition',
            selectionSet: {
              selections: []
            }
          }
        ]
      }
    }

    const hooks = createPlugin(instrumentationApi)
    const operationHooks = hooks.requestDidStart({})
    operationHooks.willSendResponse(responseContext)
    assert.equal(
      operationSegment.name,
      'GraphQL/operation/ApolloServer/undefined/<anonymous>',
      'should set path to undefined'
    )
  })

  await t.test('should not update operation name when document is null', (t) => {
    const { instrumentationApi, operationSegment } = t.nr
    const responseContext = {}
    const hooks = createPlugin(instrumentationApi)
    const operationHooks = hooks.requestDidStart({})
    assert.equal(
      operationSegment.name,
      'GraphQL/operation/ApolloServer/<unknown>',
      'should default operation name'
    )
    operationHooks.willSendResponse(responseContext)
    assert.equal(
      operationSegment.name,
      'GraphQL/operation/ApolloServer/<unknown>',
      'should not update operation name'
    )
  })

  await t.test('should not crash when ctx.operation is undefined in didResolveOperation', (t) => {
    const { instrumentationApi } = t.nr
    const hooks = createPlugin(instrumentationApi)
    const operationHooks = hooks.requestDidStart({})
    assert.doesNotThrow(() => {
      operationHooks.didResolveOperation({})
    })
  })
})
