// The S3 release prefix is immutable, but stable public URLs resolve to a new
// prefix at deployment time. Only Astro's content-hashed asset URLs are immutable
// from a visitor's perspective; HTML and directory aliases must revalidate.
export function releaseCacheControl(relativePath) {
  return relativePath.startsWith("_astro/")
    ? "public, max-age=31536000, immutable"
    : "public, max-age=0, must-revalidate";
}
