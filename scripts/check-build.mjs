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

const dailyCashPages = [
  ["daily-cash/index.html", "/daily-cash/", "fi"],
  ["en/daily-cash/index.html", "/en/daily-cash/", "en"],
  ["se/daily-cash/index.html", "/se/daily-cash/", "sv"],
];
for (const [relativeFile, canonicalPath, htmlLang] of dailyCashPages) {
  const file = join(dist, relativeFile);
  if (!existsSync(file)) {
    failures.push(`Daily Cash preview: missing ${relativeFile}`);
    continue;
  }
  const html = readFileSync(file, "utf8");
  if (!html.includes('<meta name="robots" content="noindex, nofollow">')) {
    failures.push(`${relativeFile}: preview must remain noindex and nofollow`);
  }
  if (
    !html.includes(
      `rel="canonical" href="https://www.isecure.fi${canonicalPath}"`,
    )
  ) {
    failures.push(`${relativeFile}: wrong Daily Cash canonical URL`);
  }
  if (!html.includes(`<html lang="${htmlLang}"`)) {
    failures.push(`${relativeFile}: wrong document language`);
  }
  if (!html.includes('data-synthetic-preview="true"')) {
    failures.push(`${relativeFile}: synthetic product-data marker is missing`);
  }
  if (/schema\.org\/(?:InStock|PreOrder)/iu.test(html)) {
    failures.push(
      `${relativeFile}: preview must not publish an availability claim`,
    );
  }
}

const invoicingPages = [
  [
    "invoicing/index.html",
    "/invoicing/",
    "fi",
    "Maksun toimeenpano",
    "Asiakirja ≠ hyväksyntä ≠ maksu ≠ selvitys ≠ kirjanpito",
  ],
  [
    "en/invoicing/index.html",
    "/en/invoicing/",
    "en",
    "Payment execution",
    "Document ≠ approval ≠ payment ≠ settlement ≠ bookkeeping",
  ],
  [
    "se/invoicing/index.html",
    "/se/invoicing/",
    "sv",
    "Betalningsutförande",
    "Dokument ≠ godkännande ≠ betalning ≠ avveckling ≠ bokföring",
  ],
];
for (const [
  relativeFile,
  canonicalPath,
  htmlLang,
  paymentExecution,
  lifecycleBoundary,
] of invoicingPages) {
  const file = join(dist, relativeFile);
  if (!existsSync(file)) {
    failures.push(`Invoicing preview: missing ${relativeFile}`);
    continue;
  }
  const html = readFileSync(file, "utf8");
  if (!html.includes('<meta name="robots" content="noindex, nofollow">')) {
    failures.push(`${relativeFile}: preview must remain noindex and nofollow`);
  }
  if (
    !html.includes(
      `rel="canonical" href="https://www.isecure.fi${canonicalPath}"`,
    )
  ) {
    failures.push(`${relativeFile}: wrong Invoicing canonical URL`);
  }
  if (!html.includes(`<html lang="${htmlLang}"`)) {
    failures.push(`${relativeFile}: wrong document language`);
  }
  if (!html.includes('data-synthetic-preview="true"')) {
    failures.push(`${relativeFile}: synthetic product-data marker is missing`);
  }
  if (!html.includes(paymentExecution)) {
    failures.push(
      `${relativeFile}: payment execution must remain a separate lifecycle state`,
    );
  }
  if (!html.includes(lifecycleBoundary)) {
    failures.push(
      `${relativeFile}: localized lifecycle-boundary warning is missing`,
    );
  }
  if (/schema\.org\/(?:InStock|PreOrder)/iu.test(html)) {
    failures.push(
      `${relativeFile}: preview must not publish an availability claim`,
    );
  }
}

const bankSimulatorPages = [
  ["bank-simulator/index.html", "/bank-simulator/", "fi", "Pankkisimulaattori"],
  [
    "en/bank-simulator/index.html",
    "/en/bank-simulator/",
    "en",
    "Bank Simulator",
  ],
  [
    "se/bank-simulator/index.html",
    "/se/bank-simulator/",
    "sv",
    "Banksimulator",
  ],
];
const simulatorGuideUrls = [
  "https://www.isecure.fi/bank-simulator/",
  "https://www.isecure.fi/en/bank-simulator/",
  "https://www.isecure.fi/se/bank-simulator/",
];
const simulatorExampleUrl =
  "https://github.com/isecurefi/isecure-ts-client/blob/main/examples/bank-simulator/README.md";
