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
      TableName: process.env.DYNAMODB_TENANTS_TABLE || 'Tenants',
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
    const userItem = {
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
    };
    
    console.log('Criando usuário com os seguintes dados:', JSON.stringify(userItem, null, 2));
    
    const userCommand = new PutCommand({
      TableName: process.env.DYNAMODB_USERS_TABLE || 'Users',
      Item: userItem
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
    console.log('Buscando usuário pelo email:', email);
    console.log('Tabela utilizada:', process.env.DYNAMODB_USERS_TABLE || 'Users');

    // Verificar se existe GSI2 para consulta otimizada por email
    // Tentativa 1: Buscar diretamente usando GSI2PK que contém o email
    // Formato do GSI2PK: "TENANT#{tenantId}#EMAIL#{email}"
    try {
      const queryCommand = {
        TableName: process.env.DYNAMODB_USERS_TABLE || 'Users',
        IndexName: 'GSI2',
        KeyConditionExpression: 'begins_with(GSI2PK, :emailPrefix)',
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':emailPrefix': `TENANT#`,
          ':email': email
        }
      };
      
      console.log('Tentando consulta otimizada com GSI2:', JSON.stringify(queryCommand, null, 2));
      
      const { QueryCommand } = await import('@aws-sdk/lib-dynamodb');
      const queryResponse = await dynamodb.send(new QueryCommand(queryCommand));
      
      if (queryResponse.Items && queryResponse.Items.length > 0) {
        console.log('Usuário encontrado via GSI2');
        const user = queryResponse.Items[0];
        
        console.log('Usuário encontrado:', JSON.stringify(user, null, 2));
        
        // Extrair informações do usuário encontrado
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
      }
      
      console.log('Usuário não encontrado via GSI2, tentando Scan como fallback');
    } catch (queryError) {
      console.error('Erro na consulta via GSI2:', queryError);
      console.log('Usando Scan como método de fallback');
    }
    
    // Fallback: Busca com scan (apenas para desenvolvimento ou se GSI não estiver disponível)
    // Em produção, considere adicionar um aviso ou erro aqui
    const command = new ScanCommand({
      TableName: process.env.DYNAMODB_USERS_TABLE || 'Users',
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    });

    console.log('Comando de fallback (scan):', JSON.stringify(command.input, null, 2));
    
    const response = await dynamodb.send(command);
    
    if (!response.Items || response.Items.length === 0) {
      console.log('Nenhum usuário encontrado com o email:', email);
      return null;
    }
    
    const user = response.Items[0];
    console.log('Usuário encontrado via scan:', JSON.stringify(user, null, 2));
    
    // Extrair informações do usuário encontrado
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
 * Obtém um usuário pelo ID do Cognito usando GSI1
 * Esta é a forma mais eficiente de buscar usuários após o login
 */
export async function getUserByCognitoId(cognitoId: string): Promise<UserBasicInfo | null> {
  try {
    console.log('Buscando usuário pelo Cognito ID usando GSI1:', cognitoId);
    
    const { QueryCommand } = await import('@aws-sdk/lib-dynamodb');
    const queryCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_USERS_TABLE || 'Users',
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :gsi1pk',
      ExpressionAttributeValues: {
        ':gsi1pk': `USER#${cognitoId}`
      },
      Limit: 1 // Só precisamos de um item
    });
    
    const response = await dynamodb.send(queryCommand);
    
    if (!response.Items || response.Items.length === 0) {
      console.log('Nenhum usuário encontrado com o Cognito ID:', cognitoId);
      return null;
    }
    
    const user = response.Items[0];
    console.log('Usuário encontrado pelo Cognito ID:', cognitoId);
    
    // Extrair informações do usuário encontrado
    const extractedCognitoId = user.SK.replace('USER#', '');
    const tenantId = user.PK.replace('TENANT#', '');
    
    return {
      email: user.email,
      name: user.name,
      cognitoId: extractedCognitoId,
      tenantId,
      role: user.role,
      status: user.status,
    };
  } catch (error: unknown) {
    console.error('Erro ao buscar usuário pelo Cognito ID:', error);
    if (error instanceof Error) {
      throw new Error(`Erro ao buscar usuário pelo Cognito ID: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao buscar usuário pelo Cognito ID');
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
      TableName: process.env.DYNAMODB_USERS_TABLE || 'Users',
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
