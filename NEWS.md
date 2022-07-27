### v2.0.0 (2022-07-27)

* Updated engines stanza to `>=14` to drop support for Node 12.

--- NOTES NEEDS REVIEW ---
Bumps [moment](https://github.com/moment/moment) from 2.29.2 to 2.29.4.
<details>
<summary>Changelog</summary>
<p><em>Sourced from <a href="https://github.com/moment/moment/blob/develop/CHANGELOG.md">moment's changelog</a>.</em></p>
<blockquote>
<h3>2.29.4</h3>
<ul>
<li>Release Jul 6, 2022
<ul>
<li><a href="https://github-redirect.dependabot.com/moment/moment/pull/6015">#6015</a> [bugfix] Fix ReDoS in preprocessRFC2822 regex</li>
</ul>
</li>
</ul>
<h3>2.29.3 <a href="https://gist.github.com/ichernev/edebd440f49adcaec72e5e77b791d8be">Full changelog</a></h3>
<ul>
<li>Release Apr 17, 2022
<ul>
<li><a href="https://github-redirect.dependabot.com/moment/moment/pull/5995">#5995</a> [bugfix] Remove const usage</li>
<li><a href="https://github-redirect.dependabot.com/moment/moment/pull/5990">#5990</a> misc: fix advisory link</li>
</ul>
</li>
</ul>
</blockquote>
</details>
<details>
<summary>Commits</summary>
<ul>
<li><a href="https://github.com/moment/moment/commit/000ac1800e620f770f4eb31b5ae908f6167b0ab2"><code>000ac18</code></a> Build 2.24.4</li>
<li><a href="https://github.com/moment/moment/commit/f2006b647939466f4f403721b8c7816d844c038c"><code>f2006b6</code></a> Bump version to 2.24.4</li>
<li><a href="https://github.com/moment/moment/commit/536ad0c348f2f99009755698f491080757a48221"><code>536ad0c</code></a> Update changelog for 2.29.4</li>
<li><a href="https://github.com/moment/moment/commit/9a3b5894f3d5d602948ac8a02e4ee528a49ca3a3"><code>9a3b589</code></a> [bugfix] Fix redos in preprocessRFC2822 regex (<a href="https://github-redirect.dependabot.com/moment/moment/issues/6015">#6015</a>)</li>
<li><a href="https://github.com/moment/moment/commit/6374fd860aeff75e6c9d9d11540c6b22bc7ef175"><code>6374fd8</code></a> Merge branch 'master' into develop</li>
<li><a href="https://github.com/moment/moment/commit/b4e615307ee350b58ac9899e3587ce43972b0753"><code>b4e6153</code></a> Revert &quot;[bugfix] Fix redos in preprocessRFC2822 regex (<a href="https://github-redirect.dependabot.com/moment/moment/issues/6015">#6015</a>)&quot;</li>
<li><a href="https://github.com/moment/moment/commit/7aebb1617fc9bced87ab6bc4c317644019b23ce7"><code>7aebb16</code></a> [bugfix] Fix redos in preprocessRFC2822 regex (<a href="https://github-redirect.dependabot.com/moment/moment/issues/6015">#6015</a>)</li>
<li><a href="https://github.com/moment/moment/commit/57c90622e402c929504cc6d6f3de4ebe2a9ffc73"><code>57c9062</code></a> Build 2.29.3</li>
<li><a href="https://github.com/moment/moment/commit/aaf50b6bca4075f40a3372c291ae8072fb4e9dcf"><code>aaf50b6</code></a> Fixup release complaints</li>
<li><a href="https://github.com/moment/moment/commit/26f4aef9ca0b4c998107bf7e2cf1c33c30368d44"><code>26f4aef</code></a> Bump version to 2.29.3</li>
<li>Additional commits viewable in <a href="https://github.com/moment/moment/compare/2.29.2...2.29.4">compare view</a></li>
</ul>
</details>
<br />


[![Dependabot compatibility score](https://dependabot-badges.githubapp.com/badges/compatibility_score?dependency-name=moment&package-manager=npm_and_yarn&previous-version=2.29.2&new-version=2.29.4)](https://docs.github.com/en/github/managing-security-vulnerabilities/about-dependabot-security-updates#about-compatibility-scores)

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

* Updated linting to run against latest LTS.

* Updated tests to run against Node versions 14-18.

--- NOTES NEEDS REVIEW ---
Bumps [protobufjs](https://github.com/protobufjs/protobuf.js) from 6.11.2 to 6.11.3.
<details>
<summary>Release notes</summary>
<p><em>Sourced from <a href="https://github.com/protobufjs/protobuf.js/releases">protobufjs's releases</a>.</em></p>
<blockquote>
<h2>v6.11.3</h2>
<h3><a href="https://github.com/protobufjs/protobuf.js/compare/v6.11.2...v6.11.3">6.11.3</a> (2022-05-20)</h3>
<h3>Bug Fixes</h3>
<ul>
<li><strong>deps:</strong> use eslint 8.x (<a href="https://github-redirect.dependabot.com/protobufjs/protobuf.js/issues/1728">#1728</a>) (<a href="https://github.com/protobufjs/protobuf.js/commit/a8681ceab4763e706a848121a2dde56791b89eea">a8681ce</a>)</li>
<li>do not let setProperty change the prototype (<a href="https://github-redirect.dependabot.com/protobufjs/protobuf.js/issues/1731">#1731</a>) (<a href="https://github.com/protobufjs/protobuf.js/commit/b5f1391dff5515894830a6570e6d73f5511b2e8f">b5f1391</a>)</li>
</ul>
</blockquote>
</details>
<details>
<summary>Changelog</summary>
<p><em>Sourced from <a href="https://github.com/protobufjs/protobuf.js/blob/v6.11.3/CHANGELOG.md">protobufjs's changelog</a>.</em></p>
<blockquote>
<h3><a href="https://github.com/protobufjs/protobuf.js/compare/v6.11.2...v6.11.3">6.11.3</a> (2022-05-20)</h3>
<h3>Bug Fixes</h3>
<ul>
<li><strong>deps:</strong> use eslint 8.x (<a href="https://github-redirect.dependabot.com/protobufjs/protobuf.js/issues/1728">#1728</a>) (<a href="https://github.com/protobufjs/protobuf.js/commit/a8681ceab4763e706a848121a2dde56791b89eea">a8681ce</a>)</li>
<li>do not let setProperty change the prototype (<a href="https://github-redirect.dependabot.com/protobufjs/protobuf.js/issues/1731">#1731</a>) (<a href="https://github.com/protobufjs/protobuf.js/commit/b5f1391dff5515894830a6570e6d73f5511b2e8f">b5f1391</a>)</li>
</ul>
</blockquote>
</details>
<details>
<summary>Commits</summary>
<ul>
<li><a href="https://github.com/protobufjs/protobuf.js/commit/b130dfd4f06b642d4b7c3ccc9f3f9fb6a6e6ed0d"><code>b130dfd</code></a> chore(6.x): release 6.11.3 (<a href="https://github-redirect.dependabot.com/protobufjs/protobuf.js/issues/1737">#1737</a>)</li>
<li><a href="https://github.com/protobufjs/protobuf.js/commit/c2c17ae66810378fbad616964d80894794f1dad1"><code>c2c17ae</code></a> build: publish to main</li>
<li><a href="https://github.com/protobufjs/protobuf.js/commit/b2c6a5c76eccd4bbe445d13e3a04b949f344dd63"><code>b2c6a5c</code></a> build: run tests if ci label added (<a href="https://github-redirect.dependabot.com/protobufjs/protobuf.js/issues/1734">#1734</a>)</li>
<li><a href="https://github.com/protobufjs/protobuf.js/commit/a8681ceab4763e706a848121a2dde56791b89eea"><code>a8681ce</code></a> fix(deps): use eslint 8.x (<a href="https://github-redirect.dependabot.com/protobufjs/protobuf.js/issues/1728">#1728</a>)</li>
<li><a href="https://github.com/protobufjs/protobuf.js/commit/b5f1391dff5515894830a6570e6d73f5511b2e8f"><code>b5f1391</code></a> fix: do not let setProperty change the prototype (<a href="https://github-redirect.dependabot.com/protobufjs/protobuf.js/issues/1731">#1731</a>)</li>
<li><a href="https://github.com/protobufjs/protobuf.js/commit/7afd0a39f41d6df5fda6fa10c319cdf829027d3e"><code>7afd0a3</code></a> build: configure 6.x as default branch</li>
<li><a href="https://github.com/protobufjs/protobuf.js/commit/37285d0cdc8b20acacd0227daa2e577921de46a7"><code>37285d0</code></a> build: configure backports</li>
<li>See full diff in <a href="https://github.com/protobufjs/protobuf.js/compare/v6.11.2...v6.11.3">compare view</a></li>
</ul>
</details>
<br />


[![Dependabot compatibility score](https://dependabot-badges.githubapp.com/badges/compatibility_score?dependency-name=protobufjs&package-manager=npm_and_yarn&previous-version=6.11.2&new-version=6.11.3)](https://docs.github.com/en/github/managing-security-vulnerabilities/about-dependabot-security-updates#about-compatibility-scores)

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
