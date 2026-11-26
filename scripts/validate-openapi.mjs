import { createHash } from "node:crypto";
import { validatePgpPolicy } from "./pgp-policy-contract.mjs";
import { readFile } from "node:fs/promises";

import { summarizeOpenApi, validateOpenApi } from "./openapi-utils.mjs";

const specUrl = new URL("../src/data/wsapi_v2.json", import.meta.url);
const sourceUrl = new URL("../src/data/wsapi_v2.source.json", import.meta.url);

try {
  const [specText, sourceText] = await Promise.all([
    readFile(specUrl, "utf8"),
    readFile(sourceUrl, "utf8"),
  ]);
  const spec = JSON.parse(specText);
  const source = JSON.parse(sourceText);
  const errors = validateOpenApi(spec);

  if (!/^[0-9a-f]{40}$/.test(source.commit ?? "")) {
    errors.push("Source metadata is missing a full Git commit SHA");
  }
  if (source.repository !== "https://github.com/isecurefi/wsapi-v2") {
    errors.push("Source metadata points to an unexpected repository");
  }

  if (errors.length > 0) {
    for (const error of errors) console.error(`FAIL ${error}`);
    process.exitCode = 1;
  } else {
    const summary = summarizeOpenApi(spec);
    console.log(
      `OpenAPI ${summary.version}: ${summary.operationCount} operations, ${summary.definitionCount} schemas, source ${source.commit.slice(0, 12)}`,
    );
  }
} catch (error) {
  console.error(`FAIL Could not validate OpenAPI document: ${error.message}`);
  process.exitCode = 1;
}

const pgpBytes = await readFile(
  new URL("../src/data/pgp-policy.openapi.json", import.meta.url),
  "utf8",
);
const pgpMetadata = JSON.parse(
  await readFile(
    new URL("../src/data/pgp-policy.source.json", import.meta.url),
    "utf8",
  ),
);
const pgpErrors = validatePgpPolicy(JSON.parse(pgpBytes));
const mainMetadata = JSON.parse(await readFile(sourceUrl, "utf8"));
if (
  pgpMetadata.commit !== mainMetadata.commit ||
  pgpMetadata.repository !== mainMetadata.repository
)
  pgpErrors.push(
    "File Exchange and PGP references must use the same pinned upstream commit",
  );

if (
  createHash("sha256").update(pgpBytes).digest("hex") !==
  pgpMetadata.snapshotSha256
)
  pgpErrors.push("PGP snapshot digest differs from pinned source");
if (pgpErrors.length) throw new Error(pgpErrors.join("\n"));
console.log("PGP companion: 8 production operations, pinned source verified");
