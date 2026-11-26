# Bank Simulator website preview

Preview route: `https://www.isecure.fi/preview/bank-demo/`.

The owner authorized deployment on 26 November 2026, with no incoming links from the
existing site. The route is `noindex, nofollow`, excluded from the sitemap, and has
no analytics tag. `check-build.mjs` enforces these boundaries. This is an unlisted
public preview, not an authenticated private page. Do not add it to navigation or
existing content until the owner approves promotion.

## Current scope

`BankDemo.astro` is a reusable component with fetch, statement, original XML and
download views. It shows the exact simulator opening statement: account
FI2112345600000785, EUR 10,000,000 opening/closing balance, zero entries. The
balance is a synthetic test value. An upstream failure displays an error and
never substitutes an illustrative document. The captured document in browser QA
is test evidence only, not a shipped fallback.

The backend uses pinned `isecure-ts-client` 6.1.0 against
`https://ws-api.test.isecure.fi/v2`, bank `simulator`, mode `data`. It logs in,
lists only `camt.053.001.02` with `Status: ALL`, downloads its one file, and logs
out. Download changes NEW to DLD; repeat reads remain possible. The backend has
no routes for registration, uploads, arbitrary file references, accounts or
bank selection. Credentials and SDK auth responses never reach the browser.

The dedicated synthetic identity was operator-provisioned using the existing
WS test-fixture helpers. It has its own API key, test-only Gateway usage plan,
explicit new password-profile policy and simulator entitlement. No existing
customer or test-suite identity was reused. Admin MFA remains enabled. Before
simulator enrollment, a read-only `certificate.list` event was verified through
the retained account audit API. The data identity alone is in Secrets Manager;
operator recovery state remains in the ignored private task directory.

## Backend deployment and operation

- AWS account: `589434896614`; region: `eu-west-1`.
- CloudFormation stack / Lambda: `isecure-website-demo-preview`.
- Secret: `isecure/website-demo-preview/data-account` (data identity only).
- Public operation: `GET /statement`, with no parameters or request body.
- Gateway: one request/second, burst two; Lambda concurrency one. Concurrency is
  intentionally serialized because SDK logout signs out this account's sessions.
- Response cache: 60 seconds per warm runtime; cached delivery and retrieval
  time are explicitly identified. Expired responses are not served on failure.
- Lambda: Node.js 24, ARM64, 256 MiB, 25-second timeout.
- IAM: read that exact secret and write the dedicated 14-day log group only.
  It cannot access account tables, issue certificates, change entitlements or
  retrieve another secret. There is no payload or SDK-error logging.
- CORS allows only `https://www.isecure.fi`. CORS is not authentication; anonymous
  access to this fixed synthetic response is intentional.

The function has no administrative credential or signing key. File reads still
authenticate through the service's normal data-role boundary; this demo's HTTP
handler supplies the fixed operation allowlist.

To redeploy the backend, set `AWS_PROFILE=dforsber` and `DEMO_SECRET_ARN` to the
existing dedicated secret ARN, then run:

```sh
node scripts/deploy-demo.mjs
```

The command checks the AWS account, bundles the pinned SDK and handler, uploads a
content-addressed backend ZIP under `_demo-backend/`, and deploys the dedicated
CloudFormation stack. It updates `src/data/bankDemo.json` with its public endpoint.
It does not change the main WS API, Processing API or DNS. Backend ZIP upload is
separate from website publication. Publish the static page from a clean commit
with the repository's normal `yarn deploy` immutable release workflow.

To suspend the preview backend, set its Lambda reserved concurrency to zero.
Keep the secret, synthetic identity and retained audit for recovery. Do not remove
or change an existing WS tenant while operating this preview. Use a new reviewed
backend release for changed behavior, and CloudFormation's previous template/code
artifact for backend rollback. Website rollback uses `yarn publish:rollback`.

## Validation and subsequent promotion

`scripts/demo.test.mjs` checks operation/identity isolation, fixed simulator reads,
cache behavior and safe failures. Browser checks cover the actual XML response,
summary, byte-exact download, unavailable state and 320/390px widths. Live checks
must repeat retrieval from the published www origin, not just from Node.js.

Before public promotion: review the opening-statement experience, choose the
final embedding on the existing Bank Simulator page, add localized copy and
privacy-safe measurement, and deliberately revise the unlinked-preview guard.
Payment-feedback and simulated VoP demonstrations are separate extensions;
this release does not claim either workflow or real-bank VoP support.
