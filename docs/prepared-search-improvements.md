# Prepared search-page improvements

Prepared 2026-11-26 against website release
`2ae403cfa018f3d5aed782853d7805ce4c6d6542`. These changes are for review and
are not part of the deployed simulator preview. They implement the next content
iteration for platform tasks `WEBSEO-002`, `WEBSEO-003` and `WEBSEO-004`;
they do not close those measurement tasks.

## Evidence and scope

The local GSC/GA4 report generated on 2026-11-26 compares 2026-10-27–2026-11-23
with the preceding 28 days. Marketing search had 78 clicks (+39.3%), 8,362
impressions (+48.4%) and approximately 0.93% CTR. Queries `camt.054` (260
impressions), `camt053` (253) and `camt.053` (154) had no clicks. `pain.002`
had 188 impressions and 1.6% CTR. GA4 recorded 550 sessions, 81 resource/product
selections and two successful contact submissions, versus five previously.
These small counts do not establish causality or qualified sales demand.

The evidence supports improving existing message guides and the path to a
useful example. It does not establish distinct buyer segments requiring new
landing pages. No new indexable route or product availability claim is added.

## Prepared changes

- English camt.053, camt.054 and pain.002 titles, descriptions and headings
  describe the examples, fields, comparisons and status codes already on each
  page. Existing definition paragraphs and source citations remain.
- Every guide with an XML example gets a direct hero jump and a copy button.
  These shared controls have Finnish, English and Swedish labels, keyboard
  focus styling and an announced success/failure state.
- All camt.053 locales offer the same complete synthetic opening-statement XML
  download. It was retrieved on 2026-11-26 from the dedicated website demo
  simulator through `isecure-ts-client` 6.1.0. It contains a EUR 10 million
  seeded balance and zero transactions. It is explicitly separate from the
  shortened instructional snippet and is not a real-bank qualification fixture.
- Copy/download clicks reuse the existing `select_content` wiring with stable
  `developer-resource` IDs and `guide-example` source. No XML, customer data,
  new analytics destination or lead event is sent.

The unlisted `/preview/bank-demo/` remains unlinked. Canonicals, reciprocal
hreflang, existing routes and product maturity stay as published. Deployment
of this draft and later public discovery of the demo are separate decisions.

## Review and measurement

Validate lint, formatting, the full build and existing contract/link checks;
check the rendered guides on desktop and at 320px, including jump, copy and
exact XML download. Review content accuracy, synthetic provenance, privacy,
accessibility and the shared implementation before merging.

After a separately authorized publication, compare equal 28-day GSC windows
with the normal reporting delay. Compare the same query/page, country and
device groups; track impressions, position and CTR together. Inspect GA4
`guide-example` selections and successful contact submissions separately.
Resource clicks are engagement, not leads. Keep tasks open until the measured
follow-up is recorded; do not infer uplift from a title change alone.
