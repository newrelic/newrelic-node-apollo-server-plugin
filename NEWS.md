### v4.0.1 (2023-10-25)

Fixes typescript type declarations to correctly define the exports for this package. Since there is only a single export, if you need to import the type for the plugin config explicitly you would need to import it from `/config`, eg, `import type { NRPluginConfig } from '@newrelic/apollo-server-plugin/config'`.

--- NOTES NEEDS REVIEW ---
Bumps  and [@babel/traverse](https://github.com/babel/babel/tree/HEAD/packages/babel-traverse). These dependencies needed to be updated together.
Updates `@babel/traverse` from 7.17.3 to 7.23.2
<details>
<summary>Release notes</summary>
<p><em>Sourced from <a href="https://github.com/babel/babel/releases"><code>@​babel/traverse</code>'s releases</a>.</em></p>
<blockquote>
<h2>v7.23.2 (2023-10-11)</h2>
<p><strong>NOTE</strong>: This release also re-publishes <code>@babel/core</code>, even if it does not appear in the linked release commit.</p>
<p>Thanks <a href="https://github.com/jimmydief"><code>@​jimmydief</code></a> for your first PR!</p>
<h4>:bug: Bug Fix</h4>
<ul>
<li><code>babel-traverse</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/16033">#16033</a> Only evaluate own String/Number/Math methods (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-preset-typescript</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/16022">#16022</a> Rewrite <code>.tsx</code> extension when using <code>rewriteImportExtensions</code> (<a href="https://github.com/jimmydief"><code>@​jimmydief</code></a>)</li>
</ul>
</li>
<li><code>babel-helpers</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/16017">#16017</a> Fix: fallback to typeof when toString is applied to incompatible object (<a href="https://github.com/JLHwung"><code>@​JLHwung</code></a>)</li>
</ul>
</li>
<li><code>babel-helpers</code>, <code>babel-plugin-transform-modules-commonjs</code>, <code>babel-runtime-corejs2</code>, <code>babel-runtime-corejs3</code>, <code>babel-runtime</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/16025">#16025</a> Avoid override mistake in namespace imports (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
</ul>
<h4>Committers: 5</h4>
<ul>
<li>Babel Bot (<a href="https://github.com/babel-bot"><code>@​babel-bot</code></a>)</li>
<li>Huáng Jùnliàng (<a href="https://github.com/JLHwung"><code>@​JLHwung</code></a>)</li>
<li>James Diefenderfer (<a href="https://github.com/jimmydief"><code>@​jimmydief</code></a>)</li>
<li>Nicolò Ribaudo (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
<li><a href="https://github.com/liuxingbaoyu"><code>@​liuxingbaoyu</code></a></li>
</ul>
<h2>v7.23.1 (2023-09-25)</h2>
<p>Re-publishing <code>@babel/helpers</code> due to a publishing error in 7.23.0.</p>
<h2>v7.23.0 (2023-09-25)</h2>
<p>Thanks <a href="https://github.com/lorenzoferre"><code>@​lorenzoferre</code></a> and <a href="https://github.com/RajShukla1"><code>@​RajShukla1</code></a> for your first PRs!</p>
<h4>:rocket: New Feature</h4>
<ul>
<li><code>babel-plugin-proposal-import-wasm-source</code>, <code>babel-plugin-syntax-import-source</code>, <code>babel-plugin-transform-dynamic-import</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15870">#15870</a> Support transforming <code>import source</code> for wasm (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-helper-module-transforms</code>, <code>babel-helpers</code>, <code>babel-plugin-proposal-import-defer</code>, <code>babel-plugin-syntax-import-defer</code>, <code>babel-plugin-transform-modules-commonjs</code>, <code>babel-runtime-corejs2</code>, <code>babel-runtime-corejs3</code>, <code>babel-runtime</code>, <code>babel-standalone</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15878">#15878</a> Implement <code>import defer</code> proposal transform support (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-generator</code>, <code>babel-parser</code>, <code>babel-types</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15845">#15845</a> Implement <code>import defer</code> parsing support (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
<li><a href="https://redirect.github.com/babel/babel/pull/15829">#15829</a> Add parsing support for the &quot;source phase imports&quot; proposal (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-generator</code>, <code>babel-helper-module-transforms</code>, <code>babel-parser</code>, <code>babel-plugin-transform-dynamic-import</code>, <code>babel-plugin-transform-modules-amd</code>, <code>babel-plugin-transform-modules-commonjs</code>, <code>babel-plugin-transform-modules-systemjs</code>, <code>babel-traverse</code>, <code>babel-types</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15682">#15682</a> Add <code>createImportExpressions</code> parser option (<a href="https://github.com/JLHwung"><code>@​JLHwung</code></a>)</li>
</ul>
</li>
<li><code>babel-standalone</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15671">#15671</a> Pass through nonce to the transformed script element (<a href="https://github.com/JLHwung"><code>@​JLHwung</code></a>)</li>
</ul>
</li>
<li><code>babel-helper-function-name</code>, <code>babel-helper-member-expression-to-functions</code>, <code>babel-helpers</code>, <code>babel-parser</code>, <code>babel-plugin-proposal-destructuring-private</code>, <code>babel-plugin-proposal-optional-chaining-assign</code>, <code>babel-plugin-syntax-optional-chaining-assign</code>, <code>babel-plugin-transform-destructuring</code>, <code>babel-plugin-transform-optional-chaining</code>, <code>babel-runtime-corejs2</code>, <code>babel-runtime-corejs3</code>, <code>babel-runtime</code>, <code>babel-standalone</code>, <code>babel-types</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15751">#15751</a> Add support for optional chain in assignments (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-helpers</code>, <code>babel-plugin-proposal-decorators</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15895">#15895</a> Implement the &quot;decorator metadata&quot; proposal (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-traverse</code>, <code>babel-types</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15893">#15893</a> Add <code>t.buildUndefinedNode</code> (<a href="https://github.com/liuxingbaoyu"><code>@​liuxingbaoyu</code></a>)</li>
</ul>
</li>
<li><code>babel-preset-typescript</code></li>
</ul>
<!-- raw HTML omitted -->
</blockquote>
<p>... (truncated)</p>
</details>
<details>
<summary>Changelog</summary>
<p><em>Sourced from <a href="https://github.com/babel/babel/blob/main/CHANGELOG.md"><code>@​babel/traverse</code>'s changelog</a>.</em></p>
<blockquote>
<h2>v7.23.2 (2023-10-11)</h2>
<h4>:bug: Bug Fix</h4>
<ul>
<li><code>babel-traverse</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/16033">#16033</a> Only evaluate own String/Number/Math methods (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-preset-typescript</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/16022">#16022</a> Rewrite <code>.tsx</code> extension when using <code>rewriteImportExtensions</code> (<a href="https://github.com/jimmydief"><code>@​jimmydief</code></a>)</li>
</ul>
</li>
<li><code>babel-helpers</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/16017">#16017</a> Fix: fallback to typeof when toString is applied to incompatible object (<a href="https://github.com/JLHwung"><code>@​JLHwung</code></a>)</li>
</ul>
</li>
<li><code>babel-helpers</code>, <code>babel-plugin-transform-modules-commonjs</code>, <code>babel-runtime-corejs2</code>, <code>babel-runtime-corejs3</code>, <code>babel-runtime</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/16025">#16025</a> Avoid override mistake in namespace imports (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
</ul>
<h2>v7.23.0 (2023-09-25)</h2>
<h4>:rocket: New Feature</h4>
<ul>
<li><code>babel-plugin-proposal-import-wasm-source</code>, <code>babel-plugin-syntax-import-source</code>, <code>babel-plugin-transform-dynamic-import</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15870">#15870</a> Support transforming <code>import source</code> for wasm (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-helper-module-transforms</code>, <code>babel-helpers</code>, <code>babel-plugin-proposal-import-defer</code>, <code>babel-plugin-syntax-import-defer</code>, <code>babel-plugin-transform-modules-commonjs</code>, <code>babel-runtime-corejs2</code>, <code>babel-runtime-corejs3</code>, <code>babel-runtime</code>, <code>babel-standalone</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15878">#15878</a> Implement <code>import defer</code> proposal transform support (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-generator</code>, <code>babel-parser</code>, <code>babel-types</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15845">#15845</a> Implement <code>import defer</code> parsing support (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
<li><a href="https://redirect.github.com/babel/babel/pull/15829">#15829</a> Add parsing support for the &quot;source phase imports&quot; proposal (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-generator</code>, <code>babel-helper-module-transforms</code>, <code>babel-parser</code>, <code>babel-plugin-transform-dynamic-import</code>, <code>babel-plugin-transform-modules-amd</code>, <code>babel-plugin-transform-modules-commonjs</code>, <code>babel-plugin-transform-modules-systemjs</code>, <code>babel-traverse</code>, <code>babel-types</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15682">#15682</a> Add <code>createImportExpressions</code> parser option (<a href="https://github.com/JLHwung"><code>@​JLHwung</code></a>)</li>
</ul>
</li>
<li><code>babel-standalone</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15671">#15671</a> Pass through nonce to the transformed script element (<a href="https://github.com/JLHwung"><code>@​JLHwung</code></a>)</li>
</ul>
</li>
<li><code>babel-helper-function-name</code>, <code>babel-helper-member-expression-to-functions</code>, <code>babel-helpers</code>, <code>babel-parser</code>, <code>babel-plugin-proposal-destructuring-private</code>, <code>babel-plugin-proposal-optional-chaining-assign</code>, <code>babel-plugin-syntax-optional-chaining-assign</code>, <code>babel-plugin-transform-destructuring</code>, <code>babel-plugin-transform-optional-chaining</code>, <code>babel-runtime-corejs2</code>, <code>babel-runtime-corejs3</code>, <code>babel-runtime</code>, <code>babel-standalone</code>, <code>babel-types</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15751">#15751</a> Add support for optional chain in assignments (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-helpers</code>, <code>babel-plugin-proposal-decorators</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15895">#15895</a> Implement the &quot;decorator metadata&quot; proposal (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-traverse</code>, <code>babel-types</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15893">#15893</a> Add <code>t.buildUndefinedNode</code> (<a href="https://github.com/liuxingbaoyu"><code>@​liuxingbaoyu</code></a>)</li>
</ul>
</li>
<li><code>babel-preset-typescript</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15913">#15913</a> Add <code>rewriteImportExtensions</code> option to TS preset (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-parser</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15896">#15896</a> Allow TS tuples to have both labeled and unlabeled elements (<a href="https://github.com/yukukotani"><code>@​yukukotani</code></a>)</li>
</ul>
</li>
</ul>
<h4>:bug: Bug Fix</h4>
<ul>
<li><code>babel-plugin-transform-block-scoping</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15962">#15962</a> fix: <code>transform-block-scoping</code> captures the variables of the method in the loop (<a href="https://github.com/liuxingbaoyu"><code>@​liuxingbaoyu</code></a>)</li>
</ul>
</li>
</ul>
<h4>:nail_care: Polish</h4>
<ul>
<li><code>babel-traverse</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15797">#15797</a> Expand evaluation of global built-ins in <code>@babel/traverse</code> (<a href="https://github.com/lorenzoferre"><code>@​lorenzoferre</code></a>)</li>
</ul>
</li>
<li><code>babel-plugin-proposal-explicit-resource-management</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15985">#15985</a> Improve source maps for blocks with <code>using</code> declarations (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
</ul>
<h4>:microscope: Output optimization</h4>
<ul>
<li><code>babel-core</code>, <code>babel-helper-module-transforms</code>, <code>babel-plugin-transform-async-to-generator</code>, <code>babel-plugin-transform-classes</code>, <code>babel-plugin-transform-dynamic-import</code>, <code>babel-plugin-transform-function-name</code>, <code>babel-plugin-transform-modules-amd</code>, <code>babel-plugin-transform-modules-commonjs</code>, <code>babel-plugin-transform-modules-umd</code>, <code>babel-plugin-transform-parameters</code>, <code>babel-plugin-transform-react-constant-elements</code>, <code>babel-plugin-transform-react-inline-elements</code>, <code>babel-plugin-transform-runtime</code>, <code>babel-plugin-transform-typescript</code>, <code>babel-preset-env</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15984">#15984</a> Inline <code>exports.XXX =</code> update in simple variable declarations (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
</ul>
<h2>v7.22.20 (2023-09-16)</h2>
<!-- raw HTML omitted -->
</blockquote>
<p>... (truncated)</p>
</details>
<details>
<summary>Commits</summary>
<ul>
<li><a href="https://github.com/babel/babel/commit/b4b9942a6cde0685c222eb3412347880aae40ad5"><code>b4b9942</code></a> v7.23.2</li>
<li><a href="https://github.com/babel/babel/commit/b13376b346946e3f62fc0848c1d2a23223314c82"><code>b13376b</code></a> Only evaluate own String/Number/Math methods (<a href="https://github.com/babel/babel/tree/HEAD/packages/babel-traverse/issues/16033">#16033</a>)</li>
<li><a href="https://github.com/babel/babel/commit/ca58ec15cb6dde6812c36997477e44880bec0bba"><code>ca58ec1</code></a> v7.23.0</li>
<li><a href="https://github.com/babel/babel/commit/0f333dafcf470f1970083e4e695ced6aec8bead0"><code>0f333da</code></a> Add <code>createImportExpressions</code> parser option (<a href="https://github.com/babel/babel/tree/HEAD/packages/babel-traverse/issues/15682">#15682</a>)</li>
<li><a href="https://github.com/babel/babel/commit/3744545649fdc21688a2f3c97e1e39dbebff0d21"><code>3744545</code></a> Fix linting</li>
<li><a href="https://github.com/babel/babel/commit/c7e6806e2194deb36c330f543409c792592b22d4"><code>c7e6806</code></a> Add <code>t.buildUndefinedNode</code> (<a href="https://github.com/babel/babel/tree/HEAD/packages/babel-traverse/issues/15893">#15893</a>)</li>
<li><a href="https://github.com/babel/babel/commit/38ee8b4dd693f1e2bd00107bbc1167ce84736ea0"><code>38ee8b4</code></a> Expand evaluation of global built-ins in <code>@babel/traverse</code> (<a href="https://github.com/babel/babel/tree/HEAD/packages/babel-traverse/issues/15797">#15797</a>)</li>
<li><a href="https://github.com/babel/babel/commit/9f3dfd90211472cf0083a3234dd1a1b857ce3624"><code>9f3dfd9</code></a> v7.22.20</li>
<li><a href="https://github.com/babel/babel/commit/3ed28b29c1fb15588369bdd55187b69f1248e87d"><code>3ed28b2</code></a> Fully support <code>||</code> and <code>&amp;&amp;</code> in <code>pluginToggleBooleanFlag</code> (<a href="https://github.com/babel/babel/tree/HEAD/packages/babel-traverse/issues/15961">#15961</a>)</li>
<li><a href="https://github.com/babel/babel/commit/77b0d7359909c94f3797c24006f244847fbc8d6d"><code>77b0d73</code></a> v7.22.19</li>
<li>Additional commits viewable in <a href="https://github.com/babel/babel/commits/v7.23.2/packages/babel-traverse">compare view</a></li>
</ul>
</details>
<br />

Updates `@babel/traverse` from 7.20.1 to 7.23.2
<details>
<summary>Release notes</summary>
<p><em>Sourced from <a href="https://github.com/babel/babel/releases"><code>@​babel/traverse</code>'s releases</a>.</em></p>
<blockquote>
<h2>v7.23.2 (2023-10-11)</h2>
<p><strong>NOTE</strong>: This release also re-publishes <code>@babel/core</code>, even if it does not appear in the linked release commit.</p>
<p>Thanks <a href="https://github.com/jimmydief"><code>@​jimmydief</code></a> for your first PR!</p>
<h4>:bug: Bug Fix</h4>
<ul>
<li><code>babel-traverse</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/16033">#16033</a> Only evaluate own String/Number/Math methods (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-preset-typescript</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/16022">#16022</a> Rewrite <code>.tsx</code> extension when using <code>rewriteImportExtensions</code> (<a href="https://github.com/jimmydief"><code>@​jimmydief</code></a>)</li>
</ul>
</li>
<li><code>babel-helpers</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/16017">#16017</a> Fix: fallback to typeof when toString is applied to incompatible object (<a href="https://github.com/JLHwung"><code>@​JLHwung</code></a>)</li>
</ul>
</li>
<li><code>babel-helpers</code>, <code>babel-plugin-transform-modules-commonjs</code>, <code>babel-runtime-corejs2</code>, <code>babel-runtime-corejs3</code>, <code>babel-runtime</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/16025">#16025</a> Avoid override mistake in namespace imports (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
</ul>
<h4>Committers: 5</h4>
<ul>
<li>Babel Bot (<a href="https://github.com/babel-bot"><code>@​babel-bot</code></a>)</li>
<li>Huáng Jùnliàng (<a href="https://github.com/JLHwung"><code>@​JLHwung</code></a>)</li>
<li>James Diefenderfer (<a href="https://github.com/jimmydief"><code>@​jimmydief</code></a>)</li>
<li>Nicolò Ribaudo (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
<li><a href="https://github.com/liuxingbaoyu"><code>@​liuxingbaoyu</code></a></li>
</ul>
<h2>v7.23.1 (2023-09-25)</h2>
<p>Re-publishing <code>@babel/helpers</code> due to a publishing error in 7.23.0.</p>
<h2>v7.23.0 (2023-09-25)</h2>
<p>Thanks <a href="https://github.com/lorenzoferre"><code>@​lorenzoferre</code></a> and <a href="https://github.com/RajShukla1"><code>@​RajShukla1</code></a> for your first PRs!</p>
<h4>:rocket: New Feature</h4>
<ul>
<li><code>babel-plugin-proposal-import-wasm-source</code>, <code>babel-plugin-syntax-import-source</code>, <code>babel-plugin-transform-dynamic-import</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15870">#15870</a> Support transforming <code>import source</code> for wasm (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-helper-module-transforms</code>, <code>babel-helpers</code>, <code>babel-plugin-proposal-import-defer</code>, <code>babel-plugin-syntax-import-defer</code>, <code>babel-plugin-transform-modules-commonjs</code>, <code>babel-runtime-corejs2</code>, <code>babel-runtime-corejs3</code>, <code>babel-runtime</code>, <code>babel-standalone</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15878">#15878</a> Implement <code>import defer</code> proposal transform support (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-generator</code>, <code>babel-parser</code>, <code>babel-types</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15845">#15845</a> Implement <code>import defer</code> parsing support (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
<li><a href="https://redirect.github.com/babel/babel/pull/15829">#15829</a> Add parsing support for the &quot;source phase imports&quot; proposal (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-generator</code>, <code>babel-helper-module-transforms</code>, <code>babel-parser</code>, <code>babel-plugin-transform-dynamic-import</code>, <code>babel-plugin-transform-modules-amd</code>, <code>babel-plugin-transform-modules-commonjs</code>, <code>babel-plugin-transform-modules-systemjs</code>, <code>babel-traverse</code>, <code>babel-types</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15682">#15682</a> Add <code>createImportExpressions</code> parser option (<a href="https://github.com/JLHwung"><code>@​JLHwung</code></a>)</li>
</ul>
</li>
<li><code>babel-standalone</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15671">#15671</a> Pass through nonce to the transformed script element (<a href="https://github.com/JLHwung"><code>@​JLHwung</code></a>)</li>
</ul>
</li>
<li><code>babel-helper-function-name</code>, <code>babel-helper-member-expression-to-functions</code>, <code>babel-helpers</code>, <code>babel-parser</code>, <code>babel-plugin-proposal-destructuring-private</code>, <code>babel-plugin-proposal-optional-chaining-assign</code>, <code>babel-plugin-syntax-optional-chaining-assign</code>, <code>babel-plugin-transform-destructuring</code>, <code>babel-plugin-transform-optional-chaining</code>, <code>babel-runtime-corejs2</code>, <code>babel-runtime-corejs3</code>, <code>babel-runtime</code>, <code>babel-standalone</code>, <code>babel-types</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15751">#15751</a> Add support for optional chain in assignments (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-helpers</code>, <code>babel-plugin-proposal-decorators</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15895">#15895</a> Implement the &quot;decorator metadata&quot; proposal (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-traverse</code>, <code>babel-types</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15893">#15893</a> Add <code>t.buildUndefinedNode</code> (<a href="https://github.com/liuxingbaoyu"><code>@​liuxingbaoyu</code></a>)</li>
</ul>
</li>
<li><code>babel-preset-typescript</code></li>
</ul>
<!-- raw HTML omitted -->
</blockquote>
<p>... (truncated)</p>
</details>
<details>
<summary>Changelog</summary>
<p><em>Sourced from <a href="https://github.com/babel/babel/blob/main/CHANGELOG.md"><code>@​babel/traverse</code>'s changelog</a>.</em></p>
<blockquote>
<h2>v7.23.2 (2023-10-11)</h2>
<h4>:bug: Bug Fix</h4>
<ul>
<li><code>babel-traverse</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/16033">#16033</a> Only evaluate own String/Number/Math methods (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-preset-typescript</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/16022">#16022</a> Rewrite <code>.tsx</code> extension when using <code>rewriteImportExtensions</code> (<a href="https://github.com/jimmydief"><code>@​jimmydief</code></a>)</li>
</ul>
</li>
<li><code>babel-helpers</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/16017">#16017</a> Fix: fallback to typeof when toString is applied to incompatible object (<a href="https://github.com/JLHwung"><code>@​JLHwung</code></a>)</li>
</ul>
</li>
<li><code>babel-helpers</code>, <code>babel-plugin-transform-modules-commonjs</code>, <code>babel-runtime-corejs2</code>, <code>babel-runtime-corejs3</code>, <code>babel-runtime</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/16025">#16025</a> Avoid override mistake in namespace imports (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
</ul>
<h2>v7.23.0 (2023-09-25)</h2>
<h4>:rocket: New Feature</h4>
<ul>
<li><code>babel-plugin-proposal-import-wasm-source</code>, <code>babel-plugin-syntax-import-source</code>, <code>babel-plugin-transform-dynamic-import</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15870">#15870</a> Support transforming <code>import source</code> for wasm (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-helper-module-transforms</code>, <code>babel-helpers</code>, <code>babel-plugin-proposal-import-defer</code>, <code>babel-plugin-syntax-import-defer</code>, <code>babel-plugin-transform-modules-commonjs</code>, <code>babel-runtime-corejs2</code>, <code>babel-runtime-corejs3</code>, <code>babel-runtime</code>, <code>babel-standalone</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15878">#15878</a> Implement <code>import defer</code> proposal transform support (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-generator</code>, <code>babel-parser</code>, <code>babel-types</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15845">#15845</a> Implement <code>import defer</code> parsing support (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
<li><a href="https://redirect.github.com/babel/babel/pull/15829">#15829</a> Add parsing support for the &quot;source phase imports&quot; proposal (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-generator</code>, <code>babel-helper-module-transforms</code>, <code>babel-parser</code>, <code>babel-plugin-transform-dynamic-import</code>, <code>babel-plugin-transform-modules-amd</code>, <code>babel-plugin-transform-modules-commonjs</code>, <code>babel-plugin-transform-modules-systemjs</code>, <code>babel-traverse</code>, <code>babel-types</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15682">#15682</a> Add <code>createImportExpressions</code> parser option (<a href="https://github.com/JLHwung"><code>@​JLHwung</code></a>)</li>
</ul>
</li>
<li><code>babel-standalone</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15671">#15671</a> Pass through nonce to the transformed script element (<a href="https://github.com/JLHwung"><code>@​JLHwung</code></a>)</li>
</ul>
</li>
<li><code>babel-helper-function-name</code>, <code>babel-helper-member-expression-to-functions</code>, <code>babel-helpers</code>, <code>babel-parser</code>, <code>babel-plugin-proposal-destructuring-private</code>, <code>babel-plugin-proposal-optional-chaining-assign</code>, <code>babel-plugin-syntax-optional-chaining-assign</code>, <code>babel-plugin-transform-destructuring</code>, <code>babel-plugin-transform-optional-chaining</code>, <code>babel-runtime-corejs2</code>, <code>babel-runtime-corejs3</code>, <code>babel-runtime</code>, <code>babel-standalone</code>, <code>babel-types</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15751">#15751</a> Add support for optional chain in assignments (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-helpers</code>, <code>babel-plugin-proposal-decorators</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15895">#15895</a> Implement the &quot;decorator metadata&quot; proposal (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-traverse</code>, <code>babel-types</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15893">#15893</a> Add <code>t.buildUndefinedNode</code> (<a href="https://github.com/liuxingbaoyu"><code>@​liuxingbaoyu</code></a>)</li>
</ul>
</li>
<li><code>babel-preset-typescript</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15913">#15913</a> Add <code>rewriteImportExtensions</code> option to TS preset (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
<li><code>babel-parser</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15896">#15896</a> Allow TS tuples to have both labeled and unlabeled elements (<a href="https://github.com/yukukotani"><code>@​yukukotani</code></a>)</li>
</ul>
</li>
</ul>
<h4>:bug: Bug Fix</h4>
<ul>
<li><code>babel-plugin-transform-block-scoping</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15962">#15962</a> fix: <code>transform-block-scoping</code> captures the variables of the method in the loop (<a href="https://github.com/liuxingbaoyu"><code>@​liuxingbaoyu</code></a>)</li>
</ul>
</li>
</ul>
<h4>:nail_care: Polish</h4>
<ul>
<li><code>babel-traverse</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15797">#15797</a> Expand evaluation of global built-ins in <code>@babel/traverse</code> (<a href="https://github.com/lorenzoferre"><code>@​lorenzoferre</code></a>)</li>
</ul>
</li>
<li><code>babel-plugin-proposal-explicit-resource-management</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15985">#15985</a> Improve source maps for blocks with <code>using</code> declarations (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
</ul>
<h4>:microscope: Output optimization</h4>
<ul>
<li><code>babel-core</code>, <code>babel-helper-module-transforms</code>, <code>babel-plugin-transform-async-to-generator</code>, <code>babel-plugin-transform-classes</code>, <code>babel-plugin-transform-dynamic-import</code>, <code>babel-plugin-transform-function-name</code>, <code>babel-plugin-transform-modules-amd</code>, <code>babel-plugin-transform-modules-commonjs</code>, <code>babel-plugin-transform-modules-umd</code>, <code>babel-plugin-transform-parameters</code>, <code>babel-plugin-transform-react-constant-elements</code>, <code>babel-plugin-transform-react-inline-elements</code>, <code>babel-plugin-transform-runtime</code>, <code>babel-plugin-transform-typescript</code>, <code>babel-preset-env</code>
<ul>
<li><a href="https://redirect.github.com/babel/babel/pull/15984">#15984</a> Inline <code>exports.XXX =</code> update in simple variable declarations (<a href="https://github.com/nicolo-ribaudo"><code>@​nicolo-ribaudo</code></a>)</li>
</ul>
</li>
</ul>
<h2>v7.22.20 (2023-09-16)</h2>
<!-- raw HTML omitted -->
</blockquote>
<p>... (truncated)</p>
</details>
<details>
<summary>Commits</summary>
<ul>
<li><a href="https://github.com/babel/babel/commit/b4b9942a6cde0685c222eb3412347880aae40ad5"><code>b4b9942</code></a> v7.23.2</li>
<li><a href="https://github.com/babel/babel/commit/b13376b346946e3f62fc0848c1d2a23223314c82"><code>b13376b</code></a> Only evaluate own String/Number/Math methods (<a href="https://github.com/babel/babel/tree/HEAD/packages/babel-traverse/issues/16033">#16033</a>)</li>
<li><a href="https://github.com/babel/babel/commit/ca58ec15cb6dde6812c36997477e44880bec0bba"><code>ca58ec1</code></a> v7.23.0</li>
<li><a href="https://github.com/babel/babel/commit/0f333dafcf470f1970083e4e695ced6aec8bead0"><code>0f333da</code></a> Add <code>createImportExpressions</code> parser option (<a href="https://github.com/babel/babel/tree/HEAD/packages/babel-traverse/issues/15682">#15682</a>)</li>
<li><a href="https://github.com/babel/babel/commit/3744545649fdc21688a2f3c97e1e39dbebff0d21"><code>3744545</code></a> Fix linting</li>
<li><a href="https://github.com/babel/babel/commit/c7e6806e2194deb36c330f543409c792592b22d4"><code>c7e6806</code></a> Add <code>t.buildUndefinedNode</code> (<a href="https://github.com/babel/babel/tree/HEAD/packages/babel-traverse/issues/15893">#15893</a>)</li>
<li><a href="https://github.com/babel/babel/commit/38ee8b4dd693f1e2bd00107bbc1167ce84736ea0"><code>38ee8b4</code></a> Expand evaluation of global built-ins in <code>@babel/traverse</code> (<a href="https://github.com/babel/babel/tree/HEAD/packages/babel-traverse/issues/15797">#15797</a>)</li>
<li><a href="https://github.com/babel/babel/commit/9f3dfd90211472cf0083a3234dd1a1b857ce3624"><code>9f3dfd9</code></a> v7.22.20</li>
<li><a href="https://github.com/babel/babel/commit/3ed28b29c1fb15588369bdd55187b69f1248e87d"><code>3ed28b2</code></a> Fully support <code>||</code> and <code>&amp;&amp;</code> in <code>pluginToggleBooleanFlag</code> (<a href="https://github.com/babel/babel/tree/HEAD/packages/babel-traverse/issues/15961">#15961</a>)</li>
<li><a href="https://github.com/babel/babel/commit/77b0d7359909c94f3797c24006f244847fbc8d6d"><code>77b0d73</code></a> v7.22.19</li>
<li>Additional commits viewable in <a href="https://github.com/babel/babel/commits/v7.23.2/packages/babel-traverse">compare view</a></li>
</ul>
</details>
<br />


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
- `@dependabot show <dependency name> ignore conditions` will show all of the ignore conditions of the specified dependency
- `@dependabot ignore this major version` will close this PR and stop Dependabot creating any more for this major version (unless you reopen the PR or upgrade to it yourself)
- `@dependabot ignore this minor version` will close this PR and stop Dependabot creating any more for this minor version (unless you reopen the PR or upgrade to it yourself)
- `@dependabot ignore this dependency` will close this PR and stop Dependabot creating any more for this dependency (unless you reopen the PR or upgrade to it yourself)
You can disable automated security fix PRs for this repo from the [Security Alerts page](https://github.com/newrelic/newrelic-node-apollo-server-plugin/network/alerts).

</details>
--------------------------

--- NOTES NEEDS REVIEW ---
Bumps [@apollo/server](https://github.com/apollographql/apollo-server/tree/HEAD/packages/server) from 4.7.4 to 4.9.3.
<details>
<summary>Release notes</summary>
<p><em>Sourced from <a href="https://github.com/apollographql/apollo-server/releases"><code>@​apollo/server</code>'s releases</a>.</em></p>
<blockquote>
<h2><code>@​apollo/server-integration-testsuite</code><a href="https://github.com/4"><code>@​4</code></a>.9.3</h2>
<h3>Patch Changes</h3>
<ul>
<li>Updated dependencies [<a href="https://github.com/apollographql/apollo-server/commit/a1c725eaf53c901e32a15057211bcb3eb6a6109b"><code>a1c725eaf</code></a>]:
<ul>
<li><code>@​apollo/server</code><a href="https://github.com/4"><code>@​4</code></a>.9.3</li>
</ul>
</li>
</ul>
<h2><code>@​apollo/server</code><a href="https://github.com/4"><code>@​4</code></a>.9.3</h2>
<h3>Patch Changes</h3>
<ul>
<li>
<p><a href="https://github.com/apollographql/apollo-server/commit/a1c725eaf53c901e32a15057211bcb3eb6a6109b"><code>a1c725eaf</code></a> Thanks <a href="https://github.com/trevor-scheer"><code>@​trevor-scheer</code></a>! - Ensure API keys are valid header values on startup</p>
<p>Apollo Server previously performed no sanitization or validation of API keys on startup. In the case that an API key was provided which contained characters that are invalid as header values, Apollo Server could inadvertently log the API key in cleartext.</p>
<p>This only affected users who:</p>
<ul>
<li>Provide an API key with characters that are invalid as header values</li>
<li>Use either schema or usage reporting</li>
<li>Use the default fetcher provided by Apollo Server or configure their own <code>node-fetch</code> fetcher</li>
</ul>
<p>Apollo Server now trims whitespace from API keys and validates that they are valid header values. If an invalid API key is provided, Apollo Server will throw an error on startup.</p>
<p>For more details, see the security advisory:
<a href="https://github.com/apollographql/apollo-server/security/advisories/GHSA-j5g3-5c8r-7qfx">https://github.com/apollographql/apollo-server/security/advisories/GHSA-j5g3-5c8r-7qfx</a></p>
</li>
</ul>
<h2><code>@​apollo/server-integration-testsuite</code><a href="https://github.com/4"><code>@​4</code></a>.9.2</h2>
<h3>Patch Changes</h3>
<ul>
<li>Updated dependencies [<a href="https://github.com/apollographql/apollo-server/commit/62e7d940de025f21e89c60404bce0dddac84ed6c"><code>62e7d940d</code></a>]:
<ul>
<li><code>@​apollo/server</code><a href="https://github.com/4"><code>@​4</code></a>.9.2</li>
</ul>
</li>
</ul>
<h2><code>@​apollo/server</code><a href="https://github.com/4"><code>@​4</code></a>.9.2</h2>
<h3>Patch Changes</h3>
<ul>
<li>
<p><a href="https://redirect.github.com/apollographql/apollo-server/pull/7699">#7699</a> <a href="https://github.com/apollographql/apollo-server/commit/62e7d940de025f21e89c60404bce0dddac84ed6c"><code>62e7d940d</code></a> Thanks <a href="https://github.com/trevor-scheer"><code>@​trevor-scheer</code></a>! - Fix error path attachment for list items</p>
<p>Previously, when errors occurred while resolving a list item, the trace builder would fail to place the error at the correct path and just default to the root node with a warning message:</p>
<blockquote>
<p><code>Could not find node with path x.y.1, defaulting to put errors on root node.</code></p>
</blockquote>
<p>This change places these errors at their correct paths and removes the log.</p>
</li>
</ul>
<h2><code>@​apollo/server-integration-testsuite</code><a href="https://github.com/4"><code>@​4</code></a>.9.1</h2>
<h3>Patch Changes</h3>
<ul>
<li>Updated dependencies [<a href="https://github.com/apollographql/apollo-server/commit/ebfde0007c647d9fb73e3aa24b968def3e307084"><code>ebfde0007</code></a>]:
<ul>
<li><code>@​apollo/server</code><a href="https://github.com/4"><code>@​4</code></a>.9.1</li>
</ul>
</li>
</ul>
<h2><code>@​apollo/server</code><a href="https://github.com/4"><code>@​4</code></a>.9.1</h2>
<h3>Patch Changes</h3>
<!-- raw HTML omitted -->
</blockquote>
<p>... (truncated)</p>
</details>
<details>
<summary>Changelog</summary>
<p><em>Sourced from <a href="https://github.com/apollographql/apollo-server/blob/main/packages/server/CHANGELOG.md"><code>@​apollo/server</code>'s changelog</a>.</em></p>
<blockquote>
<h2>4.9.3</h2>
<h3>Patch Changes</h3>
<ul>
<li>
<p><a href="https://github.com/apollographql/apollo-server/commit/a1c725eaf53c901e32a15057211bcb3eb6a6109b"><code>a1c725eaf</code></a> Thanks <a href="https://github.com/trevor-scheer"><code>@​trevor-scheer</code></a>! - Ensure API keys are valid header values on startup</p>
<p>Apollo Server previously performed no sanitization or validation of API keys on startup. In the case that an API key was provided which contained characters that are invalid as header values, Apollo Server could inadvertently log the API key in cleartext.</p>
<p>This only affected users who:</p>
<ul>
<li>Provide an API key with characters that are invalid as header values</li>
<li>Use either schema or usage reporting</li>
<li>Use the default fetcher provided by Apollo Server or configure their own <code>node-fetch</code> fetcher</li>
</ul>
<p>Apollo Server now trims whitespace from API keys and validates that they are valid header values. If an invalid API key is provided, Apollo Server will throw an error on startup.</p>
<p>For more details, see the security advisory:
<a href="https://github.com/apollographql/apollo-server/security/advisories/GHSA-j5g3-5c8r-7qfx">https://github.com/apollographql/apollo-server/security/advisories/GHSA-j5g3-5c8r-7qfx</a></p>
</li>
</ul>
<h2>4.9.2</h2>
<h3>Patch Changes</h3>
<ul>
<li>
<p><a href="https://redirect.github.com/apollographql/apollo-server/pull/7699">#7699</a> <a href="https://github.com/apollographql/apollo-server/commit/62e7d940de025f21e89c60404bce0dddac84ed6c"><code>62e7d940d</code></a> Thanks <a href="https://github.com/trevor-scheer"><code>@​trevor-scheer</code></a>! - Fix error path attachment for list items</p>
<p>Previously, when errors occurred while resolving a list item, the trace builder would fail to place the error at the correct path and just default to the root node with a warning message:</p>
<blockquote>
<p><code>Could not find node with path x.y.1, defaulting to put errors on root node.</code></p>
</blockquote>
<p>This change places these errors at their correct paths and removes the log.</p>
</li>
</ul>
<h2>4.9.1</h2>
<h3>Patch Changes</h3>
<ul>
<li><a href="https://redirect.github.com/apollographql/apollo-server/pull/7672">#7672</a> <a href="https://github.com/apollographql/apollo-server/commit/ebfde0007c647d9fb73e3aa24b968def3e307084"><code>ebfde0007</code></a> Thanks <a href="https://github.com/trevor-scheer"><code>@​trevor-scheer</code></a>! - Add missing <code>nonce</code> on <code>script</code> tag for non-embedded landing page</li>
</ul>
<h2>4.9.0</h2>
<h3>Minor Changes</h3>
<ul>
<li>
<p><a href="https://redirect.github.com/apollographql/apollo-server/pull/7617">#7617</a> <a href="https://github.com/apollographql/apollo-server/commit/4ff81ca508d46eaafa4aa7c265cf2ba2c4421524"><code>4ff81ca50</code></a> Thanks <a href="https://github.com/trevor-scheer"><code>@​trevor-scheer</code></a>! - Introduce new <code>ApolloServerPluginSubscriptionCallback</code> plugin. This plugin implements the <a href="https://github.com/apollographql/router/blob/dev/dev-docs/callback_protocol.md">subscription callback protocol</a> which is used by Apollo Router. This feature implements subscriptions over HTTP via a callback URL which Apollo Router registers with Apollo Server. This feature is currently in preview and is subject to change.</p>
<p>You can enable callback subscriptions like so:</p>
<pre lang="ts"><code>import { ApolloServerPluginSubscriptionCallback } from '@apollo/server/plugin/subscriptionCallback';
import { ApolloServer } from '@apollo/server';
<p>const server = new ApolloServer({
</code></pre></p>
</li>
</ul>
<!-- raw HTML omitted -->
</blockquote>
<p>... (truncated)</p>
</details>
<details>
<summary>Commits</summary>
<ul>
<li><a href="https://github.com/apollographql/apollo-server/commit/a9d288ae8184c1a99f8c26af700a193b2fbe6ab4"><code>a9d288a</code></a> Version Packages (<a href="https://github.com/apollographql/apollo-server/tree/HEAD/packages/server/issues/7712">#7712</a>)</li>
<li><a href="https://github.com/apollographql/apollo-server/commit/2c8106c433c4add4b43e2e2b2f5c5c4887b17314"><code>2c8106c</code></a> Merge pull request from GHSA-j5g3-5c8r-7qfx</li>
<li><a href="https://github.com/apollographql/apollo-server/commit/d6ce6037de5579cf496041ae4d97a4376c8d6a02"><code>d6ce603</code></a> create README for technical details of landing pages (<a href="https://github.com/apollographql/apollo-server/tree/HEAD/packages/server/issues/7671">#7671</a>)</li>
<li><a href="https://github.com/apollographql/apollo-server/commit/e8c00a72e9ea750a29a8d517b7171300df589ccc"><code>e8c00a7</code></a> Version Packages (<a href="https://github.com/apollographql/apollo-server/tree/HEAD/packages/server/issues/7702">#7702</a>)</li>
<li><a href="https://github.com/apollographql/apollo-server/commit/62b941a37ed112375dd1ddf57d895e797abeb32f"><code>62b941a</code></a> chore(deps): update all non-major dependencies (<a href="https://github.com/apollographql/apollo-server/tree/HEAD/packages/server/issues/7693">#7693</a>)</li>
<li><a href="https://github.com/apollographql/apollo-server/commit/62e7d940de025f21e89c60404bce0dddac84ed6c"><code>62e7d94</code></a> Fix trace placement for errors occurring in lists (<a href="https://github.com/apollographql/apollo-server/tree/HEAD/packages/server/issues/7699">#7699</a>)</li>
<li><a href="https://github.com/apollographql/apollo-server/commit/b72485a245fea878ef36f810a8f7ad0e35b2a88e"><code>b72485a</code></a> chore: update documentation to include install commands for typescript (<a href="https://github.com/apollographql/apollo-server/tree/HEAD/packages/server/issues/7691">#7691</a>)</li>
<li><a href="https://github.com/apollographql/apollo-server/commit/a48e8e0c5862e967ff215b1bad4dbc1b095cd3a2"><code>a48e8e0</code></a> Version Packages (<a href="https://github.com/apollographql/apollo-server/tree/HEAD/packages/server/issues/7673">#7673</a>)</li>
<li><a href="https://github.com/apollographql/apollo-server/commit/ebfde0007c647d9fb73e3aa24b968def3e307084"><code>ebfde00</code></a> Add missing <code>nonce</code> to <code>script</code> tag (<a href="https://github.com/apollographql/apollo-server/tree/HEAD/packages/server/issues/7672">#7672</a>)</li>
<li><a href="https://github.com/apollographql/apollo-server/commit/12356115aea7bb1a74b230dc4d9857157ae29220"><code>1235611</code></a> Version Packages (<a href="https://github.com/apollographql/apollo-server/tree/HEAD/packages/server/issues/7661">#7661</a>)</li>
<li>Additional commits viewable in <a href="https://github.com/apollographql/apollo-server/commits/@apollo/server@4.9.3/packages/server">compare view</a></li>
</ul>
</details>
<br />


[![Dependabot compatibility score](https://dependabot-badges.githubapp.com/badges/compatibility_score?dependency-name=@apollo/server&package-manager=npm_and_yarn&previous-version=4.7.4&new-version=4.9.3)](https://docs.github.com/en/github/managing-security-vulnerabilities/about-dependabot-security-updates#about-compatibility-scores)

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
- `@dependabot show <dependency name> ignore conditions` will show all of the ignore conditions of the specified dependency
- `@dependabot ignore this major version` will close this PR and stop Dependabot creating any more for this major version (unless you reopen the PR or upgrade to it yourself)
- `@dependabot ignore this minor version` will close this PR and stop Dependabot creating any more for this minor version (unless you reopen the PR or upgrade to it yourself)
- `@dependabot ignore this dependency` will close this PR and stop Dependabot creating any more for this dependency (unless you reopen the PR or upgrade to it yourself)
You can disable automated security fix PRs for this repo from the [Security Alerts page](https://github.com/newrelic/newrelic-node-apollo-server-plugin/network/alerts).

</details>
--------------------------

--- NOTES NEEDS REVIEW ---
Bumps [apollo-server-core](https://github.com/apollographql/apollo-server/tree/HEAD/packages/apollo-server-core) from 3.11.1 to 3.12.1.
<details>
<summary>Commits</summary>
<ul>
<li><a href="https://github.com/apollographql/apollo-server/commit/ea2e2c3e071afc9144af00cae7b51720b9cc8b32"><code>ea2e2c3</code></a> Release</li>
<li><a href="https://github.com/apollographql/apollo-server/commit/1dd45b8366a6cee75e4ca321eeb5acf107e6c73e"><code>1dd45b8</code></a> get CI passing</li>
<li><a href="https://github.com/apollographql/apollo-server/commit/d38b43bac88acdef4295759d7dcc3d4c348d9575"><code>d38b43b</code></a> Merge pull request from GHSA-j5g3-5c8r-7qfx</li>
<li><a href="https://github.com/apollographql/apollo-server/commit/fac578a32d5b6e21164fb649fc61d641d0401774"><code>fac578a</code></a> Release</li>
<li><a href="https://github.com/apollographql/apollo-server/commit/85540501642e9d4f9d7adcc1442885a2eddcc885"><code>8554050</code></a> Update protobuf (version-3) (<a href="https://github.com/apollographql/apollo-server/tree/HEAD/packages/apollo-server-core/issues/7412">#7412</a>)</li>
<li>See full diff in <a href="https://github.com/apollographql/apollo-server/commits/apollo-server-core@3.12.1/packages/apollo-server-core">compare view</a></li>
</ul>
</details>
<details>
<summary>Maintainer changes</summary>
<p>This version was pushed to npm by <a href="https://www.npmjs.com/~apollo-bot">apollo-bot</a>, a new releaser for apollo-server-core since your current version.</p>
</details>
<br />


[![Dependabot compatibility score](https://dependabot-badges.githubapp.com/badges/compatibility_score?dependency-name=apollo-server-core&package-manager=npm_and_yarn&previous-version=3.11.1&new-version=3.12.1)](https://docs.github.com/en/github/managing-security-vulnerabilities/about-dependabot-security-updates#about-compatibility-scores)

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
- `@dependabot show <dependency name> ignore conditions` will show all of the ignore conditions of the specified dependency
- `@dependabot ignore this major version` will close this PR and stop Dependabot creating any more for this major version (unless you reopen the PR or upgrade to it yourself)
- `@dependabot ignore this minor version` will close this PR and stop Dependabot creating any more for this minor version (unless you reopen the PR or upgrade to it yourself)
- `@dependabot ignore this dependency` will close this PR and stop Dependabot creating any more for this dependency (unless you reopen the PR or upgrade to it yourself)
You can disable automated security fix PRs for this repo from the [Security Alerts page](https://github.com/newrelic/newrelic-node-apollo-server-plugin/network/alerts).

</details>
--------------------------

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
      sourceBranch: source?.branch
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