for (const [
  relativeFile,
  canonicalPath,
  htmlLang,
  heading,
] of bankSimulatorPages) {
  const file = join(dist, relativeFile);
  if (!existsSync(file)) {
    failures.push(`Bank Simulator: missing ${relativeFile}`);
    continue;
  }
  const html = readFileSync(file, "utf8");
  if (
    !html.includes(
      `rel="canonical" href="https://www.isecure.fi${canonicalPath}"`,
    )
  ) {
    failures.push(`${relativeFile}: wrong Bank Simulator canonical URL`);
  }
  if (!html.includes(`<html lang="${htmlLang}"`)) {
    failures.push(`${relativeFile}: wrong document language`);
  }
  if (!new RegExp(`<h1[^>]*>${heading}</h1>`, "u").test(html)) {
    failures.push(`${relativeFile}: localized Bank Simulator H1 is missing`);
  }
  for (const guideUrl of simulatorGuideUrls) {
    if (!html.includes(`rel="alternate"`) || !html.includes(guideUrl)) {
      failures.push(
        `${relativeFile}: reciprocal Bank Simulator language links are incomplete`,
      );
      break;
    }
  }
  for (const requiredText of [
    "https://ws-api.test.isecure.fi/v2",
    "simulator",
    "camt.053.001.02",
    "pain.001.001.09",
    "pain.002.001.10",
    "camt.054.001.02",
    simulatorExampleUrl,
  ]) {
    if (!html.includes(requiredText)) {
      failures.push(`${relativeFile}: missing simulator fact ${requiredText}`);
    }
  }
}

for (const [entryPage, simulatorPath] of [
  ["index.html", "/bank-simulator/"],
  ["en/index.html", "/en/bank-simulator/"],
  ["se/index.html", "/se/bank-simulator/"],
]) {
  const html = readFileSync(join(dist, entryPage), "utf8");
  if (/href="\/(?:en\/|se\/)?daily-cash\//u.test(html)) {
    failures.push(
      `${entryPage}: Daily Cash must remain outside public navigation`,
    );
  }
  if (/href="\/(?:en\/|se\/)?invoicing\//u.test(html)) {
    failures.push(
      `${entryPage}: Invoicing must remain outside public navigation`,
    );
  }
  if (!html.includes(`href="${simulatorPath}"`)) {
    failures.push(
      `${entryPage}: localized Bank Simulator guide link is missing`,
    );
  }
  if (!html.includes("camt.053.001.02")) {
    failures.push(`${entryPage}: fresh-user simulator statement is missing`);
  }
}

const sitemapFiles = findFiles(dist, ".xml").filter((file) =>
  file.includes("sitemap"),
);
for (const sitemapFile of sitemapFiles) {
  if (readFileSync(sitemapFile, "utf8").includes("/daily-cash/")) {
    failures.push(
      `${relative(dist, sitemapFile)}: Daily Cash preview must remain outside sitemaps`,
    );
  }
  if (readFileSync(sitemapFile, "utf8").includes("/invoicing/")) {
    failures.push(
      `${relative(dist, sitemapFile)}: Invoicing preview must remain outside sitemaps`,
    );
  }
}
const sitemapText = sitemapFiles
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");
for (const guideUrl of simulatorGuideUrls) {
  if (!sitemapText.includes(guideUrl)) {
    failures.push(`Sitemap: missing Bank Simulator URL ${guideUrl}`);
  }
}

const llmsText = readFileSync(join(dist, "llms.txt"), "utf8");
if (llmsText.includes("github.com/dforsber/isecure-ts-client")) {
  failures.push(
    "llms.txt still links to the retired TypeScript SDK repository",
  );
}
if (!llmsText.includes("github.com/isecurefi/isecure-ts-client")) {
  failures.push(
    "llms.txt does not link to the official TypeScript SDK repository",
  );
}
if (!llmsText.includes("https://www.isecure.fi/en/bank-simulator/")) {
  failures.push("llms.txt does not link to the Bank Simulator guide");
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
if (
  !rawSpec.info?.description?.includes(
    "https://www.isecure.fi/en/bank-simulator/",
  ) ||
  !rawSpec.info?.description?.includes("https://ws-api.test.isecure.fi/v2") ||
  !rawSpec.info?.description?.includes("`simulator`")
) {
  failures.push(
    "API introduction is missing the test-only Bank Simulator documentation",
  );
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
