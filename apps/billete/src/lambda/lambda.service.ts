import { Injectable } from '@nestjs/common';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

@Injectable()
export class LambdaService {
  private lambdaClient: LambdaClient;

  constructor() {
    this.lambdaClient = new LambdaClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async invokeLambdaFunction(functionName: string, payload: any) {
    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: Buffer.from(JSON.stringify(payload)),
    });

    try {
      const response = await this.lambdaClient.send(command);
      return JSON.parse(new TextDecoder().decode(response.Payload));
    } catch (error) {
      console.error('Error al invocar la función Lambda:', error);
      throw new Error(`Error al invocar la función Lambda: ${error}`);
    }
  }
}
