#!/usr/bin/env bash
# Reconcile the legacy apex and CloudFront redirects used by www.isecure.fi.
#
# API documentation is built with the www site. This script refuses to migrate
# the apex URLs until both new CloudFront targets are healthy, then maintains
# one-to-one ALB redirects without deleting the recoverable EC2 source files.
set -euo pipefail

REGION=eu-west-1
DIST_ID=E2OQLWDIQMPMBP
FN_NAME=isecure-legacy-redirects
BUCKET=www2.isecure.fi
SECURITY_HEADERS_POLICY=67f7725c-6f97-4210-82d7-5512b31e9d03
TARGET_GROUP_ARN=arn:aws:elasticloadbalancing:eu-west-1:589434896614:targetgroup/isecurefi/c32259ec39891a2a
HTTPS_LISTENER_ARN=arn:aws:elasticloadbalancing:eu-west-1:589434896614:listener/app/isecurefi/903510e898890d25/82679a15f22111bb
TILIOTE_403_RULE=arn:aws:elasticloadbalancing:eu-west-1:589434896614:listener-rule/app/isecurefi/903510e898890d25/82679a15f22111bb/5f9302fdf6fe11fb
WS_REDIRECT_RULE=arn:aws:elasticloadbalancing:eu-west-1:589434896614:listener-rule/app/isecurefi/903510e898890d25/82679a15f22111bb/2af05530f2eaa95b
INDEX_EN_REDIRECT_RULE=arn:aws:elasticloadbalancing:eu-west-1:589434896614:listener-rule/app/isecurefi/903510e898890d25/82679a15f22111bb/0cc2e0cf3b445cb7
BACKUP_DIR="${TMPDIR:-/tmp}/isecure-s3-backup"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FN_CODE="$SCRIPT_DIR/cloudfront-redirects.js"

redirect_action() {
  local path=$1
  printf '[{"Type":"redirect","RedirectConfig":{"Protocol":"HTTPS","Port":"443","Host":"www.isecure.fi","Path":"%s","Query":"#{query}","StatusCode":"HTTP_301"}}]' "$path"
}

api_docs_redirect_action() {
  local path=$1
  printf '[{"Type":"redirect","RedirectConfig":{"Protocol":"HTTPS","Host":"www.isecure.fi","Path":"%s","Query":"#{query}","StatusCode":"HTTP_301"}}]' "$path"
}

find_path_rule() {
  local path=$1
  aws elbv2 describe-rules --region "$REGION" \
    --listener-arn "$HTTPS_LISTENER_ARN" --output json |
    jq -r --arg path "$path" '
      .Rules[]
      | select(.Priority != "default")
      | select(any(.Conditions[]?;
          .Field == "path-pattern"
          and any(.PathPatternConfig.Values[]?; . == $path)))
      | .RuleArn
    ' | head -n 1
}

ensure_api_docs_rule() {
  local lookup_path=$1
  local priority=$2
  local paths=$3
  local destination=$4
  local rule_arn
  rule_arn=$(find_path_rule "$lookup_path")
  local conditions
  local actions
  conditions=$(printf '[{"Field":"host-header","HostHeaderConfig":{"Values":["isecure.fi"]}},{"Field":"path-pattern","PathPatternConfig":{"Values":%s}}]' "$paths")
  actions=$(api_docs_redirect_action "$destination")

  if [[ -n "$rule_arn" ]]; then
    aws elbv2 modify-rule --region "$REGION" --rule-arn "$rule_arn" \
      --conditions "$conditions" --actions "$actions" >/dev/null
  else
    rule_arn=$(aws elbv2 create-rule --region "$REGION" \
      --listener-arn "$HTTPS_LISTENER_ARN" --priority "$priority" \
      --conditions "$conditions" --actions "$actions" \
      --query 'Rules[0].RuleArn' --output text)
  fi
  printf '%s' "$rule_arn"
}

echo "== 1/9 Verify the CloudFront API documentation before changing the apex"
DOCS_TMP=$(mktemp)
OPENAPI_TMP=$(mktemp)
trap 'rm -f "$DOCS_TMP" "$OPENAPI_TMP"' EXIT
test "$(curl -sS -o "$DOCS_TMP" -w '%{http_code}' https://www.isecure.fi/wsapi_v2/)" = 200
grep -q 'data-renderer="scalar"' "$DOCS_TMP"
grep -q 'data-reference-only="true"' "$DOCS_TMP"
test "$(curl -sS -o "$OPENAPI_TMP" -w '%{http_code}' https://www.isecure.fi/wsapi_v2.json)" = 200
jq -e '.swagger == "2.0" and .info.version == "v2.7.0"' "$OPENAPI_TMP" >/dev/null

echo "== 2/9 ALB: migrate API documentation to CloudFront"
API_DOCS_HTML_RULE=$(ensure_api_docs_rule \
  '/wsapi_v2/index.html' 5 \
  '["/wsapi_v2","/wsapi_v2/","/wsapi_v2/index.html"]' '/wsapi_v2/')
