import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
export const source = JSON.parse(read("src/data/platform-api.source.json"));
export const metadata = JSON.parse(
  read("src/data/platform-api.source-metadata.json"),
);
export const sha256 = (value) =>
  createHash("sha256").update(value).digest("hex");
const common = read("src/content/api/common.md");
const security = [{ processingSession: [], tenantApiKey: [] }];
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const tagNames = {
  payment_capabilities: "Account capabilities",
  payment_export_profile_catalog: "Export profiles",
  payment_export_profiles: "Export profiles",
  payment_orders: "Payment drafts",
  payment_approval_requests: "Approval",
  payment_exports: "Payment files",
  simulation_capabilities: "Capabilities",
  simulation_workspaces: "Workspaces and accounts",
  simulation_scenarios: "Scenarios",
  simulation_runs: "Runs",
  simulation_clocks: "Business time",
  simulation_checkpoints: "Checkpoints",
  simulation_branches: "Branches",
  simulation_events: "Events",
  simulation_artifacts: "File references",
};
const copy = {
  "payment_capabilities.list": [
    "List account capabilities",
    "Find the account capabilities visible to your user before creating a payment draft.",
  ],
  "payment_capabilities.get": [
    "Read an account capability",
    "Read the exact capability selected for an account. The server checks authority again when you use it.",
  ],
  "payment_capabilities.resolve": [
    "Select a matching capability",
    "Resolve your payment requirements to an available account capability. Review the result before creating a draft.",
  ],
  "payment_capabilities.explain": [
    "Explain an account capability",
    "Read the reasons and evidence behind this account capability.",
  ],
  "payment_export_profile_catalog.list": [
    "List available export profiles",
    "Discover formats available in this deployment. Listing a profile does not enable it for your tenant.",
  ],
  "payment_export_profiles.get": [
    "Read the configured export profile",
    "Read the current tenant export configuration before preparing or approving a payment file.",
  ],
  "payment_export_profiles.configure": [
    "Configure an export profile",
    "Select an available bank-file profile and its required settings for your tenant. This requires approval authority.",
  ],
  "payment_export_profiles.revoke": [
    "Revoke an export profile",
    "Revoke the selected configuration using its current version. Review dependent work before proceeding.",
  ],
  "payment_orders.create_draft": [
    "Create a payment draft",
    "Start a draft using an exact account capability. You may add payment transfers later while the draft remains open.",
  ],
  "payment_orders.append_transfers": [
    "Add payments to a draft",
    "Append payment transfers to the current draft revision.",
  ],
  "payment_orders.remove_transfers": [
    "Remove payments from a draft",
    "Remove selected transfers from the current draft revision.",
  ],
  "payment_orders.revise_transfer": [
    "Update a payment",
    "Change one transfer in the current draft. Use its latest resource version.",
  ],
  "payment_orders.revise_draft": [
    "Replace a draft",
    "Create the next draft revision with the supplied payment details.",
  ],
  "payment_orders.cancel_draft": [
    "Cancel a draft",
    "Cancel the selected draft. This does not cancel a payment already sent to a bank.",
  ],
  "payment_orders.correct": [
    "Create a correction",
    "Start a correction from the selected payment order. The corrected revision follows the applicable validation and approval process.",
  ],
  "payment_orders.get": [
    "Read a payment order",
    "Read the current order state, references and versions before continuing its workflow.",
  ],
  "payment_orders.list": [
    "List payment orders",
    "List payment orders visible to your user using filters and snapshot pagination.",
  ],
  "payment_orders.explain": [
    "Explain a payment order",
    "Read the reasons and evidence associated with the selected payment order.",
  ],
  "payment_orders.validate": [
    "Check a payment draft",
    "Validate the exact payment-order revision and review any issues before finalizing it.",
  ],
  "payment_orders.simulate": [
    "Evaluate a payment order",
    "Evaluate the selected revision without sending a payment to a bank. This operation does not create a Bank Simulator run.",
  ],
  "payment_orders.finalize_draft": [
    "Finalize a draft",
    "Lock the selected draft revision for review. Later changes require a new eligible revision.",
  ],
  "payment_orders.submit_for_review": [
    "Request payment approval",
    "Submit the finalized revision for the server-assigned approval workflow. Submission is not approval.",
  ],
  "payment_approval_requests.decide": [
    "Record an approval decision",
    "Approve or reject the exact request as its authorized reviewer. The server enforces assigned authority and separation of duties.",
  ],
  "payment_exports.release": [
    "Release an approved payment file",
    "Create the exact export artifact from an eligible approved revision. This does not upload it to a bank.",
  ],
  "payment_exports.get": [
    "Read payment-file metadata",
    "Read the artifact identity, digest, byte length and media type used to verify the subsequent download.",
  ],
  "payment_exports.download_content": [
    "Download the payment file",
    "Download the exact XML bytes. Use the SDK with previously read artifact authority to verify identity, digest, media type and length before signing.",
  ],
  "simulation_capabilities.list": [
    "List simulator capabilities",
    "Discover supported profiles, clock modes and quotas before configuring a synthetic test.",
  ],
  "simulation_workspaces.list": [
    "List workspaces",
    "List synthetic workspaces visible to your user with optional state filters and pagination.",
  ],
  "simulation_workspaces.get": [
    "Read a workspace",
    "Read a workspace using its complete resource reference, including a revision when selecting an exact historical revision.",
  ],
  "simulation_workspaces.create": [
    "Create a workspace and accounts",
    "Define synthetic banks, legal entities, accounts, opening balances, currencies and service setup in a new draft workspace.",
  ],
  "simulation_workspaces.revise": [
    "Revise workspace configuration",
    "Create a new workspace revision with updated synthetic configuration. Supply the current version to avoid overwriting another change.",
  ],
  "simulation_workspaces.activate": [
    "Activate a workspace",
    "Make an eligible draft workspace available for simulation runs after reviewing its configuration.",
  ],
  "simulation_workspaces.suspend": [
    "Suspend a workspace",
    "Suspend the selected workspace through its governed lifecycle. Check the returned state before starting further work.",
  ],
  "simulation_workspaces.close": [
    "Close a workspace",
    "Close the selected workspace through its lifecycle. This is not an instruction to erase past test evidence.",
  ],
  "simulation_workspaces.reset": [
    "Reset a workspace",
    "Apply the requested supported reset to the exact workspace version. Review the reset mode and retained evidence before sending.",
  ],
  "simulation_scenarios.list": [
    "List scenarios",
    "Find reusable synthetic response scenarios visible to your user.",
  ],
  "simulation_scenarios.get": [
    "Read a scenario",
    "Read the exact scenario reference selected for a test.",
  ],
  "simulation_scenarios.create": [
    "Create a scenario",
    "Define supported synthetic responses, timing and behavior using the discovered capabilities.",
  ],
  "simulation_scenarios.revise": [
    "Revise a scenario",
    "Create a new scenario revision. Existing runs remain associated with the exact revision they selected.",
  ],
  "simulation_runs.list": [
    "List runs",
    "Find runs and inspect their current state using the available filters.",
  ],
  "simulation_runs.get": [
    "Read a run",
    "Read a run to follow accepted work to completion or failure. A start response alone does not mean the work has finished.",
  ],
  "simulation_runs.start": [
    "Start a simulation run",
    "Start work using exact workspace and scenario references plus admitted synthetic input. Persist the command key before sending.",
  ],
  "simulation_clocks.control": [
    "Control simulated business time",
    "Apply a supported clock action for schedules and cutoffs. This clock cannot change authentication or subscription expiry.",
  ],
  "simulation_checkpoints.create": [
    "Create a checkpoint",
    "Save an eligible simulation state for a repeatable comparison. The returned checkpoint is an opaque reference.",
  ],
  "simulation_branches.create": [
    "Create a branch",
    "Start a separate experiment from an eligible checkpoint while keeping the original evidence distinct.",
  ],
  "simulation_events.list": [
    "Read simulation events",
    "Read recorded observations for the selected scope. Paginate through the returned snapshot to reconcile a run.",
  ],
  "simulation_artifacts.list": [
    "List simulation file references",
    "Find references to exact synthetic input and output files. Download their bytes through the independently authorized [File Exchange API](https://www.isecure.fi/wsapi_v2/#operation/DownloadFile).",
  ],
};
const sdkNames = {
  payment_orders: "paymentBatches",
  payment_capabilities: "paymentCapabilities",
  payment_approval_requests: "paymentApprovalRequests",
  payment_export_profile_catalog: "paymentExportProfiles",
  payment_export_profiles: "paymentExportProfiles",
  payment_exports: "paymentExports",
};
const sdkMethods = {
  append_transfers: "addPayments",
  remove_transfers: "removePayments",
  revise_transfer: "updatePayment",
  revise_draft: "replaceDraft",
  finalize_draft: "finalize",
  correct: "createCorrection",
  download_content: "download",
};
const camel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
export function sdkCall(id) {
  const [group, method] = id.split(".");
  return `${sdkNames[group] ?? camel(group)}.${sdkMethods[method] ?? camel(method)}`;
}

