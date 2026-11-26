import { build } from "esbuild";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const region = "eu-west-1";
const stack = "isecure-website-demo-preview";
const bucket = "www2.isecure.fi";
const folder = resolve(".private/demo-deploy");
mkdirSync(folder, { recursive: true, mode: 0o700 });
const secretArn = process.env.DEMO_SECRET_ARN;
if (
  !/^arn:aws:secretsmanager:eu-west-1:589434896614:secret:isecure\/website-demo-preview\/data-account-[A-Za-z0-9]+$/u.test(
    secretArn ?? "",
  )
)
  throw new Error("Set the dedicated test-account DEMO_SECRET_ARN");
function command(name, args) {
  const result = spawnSync(name, args, {
    encoding: "utf8",
    maxBuffer: 2 ** 20,
  });
  if (result.status !== 0) throw new Error(`${name} failed: ${result.stderr}`);
  return result.stdout;
}
const aws = (args) => command("aws", ["--region", region, ...args]);
const identity = JSON.parse(
  aws(["sts", "get-caller-identity", "--output", "json"]),
);
if (identity.Account !== "589434896614")
  throw new Error("Demo deployment is test-account only");
await build({
  entryPoints: ["scripts/demo/handler.mjs"],
  outfile: `${folder}/index.js`,
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node24",
  minify: true,
  sourcemap: false,
});
command("zip", ["-q", "-j", `${folder}/function.zip`, `${folder}/index.js`]);
const artifact = readFileSync(`${folder}/function.zip`);
const digest = createHash("sha256").update(artifact).digest("hex");
const key = `_demo-backend/${digest}/function.zip`;
aws([
  "s3api",
  "put-object",
  "--bucket",
  bucket,
  "--key",
  key,
  "--body",
  `${folder}/function.zip`,
  "--server-side-encryption",
  "AES256",
]);
const template = {
  AWSTemplateFormatVersion: "2010-09-09",
  Description:
    "Unlisted website preview: fixed synthetic simulator statement read through the official SDK",
  Resources: {
    Logs: {
      Type: "AWS::Logs::LogGroup",
      Properties: {
        LogGroupName: "/aws/lambda/isecure-website-demo-preview",
        RetentionInDays: 14,
      },
    },
    Role: {
      Type: "AWS::IAM::Role",
      Properties: {
        AssumeRolePolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { Service: "lambda.amazonaws.com" },
              Action: "sts:AssumeRole",
            },
          ],
        },
        Policies: [
          {
            PolicyName: "ReadDedicatedDemoSecret",
            PolicyDocument: {
              Version: "2012-10-17",
              Statement: [
                {
                  Effect: "Allow",
                  Action: "secretsmanager:GetSecretValue",
                  Resource: secretArn,
                },
                {
                  Effect: "Allow",
                  Action: ["logs:CreateLogStream", "logs:PutLogEvents"],
                  Resource:
                    "arn:aws:logs:eu-west-1:589434896614:log-group:/aws/lambda/isecure-website-demo-preview:*",
                },
              ],
            },
          },
        ],
      },
    },
    Function: {
      Type: "AWS::Lambda::Function",
      DependsOn: "Logs",
      Properties: {
        FunctionName: "isecure-website-demo-preview",
        Description: `Synthetic read-only website demo, SDK 6.1.0, artifact ${digest}`,
        Runtime: "nodejs24.x",
        Architectures: ["arm64"],
        Handler: "index.handler",
        MemorySize: 256,
        Timeout: 25,
        // SDK logout revokes this account's sessions. Serialize upstream reads.
        ReservedConcurrentExecutions: 1,
        Role: { "Fn::GetAtt": ["Role", "Arn"] },
        Code: { S3Bucket: bucket, S3Key: key },
        Environment: { Variables: { DEMO_SECRET_ARN: secretArn } },
      },
    },
    Api: {
      Type: "AWS::ApiGatewayV2::Api",
      Properties: {
        Name: stack,
        ProtocolType: "HTTP",
        CorsConfiguration: {
          AllowOrigins: ["https://www.isecure.fi"],
          AllowMethods: ["GET"],
          MaxAge: 300,
        },
      },
    },
    Integration: {
      Type: "AWS::ApiGatewayV2::Integration",
      Properties: {
        ApiId: { Ref: "Api" },
        IntegrationType: "AWS_PROXY",
        IntegrationUri: { "Fn::GetAtt": ["Function", "Arn"] },
        PayloadFormatVersion: "2.0",
        TimeoutInMillis: 29000,
      },
    },
    Route: {
      Type: "AWS::ApiGatewayV2::Route",
      Properties: {
        ApiId: { Ref: "Api" },
        RouteKey: "GET /statement",
        Target: { "Fn::Join": ["/", ["integrations", { Ref: "Integration" }]] },
      },
    },
    Stage: {
      Type: "AWS::ApiGatewayV2::Stage",
      Properties: {
        ApiId: { Ref: "Api" },
        StageName: "$default",
        AutoDeploy: true,
        DefaultRouteSettings: {
          ThrottlingBurstLimit: 2,
          ThrottlingRateLimit: 1,
        },
      },
    },
    Invoke: {
      Type: "AWS::Lambda::Permission",
      Properties: {
        FunctionName: { Ref: "Function" },
        Action: "lambda:InvokeFunction",
        Principal: "apigateway.amazonaws.com",
        SourceArn: {
          "Fn::Sub":
            "arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${Api}/*/GET/statement",
        },
      },
    },
  },
  Outputs: {
    Endpoint: {
      Value: {
        "Fn::Sub":
          "https://${Api}.execute-api.${AWS::Region}.amazonaws.com/statement",
      },
    },
  },
};
writeFileSync(`${folder}/template.json`, JSON.stringify(template, null, 2));
aws([
  "cloudformation",
  "deploy",
  "--stack-name",
  stack,
  "--template-file",
  `${folder}/template.json`,
  "--capabilities",
  "CAPABILITY_IAM",
  "--no-fail-on-empty-changeset",
]);
const deployed = JSON.parse(
  aws([
    "cloudformation",
    "describe-stacks",
    "--stack-name",
    stack,
    "--output",
    "json",
  ]),
);
const endpoint = deployed.Stacks[0].Outputs.find(
  (entry) => entry.OutputKey === "Endpoint",
).OutputValue;
writeFileSync(
  "src/data/bankDemo.json",
  JSON.stringify({ endpoint, sdkVersion: "6.1.0" }, null, 2) + "\n",
);
writeFileSync(
  `${folder}/release.json`,
  JSON.stringify(
    {
      artifactSha256: digest,
      endpoint,
      stack,
      deployedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);
console.log(`Demo backend deployed: ${endpoint}`);
