import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
const failures = [];

if (!existsSync(dist)) {
  throw new Error("dist/ does not exist; run the Astro build first");
}

function findFiles(directory, extension) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? findFiles(path, extension)
      : path.endsWith(extension)
        ? [path]
        : [];
  });
}

function count(html, pattern) {
  return html.match(pattern)?.length ?? 0;
}

function localTargetExists(target, sourceFile) {
  if (
    target.startsWith("#") ||
    target.startsWith("mailto:") ||
    target.startsWith("tel:") ||
    target.startsWith("data:") ||
    target.startsWith("javascript:")
  ) {
    return true;
  }

  let url;
  try {
    const sourceRoute = `/${relative(dist, sourceFile).split(sep).join("/")}`;
    url = new URL(target, new URL(sourceRoute, "https://www.isecure.fi"));
  } catch {
    return false;
  }

  if (url.hostname !== "www.isecure.fi") return true;
  const pathname = decodeURIComponent(url.pathname);
  const relativePath = pathname.replace(/^\//, "");
  const candidates = pathname.endsWith("/")
    ? [join(dist, relativePath, "index.html")]
    : [join(dist, relativePath), join(dist, relativePath, "index.html")];
  return candidates.some((candidate) => existsSync(candidate));
}

const htmlFiles = findFiles(dist, ".html");
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const page = relative(dist, file).split(sep).join("/");
  const isSiteVerification = html
    .trim()
    .startsWith("google-site-verification:");
  const isIndexable =
    !isSiteVerification &&
    !/<meta name="robots" content="[^"]*noindex/i.test(html);

  if (isIndexable) {
    if (count(html, /<title(?:\s|>)/gi) !== 1) {
      failures.push(`${page}: expected exactly one title`);
    }
    if (count(html, /<meta name="description"/gi) !== 1) {
      failures.push(`${page}: expected exactly one meta description`);
    }
    if (count(html, /<link rel="canonical"/gi) !== 1) {
      failures.push(`${page}: expected exactly one canonical link`);
    }
    if (count(html, /<h1(?:\s|>)/gi) !== 1) {
      failures.push(`${page}: expected exactly one H1`);
    }
  }

  const links = [
    ...html.matchAll(/<(?:a|link|script|img)\b[^>]*(?:href|src)="([^"]+)"/gi),
  ].map((match) => match[1]);
  for (const target of links) {
    if (!localTargetExists(target, file)) {
      failures.push(`${page}: broken local target ${target}`);
    }
  }
}

const docsPath = join(dist, "wsapi_v2", "index.html");
const docs = readFileSync(docsPath, "utf8");
const docsSource = readFileSync(
  join(root, "src", "pages", "wsapi_v2", "index.astro"),
  "utf8",
);
const packageManifest = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8"),
);
const dependencyLock = readFileSync(join(root, "yarn.lock"), "utf8");
const expectedOperations = 26;
const rendererVersion =
  packageManifest.dependencies?.["@scalar/api-reference"] ?? "";
