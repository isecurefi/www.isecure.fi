import test from "node:test";
import assert from "node:assert/strict";
import { buildSpec, schemaClosure, toOpenApi30 } from "./platform-api-docs.mjs";
test("public schemas exclude unrelated private and future platform operations", () => {
  for (const kind of ["processing", "bank-simulator"]) {
    const spec = buildSpec(kind);
    assert.ok(
      !Object.keys(spec.paths).some((p) =>
        /agent-|module-|\/balances|\/statements/.test(p),
      ),
    );
    assert.ok(
      !Object.keys(spec.components.schemas).some((p) =>
        /agent_runtime|fundraising|company_tax/.test(p),
      ),
    );
    assert.equal(
      spec.components.schemas.ProcessingSession.properties.processingSession
        .readOnly,
      true,
    );
  }
});
test("schema closure fails instead of publishing unresolved references", () => {
  assert.throws(
    () => schemaClosure({ $ref: "#/components/schemas/Missing" }, {}),
    /Missing schema/,
  );
  assert.throws(
    () => schemaClosure({ $ref: "https://unreviewed.example/schema" }, {}),
    /Unsupported reference/,
  );
});
test("payment download retains XML and integrity headers", () => {
  const op =
    buildSpec("processing").paths["/v1/payment-exports:download-content"].post;
  assert.ok(op.responses["200"].content["application/xml"]);
  for (const name of [
    "ISECure-Artifact-Id",
    "ISECure-Artifact-Sha256",
    "Content-Length",
  ])
    assert.ok(op.responses["200"].headers[name]);
});
test("revision examples quote If-Match and errors accept host envelopes", () => {
  const op =
    buildSpec("bank-simulator").paths["/v1/simulation-workspaces:activate"]
      .post;
  assert.match(
    op["x-codeSamples"][0].source,
    /expectedResourceVersion: JSON.stringify/,
  );
  assert.ok(
    op.responses["412"].content["application/json"].schema.anyOf.some(
      (s) => s.$ref === "#/components/schemas/ProcessingError",
    ),
  );
});

test("OpenAPI 3.0 conversion preserves exact values and rejects unsupported schemas", () => {
  assert.deepEqual(toOpenApi30({ type: "integer", const: 4 }), {
    type: "integer",
    enum: [4],
  });
  assert.deepEqual(
    toOpenApi30({ $ref: "#/components/schemas/A", description: "A reference" }),
    { allOf: [{ $ref: "#/components/schemas/A" }], description: "A reference" },
  );
  assert.throws(() => toOpenApi30({ type: ["string", "null"] }), /nullable/);
  assert.throws(() => toOpenApi30({ const: 4, enum: [5] }), /Inconsistent/);
  for (const kind of ["processing", "bank-simulator"]) {
    const spec = buildSpec(kind);
    assert.equal(spec.openapi, "3.0.3");
    assert.ok(!JSON.stringify(spec).includes('"const":'));
    assert.equal(spec.servers[0].url, "https://processing-api.test.isecure.fi");
  }
});
