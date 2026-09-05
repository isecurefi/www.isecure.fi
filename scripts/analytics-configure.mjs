import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { JWT } from "google-auth-library";

const apply = process.argv.includes("--apply");
const propertyId = process.env.GA4_PROPERTY_ID;
const keyFile =
  process.env.GSC_KEY_FILE || process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyFile || !/^\d+$/u.test(propertyId ?? "")) {
  throw new Error(
    "Set a service-account key path and numeric GA4_PROPERTY_ID in .env",
  );
}
const key = JSON.parse(readFileSync(keyFile, "utf8"));
const client = new JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: [
    apply
      ? "https://www.googleapis.com/auth/analytics.edit"
      : "https://www.googleapis.com/auth/analytics.readonly",
  ],
});
const property = `properties/${propertyId}`;
const base = "https://analyticsadmin.googleapis.com/v1alpha/";

async function request(path, options = {}) {
  return (await client.request({ url: `${base}${path}`, ...options })).data;
}

async function main() {
  const streams = await request(`${property}/dataStreams`);
  const stream = streams.dataStreams?.find(
    (entry) => entry.webStreamData?.measurementId === "G-BJ6B7H7K8E",
  );
  if (!stream)
    throw new Error(
      "Property does not contain the expected ISECure measurement ID",
    );
  const [keyEvents, dimensions, redaction, enhanced, userData] =
    await Promise.all([
      request(`${property}/keyEvents`),
      request(`${property}/customDimensions?pageSize=200`),
      request(`${stream.name}/dataRedactionSettings`),
      request(`${stream.name}/enhancedMeasurementSettings`),
      request(`${property}/userProvidedDataSettings`),
    ]);
  const changes = [];
  if (
    !keyEvents.keyEvents?.some((entry) => entry.eventName === "generate_lead")
  ) {
    changes.push({
      path: `${property}/keyEvents`,
      method: "POST",
      data: {
        eventName: "generate_lead",
        countingMethod: "ONCE_PER_EVENT",
      },
    });
  }
  for (const [parameterName, displayName] of [
    ["source_surface", "Website link location"],
    ["form_name", "Website form"],
    ["lead_type", "Website lead type"],
  ]) {
    if (
      !dimensions.customDimensions?.some(
        (entry) =>
          entry.parameterName === parameterName && entry.scope === "EVENT",
      )
    ) {
      changes.push({
        path: `${property}/customDimensions`,
        method: "POST",
        data: {
          parameterName,
          displayName,
          scope: "EVENT",
          disallowAdsPersonalization: true,
        },
      });
    }
  }
  if (!redaction.emailRedactionEnabled) {
    changes.push({
      path: `${stream.name}/dataRedactionSettings?updateMask=email_redaction_enabled`,
      method: "PATCH",
      data: { emailRedactionEnabled: true },
    });
  }
  const automaticFields = {
    outboundClicksEnabled: false,
    siteSearchEnabled: false,
    pageChangesEnabled: false,
    formInteractionsEnabled: false,
    fileDownloadsEnabled: false,
  };
  const updatedFields = Object.fromEntries(
    Object.entries(automaticFields).filter(
      ([name, value]) => Boolean(enhanced[name]) !== value,
    ),
  );
  if (Object.keys(updatedFields).length > 0) {
    const updateMask = Object.keys(updatedFields)
      .map((name) =>
        name.replace(/[A-Z]/gu, (letter) => `_${letter.toLowerCase()}`),
      )
      .join(",");
    changes.push({
      path: `${stream.name}/enhancedMeasurementSettings?updateMask=${updateMask}`,
      method: "PATCH",
      data: updatedFields,
    });
  }
  mkdirSync(".growth-data", { recursive: true });
  writeFileSync(
    ".growth-data/analytics-settings-plan.json",
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        property,
        stream: stream.name,
        before: { keyEvents, dimensions, redaction, enhanced, userData },
        changes,
      },
      null,
      2,
    ),
    { mode: 0o600 },
  );
  console.log(
    JSON.stringify(
      {
        property,
        stream: stream.name,
        mode: apply ? "apply" : "read-only",
        changes,
      },
      null,
      2,
    ),
  );
  if (apply) {
    for (const { path, ...options } of changes) {
      await request(path, options);
      console.log(`Applied ${options.method} ${path}`);
    }
  }
  if (
    userData.userProvidedDataCollectionEnabled ||
    userData.automaticallyDetectedDataCollectionEnabled
  ) {
    console.log(
      "Account user-provided-data collection remains enabled. Disable it in Google tag settings; its Admin API resource is read-only. The website separately blocks automatic detection through its tag policy.",
    );
  }
}

main().catch((error) => {
  console.error(
    `Analytics configuration failed: ${error.response?.status ?? ""} ${error.response?.data?.error?.message || error.message}`,
  );
  process.exitCode = 1;
});
