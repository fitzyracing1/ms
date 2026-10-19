# patch-cloud build of ms@2.1.3

This tarball was built by patch-cloud from [fitzyracing1/ms@patch-cloud](https://github.com/fitzyracing1/ms/tree/patch-cloud),
a fork of [vercel/ms](https://github.com/vercel/ms). It is **not** an official upstream release.
Package name and version are unchanged from upstream (`ms@2.1.3`, base `tag 2.1.3`).

## Fix

format() no longer emits scientific notation (e.g. ms(1e30) gave '1.1574074074074075e+22d', ms(1e-7) gave '1e-7ms') that parse() cannot read back, so ms(ms(x)) round-trips. Also adds the opt-in `decimal` formatting option from PR #125.

- Upstream PR: https://github.com/vercel/ms/pull/299
- Upstream issue: https://github.com/vercel/ms/issues/284
- Credit: @Pitchfork-and-Torch (PR #299, round-trip fix; ported from TypeScript main to 2.1.3)
- Credit: @almandsky (PR #125, decimal option)

## Exactly what changed vs upstream

- index.js: new numberToDecimalString() expands exponent-form numbers to plain decimals (pure string manipulation, no Intl). Numbers that do not stringify in exponent form are returned unchanged, so ordinary output is byte-for-byte identical to 2.1.3.
- index.js: optional `decimal` option (0-3 places, default 0 = unchanged output) from https://github.com/vercel/ms/pull/125.
- parse() is unchanged, including its 100-character input cap (the mitigation proposed in https://github.com/vercel/ms/issues/291 is already present in 2.1.3). Outputs longer than 100 characters (e.g. ms(Number.MAX_VALUE)) still cannot be parsed back.
- Added this `PATCH-CLOUD.md` and a `_patchCloud` field in `package.json` (metadata only).

## Verification

- Upstream mocha suite plus new tests: 69 passing.
- Round-trip: ms(ms(1e30)) === 1e30 and ms(ms(1e-7)) === 1e-7 (upstream 2.1.3 returns undefined for both).
- ReDoS timing: ms('9'.repeat(1000)+'z') and the worst case under the 100-char cap stay well under 1 ms per call.

## Opting out

Remove the patch-cloud `registry=` override and reinstall from registry.npmjs.org to get the upstream tarball.

## GitHub Packages (scoped name)

The same patched build can be published to GitHub Packages as `@fitzyracing1/ms@2.1.3`
(GitHub Packages only accepts names scoped to the repo owner). The unscoped name `ms`
is what the patch-cloud registry serves; the scoped name is what GitHub Packages serves.

```ini
# .npmrc (project or ~/.npmrc). GitHub Packages npm needs a token even for public packages:
@fitzyracing1:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}   # a token with read:packages
```

```bash
# keep require('ms') / import 'ms' working via an npm alias:
npm install ms@npm:@fitzyracing1/ms@2.1.3
# or install under the scoped name:
npm install @fitzyracing1/ms@2.1.3
```
