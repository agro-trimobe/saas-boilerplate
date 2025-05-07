import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from './aws-config';
import crypto from 'crypto';

export async function createTenantAndUser(cognitoId: string, email: string, name: string): Promise<string> {
  console.log('Iniciando criação de tenant e usuário:', { cognitoId, email, name });
  const timestamp = new Date().toISOString();
  const tenantId = crypto.randomUUID();

  try {
    console.log('Configurando tenant com ID:', tenantId);
    // 1. Criar o Tenant
    const tenantCommand = new PutCommand({
      TableName: 'Tenants',
      Item: {
        PK: `TENANT#${tenantId}`,
        SK: 'METADATA#1',
        id: tenantId,
        name: `${name}'s Organization`, // Nome padrão inicial
        document: '', // Será preenchido posteriormente
        status: 'ACTIVE',
        settings: {
          maxUsers: 5,
          maxStorage: 1024 * 1024 * 1024, // 1GB
          features: ['basic']
        },
        createdAt: timestamp,
        updatedAt: timestamp
      }
    });

    console.log('Enviando comando para criar tenant no DynamoDB');
    try {
      await dynamodb.send(tenantCommand);
      console.log('Tenant criado com sucesso:', tenantId);
    } catch (error: unknown) {
      console.error('Erro ao criar tenant:', error);
      
      // Tratamento seguro para o erro com verificação de tipo
      if (error instanceof Error) {
        throw new Error(`Erro ao criar tenant: ${error.message}`);
      } else {
        throw new Error('Erro desconhecido ao criar tenant');
      }
    }

    // 2. Criar o User
    const userCommand = new PutCommand({
      TableName: 'Users',
      Item: {
        PK: `TENANT#${tenantId}`,
        SK: `USER#${cognitoId}`,
        tenantId: tenantId,
        cognitoId: cognitoId,
        email: email,
        name: name,
        role: 'ADMIN', // Primeiro usuário é sempre admin
        status: 'ACTIVE',
        createdAt: timestamp,
        updatedAt: timestamp,
        // GSI1 (busca global por Cognito ID)
        GSI1PK: `USER#${cognitoId}`,
        GSI1SK: `TENANT#${tenantId}`,
        // GSI2 (busca por email dentro do tenant)
        GSI2PK: `TENANT#${tenantId}#EMAIL#${email}`,
        GSI2SK: `USER#${cognitoId}`
      }
    });

    console.log('Enviando comando para criar usuário no DynamoDB');
    try {
      await dynamodb.send(userCommand);
      console.log('Usuário criado com sucesso:', cognitoId);
    } catch (error: unknown) {
      console.error('Erro ao criar usuário:', error);
      
      // Tratamento seguro para o erro com verificação de tipo
      if (error instanceof Error) {
        throw new Error(`Erro ao criar usuário: ${error.message}`);
      } else {
        throw new Error('Erro desconhecido ao criar usuário');
      }
    }

    return tenantId;
  } catch (error: unknown) {
    console.error('Erro na criação de tenant e usuário:', error);
    
    // Tratamento seguro para o erro com verificação de tipo
    const errorDetails: Record<string, unknown> = {};
    
    if (error && typeof error === 'object') {
      if ('name' in error && error.name) {
        errorDetails.name = error.name;
      }
      
      if ('message' in error && error.message) {
        errorDetails.message = error.message;
      }
      
      // Verificar se é um erro específico do AWS SDK
      if ('$metadata' in error) {
        const metadata = error.$metadata as Record<string, unknown>;
        errorDetails.code = metadata.httpStatusCode;
        errorDetails.requestId = metadata.requestId;
      }
    }
    
    console.error('Detalhes do erro:', errorDetails);
    throw error;
  }
  
  // Retornar o tenantId para uso em outras funções
  return tenantId;
}

export async function getUserByEmail(email: string) {
  try {
    console.log('Buscando usuário no DynamoDB pelo email:', email);
    console.log('Tabela Users - Verificando conexão com DynamoDB');
    
    const command = new ScanCommand({
      TableName: 'Users',
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    });

    console.log('Comando ScanCommand configurado para busca de usuário');
    
    try {
      const response = await dynamodb.send(command);
      console.log('Resposta recebida do DynamoDB:', {
        count: response.Count,
        scannedCount: response.ScannedCount,
        hasItems: response.Items && response.Items.length > 0
      });
      
      if (response.Items && response.Items.length > 0) {
        console.log('Usuário encontrado no DynamoDB:', {
          id: response.Items[0].id,
          email: response.Items[0].email,
          tenantId: response.Items[0].tenantId,
          PK: response.Items[0].PK,
          SK: response.Items[0].SK
        });
        return response.Items[0];
      }
      
      console.log('Usuário não encontrado no DynamoDB para o email:', email);
      return null;
    } catch (dynamoError: unknown) {
      console.error('Erro específico do DynamoDB ao buscar usuário:', dynamoError);
      
      // Tratamento seguro para o erro com verificação de tipo
      const errorDetails: Record<string, unknown> = {};
      
      if (dynamoError && typeof dynamoError === 'object') {
        if ('name' in dynamoError && dynamoError.name) {
          errorDetails.name = dynamoError.name;
        }
        
        if ('message' in dynamoError && dynamoError.message) {
          errorDetails.message = dynamoError.message;
        }
        
        // Verificar se é um erro específico do AWS SDK
        if ('$metadata' in dynamoError) {
          const metadata = dynamoError.$metadata as Record<string, unknown>;
          errorDetails.code = metadata.httpStatusCode;
          errorDetails.requestId = metadata.requestId;
        }
      }
      
      console.error('Detalhes do erro DynamoDB:', errorDetails);
      throw dynamoError;
    }
  } catch (error: unknown) {
    console.error('Erro geral ao buscar usuário por email:', error);
    
    // Tratamento seguro para o erro com verificação de tipo
    const errorDetails: Record<string, unknown> = {};
    
    if (error && typeof error === 'object') {
      if ('name' in error && error.name) {
        errorDetails.name = error.name;
      }
      
      if ('message' in error && error.message) {
        errorDetails.message = error.message;
      }
      
      if ('stack' in error && error.stack) {
        errorDetails.stack = error.stack;
      }
    }
    
    console.error('Detalhes do erro geral:', errorDetails);
    throw error;
  }
}
