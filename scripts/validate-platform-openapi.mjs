import Ajv from "ajv";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildSpec,
  source,
  metadata,
  sha256,
  schemaClosure,
  toOpenApi30,
} from "./platform-api-docs.mjs";
const require = createRequire(import.meta.url);
const ajv = new Ajv({ schemaId: "auto", allErrors: true, jsonPointers: true });
ajv.addMetaSchema(require("ajv/lib/refs/json-schema-draft-04.json"));
const validateStandard = ajv.compile(
  JSON.parse(
    readFileSync(
      new URL("./schemas/openapi-3.0.json", import.meta.url),
      "utf8",
    ),
  ),
);
assert.match(metadata.repositoryRevision, /^[a-f0-9]{40}$/);
assert.match(metadata.sourceSha256, /^[a-f0-9]{64}$/);
assert.equal(
  metadata.snapshotSha256,
  sha256(JSON.stringify(source)),
  "Pinned source snapshot changed; perform an explicit release sync",
);
assert.equal(Object.keys(source.operations).length, metadata.operationCount);
for (const [kind, count] of [
  ["processing", 26],
  ["bank-simulator", 21],
]) {
  const expected = buildSpec(kind);
  assert.ok(
    validateStandard(expected),
    `${kind} does not validate as OpenAPI 3.0: ${JSON.stringify(validateStandard.errors)}`,
  );
  const committed = JSON.parse(
    readFileSync(
      new URL(`../src/data/${kind}.openapi.json`, import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(
    committed,
    expected,
    `${kind} docs drift: run yarn api:generate:products`,
  );
  assert.equal(expected.openapi, "3.0.3");
  assert.equal(Object.keys(expected.paths).length, count + 2);
  const ids = new Set();
  for (const [path, item] of Object.entries(expected.paths))
    for (const [method, op] of Object.entries(item)) {
      assert.ok(!ids.has(op.operationId), "Duplicate operation");
      ids.add(op.operationId);
      assert.ok(
        op.summary && op.description && Object.keys(op.responses).length,
      );
      assert.ok(
        op["x-codeSamples"]?.some(
          (s) => s.lang === "ts" && s.source.includes("await "),
        ),
        "SDK-native sample missing",
      );
      assert.deepEqual(
        op.security,
        [
          path === "/session"
            ? { bootstrapIdToken: [], tenantApiKey: [] }
            : { processingSession: [], tenantApiKey: [] },
        ],
        "Both authentication and API key are required",
      );
      if (path === "/session" || path === "/stream") continue;
      assert.equal(source.paths[path]?.[method]?.operationId, op.operationId);
      assert.equal(
        op.operationId.startsWith("simulation_"),
        kind === "bank-simulator",
      );
      assert.deepEqual(
        op.parameters,
        toOpenApi30(source.paths[path][method].parameters),
        "Do not change the deployed parameter contract",
      );
      assert.deepEqual(
        op.requestBody,
        toOpenApi30(source.paths[path][method].requestBody),
        "Do not change the deployed request body",
      );
    }
  schemaClosure(expected.paths, expected.components.schemas);
  const text = JSON.stringify(expected);
  assert.ok(
    !/x-amazon-|arn:aws:|\.private\/|\/Users\/|BEGIN .*PRIVATE KEY/.test(text),
    "Infrastructure or private material in public document",
  );
  for (const op of [
    "InitRegister",
    "Register",
    "Login",
    "LoginMFA",
    "ListAccounts",
    "DeleteAccount",
  ])
    assert.ok(
      expected.info.description.includes(
        `https://www.isecure.fi/wsapi_v2/#operation/${op}`,
      ),
      "Shared identity link missing",
    );
  assert.ok(expected.info.description.includes("separate Processing session"));
  console.log(
    `PASS ${kind}: OpenAPI 3.0, ${count} product operations + session/stream, pinned source, closed schema references, shared identity links and SDK examples`,
  );
}
