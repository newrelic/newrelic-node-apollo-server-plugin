### v8.0.0 (2025-07-22)
#### ⚠ BREAKING CHANGES

* Removed Node.js 18 support

#### Features

* Removed Node.js 18 support ([#349](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/349)) ([6ff874a](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/6ff874a21c859d0074b51f5385a0cd1bc0a338f7))

#### Miscellaneous chores

* Updated to latest eslint-config ([#357](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/357)) ([78081e5](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/78081e5c821c4e8950ec0cd267dfcb50c29ef751))

#### Tests

* Fixed `assertSegments` to properly assert all expected segments ([#358](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/358)) ([14ad8d6](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/14ad8d610e9d901c5c3e407615a2b85554152045))
* Fixed tests to work with apollo 5 ([#355](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/355)) ([eea52e8](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/eea52e81a2308598b74fe74f85d37d8c63958ff5))

### v7.1.0 (2025-06-17)

#### Miscellaneous chores

* Add testing against Node 24 ([#351](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/351)) ([3fcfde3](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/3fcfde3760d4fd8a2e8a3cc004017b4ada301cb7))

### v7.0.2 (2025-05-06)

#### Bug fixes

* Updated plugin to pass in transaction trace to properly calculate the exclusive time of operation and resolver segments ([#345](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/345)) ([a528992](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/a528992cf47381952b9439f9102589c9a28537fc))

### v7.0.1 (2025-04-21)

#### Bug fixes

* Fixed issue where querying with directives crashed checking if query was an introspection query ([#341](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/341)) ([110704f](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/110704f8fda497d2716999e2c0aa0ebcf8484e0d))

### v7.0.0 (2025-01-14)
#### ⚠ BREAKING CHANGES

* Updated the minimum agent version to `12.11.0`.

#### Features

* Updated the minimum agent version to `12.11.0` ([#337](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/337)) ([6a115c4](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/6a115c4fe21abc50f5c4fffcbca7d70074f7269e))
  * In `12.11.0` of the agent, the transaction was removed from the segment and stored separately on the context manager. 
  * The signature for recording time slice metrics also changed by passing in the active transaction.
  * If you cannot upgrade the agent to `12.11.0`, simply pin the `@newrelic/apollo-server-plugin` to `6.0.0`.

#### Miscellaneous chores

* Limit dependencies ([#321](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/321)) ([66e9008](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/66e900817dcbce41d9887f290b3f6da1e2971511))

#### Tests

* Migrated `apollo-federation` versioned tests to `node:test` ([#333](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/333)) ([86b883e](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/86b883e58290b4b097c762d9bd1ed9409ae0b0df))
* Updated remaining versioned tests to `node:test` ([#334](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/334)) ([4f86a27](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/4f86a27f813d3a376a0bd027e4628a7cc0dbfecd))
* Updated unit tests to node:test ([#331](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/331)) ([1292619](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/1292619588ccd37cddade0d23f858de8490a7131))
* Moved all common files into `tests/lib` ([#336](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/336)) ([58b1e59](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/58b1e596a4050e6a9d9f2c661c7ac26936bf948f))
* Restored `graphql-tag` as it was not a transitive dep but instead a test dep ([#325](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/325)) ([d6ac39a](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/d6ac39a57d90736ff4df7882154b01824cc8ecfd))
* Updated `apollo-federation` tests to use `@apollo/server` ([#335](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/335)) ([37e89fa](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/37e89faf15044c36652c4bd05aef8224e47a0024))
* Updated versioned tests to remove transitive deps ([#323](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/323)) ([5c2b889](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/5c2b8893ec6f5c6e4e72f385b4fd44002aa800a1))

#### Continuous integration

* Updated codecov version and moved codecov reporting until after all tests are run ([#319](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/319)) ([4becfe1](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/4becfe11f538a04c29368b1e85cf6a618a9cf0a4))

### v6.0.0 (2024-07-31)
#### ⚠ BREAKING CHANGES

* Dropped support for Node.js 16
* Updated minimum test version of `apollo-server` and `apollo-server-express` to 3.0.0. Removed testing against `apollo-server-fastify`, `apollo-server-hapi`, `apollo-server-koa`, `apollo-server-lambda` as we found the plugin instrumentation had no effect on the relevant, deprecated pacakges

#### Features

* Dropped support for Node.js 16 ([#317](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/317)) ([60c2805](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/60c280564bbfd3f71ad15839175ed2468a2b728f))

#### Tests

* Updated minimum test version of `apollo-server` and `apollo-server-express` to 3.0.0. Removed testing against `apollo-server-fastify`, `apollo-server-hapi`, `apollo-server-koa`, `apollo-server-lambda` as we found the plugin instrumentation had no effect on the relevant, deprecated pacakges ([#317](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/317)) ([6d8d80d](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/6d8d80de84d85012ddde7e7e4da1e96b159d10c5))

### v5.2.0 (2024-06-28)

#### Features

* Added support for Node 22.

#### Documentation

* clarified how to configure capturing args passed to mutations ([#295](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/295)) ([7e6e265](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/7e6e2651d5e0c79798c9c989d588869732443466))
* Updated targets to include minimum agent version for compatibility repo ([#299](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/299)) ([2d9808b](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/2d9808b486caeac4cc4821c3dad014d477eb158c))

#### Miscellaneous chores

* Add targets for compatibility package parsing ([#297](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/297)) ([2ac8553](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/2ac8553a1f7b5a431a2accb9b9adc46b99fe5fc2))
* Added Node 22 to CI ([#301](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/301)) ([57922a3](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/57922a31d96e21cfff3012b9158debbea1206187))
* Updated minimum versions of dev dependencies.([#290](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/290)) ([8b77476](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/8b7747643205f894575ed42f2ac8e99251ba1799))([#291](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/291)) ([2eb3183](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/2eb31839bcb57ab8991d5c7e699faae198363e9f))([#306](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/306)) ([82fa6da](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/82fa6da4da2efedc855daaed2315733e59990619))([#307](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/307)) ([6d1ac62](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/6d1ac62a1efa710e15598ced6b65686752be5407))([#309](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/309)) ([533628d](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/533628d8c55180ae45b949dc3bb3ba31b483237e))
* Enabled quiet mode for CI runs ([#298](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/298)) ([d190a9a](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/d190a9a0141a94708e3acd04d29beb1af2880a29))
* Made pre-commit hook require dependency changes ([#300](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/300)) ([cd1869b](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/cd1869b7b26e350fdd50eb862870caaa9f9c8e1f))
* Removed outdated Slack reference ([#303](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/303)) ([abfb3ed](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/abfb3ede982169c4e1b1bcf9974ff3f6b01c68ea))

#### Tests

* Updated the version range for @apollo/gateway as it was finally stabilized. ([#296](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/296)) ([76c743f](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/76c743f94f92276f16fee19875bd2c20c4bc8b37))

#### Continuous integration

* Removed `use_new_release` input from prepare release workflow ([#293](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/293)) ([2436f8e](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/2436f8eb1094e5045fd272dc8984f35f3befe363))
* removed changelog.json file ([#292](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/292)) ([9d716ba](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/9d716ba14bb3e39e0eee52776625736840d177a4))

### v5.1.0 (2024-03-12)

#### Code refactoring

* Updated apollo server plugin to break out relevant functions into helpers ([#288](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/288)) ([f5ef40f](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/f5ef40fac9602500865e007898371b926d572b71))

### v5.0.0 (2024-01-16)
#### ⚠ BREAKING CHANGES

* Removed `GraphQL/typedResolve/ApolloServer/<parentType>.<resolver>` in lieu of including the <parentType> in `GraphQL/resolve/ApolloServer/<parentType>.<resolver>` metrics.

If you were querying metrics before this release to get resolver names, you may have to update it to separate parent type from the resolve name:

```
FROM Metric
SELECT average(newrelic.timeslice.value) * 1000 as 'Average Duration (MS)' WHERE appName = '[YOUR APP NAME]' WITH METRIC_FORMAT 'GraphQL/resolve/ApolloServer/{type}.{field}' FACET field LIMIT 20
```

#### Features

* Removed `GraphQL/typedResolve/ApolloServer/<parentType>.<resolver>` in lieu of including the <parentType> in `GraphQL/resolve/ApolloServer/<parentType>.<resolver>` metrics ([#285](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/285)) ([4411798](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/44117985cc3865ad532757b471b556eb55af4cc2))

#### Documentation

* Updated metrics docs to show how to now query resolves to include/not include type ([#285](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/285)) ([f59c7c7](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/f59c7c704231229a8762bcb69139e1f0eb93855f))

#### Miscellaneous chores

* **deps-dev:** bump follow-redirects from 1.15.3 to 1.15.4 ([#284](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/284)) ([fe8c7c7](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/fe8c7c76b4761eba744268d42496130755a20d02))
    * Bumps [follow-redirects](https://github.com/follow-redirects/follow-redirects) from 1.15.3 to 1.15.4. - [Release notes](https://github.com/follow-redirects/follow-redirects/releases) - [Commits](https://github.com/follow-redirects/follow-redirects/compare/v1.15.3...v1.15.4)

#### Continuous integration

* Updated repo to use conventional commit style for preparation of releases ([#286](https://github.com/newrelic/newrelic-node-apollo-server-plugin/pull/286)) ([723af71](https://github.com/newrelic/newrelic-node-apollo-server-plugin/commit/723af71c7fa44f6e1ede4f078a6bfcddcff3fd66))

### v4.1.0 (2023-12-11)

* Updated error handling to pass in [extensions](https://www.apollographql.com/docs/apollo-server/data/errors/) properties as custom attributes. (Thank you to @edds for this contribution!)

### v4.0.1 (2023-10-25)

* Fixed typescript type declarations to correctly define the exports for this package. Since there is only a single export, if you need to import the type for the plugin config explicitly you would need to import it from `/config`, eg, `import type { NRPluginConfig } from '@newrelic/apollo-server-plugin/config'`. Thank you to @bbeesley for the fix.
* Bumped [@babel/traverse](https://github.com/babel/babel/tree/HEAD/packages/babel-traverse) from 7.17.3 and 7.20.1 to 7.23.2.

### v4.0.0 (2023-08-28)

* **BREAKING**: Removed support for Node 14.

* Added support for Node 20.

### v3.1.2 (2023-07-27)

* Updated types to be more specific for `customOperationAttributes` and `customResolverAttributes`.

### v3.1.1 (2023-07-26)

* Added `captureFieldMetrics`, `customResolverAttributes`, and `customOperationAttributes` to the type file.

* Updated CI to run against versions 16-20.

* Bumped devDeps to fix CVEs. 

### v3.1.0 (2023-06-05)

* Added ability to define custom attributes in the context of the active operation and resolver.  

```js
const plugin = createPlugin({
  customResolverAttributes({ source, args, context, info }) {
    return {
      allArgs: Object.keys(args).join(','),
      returnType: info.returnType.name,
      sourceBranch: source?.branch,
      stage: context.event.requestContext.stage
    }
  },
  customOperationAttributes(requestContext) {
    return {
      clientName: requestContext.request.http.headers.get('graphql-client-name')
    }
  }
})
```

* Added new metrics that specify the parent type for a given field.
    * Format is as follows: `GraphQL/typedResolve/ApolloServer/<parentType>.<resolver>`
    * See [metrics docs](https://github.com/newrelic/newrelic-node-apollo-server-plugin/blob/main/docs/metrics.md#field-resolve-metrics) for more info

* Added ability to capture both fields and args seen during an Apollo query as metrics.
    * To enable this feature, update your createPlugin configuration to specify `captureFieldMetrics: true`
    * To see all fields and resolver arguments requested within the last day. Run the following NRQL:
    
```
FROM Metric SELECT count(newrelic.timeslice.value) where appName = '[YOUR APP NAME]' WITH METRIC_FORMAT 'GraphQL/{kind}/ApolloServer/{field}' where kind = 'arg' or kind = 'field' FACET kind, field limit max since 1 day ago 
```

* Updated to latest version of c8 for realtime versioned test coverage.

* Updated README links to point to new forum link due to repolinter ruleset change.

* Updated README header image to latest OSS office required images.

* Upgraded dev dependency `json5` from `2.2.1` to `2.2.3`.

### v3.0.0 (2023-01-05)

* **BREAKING**: Updated types definition to use user provided type
If your application uses both Typescript and Apollo version 3, you'll need to update where you configure the New Relic plugin to include the `ApolloServerPlugin` type from `apollo-server-plugin-base`, like in the following: 
```ts
import { ApolloServer } from 'apollo-server';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import createNewRelicPlugin from '@newrelic/apollo-server-plugin';
const newRelicPlugin = createNewRelicPlugin<ApolloServerPlugin>({})
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    newRelicPlugin,
  ],
});
```

* Added lockfile checks to CI workflow to prevent malicious changes

### v2.1.0 (2022-11-10)

* 📢 Apollo Server 4 support 📢
  * There were no changes to the plugin to support Apollo Server 4. The types had to be adjusted to support Apollo Server 2-4.
  * Updated type definition of plugin to work with both `apollo-server` and `@apollo-server` packages.
  * Removed `apollo-server-plugin-base` as peer dependency as you can now use `@apollo/server` to get the `ApolloPluginBase`
  * Added a versioned test suite to verify `@apollo/server` 4+ still functions with our plugin.
  * For Apollo Server 4+ typescript users, you must update your instantiation of the `@newrelic/apollo-server-plugin`:

```ts
// index.ts

import { ApolloServerPlugin, ApolloServer } from '@apollo/server';
import createNewRelicPlugin from '@newrelic/apollo-server-plugin';

const newRelicPlugin = createNewRelicPlugin<ApolloServerPlugin>({}) 
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    newRelicPlugin,
  ],
});
```

* Added minimum supported server version to README.md

### v2.0.1 (2022-08-29)

* Added defensive code to prevent plugin from masking actual graphql errors.

### v2.0.0 (2022-07-27)

* **BREAKING** Removed support for Node 12.

  The minimum supported version is now Node v14. For further information on our support policy, see: https://docs.newrelic.com/docs/agents/nodejs-agent/getting-started/compatibility-requirements-nodejs-agent.

* Added support for Node 18.
* Resolved several dev-dependency audit warnings.

### v1.3.0 (2022-04-27)

* Moved naming of transaction to both `didResolveOperation`, and `willSendResponse` to properly handle when validation of document does not get invoked.

* Added the graphql query arguments to the operation segment.

* Removed `koa` as a test dependency from versions < 3.0.0 as it was already bundled with `apollo-sever-koa`.

* Updated `async` to resolve a dev-dependency security warning.

* Updated `moment` to resolve a dev-dependency security warning.

* Updated `tap` to resolve a dev-dependency security warning.

* Fixed subgraph transaction tests to be less rigid as the order of transactions vary.

* Upgraded `@newrelic/test-utilities` to `6.5.2` to take advantage of new features.

* Swapped out `@apollo/federation` for `@apollo/subgraph` in testing as it is now the recommended package for building sub graph schemas.

### v1.2.3 (2022-03-29)

* Fixed an issue where a mutation or query selected only reserved fields and the segment name lacked the mutation/query name

### v1.2.2 (2022-03-24)

* Updated error helper to report the original error when applicable.

* Moved naming of operation segment and updating transaction to `validationDidStart` phase of Apollo Server request.

* Updated expected names for transaction in federated versioned tests.

### v1.2.1 (2022-03-16)

* Fixed transaction naming and operation segments when a fragment is defined before query.

* Added `graqhql` as a test dependency in the versioned test `package.json` configurations.

* Bumped `newrelic` dev dependency to ^8.8.0.

* Updated versioned testing to account for built-in agent instrumentation for Fastify.

* Fixed readme link to New Relic Open Source project page.

* Removed note about Fastify not being fully supported by agent. We added GA support in [v8.5.0](https://github.com/newrelic/node-newrelic/releases/tag/v8.5.0)

* Updated `apollo-server`, `json-schema`, and `browserslist`  to resolve a dev-dependency security warning.

* Updated federation versioned tests to only use latest version of `graphql` to avoid incompatibility failures while federation/gateway are still unstable.

* Updated ApolloGateway test setup to use IntrospectAndClose instead of deprecated serviceList.

* Updated `node-fetch` to resolve a dev-dependency security warning.

* Updated `object-path` to resolve a dev-dependency security warning.

* Updated `add-to-board` to use org level `NODE_AGENT_GH_TOKEN`

### v1.2.0 (2022-01-11)

* Removed direct usage of internal tracer.

* Updated README to reference `buildSubgraphSchema` instead of deprecated method `buildFederatedSchema`.  Thanks for your contribution @CacheControl 🎉
  * `buildFederatedSchema` was [deprecated in @apollo/federation v0.28.0](https://www.apollographql.com/docs/federation/api/apollo-subgraph/#buildsubgraphschema) in favor of `buildSubgraphSchema()`.

* Added workflow to automate preparing release notes by reusing the newrelic/node-newrelic/.github/workflows/prep-release.yml@main workflow from agent repository.

* Added job to add PRs and Issues to Node.js Engineering board

## 1.1.2 (11/11/2021)

* Updated TypeScript definitions to allow plugin configuration to be optional.

  Thank you to @newmind for the contribution!

## 1.1.1 (11/10/2021)

* Updated TypeScript definitions to export `createPlugin` function by default instead of a plugin instance.

  Thank you to @luads for the contribution!

* Pinned `graphql` to a 15.x version for compatibility with Apollo libraries at ^15.

* Updated federation test setup to use `buildSubgraphSchema` per deprecation warnings.

## 1.1.0 (10/20/2021)

* Added TypeScript type definition for the plugin.

  Thank you to @alanhr for the contribution!

* Updated apollo-federation versioned tests to always test against latest dependency versions.

  Federated gateway modules are al < 1.0 releases and have incompatibilities with each other at various versions that impact our versioned testing. We now test only the latest pairs while these are in flight and may have various breaking changes. Once these go 1.0+, we can switch back to a permutation approach.

* Bumped `@newrelic/test-utilities` to ^6.1.1.
* Added `graphql` as a test dependency for apollo-federation versioned tests to fix issues on Node 12/14 runs.
* Limited samples to 15 for full versioned test runs to limit permutations as more versions are released.
* Added `workflow_dispatch` to CI to allow for manual triggering.
* Scheduled CI workflow runs for Monday mornings.
* Limited `apollo-server-koa` versions in versioned tests to skip testing versions that have a hard-pinned `koa` peer-dependency.
* Fixed apollo-server test setup so that the apollo-server specific versioned tests accurately test the right version.


## 1.0.2 (08/27/2021)

* Defaulted deepestPath to an array to avoid crash when there are no selections in query.
* Reduced the test matrix versions of dependencies for apollo-federation versioned tests.

## 1.0.1 (08/25/2021)

* Updated query argument obfuscation logic to use document definition rather than regex.
  **WARNING**: Un-parsable queries will not be added as a graphql.operation.query attribute.
* Added a pre-commit hook to check if package.json changes and run oss third-party manifest and oss third-party notices. This will ensure the third_party_manifest.json and THIRD_PARTY_NOTICES.md are up to date.
* Added @newrelic/eslint-config to rely on a centralized eslint ruleset.

## 1.0.0 (07/15/2021)

* **BREAKING**: modifies transaction and operation segment/span naming to use deepest *unique* path instead of first deepest path.

  The deepest unique path is the deepest path in the selection set of a query where only one field was selected at each level. 'id' and '__typename' fields are automatically excluded from this decision. For example: `query { libraries { branch booksInStock magazinesInStock }}` will use the path name 'libraries' and  `query { libraries { branch __typename id }}` will use the path name 'libraries.branch'. For more information, see the latest [transaction naming documentation](https://github.com/newrelic/newrelic-node-apollo-server-plugin/blob/main/docs/transactions.md).

  This may result in naming changes for your existing GraphQL queries. Any charts, etc. where you are querying by transaction name will need to be updated upon upgrading.

* **BREAKING**: removed the deepest path attribute 'graphql.operation.deepestPath' from operation segments/spans.
* **BREAKING**: Removed support for Node v10.
* Added support for 3.x.x of `apollo-server` and the framework plugin integrations.
* Updated plugin to Ignore Service Definition and/or Health Check queries received from Federated Gateway Server.
  Setting config item(s) `captureServiceDefinitionQuery` and/or `captureHealthCheckQuery` to true will enable plugin to capture timings for those respective queries.
* Improved transaction names that contain InlineFragments(federated sub-graph calls, and union types)
* Added running `apollo-sever-hapi` versioned tests on node 16, `apollo-server-hapi@3.0.0`, `@hapi/hapi@20.1.x`.

## 0.3.0 (07/08/2021)

* Added Apollo Federation support.
  * Updated to always use the GraphQL document schema AST to generate the name and deepest path for transactions for a more consistent naming convention between federated gateway and standard Apollo servers.
  * Fixed segment nesting for Apollo Federation gateway operations.
* Updated `willSendResponse` hook to always grab the query from context.source.
* Provided a new config option, `captureIntrospectionQueries`, to ignore transactions for Introspection Queries.
  * `captureIntrospectionQueries` is defaulted to `false`.
* Added support for capturing persisted queries.
* Fixed crash when items lack a `name` property (InlineFragments).
* Added husky + lint staged to run linting on all staged files as a pre-commit git hook.

## 0.2.0 (05/25/2021)

* Added Node.js v16 to run CI pipeline steps
* Fixed the main field in package.json to point to proper location

  Thank you to @dnalborczyk for these contributions!

* Pinned fastify to a single version for apollo-server-fastify versioned testing.
* Upgraded tap and newrelic agent to latest
* Added husky + lint-staged to run linting on staged files as a pre-commit hook
* Pinned apollo-server-hapi versioned tests to only run on <16
* Bumped `@newrelic/test-utilities` to `^5.1.0`
* Added npm scripts and GitHub actions plumbing to run versioned test runner with appropriate flags for npm v7 and npm v6.

  Node 16 ships with npm v7 which has several different behaviors than npm v6. Testing found we need to ensure all packages are installed for each versioned test permutation which is handled via the --all flag in the new version of the versioned test runner.

## 0.1.3 (02/24/2021)

* Fixed issue where state loss introduced through another module could result in the plugin causing a query to error while trying to set the transaction name.
* Remove unused changelog file.

## 0.1.2 (11/10/2020)

* Fixed bug that would cause errors if transaction state loss occurred prior to plugin execution.

## 0.1.1 (10/29/2020)

* Fixed error when no query string is provided when using Automatic Persisted Queries

  Thank you to @MightySCollins for the contribution!

## 0.1.0 (10/23/2020)

* Initial release of the Node.js Apollo Server Plugin.
  * Transaction naming based on GraphQL query.
  * Segment/Span capture for operations and field resolution, including helpful attributes.
  * Error capture and assignment to appropriate span
  * Metrics for operations and field resolve
  * Excludes scalar fields from span/metric capture by default
  * Verified support for the following frameworks:
    * apollo-server
    * apollo-server-express
    * apollo-server-hapi
    * apollo-server-koa
    * apollo-server-fastify
    * apollo-server-lambda
