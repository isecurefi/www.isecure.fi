import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const site = resolve(import.meta.dirname, "../..");
const app = resolve(
  process.env.ISECURE_ADMIN_SOURCE ?? resolve(site, "../isecure-admin-app"),
);
const requireApp = createRequire(resolve(app, "package.json"));
const { createServer } = await import(
  pathToFileURL(requireApp.resolve("vite"))
);
const { chromium } = requireApp("playwright");
const output = resolve(site, "public/images/admin-app");
await mkdir(output, { recursive: true });
const server = await createServer({
  configFile: false,
  root: import.meta.dirname,
  resolve: {
    alias: {
      "@admin": resolve(app, "src"),
      react: resolve(app, "node_modules/react"),
      "react-dom": resolve(app, "node_modules/react-dom"),
    },
  },
  esbuild: { jsx: "automatic" },
  define: { __ISECURE_DISTRIBUTION__: JSON.stringify("public") },
  server: {
    host: "127.0.0.1",
    port: 4334,
    strictPort: true,
    fs: { allow: [site, app] },
  },
});
await server.listen();
const browser = await chromium.launch();
try {
  for (const view of ["accounts", "certificates"]) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 800 },
      deviceScaleFactor: 2,
      locale: "en-GB",
      timezoneId: "Europe/Helsinki",
    });
    // Refuse all external traffic, even if a component acquires a new background effect.
    const external = [];
    await page.route("**/*", (route) => {
      if (new URL(route.request().url()).origin === "http://127.0.0.1:4334")
        return route.continue();
      external.push(route.request().url());
      return route.abort();
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.clock.setFixedTime(new Date("2026-09-27T07:00:00Z"));
    await page.goto(`http://127.0.0.1:4334/?view=${view}`, {
      waitUntil: "networkidle",
    });
    await page.getByRole("table").waitFor();
    if (view === "accounts")
      await page
        .getByRole("article", { name: "Tenant licenses" })
        .getByText("9", { exact: true })
        .waitFor();
    await page.evaluate(() => document.fonts.ready);
    const text = await page.locator("main").innerText();
    const emails = text.match(/[\w.+-]+@[\w.-]+/g) ?? [];
    assert(
      emails.length >= 6 && emails.every((email) => email.endsWith(".example")),
    );
    assert.deepEqual(
      external,
      [],
      "Screenshot must not contact external services",
    );
    assert.deepEqual(errors, [], "Screenshot must render without errors");
    await page
      .locator("main")
      .screenshot({ path: resolve(output, `${view}.png`) });
    await page.close();
    console.log(
      `Captured ${view}: synthetic identities; no external requests.`,
    );
  }
} finally {
  await browser.close();
  await server.close();
}
