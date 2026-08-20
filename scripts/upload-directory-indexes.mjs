import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

const dryRun = process.argv.includes("--dry-run");
const args = process.argv.slice(2).filter((arg) => arg !== "--dry-run");
const [bucketArg = "s3://www2.isecure.fi/", distArg = "dist"] = args;
const bucketUrl = new URL(
  bucketArg.endsWith("/") ? bucketArg : `${bucketArg}/`,
);
if (bucketUrl.protocol !== "s3:" || bucketUrl.hostname === "") {
  throw new Error(`Expected an S3 URL, received: ${bucketArg}`);
}
const bucketName = bucketUrl.hostname;
const keyPrefix = bucketUrl.pathname.replace(/^\/+|\/+$/gu, "");
const distDir = resolve(process.cwd(), distArg);

if (!existsSync(distDir)) {
  throw new Error(`Build directory does not exist: ${distDir}`);
}

function findIndexFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      return findIndexFiles(entryPath);
    }
    return entry.name === "index.html" ? [entryPath] : [];
  });
}

const indexFiles = findIndexFiles(distDir).filter(
  (file) => relative(distDir, file) !== "index.html",
);

for (const indexFile of indexFiles) {
  const relativeDir = relative(distDir, dirname(indexFile))
    .split(sep)
    .join("/");
  const key = `${keyPrefix ? `${keyPrefix}/` : ""}${relativeDir}/`;
  const destination = `s3://${bucketName}/${key}`;
  if (dryRun) {
    console.log(`${indexFile} -> ${destination}`);
    continue;
  }

  const result = spawnSync(
    "aws",
    [
      "s3api",
      "put-object",
      "--bucket",
      bucketName,
      "--key",
      key,
      "--body",
      indexFile,
      "--content-type",
      "text/html; charset=utf-8",
      "--cache-control",
      keyPrefix
        ? "public, max-age=31536000, immutable"
        : "public, max-age=3600",
    ],
    { encoding: "utf8", stdio: "pipe" },
  );

  if (result.status !== 0) {
    throw new Error(
      `Failed to upload ${indexFile} to ${destination}: ${result.stderr.trim()}`,
    );
  }
}

console.log(
  `${dryRun ? "Prepared" : "Uploaded"} ${indexFiles.length} directory index aliases to s3://${bucketName}/${keyPrefix}`,
);