API_DOCS_JSON_RULE=$(ensure_api_docs_rule \
  '/wsapi_v2.json' 6 '["/wsapi_v2.json"]' '/wsapi_v2.json')

echo "== 3/9 ALB: reconcile the intended apex rules"
aws elbv2 modify-rule --region "$REGION" --rule-arn "$WS_REDIRECT_RULE" \
  --conditions '[{"Field":"host-header","HostHeaderConfig":{"Values":["isecure.fi"]}},{"Field":"path-pattern","PathPatternConfig":{"Values":["/ws-kanava.php","/ws-kanava.html"]}}]' \
  --actions "$(redirect_action '/web-services/')" >/dev/null
aws elbv2 modify-rule --region "$REGION" --rule-arn "$INDEX_EN_REDIRECT_RULE" \
  --conditions '[{"Field":"host-header","HostHeaderConfig":{"Values":["isecure.fi"]}},{"Field":"path-pattern","PathPatternConfig":{"Values":["/index-en.html"]}}]' \
  --actions "$(redirect_action '/en/')" >/dev/null
aws elbv2 set-rule-priorities --region "$REGION" --rule-priorities \
  "RuleArn=$TILIOTE_403_RULE,Priority=2" \
  "RuleArn=$WS_REDIRECT_RULE,Priority=3" \
  "RuleArn=$INDEX_EN_REDIRECT_RULE,Priority=4" \
  "RuleArn=$API_DOCS_HTML_RULE,Priority=5" \
  "RuleArn=$API_DOCS_JSON_RULE,Priority=6" >/dev/null
aws elbv2 modify-target-group --region "$REGION" \
  --target-group-arn "$TARGET_GROUP_ARN" \
  --matcher 'HttpCode=200-399' >/dev/null

echo "== 4/9 ALB: require TLS 1.2 or newer"
aws elbv2 modify-listener --region "$REGION" \
  --listener-arn "$HTTPS_LISTENER_ARN" \
  --ssl-policy ELBSecurityPolicy-TLS13-1-2-Res-2021-06 >/dev/null

echo "== 5/9 CloudFront: update and publish the checked-in redirect function"
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

echo "== 6/9 CloudFront: attach redirects, modern TLS, and security headers"
CFG_RAW=$(mktemp)
CFG_JSON=$(mktemp)
aws cloudfront get-distribution-config --id "$DIST_ID" > "$CFG_RAW"
ETAG=$(jq -r '.ETag' "$CFG_RAW")
jq --arg function_arn "$FN_ARN" --arg headers_policy "$SECURITY_HEADERS_POLICY" '
  .DistributionConfig
  | .ViewerCertificate.MinimumProtocolVersion = "TLSv1.2_2021"
  | .HttpVersion = "http2and3"
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

echo "== 7/9 S3: back up and remove retired duplicate route objects"
mkdir -p "$BACKUP_DIR"
for key in \
  thankyou.html ws-kanava.html ws-api.html \
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

echo "== 8/9 CloudFront: invalidate affected paths"
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths \
  '/thankyou.html' '/thankyou/*' '/ws-kanava.html' '/ws-api.html' \
  '/tiliote*' '/en/tiliote*' '/se/tiliote*' \
  '/banking-api*' '/en/banking-api*' '/se/banking-api*' \
  '/camt-053*' '/en/camt-053*' '/se/camt-053*' \
  '/iso-20022*' '/en/iso-20022*' '/se/iso-20022*' >/dev/null

echo "== 9/9 Verify protected and redirected production routes"
test "$(curl -sS -o /dev/null -w '%{http_code}' https://isecure.fi/wsapi_v2/index.html)" = 301
test "$(curl -sS -o /dev/null -w '%{redirect_url}' 'https://isecure.fi/wsapi_v2/index.html?source=reconcile')" = 'https://www.isecure.fi:443/wsapi_v2/?source=reconcile'
test "$(curl -sS -o /dev/null -w '%{http_code}' https://isecure.fi/wsapi_v2.json)" = 301
test "$(curl -sS -o /dev/null -w '%{redirect_url}' 'https://isecure.fi/wsapi_v2.json?source=reconcile')" = 'https://www.isecure.fi:443/wsapi_v2.json?source=reconcile'
test "$(curl -sS -o /dev/null -w '%{http_code}' https://isecure.fi/tiliote/kuvaus.pdf)" = 403
test "$(curl -sS -o /dev/null -w '%{http_code}' https://isecure.fi/tilivuosi2011/2011-tiliotteet.pdf)" = 403
test "$(curl -sS -o /dev/null -w '%{http_code}' https://www.isecure.fi/camt-053)" = 301
test "$(curl -sS -o /dev/null -w '%{http_code}' https://www.isecure.fi/iso-20022)" = 301
test "$(curl -sS -o /dev/null -w '%{http_code}' https://www.isecure.fi/thankyou.html)" = 301
echo "Reconciliation complete. Retired S3 backups: $BACKUP_DIR"
