[![Experimental Project header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Experimental.png)](https://opensource.newrelic.com/oss-category/#experimental)

# New Relic Apollo Server plugin ![Apollo Server Plugin CI](https://github.com/newrelic/newrelic-node-apollo-server-plugin/workflows/Apollo%20Server%20Plugin%20CI/badge.svg)

New Relic's official Apollo Server plugin for use with the [Node.js agent](https://github.com/newrelic/node-newrelic).

This plugin expects the Node.js agent [newrelic npm package](https://www.npmjs.com/package/newrelic) has already been installed in your application.

## Installation

```
npm install newrelic
npm install @newrelic/apollo-server-plugin
```

```js
// index.js
const plugin = require('@newrelic/apollo-server-plugin')

// imported from supported module
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [plugin]
})
```

## Getting started

The `@newrelic/apollo-server-plugin` exports a `createPlugin` function that does accept limited configuration. Since Apollo Server will invoke any function passed to plugins, invoking this yourself is not required unless you plan to override specific configuration.

To use the plugin without specific configuration, you can pass the function in directly similar to:

```js
// index.js
const plugin = require('@newrelic/apollo-server-plugin')

// imported from supported module
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [plugin]
})
```

To override configuration, invoke the `createPlugin` function prior to passing to Apollo Server:

```js
// index.js
const createPlugin = require('@newrelic/apollo-server-plugin')
const plugin = createPlugin({
  captureScalars: false
})

// imported from supported module
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [plugin]
})
```

## Usage

The New Relic plugin is known to work with the following Apollo Server modules:
* apollo-server
* apollo-server-express
* apollo-server-hapi
* apollo-server-koa
* apollo-server-fastify
* apollo-server-lambda

Note: Because fastify is not fully instrumented in the Node.js Agent, transactions will be prefixed with `WebTransaction\Nodejs`.

Other plugins may work, depending on their underlying implementation, but have not been verified.

### Configuration

Configuration may be passed into the `createPlugin` function to override specific values. The configuration object and all properties are optional.

```js
const plugin = createPlugin({
  captureScalars: true
})
```

* `[captureScalars = false]` Enable capture of timing of fields resolved with the
  `GraphQLScalarType` return type. This may be desired when performing time intensive
  calculations to return a scalar value. This is not recommended for queries that return
  a large number of pre-calculated scalar fields.

  **NOTE:** query/mutation resolvers will always be captured even if returning a scalar type.

### Transactions

[Transaction Documentation](./docs/transactions.md)

Transactions are captured as web transactions, associated with the underlying framework (Express, Koa, etc.), and named based on the GraphQL operations executed.

Here's an example query and how that may be represented in NR One.

```
query {
  libraries {
    books {
      title
      author {
        name
      }
    }
  }
}
```

`post /query/<anonymous>/libraries.books.author.name`

For more information on how transactions are named, including how query errors may impact naming, please see the [transaction documentation](./docs/transactions.md).

### Metrics

[Metrics Documentation](./docs/metrics.md)

Two new metrics have been introduced to understand the behavior of your GraphQL operations within and across transactions.

#### Operation Metrics

`/GraphQL/operation/ApolloServer/[operation-type]/[operation-name]/[deepest-path]`

Operation metrics are very similar to how transaction names are constructed including the operation type, operation name and deepest-path. These metrics represent the durations of the individual queries or mutations and can be used to compare outside of the context of individual transactions which may have multiple queries.

If you would like to have a list of the top 10 slowest operations, the following query can be used to pull the data on demand or as a part of a dashboard. The 'Bar' chart type is a recommended visualization for this query.

```
FROM Metric SELECT average(newrelic.timeslice.value) * 1000 WHERE appName = '[YOUR APP NAME]' WITH METRIC_FORMAT 'GraphQL/operation/ApolloServer/{operation}' FACET operation LIMIT 10
```

#### Field Resolve Metrics

`/GraphQL/resolve/ApolloServer/[field-name]`

Resolve metrics capture the duration spent resolving a particular piece of requested GraphQL data. These can be useful to find specific resolvers that may contribute to slowing down incoming queries.

If you would like to have a list of the top 10 slowest resolves, the following query can be used to pull the data on demand or as a part of a dashboard. The 'Bar' chart type is a recommended visualization for this query.

```
FROM Metric
SELECT average(newrelic.timeslice.value) * 1000 WHERE appName = '[YOUR APP NAME]' WITH METRIC_FORMAT 'GraphQL/resolve/ApolloServer/{field}' FACET field LIMIT 10
```

For more information on metrics and some recommended visualizations, please see the [metrics documentation](./docs/metrics.md).

### Segments and Spans

[Segments and Spans](./docs/segments-and-spans.md)

Segments and spans (when Distributed Tracing enabled) are captured for GraphQL operations, field resolution and additional work (when instrumented) that occurs as a part of field resolution such as making a query to a database.

#### Operation Segments/Spans

`/GraphQL/operation/ApolloServer/[operation-type]/[operation-name]/[deepest-path]`

Operation segments/spans include the operation type, operation name and deepest-path. These represent the individual duration and attributes of a specific invocation within a transaction or trace.

The operation type, operation name and deepest-path are captured as attributes on a segment or span as well as the query with obfuscated arguments.

For more information on collected attributes, see the [segments and spans documentation](./docs/segments-and-spans.md)

#### Field Resolve Segments/Spans

`/GraphQL/resolve/ApolloServer/[path]`

Resolve segments/spans leverage the resolution path of the individual field to best differentiate within a given trace or transaction. For example, `libraries.books` might be used instead of just `books`. These represent the individual duration and attributes of a specific field being resolved as a part of the GraphQL operation.

The field name, return type, parent type, path and arguments (disabled by default) are all captured as attributes.

For more information on collected attributes, including enabling args capture, see the [segments and spans documentation](./docs/segments-and-spans.md)

### Errors

The agent will notice GraphQL errors that get sent back to the client.

Depend on where the error was thrown, these will be associated with either the operation span or the specific field resolve span (Distribute Tracing enabled) to enable further debugging of issues.

## Testing

The module includes a suite of unit and functional tests which should be used to
verify that your changes don't break existing functionality.

All tests are stored in `tests/` and are written using
[Tap](https://www.npmjs.com/package/tap) with the extension `.tap.js`.

To run the full suite, run: `npm test`.

Individual test scripts include:

```
npm run unit
npm run integration
npm run versioned
```

## Support

Should you need assistance with New Relic products, you are in good hands with several [**Optional** support diagnostic tools and] support channels.

This [troubleshooting framework](https://discuss.newrelic.com/t/troubleshooting-frameworks/108787) steps you through common troubleshooting questions.

New Relic offers NRDiag, [a client-side diagnostic utility](https://docs.newrelic.com/docs/using-new-relic/cross-product-functions/troubleshooting/new-relic-diagnostics) that automatically detects common problems with New Relic agents. If NRDiag detects a problem, it suggests troubleshooting steps. NRDiag can also automatically attach troubleshooting data to a New Relic Support ticket. Remove this section if it doesn't apply.

If the issue has been confirmed as a bug or is a feature request, file a GitHub issue.

**Support Channels**

* [New Relic Documentation](https://docs.newrelic.com/docs/agents/nodejs-agent/getting-started/introduction-new-relic-nodejs): Comprehensive guidance for using our platform
* [New Relic Community](https://discuss.newrelic.com/c/support-products-agents/node-js-agent/): The best place to engage in troubleshooting questions
* [New Relic Developer](https://developer.newrelic.com/): Resources for building a custom observability applications
* [New Relic University](https://learn.newrelic.com/): A range of online training for New Relic users of every level

## Privacy

At New Relic we take your privacy and the security of your information seriously, and are committed to protecting your information. We must emphasize the importance of not sharing personal data in public forums, and ask all users to scrub logs and diagnostic information for sensitive information, whether personal, proprietary, or otherwise.

We define “Personal Data” as any information relating to an identified or identifiable individual, including, for example, your name, phone number, post code or zip code, Device ID, IP address, and email address.

For more information, review [New Relic’s General Data Privacy Notice](https://newrelic.com/termsandconditions/privacy).

## Contribute

We encourage your contributions to improve the New Relic Apollo Server plugin! Keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. You only have to sign the CLA one time per project.

If you have any questions, or to execute our corporate CLA (which is required if your contribution is on behalf of a company), drop us an email at opensource@newrelic.com.

If you would like to contribute to this project, review [these guidelines](./CONTRIBUTING.md).

To [all contributors](https://github.com/newrelic/newrelic-node-apollo-server-plugin/graphs/contributors), we thank you!  Without your contribution, this project would not be what it is today.  We also host a community project page dedicated to the [New Relic Apollo Server plugin](https://opensource.newrelic.com/newrelic/newrelic-node-apollo-server-plugin).

**A note about vulnerabilities**

As noted in our [security policy](https://github.com/newrelic/newrelic-node-apollo-server-plugin/security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the security community are important means to achieve our security goals.

If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through [HackerOne](https://hackerone.com/newrelic).

## License

The New Relic Apollo Server plugin is licensed under the [Apache 2.0](http://apache.org/licenses/LICENSE-2.0.txt) License.

The New Relic Apollo Server plugin also uses source code from third-party libraries. You can find full details on which libraries are used and the terms under which they are licensed in the third-party notices document.
