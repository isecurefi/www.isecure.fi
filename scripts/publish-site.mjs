import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { basename, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { releaseCacheControl } from "./cache-policy.mjs";

export { releaseCacheControl } from "./cache-policy.mjs";

const DEFAULT_BUCKET = "www2.isecure.fi";
const DEFAULT_DISTRIBUTION = "E2OQLWDIQMPMBP";
const DEFAULT_ORIGIN = "S3-www2.isecure.fi";
const RELEASE_ROOT = "_releases";
const DEPLOYMENT_ROOT = "_deployments";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? process.cwd(),
    encoding: "utf8",
    env: options.env ?? process.env,
    stdio: options.capture ? "pipe" : "inherit",
  });
  if (result.status !== 0) {
    const detail = options.capture ? result.stderr.trim() : "";
    throw new Error(
      `${command} ${args.join(" ")} failed${detail ? `: ${detail}` : ""}`,
    );
  }
  return options.capture ? result.stdout : "";
}

function runJson(command, args) {
  return JSON.parse(run(command, args, { capture: true }));
}

export function assertReleaseId(value) {
  if (!/^[0-9a-f]{7,40}$/u.test(value)) {
    throw new Error(`Invalid Git release revision: ${value}`);
  }
  return value;
}

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? listFiles(path) : [path];
    })
    .sort();
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----\s+[A-Za-z0-9+/=\r\n]{40,}-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u,
  /\bAKIA[0-9A-Z]{16}\b/u,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/u,
  /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/u,
];

export function detectSecret(text) {
  return secretPatterns.find((pattern) => pattern.test(text))?.source;
}

export function createReleaseManifest(distDirectory, revision, sourceDate) {
  assertReleaseId(revision);
  const files = listFiles(distDirectory)
    .filter((path) => basename(path) !== "release-manifest.json")
    .map((path) => {
      const bytes = readFileSync(path);
      return {
        path: relative(distDirectory, path).split(sep).join("/"),
        bytes: bytes.length,
        sha256: sha256(bytes),
      };
    });
  return {
    schemaVersion: 1,
    cachePolicy: "revalidate-stable-urls-v1",
    revision,
    sourceDate,
    files,
  };
}

export function withOriginPath(distributionConfig, originId, originPath) {
  const copy = structuredClone(distributionConfig);
  const matches = copy.Origins.Items.filter((origin) => origin.Id === originId);
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one CloudFront origin ${originId}`);
  }
  matches[0].OriginPath = originPath;
  return copy;
}

function currentRevision() {
  return assertReleaseId(
    run("git", ["rev-parse", "HEAD"], { capture: true }).trim(),
  );
}

function assertCleanWorktree() {
  const status = run("git", ["status", "--porcelain"], {
    capture: true,
  }).trim();
  if (status !== "") {
    throw new Error("Publication requires a clean, committed website worktree");
  }
}

function assertSecretFree(distDirectory) {
  for (const path of listFiles(distDirectory)) {
    if (!/\.(?:css|html|js|json|map|txt|xml)$/u.test(path)) continue;
    const match = detectSecret(readFileSync(path, "utf8"));
    if (match) {
      throw new Error(
        `Possible secret in ${relative(distDirectory, path)} (${match})`,
      );
    }
  }
}

function getDistribution(distributionId) {
  return runJson("aws", [
    "cloudfront",
    "get-distribution-config",
    "--id",
    distributionId,
    "--output",
    "json",
  ]);
}

function originPath(distribution, originId) {
  const matches = distribution.DistributionConfig.Origins.Items.filter(
    (origin) => origin.Id === originId,
  );
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one CloudFront origin ${originId}`);
  }
  return matches[0].OriginPath ?? "";
}

