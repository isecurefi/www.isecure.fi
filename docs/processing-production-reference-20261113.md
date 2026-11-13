# Production Processing reference — 13 November 2026

The owner authorized replacing the historical public Processing reference with the exact deployed
production contract. This change updates documentation and publication tooling only. It does not
change API Gateway, DNS, Lambda configuration, tenant permissions or bank operations.

## Provenance

Read-only evidence binds branded endpoint `https://processing-api.isecure.fi` to production
API deployment `07625h`, CloudFormation release `r-f20c19c52-1793115925`, and source revision
`f20c19c529185efb6fb88b7f108d411ee9afeece`. The live Lambda code SHA-256 equals the release manifest
and CloudFormation artifact identity. The exact versioned gateway document has SHA-256
`de0e65df54dfb1263845cd7b2d09a49d0a68660588e03a3df98ef9cff068c84d`; every live business route and
integration matches it. The deployment uses an unqualified Lambda invocation, so the published
provenance records `$LATEST` plus the observed code hash, not a claimed immutable version.
Private evidence is outside the repository at
`/Volumes/Development/processing-production-reference-evidence-20261113/`.

The source contains 27 payment operations; session exchange makes 28 public paths. No stream,
VoP, observations or hosted Integration operations are added. The Bank Simulator source pin and
rendered specification remain byte-identical. Host session schemas, 900-second expiry and scoped
identity fields were checked at the exact deployed source revision.

## Inline review 1: correctness and compatibility

Matched all 27 operation versions and contract digests to the published SDK 5.0.2. All 51 distinct
operation/session/simulator sample files compile against that package. The generated reference
includes XML generation with exact order/profile revisions and integrity headers. The host's stale
revision 412 response is documented. Schema 1 remains the default; schema 2 adds scope without
changing authority. Approval/export routes remain listed as deployed but are explicitly separate
from the configured generation workflow. No authenticated business call was made for this review.

## Inline review 2: security, privacy and evidence

Production import refuses crossed accounts/stages/hostnames, source/runtime/release mismatches,
changed artifacts, missing routes and changed integrations. Only reviewed source operations and
reachable schemas enter the public snapshot. Raw cloud configurations, customer records, private
keys and infrastructure integrations stay out of public artifacts. Sessions and API-key ownership
remain explicit. Builds read only committed snapshots and refuse drift; publication rechecks the
live stage and code hash because the integration is mutable.

## Inline review 3: architecture, reuse and clarity

Kept one existing CLI, shared snapshot extraction and the existing OpenAPI-to-Scalar renderer.
Processing and Bank Simulator now select independent snapshots, avoiding an environment-wide
rewrite or loss of simulator documentation. Used the production DNS hostname throughout. The guide
leads with access, login and generation, then explains optional approval routes and uncertainty.
No new framework, renderer or runtime service was introduced.

## Validation and publication

The website build, OpenAPI schema/reference checks, redirects, lint, formatting and 39 tests pass.
The importer tests use synthetic evidence and make no AWS calls. Sample compilation and contract
parity use published SDK 5.0.2. Publication uses the existing clean-commit, immutable S3/CloudFront
release workflow and verifies the live manifest and generated Processing specification afterward.
