import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const dryRun = process.argv.includes("--dry-run");
const args = process.argv.slice(2).filter((arg) => arg !== "--dry-run");
const [bucketArg = "s3://www2.isecure.fi/", distArg = "dist"] = args;
const bucket = bucketArg.endsWith("/") ? bucketArg : `${bucketArg}/`;
const distDir = join(process.cwd(), distArg);

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
  const key = `${relativeDir}/`;
  const destination = `${bucket}${key}`;
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
      bucket.replace(/^s3:\/\//, "").replace(/\/$/, ""),
      "--key",
      key,
      "--body",
      indexFile,
      "--content-type",
      "text/html; charset=utf-8",
      "--cache-control",
      "public, max-age=3600",
    ],
    { stdio: "inherit" },
  );

  if (result.status !== 0) {
    throw new Error(`Failed to upload ${indexFile} to ${destination}`);
  }
}

console.log(
  `${dryRun ? "Prepared" : "Uploaded"} ${indexFiles.length} directory index aliases to ${bucket}`,
);
