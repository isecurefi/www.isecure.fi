import type { APIRoute } from "astro";

import { sourceSpec } from "../lib/api-docs-source";

export const prerender = true;

type PublishedSpec = typeof sourceSpec & {
  externalDocs: { description: string; url: string };
  tags: Array<{ name: string; description: string }>;
  "x-tagGroups": Array<{ name: string; tags: string[] }>;
};

type PublishedOperation = {
  operationId?: string;
  description?: string;
  parameters?: Array<{ name: string; description?: string }>;
  "x-code-samples"?: Array<{
    lang?: string;
    label?: string;
    source: string;
  }>;
};

const HTTP_METHODS = new Set([
  "delete",
  "get",
  "head",
  "options",
  "patch",
  "post",
  "put",
]);

const TYPESCRIPT_SDK_URL = "https://github.com/isecurefi/isecure-ts-client";
const BANK_SIMULATOR_GUIDE_URL = "https://www.isecure.fi/en/bank-simulator/";
const TYPESCRIPT_SDK_SAMPLES: Record<string, string> = {
  InitRegister: `// register() retrieves and answers the registration challenge.
const registration = await client.register();`,
  VerifyEmail: `// After needs_email_verification; the client retains its AccessToken.
const result = await client.verifyEmail("123456");
if (result.status === "verification_accepted") {
  const next = await client.login(); // Fresh login; complete admin MFA again.
}`,
  Register: `const registration = await client.register();
console.log(registration.ApiKey);`,
  InitPasswordReset: `// Requests the recovery code; this does not return an encryption challenge.
const result = await client.initPasswordReset();
if (result.ResponseCode !== "00") throw new Error(result.ResponseText);`,
  PasswordReset: `import { AxiosTransport, type InitLoginResponse } from "isecure-ts-client";

// First call initPasswordReset() and ask the user for the recovery code.
// Then request a fresh InitLogin challenge for password encryption.
const { BaseUrl, Email, Mode } = client.props;
const base = BaseUrl.replace(/\\/+$/, "");
const { data } = await new AxiosTransport().request<InitLoginResponse>({
  method: "GET",
  url: base + "/session/" + encodeURIComponent(Email) + "/" + Mode,
});
if (data.ResponseCode !== "00" || !data.Challenge) {
  throw new Error(data.ResponseText || "Missing password encryption challenge");
}
const newPassword = process.env.ISECURE_NEW_PASSWORD!;
const result = await client.passwordReset(
  "123456",
  newPassword,
  data.Challenge,
);
if (result.ResponseCode !== "00") throw new Error(result.ResponseText);
client.updateProps({ Password: newPassword });
const state = await client.login(); // Complete any returned MFA challenge.`,
  VerifyPhone: `// Use the registration SMS code, not a login MFA code.
const result = await client.verifyPhone("123456");
if (result.status === "verification_accepted") {
  const next = await client.login(); // The login SMS is a different code.
}`,
  ListCerts: `const { Connections = [] } = await client.listCerts();
for (const connection of Connections) {
  console.log(connection.Bank, connection.Access, connection.Certificates);
}`,
  ConfigCerts: `const result = await client.configCerts({ Export: "disabled" });`,
  UnshareCerts: `const result = await client.unshareCerts("customer@example.com");`,
  ShareCerts: `const result = await client.shareCerts("customer@example.com");`,
  ExportCert: `const exported = await client.exportCert("3A3A59B2");`,
  EnrollCert: `const certificate = await client.enrollCert({
  Code: process.env.BANK_ENROLLMENT_CODE!,
  Company: "EXAMPLE COMPANY OY",
  WsUserId: process.env.BANK_WS_USER_ID!,
});`,
  ImportCert: `const certificate = await client.importCert({
  Company: "EXAMPLE COMPANY OY",
  WsUserId: process.env.BANK_WS_USER_ID!,
  PrivateKey: process.env.BANK_PRIVATE_KEY_PEM!,
  Certificate: process.env.BANK_CERTIFICATE_PEM!,
});`,
  ListFiles: `const files = await client.listFiles({ Status: "ALL" });`,
  UploadFile: `const result = await client.uploadFile({
  FileContents: "<base64-encoded ISO 20022 XML>",
  FileName: "payment.xml",
  FileType: "pain.001.001.03",
  Signature: "<detached PGP signature>",
});`,
  DeleteFile: `const result = await client.deleteFile(
  "pain.001.001.03",
  "file-reference",
);`,
  DownloadFile: `const file = await client.downloadFile(
  "camt.053.001.02",
  "file-reference",
);`,
  ListAccounts: `const accounts = await client.listAccounts();`,
  ListAuditEvents: `// WS API 2.12.0: available in production and the test environment.
// Integrators see their tenant; customers see only their own account.
const query = { Limit: 50 };
const first = await client.listAuditEvents(query);
console.log(first.Events);
if (first.NextToken) {
  // Fetch another page on demand, even if the previous page was empty.
  const next = await client.listAuditEvents({ ...query, NextToken: first.NextToken });
  console.log(next.Events);
}`,
  DeleteKey: `const result = await client.deleteKey("DBCBE671");`,
  ListKeys: `const keys = await client.listKeys();`,
  UploadKey: `const result = await client.uploadPgpKey(
  process.env.ISECURE_PGP_PUBLIC_KEY!,
  "authorize",
);`,
  Logout: `const result = await client.logout();`,
  InitLogin: `// login() retrieves and answers the login challenge.
const state = await client.login();`,
  Login: `const state = await client.login();
if (state.status === "authenticated") {
  console.log("Session ready");
}`,
  LoginMFA: `// After needs_mfa; the client retains Session and ChallengeName.
const state = await client.submitMfaCode("123456");
if (state.status === "needs_email_verification") {
  // Prompt for the email code, then call client.verifyEmail(code).
  // After verification, start a fresh login and complete MFA again.
} else if (state.status === "authenticated") {
  console.log("Session ready");
}`,
  SelectMFA: `// After needs_mfa_selection, choose a method offered in state.methods.
const state = await client.selectMfaType("totp");
if (state.status === "needs_mfa") {
  // Prompt for the selected factor's code, then call submitMfaCode(code).
  // The client retains the new Session and ChallengeName.
}`,
  RetireCert: `// Retires the active certificate for client's Bank; the integrator
// owner may pass Account to retire a customer's certificate instead.
const result = await client.retireCert({ Account: "customer@example.com" });`,
  DeleteAccount: `// Permanent deletion. Requires an admin login with MFA at most
// 10 minutes old and the exact email repeated as confirmation.
const result = await client.deleteAccount(
  "customer@example.com",
  "customer@example.com",
);`,
  VerifyTOTP: `const state = await client.verifyTotp(
  accessToken,
  codeFromAuthenticatorApp,
);
if (state.status !== "verification_accepted") {
  throw new Error("TOTP enrollment was not confirmed");
}
// On the next login, follow the returned MFA challenge or factor selection.`,
};

