Prepare payment files through a controlled review and approval process. This API creates and releases an exact file for your application to download. Your application signs it locally and uses the separate [File Exchange API](https://www.isecure.fi/wsapi_v2/#operation/UploadFile) to upload it.

**Experimental · Test environment · Paid subscription and access approval required.** This reference covers 26 payment operations plus session exchange and notifications. It does not offer a production Processing endpoint or promise that a bank will accept a file.

## Prepare a payment file

1. **Discover the available profiles and account capabilities.** `paymentExportProfiles.list()` lists formats available to this deployment. An authorized administrator configures a profile; `paymentCapabilities.list()` and `resolve()` identify what an account may use.
2. **Create a draft.** `paymentBatches.createDraft()` selects an exact account capability. Add, update or remove payments while the draft is open. Amounts use decimal strings, not floating-point numbers.
3. **Check the draft.** `validate()` reports input and business-rule issues. `simulate()` evaluates the proposed payment order; it is separate from running the [Bank Simulator](https://www.isecure.fi/apis/bank-simulator/).
4. **Finalize and request review.** `finalize()` locks a revision and `submitForReview()` submits that exact revision. Keep the resource versions returned at each step.
5. **Approve with an authorized, distinct identity.** `paymentApprovalRequests.decide()` records the decision. File Exchange admin/data mode does not itself grant approval. The server's assignment and separation-of-duties rules apply.
6. **Release and download.** `paymentExports.release()` creates the export after the required approval. `paymentExports.get()` supplies the artifact identity, digest, byte length and media type. Pass that authority to `paymentExports.download()`; the SDK checks the returned bytes against it.
7. **Sign and transfer separately.** Keep the private signing key in your application. [Upload through File Exchange](https://www.isecure.fi/wsapi_v2/#operation/UploadFile) only after verifying the exact file and intended destination. An uncertain upload must not be retried automatically.

Approval of a file is not bank authorization, bank acceptance or a completed payment. A correction is a new revision and may need fresh approval. Discover profile availability at runtime; an ISO format name alone does not prove bank or country qualification.

### Discover the export profiles

After creating the authenticated `client` shown below:

```ts
const catalog = await client.paymentExportProfiles.list();
const configured = await client.paymentExportProfiles.get();
```

### Download verified bytes

Use the export ID and artifact authority returned by the completed release/read workflow:

```ts
// `exportResource` is the payment export resource returned by your read.
const downloaded = await client.paymentExports.download(
  { payment_export_id: exportResource.payment_export_id },
  exportResource,
  { idempotencyKey: savedDownloadCommandKey },
);
// downloaded.bytes contains the verified file. Sign these exact bytes locally.
```

See the [complete payment-file SDK example](https://github.com/isecurefi/isecure-ts-client/tree/main/examples/processing-manual-upload) for profile configuration, separate submitter/approver logins, local signing and an explicitly confirmed upload. The [Processing-to-simulator example](https://github.com/isecurefi/isecure-ts-client/tree/main/examples/processing-simulator-journey) also follows synthetic feedback; its recorded release qualification does not imply production readiness.

## Files and real-bank boundaries

The published payment-export path produces `pain.001.001.09` for the selected available profile. The content-download operation returns file bytes, not a JSON success object. Follow its documented response media type and integrity headers. The SDK refuses a download that does not match the authorized digest, length, identity or media type.

[Bank Simulator](https://www.isecure.fi/apis/bank-simulator/) can return synthetic `pain.002`, `camt.054` and `camt.053` files through [File Exchange](https://www.isecure.fi/wsapi_v2/#operation/DownloadFile). Using a real bank requires a separate bank agreement, Bank Connectivity access, production credentials and a qualified bank/profile connection. Processing access grants none of these automatically.
