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
- Google Ads is not in use. Do not restore the retired `AW-1025469048`
  destination without an explicit advertising decision.
- Load `gtag.js` once and use the shared `dataLayer` for analytics events.
- Fire `generate_lead` only after the lead-delivery request succeeds.
- Contact and early-access forms use the shared lead-delivery utility. Do not
  log or expose submitted personal data.
- Cloudflare Turnstile must not be implemented as a client-only check. Route
  form submissions through a server endpoint that validates the token with
  Siteverify before publishing to SNS, and keep the Turnstile secret out of the
  static bundle.

## Search Console

- The canonical sitemap submission is
  `https://www.isecure.fi/sitemap-index.xml` for the `sc-domain:isecure.fi`
  property.
- Use `yarn gsc` for read-only search-performance pulls.
- Use `yarn gsc:reconcile` to preview sitemap and URL-index status, and append
  `--apply` only when deliberately removing the retired sitemap submissions and
  resubmitting the canonical sitemap.
- The URL Inspection API cannot request indexing for ordinary pages. Submit the
  sitemap and use Search Console's manual request only when necessary.

## Validation

Use the repository's Yarn version through Corepack and Node 22.12 or newer.

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
- CloudFront requires TLS 1.2 (`TLSv1.2_2021`) and advertises HTTP/2 and HTTP/3.
- The legacy apex ALB HTTPS listener uses
  `ELBSecurityPolicy-TLS13-1-2-Res-2021-06`; do not weaken it when changing
  legacy routing.

Build first, upload `dist/`, run `scripts/upload-directory-indexes.mjs`, and
invalidate CloudFront. Do not use destructive S3 synchronization. Preserve
unrelated EC2 content and existing user changes.
