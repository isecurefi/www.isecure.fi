const operations = new Set([
  "ListKeys",
  "UploadKey",
  "ListAccounts",
  "ConfigureBankPgpPolicy",
  "BlockBankPgpPolicy",
  "DeletePgpKey",
  "LockPgpPolicy",
  "RequestActionMfa",
]);
export function validatePgpPolicy(spec) {
  const errors = [];
  if (
    spec.swagger !== "2.0" ||
    spec.host !== "ws-api.isecure.fi" ||
    spec.basePath !== "/v2"
  )
    errors.push("PGP reference must target verified production V2");
  if (spec.schemes?.join() !== "https") errors.push("HTTPS is required");
  if (spec.paths?.["/pgp/policy"])
    errors.push("Whole-policy replacement is retired");
  const actual = [];
  for (const methods of Object.values(spec.paths ?? {}))
    for (const op of Object.values(methods)) {
      actual.push(op.operationId);
      if (
        JSON.stringify(op.security) !==
        JSON.stringify([{ "X-Api-Key": [], Authorizer: [] }])
      )
        errors.push("Both credentials are required");
      if (
        !op["x-code-samples"]?.some(
          (s) => s.lang === "TypeScript" && s.source.includes("client."),
        )
      )
        errors.push("SDK sample missing");
    }
  if (
    actual.length !== operations.size ||
    actual.some((id) => !operations.has(id))
  )
    errors.push("Unexpected companion operation set");
  const request = spec.definitions?.ConfigureBankPgpPolicyReq;
  if (
    !request?.properties?.RequiredSignerFingerprints ||
    !request?.required?.includes("ExpectedRevision")
  )
    errors.push("Required-signer fields or revision missing");
  for (const field of ["ExpectedRevision", "AccessToken", "MfaType", "Code"])
    if (!spec.definitions?.LockPgpPolicyReq?.required?.includes(field))
      errors.push("Lock factor requirement missing");
  function walk(v) {
    if (Array.isArray(v)) return v.forEach(walk);
    if (!v || typeof v !== "object") return;
    if (
      v.$ref &&
      (!v.$ref.startsWith("#/definitions/") ||
        !spec.definitions?.[v.$ref.slice(14)])
    )
      errors.push(`Unresolved reference ${v.$ref}`);
    for (const [k, child] of Object.entries(v)) {
      if (k.startsWith("x-amazon-"))
        errors.push("Infrastructure metadata must not be published");
      walk(child);
    }
  }
  walk(spec);
  return errors;
}
