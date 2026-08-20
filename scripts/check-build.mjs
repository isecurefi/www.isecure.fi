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
    const internalTaskId = html.match(
      /\b(?!(?:ISO|RFC|SHA)-)[A-Z]{3,}[A-Z0-9]*-\d{3}\b/u,
    )?.[0];
    if (internalTaskId) {
      failures.push(`${page}: internal task ID is public: ${internalTaskId}`);
    }
  }

  if (
    /Banking Data API/iu.test(html) ||
    /href="\/(?:en\/|se\/)?data-api\//u.test(html)
  ) {
    failures.push(
      `${page}: retired Banking Data API wording or route is public`,
    );
  }

  const links = [
    ...html.matchAll(/<(?:a|link|script|img)\b[^>]*(?:href|src)="([^"]+)"/gi),
  ].map((match) => match[1]);
  for (const target of links) {
    if (!localTargetExists(target, file)) {
      failures.push(`${page}: broken local target ${target}`);
    }
  }

  for (const match of html.matchAll(
    /<(script|img)\b[^>]*\bsrc="(https?:\/\/[^"]+)"|<link\b[^>]*\brel="(?:stylesheet|preload)"[^>]*\bhref="(https?:\/\/[^"]+)"/giu,
  )) {
    const remoteUrl = match[2] ?? match[3];
    if (
      remoteUrl &&
      !remoteUrl.startsWith("https://www.googletagmanager.com/gtag/js")
    ) {
      failures.push(`${page}: remote runtime asset ${remoteUrl}`);
    }
  }
}

