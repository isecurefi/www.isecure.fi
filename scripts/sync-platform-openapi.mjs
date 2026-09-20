// Explicit operator sync only. Normal builds read committed, pinned files offline.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
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
if (hash(bytes) !== manifest.generatedOpenApi.sha256)
  throw new Error("Release source digest differs from Git");
const original = JSON.parse(bytes);
const deployed = JSON.parse(readFileSync(args["--gateway-export"], "utf8"));
if (deployed.info.description !== manifest.releaseId)
  throw new Error("Gateway and release manifest differ");
const publicExtensions = new Set([
  "x-isecure-minimum",
  "x-isecure-maximum",
  "x-isecure-json-representation",
]);
function clean(v) {
  if (Array.isArray(v)) return v.map(clean);
  if (!v || typeof v !== "object") return v;
  return Object.fromEntries(
    Object.entries(v)
      .filter(([k]) => !k.startsWith("x-") || publicExtensions.has(k))
      .map(([k, x]) => [k, clean(x)]),
  );
}
const paths = {};
const operations = {};
const versions = new Set();
for (const [path, item] of Object.entries(deployed.paths)) {
  for (const [method, operation] of Object.entries(item)) {
    if (method === "options") continue;
    if (!["get", "post", "put", "patch", "delete"].includes(method)) continue;
    const uri = operation["x-amazon-apigateway-integration"]?.uri ?? "";
    const match = uri.match(
      /function:isecure-processing-gpgtest-v1:(\d+)\/(?:response-streaming-)?invocations$/,
    );
    if (!match) throw new Error(`Unexpected integration for ${method} ${path}`);
    versions.add(match[1]);
    if (path === "/session" || path === "/stream") continue;
    const source = original.paths[path]?.[method];
    if (!source || source.operationId !== operation.operationId)
      throw new Error(`No source match for ${method} ${path}`);
    if (!/^(payment_|simulation_)/.test(source.operationId))
      throw new Error(`Unreviewed product ${source.operationId}`);
    paths[path] ??= {};
    paths[path][method] = clean(source);
    operations[source.operationId] = Object.fromEntries(
      [
        "version",
        "contractDigest",
        "input",
        "result",
        "permission",
        "idempotency",
        "expectedVersion",
        "pagination",
      ].map((k) => [k, source["x-isecure-operation"][k]]),
    );
  }
}
if (versions.size !== 1) throw new Error("Deployment mixes Lambda versions");
const schemas = {};
function visit(x) {
  if (Array.isArray(x)) {
    x.forEach(visit);
    return;
  }
  if (!x || typeof x !== "object") return;
  if (x.$ref) {
    const name = x.$ref.replace("#/components/schemas/", "");
    if (!Object.hasOwn(schemas, name)) {
      if (!original.components.schemas[name])
        throw new Error(`Missing ${name}`);
      schemas[name] = clean(original.components.schemas[name]);
      visit(schemas[name]);
    }
  }
  Object.values(x).forEach(visit);
}
visit(paths);
Object.values(operations).forEach((o) =>
  visit({ $ref: `#/components/schemas/${o.input}` }),
);
const snapshot = {
  info: original.info,
  paths,
  components: {
    schemas: Object.fromEntries(
      Object.entries(schemas).sort(([a], [b]) => a.localeCompare(b)),
    ),
  },
  operations,
};
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
  operationCount: Object.keys(operations).length,
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
