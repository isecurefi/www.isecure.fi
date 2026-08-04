#!/usr/bin/env bash
# Reconcile the legacy apex and CloudFront redirects used by www.isecure.fi.
#
# API documentation is deliberately excluded from redirects:
#   https://isecure.fi/wsapi_v2/index.html
#   https://isecure.fi/wsapi_v2.json
# Both URLs are a protected compatibility surface and must continue returning
# HTTP 200 until a one-to-one replacement has been deployed.
set -euo pipefail

REGION=eu-west-1
DIST_ID=E2OQLWDIQMPMBP
FN_NAME=isecure-legacy-redirects
BUCKET=www2.isecure.fi
SECURITY_HEADERS_POLICY=67f7725c-6f97-4210-82d7-5512b31e9d03
TILIOTE_403_RULE=arn:aws:elasticloadbalancing:eu-west-1:589434896614:listener-rule/app/isecurefi/903510e898890d25/82679a15f22111bb/5f9302fdf6fe11fb
WS_REDIRECT_RULE=arn:aws:elasticloadbalancing:eu-west-1:589434896614:listener-rule/app/isecurefi/903510e898890d25/82679a15f22111bb/2af05530f2eaa95b
BAD_API_REDIRECT_RULE=arn:aws:elasticloadbalancing:eu-west-1:589434896614:listener-rule/app/isecurefi/903510e898890d25/82679a15f22111bb/4ae07659dea60f84
INDEX_EN_REDIRECT_RULE=arn:aws:elasticloadbalancing:eu-west-1:589434896614:listener-rule/app/isecurefi/903510e898890d25/82679a15f22111bb/0cc2e0cf3b445cb7
BACKUP_DIR="${TMPDIR:-/tmp}/isecure-s3-backup"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FN_CODE="$SCRIPT_DIR/cloudfront-redirects.js"

redirect_action() {
  local path=$1
  printf '[{"Type":"redirect","RedirectConfig":{"Protocol":"HTTPS","Port":"443","Host":"www.isecure.fi","Path":"%s","Query":"#{query}","StatusCode":"HTTP_301"}}]' "$path"
}

echo "== 1/7 ALB: remove the erroneous API-documentation redirect"
if aws elbv2 describe-rules --region "$REGION" \
  --rule-arns "$BAD_API_REDIRECT_RULE" >/dev/null 2>&1; then
  aws elbv2 delete-rule --region "$REGION" --rule-arn "$BAD_API_REDIRECT_RULE"
fi

echo "== 2/7 ALB: reconcile the intended apex rules"
aws elbv2 modify-rule --region "$REGION" --rule-arn "$WS_REDIRECT_RULE" \
  --conditions '[{"Field":"host-header","HostHeaderConfig":{"Values":["isecure.fi"]}},{"Field":"path-pattern","PathPatternConfig":{"Values":["/ws-kanava.php","/ws-kanava.html"]}}]' \
  --actions "$(redirect_action '/web-services/')" >/dev/null
aws elbv2 modify-rule --region "$REGION" --rule-arn "$INDEX_EN_REDIRECT_RULE" \
  --conditions '[{"Field":"host-header","HostHeaderConfig":{"Values":["isecure.fi"]}},{"Field":"path-pattern","PathPatternConfig":{"Values":["/index-en.html"]}}]' \
  --actions "$(redirect_action '/en/')" >/dev/null
aws elbv2 set-rule-priorities --region "$REGION" --rule-priorities \
  "RuleArn=$TILIOTE_403_RULE,Priority=2" \
  "RuleArn=$WS_REDIRECT_RULE,Priority=3" \
  "RuleArn=$INDEX_EN_REDIRECT_RULE,Priority=4" >/dev/null

echo "== 3/7 CloudFront: update and publish the checked-in redirect function"
FN_ETAG=$(aws cloudfront describe-function --name "$FN_NAME" --stage DEVELOPMENT \
  --query ETag --output text)
aws cloudfront update-function --name "$FN_NAME" --if-match "$FN_ETAG" \
  --function-config 'Comment=Canonical and legacy redirects for www.isecure.fi,Runtime=cloudfront-js-2.0' \
  --function-code "fileb://$FN_CODE" >/dev/null
