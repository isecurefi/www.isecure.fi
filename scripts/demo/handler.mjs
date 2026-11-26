import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { readStatement } from "./reader.mjs";

const secrets = new SecretsManagerClient({});
const ORIGIN = "https://www.isecure.fi";
const TTL = 60_000;

export function createHandler(
  loadConfig,
  read = readStatement,
  now = Date.now,
) {
  let cached;
  let expires = 0;
  let pending;
  const reply = (statusCode, body) => ({
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex, nofollow",
      "access-control-allow-origin": ORIGIN,
      vary: "Origin",
    },
    body: JSON.stringify(body),
  });
  return async (event) => {
    if (event.requestContext?.http?.method !== "GET")
      return reply(405, { error: "Method not allowed" });
    if (event.rawPath !== "/statement")
      return reply(404, { error: "Not found" });
    if (event.rawQueryString || event.body)
      return reply(400, { error: "This demo accepts no parameters" });
    if (event.headers?.origin && event.headers.origin !== ORIGIN)
      return reply(403, { error: "Origin not allowed" });
    if (cached && now() < expires)
      return reply(200, { ...cached, delivery: "cached" });
    try {
      if (!pending) {
        pending = (async () => {
          const value = await read(await loadConfig());
          cached = value;
          expires = now() + TTL;
          return value;
        })().finally(() => {
          pending = undefined;
        });
      }
      return reply(200, { ...(await pending), delivery: "live" });
    } catch {
      // Never return/log SDK errors, credentials, response bodies or tenant identifiers.
      return reply(503, {
        error:
          "The test environment is temporarily unavailable. Please try again shortly.",
      });
    }
  };
}

export const handler = createHandler(async () => {
  const result = await secrets.send(
    new GetSecretValueCommand({ SecretId: process.env.DEMO_SECRET_ARN }),
  );
  return JSON.parse(result.SecretString);
});
