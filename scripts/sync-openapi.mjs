import { mkdir, rename, writeFile } from "node:fs/promises";

import { summarizeOpenApi, validateOpenApi } from "./openapi-utils.mjs";

const repository = "https://github.com/isecurefi/wsapi-v2";
const rawUrl =
  "https://raw.githubusercontent.com/isecurefi/wsapi-v2/master/wsapi_v2.json";
const commitUrl =
  "https://api.github.com/repos/isecurefi/wsapi-v2/commits/master";
const dataDirectory = new URL("../src/data/", import.meta.url);
const specUrl = new URL("wsapi_v2.json", dataDirectory);
const sourceUrl = new URL("wsapi_v2.source.json", dataDirectory);

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "isecure-website-openapi-sync",
  "X-GitHub-Api-Version": "2022-11-28",
};

const [specResponse, commitResponse] = await Promise.all([
  fetch(rawUrl, { headers }),
  fetch(commitUrl, { headers }),
]);

if (!specResponse.ok) {
  throw new Error(`OpenAPI download failed with HTTP ${specResponse.status}`);
}
if (!commitResponse.ok) {
  throw new Error(`Commit lookup failed with HTTP ${commitResponse.status}`);
}

const [spec, commit] = await Promise.all([
  specResponse.json(),
  commitResponse.json(),
]);
const errors = validateOpenApi(spec);
if (errors.length > 0) {
  throw new Error(
    `Downloaded OpenAPI document is invalid:\n- ${errors.join("\n- ")}`,
  );
}

const metadata = {
  repository,
  source: rawUrl,
  ref: "master",
  commit: commit.sha,
};
const temporarySpecUrl = new URL("wsapi_v2.json.next", dataDirectory);
const temporarySourceUrl = new URL("wsapi_v2.source.json.next", dataDirectory);

await mkdir(dataDirectory, { recursive: true });
await Promise.all([
  writeFile(temporarySpecUrl, `${JSON.stringify(spec, null, 2)}\n`, "utf8"),
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