if (!/^\d+\.\d+\.\d+$/.test(rendererVersion)) {
  failures.push("API docs: Scalar must be pinned to an exact version");
}
if (/@redocly\//i.test(dependencyLock) || /redoc@npm:/i.test(dependencyLock)) {
  failures.push("API docs: Redoc/Redocly dependency remains in yarn.lock");
}
if (/jquery(?:-2\.1\.4)?|code\.jquery\.com/i.test(docs)) {
  failures.push("API docs: obsolete jQuery runtime is present");
}
if (/swagger-ui(?:-es-bundle|-dist)?/i.test(docs)) {
  failures.push("API docs: retired Swagger UI renderer is present");
}
if (/redoc(?:ly|\.standalone|\b)/i.test(docs)) {
  failures.push("API docs: retired Redoc/Redocly renderer is present");
}
if (!docs.includes('id="api-reference"')) {
  failures.push("API docs: API reference container is missing");
}
if (!docs.includes('data-renderer="scalar"')) {
  failures.push("API docs: self-hosted Scalar renderer marker is missing");
}
if (!docs.includes('data-reference-only="true"')) {
  failures.push("API docs: reference-only safety marker is missing");
}
if (/docs-header|environment-bar|docs-footer/.test(docs)) {
  failures.push("API docs: obsolete custom top or bottom chrome is present");
}
for (const [setting, pattern] of [
  ["API client", /hideClientButton:\s*true/],
  ["test request", /hideTestRequestButton:\s*true/],
  ["agent", /agent:\s*{[\s\S]*?disabled:\s*true/],
  ["MCP", /mcp:\s*{[\s\S]*?disabled:\s*true/],
  ["telemetry", /telemetry:\s*false/],
  ["remote fonts", /withDefaultFonts:\s*false/],
  ["developer tools", /showDeveloperTools:\s*"never"/],
  ["light/dark theme toggle", /hideDarkModeToggle:\s*false/],
]) {
  if (!pattern.test(docsSource)) {
    failures.push(`API docs: ${setting} is not explicitly disabled`);
  }
}
if (/forceDarkModeState:/.test(docsSource)) {
  failures.push("API docs: theme is forced instead of user-selectable");
}

const rawSpec = JSON.parse(readFileSync(join(dist, "wsapi_v2.json"), "utf8"));
if (rawSpec.info?.termsOfService !== "https://www.isecure.fi/ws-api-terms/") {
  failures.push("Published OpenAPI document has the wrong Terms URL");
}
if (rawSpec.info?.contact?.email !== "support@isecure.fi") {
  failures.push("Published OpenAPI document has the wrong support email");
}
const typescriptSdkUrl = "https://github.com/isecurefi/isecure-ts-client";
if (rawSpec.externalDocs?.url !== typescriptSdkUrl) {
  failures.push("Published OpenAPI document has the wrong TypeScript SDK URL");
}
if (!rawSpec.info?.description?.includes(typescriptSdkUrl)) {
  failures.push("API introduction does not link to the TypeScript SDK");
}
if (rawSpec.info?.description?.includes("dforsber/isecure-ts-client")) {
  failures.push("API introduction still links to the retired SDK repository");
}

const httpMethods = new Set([
  "delete",
  "get",
  "head",
  "options",
  "patch",
  "post",
  "put",
]);
const publishedOperations = Object.values(rawSpec.paths).flatMap((pathItem) =>
  Object.entries(pathItem)
    .filter(
      ([method, operation]) =>
        httpMethods.has(method) && operation?.operationId,
    )
    .map(([, operation]) => operation),
);
if (publishedOperations.length !== expectedOperations) {
  failures.push(
    `API docs: expected ${expectedOperations} published operations, found ${publishedOperations.length}`,
  );
}
for (const operation of publishedOperations) {
  const typescriptSample = (operation["x-code-samples"] ?? []).find(
    (sample) => sample.lang === "TypeScript",
  );
  if (
    !typescriptSample?.source?.includes("client.") ||
    typescriptSample.label !== "Official TypeScript SDK"
  ) {
    failures.push(
      `API docs: ${operation.operationId} has no official TypeScript SDK sample`,
    );
  }
}

const tagGroups = rawSpec["x-tagGroups"] ?? [];
const groupedTags = new Set(tagGroups.flatMap((group) => group.tags ?? []));
for (const requiredTag of [
  "Session",
  "Files",
  "Account",
  "Certs",
  "Pgp",
  "Integrator",
  "Schemas",
]) {
  if (!groupedTags.has(requiredTag)) {
    failures.push(`API docs: ${requiredTag} is missing from left navigation`);
  }
}
const rawSpecText = JSON.stringify(rawSpec);
for (const unsafeExample of [
  "Dan Forsberg",
  "+358404835507",
  "hzYAVO9Sg98nsNh81M84O2kyXVy6K1xwHD8",
  "4vN6hGHrav31smM0Ha1k15MDlZKOEGn43UToWTt2",
]) {
  if (rawSpecText.includes(unsafeExample)) {
    failures.push(
      `Published OpenAPI document exposes unsafe example: ${unsafeExample}`,
    );
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`${failures.length} build verification check(s) failed`);
  process.exitCode = 1;
} else {
  console.log(
    `Build verification passed: ${htmlFiles.length} HTML files, ${expectedOperations} API operations, no broken local targets`,
  );
}
