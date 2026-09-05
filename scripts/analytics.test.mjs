import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(
  new URL("../src/utils/analytics.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
});

function browser(hostname = "www.isecure.fi") {
  const scripts = [];
  const listeners = {};
  const context = {
    exports: {},
    URL,
    window: {},
    location: new URL(`https://${hostname}/en/?private=example#fragment`),
    document: {
      referrer: "https://example.org/resource/?private=example#fragment",
      body: { dataset: { analyticsLanguage: "en" } },
      getElementById: (id) => scripts.find((script) => script.id === id),
      createElement: () => ({}),
      head: { append: (script) => scripts.push(script) },
      addEventListener: (name, handler) => {
        listeners[name] = handler;
      },
    },
    Element: class {
      closest() {
        return this;
      }
    },
  };
  context.window.location = context.location;
  runInNewContext(outputText, context);
  return { context, scripts, listeners, analytics: context.exports };
}

function commands(context) {
  return context.window.dataLayer.filter(
    (entry) => Object.prototype.toString.call(entry) === "[object Arguments]",
  );
}

test("Google's command protocol receives configuration and lead events", () => {
  const { context, scripts, analytics } = browser();
  const existingEvent = { event: "existing-event" };
  context.window.dataLayer = [existingEvent];
  analytics.initAnalytics();
  analytics.trackLead({
    formName: "contact",
    leadType: "inquiry",
    language: "en",
  });

  const queued = commands(context);
  assert.deepEqual(
    queued.map((entry) => entry[0]),
    ["policy", "consent", "set", "js", "config", "event"],
  );
  assert.equal(
    queued.find((entry) => entry[0] === "config")[1],
    "G-BJ6B7H7K8E",
  );
  assert.equal(queued.at(-1)[1], "generate_lead");
  assert.equal(context.window.dataLayer[0], existingEvent);
  assert.equal(scripts.length, 1);
  assert.equal(
    scripts[0].src,
    "https://www.googletagmanager.com/gtag/js?id=G-BJ6B7H7K8E",
  );
  analytics.initAnalytics();
  assert.equal(scripts.length, 1);
  assert.equal(
    commands(context).filter((entry) => entry[0] === "config").length,
    1,
  );
});

test("configuration excludes URL queries and fragments and disables ad signals", () => {
  const { context, analytics } = browser();
  analytics.initAnalytics();
  const queued = commands(context);
  const config = queued.find((entry) => entry[0] === "config")[2];
  assert.equal(config.page_location, "https://www.isecure.fi/en/");
  assert.equal(config.page_referrer, "https://example.org/resource/");
  assert.equal(config.allow_google_signals, false);
  assert.equal(config.allow_ad_personalization_signals, false);
  assert.equal(config.user_data, null);
  assert.equal(queued[0][1], "detect_user_provided_data");
  assert.equal(queued[0][2](), false);
  assert.equal(queued[1][2].ad_storage, "denied");
  assert.equal(queued[1][2].ad_user_data, "denied");
  assert.equal(queued[1][2].ad_personalization, "denied");
  assert.equal(queued[1][2].analytics_storage, undefined);
  assert.equal(queued[2][1], "user_data");
  assert.equal(queued[2][2], null);
});

test("product clicks use Google's event command protocol", () => {
  const { context, listeners, analytics } = browser();
  analytics.initAnalytics();
  const target = new context.Element();
  target.dataset = {
    analyticsContentType: "developer_resource",
    analyticsItemId: "typescript-sdk",
    analyticsSource: "homepage-quickstart",
  };
  listeners.click({ target });
  const event = commands(context).at(-1);
  assert.equal(event[0], "event");
  assert.equal(event[1], "select_content");
  assert.equal(event[2].item_id, "typescript-sdk");
  assert.equal(event[2].source_surface, "homepage-quickstart");
});

test("preview and legacy hosts do not load the production analytics tag", () => {
  for (const hostname of [
    "localhost",
    "127.0.0.1",
    "preview.cloudfront.net",
    "isecure.fi",
  ]) {
    const { context, scripts, analytics } = browser(hostname);
    analytics.initAnalytics();
    assert.equal(scripts.length, 0);
    assert.equal(context.window.gtag, undefined);
  }
});
