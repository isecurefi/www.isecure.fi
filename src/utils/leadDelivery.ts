import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

const snsClient = new SNSClient({
  region: "eu-west-1",
  credentials: fromCognitoIdentityPool({
    clientConfig: { region: "eu-west-1" },
    identityPoolId: "eu-west-1:350ec7b8-c08e-4bc6-a52f-fad9f2b1ae5c",
  }),
});

const topicArn = "arn:aws:sns:eu-west-1:589434896614:ISECureWebsiteSnsToEmail";

interface WebsiteLead {
  subject: string;
  message: string;
}

export async function submitWebsiteLead({
  subject,
  message,
}: WebsiteLead): Promise<void> {
  await snsClient.send(
    new PublishCommand({
      Message: message,
      Subject: subject.replace(/[\r\n]+/g, " ").slice(0, 100),
      TopicArn: topicArn,
    }),
  );
}
