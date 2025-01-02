import { describe, it, expect, vi } from "vitest";
import { AwsLambdaClient } from "../src/utils/aws-lambda";

describe("AwsLambdaClient", () => {
  it("should invoke lambda function", async () => {
    const mockLambda = {
      invoke: vi.fn().mockReturnValue({
        promise: () => Promise.resolve({ Payload: '{"success": true}' }),
      }),
    };

    const client = new AwsLambdaClient();
    client.lambda = mockLambda;

    const result = await client.invokeLambda("testFunction", { test: true });

    expect(result).toEqual({ success: true });
    expect(mockLambda.invoke).toHaveBeenCalledWith({
      FunctionName: "testFunction",
      Payload: '{"test":true}',
    });
  });
});
