// Optional publication review against an installed isecure-ts-client checkout/package.
import ts from "typescript";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { buildSpec } from "./platform-api-docs.mjs";
const sdk = process.argv[2];
if (!sdk)
  throw new Error(
    "Pass the SDK package directory to type-check every published operation sample",
  );
const dir = mkdtempSync(join(tmpdir(), "isecure-doc-samples-"));
const sdkImport = JSON.stringify(resolve(sdk, "dist/iso20022/index.js"));
const prelude = `import {createIso20022Client,Iso20022HttpTransport} from ${sdkImport};\ndeclare const transport: Iso20022HttpTransport;\nconst client=createIso20022Client(transport);\n`;
const files = [];
for (const kind of ["processing", "bank-simulator"]) {
  const spec = buildSpec(kind);
  for (const item of Object.values(spec.paths))
    for (const op of Object.values(item)) {
      const path = join(dir, `${op.operationId}.mts`);
      writeFileSync(path, prelude + op["x-codeSamples"][0].source + "\n");
      files.push(path);
    }
}
const workflow = readFileSync(
  new URL("../src/content/api/simulator-workflow.md", import.meta.url),
  "utf8",
);
const workflowCode = [...workflow.matchAll(/```ts\n([\s\S]*?)```/g)]
  .map((match) => match[1])
  .join("\n");
const workflowPath = join(dir, "simulator-workflow.mts");
writeFileSync(
  workflowPath,
  prelude +
    `
const simulation = client;
declare const capability: Awaited<ReturnType<typeof client.simulationCapabilities.list>>["capabilities"][number];
declare const processingConnectedAccountId: string;
declare const paymentOrderRevisionReference: Extract<Parameters<typeof client.simulationRuns.start>[0]["input"], { input_type: "payment_order_revision" }>["payment_order_revision_reference"];
declare const commandKeys: Record<string, string>;
` +
    workflowCode,
);
files.push(workflowPath);
const program = ts.createProgram([...new Set(files)], {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  strict: true,
  noEmit: true,
  skipLibCheck: true,
});
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  console.error(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (p) => p,
      getCurrentDirectory: () => process.cwd(),
      getNewLine: () => "\n",
    }),
  );
  process.exitCode = 1;
} else console.log(`PASS ${new Set(files).size} SDK operation samples compile`);
rmSync(dir, { recursive: true, force: true });