for (const extension of [".html", ".json", ".js", ".txt", ".xml"]) {
  for (const file of findFiles(dist, extension)) {
    const content = readFileSync(file, "utf8");
    if (/gpgtest/iu.test(content)) {
      failures.push(
        `${relative(dist, file)}: internal API Gateway stage name is public`,
      );
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
  [
    "bank-simulator/index.html",
    "/bank-simulator/",
    "fi",
    "Pankkisimulaattori",
    "Testiympäristö",
    "Rekisteröinti vaaditaan",
    "Maksullinen tilaus vaaditaan",
    "Pyydä käyttöoikeus",
  ],
  [
    "en/bank-simulator/index.html",
    "/en/bank-simulator/",
    "en",
    "Bank Simulator",
    "Test environment",
    "Registration required",
    "Paid subscription required",
    "Request access",
  ],
  [
    "se/bank-simulator/index.html",
    "/se/bank-simulator/",
    "sv",
    "Banksimulator",
    "Testmiljö",
    "Registrering krävs",
    "Betald prenumeration krävs",
    "Begär åtkomst",
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
  environmentLabel,
  registrationLabel,
  subscriptionLabel,
  admissionLabel,
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
    "Beta",
    environmentLabel,
    registrationLabel,
    subscriptionLabel,
    admissionLabel,
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

const productIndexPages = [
  [
    "products/index.html",
    "/products/",
    "fi",
    "Valitse työnkulkuusi sopiva tuote",
    "Tuotteet",
    "Pankkiyhteydet",
    [
      "Experimental",
      "Beta",
      "GA",
      "Testiympäristö",
      "Tuotanto",
      "Rekisteröinti vaaditaan",
      "Maksullinen tilaus vaaditaan",
      "Tilausta ei vaadita",
      "Avoin rekisteröinti",
      "Pyydä käyttöoikeus",
    ],
  ],
  [
    "en/products/index.html",
    "/en/products/",
    "en",
    "Choose the product that fits your workflow",
    "Products",
    "Bank Connectivity",
    [
      "Experimental",
      "Beta",
      "GA",
      "Test environment",
      "Production",
      "Registration required",
      "Paid subscription required",
      "No subscription required",
      "Open registration",
      "Request access",
    ],
  ],
  [
    "se/products/index.html",
    "/se/products/",
    "sv",
    "Välj produkten som passar ert arbetsflöde",
    "Produkter",
    "Bankförbindelser",
    [
      "Experimental",
      "Beta",
      "GA",
      "Testmiljö",
      "Produktion",
      "Registrering krävs",
      "Betald prenumeration krävs",
      "Ingen prenumeration krävs",
      "Öppen registrering",
      "Begär åtkomst",
    ],
  ],
];
const productIndexUrls = productIndexPages.map(
  ([, canonicalPath]) => `https://www.isecure.fi${canonicalPath}`,
);
for (const [
  relativeFile,
  canonicalPath,
  htmlLang,
  heading,
  sectionHeading,
  connectivityName,
  requiredAccessLabels,
] of productIndexPages) {
  const file = join(dist, relativeFile);
  if (!existsSync(file)) {
    failures.push(`Product index: missing ${relativeFile}`);
    continue;
  }
  const html = readFileSync(file, "utf8");
  if (!html.includes(`<html lang="${htmlLang}"`)) {
    failures.push(`${relativeFile}: wrong product-index document language`);
  }
  if (
    !html.includes(
      `rel="canonical" href="https://www.isecure.fi${canonicalPath}"`,
    )
  ) {
    failures.push(`${relativeFile}: wrong product-index canonical URL`);
  }
  if (!new RegExp(`<h1[^>]*>${heading}`, "u").test(html)) {
    failures.push(`${relativeFile}: localized product-index H1 is missing`);
  }
  if (
    !new RegExp(`<section[^>]*aria-label="${sectionHeading}"[^>]*>`, "u").test(
      html,
    )
  ) {
    failures.push(`${relativeFile}: accessible catalog label is missing`);
  }
  if (/<h2[^>]*>Products<\/h2>/iu.test(html)) {
    failures.push(
      `${relativeFile}: redundant visible Products heading remains`,
    );
  }
  if (count(html, /data-catalog-entry="[^"]+"/gu) !== 3) {
    failures.push(
      `${relativeFile}: expected three entries in one catalog grid`,
    );
  }
  if (
    count(
      html,
      /<article\b[^>]*data-catalog-entry="[^"]+"[^>]*>[\s\S]*?<h3[\s\S]*?<\/h3>[\s\S]*?data-card-labels="true"[\s\S]*?data-card-content[\s\S]*?data-card-access="true"[\s\S]*?<\/article>/gu,
    ) !== 3
  ) {
    failures.push(
      `${relativeFile}: card order must be product name and right-side label, then content and access`,
    );
  }
  if (
    /Available and testable products|Developer surfaces|Products and APIs|Tuotteet ja API:t|Produkter och API:er/iu.test(
      html,
    )
  ) {
    failures.push(`${relativeFile}: obsolete split catalog headings remain`);
  }
  for (const indexUrl of productIndexUrls) {
    if (!html.includes(indexUrl)) {
      failures.push(
        `${relativeFile}: reciprocal product-index hreflang is incomplete`,
      );
      break;
    }
  }
  const routePrefix =
    htmlLang === "fi" ? "" : htmlLang === "sv" ? "/se" : "/en";
  for (const requiredLink of [
    `${routePrefix}/web-services/`,
    `${routePrefix}/bank-simulator/`,
    `${routePrefix}/processing-api/`,
  ]) {
    if (!html.includes(`href="${requiredLink}"`)) {
      failures.push(`${relativeFile}: missing catalog link ${requiredLink}`);
    }
  }
  if (/href="\/(?:en\/|se\/)?(?:daily-cash|invoicing)\//u.test(html)) {
    failures.push(
      `${relativeFile}: draft product leaked into the public catalog`,
    );
  }
  for (const requiredName of [connectivityName, "Processing API"]) {
    if (!html.includes(requiredName)) {
      failures.push(`${relativeFile}: missing API boundary ${requiredName}`);
    }
  }
  if (html.includes('data-catalog-entry="file-exchange-api"')) {
    failures.push(
      `${relativeFile}: File Exchange duplicates the Bank Connectivity product`,
    );
  }
  for (const requiredLabel of requiredAccessLabels) {
    if (!html.includes(requiredLabel)) {
      failures.push(
        `${relativeFile}: missing product stage or access label ${requiredLabel}`,
      );
    }
  }
}

const processingApiPages = [
  [
    "processing-api/index.html",
    "/processing-api/",
    "fi",
    "Valmistele pankin maksuaineistot hallitusti",
    "Testiympäristö",
    "Rekisteröinti vaaditaan",
    "Maksullinen tilaus vaaditaan",
    "Pyydä käyttöoikeus",
  ],
  [
    "en/processing-api/index.html",
    "/en/processing-api/",
    "en",
    "Prepare bank payment files with control and approval",
    "Test environment",
    "Registration required",
    "Paid subscription required",
    "Request access",
  ],
  [
    "se/processing-api/index.html",
    "/se/processing-api/",
    "sv",
    "Förbered bankens betalningsfiler med kontroll och godkännande",
    "Testmiljö",
    "Registrering krävs",
    "Betald prenumeration krävs",
    "Begär åtkomst",
  ],
];
const processingApiUrls = processingApiPages.map(
  ([, canonicalPath]) => `https://www.isecure.fi${canonicalPath}`,
);
const processingExampleUrl =
  "https://github.com/isecurefi/isecure-ts-client/blob/main/examples/processing-manual-upload/README.md";
for (const [
  relativeFile,
  canonicalPath,
  htmlLang,
  heading,
  environmentLabel,
  registrationLabel,
  subscriptionLabel,
  admissionLabel,
] of processingApiPages) {
  const file = join(dist, relativeFile);
  if (!existsSync(file)) {
    failures.push(`Processing API: missing ${relativeFile}`);
    continue;
  }
  const html = readFileSync(file, "utf8");
  if (!html.includes(`<html lang="${htmlLang}"`)) {
    failures.push(`${relativeFile}: wrong Processing API document language`);
  }
  if (!new RegExp(`<h1[^>]*>${heading}</h1>`, "u").test(html)) {
    failures.push(
      `${relativeFile}: plain-language Processing API H1 is missing`,
    );
  }
  if (
    !html.includes(
      `rel="canonical" href="https://www.isecure.fi${canonicalPath}"`,
    )
  ) {
    failures.push(`${relativeFile}: wrong Processing API canonical URL`);
  }
  for (const url of processingApiUrls) {
    if (!html.includes(url)) {
      failures.push(
        `${relativeFile}: reciprocal Processing API hreflang is incomplete`,
      );
      break;
    }
  }
  for (const marker of [
    'data-catalog-record="processing-api"',
    'data-catalog-kind="product"',
    'data-catalog-stage="experimental"',
    'data-catalog-visibility="soft-launch"',
    "Experimental",
    environmentLabel,
    registrationLabel,
    subscriptionLabel,
    admissionLabel,
    "Bank Connectivity",
    "pain.001.001.09",
    processingExampleUrl,
  ]) {
    if (!html.includes(marker)) {
      failures.push(
        `${relativeFile}: missing Processing API boundary ${marker}`,
      );
    }
  }
}

for (const retiredPath of [
  "data-api/index.html",
  "en/data-api/index.html",
  "se/data-api/index.html",
]) {
  if (existsSync(join(dist, retiredPath))) {
    failures.push(`Retired Banking Data API page still exists: ${retiredPath}`);
  }
}

for (const [relativeFile, recordId, stage, visibility] of [
  ["web-services/index.html", "bank-connectivity", "ga", "promoted"],
  ["bank-simulator/index.html", "bank-simulation", "beta", "soft-launch"],
  ["daily-cash/index.html", "daily-cash", "planned", "draft"],
  ["invoicing/index.html", "invoicing", "planned", "draft"],
]) {
  const html = readFileSync(join(dist, relativeFile), "utf8");
  for (const marker of [
    `data-catalog-record="${recordId}"`,
    `data-catalog-stage="${stage}"`,
    `data-catalog-visibility="${visibility}"`,
  ]) {
    if (!html.includes(marker)) {
      failures.push(`${relativeFile}: missing registry marker ${marker}`);
    }
  }
}

for (const [relativeFile, simulatorPath, reason] of [
  [
    "web-services/index.html",
    "/bank-simulator/",
    "Oikeat pankkikanavat eivät tarjoa vastaavaa asiakkaan hallitsemaa testiympäristöä.",
  ],
  [
    "en/web-services/index.html",
    "/en/bank-simulator/",
    "Real bank channels do not provide an equivalent customer-controlled test environment.",
  ],
  [
    "se/web-services/index.html",
    "/se/bank-simulator/",
    "Riktiga bankkanaler erbjuder inte en motsvarande testmiljö som kunden kan styra.",
  ],
]) {
  const html = readFileSync(join(dist, relativeFile), "utf8");
  if (!html.includes(`href="${simulatorPath}"`) || !html.includes(reason)) {
    failures.push(
      `${relativeFile}: Bank Simulator product link or testing rationale is missing`,
    );
  }
}

for (const [relativeFile, providerId] of [
  ["nordea/index.html", "nordea"],
  ["op/index.html", "op"],
]) {
  const html = readFileSync(join(dist, relativeFile), "utf8");
  if (
    !html.includes(`data-catalog-record="${providerId}"`) ||
    !html.includes(`data-provider-id="${providerId}"`)
  ) {
    failures.push(
      `${relativeFile}: registry-backed provider detail is missing`,
    );
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
for (const productIndexUrl of productIndexUrls) {
  if (!sitemapText.includes(productIndexUrl)) {
    failures.push(`Sitemap: missing product index URL ${productIndexUrl}`);
  }
}
for (const processingApiUrl of processingApiUrls) {
  if (!sitemapText.includes(processingApiUrl)) {
    failures.push(`Sitemap: missing Processing API URL ${processingApiUrl}`);
  }
}
if (sitemapText.includes("/data-api/")) {
  failures.push("Sitemap: retired Banking Data API route remains public");
}

const astroConfigSource = readFileSync(join(root, "astro.config.mjs"), "utf8");
if (!astroConfigSource.includes("getDraftCatalogPaths")) {
  failures.push("Sitemap exclusions are not derived from the product registry");
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
if (!llmsText.includes("https://www.isecure.fi/en/products/")) {
  failures.push("llms.txt does not link to the product index");
}
if (!llmsText.includes("https://www.isecure.fi/en/processing-api/")) {
  failures.push("llms.txt does not link to the Processing API guide");
}
for (const requiredAccessStatement of [
  "Beta test-environment enrollment",
  "Experimental payment workflow",
  "registration, a paid subscription, and an access request are required",
]) {
  if (!llmsText.includes(requiredAccessStatement)) {
    failures.push(
      `llms.txt is missing product stage or access: ${requiredAccessStatement}`,
    );
  }
}
if (/gpgtest|Banking Data API|\/data-api\//iu.test(llmsText)) {
  failures.push("llms.txt exposes an internal or retired API name");
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
