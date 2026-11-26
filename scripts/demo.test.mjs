import assert from "node:assert/strict";
import test from "node:test";
import { createHandler } from "./demo/handler.mjs";
import { FILE_TYPE, readStatement, TEST_URL } from "./demo/reader.mjs";

const request = {
  requestContext: { http: { method: "GET" } },
  rawPath: "/statement",
  headers: { origin: "https://www.isecure.fi" },
};
test("demo rejects arbitrary parameters, paths, writes and other origins before loading secrets", async () => {
  const handler = createHandler(() => {
    throw new Error("Must not load");
  });
  for (const [change, status] of [
    [{ rawQueryString: "bank=nordea" }, 400],
    [{ body: "{}" }, 400],
    [{ rawPath: "/upload" }, 404],
    [{ requestContext: { http: { method: "POST" } } }, 405],
    [{ headers: { origin: "https://other.example" } }, 403],
  ])
    assert.equal((await handler({ ...request, ...change })).statusCode, status);
});
test("demo coalesces reads, labels cached results, and refuses stale data on failure", async () => {
  let calls = 0,
    time = 0;
  const handler = createHandler(
    async () => ({}),
    async () => {
      if (++calls > 1) throw new Error("secret detail");
      return { xml: "synthetic", retrievedAt: "2026-11-26T00:00:00Z" };
    },
    () => time,
  );
  const responses = await Promise.all([handler(request), handler(request)]);
  assert.equal(calls, 1);
  assert.equal(responses[0].statusCode, 200);
  assert.equal(JSON.parse((await handler(request)).body).delivery, "cached");
  time = 60_001;
  const failed = await handler(request);
  assert.equal(failed.statusCode, 503);
  assert.ok(!failed.body.includes("secret detail"));
});
test("SDK reader pins test simulator/data identity and permits only exact file reads", async () => {
  const calls = [];
  class Client {
    constructor(config) {
      calls.push(config);
    }
    async login() {
      return { status: "authenticated" };
    }
    async listFiles(query) {
      calls.push(query);
      return {
        ResponseCode: "00",
        FileDescriptors: [{ FileType: FILE_TYPE, FileReference: "opaque" }],
      };
    }
    async downloadFile(type, ref) {
      calls.push([type, ref]);
      return {
        ResponseCode: "00",
        Content: Buffer.from(
          `<Document xmlns="urn:iso:std:iso:20022:tech:xsd:${FILE_TYPE}">FI2112345600000785</Document>`,
        ).toString("base64"),
      };
    }
    async logout() {
      calls.push("logout");
    }
  }
  const result = await readStatement(
    {
      Email: "demo@example.invalid",
      Company: "ISECure Website Demo",
      ApiKey: "synthetic",
      Password: "synthetic",
      Bank: "nordea",
      Mode: "admin",
      BaseUrl: "https://wrong.example",
    },
    Client,
  );
  assert.equal(calls[0].Bank, "simulator");
  assert.equal(calls[0].Mode, "data");
  assert.equal(calls[0].BaseUrl, TEST_URL);
  assert.deepEqual(calls[1], { FileType: FILE_TYPE, Status: "ALL" });
  assert.deepEqual(calls[2], [FILE_TYPE, "opaque"]);
  assert.equal(calls[3], "logout");
  assert.equal(result.synthetic, true);
  await assert.rejects(
    readStatement({ Email: "customer@example.com" }, Client),
  );
});
