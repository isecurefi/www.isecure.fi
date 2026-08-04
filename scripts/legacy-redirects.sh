#!/usr/bin/env bash
# One-time SEO consolidation: 301 the legacy apex (isecure.fi) marketing pages
# to their www equivalents via ALB rules, and the stale pre-Astro www objects
# via a CloudFront function. Leaves the legacy PHP apps (registers/sympatia,
# ws-*status.php) and the boilingdata.com ALB rule untouched.
#
# Mappings (from GSC 90d data, 2026-08-01):
#   apex /ws-kanava.php|.html   -> www /web-services/  (legacy WS-channel page)
#   apex /wsapi_v2/*            -> www /               (170 imp, old API docs)
#   apex /tiliote/**            -> 403                 (legacy upload tool and PDF)
#   apex /index-en.html         -> www /en/            (old EN homepage)
#   www  /ws-kanava.html        -> www /web-services/  (pre-Astro leftover, pos ~5)
#   www  /ws-api.html           -> www /               (pre-Astro leftover)
#   www  /{fi,en,se}/tiliote/   -> corresponding /camt-053/ landing page
set -euo pipefail

REGION=eu-west-1
LISTENER_ARN=arn:aws:elasticloadbalancing:eu-west-1:589434896614:listener/app/isecurefi/903510e898890d25/82679a15f22111bb
TILIOTE_403_RULE=arn:aws:elasticloadbalancing:eu-west-1:589434896614:listener-rule/app/isecurefi/903510e898890d25/82679a15f22111bb/5f9302fdf6fe11fb
DIST_ID=E2OQLWDIQMPMBP
FN_NAME=isecure-legacy-redirects
BUCKET=www2.isecure.fi
BACKUP_DIR="${TMPDIR:-/tmp}/isecure-s3-backup"

apex_rule() { # priority, redirect-path, json array of path patterns
  aws elbv2 create-rule --region "$REGION" --listener-arn "$LISTENER_ARN" \
    --priority "$1" \
    --conditions "[
      {\"Field\":\"host-header\",\"HostHeaderConfig\":{\"Values\":[\"isecure.fi\"]}},
      {\"Field\":\"path-pattern\",\"PathPatternConfig\":{\"Values\":$3}}
    ]" \
    --actions "[{\"Type\":\"redirect\",\"RedirectConfig\":{
      \"Protocol\":\"HTTPS\",\"Port\":\"443\",\"Host\":\"www.isecure.fi\",
      \"Path\":\"$2\",\"Query\":\"#{query}\",\"StatusCode\":\"HTTP_301\"}}]" \
    --query "Rules[0].Priority" --output text
}

echo "== 1/6 ALB: keep apex /tiliote and /tilivuosi2011 blocked ahead of redirects"
aws elbv2 set-rule-priorities --region "$REGION" \
  --rule-priorities "RuleArn=$TILIOTE_403_RULE,Priority=2" \
  --query "Rules[].Priority" --output text

echo "== 2/6 ALB: create apex 301 rules (priorities 3-5, host-scoped to isecure.fi)"
apex_rule 3 "/web-services/" '["/ws-kanava.php","/ws-kanava.html"]'
apex_rule 4 "/"              '["/wsapi_v2","/wsapi_v2/*"]'
apex_rule 5 "/en/"           '["/index-en.html"]'

echo "== 3/6 CloudFront: create + publish redirect function for stale www paths"
FN_CODE="$(mktemp)"
cat > "$FN_CODE" <<'EOF'
function handler(event) {
  var req = event.request;
  var map = {
    "/ws-kanava.html": "/web-services/",
    "/ws-api.html": "/",
    "/tiliote": "/camt-053/",
    "/tiliote/": "/camt-053/",
    "/en/tiliote": "/en/camt-053/",
    "/en/tiliote/": "/en/camt-053/",
    "/se/tiliote": "/se/camt-053/",
    "/se/tiliote/": "/se/camt-053/"
  };
  var to = map[req.uri];
  if (to) {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: { location: { value: "https://www.isecure.fi" + to } }
    };
  }
  return req;
}
EOF
FN_ARN=$(aws cloudfront create-function --name "$FN_NAME" \
  --function-config "Comment=301s for legacy www paths,Runtime=cloudfront-js-2.0" \
  --function-code "fileb://$FN_CODE" \
  --query "FunctionSummary.FunctionMetadata.FunctionARN" --output text)
FN_ETAG=$(aws cloudfront describe-function --name "$FN_NAME" --query ETag --output text)
aws cloudfront publish-function --name "$FN_NAME" --if-match "$FN_ETAG" \
  --query "FunctionSummary.Status" --output text

echo "== 4/6 CloudFront: attach function to distribution $DIST_ID (viewer-request)"
CFG_JSON="$(mktemp)" CFG_NEW="$(mktemp)"
ETAG=$(aws cloudfront get-distribution-config --id "$DIST_ID" --query ETag --output text)
aws cloudfront get-distribution-config --id "$DIST_ID" --query DistributionConfig > "$CFG_JSON"
python3 - "$CFG_JSON" "$CFG_NEW" "$FN_ARN" <<'EOF'
import json, sys
cfg = json.load(open(sys.argv[1]))
cfg["DefaultCacheBehavior"]["FunctionAssociations"] = {
    "Quantity": 1,
    "Items": [{"FunctionARN": sys.argv[3], "EventType": "viewer-request"}],
}
json.dump(cfg, open(sys.argv[2], "w"))
EOF
aws cloudfront update-distribution --id "$DIST_ID" --if-match "$ETAG" \
  --distribution-config "file://$CFG_NEW" \
  --query "Distribution.Status" --output text

echo "   waiting for the distribution to finish deploying (a few minutes)..."
aws cloudfront wait distribution-deployed --id "$DIST_ID"

echo "== 5/6 S3: back up then delete the stale pre-Astro objects"
mkdir -p "$BACKUP_DIR"
for key in ws-kanava.html ws-api.html; do
  aws s3 cp "s3://$BUCKET/$key" "$BACKUP_DIR/$key"
  aws s3 rm "s3://$BUCKET/$key"
done
echo "backups in $BACKUP_DIR"

echo "== 6/6 CloudFront: invalidate redirected paths"
aws cloudfront create-invalidation --distribution-id "$DIST_ID" \
  --paths "/ws-kanava.html" "/ws-api.html" "/tiliote*" "/en/tiliote*" "/se/tiliote*" \
  --query "Invalidation.Status" --output text

echo "DONE. Verify with:"
echo "  curl -sI https://isecure.fi/ws-kanava.php | grep -i location      # -> www/web-services/"
echo "  curl -sI https://isecure.fi/wsapi_v2/index.html | grep -i location # -> www/"
echo "  curl -sI https://isecure.fi/tiliote/kuvaus.pdf | head -1            # -> 403"
echo "  curl -sI https://www.isecure.fi/ws-kanava.html | grep -i location  # -> www/web-services/ (after CF deploy, ~5 min)"
