# Fase 3: Desenvolvimento do Backend (2 semanas)

Este documento detalha as tarefas relacionadas ao desenvolvimento do backend do AgroCredit (Trimobe), seguindo a modelagem do DynamoDB, armazenamento S3 e integrações com serviços externos conforme definidos nos documentos de referência.

## Visão Geral

O backend do AgroCredit será construído utilizando Node.js com TypeScript, implementando uma arquitetura serverless com AWS Lambda e API Gateway. O desenvolvimento seguirá o modelo de single-table design para o DynamoDB, conforme especificado no documento de modelagem, e utilizará um único bucket S3 com estrutura hierárquica para armazenamento de arquivos.

## 3.1. Configuração da Infraestrutura (3 dias)

- [ ] **Configurar AWS SDK e clientes**
  - Implementar cliente do DynamoDB com suporte a single-table design:
    ```typescript
    // src/lib/aws/dynamodb.ts
    import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
    import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
    import { fromEnv } from '@aws-sdk/credential-providers';
    
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: fromEnv(),
    });
    
    export const dynamoDb = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        convertEmptyValues: true,
        removeUndefinedValues: true,
      },
    });
    
    export const TABLE_NAME = process.env.DYNAMODB_TABLE || 'trimobe-table';
    ```

  - Configurar cliente S3 para gerenciamento de arquivos:
    ```typescript
    // src/lib/aws/s3.ts
    import { S3Client } from '@aws-sdk/client-s3';
    import { Upload } from '@aws-sdk/lib-storage';
    import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
    import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
    import { fromEnv } from '@aws-sdk/credential-providers';
    
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: fromEnv(),
    });
    
    export const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'trimobe-bucket';
    
    /**
     * Gera uma URL pré-assinada para upload direto ao S3
     */
    export async function generatePresignedUploadUrl(
      key: string,
      contentType: string,
      expiresIn = 3600
    ): Promise<string> {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      });
      
      return getSignedUrl(s3Client, command, { expiresIn });
    }
    
    /**
     * Gera uma URL pré-assinada para download de um arquivo do S3
     */
    export async function generatePresignedDownloadUrl(
      key: string,
      expiresIn = 3600
    ): Promise<string> {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });
      
      return getSignedUrl(s3Client, command, { expiresIn });
    }
    
    /**
     * Faz upload de um arquivo para o S3
     */
    export async function uploadFileToS3(
      buffer: Buffer,
      key: string,
      contentType: string
    ): Promise<string> {
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        },
      });
      
      await upload.done();
      
      return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    }
    ```

  - Configurar cliente Cognito para autenticação e autorização:
    ```typescript
    // src/lib/aws/cognito.ts
    import {
      CognitoIdentityProviderClient,
      AdminCreateUserCommand,
      AdminSetUserPasswordCommand,
      AdminInitiateAuthCommand,
      AdminRespondToAuthChallengeCommand,
      ForgotPasswordCommand,
      ConfirmForgotPasswordCommand,
    } from '@aws-sdk/client-cognito-identity-provider';
    import { fromEnv } from '@aws-sdk/credential-providers';
    
    const cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: fromEnv(),
    });
    
    export const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || '';
    export const CLIENT_ID = process.env.COGNITO_CLIENT_ID || '';
    
    /**
     * Criar novo usuário no Cognito
     */
    export async function createCognitoUser(
      email: string,
      password: string,
      attributes: Record<string, string> = {}
    ) {
      // Converter atributos para o formato do Cognito
      const userAttributes = Object.entries(attributes).map(([key, value]) => ({
        Name: key.startsWith('custom:') ? key : `custom:${key}`,
        Value: value,
      }));
      
      // Adicionar email como atributo obrigatório
      userAttributes.push({
        Name: 'email',
        Value: email,
      });
      
      // Criar usuário
      const createCommand = new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        TemporaryPassword: password,
        UserAttributes: userAttributes,
        MessageAction: 'SUPPRESS', // Não enviar email, faremos isso por conta própria
      });
      
      const createResult = await cognitoClient.send(createCommand);
      
      // Definir senha permanente
      const setPasswordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        Password: password,
        Permanent: true,
      });
      
      await cognitoClient.send(setPasswordCommand);
      
      return createResult.User;
    }
    
    /**
     * Autenticar usuário no Cognito
     */
    export async function authenticateUser(email: string, password: string) {
      const authCommand = new AdminInitiateAuthCommand({
        UserPoolId: USER_POOL_ID,
        ClientId: CLIENT_ID,
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });
      
      try {
        const authResult = await cognitoClient.send(authCommand);
        
        // Se houver um desafio (como alterar a senha)
        if (authResult.ChallengeName) {
          return {
            challengeName: authResult.ChallengeName,
            session: authResult.Session,
            challengeParameters: authResult.ChallengeParameters,
          };
        }
        
        // Autenticação bem-sucedida
        return {
          accessToken: authResult.AuthenticationResult?.AccessToken,
          refreshToken: authResult.AuthenticationResult?.RefreshToken,
          idToken: authResult.AuthenticationResult?.IdToken,
          expiresIn: authResult.AuthenticationResult?.ExpiresIn,
        };
      } catch (error) {
        console.error('Erro de autenticação:', error);
        throw error;
      }
    }
    
    /**
     * Iniciar processo de recuperação de senha
     */
    export async function forgotPassword(email: string) {
      const command = new ForgotPasswordCommand({
        ClientId: CLIENT_ID,
        Username: email,
      });
      
      return cognitoClient.send(command);
    }
    
    /**
     * Confirmar nova senha com código de recuperação
     */
    export async function confirmForgotPassword(
      email: string,
      code: string,
      newPassword: string
    ) {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword,
      });
      
      return cognitoClient.send(command);
    }
    ```

