import type { APIRoute } from "astro";

import sourceSpec from "../data/wsapi_v2.json";

export const prerender = true;

export const GET: APIRoute = () => {
  const publishedSpec = structuredClone(sourceSpec);
  publishedSpec.info.termsOfService = "https://www.isecure.fi/ws-api-terms/";

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
