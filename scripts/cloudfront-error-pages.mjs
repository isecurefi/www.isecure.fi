// Idempotent CloudFront configuration: serve the built /404.html with HTTP 404
// for missing paths instead of the S3 "AccessDenied" XML. Run once after the
// first release that contains 404.html; `yarn verify:production` checks it.
import {
  getDistribution,
  updateDistribution,
  withCustomErrorResponses,
} from "./publish-site.mjs";

const distributionId = process.argv[2] ?? "E2OQLWDIQMPMBP";
const current = getDistribution(distributionId);
const desired = withCustomErrorResponses(current.DistributionConfig);
if (
  JSON.stringify(current.DistributionConfig.CustomErrorResponses) ===
  JSON.stringify(desired.CustomErrorResponses)
) {
  console.log(`${distributionId}: custom error responses already configured`);
} else {
  updateDistribution(distributionId, current.ETag, desired);
  console.log(`${distributionId}: 403/404 now serve /404.html as HTTP 404`);
}