- [ ] **Implementar variáveis de ambiente e configurações**
  - Criar arquivo `.env.example` com todas as variáveis necessárias:
    ```
    # AWS Config
    AWS_REGION=us-east-1
    AWS_ACCESS_KEY_ID=seu_access_key
    AWS_SECRET_ACCESS_KEY=seu_secret_key
    
    # DynamoDB
    DYNAMODB_TABLE=trimobe-table
    
    # S3
    S3_BUCKET_NAME=trimobe-bucket
    
    # Cognito
    COGNITO_USER_POOL_ID=us-east-1_xxxxxxxx
    COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxx
    
    # Pinecone (Vector DB para embeddings)
    PINECONE_API_KEY=xxxxxxxxxxxxx
    PINECONE_ENVIRONMENT=us-west1-gcp
    PINECONE_INDEX=trimobe-index
    
    # OpenAI
    OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxx
    
    # Asaas (Pagamentos)
    ASAAS_API_KEY=xxxxxxxxxxxxxxx
    ASAAS_ENVIRONMENT=sandbox # ou production
    
    # App
    APP_URL=http://localhost:3000
    APP_ENV=development
    JWT_SECRET=seu_jwt_secret_para_tokens_internos
    ```

  - Implementar sistema de configuração centralizada:
    ```typescript
    // src/config/index.ts
    import dotenv from 'dotenv';
    
    // Carregar variáveis de ambiente do arquivo .env
    dotenv.config();
    
    const config = {
      app: {
        env: process.env.APP_ENV || 'development',
        url: process.env.APP_URL || 'http://localhost:3000',
        port: parseInt(process.env.PORT || '3000', 10),
        jwtSecret: process.env.JWT_SECRET || 'secret-dev-only',
      },
      aws: {
        region: process.env.AWS_REGION || 'us-east-1',
        dynamoDb: {
          tableName: process.env.DYNAMODB_TABLE || 'trimobe-table',
        },
        s3: {
          bucketName: process.env.S3_BUCKET_NAME || 'trimobe-bucket',
        },
        cognito: {
          userPoolId: process.env.COGNITO_USER_POOL_ID || '',
          clientId: process.env.COGNITO_CLIENT_ID || '',
        },
      },
      pinecone: {
        apiKey: process.env.PINECONE_API_KEY || '',
        environment: process.env.PINECONE_ENVIRONMENT || '',
        index: process.env.PINECONE_INDEX || 'trimobe-index',
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4',
        embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
      },
      asaas: {
        apiKey: process.env.ASAAS_API_KEY || '',
        environment: process.env.ASAAS_ENVIRONMENT || 'sandbox',
        apiUrl: process.env.ASAAS_ENVIRONMENT === 'production'
          ? 'https://www.asaas.com/api/v3'
          : 'https://sandbox.asaas.com/api/v3',
      },
    };
    
    export default config;
    ```

- [ ] **Criar scripts para provisionamento de recursos**
  - Implementar script para criação da tabela DynamoDB
  - Configurar bucket S3 com políticas de acesso e CORS
  - Criar user pool do Cognito para autenticação
  - Definir roles e policies do IAM necessárias para os serviços

## 3.2. Implementação do Repositório Base e Modelos de Dados (3 dias)

