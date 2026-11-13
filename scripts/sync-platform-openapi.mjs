// Explicit operator sync only. Normal builds read committed, pinned files offline.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { buildSnapshot, productionSource } from "./platform-api-source.mjs";
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const i = a.indexOf("=");
    return [a.slice(0, i), a.slice(i + 1)];
  }),
);
for (const k of ["--repository", "--manifest", "--gateway-export"])
  if (!args[k]) throw new Error(`Required ${k}=...`);
const manifest = JSON.parse(readFileSync(args["--manifest"], "utf8"));
if (!/^[a-f0-9]{40}$/.test(manifest.repositoryRevision))
  throw new Error("Exact source revision required");
const bytes = execFileSync(
  "git",
  ["show", `${manifest.repositoryRevision}:generated/processing/openapi.json`],
  { cwd: args["--repository"], maxBuffer: 40 * 1024 * 1024 },
);
const hash = (v) => createHash("sha256").update(v).digest("hex");
if (
  args["--product"] !== "processing" &&
  hash(bytes) !== manifest.generatedOpenApi.sha256
)
  throw new Error("Release source digest differs from Git");
const original = JSON.parse(bytes);
const deployed = JSON.parse(readFileSync(args["--gateway-export"], "utf8"));
if (args["--product"] === "processing") {
  for (const key of ["--binding", "--gateway-document"]) {
    if (!args[key]) throw new Error(`Required ${key}=... for production`);
  }
  const result = productionSource({
    sourceBytes: bytes,
    manifest,
    deployed,
    gatewayBytes: readFileSync(args["--gateway-document"]),
    binding: JSON.parse(readFileSync(args["--binding"], "utf8")),
  });
  for (const [file, value] of [
    ["processing-api.source.json", result.snapshot],
    ["processing-api.source-metadata.json", result.metadata],
  ]) {
    writeFileSync(
      new URL(`../src/data/${file}`, import.meta.url),
      JSON.stringify(value, null, 2) + "\n",
    );
  }
  console.log(
    `Pinned ${result.metadata.operationCount} production payment operations from ${result.metadata.repositoryRevision}`,
  );
  process.exit(0);
}
if (args["--product"]) throw new Error("Unknown product selection");
if (deployed.info.description !== manifest.releaseId)
  throw new Error("Gateway and release manifest differ");
const versions = new Set();
for (const [path, item] of Object.entries(deployed.paths)) {
  for (const [method, operation] of Object.entries(item)) {
    if (!["get", "post", "put", "patch", "delete"].includes(method)) continue;
    const match = operation["x-amazon-apigateway-integration"]?.uri?.match(
      /function:isecure-processing-gpgtest-v1:(\d+)\/(?:response-streaming-)?invocations$/,
    );
    if (!match) throw new Error(`Unexpected integration for ${method} ${path}`);
    versions.add(match[1]);
  }
}
if (versions.size !== 1) throw new Error("Deployment mixes Lambda versions");
const snapshot = buildSnapshot(original, deployed);
const metadata = {
  schemaVersion: 1,
  releaseId: manifest.releaseId,
  repositoryRevision: manifest.repositoryRevision,
  sourceDateEpoch: manifest.sourceDateEpoch,
  sourceFile: "generated/processing/openapi.json",
  sourceSha256: hash(bytes),
  snapshotSha256: hash(JSON.stringify(snapshot)),
  lambdaVersion: [...versions][0],
  verifiedAt: args["--verified-at"] ?? new Date().toISOString().slice(0, 10),
  baseUrl: "https://processing-api.test.isecure.fi",
  audience: "isecure-processing-gpgtest-v1",
  sdkVersion: "2.7.0",
  operationCount: Object.keys(snapshot.operations).length,
};
for (const [file, value] of [
  ["platform-api.source.json", snapshot],
  ["platform-api.source-metadata.json", metadata],
])
  writeFileSync(
    new URL(`../src/data/${file}`, import.meta.url),
    JSON.stringify(value, null, 2) + "\n",
  );
console.log(
  `Pinned ${metadata.operationCount} operations from ${metadata.repositoryRevision}`,
);
