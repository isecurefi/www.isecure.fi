import AWS from 'aws-sdk';

export class AwsLambdaClient {
  constructor(config = {}) {
    this.lambda = new AWS.Lambda(config);
  }

  async invokeLambda(functionName, payload) {
    try {
      const params = {
        FunctionName: functionName,
        Payload: JSON.stringify(payload)
      };

      const response = await this.lambda.invoke(params).promise();
      return JSON.parse(response.Payload);
    } catch (error) {
      console.error('Lambda invocation failed:', error);
      throw error;
    }
  }
}