// The source generator can repeat identical issue alternatives. A duplicate oneOf
// would reject every matching error; publish its single equivalent schema instead.
function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (!value || typeof value !== "object") return value;
  const result = Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, normalize(v)]),
  );
  if (result.oneOf) {
    result.oneOf = [
      ...new Map(result.oneOf.map((v) => [JSON.stringify(v), v])).values(),
    ];
    if (result.oneOf.length === 1) {
      const only = result.oneOf[0];
      delete result.oneOf;
      return { ...result, ...only };
    }
  }
  return result;
}
// Public API Gateway-facing tooling uses OpenAPI 3.0. The pinned source uses
// 3.1 const constraints; represent those as single-value enums without weakening them.
export function toOpenApi30(value) {
  if (Array.isArray(value)) return value.map(toOpenApi30);
  if (!value || typeof value !== "object") return value;
  const converted = Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, toOpenApi30(v)]),
  );
  for (const keyword of [
    "$defs",
    "$schema",
    "$id",
    "unevaluatedProperties",
    "prefixItems",
    "if",
    "then",
    "else",
    "dependentSchemas",
    "dependentRequired",
  ]) {
    if (Object.hasOwn(converted, keyword))
      throw new Error(`Unreviewed OpenAPI 3.1 keyword: ${keyword}`);
  }
  if (Array.isArray(converted.type) || converted.type === "null")
    throw new Error("Unreviewed nullable schema conversion");
  if (Object.hasOwn(converted, "const")) {
    if (
      converted.enum &&
      !converted.enum.some(
        (v) => JSON.stringify(v) === JSON.stringify(converted.const),
      )
    )
      throw new Error("Inconsistent const/enum constraint");
    converted.enum = [converted.const];
    delete converted.const;
  }
  if (converted.$ref && Object.keys(converted).length > 1) {
    const reference = converted.$ref;
    delete converted.$ref;
    return { allOf: [{ $ref: reference }], ...converted };
  }
  return converted;
}
export function schemaClosure(value, available) {
  const schemas = {};
  function visit(node) {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!node || typeof node !== "object") return;
    if (node.$ref) {
      const prefix = "#/components/schemas/";
      if (!node.$ref.startsWith(prefix))
        throw new Error(`Unsupported reference ${node.$ref}`);
      const name = node.$ref.slice(prefix.length);
      if (!Object.hasOwn(schemas, name)) {
        if (!available[name]) throw new Error(`Missing schema ${name}`);
        schemas[name] = normalize(available[name]);
        visit(schemas[name]);
      }
    }
    Object.values(node).forEach(visit);
  }
  visit(value);
  return Object.fromEntries(
    Object.entries(schemas).sort(([a], [b]) => a.localeCompare(b)),
  );
}
function sample(id) {
  const m = source.operations[id];
  const method = sdkCall(id);
  const options = [];
  if (m.idempotency === "required")
    options.push("idempotencyKey: savedCommandKey");
  if (m.expectedVersion === "required")
    options.push(
      "expectedResourceVersion: JSON.stringify(currentResourceVersion)",
    );
  if (
    id === "payment_export_profile_catalog.list" ||
    id === "payment_export_profiles.get"
  )
    return `const result = await client.${method}();`;
  if (id === "simulation_capabilities.list")
    return 'const result = await client.simulationCapabilities.list({\n  data_admission_mode: "synthetic",\n  page: { page_size: 25 },\n});';
  if (id === "simulation_workspaces.list")
    return "const result = await client.simulationWorkspaces.list({ page: { page_size: 25 } });";
  const lines = [
    "// Use the authenticated client from the introduction.",
    `// Supply the fields shown in ${m.input.split(".").at(-1)}.`,
    `declare const input: Parameters<typeof client.${method}>[0];`,
  ];
  if (m.idempotency === "required")
    lines.push(
      "// Persist one key per intended command; reuse it only for that same command.",
      "declare const savedCommandKey: string;",
    );
  if (m.expectedVersion === "required")
    lines.push(
      "// Use the version returned by your latest authorized read.",
      "declare const currentResourceVersion: string;",
    );
  const authority =
    id === "payment_exports.download_content" ? ", artifactAuthority" : "";
  if (authority)
    lines.push(
      "declare const artifactAuthority: Parameters<typeof client.paymentExports.download>[1];",
    );
  lines.push(
    `const result = await client.${method}(input${authority}${options.length ? `, { ${options.join(", ")} }` : ""});`,
  );
  return lines.join("\n");
}
const codeEnvelope = {
  type: "object",
  description:
    "Safe host or gateway failure. Code values identify the failure without exposing customer data.",
  properties: {
    code: { type: "string" },
    schemaVersion: { type: "integer", const: 1 },
  },
  required: ["code", "schemaVersion"],
  additionalProperties: false,
};
function response(description, schema) {
  return { description, content: { "application/json": { schema } } };
}
const session = {
  post: {
    operationId: "processing_session.exchange",
    summary: "Create a Processing session",
    tags: ["Session"],
    description:
      "Exchange the current File Exchange ID token for a separate, audience-bound Processing session. Send the ID token without a prefix in Authorization and the tenant API key in x-api-key. There is no request body. Complete any login verification or MFA first. The session expires after 15 minutes.",
    security: [{ bootstrapIdToken: [], tenantApiKey: [] }],
    responses: {
      200: response(
        "Keep processingSession private; validate the audience and expiry before use.",
        ref("ProcessingSession"),
      ),
      400: response(
        "Invalid session exchange request.",
        ref("ProcessingError"),
      ),
      401: response("Invalid or expired ID token.", ref("ProcessingError")),
      403: response("Tenant access is not enabled.", ref("ProcessingError")),
      503: response("Session service is unavailable.", ref("ProcessingError")),
    },
    "x-codeSamples": [
      {
        lang: "ts",
        label: "TypeScript SDK",
        source:
          "const session = await transport.exchangeProcessingSession();\n// Returns expiry and audience metadata; the transport keeps the token private.",
      },
    ],
  },
};
const stream = {
  get: {
    operationId: "processing_events.stream",
    summary: "Read event notifications",
    tags: ["Notifications"],
    description:
      "Receive a bounded text/event-stream connection. The current lease is at most 20 seconds. Event and task items contain an opaque id and JSON data; heartbeats keep the connection active. Reconnect deliberately with the last completely handled ID, and reconcile resource state after a gap. Additional event/task read authority is required. This is not complete audit history.",
    security,
    parameters: [
      {
        name: "ISECure-Contract-Version",
        in: "header",
        required: true,
        schema: { type: "integer", const: 1 },
      },
      {
        name: "Last-Event-ID",
        in: "header",
        required: false,
        description:
          "Opaque cursor from the last completely handled stream item.",
        schema: { type: "string", maxLength: 2048 },
      },
    ],
    responses: {
      200: {
        description:
          "Finite SSE lease. Cache-Control: private, no-store, no-cache.",
        content: {
          "text/event-stream": {
            schema: { type: "string" },
            example: ": heartbeat\n\n",
          },
        },
      },
      400: response("Invalid cursor or request.", ref("ProcessingError")),
      401: response("Processing session is invalid.", ref("ProcessingError")),
      403: response(
        "Required read authority is missing.",
        ref("ProcessingError"),
      ),
      503: response("Notifications are unavailable.", ref("ProcessingError")),
    },
    "x-codeSamples": [
      {
        lang: "ts",
        label: "TypeScript SDK",
        source:
          'for await (const item of transport.streamProcessingEvents()) {\n  if (item.kind === "heartbeat") continue;\n  // Handle item.data, then save item.id for your next connection.\n}',
      },
    ],
  },
};
export function buildSpec(kind) {
  const simulator = kind === "bank-simulator";
  const name = simulator ? "Bank Simulator API" : "Processing API";
  const paths = {
    "/session": structuredClone(session),
    "/stream": structuredClone(stream),
  };
  for (const [path, item] of Object.entries(source.paths)) {
    for (const [method, original] of Object.entries(item)) {
      const id = original.operationId;
      if (id.startsWith("simulation_") !== simulator) continue;
      const meta = source.operations[id];
      const op = normalize(original);
      const [summary, description] = copy[id] ?? [];
      if (!summary) throw new Error(`Missing editorial review for ${id}`);
      op.summary = summary;
      op.tags = [tagNames[id.split(".")[0]]];
      op.security = security;
      op.description = `${description}\n\nRequired permission: \`${meta.permission}\`, plus an active ${simulator ? "Bank Simulation" : "Processing"} subscription. The server checks account/resource scope on every call.\n\nSend \`ISECure-Contract-Version: ${meta.version}\`. ${meta.idempotency === "required" ? "Persist an Idempotency-Key for this command." : "This operation does not accept an Idempotency-Key."} ${meta.expectedVersion === "required" ? "Send the current resource version in If-Match." : ""}\n\nSDK: \`client.${sdkCall(id)}\`. Input type: [${meta.input.split(".").at(-1)}](#schema/${meta.input}).`;
      op["x-codeSamples"] = [
        { lang: "ts", label: "TypeScript SDK", source: sample(id) },
      ];
      op["x-isecure-contract-version"] = meta.version;
      op["x-isecure-contract-digest"] = meta.contractDigest;
      op["x-isecure-permission"] = meta.permission;
      for (const [status, r] of Object.entries(op.responses)) {
        if (Number(status) >= 400) {
          const existing = r.content?.["application/json"]?.schema;
          r.content = {
            "application/json": {
              schema: existing
                ? { anyOf: [existing, ref("ProcessingError")] }
                : ref("ProcessingError"),
            },
          };
        }
      }
      for (const [status, description] of Object.entries({
        429: "Request rate limit reached.",
        503: "Service unavailable or outcome unknown. Reconcile state before retrying.",
        504: "Gateway timeout; the command outcome may be unknown.",
      }))
        op.responses[status] ??= response(description, ref("ProcessingError"));
      op.responses.default = {
        description:
          "An upstream gateway may return another error shape. Inspect HTTP status and do not parse it as a successful result.",
        content: {
          "application/json": {
            schema: { type: "object", additionalProperties: true },
          },
        },
      };
      paths[path] = { [method]: op };
    }
  }
  const extra = {
    ProcessingError: codeEnvelope,
    ProcessingSession: {
      type: "object",
      properties: {
        audience: { type: "string", const: metadata.audience },
        expiresAtEpochSeconds: {
          type: "integer",
          description: "UTC expiry as Unix seconds.",
        },
        processingSession: {
          type: "string",
          readOnly: true,
          description:
            "Secret opaque credential. Use only in the Authorization header with the Processing prefix.",
        },
        schemaVersion: { type: "integer", const: 1 },
        tokenType: { type: "string", const: "Processing" },
      },
      required: [
        "audience",
        "expiresAtEpochSeconds",
        "processingSession",
        "schemaVersion",
        "tokenType",
      ],
      additionalProperties: false,
    },
  };
  const used = Object.values(paths)
    .flatMap((p) => Object.values(p))
    .filter((o) => source.operations[o.operationId]);
  const schemas = schemaClosure(
    [paths, ...used.map((o) => ref(source.operations[o.operationId].input))],
    { ...source.components.schemas, ...extra },
  );
  const tags = [
    ...new Set(
      Object.values(paths)
        .flatMap((p) => Object.values(p))
        .flatMap((o) => o.tags),
    ),
  ];
  return toOpenApi30({
    openapi: "3.0.3",
    info: {
      title: `ISECure ${name}`,
      version: source.info.version,
      description:
        read(`src/content/api/${kind}.md`) +
        "\n\n" +
        common +
        (simulator ? read("src/content/api/simulator-workflow.md") : ""),
      contact: {
        name: "ISECure developer support",
        email: "support@isecure.fi",
        url: "https://www.isecure.fi/en/products/",
      },
      license: { name: "Proprietary - all rights reserved" },
    },
    servers: [
      {
        url: metadata.baseUrl,
        description:
          "ISECure test environment — Experimental; access by request",
      },
    ],
    tags: tags.map((name) => ({ name })),
    paths,
    components: {
      securitySchemes: {
        tenantApiKey: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description:
            "Verified tenant API key; the same key used during session exchange.",
        },
        bootstrapIdToken: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
          description:
            "Current File Exchange ID token, without a prefix. Used only for POST /session.",
        },
        processingSession: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
          description:
            "Processing followed by one space and the opaque processingSession from POST /session. This is not Bearer authentication.",
        },
      },
      schemas,
    },
    externalDocs: {
      description: "Official TypeScript SDK",
      url: "https://github.com/isecurefi/isecure-ts-client",
    },
    "x-isecure-source": {
      revision: metadata.repositoryRevision,
      sha256: metadata.sourceSha256,
      deployment: metadata.releaseId,
      verifiedAt: metadata.verifiedAt,
    },
    "x-tagGroups": [
      { name: "Getting started", tags: ["Session"] },
      {
        name: name,
        tags: tags.filter((t) => t !== "Session" && t !== "Notifications"),
      },
      { name: "Notifications", tags: ["Notifications"] },
    ],
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const kind of ["processing", "bank-simulator"]) {
    const spec = buildSpec(kind);
    writeFileSync(
      new URL(`src/data/${kind}.openapi.json`, root),
      JSON.stringify(spec, null, 2) + "\n",
    );
    console.log(
      `${kind}: ${Object.keys(spec.paths).length} operations, ${Object.keys(spec.components.schemas).length} schemas`,
    );
  }
}