FN_ETAG=$(aws cloudfront describe-function --name "$FN_NAME" --stage DEVELOPMENT \
  --query ETag --output text)
aws cloudfront publish-function --name "$FN_NAME" --if-match "$FN_ETAG" >/dev/null
FN_ARN=$(aws cloudfront describe-function --name "$FN_NAME" --stage LIVE \
  --query 'FunctionSummary.FunctionMetadata.FunctionARN' --output text)

echo "== 4/7 CloudFront: attach redirects and managed security headers"
CFG_RAW=$(mktemp)
CFG_JSON=$(mktemp)
aws cloudfront get-distribution-config --id "$DIST_ID" > "$CFG_RAW"
ETAG=$(jq -r '.ETag' "$CFG_RAW")
jq --arg function_arn "$FN_ARN" --arg headers_policy "$SECURITY_HEADERS_POLICY" '
  .DistributionConfig
  | (.DefaultCacheBehavior.FunctionAssociations.Items // []) as $associations
  | .DefaultCacheBehavior.FunctionAssociations = (
      ($associations | map(select(.EventType != "viewer-request")))
      + [{FunctionARN: $function_arn, EventType: "viewer-request"}]
      | {Quantity: length, Items: .}
    )
  | .DefaultCacheBehavior.ResponseHeadersPolicyId = $headers_policy
' "$CFG_RAW" > "$CFG_JSON"
aws cloudfront update-distribution --id "$DIST_ID" --if-match "$ETAG" \
  --distribution-config "file://$CFG_JSON" >/dev/null
aws cloudfront wait distribution-deployed --id "$DIST_ID"

echo "== 5/7 S3: back up and remove retired duplicate route objects"
mkdir -p "$BACKUP_DIR"
for key in \
  ws-kanava.html ws-api.html \
  tiliote/ tiliote/index.html \
  en/tiliote/ en/tiliote/index.html \
  se/tiliote/ se/tiliote/index.html \
  banking-api/ banking-api/index.html \
  en/banking-api/ en/banking-api/index.html \
  se/banking-api/ se/banking-api/index.html; do
  if aws s3api head-object --bucket "$BUCKET" --key "$key" >/dev/null 2>&1; then
    backup_name=${key%/}
    if [[ "$key" == */ ]]; then
      backup_name="$backup_name.directory-alias.html"
    fi
    mkdir -p "$BACKUP_DIR/$(dirname "$backup_name")"
    aws s3api get-object --bucket "$BUCKET" --key "$key" \
      "$BACKUP_DIR/$backup_name" >/dev/null
    aws s3api delete-object --bucket "$BUCKET" --key "$key" >/dev/null
  fi
done

echo "== 6/7 CloudFront: invalidate affected paths"
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths \
  '/ws-kanava.html' '/ws-api.html' \
  '/tiliote*' '/en/tiliote*' '/se/tiliote*' \
  '/banking-api*' '/en/banking-api*' '/se/banking-api*' \
  '/camt-053*' '/en/camt-053*' '/se/camt-053*' \
  '/iso-20022*' '/en/iso-20022*' '/se/iso-20022*' >/dev/null

echo "== 7/7 Verify protected and redirected production routes"
test "$(curl -sS -o /dev/null -w '%{http_code}' https://isecure.fi/wsapi_v2/index.html)" = 200
test "$(curl -sS -o /dev/null -w '%{http_code}' https://isecure.fi/wsapi_v2.json)" = 200
test "$(curl -sS -o /dev/null -w '%{http_code}' https://isecure.fi/tiliote/kuvaus.pdf)" = 403
test "$(curl -sS -o /dev/null -w '%{http_code}' https://isecure.fi/tilivuosi2011/2011-tiliotteet.pdf)" = 403
test "$(curl -sS -o /dev/null -w '%{http_code}' https://www.isecure.fi/camt-053)" = 301
test "$(curl -sS -o /dev/null -w '%{http_code}' https://www.isecure.fi/iso-20022)" = 301
echo "Reconciliation complete. Retired S3 backups: $BACKUP_DIR"
