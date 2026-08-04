#!/usr/bin/env bash
# One-time cleanup of pre-Astro leftovers in s3://www2.isecure.fi/ (the
# additive `aws s3 cp` deploy never deletes). Verified 2026-08-01:
#   - CloudFront (E2OQLWDIQMPMBP) has NO CustomErrorResponses -> error.html unused
#   - clean URLs for these prefixes already 403 via CloudFront; only explicit
#     .../file paths still serve
#   - NOT listed: admin-app/ — ACTIVE (isecure-admin 1.0.0 installers, June 2026)
set -euo pipefail

BUCKET=s3://www2.isecure.fi
BACKUP_DIR="${TMPDIR:-/tmp}/isecure-s3-cleanup-backup"
mkdir -p "$BACKUP_DIR"

echo "== backup everything first ($BACKUP_DIR)"
aws s3 sync "$BUCKET/fi/" "$BACKUP_DIR/fi/"
aws s3 sync "$BUCKET/js/" "$BACKUP_DIR/js/"
aws s3 sync "$BUCKET/font-awesome/" "$BACKUP_DIR/font-awesome/"
aws s3 cp "$BUCKET/error.html" "$BACKUP_DIR/error.html"

echo "== delete: fi/ (old Jan-2025 site copy, 4 objects, 79 KB — source of the junk sitemap URLs)"
aws s3 rm "$BUCKET/fi/" --recursive

echo "== delete: js/ (pre-Astro JS assets, 15 objects, 1.4 MB)"
aws s3 rm "$BUCKET/js/" --recursive

echo "== delete: font-awesome/ (pre-Astro icon font, 34 objects, 755 KB)"
aws s3 rm "$BUCKET/font-awesome/" --recursive

echo "== delete: error.html (2018, 61 B, unreferenced) and .DS_Store (Finder junk)"
aws s3 rm "$BUCKET/error.html"
aws s3 rm "$BUCKET/.DS_Store"

# -- Deliberately COMMENTED OUT — decide first, then uncomment: --------------
# boilingdata/ (2021, 5 objects, 9.5 MB: aws-amplify bundles): belongs to the
# BoilingData product. Confirm nothing at www.boilingdata.com links to
# https://www.isecure.fi/boilingdata/... before removing.
#aws s3 sync "$BUCKET/boilingdata/" "$BACKUP_DIR/boilingdata/" && aws s3 rm "$BUCKET/boilingdata/" --recursive
# ---------------------------------------------------------------------------

echo "== invalidate deleted paths"
aws cloudfront create-invalidation --distribution-id E2OQLWDIQMPMBP \
  --paths "/fi/*" "/js/*" "/font-awesome/*" "/error.html" "/.DS_Store" \
  --query "Invalidation.Status" --output text

echo "DONE. Backups in $BACKUP_DIR"
