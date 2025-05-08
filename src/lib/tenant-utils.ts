import { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from './aws-config';
import crypto from 'crypto';

/**
 * Tenant é a unidade básica de separação de dados no sistema multi-tenant.
 * Cada usuário pertence a um tenant e só pode acessar recursos do seu tenant.
 */

type UserBasicInfo = {
  email: string;
  name: string;
  cognitoId: string;
  tenantId: string;
  role: string;
  status: string;
};

/**
 * Cria um novo tenant (organização) e usuário administrador
 * Estrutura simplificada com apenas campos essenciais para o boilerplate
 */
export async function createTenantAndUser(cognitoId: string, email: string, name: string): Promise<string> {
  const timestamp = new Date().toISOString();
  const tenantId = crypto.randomUUID();

  try {
    // 1. Criar o Tenant com estrutura mínima
    const tenantCommand = new PutCommand({
      TableName: 'Tenants',
      Item: {
        PK: `TENANT#${tenantId}`,
        SK: 'METADATA#1',
        id: tenantId,
        name: `${name}'s Organization`,
        status: 'ACTIVE',
        // Apenas configurações essenciais
        settings: {
          planFeatures: ['basic'],
        },
        createdAt: timestamp,
        updatedAt: timestamp
      }
    });

    await dynamodb.send(tenantCommand);

    // 2. Criar o User com dados mínimos necessários
    const userCommand = new PutCommand({
      TableName: 'Users',
      Item: {
        // Chaves de acesso
        PK: `TENANT#${tenantId}`,
        SK: `USER#${cognitoId}`,
        GSI1PK: `USER#${cognitoId}`,
        GSI1SK: `TENANT#${tenantId}`,
        
        // Apenas dados essenciais
        tenantId: tenantId,
        cognitoId: cognitoId,
        email: email,
        name: name,
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: timestamp,
        updatedAt: timestamp
      }
    });

    await dynamodb.send(userCommand);

    return tenantId;
  } catch (error: unknown) {
    console.error('Erro ao criar tenant:', error);
    if (error instanceof Error) {
      throw new Error(`Erro ao criar tenant e usuário: ${error.message}`);
    } else {
      throw new Error(`Erro desconhecido ao criar tenant e usuário`);
    }
  }
}

/**
 * Busca um usuário pelo email
 * Versão simplificada focada apenas no caso de uso principal
 */
export async function getUserByEmail(email: string): Promise<UserBasicInfo | null> {
  try {
    // Busca simplificada por email
    const command = new ScanCommand({
      TableName: 'Users',
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
      Limit: 1,
    });

    const response = await dynamodb.send(command);
    
    if (!response.Items || response.Items.length === 0) {
      return null;
    }
    
    // Retornar apenas dados essenciais
    const user = response.Items[0];
    const cognitoId = user.SK.replace('USER#', '');
    const tenantId = user.PK.replace('TENANT#', '');
    
    return {
      email: user.email,
      name: user.name,
      cognitoId,
      tenantId,
      role: user.role,
      status: user.status,
    };
  } catch (error: unknown) {
    console.error('Erro ao buscar usuário por email:', error);
    if (error instanceof Error) {
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao buscar usuário');
    }
  }
}

/**
 * Obtém um usuário por ID
 * Função essencial para verificações de autenticação
 */
export async function getUserById(tenantId: string, cognitoId: string) {
  try {
    const command = new GetCommand({
      TableName: 'Users',
      Key: {
        PK: `TENANT#${tenantId}`,
        SK: `USER#${cognitoId}`,
      },
    });
    
    const response = await dynamodb.send(command);
    
    if (!response.Item) {
      return null;
    }
    
    return response.Item;
  } catch (error: unknown) {
    console.error('Erro ao buscar usuário por ID:', error);
    if (error instanceof Error) {
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao buscar usuário');
    }
  }
}
