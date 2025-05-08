/**
 * AWS Configuration
 * 
 * Este arquivo configura os clientes AWS necessários para o funcionamento
 * do sistema multi-tenant. Os serviços principais utilizados são:
 * 
 * - DynamoDB: Para armazenamento de dados estruturado com suporte a multi-tenant
 * - S3: Para armazenamento de arquivos (opcional)
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

// Configurações da AWS vindas das variáveis de ambiente
const REGION = process.env.AWS_REGION || process.env.COGNITO_REGION || 'us-east-1';
const ACCESS_KEY = process.env.ACCESS_KEY_ID_AWS || '';
const SECRET_KEY = process.env.SECRET_ACCESS_KEY_AWS || '';

// Verificar configuração mínima
if (!ACCESS_KEY || !SECRET_KEY) {
  console.warn('⚠️ Credenciais AWS não configuradas. Configure ACCESS_KEY_ID_AWS e SECRET_ACCESS_KEY_AWS.');
}

// Inicializar clientes
let dynamodb: DynamoDBDocumentClient;
let s3: S3Client;

try {
  // Configurar DynamoDB com opções otimizadas para ambiente serverless
  const dynamoClient = new DynamoDBClient({
    region: REGION,
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    },
    // Timeout otimizado para funções serverless
    requestHandler: {
      abortController: {
        timeoutInMs: 5000,
      },
    },
  });

  // Cliente com opções de serialização melhoradas
  dynamodb = DynamoDBDocumentClient.from(dynamoClient, {
    marshallOptions: {
      convertEmptyValues: true,
      removeUndefinedValues: true,
    },
  });

  // Configurar S3 para armazenamento de arquivos
  s3 = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    },
    requestHandler: {
      abortController: {
        timeoutInMs: 10000,
      },
    },
  });

  console.log('✅ Serviços AWS inicializados com sucesso');
} catch (error: unknown) {
  console.error('❌ Erro ao inicializar serviços AWS:', error);
  
  // Criar clientes mínimos para evitar erros de execução
  const dynamoClient = new DynamoDBClient({
    region: REGION,
  });
  
  dynamodb = DynamoDBDocumentClient.from(dynamoClient);
  s3 = new S3Client({ region: REGION });
  
  console.warn('⚠️ Serviços AWS inicializados com configuração mínima');
}

export { dynamodb, s3 };
