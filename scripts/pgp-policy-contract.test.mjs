import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { validatePgpPolicy } from "./pgp-policy-contract.mjs";
const snapshot = () =>
  JSON.parse(
    readFileSync(
      new URL("../src/data/pgp-policy.openapi.json", import.meta.url),
      "utf8",
    ),
  );
test("the pinned Test/RC companion is complete", () =>
  assert.deepEqual(validatePgpPolicy(snapshot()), []));
test("a docs sync must not promote policy operations to V2", () => {
  const spec = snapshot();
  spec.basePath = "/v2";
  assert(
    validatePgpPolicy(spec).some((message) => message.includes("never V2")),
  );
});
test("a docs sync must preserve mandatory signers, both credentials and fresh lock factors", () => {
  const spec = snapshot();
  delete spec.definitions.ConfigureBankPgpPolicyReq.properties
    .RequiredSignerFingerprints;
  spec.definitions.LockPgpPolicyReq.required = ["ExpectedRevision"];
  spec.paths["/pgp/keys"].delete.security = [
    { Authorizer: [] },
    { "X-Api-Key": [] },
  ];
  const errors = validatePgpPolicy(spec);
  assert(errors.includes("Required-signer fields or revision missing"));
  assert(errors.includes("Both credentials are required"));
  assert(errors.includes("Lock factor requirement missing"));
});
