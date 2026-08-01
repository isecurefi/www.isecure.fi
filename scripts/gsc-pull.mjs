import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { JWT } from "google-auth-library";

// Pull Google Search Console performance data and surface the two highest-ROI
// SEO opportunities: striking-distance keywords (page 2 -> page 1) and
// top-10 pages bleeding clicks to a weak title/meta (low CTR for their rank).
//
// Setup (one-time, in Google Cloud + Search Console):
//   1. Cloud Console -> enable "Google Search Console API".
//   2. Create a service account, add a JSON key, download it.
//   3. Search Console -> Settings -> Users and permissions -> add the service
//      account email (…@….iam.gserviceaccount.com) with FULL permission.
//      (This is the critical step — GSC access is granted here, NOT via GCP IAM.
//       Without it, the enabled API still returns 403.)
//   4. Put the key path + property in .env (see .env.example).
//
// Run: node scripts/gsc-pull.mjs [days]   (default 90)

const KEY_FILE =
  process.env.GSC_KEY_FILE || process.env.GOOGLE_APPLICATION_CREDENTIALS;
// Domain property = "sc-domain:isecure.fi"; URL-prefix = "https://www.isecure.fi/".
const SITE_URL = process.env.GSC_SITE_URL || "sc-domain:isecure.fi";
const DAYS = Number(process.argv[2]) || 90;
const MIN_IMPRESSIONS = 30; // ignore long-tail noise below this

if (!KEY_FILE) {
  throw new Error(
    "Set GSC_KEY_FILE (or GOOGLE_APPLICATION_CREDENTIALS) to the service-account JSON key path. See .env.example.",
  );
}

// Typical organic CTR by average position — used to flag underperformers.
// ponytail: rough industry curve, tune to isecure.fi's own averages once data lands.
const EXPECTED_CTR = [
  0, 0.28, 0.15, 0.1, 0.07, 0.05, 0.04, 0.03, 0.025, 0.02, 0.018,
];
const expectedCtr = (pos) => EXPECTED_CTR[Math.round(pos)] ?? 0.015;

function isoDaysAgo(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function query(client, dimensions) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`;
  const res = await client.request({
    url,
    method: "POST",
    data: {
      startDate: isoDaysAgo(DAYS),
      endDate: isoDaysAgo(1),
      dimensions,
      rowLimit: 25000,
      dataState: "final",
    },
  });
  return res.data.rows ?? [];
}

const pct = (n) => `${(n * 100).toFixed(1)}%`;
const table = (rows, keyLabel) =>
  rows
    .map(
      (r) =>
        `  ${r.impressions.toString().padStart(6)} imp  pos ${r.position.toFixed(1).padStart(4)}  CTR ${pct(r.ctr).padStart(6)}  ${r.keys[0]}`,
    )
    .join("\n") || `  (none — ${keyLabel} data still thin, try more days)`;

async function main() {
  const key = JSON.parse(readFileSync(KEY_FILE, "utf8"));
  const client = new JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });

  const [queries, pages, queryPages] = await Promise.all([
    query(client, ["query"]),
    query(client, ["page"]),
    query(client, ["query", "page"]),
  ]);

  const relevant = queries.filter((r) => r.impressions >= MIN_IMPRESSIONS);

  // Striking distance: ranking page 2-ish (8–20). A small push lands page 1.
  const striking = relevant
    .filter((r) => r.position >= 8 && r.position <= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25);

  // Low CTR: already on page 1 (pos <= 10) but earning far below its rank.
  // These need a better <title>/meta, not new content — cheapest wins.
  const lowCtr = relevant
    .filter((r) => r.position <= 10 && r.ctr < 0.5 * expectedCtr(r.position))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25);

  // Query→page pairs expose cannibalization: the same query ranking several
  // URLs (e.g. a legacy page splitting impressions with its replacement).
  const pairs = [...queryPages]
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25);

  mkdirSync(".gsc-data", { recursive: true });
  writeFileSync(".gsc-data/queries.json", JSON.stringify(queries, null, 2));
  writeFileSync(".gsc-data/pages.json", JSON.stringify(pages, null, 2));
  writeFileSync(
    ".gsc-data/query-pages.json",
    JSON.stringify(queryPages, null, 2),
  );

  console.log(
    `\nGSC ${SITE_URL} — last ${DAYS} days (${isoDaysAgo(DAYS)} → ${isoDaysAgo(1)})`,
  );
  console.log(
    `${queries.length} queries, ${pages.length} pages. Raw dumped to .gsc-data/\n`,
  );
  console.log(
    `\n== STRIKING DISTANCE (rank 8–20 → push to page 1) — ${striking.length} ==`,
  );
  console.log(table(striking, "striking"));
  console.log(
    `\n== LOW CTR (page 1 but weak title/meta) — ${lowCtr.length} ==`,
  );
  console.log(table(lowCtr, "low-CTR"));
  console.log(
    `\n== QUERY → PAGE (top ${pairs.length} pairs by impressions) ==`,
  );
  console.log(
    pairs
      .map(
        (r) =>
          `  ${r.impressions.toString().padStart(6)} imp  pos ${r.position.toFixed(1).padStart(4)}  ${r.keys[0]}  →  ${r.keys[1].replace("https://www.isecure.fi", "")}`,
      )
      .join("\n") || "  (no data)",
  );
  console.log("");
}

main().catch((e) => {
  console.error(
    "GSC pull failed:",
    e.response?.data?.error?.message || e.message,
  );
  process.exit(1);
});
