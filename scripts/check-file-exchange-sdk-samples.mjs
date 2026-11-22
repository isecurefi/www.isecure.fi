// Type-check the rendered public examples against the exact released SDK supplied by the operator.
import ts from "typescript";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
const sdk = process.argv[2];
if (!sdk)
  throw new Error(
    "Pass the SDK 6.1.0+ package/checkout directory after yarn build",
  );
const prelude = `import { WSChannel } from ${JSON.stringify(resolve(sdk, "dist/index.js"))};
declare const client: WSChannel;
declare const process: { env: Record<string, string | undefined> };
declare const accountEmail: string, erpPrimaryFingerprint: string, primaryFingerprint: string;
declare const armoredPublicKey: string, freshAuthenticatorCode: string, accessToken: string, codeFromAuthenticatorApp: string;
declare const reviewedRevision: number;
declare const nativeChallenge: Parameters<WSChannel["readWorkspaceAuthority"]>[0];
declare function readRecoveryCode(): Promise<string>;
`;
const dir = mkdtempSync(join(tmpdir(), "isecure-ws-docs-"));
try {
  const files = [];
  for (const [kind, path] of [
    ["v2", "dist/wsapi_v2.json"],
    ["pgp", "dist/apis/pgp-policy/openapi.json"],
  ]) {
    const spec = JSON.parse(readFileSync(path, "utf8"));
    for (const methods of Object.values(spec.paths))
      for (const op of Object.values(methods)) {
        const sample = op["x-code-samples"]?.find(
          (item) => item.lang === "TypeScript",
        );
        if (!sample)
          throw new Error(`Missing TypeScript sample: ${op.operationId}`);
        const file = join(dir, `${kind}-${op.operationId}.mts`);
        writeFileSync(file, prelude + sample.source);
        files.push(file);
      }
    if (kind === "pgp")
      for (const [i, block] of [
        ...spec.info.description.matchAll(/~~~ts\n([\s\S]*?)~~~/g),
      ].entries()) {
        const file = join(dir, `pgp-workflow-${i}.mts`);
        writeFileSync(file, prelude + block[1]);
        files.push(file);
      }
  }
  const program = ts.createProgram(files, {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    types: [],
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length)
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (p) => p,
        getCurrentDirectory: () => process.cwd(),
        getNewLine: () => "\n",
      }),
    );
  console.log(`PASS ${files.length} File Exchange/PGP SDK samples compile`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
