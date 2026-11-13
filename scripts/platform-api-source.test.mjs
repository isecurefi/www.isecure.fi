import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildSnapshot,
  hash,
  productionSource,
} from "./platform-api-source.mjs";

const saved = JSON.parse(
  readFileSync(
    new URL("../src/data/processing-api.source.json", import.meta.url),
  ),
);
function fixture() {
  const original = structuredClone(saved);
  const uri =
    "arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-1:507820410808:function:isecure-processing-production-v1/invocations";
  const gateway = {
    info: { description: "synthetic-release" },
    paths: {
      "/session": {
        post: {
          operationId: "processing_session.exchange",
          "x-amazon-apigateway-integration": { uri },
        },
      },
    },
  };
  for (const [path, item] of Object.entries(original.paths)) {
    gateway.paths[path] = {};
    for (const [method, op] of Object.entries(item)) {
      op["x-isecure-operation"] = saved.operations[op.operationId];
      gateway.paths[path][method] = {
        operationId: op.operationId,
        "x-amazon-apigateway-integration": { uri },
      };
    }
  }
  const gatewayBytes = Buffer.from(JSON.stringify(gateway));
  const manifest = {
    releaseId: "synthetic-release",
    repositoryRevision: "a".repeat(40),
    sourceDateEpoch: 1,
    runtimeCode: {
      sha256: "b".repeat(64),
      key: "runtime.zip",
      versionId: "runtime-version",
    },
    gatewayDocument: {
      sha256: hash(gatewayBytes),
      key: "gateway.json",
      versionId: "gateway-version",
    },
  };
  const deployed = structuredClone(gateway);
  deployed.info.description += ` ${manifest.gatewayDocument.sha256}`;
  const binding = {
    accountId: "507820410808",
    region: "eu-west-1",
    stageName: "production",
    domainName: "processing-api.isecure.fi",
    restApiId: "3331ddcva6",
    mappedRestApiId: "3331ddcva6",
    mappedStage: "production",
    runtimeRevision: manifest.repositoryRevision,
    stackRevision: manifest.repositoryRevision,
    runtimeReleaseId: manifest.releaseId,
    stackReleaseId: manifest.releaseId,
    runtimeCodeSha256: manifest.runtimeCode.sha256,
    runtimeKey: manifest.runtimeCode.key,
    runtimeObjectVersion: manifest.runtimeCode.versionId,
    gatewayKey: manifest.gatewayDocument.key,
    gatewayObjectVersion: manifest.gatewayDocument.versionId,
    deploymentId: "synthetic",
    verifiedAt: "2026-11-13",
    privateCustomerData: "must-not-be-published",
  };
  return {
    sourceBytes: Buffer.from(JSON.stringify(original)),
    gatewayBytes,
    manifest,
    deployed,
    binding,
  };
}
test("exact production evidence selects only deployed operations and allowlisted provenance", () => {
  const { snapshot, metadata } = productionSource(fixture());
  assert.equal(Object.keys(snapshot.operations).length, 27);
  assert.equal(metadata.lambdaVersion, "$LATEST");
  assert.equal(metadata.streaming, false);
  assert.equal(metadata.baseUrl, "https://processing-api.isecure.fi");
  assert.equal(snapshot.paths["/stream"], undefined);
  assert.doesNotMatch(
    JSON.stringify({ snapshot, metadata }),
    /must-not-be-published|arn:aws:|x-amazon/,
  );
  assert.equal(metadata.snapshotSha256, hash(JSON.stringify(snapshot)));
});
for (const key of [
  "accountId",
  "region",
  "stageName",
  "domainName",
  "mappedRestApiId",
  "mappedStage",
  "runtimeRevision",
  "stackRevision",
  "runtimeReleaseId",
  "stackReleaseId",
  "runtimeCodeSha256",
  "runtimeObjectVersion",
  "gatewayObjectVersion",
]) {
  test(`refuse mismatched ${key}`, () => {
    const input = fixture();
    input.binding[key] = "wrong";
    assert.throws(() => productionSource(input));
  });
}
test("refuse artifact tampering, missing routes and changed integration", () => {
  let input = fixture();
  input.gatewayBytes = Buffer.concat([input.gatewayBytes, Buffer.from(" ")]);
  assert.throws(() => productionSource(input));
  input = fixture();
  delete input.deployed.paths["/v1/payment-orders:generate-file"];
  assert.throws(() => productionSource(input), /Live routes differ/);
  input = fixture();
  input.deployed.paths["/session"].post[
    "x-amazon-apigateway-integration"
  ].uri += ":other";
  assert.throws(
    () => productionSource(input),
    /Unexpected production integration/,
  );
});
test("snapshot rejects source drift and unresolved schema dependencies", () => {
  let input = fixture();
  let original = JSON.parse(input.sourceBytes);
  delete original.paths["/v1/payment-orders:generate-file"];
  assert.throws(
    () => buildSnapshot(original, input.deployed),
    /No source match/,
  );
  input = fixture();
  original = JSON.parse(input.sourceBytes);
  original.components.schemas = {};
  assert.throws(() => buildSnapshot(original, input.deployed), /Missing/);
});
