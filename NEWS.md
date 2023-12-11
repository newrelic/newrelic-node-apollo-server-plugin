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
