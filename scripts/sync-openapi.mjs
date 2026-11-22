import { createHash } from "node:crypto";
import { validatePgpPolicy } from "./pgp-policy-contract.mjs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { format } from "prettier";

import { summarizeOpenApi, validateOpenApi } from "./openapi-utils.mjs";

const repository = "https://github.com/isecurefi/wsapi-v2";
const ref =
  process.argv.find((arg) => arg.startsWith("--ref="))?.slice(6) || "master";
const commitUrl = `https://api.github.com/repos/isecurefi/wsapi-v2/commits/${encodeURIComponent(ref)}`;
const dataDirectory = new URL("../src/data/", import.meta.url);
const specUrl = new URL("wsapi_v2.json", dataDirectory);
const sourceUrl = new URL("wsapi_v2.source.json", dataDirectory);

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "isecure-website-openapi-sync",
  "X-GitHub-Api-Version": "2022-11-28",
};

// Resolve the revision first so the document and recorded commit cannot race.
const commitResponse = await fetch(commitUrl, { headers });
if (!commitResponse.ok) {
  throw new Error(`Commit lookup failed with HTTP ${commitResponse.status}`);
}
const commit = await commitResponse.json();
if (!/^[0-9a-f]{40}$/.test(commit.sha ?? "")) {
  throw new Error("Commit lookup did not return a full Git commit SHA");
}
const rawUrl = `https://raw.githubusercontent.com/isecurefi/wsapi-v2/${commit.sha}/wsapi_v2.json`;
const specResponse = await fetch(rawUrl, { headers });
if (!specResponse.ok) {
  throw new Error(`OpenAPI download failed with HTTP ${specResponse.status}`);
}
const spec = await specResponse.json();
const errors = validateOpenApi(spec);
if (errors.length > 0) {
  throw new Error(
    `Downloaded OpenAPI document is invalid:\n- ${errors.join("\n- ")}`,
  );
}

// Both references are resolved from the same immutable upstream revision.
const pgpRawUrl = `https://raw.githubusercontent.com/isecurefi/wsapi-v2/${commit.sha}/pgp-policy-api.json`;
const pgpResponse = await fetch(pgpRawUrl, { headers });
if (!pgpResponse.ok)
  throw new Error(`PGP download failed: ${pgpResponse.status}`);
const pgpRaw = await pgpResponse.text();
const pgp = JSON.parse(pgpRaw);
const pgpErrors = validatePgpPolicy(pgp);
if (pgpErrors.length) throw new Error(pgpErrors.join("\n"));
const pgpText = await format(JSON.stringify(pgp), { parser: "json" });
const digest = (v) => createHash("sha256").update(v).digest("hex");
const pgpMetadata = {
  repository,
  source: pgpRawUrl,
  commit: commit.sha,
  sourceSha256: digest(pgpRaw),
  snapshotSha256: digest(pgpText),
};
const metadata = {
  repository,
  source: rawUrl,
  ref,
  commit: commit.sha,
};
const temporarySpecUrl = new URL("wsapi_v2.json.next", dataDirectory);
const temporarySourceUrl = new URL("wsapi_v2.source.json.next", dataDirectory);

await mkdir(dataDirectory, { recursive: true });
await Promise.all([
  writeFile(
    temporarySpecUrl,
    await format(JSON.stringify(spec), { parser: "json" }),
    "utf8",
  ),
  writeFile(
    temporarySourceUrl,
    `${JSON.stringify(metadata, null, 2)}\n`,
    "utf8",
  ),
]);
await Promise.all([
  rename(temporarySpecUrl, specUrl),
  rename(temporarySourceUrl, sourceUrl),
]);

await writeFile(new URL("pgp-policy.openapi.json", dataDirectory), pgpText);
await writeFile(
  new URL("pgp-policy.source.json", dataDirectory),
  await format(JSON.stringify(pgpMetadata), { parser: "json" }),
);
const summary = summarizeOpenApi(spec);
console.log(
  `Synced OpenAPI ${summary.version}: ${summary.operationCount} operations, ${summary.definitionCount} schemas, commit ${commit.sha.slice(0, 12)}`,
);
