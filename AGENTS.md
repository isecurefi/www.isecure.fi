# ISECure website agent guide

This repository builds the public marketing site at `https://www.isecure.fi`.
It does **not** contain the legacy API reference or the operational PHP tools
served from `https://isecure.fi`.

## Project structure

- Astro static site with Finnish at `/`, English at `/en/`, and Swedish at
  `/se/`.
- Reusable page content belongs in `src/components/`; route wrappers belong in
  `src/pages/`.
- Every indexable translated page must have a self-canonical URL and reciprocal
  `fi`, `en`, `sv`, and `x-default` hreflang links.
- Use trailing-slash canonical URLs. The CloudFront viewer-request function in
  `scripts/cloudfront-redirects.js` normalizes extensionless and `index.html`
  variants.
- Avoid parallel pages for the same intent. Redirect retired slugs and remove
  them from Astro routes and the sitemap.

## API documentation is a protected contract

The production API documentation remains on the legacy apex host until a real
replacement is deployed:

- Human-readable reference: `https://isecure.fi/wsapi_v2/index.html`
- OpenAPI document: `https://isecure.fi/wsapi_v2.json`

Do not redirect, delete, block, or repurpose `/wsapi_v2/` or
`/wsapi_v2.json`. Marketing pages and `public/llms.txt` link to these URLs
intentionally. Before changing API-documentation routing, confirm that both URLs
return HTTP 200 and that a replacement preserves deep links. A future migration
must deploy the replacement first and then add one-to-one permanent redirects;
never redirect the API reference to the homepage.

The Astro routes `/ws-api/` and `/ws-channel/` are legacy marketing aliases,
not the API reference. Do not confuse them with `/wsapi_v2/`.

## Legacy apex and sensitive paths

`https://isecure.fi` is served by an Apache/PHP EC2 origin behind an AWS
Application Load Balancer. `https://www.isecure.fi` is served by S3 and
CloudFront. Treat them as separate production surfaces.

- `/tiliote`, `/tiliote/**`, `/tilivuosi2011`, and `/tilivuosi2011/**` must
  remain inaccessible on the legacy apex and at the EC2 origin.
- `/ws-kanava.php` and `/ws-kanava.html` redirect to the matching Web Services
  marketing page.
- Operational applications such as `/registers/sympatia/**` must not be
  redirected or removed without an explicit migration decision.
- Reconcile legacy redirects with `scripts/legacy-redirects.sh`; keep the
  checked-in CloudFront function and deployed function synchronized.

## Analytics and lead handling

- GA4 property tag: `G-BJ6B7H7K8E`.
- Google Ads destination: `AW-1025469048`.
- Load `gtag.js` once, then configure both destinations on the shared
  `dataLayer`.
- Fire `generate_lead` only after the lead-delivery request succeeds.
- Contact and early-access forms use the shared lead-delivery utility. Do not
  log or expose submitted personal data.

## Validation

Use the repository's Yarn version through Corepack and a supported Node version.

```sh
corepack yarn lint
corepack yarn build
corepack yarn verify:production
```

Before publishing, also verify:

- no broken internal links;
- one title, description, canonical, and H1 per indexable page;
- reciprocal hreflang links;
- no retired routes in the sitemap;
- `/wsapi_v2/index.html` and `/wsapi_v2.json` still return HTTP 200;
- sensitive legacy paths return HTTP 403 at the apex and no successful response
  from a direct-origin request;
- legacy and canonical redirects preserve query strings.

## Publishing

Production uses the existing S3/CloudFront workflow, not OpenAI Sites:

- S3 bucket: `s3://www2.isecure.fi/`
- CloudFront distribution: `E2OQLWDIQMPMBP`
- Viewer-request function: `isecure-legacy-redirects`

Build first, upload `dist/`, run `scripts/upload-directory-indexes.mjs`, and
invalidate CloudFront. Do not use destructive S3 synchronization. Preserve
unrelated EC2 content and existing user changes.