- [ ] **Implementar repositório base para DynamoDB com single-table design**
  - Criar classe base em `src/repositories/baseRepo.ts`:
    ```typescript
    import {
      PutCommand,
      GetCommand,
      UpdateCommand,
      DeleteCommand,
      QueryCommand,
      ScanCommand,
    } from '@aws-sdk/lib-dynamodb';
    import { dynamoDb, TABLE_NAME } from '../lib/aws/dynamodb';
    
    export class BaseRepository {
      protected tableName: string;
      
      constructor(tableName = TABLE_NAME) {
        this.tableName = tableName;
      }
      
      /**
       * Cria um novo item na tabela
       */
      async create(item: Record<string, any>): Promise<Record<string, any>> {
        const now = new Date().toISOString();
        const newItem = { ...item, createdAt: now, updatedAt: now };
        
        const command = new PutCommand({
          TableName: this.tableName,
          Item: newItem,
        });
        
        await dynamoDb.send(command);
        return newItem;
      }
      
      /**
       * Obtém um item específico pelo PK e SK
       */
      async get(pk: string, sk: string): Promise<Record<string, any> | null> {
        const command = new GetCommand({
          TableName: this.tableName,
          Key: { PK: pk, SK: sk },
        });
        
        const result = await dynamoDb.send(command);
        return result.Item || null;
      }
      
      /**
       * Atualiza um item existente
       */
      async update(
        pk: string,
        sk: string,
        attributes: Record<string, any>
      ): Promise<Record<string, any> | null> {
        // Remover atributos que não devem ser atualizados
        const { PK, SK, createdAt, ...updateAttributes } = attributes;
        
        // Preparar expressões de atualização
        const now = new Date().toISOString();
        updateAttributes.updatedAt = now;
        
        const updateExpression = Object.keys(updateAttributes).reduce(
          (exp, key, index) => {
            return `${exp}${index === 0 ? 'set ' : ', '}#${key} = :${key}`;
          },
          ''
        );
        
        const expressionAttributeNames = Object.keys(updateAttributes).reduce(
          (names, key) => {
            names[`#${key}`] = key;
            return names;
          },
          {} as Record<string, string>
        );
        
        const expressionAttributeValues = Object.entries(updateAttributes).reduce(
          (values, [key, value]) => {
            values[`:${key}`] = value;
            return values;
          },
          {} as Record<string, any>
        );
        
        const command = new UpdateCommand({
          TableName: this.tableName,
          Key: { PK: pk, SK: sk },
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: 'ALL_NEW',
        });
        
        const result = await dynamoDb.send(command);
        return result.Attributes || null;
      }
      
      /**
       * Remove um item da tabela
       */
      async delete(pk: string, sk: string): Promise<boolean> {
        const command = new DeleteCommand({
          TableName: this.tableName,
          Key: { PK: pk, SK: sk },
        });
        
        await dynamoDb.send(command);
        return true;
      }
      
      /**
       * Consulta itens com base em uma expressão de filtro
       */
      async query(params: any): Promise<Record<string, any>[]> {
        const command = new QueryCommand({
          TableName: this.tableName,
          ...params,
        });
        
        const result = await dynamoDb.send(command);
        return result.Items || [];
      }
      
      /**
       * Faz uma varredura completa na tabela
       */
      async scan(params: any = {}): Promise<Record<string, any>[]> {
        const command = new ScanCommand({
          TableName: this.tableName,
          ...params,
        });
        
        const result = await dynamoDb.send(command);
        return result.Items || [];
      }
    }
    
    export const baseRepo = new BaseRepository();
    ```

- [ ] **Implementar modelos de entidades principais**
  - Definir tipos em `src/types/index.ts`:
    ```typescript
    // Usuario
    export interface User {
      id: string;
      email: string;
      name: string;
      tenantId: string;
      role: 'admin' | 'user';
      createdAt: string;
      updatedAt: string;
      lastLogin?: string;
      status: 'active' | 'inactive';
      profile?: UserProfile;
    }
    
    export interface UserProfile {
      profession?: string;
      phone?: string;
      region?: string;
      aiPreferences?: {
        detailLevel: 'Básico' | 'Padrão' | 'Detalhado';
        includeMarketPrices: boolean;
        preferredBanks?: string[];
      };
    }
    
    // Tenant
    export interface Tenant {
      id: string;
      name: string;
      plan: 'free' | 'basic' | 'professional';
      status: 'active' | 'inactive' | 'trial';
      createdAt: string;
      updatedAt: string;
      trialEndsAt?: string;
      billingInfo?: {
        customerId?: string;
        subscriptionId?: string;
        nextBillingDate?: string;
      };
    }
    
    // Conversa
    export interface Conversation {
      id: string;
      tenantId: string;
      title: string;
      createdAt: string;
      updatedAt: string;
      createdBy: string;
      lastMessageAt?: string;
      lastMessagePreview?: string;
      status: 'active' | 'archived';
      metadata?: Record<string, any>;
    }
    
    // Mensagem
    export interface Message {
      id: string;
      conversationId: string;
      tenantId: string;
      content: string;
      role: 'user' | 'assistant' | 'system';
      createdAt: string;
      updatedAt: string;
      status?: 'sent' | 'delivered' | 'generating' | 'error';
      metadata?: Record<string, any>;
      attachments?: Attachment[];
    }
    
    // Anexo
    export interface Attachment {
      id: string;
      name: string;
      url: string;
      size: number;
      type: string;
      tenantId: string;
      conversationId?: string;
      messageId?: string;
      documentId?: string;
      createdAt: string;
      metadata?: Record<string, any>;
    }
    
    // Documento
    export interface Document {
      id: string;
      tenantId: string;
      title: string;
      description?: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
      fileName: string;
      thumbnailUrl?: string;
      category: string;
      tags: string[];
      createdAt: string;
      updatedAt: string;
      createdBy: string;
      status: 'processing' | 'ready' | 'error';
      metadata?: Record<string, any>;
    }
    
    // Análise de documento
    export interface DocumentAnalysis {
      id: string;
      documentId: string;
      tenantId: string;
      content: string;
      createdAt: string;
      updatedAt: string;
      status: 'processing' | 'completed' | 'error';
      extractedData?: Record<string, any>;
      vectorId?: string;
    }
    ```
