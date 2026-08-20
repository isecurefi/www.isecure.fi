# ISECure.fi website

The public ISECure website and developer documentation, built as a static Astro
site and published through Amazon S3 and CloudFront.

## Product-content authority

The sibling `bankfiles-platform` repository owns the target product strategy, dated competitive
evidence, public-launch design, implementation tasks, conformance, and support status. In a shared
workspace, start with:

- `../bankfiles-platform/docs/reports/isecure-financial-action-control-plane.html`;
- `../bankfiles-platform/docs/reports/competitive-landscape.html`;
- `../bankfiles-platform/docs/public-website-product-launch-design.md`; and
- the `WEBCLAIM-*`, `WEBSITE-*`, `WEBPUBLISH-*`, and `WEBGROWTH-*` outcomes in
  `../bankfiles-platform/TASKS.md`.

This repository implements the approved multilingual Astro presentation. It does not independently
define product categories, competitor conclusions, availability, qualification, or regulatory
claims. Existing WebServices pages remain the sold-product path until an exact reviewed task admits
a new product route or homepage promotion.

## What is in this repository

- Finnish marketing pages at `/`, English pages at `/en/`, and Swedish pages at
  `/se/`.
- ISO 20022 and Finnish bank-connectivity guides.
- The WS Channel API reference at `/wsapi_v2/`.
- The machine-readable OpenAPI 2.0 document at `/wsapi_v2.json`.
- CloudFront canonical redirects and scripts for the remaining legacy EC2/ALB
  routes.

The site is statically generated; it is not a client-side SPA. Directory index
aliases are uploaded separately so routes ending in `/` work with the S3 REST
origin.

## Local development

Requirements:

- Node.js 22.12 or newer
- Corepack with Yarn 4.6.0

```sh
corepack enable
corepack yarn install
corepack yarn dev
```

Open `http://localhost:4321/` for the website or
`http://localhost:4321/wsapi_v2/` for the API documentation.

Useful commands:

| Command                           | Purpose                                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| `corepack yarn dev`               | Validate the bundled OpenAPI document and run Astro locally                              |
| `corepack yarn build`             | Validate the OpenAPI document and create the static site in `dist/`                      |
| `corepack yarn preview`           | Serve the completed static build locally                                                 |
| `corepack yarn lint`              | Lint Astro, JavaScript, and TypeScript source files                                      |
| `corepack yarn api:validate`      | Check the OpenAPI contract, security schemes, operations, responses, and source metadata |
| `corepack yarn api:sync`          | Explicitly update the bundled API specification from its authoritative repository        |
| `corepack yarn verify:production` | Check production pages, redirects, headers, protected paths, and API documentation       |
| `corepack yarn growth:report`     | Compare the latest complete 28-day GSC and GA4 windows and write an ignored local report |
| `corepack yarn gsc:reconcile`     | Read sitemap and selected URL indexing state without changing Search Console             |
| `corepack yarn publish:plan`      | Show the committed release and current CloudFront predecessor without changing AWS       |
| `corepack yarn publish:rollback`  | Restore the predecessor recorded for the active immutable release                        |

Normal development and production builds do not access the network. The
OpenAPI sync is intentionally separate so a build is deterministic and remains
possible if GitHub is unavailable.

## API documentation workflow

