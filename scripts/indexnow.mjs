// Submit every URL in the live sitemap to IndexNow (Bing, Yandex, Naver, Seznam).
// Run: node scripts/indexnow.mjs [--dry-run]
// The key file public/<key>.txt proves ownership of the host.
const HOST = "www.isecure.fi";
const KEY = "a22588bdb934028e6add7424106350f8";
const SITEMAP = `https://${HOST}/sitemap-index.xml`;

async function sitemapUrls(sitemapUrl) {
  const xml = await (await fetch(sitemapUrl)).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((m) => m[1]);
  if (!xml.includes("<sitemapindex")) return locs;
  const nested = await Promise.all(locs.map(sitemapUrls));
  return nested.flat();
}

const urlList = await sitemapUrls(SITEMAP);
if (urlList.length === 0) throw new Error(`No URLs found in ${SITEMAP}`);
console.log(`${urlList.length} URLs from ${SITEMAP}`);

if (process.argv.includes("--dry-run")) {
  for (const url of urlList) console.log(url);
  process.exit(0);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList,
  }),
});
// 200 = processed, 202 = accepted pending key verification.
console.log(`IndexNow ${response.status} ${response.statusText}`);
if (!response.ok) throw new Error(await response.text());
