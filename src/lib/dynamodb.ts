import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

if (!process.env.COGNITO_REGION) {
  throw new Error('COGNITO_REGION is not defined');
}

if (!process.env.ACCESS_KEY_ID_AWS) {
  throw new Error('ACCESS_KEY_ID_AWS is not defined');
}

if (!process.env.SECRET_ACCESS_KEY_AWS) {
  throw new Error('SECRET_ACCESS_KEY_AWS is not defined');
}

const client = new DynamoDBClient({
  region: process.env.COGNITO_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS
  }
});

export const ddbDocClient = DynamoDBDocumentClient.from(client);
