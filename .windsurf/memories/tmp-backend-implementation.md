# Implementação do Backend - AgroCredit

## Configuração do Repositório Base para DynamoDB (Single-Table Design)

A implementação do backend do AgroCredit utilizará um modelo de tabela única (single-table design) para o DynamoDB, conforme definido no documento de modelagem. A tabela `RuralCreditAI` será responsável por armazenar todos os dados da aplicação de forma otimizada.

### Repositório Base

```typescript
// src/repositories/baseRepo.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand
} from '@aws-sdk/lib-dynamodb';

export class BaseRepository {
  protected client: DynamoDBDocumentClient;
  protected tableName: string;
  
  constructor() {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    });
    
    this.client = DynamoDBDocumentClient.from(client);
    this.tableName = 'RuralCreditAI';
  }
  
  async create(item: Record<string, any>): Promise<Record<string, any>> {
    const now = new Date().toISOString();
    
    const newItem = {
      ...item,
      createdAt: now,
      updatedAt: now
    };
    
    const command = new PutCommand({
      TableName: this.tableName,
      Item: newItem,
    });
    
    await this.client.send(command);
    return newItem;
  }
  
  async get(key: Record<string, any>): Promise<Record<string, any> | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: key
    });
    
    const response = await this.client.send(command);
    return response.Item || null;
  }
  
  async update(key: Record<string, any>, updates: Record<string, any>): Promise<Record<string, any>> {
    const now = new Date().toISOString();
    
    // Construir expressão de atualização dinamicamente
    let updateExpression = 'set updatedAt = :updatedAt';
    const expressionAttributeValues: Record<string, any> = {
      ':updatedAt': now
    };
    
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'PK' && key !== 'SK' && key !== 'createdAt') {
        updateExpression += `, ${key} = :${key}`;
        expressionAttributeValues[`:${key}`] = value;
      }
    });
    
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });
    
    const response = await this.client.send(command);
    return response.Attributes || {};
  }
  
  async delete(key: Record<string, any>): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: key
    });
    
    await this.client.send(command);
  }
  
  async query(params: Record<string, any>): Promise<Record<string, any>[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      ...params
    });
    
    const response = await this.client.send(command);
    return response.Items || [];
  }
  
  async scan(params: Record<string, any> = {}): Promise<Record<string, any>[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
      ...params
    });
    
    const response = await this.client.send(command);
    return response.Items || [];
  }
}

export default new BaseRepository();
```

### Repositório de Conversas

```typescript
// src/repositories/conversationsRepo.ts
import { v4 as uuidv4 } from 'uuid';
import baseRepo from './baseRepo';

export interface Conversation {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

class ConversationsRepository {
  /**
   * Criar nova conversa
   */
  async create(data: Partial<Conversation>): Promise<Conversation> {
    const conversationId = data.id || uuidv4();
    const timestamp = new Date().toISOString();
    
    const item = {
      PK: `TENANT#${data.tenantId}`,
      SK: `CONVERSATION#${conversationId}`,
      GSI1PK: `USER#${data.userId}`,
      GSI1SK: `CONVERSATION#${timestamp}`,
      GSI2PK: `TENANT#${data.tenantId}#CONVERSATION`,
      GSI2SK: timestamp,
      id: conversationId,
      tenantId: data.tenantId,
      userId: data.userId,
      title: data.title || 'Nova conversa',
      lastMessageAt: timestamp,
      lastMessagePreview: '',
      status: 'ACTIVE',
      ...data
    };
    
    await baseRepo.create(item);
    
    return item as unknown as Conversation;
  }
  
  /**
   * Obter conversa por ID
   */
  async getById(conversationId: string): Promise<Conversation | null> {
    // Para obter uma conversa por ID precisamos primeiro buscar
    // qual é o tenantId desta conversa usando GSI
    const result = await baseRepo.query({
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1SK = :sk',
      ExpressionAttributeValues: {
        ':sk': `CONVERSATION#${conversationId}`
      },
      Limit: 1
    });
    
    if (result.length === 0) return null;
    
    const conversation = result[0];
    const tenantId = conversation.tenantId;
    
    // Agora que temos o tenantId, podemos buscar com a chave primária
    const item = await baseRepo.get({
      PK: `TENANT#${tenantId}`,
      SK: `CONVERSATION#${conversationId}`
    });
    
    return item as unknown as Conversation;
  }
  
  /**
   * Listar conversas por tenant
   */
  async getByTenantId(tenantId: string): Promise<Conversation[]> {
    const result = await baseRepo.query({
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `TENANT#${tenantId}`,
        ':sk': 'CONVERSATION#'
      }
    });
    
    return result as unknown as Conversation[];
  }
  
  /**
   * Listar conversas por usuário (usando GSI1)
   */
  async getByUserId(userId: string): Promise<Conversation[]> {
    const result = await baseRepo.query({
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'CONVERSATION#'
      }
    });
    
    return result as unknown as Conversation[];
  }
  
  /**
   * Atualizar uma conversa
   */
  async update(conversationId: string, tenantId: string, updates: Partial<Conversation>): Promise<Conversation> {
    const updatedItem = await baseRepo.update(
      { 
        PK: `TENANT#${tenantId}`,
        SK: `CONVERSATION#${conversationId}`
      },
      updates
    );
    
    return updatedItem as unknown as Conversation;
  }
  
  /**
   * Excluir uma conversa
   */
  async delete(conversationId: string, tenantId: string): Promise<void> {
    await baseRepo.delete({
      PK: `TENANT#${tenantId}`,
      SK: `CONVERSATION#${conversationId}`
    });
  }
}