The authoritative specification is maintained in
[`isecurefi/wsapi-v2`](https://github.com/isecurefi/wsapi-v2). This repository
keeps a versioned mirror in `src/data/wsapi_v2.json`, together with the exact
upstream commit in `src/data/wsapi_v2.source.json`.

To publish an upstream API change:

```sh
corepack yarn api:sync
corepack yarn api:validate
corepack yarn build
```

Review and commit both data files. Do not fetch a floating specification during
`dev`, `build`, or deployment.

The documentation experience is implemented in
`src/pages/wsapi_v2/index.astro`. It provides:

- a pinned, locally bundled Scalar API Reference renderer under the MIT
  license, without a CDN or Redoc/Redocly dependency;
- a responsive reference layout with search and navigation on the left,
  operation documentation in the center, and generated HTTP plus official
  TypeScript SDK examples on the right;
- all 26 operations, grouped workflows, TypeScript SDK samples, and a dedicated
  schema section in the navigation;
- preserved mappings for links into both previous documentation renderers;
- a downloadable raw specification;
- read-only browsing: API client, test-request, agent, MCP, persistence,
  telemetry, and developer-tool controls are disabled, and no request proxy is
  configured;
- system fonts and renderer-native spacing, without remote font requests or a
  custom site header, environment strip, or footer around the reference;
- user-selectable light and dark themes, with distinct sidebar and content
  surfaces in both modes.

The renderer is pinned in `package.json`. Keep it self-hosted, MIT-licensed, and
free of Redoc/Redocly packages. Preserve the left navigation and right example
column when changing its theme or upgrading it, and do not add a separate top
bar around the reference. The published specification adds presentation-only
tag descriptions, navigation groups, and official TypeScript SDK samples so
every operation and schema remains reachable from the left menu.

The local published specification overrides the obsolete Terms URL and
sanitizes legacy credential and personal-data examples. The mirrored upstream
file remains unchanged so source drift stays visible and reviewable.

## Quality checks

Before committing or deploying, run:

```sh
corepack yarn lint
corepack yarn build
corepack yarn npm audit --all --recursive
```

Also inspect the built sitemap, check internal links, and test the API reference
at desktop and mobile widths. Production verification should run only after the
CloudFront deployment and legacy redirect migration are complete.

## Growth measurement

The site loads Google Analytics only after explicit consent. Rejecting analytics makes no Google
Analytics request; a visitor can reopen the choice from the footer. Events contain stable product,
surface, language, and path identifiers only. Form values, query strings, customer identifiers,
bank data, and task IDs must never be analytics parameters. `generate_lead` is emitted only after
successful form delivery. `select_content` measures the documented product, access, and developer
resource links.

For the read-only monthly report, configure `.env` from `.env.example`:

- grant the service account Search Console access;
- grant the same account **Analytics Viewer** access to the ISECure GA4 property; and
- set `GA4_PROPERTY_ID` to the numeric property ID, not the public `G-` measurement ID.

Then run:

```sh
corepack yarn growth:report
corepack yarn gsc:reconcile
corepack yarn verify:production
```

The first command compares two adjacent 28-day windows behind a three-day reporting delay, so fresh
Search Console data is not mistaken for a decline, and writes `.growth-data/latest.{json,md}`. Both
`.growth-data/` and raw `.gsc-data/` are ignored because search queries are review data, not website
content. The report covers organic clicks, impressions, CTR, position, low-CTR and
striking-distance queries, legacy results, consented sessions/page views, product or resource
selections, successful contacts, and session-to-contact conversion. Missing GA4 access is reported
as unavailable, never as zero.

Consent-based collection starts on 21 August 2026. GA data from before and after that boundary uses
different collection rules and is not a like-for-like trend. Treat the first complete post-change
window as a new baseline, and make a growth comparison only when both adjacent 28-day windows are
fully after the boundary. With the three-day reporting delay, the first such comparison is available
on 18 October 2026.

Review the report with the production/build checks, Search Console indexing state, current claim
evidence, and short buyer observations. A metric may justify investigation but never approves a
claim, homepage promotion, redirect, or retirement. Admit each concrete change as its own task in
`bankfiles-platform/TASKS.md`; compare the following complete period after the change rather than
crediting normal traffic noise.

## Production architecture

- `https://www.isecure.fi`: static S3 origin behind CloudFront
- `https://isecure.fi`: legacy Apache/PHP EC2 origin behind an Application Load
  Balancer
- `https://ws-api.isecure.fi/v2`: production WS Channel API
- `https://ws-api.test.isecure.fi/v2`: staging WS Channel API

API documentation belongs on `www`. The old apex documentation URLs must remain
recoverable until the replacement has been deployed and verified, after which
the ALB maintains one-to-one permanent redirects to CloudFront.

## Deployment

The existing AWS workflow publishes a clean committed build under the immutable
`s3://www2.isecure.fi/_releases/<git-revision>/` prefix, uploads directory-index aliases, and then
switches CloudFront distribution `E2OQLWDIQMPMBP` to that complete release. It records the previous
origin path before the switch, invalidates the cache, and verifies production against the exact
release manifest. A failed verification automatically restores and verifies the predecessor.

```sh
corepack yarn deploy
```

The deploy script refuses a dirty worktree, scans the static output for high-confidence secret
shapes, and never uses destructive S3 synchronization. Preview the intended switch with
`corepack yarn publish:plan`. Restore the recorded predecessor with
`corepack yarn publish:rollback`; use `--to <full-git-revision>` only for a release whose immutable
manifest already exists.

After the new API documentation is healthy on CloudFront, run
`scripts/legacy-redirects.sh` to reconcile the apex redirects and edge security
configuration. The script verifies the replacement before changing the ALB.

AWS and Google credentials belong in local profiles or the untracked `.env`
file. Never commit API keys, OAuth tokens, submitted lead data, or customer bank
files.
