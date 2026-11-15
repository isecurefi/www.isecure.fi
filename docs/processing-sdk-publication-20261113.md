# Processing SDK documentation publication — 13 November 2026

The owner authorized publication of the corrected SDK documentation and identified this website
repository. SDK main `0f0979e` is published on GitHub and CI passed. Website changes use the live
website predecessor `ff0e350`, retaining desktop 1.0.18 and all existing authentication guidance.
The original website checkout contains unrelated analytics edits and is left untouched.

## Evidence and boundaries

The read-only deployment inspection on 12 November found production payment routes, no Processing
test deployment and no hosted VoP, observation, Integration setup or stream routes. The platform
ledger's PROCESSING-RETIRE-GPGTEST-001 records retirement on 17 October; PROCESSING-CFN-001 records
production generation qualification on 27 October and no configured Processing approval workflow.
Private evidence remains outside the published site. No customer details are included here.

The public HTTP schema snapshot remains pinned to its original September source. This publication
labels it historical and removes the misleading production server advertisement; it does not change
operation schemas or claim a new import. Exact production HTTP contract synchronization remains a
separate follow-up. The independent Bank Simulator schema is unchanged.

## Three inline reviews

1. Correctness and compatibility: matched current SDK onboarding and generation guidance to the
   observed production route set. Removed Processing test access from the product catalogue,
   corrected Finnish/English/Swedish page copy and linked the published guide and generation
   example. Retained pricing, bank-specific qualification statements and existing API anchors.
2. Security, privacy and evidence: kept tenant provisioning, separate sessions, local signing,
   no automatic bank upload and synthetic-only trial boundaries explicit. No credentials, customer
   records or new API calls are embedded in the site. Historical schemas are not relabelled as
   currently qualified, and VoP is not advertised as part of this production release.
3. Structure and readability: reused the existing product registry, translated page components,
   Scalar reference and immutable S3/CloudFront publisher. Kept one SDK guide on GitHub rather than
   creating a competing website copy. No new navigation, renderer or service was introduced.

## Checks

The full website build, link/SEO/redirect/API checks and 23 tests pass. The regression checks that
Processing links current SDK guidance and identifies the retained schema as historical. Lint,
formatting and whitespace checks pass. SDK code examples were already checked against published
5.0.2 during the SDK documentation change. Website publication uses a clean commit, reviewed plan,
immutable release manifest and the existing automatic rollback path. Live checks follow publication.
