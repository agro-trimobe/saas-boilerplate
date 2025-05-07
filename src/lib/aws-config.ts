import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

// Usar variáveis de ambiente sem prefixo NEXT_PUBLIC_
const REGION = process.env.COGNITO_REGION || 'us-east-1';
const ACCESS_KEY = process.env.ACCESS_KEY_ID_AWS || '';
const SECRET_KEY = process.env.SECRET_ACCESS_KEY_AWS || '';

// Verificar se as credenciais estão configuradas
if (!ACCESS_KEY || !SECRET_KEY) {
  console.warn('Credenciais AWS não configuradas. Configure as variáveis de ambiente ACCESS_KEY_ID_AWS e SECRET_ACCESS_KEY_AWS.');
}

// Adicionar logs para depuração
console.log('[AWS Config] Inicializando configuração AWS...');
console.log('[AWS Config] Região:', REGION);
console.log('[AWS Config] Access Key ID configurado:', !!ACCESS_KEY);
console.log('[AWS Config] Secret Access Key configurado:', !!SECRET_KEY);

// Inicializar as variáveis fora do bloco try/catch
let dynamodb: DynamoDBDocumentClient;
let s3: S3Client;

try {
  // Configurar o cliente DynamoDB
  const dynamoClient = new DynamoDBClient({
    region: REGION,
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    },
    // Configurações específicas para DynamoDB em ambiente serverless
    requestHandler: {
      abortController: {
        timeoutInMs: 5000, // 5 segundos de timeout
      },
    },
  });

  // Configurar o cliente DynamoDB Document
  dynamodb = DynamoDBDocumentClient.from(dynamoClient, {
    marshallOptions: {
      // Configurações para melhorar a serialização/desserialização
      convertEmptyValues: true, // Converte strings vazias para null
      removeUndefinedValues: true, // Remove valores undefined
    },
  });

  // Configurar o cliente S3
  s3 = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    },
    // Configurações específicas para S3 em ambiente serverless
    requestHandler: {
      abortController: {
        timeoutInMs: 10000, // 10 segundos de timeout para S3
      },
    },
  });

  console.log('[AWS Config] Clientes AWS inicializados com sucesso');
} catch (error: unknown) {
  console.error('[AWS Config] Erro ao inicializar clientes AWS:', error);
  
  // Tratamento seguro para o erro com verificação de tipo
  const errorDetails: Record<string, unknown> = {};
  
  if (error && typeof error === 'object') {
    if ('name' in error && error.name) {
      errorDetails.name = error.name;
    }
    
    if ('message' in error && error.message) {
      errorDetails.message = error.message;
    }
    
    if ('code' in error && error.code) {
      errorDetails.code = error.code;
    }
    
    if ('$metadata' in error) {
      errorDetails.$metadata = error.$metadata;
    }
  }
  
  console.error('[AWS Config] Detalhes do erro AWS:', errorDetails);
  
  // Criar clientes com configuração mínima para evitar erros em tempo de execução
  // Isso permitirá que a aplicação seja carregada, mas as operações falharão
  // com mensagens de erro mais claras
  const dynamoClient = new DynamoDBClient({
    region: REGION,
  });
  
  dynamodb = DynamoDBDocumentClient.from(dynamoClient);
  
  s3 = new S3Client({
    region: REGION,
  });
  
  console.warn('[AWS Config] Clientes AWS inicializados com configuração mínima devido a erros');
}

export { dynamodb, s3 };
