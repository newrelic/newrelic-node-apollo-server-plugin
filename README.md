[![Experimental Project header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Experimental.png)](https://opensource.newrelic.com/oss-category/#experimental)

# New Relic Apollo Server plugin ![Apollo Server Plugin CI](https://github.com/newrelic/newrelic-node-apollo-server-plugin/workflows/Apollo%20Server%20Plugin%20CI/badge.svg)

New Relic's official Apollo Server plugin for use with the [Node.js agent](https://github.com/newrelic/node-newrelic).

## Installation and getting started

```
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

## Usage

The New Relic plugin is known to work with the following Apollo Server modules:
* apollo-server
* apollo-server-express
* apollo-server-hapi
* apollo-server-koa
* apollo-server-fastify

Note:  Because fastify is not fully instrumented in the Node Agent, transactions will be prefixed with `WebTransaction\Nodejs`.

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
