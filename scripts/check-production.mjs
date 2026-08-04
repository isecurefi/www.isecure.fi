const checks = [
  {
    name: "HTML API documentation is available",
    url: "https://isecure.fi/wsapi_v2/index.html",
    status: 200,
  },
  {
    name: "OpenAPI document is available",
    url: "https://isecure.fi/wsapi_v2.json",
    status: 200,
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
];

let failures = 0;

for (const check of checks) {
  try {
    const response = await fetch(check.url, { redirect: "manual" });
    const location = response.headers.get("location");
    const statusMatches = response.status === check.status;
    const locationMatches =
      check.location === undefined || location === check.location;

    if (!statusMatches || !locationMatches) {
      failures += 1;
      console.error(
        `FAIL ${check.name}: status=${response.status}, location=${location ?? "-"}`,
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
