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

--- NOTES NEEDS REVIEW ---
Bumps [node-fetch](https://github.com/node-fetch/node-fetch) from 2.6.1 to 2.6.7.
<details>
<summary>Release notes</summary>
<p><em>Sourced from <a href="https://github.com/node-fetch/node-fetch/releases">node-fetch's releases</a>.</em></p>
<blockquote>
<h2>v2.6.7</h2>
<h1>Security patch release</h1>
<p>Recommended to upgrade, to not leak sensitive cookie and authentication header information to 3th party host while a redirect occurred</p>
<h2>What's Changed</h2>
<ul>
<li>fix: don't forward secure headers to 3th party by <a href="https://github.com/jimmywarting"><code>@​jimmywarting</code></a> in <a href="https://github-redirect.dependabot.com/node-fetch/node-fetch/pull/1453">node-fetch/node-fetch#1453</a></li>
</ul>
<p><strong>Full Changelog</strong>: <a href="https://github.com/node-fetch/node-fetch/compare/v2.6.6...v2.6.7">https://github.com/node-fetch/node-fetch/compare/v2.6.6...v2.6.7</a></p>
<h2>v2.6.6</h2>
<h2>What's Changed</h2>
<ul>
<li>fix(URL): prefer built in URL version when available and fallback to whatwg by <a href="https://github.com/jimmywarting"><code>@​jimmywarting</code></a> in <a href="https://github-redirect.dependabot.com/node-fetch/node-fetch/pull/1352">node-fetch/node-fetch#1352</a></li>
</ul>
<p><strong>Full Changelog</strong>: <a href="https://github.com/node-fetch/node-fetch/compare/v2.6.5...v2.6.6">https://github.com/node-fetch/node-fetch/compare/v2.6.5...v2.6.6</a></p>
<h2>v2.6.2</h2>
<p>fixed main path in package.json</p>
</blockquote>
</details>
<details>
<summary>Commits</summary>
<ul>
<li><a href="https://github.com/node-fetch/node-fetch/commit/1ef4b560a17e644a02a3bfdea7631ffeee578b35"><code>1ef4b56</code></a> backport of <a href="https://github-redirect.dependabot.com/node-fetch/node-fetch/issues/1449">#1449</a> (<a href="https://github-redirect.dependabot.com/node-fetch/node-fetch/issues/1453">#1453</a>)</li>
<li><a href="https://github.com/node-fetch/node-fetch/commit/8fe5c4ea66b9b8187600e6d5ec9b1b6781f44009"><code>8fe5c4e</code></a> 2.x: Specify encoding as an optional peer dependency in package.json (<a href="https://github-redirect.dependabot.com/node-fetch/node-fetch/issues/1310">#1310</a>)</li>
<li><a href="https://github.com/node-fetch/node-fetch/commit/f56b0c66d3dd2ef185436de1f2fd40f66bfea8f4"><code>f56b0c6</code></a> fix(URL): prefer built in URL version when available and fallback to whatwg (...</li>
<li><a href="https://github.com/node-fetch/node-fetch/commit/b5417aea6a3275932283a200214522e6ab53f1ea"><code>b5417ae</code></a> fix: import whatwg-url in a way compatible with ESM Node (<a href="https://github-redirect.dependabot.com/node-fetch/node-fetch/issues/1303">#1303</a>)</li>
<li><a href="https://github.com/node-fetch/node-fetch/commit/18193c5922c64046b922e18faf41821290535f06"><code>18193c5</code></a> fix v2.6.3 that did not sending query params (<a href="https://github-redirect.dependabot.com/node-fetch/node-fetch/issues/1301">#1301</a>)</li>
<li><a href="https://github.com/node-fetch/node-fetch/commit/ace7536c955556be742d9910566738630cc3c2a6"><code>ace7536</code></a> fix: properly encode url with unicode characters (<a href="https://github-redirect.dependabot.com/node-fetch/node-fetch/issues/1291">#1291</a>)</li>
<li><a href="https://github.com/node-fetch/node-fetch/commit/152214ca2f6e2a5a17d71e4638114625d3be30c6"><code>152214c</code></a> Fix(package.json): Corrected main file path in package.json (<a href="https://github-redirect.dependabot.com/node-fetch/node-fetch/issues/1274">#1274</a>)</li>
<li>See full diff in <a href="https://github.com/node-fetch/node-fetch/compare/v2.6.1...v2.6.7">compare view</a></li>
</ul>
</details>
<details>
<summary>Maintainer changes</summary>
<p>This version was pushed to npm by <a href="https://www.npmjs.com/~endless">endless</a>, a new releaser for node-fetch since your current version.</p>
</details>
<br />


[![Dependabot compatibility score](https://dependabot-badges.githubapp.com/badges/compatibility_score?dependency-name=node-fetch&package-manager=npm_and_yarn&previous-version=2.6.1&new-version=2.6.7)](https://docs.github.com/en/github/managing-security-vulnerabilities/about-dependabot-security-updates#about-compatibility-scores)

Dependabot will resolve any conflicts with this PR as long as you don't alter it yourself. You can also trigger a rebase manually by commenting `@dependabot rebase`.

[//]: # (dependabot-automerge-start)
[//]: # (dependabot-automerge-end)

---

<details>
<summary>Dependabot commands and options</summary>
<br />

You can trigger Dependabot actions by commenting on this PR:
- `@dependabot rebase` will rebase this PR
- `@dependabot recreate` will recreate this PR, overwriting any edits that have been made to it
- `@dependabot merge` will merge this PR after your CI passes on it
- `@dependabot squash and merge` will squash and merge this PR after your CI passes on it
- `@dependabot cancel merge` will cancel a previously requested merge and block automerging
- `@dependabot reopen` will reopen this PR if it is closed
- `@dependabot close` will close this PR and stop Dependabot recreating it. You can achieve the same result by closing it manually
- `@dependabot ignore this major version` will close this PR and stop Dependabot creating any more for this major version (unless you reopen the PR or upgrade to it yourself)
- `@dependabot ignore this minor version` will close this PR and stop Dependabot creating any more for this minor version (unless you reopen the PR or upgrade to it yourself)
- `@dependabot ignore this dependency` will close this PR and stop Dependabot creating any more for this dependency (unless you reopen the PR or upgrade to it yourself)
- `@dependabot use these labels` will set the current labels as the default for future PRs for this repo and language
- `@dependabot use these reviewers` will set the current reviewers as the default for future PRs for this repo and language
- `@dependabot use these assignees` will set the current assignees as the default for future PRs for this repo and language
- `@dependabot use this milestone` will set the current milestone as the default for future PRs for this repo and language

You can disable automated security fix PRs for this repo from the [Security Alerts page](https://github.com/newrelic/newrelic-node-apollo-server-plugin/network/alerts).

</details>
--------------------------

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
