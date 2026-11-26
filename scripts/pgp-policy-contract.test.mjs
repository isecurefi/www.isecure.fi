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
test("the pinned production PGP reference is complete", () =>
  assert.deepEqual(validatePgpPolicy(snapshot()), []));
test("a docs sync must not regress the production reference to RC", () => {
  const spec = snapshot();
  spec.basePath = "/rc";
  assert(
    validatePgpPolicy(spec).some((message) =>
      message.includes("verified production V2"),
    ),
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
test("main V2 reference includes the same deployed PGP contract and account projection", () => {
  const main = JSON.parse(
    readFileSync(new URL("../src/data/wsapi_v2.json", import.meta.url), "utf8"),
  );
  const pgp = snapshot();
  for (const [path, methods] of Object.entries(pgp.paths)) {
    if (!path.startsWith("/pgp/")) continue;
    for (const [method, operation] of Object.entries(methods)) {
      assert.deepEqual(
        main.paths[path]?.[method],
        operation,
        `${method} ${path}`,
      );
    }
  }
  assert.deepEqual(
    main.definitions.AccountDescriptor.properties.PgpAuthorization,
    pgp.definitions.AccountDescriptor.properties.PgpAuthorization,
  );
  assert.equal(main.paths["/pgp/policy"], undefined);
});
