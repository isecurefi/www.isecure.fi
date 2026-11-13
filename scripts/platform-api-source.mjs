import assert from "node:assert/strict";
import { createHash } from "node:crypto";

export const hash = (value) => createHash("sha256").update(value).digest("hex");
const methods = new Set(["get", "post", "put", "patch", "delete"]);
const publicExtensions = new Set([
  "x-isecure-minimum",
  "x-isecure-maximum",
  "x-isecure-json-representation",
]);
function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !key.startsWith("x-") || publicExtensions.has(key))
      .map(([key, child]) => [key, clean(child)]),
  );
}
export function operationInventory(document) {
  const result = [];
  for (const [path, item] of Object.entries(document.paths)) {
    for (const [method, op] of Object.entries(item)) {
      if (methods.has(method)) result.push({ path, method, op });
    }
  }
  return result.sort((a, b) =>
    `${a.path} ${a.method}`.localeCompare(`${b.path} ${b.method}`),
  );
}
export function buildSnapshot(original, deployed) {
  const paths = {},
    operations = {},
    schemas = {};
  for (const { path, method, op } of operationInventory(deployed)) {
    if (path === "/session" || path === "/stream") continue;
    const source = original.paths[path]?.[method];
    assert.equal(
      source?.operationId,
      op.operationId,
      `No source match for ${method} ${path}`,
    );
    assert.match(
      source.operationId,
      /^(payment_|simulation_)/,
      "Unreviewed product",
    );
    assert.ok(!operations[source.operationId], "Duplicate operation ID");
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
      ].map((key) => [key, source["x-isecure-operation"][key]]),
    );
  }
  function visit(value) {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== "object") return;
    if (value.$ref) {
      assert.ok(
        value.$ref.startsWith("#/components/schemas/"),
        "Unsupported schema reference",
      );
      const name = value.$ref.slice("#/components/schemas/".length);
      if (!Object.hasOwn(schemas, name)) {
        assert.ok(original.components.schemas[name], `Missing ${name}`);
        schemas[name] = clean(original.components.schemas[name]);
        visit(schemas[name]);
      }
    }
    Object.values(value).forEach(visit);
  }
  visit(paths);
  Object.values(operations).forEach((op) =>
    visit({ $ref: `#/components/schemas/${op.input}` }),
  );
  return {
    info: original.info,
    paths,
    components: {
      schemas: Object.fromEntries(
        Object.entries(schemas).sort(([a], [b]) => a.localeCompare(b)),
      ),
    },
    operations,
  };
}

// Operator-collected evidence is private. Only allowlisted provenance is published.
export function productionSource({
  sourceBytes,
  manifest,
  gatewayBytes,
  deployed,
  binding,
}) {
  assert.match(manifest.repositoryRevision, /^[a-f0-9]{40}$/);
  assert.match(manifest.runtimeCode.sha256, /^[a-f0-9]{64}$/);
  assert.match(binding.deploymentId, /^[A-Za-z0-9-]+$/);
  assert.match(binding.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(
    Number.isSafeInteger(manifest.sourceDateEpoch) &&
      manifest.sourceDateEpoch > 0,
  );
  assert.equal(binding.accountId, "507820410808");
  assert.equal(binding.region, "eu-west-1");
  assert.equal(binding.stageName, "production");
  assert.equal(binding.domainName, "processing-api.isecure.fi");
  assert.equal(binding.restApiId, "3331ddcva6");
  assert.equal(binding.mappedRestApiId, binding.restApiId);
  assert.equal(binding.mappedStage, binding.stageName);
  assert.equal(binding.runtimeRevision, manifest.repositoryRevision);
  assert.equal(binding.stackRevision, manifest.repositoryRevision);
  assert.equal(binding.runtimeReleaseId, manifest.releaseId);
  assert.equal(binding.stackReleaseId, manifest.releaseId);
  assert.equal(binding.runtimeCodeSha256, manifest.runtimeCode.sha256);
  assert.equal(binding.runtimeKey, manifest.runtimeCode.key);
  assert.equal(binding.runtimeObjectVersion, manifest.runtimeCode.versionId);
  assert.equal(binding.gatewayKey, manifest.gatewayDocument.key);
  assert.equal(
    binding.gatewayObjectVersion,
    manifest.gatewayDocument.versionId,
  );
  assert.equal(hash(gatewayBytes), manifest.gatewayDocument.sha256);
  assert.equal(
    deployed.info.description,
    `${manifest.releaseId} ${manifest.gatewayDocument.sha256}`,
  );
  const gateway = JSON.parse(gatewayBytes);
  assert.equal(gateway.info.description, manifest.releaseId);
  const released = operationInventory(gateway),
    live = operationInventory(deployed);
  assert.deepEqual(
    live.map(({ path, method, op }) => [path, method, op.operationId]),
    released.map(({ path, method, op }) => [path, method, op.operationId]),
    "Live routes differ from release",
  );
  const uri =
    "arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-1:507820410808:function:isecure-processing-production-v1/invocations";
  for (const { path, op } of [...live, ...released]) {
    assert.equal(
      op["x-amazon-apigateway-integration"]?.uri,
      uri,
      "Unexpected production integration",
    );
    assert.ok(
      path === "/session" || op.operationId.startsWith("payment_"),
      "Unreviewed production operation",
    );
  }
  assert.equal(live.length, 28, "Review changed production operation count");
  assert.ok(
    live.some(({ op }) => op.operationId === "payment_orders.generate_file"),
  );
  assert.equal(
    gateway.paths["/session"].post.operationId,
    "processing_session.exchange",
  );
  const snapshot = buildSnapshot(JSON.parse(sourceBytes), deployed);
  return {
    snapshot,
    metadata: {
      schemaVersion: 2,
      releaseId: manifest.releaseId,
      repositoryRevision: manifest.repositoryRevision,
      sourceDateEpoch: manifest.sourceDateEpoch,
      sourceFile: "generated/processing/openapi.json",
      sourceSha256: hash(sourceBytes),
      snapshotSha256: hash(JSON.stringify(snapshot)),
      lambdaVersion: "$LATEST",
      lambdaCodeSha256: binding.runtimeCodeSha256,
      gatewayDocumentSha256: hash(gatewayBytes),
      gatewayDeploymentId: binding.deploymentId,
      verifiedAt: binding.verifiedAt,
      baseUrl: "https://processing-api.isecure.fi",
      audience: "isecure-processing-production-v1",
      sdkVersion: "5.0.2",
      operationCount: Object.keys(snapshot.operations).length,
      sessionSchemaVersions: [1, 2],
      streaming: false,
    },
  };
}