export const conversationsRepo = new ConversationsRepository();
```

### Repositório de Mensagens

```typescript
// src/repositories/messagesRepo.ts
import { v4 as uuidv4 } from 'uuid';
import baseRepo from './baseRepo';

export interface Message {
  id: string;
  conversationId: string;
  tenantId: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  status?: 'sent' | 'generating' | 'completed' | 'error';
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

class MessagesRepository {
  /**
   * Criar nova mensagem
   */
  async create(data: Partial<Message>): Promise<Message> {
    const messageId = data.id || uuidv4();
    const timestamp = new Date().toISOString();
    
    // Obter o tenantId da conversa se não for fornecido
    let tenantId = data.tenantId;
    if (!tenantId && data.conversationId) {
      const conversationResult = await baseRepo.query({
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1SK = :sk',
        ExpressionAttributeValues: {
          ':sk': `CONVERSATION#${data.conversationId}`
        },
        Limit: 1
      });
      
      if (conversationResult.length > 0) {
        tenantId = conversationResult[0].tenantId;
      }
    }
    
    if (!tenantId) {
      throw new Error('TenantId não fornecido e não foi possível obter da conversa');
    }
    
    const item = {
      PK: `TENANT#${tenantId}`,
      SK: `CONVERSATION#${data.conversationId}#MESSAGE#${messageId}`,
      GSI1PK: `CONVERSATION#${data.conversationId}`,
      GSI1SK: `MESSAGE#${timestamp}`,
      id: messageId,
      conversationId: data.conversationId,
      tenantId: tenantId,
      userId: data.userId,
      content: data.content || '',
      role: data.role || 'user',
      status: data.status || 'sent',
      attachments: data.attachments || [],
      metadata: data.metadata || {},
      ...data
    };
    
    await baseRepo.create(item);
    
    return item as unknown as Message;
  }
  
  /**
   * Obter mensagem por ID
   */
  async getById(messageId: string, conversationId: string, tenantId: string): Promise<Message | null> {
    // Buscar diretamente pela chave composta
    const item = await baseRepo.query({
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `TENANT#${tenantId}`,
        ':sk': `CONVERSATION#${conversationId}#MESSAGE#${messageId}`
      },
      Limit: 1
    });
    
    if (item.length === 0) return null;
    
    return item[0] as unknown as Message;
  }
  
  /**
   * Listar mensagens de uma conversa
   */
  async getByConversationId(conversationId: string, tenantId: string, limit: number = 50): Promise<Message[]> {
    const result = await baseRepo.query({
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `TENANT#${tenantId}`,
        ':sk': `CONVERSATION#${conversationId}#MESSAGE#`
      },
      ScanIndexForward: true, // Ordenar da mais antiga para a mais recente
      Limit: limit
    });
    
    return result as unknown as Message[];
  }
  
  /**
   * Obter histórico de conversa para contexto da IA
   */
  async getConversationHistory(conversationId: string, limit: number = 10): Promise<Message[]> {
    // Primeiro precisamos obter o tenantId da conversa
    const conversationResult = await baseRepo.query({
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1SK = :sk',
      ExpressionAttributeValues: {
        ':sk': `CONVERSATION#${conversationId}`
      },
      Limit: 1
    });
    
    if (conversationResult.length === 0) return [];
    
    const tenantId = conversationResult[0].tenantId;
    
    // Agora podemos buscar as mensagens
    const result = await baseRepo.query({
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `CONVERSATION#${conversationId}`,
        ':sk': 'MESSAGE#'
      },
      ScanIndexForward: false, // Ordenar da mais recente para a mais antiga
      Limit: limit
    });
    
    // Inverter a ordem para que a mais antiga venha primeiro (ordem cronológica)
    return (result as unknown as Message[]).reverse();
  }
  
  /**
   * Atualizar uma mensagem
   */
  async update(messageId: string, conversationId: string, tenantId: string, updates: Partial<Message>): Promise<Message> {
    // Primeiro precisamos obter a SK completa da mensagem
    const query = await baseRepo.query({
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `TENANT#${tenantId}`,
        ':sk': `CONVERSATION#${conversationId}#MESSAGE#${messageId}`
      },
      Limit: 1
    });
    
    if (query.length === 0) {
      throw new Error('Mensagem não encontrada');
    }
    
    const sk = query[0].SK;
    
    const updatedItem = await baseRepo.update(
      { 
        PK: `TENANT#${tenantId}`,
        SK: sk
      },
      updates
    );
    
    return updatedItem as unknown as Message;
  }
  
  /**
   * Excluir uma mensagem
   */
  async delete(messageId: string, conversationId: string, tenantId: string): Promise<void> {
    // Primeiro precisamos obter a SK completa da mensagem
    const query = await baseRepo.query({
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `TENANT#${tenantId}`,
        ':sk': `CONVERSATION#${conversationId}#MESSAGE#${messageId}`
      },
      Limit: 1
    });
    
    if (query.length === 0) return;
    
    const sk = query[0].SK;
    
    await baseRepo.delete({
      PK: `TENANT#${tenantId}`,
      SK: sk
    });
  }
}

export const messagesRepo = new MessagesRepository();
```
