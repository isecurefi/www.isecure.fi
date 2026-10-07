import { readFileSync } from "node:fs";
import { JWT } from "google-auth-library";

const KEY_FILE =
  process.env.GSC_KEY_FILE || process.env.GOOGLE_APPLICATION_CREDENTIALS;
const SITE_URL = process.env.GSC_SITE_URL || "sc-domain:isecure.fi";
const APPLY = process.argv.includes("--apply");
const CURRENT_SITEMAP = "https://www.isecure.fi/sitemap-index.xml";
const RETIRED_SITEMAPS = [
  "https://www.isecure.fi/sitemap.xml",
  "https://isecure.fi/sitemap.xml",
  "http://isecure.fi/sitemap.xml",
];

if (!KEY_FILE) {
  throw new Error(
    "Set GSC_KEY_FILE (or GOOGLE_APPLICATION_CREDENTIALS). See .env.example.",
  );
}

const key = JSON.parse(readFileSync(KEY_FILE, "utf8"));
const client = new JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ["https://www.googleapis.com/auth/webmasters"],
});
const sitePath = encodeURIComponent(SITE_URL);
const sitemapsUrl = `https://searchconsole.googleapis.com/webmasters/v3/sites/${sitePath}/sitemaps`;

async function listSitemaps() {
  const response = await client.request({ url: sitemapsUrl });
  return response.data.sitemap ?? [];
}

async function deleteSitemap(feedpath) {
  await client.request({
    url: `${sitemapsUrl}/${encodeURIComponent(feedpath)}`,
    method: "DELETE",
  });
}

async function submitSitemap(feedpath) {
  await client.request({
    url: `${sitemapsUrl}/${encodeURIComponent(feedpath)}`,
    method: "PUT",
  });
}

async function inspectUrl(inspectionUrl) {
  const response = await client.request({
    url: "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
    method: "POST",
    data: {
      inspectionUrl,
      siteUrl: SITE_URL,
      languageCode: "en-US",
    },
  });
  const result = response.data.inspectionResult?.indexStatusResult ?? {};
  return {
    verdict: result.verdict ?? "UNKNOWN",
    coverageState: result.coverageState ?? "Unknown to Google",
    lastCrawlTime: result.lastCrawlTime ?? null,
  };
}

// Every indexable URL comes from the live sitemap, so new pages are inspected
// automatically instead of maintaining a hand-picked list here.
async function sitemapUrls(sitemapUrl) {
  const xml = await (await fetch(sitemapUrl)).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((m) => m[1]);
  if (!xml.includes("<sitemapindex")) return locs;
  const nested = await Promise.all(locs.map(sitemapUrls));
  return nested.flat();
}

function printSitemaps(sitemaps) {
  console.log("\nSearch Console sitemaps:");
  for (const sitemap of sitemaps) {
    console.log(
      `  ${sitemap.path} | submitted ${sitemap.lastSubmitted ?? "-"} | errors ${sitemap.errors ?? 0} | warnings ${sitemap.warnings ?? 0}`,
    );
  }
}

async function main() {
  const before = await listSitemaps();
  printSitemaps(before);

  if (APPLY) {
    const submitted = new Set(before.map((sitemap) => sitemap.path));
    for (const retired of RETIRED_SITEMAPS) {
      if (!submitted.has(retired)) continue;
      await deleteSitemap(retired);
      console.log(`Removed retired sitemap submission: ${retired}`);
    }
    await submitSitemap(CURRENT_SITEMAP);
    console.log(`Submitted current sitemap: ${CURRENT_SITEMAP}`);
    printSitemaps(await listSitemaps());
  } else {
    console.log(
      "\nDry run. Pass --apply to remove retired submissions and resubmit the current sitemap.",
    );
  }

  const urls = await sitemapUrls(CURRENT_SITEMAP);
  console.log(
    `\nIndex status of ${urls.length} sitemap URLs (problems first):`,
  );
  const statuses = [];
  for (const url of urls) statuses.push({ url, ...(await inspectUrl(url)) });
  statuses.sort((a, b) => (a.verdict === "PASS") - (b.verdict === "PASS"));
  for (const status of statuses) {
    console.log(
      `  ${status.verdict} | ${status.coverageState} | last crawl ${status.lastCrawlTime ?? "-"} | ${status.url}`,
    );
  }
  const indexed = statuses.filter((status) => status.verdict === "PASS").length;
  console.log(`\n${indexed}/${urls.length} sitemap URLs are indexed.`);

  console.log(
    "\nGoogle only supports general-page indexing requests in Search Console. The URL Inspection API is read-only; the submitted sitemap is the automated discovery path.",
  );
}

main().catch((error) => {
  console.error(
    "GSC management failed:",
    error.response?.data?.error?.message || error.message,
  );
  process.exit(1);
});
