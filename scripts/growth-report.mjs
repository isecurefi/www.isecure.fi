import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

import { JWT } from "google-auth-library";

import {
  buildComparisonWindows,
  buildFollowUpActions,
  findSearchOpportunities,
  renderGrowthMarkdown,
} from "./growth-metrics.mjs";

const keyFile =
  process.env.GSC_KEY_FILE || process.env.GOOGLE_APPLICATION_CREDENTIALS;
const siteUrl = process.env.GSC_SITE_URL || "sc-domain:isecure.fi";
const ga4PropertyId = process.env.GA4_PROPERTY_ID;
const days = Number(process.argv[2]) || 28;
const window = buildComparisonWindows(new Date(), days);

if (!keyFile) {
  throw new Error(
    "Set GSC_KEY_FILE (or GOOGLE_APPLICATION_CREDENTIALS). See .env.example.",
  );
}
if (ga4PropertyId && !/^\d+$/u.test(ga4PropertyId)) {
  throw new Error("GA4_PROPERTY_ID must be the numeric GA4 property ID");
}

const key = JSON.parse(readFileSync(keyFile, "utf8"));
const client = new JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/analytics.readonly",
  ],
});

async function querySearchConsole(dateRange, dimensions = []) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const response = await client.request({
    url,
    method: "POST",
    data: {
      ...dateRange,
      dimensions,
      rowLimit: dimensions.length === 0 ? 1 : 25_000,
      dataState: "final",
    },
  });
  const rows = response.data.rows ?? [];
  if (dimensions.length > 0 && rows.length === 25_000) {
    console.warn(
      `WARNING: Search Console ${dimensions.join("+")} results reached the 25,000-row cap`,
    );
  }
  return rows;
}

function searchSummary(rows) {
  const row = rows[0] ?? {};
  return {
    clicks: Number(row.clicks ?? 0),
    impressions: Number(row.impressions ?? 0),
    ctr: Number(row.ctr ?? 0),
    position: Number(row.position ?? 0),
  };
}

function gaMetric(row, index) {
  return Number(row?.metricValues?.[index]?.value ?? 0);
}

async function queryAnalytics(dateRange) {
  if (!ga4PropertyId) {
    return {
      status: "unconfigured",
      reason: "GA4_PROPERTY_ID is not set",
    };
  }

  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${ga4PropertyId}:runReport`;
  const [summaryResponse, eventResponse] = await Promise.all([
    client.request({
      url,
      method: "POST",
      data: {
        dateRanges: [dateRange],
        metrics: [
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "activeUsers" },
        ],
      },
    }),
    client.request({
      url,
      method: "POST",
      data: {
        dateRanges: [dateRange],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            inListFilter: {
              values: ["generate_lead", "select_content"],
            },
          },
        },
      },
    }),
  ]);
  const summary = summaryResponse.data.rows?.[0];
  const events = Object.fromEntries(
    (eventResponse.data.rows ?? []).map((row) => [
      row.dimensionValues?.[0]?.value,
      gaMetric(row, 0),
    ]),
  );
  return {
    status: "available",
    sessions: gaMetric(summary, 0),
    pageViews: gaMetric(summary, 1),
    activeUsers: gaMetric(summary, 2),
    selectContent: events.select_content ?? 0,
    generateLead: events.generate_lead ?? 0,
  };
}

function conciseApiError(error) {
  const status = error.response?.status;
  const message = error.response?.data?.error?.message || error.message;
  return status ? `Google API ${status}: ${message}` : message;
}

async function main() {
  const [currentSummary, priorSummary, queries, queryPages] = await Promise.all(
    [
      querySearchConsole(window.current),
      querySearchConsole(window.prior),
      querySearchConsole(window.current, ["query"]),
      querySearchConsole(window.current, ["query", "page"]),
    ],
  );

  let currentAnalytics;
  let priorAnalytics;
  try {
    [currentAnalytics, priorAnalytics] = await Promise.all([
      queryAnalytics(window.current),
      queryAnalytics(window.prior),
    ]);
  } catch (error) {
    currentAnalytics = {
      status: "unavailable",
      reason: conciseApiError(error),
    };
    priorAnalytics = currentAnalytics;
  }

  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    window,
    search: {
      property: siteUrl,
      current: searchSummary(currentSummary),
      prior: searchSummary(priorSummary),
      opportunities: findSearchOpportunities(queries, queryPages),
    },
    analytics: {
      property: ga4PropertyId ?? null,
      status: currentAnalytics.status,
      reason: currentAnalytics.reason,
      current:
        currentAnalytics.status === "available" ? currentAnalytics : undefined,
      prior: priorAnalytics.status === "available" ? priorAnalytics : undefined,
    },
  };
  report.actions = buildFollowUpActions(report);

  const outputDirectory = ".growth-data";
  const reportDate = report.generatedAt.slice(0, 10);
  mkdirSync(outputDirectory, { recursive: true });
  const json = `${JSON.stringify(report, null, 2)}\n`;
  const markdown = renderGrowthMarkdown(report);
  for (const name of [`growth-report-${reportDate}`, "latest"]) {
    writeFileSync(`${outputDirectory}/${name}.json`, json, { mode: 0o600 });
    writeFileSync(`${outputDirectory}/${name}.md`, markdown, { mode: 0o600 });
  }

  console.log(markdown);
  console.log(`Local report written to ${outputDirectory}/latest.{json,md}`);
}

main().catch((error) => {
  console.error(`Growth report failed: ${conciseApiError(error)}`);
  process.exitCode = 1;
});
