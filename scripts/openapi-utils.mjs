const HTTP_METHODS = new Set([
  "delete",
  "get",
  "head",
  "options",
  "patch",
  "post",
  "put",
]);

export function validateOpenApi(spec) {
  const errors = [];

  if (!spec || typeof spec !== "object" || Array.isArray(spec)) {
    return ["The document root must be a JSON object"];
  }

  if (spec.swagger !== "2.0") errors.push('Expected swagger to equal "2.0"');
  if (!spec.info?.title) errors.push("Missing info.title");
  if (!spec.info?.version) errors.push("Missing info.version");
  if (spec.host !== "ws-api.isecure.fi") {
    errors.push('Expected host to equal "ws-api.isecure.fi"');
  }
  if (spec.basePath !== "/v2") errors.push('Expected basePath to equal "/v2"');
  if (!Array.isArray(spec.schemes) || !spec.schemes.includes("https")) {
    errors.push('The API must advertise the "https" scheme');
  }
  if (spec.schemes?.some((scheme) => scheme !== "https")) {
    errors.push("The API must not advertise an insecure scheme");
  }
  if (!spec.securityDefinitions?.Authorizer) {
    errors.push("Missing Authorizer security definition");
  }
  if (!spec.securityDefinitions?.["X-Api-Key"]) {
    errors.push("Missing X-Api-Key security definition");
  }

  const listCerts = spec.paths?.["/certs"]?.get;
  const listCertsResponse = spec.definitions?.ListCertsResp;
  const connection = spec.definitions?.BankConnectionDescriptor;
  const connectionCertificate =
    spec.definitions?.BankConnectionCertificateDescriptor;
  if (
    listCertsResponse?.properties?.Connections?.items?.["$ref"] !==
    "#/definitions/BankConnectionDescriptor"
  ) {
    errors.push("ListCerts must expose typed bank Connections");
  }
  if (listCertsResponse?.required?.includes("Connections")) {
    errors.push("ListCerts Connections must remain additive and optional");
  }
  if (connection?.properties?.Access?.enum?.join(",") !== "direct,shared") {
    errors.push("Bank connection Access must be closed to direct or shared");
  }
  if (
    connectionCertificate?.properties?.Purpose?.enum?.join(",") !==
    "signing,encryption"
  ) {
    errors.push(
      "Bank connection certificate Purpose must be closed to signing or encryption",
    );
  }
  if (
    !listCerts?.description?.includes(
      "without exposing the linked owner or shared certificate material",
    )
  ) {
    errors.push("ListCerts must state its shared-certificate privacy boundary");
  }
  if (
    spec.definitions?.LoginMFAReq?.properties?.SetupTOTP?.type !== "boolean"
  ) {
    errors.push("LoginMFA SetupTOTP must be a boolean");
  }

  const operationIds = new Set();
  let operationCount = 0;

  for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
    if (!path.startsWith("/")) errors.push(`Invalid path key: ${path}`);

    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (!HTTP_METHODS.has(method)) continue;
      operationCount += 1;
      const label = `${method.toUpperCase()} ${path}`;

      if (!operation?.operationId) {
        errors.push(`${label} is missing operationId`);
      } else if (operationIds.has(operation.operationId)) {
        errors.push(`Duplicate operationId: ${operation.operationId}`);
      } else {
        operationIds.add(operation.operationId);
      }
      if (!operation?.summary) errors.push(`${label} is missing summary`);
      if (!operation?.description)
        errors.push(`${label} is missing description`);
      if (!Array.isArray(operation?.tags) || operation.tags.length === 0) {
        errors.push(`${label} is missing a tag`);
      }
      if (
        !operation?.responses ||
        Object.keys(operation.responses).length === 0
      ) {
        errors.push(`${label} is missing responses`);
      }
      for (const [status, response] of Object.entries(
        operation?.responses ?? {},
      )) {
        if (!response?.description) {
          errors.push(`${label} response ${status} is missing a description`);
        }
      }
    }
  }

  if (operationCount === 0) errors.push("The document has no API operations");
  if (!spec.definitions || Object.keys(spec.definitions).length === 0) {
    errors.push("The document has no schema definitions");
  }

  return errors;
}

export function summarizeOpenApi(spec) {
  let operationCount = 0;
  for (const pathItem of Object.values(spec.paths ?? {})) {
    operationCount += Object.keys(pathItem ?? {}).filter((method) =>
      HTTP_METHODS.has(method),
    ).length;
  }

  return {
    definitionCount: Object.keys(spec.definitions ?? {}).length,
    operationCount,
    version: spec.info?.version ?? "unknown",
  };
}
