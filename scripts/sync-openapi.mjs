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

const summary = summarizeOpenApi(spec);
console.log(
  `Synced OpenAPI ${summary.version}: ${summary.operationCount} operations, ${summary.definitionCount} schemas, commit ${commit.sha.slice(0, 12)}`,
);
