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
const expectedOperations = 26;
if (count(docs, /data-operation(?=[ >])/g) !== expectedOperations) {
  failures.push(
    `API docs: expected ${expectedOperations} static operation links`,
  );
}
if (count(docs, /data-operation-group(?=[ >])/g) !== 6) {
  failures.push("API docs: expected six operation groups");
}
if (/jquery(?:-2\.1\.4)?|code\.jquery\.com/i.test(docs)) {
  failures.push("API docs: obsolete jQuery runtime is present");
}
if (!docs.includes("https://ws-api.test.isecure.fi/v2")) {
  failures.push("API docs: staging endpoint is missing");
}
if (!docs.includes("Safe browsing mode")) {
  failures.push("API docs: read-only safety notice is missing");
}

const rawSpec = JSON.parse(readFileSync(join(dist, "wsapi_v2.json"), "utf8"));
if (rawSpec.info?.termsOfService !== "https://www.isecure.fi/ws-api-terms/") {
  failures.push("Published OpenAPI document has the wrong Terms URL");
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
