import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  assertReleaseId,
  createReleaseManifest,
  detectSecret,
  releaseCacheControl,
  releaseNeedsUpload,
  validateDeploymentRecord,
  withOriginPath,
} from "./publish-site.mjs";

test("the stable OpenAPI URL revalidates while release assets stay immutable", () => {
  assert.equal(
    releaseCacheControl("wsapi_v2.json"),
    "public, max-age=0, must-revalidate",
  );
  assert.equal(
    releaseCacheControl("_astro/index.content-hash.js"),
    "public, max-age=31536000, immutable",
  );
});

test("release IDs must be Git revisions", () => {
  assert.equal(assertReleaseId("0123456789abcdef"), "0123456789abcdef");
  assert.throws(() => assertReleaseId("../../live"), /Invalid Git release/u);
});

test("release manifest is deterministic and excludes itself", () => {
  const directory = mkdtempSync(join(tmpdir(), "isecure-manifest-"));
  try {
    mkdirSync(join(directory, "en"));
    writeFileSync(join(directory, "en", "index.html"), "English\n");
    writeFileSync(join(directory, "index.html"), "Finnish\n");
    writeFileSync(join(directory, "release-manifest.json"), "old\n");
    const first = createReleaseManifest(
      directory,
      "0123456789abcdef",
      "2026-08-20T00:00:00Z",
    );
    const second = createReleaseManifest(
      directory,
      "0123456789abcdef",
      "2026-08-20T00:00:00Z",
    );
    assert.deepEqual(first, second);
    assert.deepEqual(
      first.files.map((file) => file.path),
      ["en/index.html", "index.html"],
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("origin switch changes only the exact configured origin", () => {
  const original = {
    Origins: {
      Items: [
        { Id: "site", OriginPath: "" },
        { Id: "other", OriginPath: "/fixed" },
      ],
    },
  };
  const updated = withOriginPath(original, "site", "/_releases/0123456");
  assert.equal(original.Origins.Items[0].OriginPath, "");
  assert.equal(updated.Origins.Items[0].OriginPath, "/_releases/0123456");
  assert.equal(updated.Origins.Items[1].OriginPath, "/fixed");
  assert.throws(
    () => withOriginPath(original, "missing", "/candidate"),
    /exactly one CloudFront origin/u,
  );
});

test("secret scanner catches high-confidence credential shapes", () => {
  assert.equal(detectSecret("ordinary public documentation"), undefined);
  assert.equal(
    detectSecret("Placeholder: -----BEGIN PRIVATE KEY-----"),
    undefined,
  );
  assert.match(
    detectSecret(
      "-----BEGIN PRIVATE KEY-----\nABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuv==\n-----END PRIVATE KEY-----",
    ) ?? "",
    /PRIVATE KEY/u,
  );
  assert.match(detectSecret("AKIAABCDEFGHIJKLMNOP") ?? "", /AKIA/u);
});

test("rollback accepts only the active release's managed predecessor", () => {
  const revision = "0123456789abcdef";
  const currentOriginPath = `/_releases/${revision}`;
  assert.equal(
    validateDeploymentRecord(
      {
        schemaVersion: 1,
        revision,
        originPath: currentOriginPath,
        previousOriginPath: "",
      },
      revision,
      currentOriginPath,
    ).previousOriginPath,
    "",
  );
  assert.throws(
    () =>
      validateDeploymentRecord(
        {
          schemaVersion: 1,
          revision,
          originPath: "/_releases/different",
          previousOriginPath: "/unmanaged",
        },
        revision,
        currentOriginPath,
      ),
    /Invalid deployment record/u,
  );
  assert.throws(
    () =>
      validateDeploymentRecord(
        {
          schemaVersion: 1,
          revision,
          originPath: currentOriginPath,
          previousOriginPath: "/unmanaged",
        },
        revision,
        currentOriginPath,
      ),
    /Unmanaged website origin path/u,
  );
});

test("directory aliases support absolute build paths under a release prefix", () => {
  const directory = mkdtempSync(join(tmpdir(), "isecure-aliases-"));
  try {
    mkdirSync(join(directory, "en"));
    writeFileSync(join(directory, "index.html"), "Root\n");
    writeFileSync(join(directory, "en", "index.html"), "English\n");
    const result = spawnSync(
      process.execPath,
      [
        "scripts/upload-directory-indexes.mjs",
        "--dry-run",
        "s3://site/_releases/0123456/",
        directory,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /s3:\/\/site\/_releases\/0123456\/en\//u);
    assert.match(result.stdout, /Prepared 1 directory index aliases/u);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("a partial release is resumed and a completed release is immutable", () => {
  const manifest = '{"revision":"0123456"}\n';
  assert.equal(releaseNeedsUpload(undefined, manifest, false), true);
  assert.equal(releaseNeedsUpload(manifest, manifest, false), true);
  assert.equal(releaseNeedsUpload(manifest, manifest, true), false);
  assert.throws(
    () => releaseNeedsUpload('{"revision":"other"}\n', manifest, false),
    /already differs/u,
  );
});
