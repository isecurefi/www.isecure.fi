import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(
  new URL("./cloudfront-redirects.js", import.meta.url),
  "utf8",
);
const sandbox = {};
vm.runInNewContext(
  `${source}\nglobalThis.cloudFrontHandler = handler;`,
  sandbox,
);
const handler = sandbox.cloudFrontHandler;

const cases = [
  {
    name: "canonical API docs request passes through",
    uri: "/wsapi_v2/",
    expected: "request",
  },
  {
    name: "OpenAPI JSON request passes through",
    uri: "/wsapi_v2.json",
    expected: "request",
  },
  {
    name: "API docs path receives a canonical slash",
    uri: "/wsapi_v2",
    expected: "https://www.isecure.fi/wsapi_v2/",
  },
  {
    name: "API docs index preserves its query string",
    uri: "/wsapi_v2/index.html",
    querystring: { source: { value: "old link" } },
    expected: "https://www.isecure.fi/wsapi_v2/?source=old%20link",
  },
  {
    name: "camt.053 redirect remains intact",
    uri: "/tiliote/index.html",
    expected: "https://www.isecure.fi/camt-053/",
  },
  {
    name: "retired Banking Data route points to the Processing API",
    uri: "/en/data-api/",
    querystring: { source: { value: "old-page" } },
    expected: "https://www.isecure.fi/en/processing-api/?source=old-page",
  },
];

let failures = 0;
for (const testCase of cases) {
  const request = {
    uri: testCase.uri,
    querystring: testCase.querystring ?? {},
  };
  const result = handler({ request });
  const actual =
    result === request ? "request" : result.headers?.location?.value;
  if (actual !== testCase.expected) {
    failures += 1;
    console.error(
      `FAIL ${testCase.name}: expected ${testCase.expected}, received ${actual}`,
    );
  } else {
    console.log(`PASS ${testCase.name}`);
  }
}

if (failures > 0) process.exitCode = 1;
