## Current SDK guide and production access

Use the [Processing SDK guide](https://github.com/isecurefi/isecure-ts-client/blob/main/docs/processing.md)
for current setup, authentication, errors and examples. Processing is included in the published
`isecure-ts-client` package through its experimental `/iso20022` entry point.

**Availability checked 12 November 2026:** Processing runs only in production at
`https://processing-api.isecure.fi`, with audience `isecure-processing-production-v1`.
The former test service was retired on 17 October 2026. Production registration alone does not
provide Processing access: ISECure must provision the tenant subscription, database, permissions
and API usage-plan access.

The standard path is to configure an export profile, create and validate a draft, finalize its
revision, then generate and download payment XML. See the
[generation example](https://github.com/isecurefi/isecure-ts-client/blob/main/examples/processing-generate-file/README.md).
It creates Processing records but does not send anything to a bank. Authorization, signing and
upload happen separately through [File Exchange](https://www.isecure.fi/wsapi_v2/#operation/UploadFile).
Generating a file does not prove bank acceptance or payment completion.

## Historical HTTP schema snapshot

The operation schemas below are retained from the test release verified on 20 September 2026.
**They are not a complete reference for today's production deployment.** In particular, this
snapshot does not contain the current `generate_file` operation. Its notification stream and
historical approval workflow must not be assumed available in production. VoP, observation and
hosted Integration methods in the SDK are also outside the current production route set.

Use the SDK guide for the current generation flow. Updating this HTTP schema snapshot requires a
separate import and review of the exact production release; the snapshot's recorded source has not
been relabelled as current. The historical server entry below is retired and must not be called.

## Account and session

Use your production File Exchange account. Start with [InitRegister](https://www.isecure.fi/wsapi_v2/#operation/InitRegister)
and [Register](https://www.isecure.fi/wsapi_v2/#operation/Register) if needed; then complete
[Login](https://www.isecure.fi/wsapi_v2/#operation/Login) and any requested
[LoginMFA](https://www.isecure.fi/wsapi_v2/#operation/LoginMFA). Account management, including
[ListAccounts](https://www.isecure.fi/wsapi_v2/#operation/ListAccounts) and
[DeleteAccount](https://www.isecure.fi/wsapi_v2/#operation/DeleteAccount), stays in File Exchange.

Processing exchanges the current ID token and API key for a separate Processing session.
The SDK guide shows the production URL and audience, session cleanup, required revisions and
safe handling of uncertain commands. Never log tokens, private keys or payment contents.

The independent [Bank Simulator](https://www.isecure.fi/apis/bank-simulator/) and
[File Exchange](https://www.isecure.fi/wsapi_v2/) have separate service boundaries.
