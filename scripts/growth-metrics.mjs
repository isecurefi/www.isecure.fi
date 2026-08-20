const EXPECTED_CTR = [
  0, 0.28, 0.15, 0.1, 0.07, 0.05, 0.04, 0.03, 0.025, 0.02, 0.018,
];

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function shiftDate(date, days) {
  const shifted = new Date(date);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted;
}

export function buildComparisonWindows(
  today = new Date(),
  days = 28,
  reportingDelayDays = 3,
) {
  if (!Number.isInteger(days) || days < 7 || days > 366) {
    throw new Error("Growth report days must be an integer from 7 to 366");
  }
  if (
    !Number.isInteger(reportingDelayDays) ||
    reportingDelayDays < 1 ||
    reportingDelayDays > 14
  ) {
    throw new Error("Reporting delay must be an integer from 1 to 14 days");
  }
  const end = shiftDate(today, -reportingDelayDays);
  const currentStart = shiftDate(end, -(days - 1));
  const priorEnd = shiftDate(currentStart, -1);
  const priorStart = shiftDate(priorEnd, -(days - 1));
  return {
    days,
    reportingDelayDays,
    current: { startDate: isoDate(currentStart), endDate: isoDate(end) },
    prior: { startDate: isoDate(priorStart), endDate: isoDate(priorEnd) },
  };
}

export function percentageChange(current, prior) {
  if (prior === 0) return current === 0 ? 0 : null;
  return (current - prior) / prior;
}

function expectedCtr(position) {
  return EXPECTED_CTR[Math.round(position)] ?? 0.015;
}

export function findSearchOpportunities(
  queries,
  queryPages,
  { minImpressions = 30 } = {},
) {
  const relevant = queries.filter((row) => row.impressions >= minImpressions);
  const strikingDistance = relevant
    .filter((row) => row.position >= 8 && row.position <= 20)
    .sort((left, right) => right.impressions - left.impressions)
    .slice(0, 25);
  const lowCtr = relevant
    .filter(
      (row) => row.position <= 10 && row.ctr < 0.5 * expectedCtr(row.position),
    )
    .sort((left, right) => right.impressions - left.impressions)
    .slice(0, 25);

  const legacyPages = queryPages
    .filter((row) => {
      const page = row.keys[1];
      if (!page) return false;
      const url = new URL(page);
      return (
        url.hostname !== "www.isecure.fi" ||
        ["/tiliote/", "/tilivuosi2011/", "/ws-kanava.php"].some((path) =>
          url.pathname.startsWith(path),
        )
      );
    })
    .filter((row) => row.impressions >= minImpressions)
    .sort((left, right) => right.impressions - left.impressions)
    .slice(0, 25);

  return { strikingDistance, lowCtr, legacyPages };
}

function formatChange(value) {
  if (value === null) return "new baseline";
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(1)}%`;
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function safeCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function searchTable(rows) {
  if (rows.length === 0) return "No qualifying rows.";
  return [
    "| Query | Impressions | Position | CTR |",
    "| --- | ---: | ---: | ---: |",
    ...rows.map(
      (row) =>
        `| ${safeCell(row.keys[0])} | ${row.impressions} | ${row.position.toFixed(1)} | ${formatPercent(row.ctr)} |`,
    ),
  ].join("\n");
}

function legacyTable(rows) {
  if (rows.length === 0) return "No qualifying legacy results.";
  return [
    "| Query | Legacy URL | Impressions |",
    "| --- | --- | ---: |",
    ...rows.map(
      (row) =>
        `| ${safeCell(row.keys[0])} | ${safeCell(row.keys[1])} | ${row.impressions} |`,
    ),
  ].join("\n");
}

export function buildFollowUpActions(report) {
  const actions = [];
  if (report.search.opportunities.legacyPages.length > 0) {
    actions.push({
      kind: "legacy-search-result",
      priority: "high",
      instruction:
        "Review the legacy URLs still receiving search impressions. Preserve protected-data responses, then use redirects or Search Console removal only where the destination and disclosure boundary are verified.",
    });
  }
  if (report.search.opportunities.lowCtr.length > 0) {
    actions.push({
      kind: "low-search-ctr",
      priority: "medium",
      instruction:
        "Review search intent, title, and description for the highest-impression low-CTR queries. Do not change product claims without their normal evidence review.",
    });
  }
  if (report.search.opportunities.strikingDistance.length > 0) {
    actions.push({
      kind: "striking-distance",
      priority: "medium",
      instruction:
        "Check whether the ranking page directly answers the highest-impression page-one/page-two query with cited, current facts and a clear next action.",
    });
  }
  if (report.analytics.status !== "available") {
    actions.push({
      kind: "analytics-configuration",
      priority: "high",
      instruction:
        "Set GA4_PROPERTY_ID and grant the reporting service account Analytics Viewer access before using conversion metrics.",
    });
  }
  return actions;
}

export function renderGrowthMarkdown(report) {
  const search = report.search;
  const clicksChange = percentageChange(
    search.current.clicks,
    search.prior.clicks,
  );
  const impressionsChange = percentageChange(
    search.current.impressions,
    search.prior.impressions,
  );
  const lines = [
    "# ISECure website growth report",
    "",
    `Generated: ${report.generatedAt}`,
    `Comparison: ${report.window.current.startDate}–${report.window.current.endDate} versus ${report.window.prior.startDate}–${report.window.prior.endDate}`,
    "",
    "This local report is decision input, not approval for a public claim or automatic content change.",
    "",
    "## Search discovery",
    "",
    `- Clicks: ${search.current.clicks} (${formatChange(clicksChange)})`,
    `- Impressions: ${search.current.impressions} (${formatChange(impressionsChange)})`,
    `- CTR: ${formatPercent(search.current.ctr)}`,
    `- Average position: ${search.current.position.toFixed(1)}`,
    "",
    "### Low-CTR queries",
    "",
    searchTable(search.opportunities.lowCtr.slice(0, 10)),
    "",
    "### Striking-distance queries",
    "",
    searchTable(search.opportunities.strikingDistance.slice(0, 10)),
    "",
    "### Legacy search results",
    "",
    legacyTable(search.opportunities.legacyPages.slice(0, 10)),
    "",
    "## Consent-based journey measurement",
    "",
  ];

  if (report.analytics.status === "available") {
    const current = report.analytics.current;
    const prior = report.analytics.prior;
    lines.push(
      `- Sessions: ${current.sessions} (${formatChange(percentageChange(current.sessions, prior.sessions))})`,
      `- Page views: ${current.pageViews} (${formatChange(percentageChange(current.pageViews, prior.pageViews))})`,
      `- Product/resource selections: ${current.selectContent} (${formatChange(percentageChange(current.selectContent, prior.selectContent))})`,
      `- Successful contact requests: ${current.generateLead} (${formatChange(percentageChange(current.generateLead, prior.generateLead))})`,
      `- Session-to-contact conversion: ${formatPercent(current.sessions === 0 ? 0 : current.generateLead / current.sessions)}`,
    );
  } else {
    lines.push(`- Unavailable: ${report.analytics.reason}`);
  }

  lines.push("", "## Follow-up", "");
  if (report.actions.length === 0)
    lines.push("No automated finding crossed its review threshold.");
  else {
    for (const action of report.actions) {
      lines.push(`- **${action.priority}:** ${action.instruction}`);
    }
  }
  lines.push(
    "",
    "Before changing the site, compare these signals with buyer interviews, current product evidence, broken-link/accessibility/performance checks, and the previous report. Add an independently verifiable task to bankfiles-platform/TASKS.md for any admitted change.",
    "",
  );
  return lines.join("\n");
}
