## One ISECure account across all three APIs

Use the same ISECure registration, users and initial login for File Exchange, Processing and Bank Simulator. **Do not register a second user in Processing or Bank Simulator.** Account administration remains in the existing [File Exchange API](https://www.isecure.fi/wsapi_v2/); neither new API introduces another registration or user-management route.

Use these sections of the live File Exchange reference:

- [Start registration](https://www.isecure.fi/wsapi_v2/#operation/InitRegister) and [create the account](https://www.isecure.fi/wsapi_v2/#operation/Register).
- Complete [email verification](https://www.isecure.fi/wsapi_v2/#operation/VerifyEmail) and [phone verification](https://www.isecure.fi/wsapi_v2/#operation/VerifyPhone) when requested.
- [Start login](https://www.isecure.fi/wsapi_v2/#operation/InitLogin), [sign in](https://www.isecure.fi/wsapi_v2/#operation/Login), and [answer the SMS or TOTP MFA challenge](https://www.isecure.fi/wsapi_v2/#operation/LoginMFA). Follow the challenge returned by the server; [MFA selection](https://www.isecure.fi/wsapi_v2/#operation/SelectMFA) applies only when login explicitly requests a choice.
- Integrators use [list customer accounts](https://www.isecure.fi/wsapi_v2/#operation/ListAccounts); account lifecycle includes [password recovery](https://www.isecure.fi/wsapi_v2/#operation/InitPasswordReset), [account deletion](https://www.isecure.fi/wsapi_v2/#operation/DeleteAccount) and the [account audit history](https://www.isecure.fi/wsapi_v2/#operation/ListAuditEvents), subject to that API's authorization rules.

A shared identity does not mean one interchangeable token or identical authority. Processing and Bank Simulator share a separate Processing session obtained from the completed login. Each product also checks its subscription and user permissions. File Exchange admin/data modes do not automatically grant Processing approval or simulator-management permission.

## Access and authentication

These APIs are Experimental and available only in the ISECure test environment. Request access from [ISECure support](mailto:support@isecure.fi). Registration alone does not enable either product: your tenant needs the appropriate active paid subscription, and your user needs permission for each operation. A successful login does not grant payment approval or simulator management rights.

[Processing API](https://www.isecure.fi/apis/processing/) and [Bank Simulator API](https://www.isecure.fi/apis/bank-simulator/) share one Processing base URL and session. [File Exchange](https://www.isecure.fi/wsapi_v2/) has a separate API and session. Your tenant is selected by the verified API key; you cannot select another tenant in a request body or URL. Resource IDs and account IDs do not grant access.

1. Complete [File Exchange login](https://www.isecure.fi/wsapi_v2/), including any requested email/phone verification or MFA. Obtain the current ID token and your tenant API key.
2. Call `POST /session` on the Processing base URL. Send the ID token directly in `Authorization` (without a prefix) and the API key in `x-api-key`. There is no request body.
3. Check that the response audience matches the configured Processing audience. Keep `processingSession` private. It expires after 15 minutes; use `expiresAtEpochSeconds` to check expiry.
4. On business requests send `Authorization: Processing <processingSession>`, the same `x-api-key`, and the exact `ISECure-Contract-Version` shown for that operation. JSON requests also need `Content-Type: application/json`.
5. Exchange a new session when necessary using a current ID token. The SDK does not silently refresh or retry commands.

### Connect with TypeScript

Install `isecure-ts-client@2.7.0` and use Node.js 24 or newer for these examples. The experimental `/iso20022` entry point supports both references. The root SDK continues to handle File Exchange.

```ts
import {
  createIso20022Client,
  Iso20022HttpTransport,
} from "isecure-ts-client/iso20022";

const transport = new Iso20022HttpTransport({
  baseUrl: process.env.ISECURE_PROCESSING_BASE_URL!,
  processingAudience: process.env.ISECURE_PROCESSING_AUDIENCE!,
  // Supply fresh credentials from your completed File Exchange login.
  bootstrapAuthentication: async () => ({
    apiKey: process.env.ISECURE_API_KEY!,
    idToken: process.env.ISECURE_ID_TOKEN!,
  }),
});
await transport.exchangeProcessingSession();
const client = createIso20022Client(transport);
```

Use `https://processing-api.test.isecure.fi` as the base URL and audience `isecure-processing-gpgtest-v1`. Keep tokens and signing keys out of source control, URLs and application logs. The SDK sets operation versions and serializes path/query objects. Operation examples below assume this `client` has been created. Where an example declares an `input`, supply the fields documented in that operation's request schema; it is a typed integration template, not a complete runnable fixture.

## Safe commands and revisions

Operations that require `Idempotency-Key` show it explicitly. Create a unique key for one intended command and save it before sending. If that command needs an intentional retry, reuse the same key and unchanged input. A different key can create another action. The SDK never retries automatically.

Operations that require `If-Match` also show it explicitly. Pass the current resource version returned by a read or previous command as a quoted string: `expectedResourceVersion: JSON.stringify(resource.resource_version)`. For version `3`, the HTTP header is `If-Match: "3"`. This prevents overwriting work performed after your last read. If the version is stale, read the resource again and review the new state before deciding what to do. Do not blindly replace the header and resubmit an old approval.

An HTTP timeout or `503` may leave the outcome unknown. First inspect the resource and its events. Do not repeat an entire payment or simulation workflow merely because a response was lost. After idempotency expiry, reconcile the original outcome before creating another command.

## Lists, identifiers and pagination

Pass filters in the named query parameters. Object parameters use the encoding documented by each operation: for example `page[page_size]=25` and `page[cursor]=...`. Keep cursors opaque, reuse the same filters, and stop when `page.next_cursor` is absent. Results belong to the returned snapshot; do not interpret pagination as a live feed.

Simulator read routes use an object-valued `resource_reference` path parameter, not just a UUID. Its OpenAPI `simple` encoding is a comma-separated sequence of field names and values in schema order. The SDK encodes this for you. Use the complete reference returned by the API, including its resource type and revision where supplied.

IDs in examples are synthetic. Obtain account capabilities, resource references, versions and profile choices from your authorized API responses. Do not invent production account IDs or assume that a listed profile is enabled for your account.

## Errors and recovery

Business failures can return an `issues` array with structured issue details. Authentication, access and infrastructure failures can instead return a small `code` envelope. Gateway responses can have a different shape again. Check the HTTP status before reading a success schema; do not depend on an English error message.

| Status          | Meaning and next step                                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 400             | Invalid input, contract version or request encoding. Correct the request.                                                                     |
| 401             | Missing, expired or invalid authentication. Complete login/session exchange again.                                                            |
| 403             | Missing subscription, permission or API-key access. Ask the tenant administrator or ISECure support; another resource ID will not fix access. |
| 404             | Resource is unavailable in your scope, or the operation is not published. Check the selected test deployment and reference.                   |
| 409             | Conflicting command, reused key with different input, or operation already in progress. Inspect the existing result.                          |
| 410             | The command or idempotency window expired. Reconcile before submitting a new command.                                                         |
| 412             | Resource version changed. Read the latest version and review the change.                                                                      |
| 429             | Request limit reached. Honor any retry guidance and preserve command identity.                                                                |
| 500 / 503 / 504 | Service failure or an uncertain outcome. Inspect existing state before retrying.                                                              |

## Notifications

`GET /stream` returns a short Server-Sent Events (SSE) connection containing authorized event/task notifications and heartbeats. It uses the Processing session, API key and contract version `1`. Save the last completely handled event ID and pass it as `Last-Event-ID` when reconnecting. The current connection lease is at most 20 seconds; closing is normal.

The SDK provides `transport.streamProcessingEvents({ lastEventId, signal })`. It does not reconnect automatically. Notifications require their own server-side access checks and are not a complete audit history. After a gap or expired cursor, reconcile using available resource reads; simulator runs also expose their own event list. A stream message does not prove that a payment reached a real bank.

## Scope and compatibility

This reference documents only the operations deployed in the reviewed test release. The SDK contains additional generated methods that this deployment does not expose. Their presence is not a support or availability promise. Request versions are per operation; the overall specification version does not replace `ISECure-Contract-Version`.

[File Exchange reference](https://www.isecure.fi/wsapi_v2/) · [Processing reference](https://www.isecure.fi/apis/processing/) · [Bank Simulator reference](https://www.isecure.fi/apis/bank-simulator/) · [TypeScript SDK](https://github.com/isecurefi/isecure-ts-client)
