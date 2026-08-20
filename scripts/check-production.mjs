const checks = [
  {
    name: "HTML API documentation is available",
    url: "https://www.isecure.fi/wsapi_v2/",
    status: 200,
    contentType: "text/html",
    contains: ['data-renderer="scalar"', 'data-reference-only="true"'],
  },
  {
    name: "OpenAPI document is available",
    url: "https://www.isecure.fi/wsapi_v2.json",
    status: 200,
    contentType: "application/json",
    contains: '"version": "v2.8.0"',
  },
  {
    name: "API service terms are available",
    url: "https://www.isecure.fi/ws-api-terms/",
    status: 200,
    contentType: "text/html",
    contains: "customer- or partner-specific",
  },
  {
    name: "Finnish Bank Simulator soft launch is available",
    url: "https://www.isecure.fi/bank-simulator/",
    status: 200,
    contentType: "text/html",
    contains: [">Pankkisimulaattori</h1>", "Maksullinen tilaus vaaditaan"],
  },
  {
    name: "English Bank Simulator soft launch is available",
    url: "https://www.isecure.fi/en/bank-simulator/",
    status: 200,
    contentType: "text/html",
    contains: [">Bank Simulator</h1>", "Paid subscription required"],
  },
  {
    name: "Swedish Bank Simulator soft launch is available",
    url: "https://www.isecure.fi/se/bank-simulator/",
    status: 200,
    contentType: "text/html",
    contains: [">Banksimulator</h1>", "Betald prenumeration krävs"],
  },
  {
    name: "Sitemap exposes every Bank Simulator locale",
    url: "https://www.isecure.fi/sitemap-0.xml",
    status: 200,
    contentType: "application/xml",
    contains: [
      "https://www.isecure.fi/bank-simulator/",
      "https://www.isecure.fi/en/bank-simulator/",
      "https://www.isecure.fi/se/bank-simulator/",
    ],
  },
  {
    name: "Bank Simulator remains off the homepage",
    url: "https://www.isecure.fi/",
    status: 200,
    contentType: "text/html",
    excludes: [
      'href="/bank-simulator/"',
      'href="/en/bank-simulator/"',
      'href="/se/bank-simulator/"',
    ],
  },
  {
    name: "Legacy HTML API documentation redirects to www",
    url: "https://isecure.fi/wsapi_v2/index.html?source=production-check",
    status: 301,
    location: "https://www.isecure.fi:443/wsapi_v2/?source=production-check",
  },
  {
    name: "Legacy OpenAPI document redirects to www",
    url: "https://isecure.fi/wsapi_v2.json?source=production-check",
    status: 301,
    location:
      "https://www.isecure.fi:443/wsapi_v2.json?source=production-check",
  },
  {
    name: "Legacy statement files are blocked",
    url: "https://isecure.fi/tiliote/kuvaus.pdf",
    status: 403,
  },
  {
    name: "Legacy annual statement files are blocked",
    url: "https://isecure.fi/tilivuosi2011/2011-tiliotteet.pdf",
    status: 403,
  },
  {
    name: "camt.053 canonical slash redirect",
    url: "https://www.isecure.fi/camt-053?source=production-check",
    status: 301,
    location: "https://www.isecure.fi/camt-053/?source=production-check",
  },
  {
    name: "ISO 20022 canonical slash redirect",
    url: "https://www.isecure.fi/iso-20022",
    status: 301,
    location: "https://www.isecure.fi/iso-20022/",
  },
  {
    name: "Retired statement page redirects to camt.053",
    url: "https://www.isecure.fi/tiliote/index.html",
    status: 301,
    location: "https://www.isecure.fi/camt-053/",
  },
  {
    name: "Retired banking API page redirects home",
    url: "https://www.isecure.fi/en/banking-api/index.html",
    status: 301,
    location: "https://www.isecure.fi/en/",
  },
  {
    name: "Legacy thank-you page redirects to the current route",
    url: "https://www.isecure.fi/thankyou.html?source=production-check",
    status: 301,
    location: "https://www.isecure.fi/thankyou/?source=production-check",
  },
];

let failures = 0;

const expectedRelease = process.env.EXPECTED_RELEASE;
if (expectedRelease) {
  checks.push({
    name: "Expected immutable website release is active",
    url: "https://www.isecure.fi/release-manifest.json",
    status: 200,
    contentType: "application/json",
    contains: `"revision": "${expectedRelease}"`,
  });
}

for (const check of checks) {
  try {
    const response = await fetch(check.url, { redirect: "manual" });
    const location = response.headers.get("location");
    const statusMatches = response.status === check.status;
    const locationMatches =
      check.location === undefined || location === check.location;
    const contentType = response.headers.get("content-type") ?? "";
    const contentTypeMatches =
      check.contentType === undefined ||
      contentType.includes(check.contentType);
    const expectedContents = Array.isArray(check.contains)
      ? check.contains
      : check.contains === undefined
        ? []
        : [check.contains];
    const excludedContents = Array.isArray(check.excludes)
      ? check.excludes
      : check.excludes === undefined
        ? []
        : [check.excludes];
    const body =
      expectedContents.length === 0 && excludedContents.length === 0
        ? ""
        : await response.text();
    const bodyMatches =
      expectedContents.length === 0 ||
      expectedContents.every((expected) => body.includes(expected));
    const bodyExcludes = excludedContents.every(
      (excluded) => !body.includes(excluded),
    );

    if (
      !statusMatches ||
      !locationMatches ||
      !contentTypeMatches ||
      !bodyMatches ||
      !bodyExcludes
    ) {
      failures += 1;
      console.error(
        `FAIL ${check.name}: status=${response.status}, location=${location ?? "-"}, content-type=${contentType || "-"}`,
      );
      continue;
    }

    console.log(`PASS ${check.name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${check.name}: ${error.message}`);
  }
}

const homepage = await fetch("https://www.isecure.fi/");
const requiredHeaders = [
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
];

for (const header of requiredHeaders) {
  if (!homepage.headers.has(header)) {
    failures += 1;
    console.error(`FAIL homepage is missing ${header}`);
  } else {
    console.log(`PASS homepage sends ${header}`);
  }
}

if (failures > 0) {
  process.exitCode = 1;
  console.error(`${failures} production check(s) failed`);
} else {
  console.log("All production checks passed");
}