// ponytail: upstream JSON-escapes some descriptions and code samples twice, so
// the web renderer shows literal "\\n". Decode one level where that happened.
function unescapeDoubleEncoded(value: unknown): unknown {
  if (typeof value === "string") {
    return value.includes("\\n")
      ? value.replace(/\\([nt"\\])/g, (_, c) =>
          c === "n" ? "\n" : c === "t" ? "\t" : c,
        )
      : value;
  }
  if (Array.isArray(value)) return value.map(unescapeDoubleEncoded);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, unescapeDoubleEncoded(v)]),
    );
  }
  return value;
}

export const GET: APIRoute = () => {
  const publishedSpec = unescapeDoubleEncoded(
    structuredClone(sourceSpec),
  ) as PublishedSpec;
  publishedSpec.info.termsOfService = "https://www.isecure.fi/ws-api-terms/";
  publishedSpec.info.contact.email = "support@isecure.fi";
  publishedSpec.info["x-logo"].url =
    "https://www.isecure.fi/images/isecure-small-logo.png";
  const baseDescription = publishedSpec.info.description.replace(
    "Browser-compatible TypeScript SDK is available on GitHub [dforsber/isecure-ts-client](https://github.com/dforsber/isecure-ts-client).",
    `The [official ISECure TypeScript SDK](${TYPESCRIPT_SDK_URL}) supports Node.js and modern browser bundlers. Install it with \`npm install isecure-ts-client\`.`,
  );
  publishedSpec.info.description = `${baseDescription}

The [ISECure Python SDK (Beta)](https://github.com/isecurefi/isecure-py-client) is also available. See its README for installation and current API coverage.

The test-only bank identifier \`simulator\` is available at \`https://ws-api.test.isecure.fi/v2\`. See the [Bank Simulator guide](${BANK_SIMULATOR_GUIDE_URL}) for enrollment, initial statement download, and signed file upload examples.`;
  publishedSpec.externalDocs = {
    description: "Official ISECure TypeScript SDK",
    url: TYPESCRIPT_SDK_URL,
  };

  publishedSpec.tags = [
    {
      name: "Session",
      description:
        "Login, logout, SMS MFA, and authenticator-app TOTP workflows.",
    },
    {
      name: "Files",
      description:
        "List, upload, download, and remove bank files through the WS Channel.",
    },
    {
      name: "Account",
      description:
        "Registration, verification, password recovery, and account setup.",
    },
    {
      name: "Certs",
      description:
        "Enroll, import, export, configure, and share bank certificates.",
    },
    {
      name: "Pgp",
      description:
        "Manage the PGP public keys used for protected certificate exports.",
    },
    {
      name: "Audit",
      description:
        "Read sanitized account-management evidence, newest first. Integrators see their tenant; customers see only their own account. Available in production and the test environment.",
    },
    {
      name: "Integrator",
      description:
        "Manage the customer accounts associated with an integrator API key.",
    },
  ];
  publishedSpec["x-tagGroups"] = [
    { name: "Authentication & sessions", tags: ["Session"] },
    { name: "Bank file exchange", tags: ["Files"] },
    {
      name: "Account administration",
      tags: ["Account", "Certs", "Pgp"],
    },
    { name: "Integrator accounts", tags: ["Integrator"] },
    { name: "Audit history", tags: ["Audit"] },
    { name: "Data models", tags: ["Schemas"] },
  ];

  for (const pathItem of Object.values(publishedSpec.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!HTTP_METHODS.has(method) || typeof operation !== "object") continue;

      const publishedOperation = operation as PublishedOperation;
      for (const parameter of publishedOperation.parameters ?? []) {
        // ponytail: upstream bank list omits omasp; drop once wsapi-v2 adds it.
        if (parameter.name === "Bank" && parameter.description) {
          parameter.description = parameter.description.replace(
            "`spankki`, ",
            "`spankki`, `omasp`, ",
          );
        }
      }
      const operationId = publishedOperation.operationId;
      if (operationId === "ListAuditEvents") {
        publishedOperation.description = `Availability: deployed to production at https://ws-api.isecure.fi/v2 and the test environment at https://ws-api.test.isecure.fi/v2.\n\n${publishedOperation.description ?? ""}`;
      }
      const example = operationId
        ? TYPESCRIPT_SDK_SAMPLES[operationId]
        : undefined;
      if (!operationId || !example) continue;

      const existingSamples = (
        publishedOperation["x-code-samples"] ?? []
      ).filter(
        (sample) =>
          sample.source.trim().length > 0 &&
          sample.lang?.toLowerCase() !== "typescript",
      );
      publishedOperation["x-code-samples"] = [
        {
          lang: "TypeScript",
          label: "Official TypeScript SDK",
          source: `// client is a configured WSChannel instance; see Introduction.\n${example}`,
        },
        ...existingSamples,
      ];
    }
  }

  Object.assign(publishedSpec.definitions.AccountDescriptor.example, {
    Email: "user@example.com",
    Name: "Example User",
    Phone: "+358401234567",
  });
  Object.assign(publishedSpec.definitions.RegisterReq.example, {
    ApiKey: "example-integrator-api-key",
    ChResp: "example-challenge-response",
    Company: "Example Company Oy",
    Encrypted: "example-encrypted-password",
    Name: "Example User",
    Phone: "+358401234567",
  });

  for (const definition of [
    publishedSpec.definitions.LoginMFAResp,
    publishedSpec.definitions.LoginResp,
  ]) {
    const replacements = {
      AccessToken: "example-access-token",
      ApiKey: "example-integrator-api-key",
      IdToken: "example-id-token",
      SecretCode: "EXAMPLESECRET",
    };
    const example = definition.example as Record<string, unknown>;
    // Preserve the upstream response state; sanitizing must not add tokens.
    for (const [key, value] of Object.entries(replacements)) {
      if (Object.hasOwn(example, key)) example[key] = value;
    }
  }
  // ponytail: upstream typo, stray ")" after "`admin` mode"; drop when fixed there.
  for (const property of Object.values(
    publishedSpec.definitions.LoginResp.properties,
  )) {
    property.description = property.description.replace(
      "i.e. `admin` mode)",
      "i.e. `admin` mode",
    );
  }
  publishedSpec.definitions.RegisterResp.example.ApiKey =
    "example-integrator-api-key";
  publishedSpec.definitions.VerifyEmailReq.example.AccessToken =
    "example-access-token";
  publishedSpec.definitions.VerifyTOTPReq.example.AccessToken =
    "example-access-token";

  return new Response(`${JSON.stringify(publishedSpec, null, 2)}\n`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'inline; filename="isecure-ws-channel-v2.json"',
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
};