function switchOrigin(distributionId, originId, targetPath) {
  const current = getDistribution(distributionId);
  const config = withOriginPath(
    current.DistributionConfig,
    originId,
    targetPath,
  );
  const temporaryDirectory = mkdtempSync(join(tmpdir(), "isecure-publish-"));
  const configPath = join(temporaryDirectory, "distribution.json");
  try {
    writeFileSync(configPath, `${JSON.stringify(config)}\n`, { mode: 0o600 });
    run(
      "aws",
      [
        "cloudfront",
        "update-distribution",
        "--id",
        distributionId,
        "--if-match",
        current.ETag,
        "--distribution-config",
        `file://${configPath}`,
        "--output",
        "json",
      ],
      { capture: true },
    );
    run("aws", [
      "cloudfront",
      "wait",
      "distribution-deployed",
      "--id",
      distributionId,
    ]);
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

function invalidate(distributionId) {
  const response = runJson("aws", [
    "cloudfront",
    "create-invalidation",
    "--distribution-id",
    distributionId,
    "--paths",
    "/*",
    "--output",
    "json",
  ]);
  run("aws", [
    "cloudfront",
    "wait",
    "invalidation-completed",
    "--distribution-id",
    distributionId,
    "--id",
    response.Invalidation.Id,
  ]);
}

function uploadRelease(bucket, prefix, distDirectory) {
  const destination = `s3://${bucket}/${prefix}/`;
  run("aws", [
    "s3",
    "cp",
    `${distDirectory}/`,
    destination,
    "--recursive",
    "--cache-control",
    releaseCacheControl(""),
    "--checksum-algorithm",
    "SHA256",
    "--no-progress",
    "--only-show-errors",
  ]);
  run("aws", [
    "s3",
    "cp",
    `${join(distDirectory, "_astro")}/`,
    `${destination}_astro/`,
    "--recursive",
    "--cache-control",
    releaseCacheControl("_astro/"),
    "--checksum-algorithm",
    "SHA256",
    "--no-progress",
    "--only-show-errors",
  ]);
  run("aws", [
    "s3",
    "cp",
    join(distDirectory, "wsapi_v2.json"),
    `${destination}wsapi_v2.json`,
    "--cache-control",
    releaseCacheControl("wsapi_v2.json"),
    "--content-type",
    "application/json; charset=utf-8",
    "--checksum-algorithm",
    "SHA256",
    "--no-progress",
    "--only-show-errors",
  ]);
  run("node", [
    "scripts/upload-directory-indexes.mjs",
    destination,
    distDirectory,
  ]);
}

function readExistingReleaseManifest(bucket, prefix) {
  const result = spawnSync(
    "aws",
    ["s3", "cp", `s3://${bucket}/${prefix}/release-manifest.json`, "-"],
    { encoding: "utf8", stdio: "pipe" },
  );
  if (result.status === 0) return result.stdout;
  if (/404|NoSuchKey|does not exist/iu.test(result.stderr)) return undefined;
  throw new Error(
    `Unable to inspect existing release: ${result.stderr.trim()}`,
  );
}

function releaseIsComplete(bucket, prefix) {
  const result = spawnSync(
    "aws",
    [
      "s3api",
      "head-object",
      "--bucket",
      bucket,
      "--key",
      `${prefix}/_release-complete.json`,
    ],
    { encoding: "utf8", stdio: "pipe" },
  );
  if (result.status === 0) return true;
  if (/404|Not Found|does not exist/iu.test(result.stderr)) return false;
  throw new Error(`Unable to inspect release marker: ${result.stderr.trim()}`);
}

export function releaseNeedsUpload(existingManifest, manifestText, complete) {
  if (existingManifest !== undefined && existingManifest !== manifestText) {
    throw new Error("Immutable website release already differs");
  }
  return existingManifest === undefined || !complete;
}

function markReleaseComplete(bucket, prefix, revision) {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), "isecure-release-"));
  const markerPath = join(temporaryDirectory, "complete.json");
  try {
    writeFileSync(
      markerPath,
      `${JSON.stringify({ schemaVersion: 1, revision })}\n`,
      { mode: 0o600 },
    );
    run(
      "aws",
      [
        "s3api",
        "put-object",
        "--bucket",
        bucket,
        "--key",
        `${prefix}/_release-complete.json`,
        "--body",
        markerPath,
        "--content-type",
        "application/json",
        "--cache-control",
        "no-store",
      ],
      { capture: true },
    );
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

function assertReleaseExists(bucket, revision) {
  const prefix = `${RELEASE_ROOT}/${assertReleaseId(revision)}`;
  for (const key of ["release-manifest.json", "_release-complete.json"]) {
    run(
      "aws",
      ["s3api", "head-object", "--bucket", bucket, "--key", `${prefix}/${key}`],
      { capture: true },
    );
  }
}

function putDeploymentRecord(
  bucket,
  revision,
  previousOriginPath,
  originPathValue,
) {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), "isecure-deploy-"));
  const recordPath = join(temporaryDirectory, "deployment.json");
  try {
    writeFileSync(
      recordPath,
      `${JSON.stringify(
        {
          schemaVersion: 1,
          revision,
          previousOriginPath,
          originPath: originPathValue,
        },
        null,
        2,
      )}\n`,
      { mode: 0o600 },
    );
    run("aws", [
      "s3api",
      "put-object",
      "--bucket",
      bucket,
      "--key",
      `${DEPLOYMENT_ROOT}/${revision}.json`,
      "--body",
      recordPath,
      "--content-type",
      "application/json",
      "--cache-control",
      "no-store",
    ]);
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

function verifyProduction(expectedRelease) {
  run("corepack", ["yarn", "verify:production"], {
    env: {
      ...process.env,
      ...(expectedRelease ? { EXPECTED_RELEASE: expectedRelease } : {}),
    },
  });
}

function releaseFromOriginPath(path) {
  const match = new RegExp(`^/${RELEASE_ROOT}/([0-9a-f]{7,40})$`, "u").exec(
    path,
  );
  return match?.[1];
}

function assertManagedOriginPath(path) {
  if (path === "" || releaseFromOriginPath(path)) return path;
  throw new Error(`Unmanaged website origin path: ${path}`);
}

export function validateDeploymentRecord(record, revision, currentOriginPath) {
  if (
    record?.schemaVersion !== 1 ||
    record.revision !== revision ||
    record.originPath !== currentOriginPath
  ) {
    throw new Error(`Invalid deployment record for release ${revision}`);
  }
  assertManagedOriginPath(record.previousOriginPath);
  return record;
}

function readDeploymentRecord(bucket, revision, currentOriginPath) {
  return validateDeploymentRecord(
    JSON.parse(
      run(
        "aws",
        ["s3", "cp", `s3://${bucket}/${DEPLOYMENT_ROOT}/${revision}.json`, "-"],
        { capture: true },
      ),
    ),
    revision,
    currentOriginPath,
  );
}

function parseOptions(args) {
  const options = {
    command: args[0] ?? "plan",
    bucket: DEFAULT_BUCKET,
    distribution: DEFAULT_DISTRIBUTION,
    origin: DEFAULT_ORIGIN,
    to: undefined,
  };
  for (let index = 1; index < args.length; index += 1) {
    const name = args[index];
    const value = args[index + 1];
    if (!["--bucket", "--distribution", "--origin", "--to"].includes(name)) {
      throw new Error(`Unknown publication option: ${name}`);
    }
    if (!value)
      throw new Error(`Missing value for publication option: ${name}`);
    if (name === "--bucket") options.bucket = value;
    if (name === "--distribution") options.distribution = value;
    if (name === "--origin") options.origin = value;
    if (name === "--to") options.to = value;
    index += 1;
  }
  return options;
}

function plan(options) {
  const revision = currentRevision();
  const distribution = getDistribution(options.distribution);
  const previousOriginPath = originPath(distribution, options.origin);
  const candidateOriginPath = `/${RELEASE_ROOT}/${revision}`;
  console.log(
    JSON.stringify(
      {
        revision,
        bucket: options.bucket,
        distribution: options.distribution,
        origin: options.origin,
        previousOriginPath,
        candidateOriginPath,
      },
      null,
      2,
    ),
  );
}

function publish(options) {
  assertCleanWorktree();
  const revision = currentRevision();
  const distDirectory = resolve("dist");
  if (!statSync(distDirectory).isDirectory()) {
    throw new Error("dist/ does not exist; run the production build first");
  }
  assertSecretFree(distDirectory);
  const sourceDate = run("git", ["show", "-s", "--format=%cI", revision], {
    capture: true,
  }).trim();
  const manifest = createReleaseManifest(distDirectory, revision, sourceDate);
  const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileSync(join(distDirectory, "release-manifest.json"), manifestText);

  const distribution = getDistribution(options.distribution);
  const previousOriginPath = originPath(distribution, options.origin);
  const prefix = `${RELEASE_ROOT}/${revision}`;
  const candidateOriginPath = `/${prefix}`;
  const existingManifest = readExistingReleaseManifest(options.bucket, prefix);
  if (
    releaseNeedsUpload(
      existingManifest,
      manifestText,
      releaseIsComplete(options.bucket, prefix),
    )
  ) {
    uploadRelease(options.bucket, prefix, distDirectory);
    markReleaseComplete(options.bucket, prefix, revision);
  } else {
    console.log(`Reusing byte-identical immutable release ${revision}`);
  }
  assertReleaseExists(options.bucket, revision);

  if (previousOriginPath !== candidateOriginPath) {
    putDeploymentRecord(
      options.bucket,
      revision,
      previousOriginPath,
      candidateOriginPath,
    );
    switchOrigin(options.distribution, options.origin, candidateOriginPath);
    invalidate(options.distribution);
  }
  try {
    verifyProduction(revision);
  } catch (error) {
    if (previousOriginPath !== candidateOriginPath) {
      console.error("Candidate verification failed; restoring predecessor");
      switchOrigin(options.distribution, options.origin, previousOriginPath);
      invalidate(options.distribution);
      verifyProduction(releaseFromOriginPath(previousOriginPath));
    }
    throw error;
  }
  console.log(`Published immutable website release ${revision}`);
}

function rollback(options) {
  assertCleanWorktree();
  const distribution = getDistribution(options.distribution);
  const currentOriginPath = originPath(distribution, options.origin);
  const currentRelease = releaseFromOriginPath(currentOriginPath);
  let targetPath;
  if (options.to === "root") {
    targetPath = "";
  } else if (options.to) {
    const targetRelease = assertReleaseId(options.to);
    assertReleaseExists(options.bucket, targetRelease);
    targetPath = `/${RELEASE_ROOT}/${targetRelease}`;
  } else {
    if (!currentRelease) {
      throw new Error("Current distribution does not name a managed release");
    }
    targetPath = readDeploymentRecord(
      options.bucket,
      currentRelease,
      currentOriginPath,
    ).previousOriginPath;
  }
  if (targetPath === currentOriginPath) {
    throw new Error("Rollback target is already active");
  }
  switchOrigin(options.distribution, options.origin, targetPath);
  invalidate(options.distribution);
  verifyProduction(releaseFromOriginPath(targetPath));
  console.log(`Rolled back website origin to ${targetPath || "bucket root"}`);
}

const isMain =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const options = parseOptions(process.argv.slice(2));
  if (options.command === "plan") plan(options);
  else if (options.command === "publish") publish(options);
  else if (options.command === "rollback") rollback(options);
  else throw new Error(`Unknown publication command: ${options.command}`);
}
