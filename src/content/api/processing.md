Prepare and validate payments, finalize a version, then generate the payment XML. Your application
verifies and signs those bytes locally and uploads them through the separate
[File Exchange API](https://www.isecure.fi/wsapi_v2/#operation/UploadFile).
Processing does not send payments to a bank.

**Production · Beta · Paid subscription and separate onboarding required.**
Use `https://processing-api.isecure.fi` with audience `isecure-processing-production-v1`.
There is no active Processing test deployment. The independent Bank Simulator remains a separate
service with its own access requirements.

## What this reference covers

This reference matches the **27 payment operations and session exchange** in the production
release checked on **13 November 2026**. The OpenAPI schemas come from that release's exact source
revision; deployment identity and the Lambda code hash were checked before publication.
It includes `payment_orders.generate_file`. It does not advertise an event stream, VoP,
statement observations or hosted Integration setup, which are absent from this deployment.

Approval and retained-export routes are listed because they are deployed, but they require a
separately configured approval policy. The current production onboarding flow uses file generation
without Processing approval. A route being listed does not grant permission or configure that policy.

## Get access and sign in

Use your production File Exchange account. [Start registration](https://www.isecure.fi/wsapi_v2/#operation/InitRegister)
and [register](https://www.isecure.fi/wsapi_v2/#operation/Register) if needed. ISECure must then
provision your Processing subscription, tenant database, permissions and API usage-plan access.
Registration alone does not enable Processing.

1. Complete [Login](https://www.isecure.fi/wsapi_v2/#operation/Login) and any requested
   [LoginMFA](https://www.isecure.fi/wsapi_v2/#operation/LoginMFA). Keep the current **ID token** and API key.
2. Call `POST /session` with the ID token directly in `Authorization` (no prefix) and the API key
   in `x-api-key`. There is no request body. Check the returned audience and expiry.
3. For business requests, use `Authorization: Processing <processingSession>`, the same `x-api-key`,
   and the operation's `ISECure-Contract-Version`. JSON bodies need `Content-Type: application/json`.
4. Clear the separate Processing session on sign-out or account changes. Exchange a new session
   when needed; the SDK does not silently refresh it or retry commands.

Session schema 1 is the default. Send `ISECure-Session-Schema-Version: 2` to also receive the tenant,
legal entity and actor identifiers. Those identifiers describe the signed-in context; they grant no
extra access. Sessions expire after 15 minutes; use `expiresAtEpochSeconds` rather than guessing.

Account administration stays in File Exchange, including
[ListAccounts](https://www.isecure.fi/wsapi_v2/#operation/ListAccounts) and
[DeleteAccount](https://www.isecure.fi/wsapi_v2/#operation/DeleteAccount).

## Use the TypeScript SDK

The published `isecure-ts-client@5.0.2` includes Processing through its experimental `/iso20022`
entry point. Use Node.js 24 or newer, or a supported browser bundler. Its contract versions and
digests match all 27 payment operations in this deployment; this comparison is not a new live
customer qualification. The SDK interface remains experimental.

See the [Processing SDK guide](https://github.com/isecurefi/isecure-ts-client/blob/main/docs/processing.md)
for connection code. Operation examples below assume an authenticated client named `client` and
its `Iso20022HttpTransport` named `transport`. Where an example declares `input`, supply the fields
shown in the request schema; these are typed templates, not complete payment fixtures.

The [generation example](https://github.com/isecurefi/isecure-ts-client/blob/main/examples/processing-generate-file/README.md)
configures a profile, creates and validates a draft, finalizes it and generates XML. It creates
Processing records but does not upload anything to a bank.

## Generate a payment file

1. Use `paymentExportProfiles.list()` to find a bank format available to your tenant. A format's
   availability does not establish which services your bank agreement allows.
2. Configure the paying account and bank-agreement details. Resolve an account capability and use
   its exact selected reference when creating a draft.
3. Add payments with decimal-string amounts, validate them, correct any issues and finalize the draft.
4. Call `paymentBatches.generateFile()` with the finalized order revision and current profile revision.
5. The SDK verifies the returned file identity, SHA-256 digest, length and XML media type. Separately
   authorize, sign and upload the unchanged bytes through File Exchange when intended.

The generation endpoint returns XML, not a JSON document or an S3 URL. It requires read permission
and Processing access, but no Processing approval. Generation does not release a retained export,
change approval state or prove bank acceptance. Contract size bounds do not override gateway,
Lambda or client response-size limits.

## Errors and retries

Every operation below lists its required permission, contract version and request headers.
Commands marked with `Idempotency-Key` need a saved key for the same intended command. Where
`If-Match` is required, use the quoted current resource version. If the version is stale, read and
review the latest state before preparing another command.

A timeout can leave a command's outcome unknown. Read the current resource before retrying;
never invent a new idempotency key just to bypass uncertainty. A Processing idempotency key does
not make a bank upload safe to repeat. The Processing SDK does not retry automatically and has a
30-second default timeout, separate from the WS Channel client's timeout.

Expect `401` for invalid sessions, `403` for missing access, `412` for stale versions and `429` for
request limits. Inspect the actual response and operation-specific issues; a gateway may return a
different error shape from the service. Keep credentials, tokens, signed links and payment contents
out of logs. Preserve only safe error metadata for support.

[File Exchange reference](https://www.isecure.fi/wsapi_v2/) ·
[Bank Simulator reference](https://www.isecure.fi/apis/bank-simulator/) ·
[SDK guide](https://github.com/isecurefi/isecure-ts-client/blob/main/docs/processing.md)
