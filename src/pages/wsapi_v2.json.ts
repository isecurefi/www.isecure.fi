import type { APIRoute } from "astro";

import sourceSpec from "../data/wsapi_v2.json";

export const prerender = true;

type PublishedSpec = typeof sourceSpec & {
  externalDocs: { description: string; url: string };
  tags: Array<{ name: string; description: string }>;
  "x-tagGroups": Array<{ name: string; tags: string[] }>;
};

type PublishedOperation = {
  operationId?: string;
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
const TYPESCRIPT_SDK_SAMPLES: Record<string, string> = {
  InitRegister: `// register() retrieves and answers the registration challenge.
const registration = await client.register();`,
  VerifyEmail: `const state = await client.verifyEmail("123456");`,
  Register: `const registration = await client.register();
console.log(registration.ApiKey);`,
  InitPasswordReset: `const challenge = await client.initPasswordReset();`,
  PasswordReset: `const { Challenge } = await client.initPasswordReset();
const result = await client.passwordReset(
  "123456",
  process.env.ISECURE_NEW_PASSWORD!,
  Challenge,
);`,
  VerifyPhone: `const state = await client.verifyPhone("123456");`,
  ListCerts: `const certificates = await client.listCerts();`,
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
  LoginMFA: `const state = await client.submitMfaCode("123456");`,
  VerifyTOTP: `const state = await client.verifyTotp(
  accessToken,
  codeFromAuthenticatorApp,
);`,
};

export const GET: APIRoute = () => {
  const publishedSpec = structuredClone(sourceSpec) as PublishedSpec;
  publishedSpec.info.termsOfService = "https://www.isecure.fi/ws-api-terms/";
  publishedSpec.info.contact.email = "support@isecure.fi";
  publishedSpec.info["x-logo"].url =
    "https://www.isecure.fi/images/isecure-small-logo.png";
  publishedSpec.info.description = publishedSpec.info.description.replace(
    "Browser-compatible TypeScript SDK is available on GitHub [dforsber/isecure-ts-client](https://github.com/dforsber/isecure-ts-client).",
    `The [official ISECure TypeScript SDK](${TYPESCRIPT_SDK_URL}) supports Node.js and modern browser bundlers. Install it with \`npm install isecure-ts-client\`.`,
  );
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
    { name: "Data models", tags: ["Schemas"] },
  ];

  for (const pathItem of Object.values(publishedSpec.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!HTTP_METHODS.has(method) || typeof operation !== "object") continue;

      const publishedOperation = operation as PublishedOperation;
      const operationId = publishedOperation.operationId;
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
    Object.assign(definition.example, {
      AccessToken: "example-access-token",
      ApiKey: "example-integrator-api-key",
      IdToken: "example-id-token",
    });
  }
  publishedSpec.definitions.LoginMFAResp.example.SecretCode = "EXAMPLESECRET";
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
      "Cache-Control": "public, max-age=3600",
    },
  });
};
