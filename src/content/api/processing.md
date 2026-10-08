Create, review and approve a payment file, then download it. Your application verifies and signs the file locally and sends it through the separate [File Exchange API](https://www.isecure.fi/wsapi_v2/#operation/UploadFile). Processing does not send payments to a bank.

**Beta · Nordea, OP, Danske Bank, Säästöpankki, Oma Säästöpankki and Ålandsbanken · Test and production environments · Paid subscription and access approval required.**

Nordea validated payment-file profiles cover Finland, Sweden, Norway and Denmark. OP and Danske Bank Finland SEPA profiles are available; their bank validation is in progress. Säästöpankki, Oma Säästöpankki and Ålandsbanken Finland SEPA profiles are available; their bank validation has not started. POP Pankki and Aktia pain.001.001.03 profiles are implemented and planned for the Processing API; they are not yet available. Verification of Payee (VoP) is included for Nordea, OP and Danske Bank payments. Support for other banks and profiles is qualified separately.

This reference covers 26 payment operations, session exchange and notifications. The same contract is served in the test and production environments; choose the base URL and session audience for the environment you are using.

## Prepare a payment file

1. **Choose the bank format and check the paying account.** Select file rules for your bank and country, then check whether the account you will pay from supports the intended payment. See the explanation below.
2. **Create a draft.** Pass the selected account capability to `paymentBatches.createDraft()` and add payments. Use decimal strings for amounts, not floating-point numbers.
3. **Check it.** `validate()` checks the draft; `simulate()` evaluates the proposed payment without sending it. This is separate from a [Bank Simulator](https://www.isecure.fi/apis/bank-simulator/) run.
4. **Request review.** `finalize()` locks a revision; `submitForReview()` submits it. Keep the returned resource versions. Changes may need a new revision and fresh approval.
5. **Approve separately.** An authorized, distinct reviewer calls `paymentApprovalRequests.decide()`. File Exchange admin/data mode alone grants no approval authority.
6. **Release and download.** Call `paymentExports.release()`, then `get()` for the file's identity, digest, length and media type. Pass that result to `download()`; the SDK checks the bytes against it.
7. **Sign and send.** Sign the verified bytes with your locally held private key and upload through File Exchange. Never automatically retry an upload whose outcome is unknown.

### What does the first step mean?

An **export profile** defines how to write payment XML for a particular bank and country. An **account capability** describes the payment types, currencies, destinations and limits available for one paying account. Supporting a file format does not establish what that account may do.

- **Find the format:** `paymentExportProfiles.list()` returns profiles admitted for your tenant. Check their bank, country, payment type, availability and qualification—not just the XML format name.
- **Configure the account:** `paymentExportProfiles.get()` reads your current setup. If setup or a change is needed, an administrator with approval permission calls `configure()` with the profile, debtor account, company and bank-agreement details.
- **Check the payment:** `paymentCapabilities.list()` shows visible capabilities; `resolve()` matches the account and payment requirements. Continue only with outcome `resolved` and a `selected` reference. Pass that exact reference to the draft; do not guess when no unique match is returned.

Neither configuration nor selection creates a bank agreement or approves a payment. The server checks current authority on use.

The [complete SDK example](https://github.com/isecurefi/isecure-ts-client/tree/main/examples/processing-manual-upload) shows these calls, separate logins, verified download, local signing and one confirmed upload. The [simulator example](https://github.com/isecurefi/isecure-ts-client/tree/main/examples/processing-simulator-journey) also verifies synthetic feedback and recovery against its recorded test releases.

## What success means

The export path returns `pain.001.001.09` XML, not JSON. Approval and download do not prove bank acceptance or payment completion.

The Bank Simulator returns synthetic `pain.002`, `camt.054` and `camt.053` feedback through File Exchange. Real-bank use separately requires a bank agreement, Bank Connectivity access, production credentials and a qualified bank/profile connection.
