import assert from "node:assert/strict";
import test from "node:test";

import {
  buildComparisonWindows,
  findSearchOpportunities,
  percentageChange,
  renderGrowthMarkdown,
} from "./growth-metrics.mjs";

test("comparison windows are complete, adjacent, and deterministic", () => {
  assert.deepEqual(
    buildComparisonWindows(new Date("2026-08-20T12:00:00Z"), 28),
    {
      days: 28,
      reportingDelayDays: 3,
      current: { startDate: "2026-07-21", endDate: "2026-08-17" },
      prior: { startDate: "2026-06-23", endDate: "2026-07-20" },
    },
  );
  assert.throws(() => buildComparisonWindows(new Date(), 1), /7 to 366/u);
  assert.throws(
    () => buildComparisonWindows(new Date(), 28, 0),
    /Reporting delay/u,
  );
});

test("percentage changes make a new baseline explicit", () => {
  assert.equal(percentageChange(12, 10), 0.2);
  assert.equal(percentageChange(0, 0), 0);
  assert.equal(percentageChange(1, 0), null);
});

test("search opportunities apply thresholds and find legacy results", () => {
  const queries = [
    { keys: ["camt 053"], impressions: 80, position: 9, ctr: 0 },
    { keys: ["bank api"], impressions: 60, position: 14, ctr: 0.01 },
    { keys: ["noise"], impressions: 4, position: 9, ctr: 0 },
  ];
  const pairs = [
    {
      keys: ["old statement", "https://isecure.fi/tiliote/kuvaus.pdf"],
      impressions: 40,
      position: 8,
      ctr: 0,
    },
  ];
  const result = findSearchOpportunities(queries, pairs);
  assert.deepEqual(
    result.lowCtr.map((row) => row.keys[0]),
    ["camt 053"],
  );
  assert.deepEqual(
    result.strikingDistance.map((row) => row.keys[0]),
    ["camt 053", "bank api"],
  );
  assert.equal(result.legacyPages.length, 1);
});

test("Markdown states the evidence boundary and missing analytics setup", () => {
  const report = {
    generatedAt: "2026-08-20T00:00:00.000Z",
    window: buildComparisonWindows(new Date("2026-08-20T00:00:00Z"), 28),
    search: {
      current: { clicks: 2, impressions: 100, ctr: 0.02, position: 8 },
      prior: { clicks: 1, impressions: 80, ctr: 0.0125, position: 9 },
      opportunities: { lowCtr: [], strikingDistance: [], legacyPages: [] },
    },
    analytics: { status: "unconfigured", reason: "GA4_PROPERTY_ID is not set" },
    actions: [],
  };
  const markdown = renderGrowthMarkdown(report);
  assert.match(markdown, /not approval for a public claim/u);
  assert.match(markdown, /explicit-consent collection starts 2026-08-21/u);
  assert.match(markdown, /automatic collection starts 2026-08-28/u);
  assert.match(markdown, /GA4_PROPERTY_ID is not set/u);
});
