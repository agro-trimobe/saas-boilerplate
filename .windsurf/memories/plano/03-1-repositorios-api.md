# 3.3. Implementação de Repositórios Específicos (3 dias)

Este documento detalha a continuação da implementação do backend do AgroCredit, focando nos repositórios específicos para cada entidade e na estrutura de API.

## Repositórios Específicos

Utilizando o padrão de single-table design e o repositório base, serão implementados repositórios específicos para cada entidade principal do sistema.

- [ ] **Implementar repositório de conversas**
  - Criar arquivo `src/repositories/conversationsRepo.ts`:
    ```typescript
    import { v4 as uuidv4 } from 'uuid';
    import { Conversation } from '../types';
    import { baseRepo } from './baseRepo';
    
    export class ConversationsRepository {
      /**
       * Criar nova conversa
       */
      async create(data: Partial<Conversation>): Promise<Conversation> {
        const conversationId = data.id || uuidv4();
        const tenantId = data.tenantId;
        
        if (!tenantId) {
          throw new Error('O ID do tenant é obrigatório');
        }
        
        const now = new Date().toISOString();
        
        const item = {
          PK: `TENANT#${tenantId}`,
          SK: `CONVERSATION#${conversationId}`,
          id: conversationId,
          tenantId,
          title: data.title || 'Nova Conversa',
          createdAt: now,
          updatedAt: now,
          createdBy: data.createdBy,
          status: data.status || 'active',
          GSI1PK: `TENANT#${tenantId}`,
          GSI1SK: `CONVERSATION#${now}`,
          ...data
        };
        
        await baseRepo.create(item);
        
        return item as unknown as Conversation;
      }
      
      /**
       * Buscar conversa por ID
       */
      async getById(tenantId: string, conversationId: string): Promise<Conversation | null> {
        const result = await baseRepo.get(
          `TENANT#${tenantId}`,
          `CONVERSATION#${conversationId}`
        );
        
        return result as unknown as Conversation;
      }
      
      /**
       * Listar conversas de um tenant
       */
      async listByTenant(tenantId: string, options: {
        limit?: number;
        status?: 'active' | 'archived';
        nextToken?: string;
      } = {}): Promise<{
        items: Conversation[];
        nextToken?: string;
      }> {
        const { limit = 20, status, nextToken } = options;
        
        let filterExpression;
        let expressionAttributeValues: Record<string, any> = {};
        
        if (status) {
          filterExpression = 'contains(#status, :status)';
          expressionAttributeValues = {
            ':status': status,
          };
        }
        
        const result = await baseRepo.query({
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :gsi1sk)',
          ExpressionAttributeValues: {
            ':gsi1pk': `TENANT#${tenantId}`,
            ':gsi1sk': 'CONVERSATION#',
            ...expressionAttributeValues,
          },
          ExpressionAttributeNames: status ? { '#status': 'status' } : undefined,
          FilterExpression: filterExpression,
          Limit: limit,
          ScanIndexForward: false, // Ordem decrescente (mais recentes primeiro)
          ExclusiveStartKey: nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString()) : undefined,
        });
        
        // Preparar token para próxima página
        let newNextToken;
        if (result.LastEvaluatedKey) {
          newNextToken = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
        }
        
        return {
          items: (result.Items || []) as unknown as Conversation[],
          nextToken: newNextToken,
        };
      }
      
      /**
       * Atualizar conversa
       */
      async update(tenantId: string, conversationId: string, data: Partial<Conversation>): Promise<Conversation | null> {
        const { id, PK, SK, GSI1PK, GSI1SK, tenantId: _, ...updateData } = data as any;
        
        const result = await baseRepo.update(
          `TENANT#${tenantId}`,
          `CONVERSATION#${conversationId}`,
          updateData
        );
        
        return result as unknown as Conversation;
      }
      
      /**
       * Arquivar conversa
       */
      async archive(tenantId: string, conversationId: string): Promise<Conversation | null> {
        return this.update(tenantId, conversationId, { status: 'archived' });
      }
      
      /**
       * Excluir conversa
       */
      async delete(tenantId: string, conversationId: string): Promise<boolean> {
        return baseRepo.delete(
          `TENANT#${tenantId}`,
          `CONVERSATION#${conversationId}`
        );
      }
    }
    
    export const conversationsRepo = new ConversationsRepository();
    ```

- [ ] **Implementar repositório de mensagens**
  - Criar arquivo `src/repositories/messagesRepo.ts`:
    ```typescript
    import { v4 as uuidv4 } from 'uuid';
    import { Message } from '../types';
    import { baseRepo } from './baseRepo';
    import { conversationsRepo } from './conversationsRepo';
    
    export class MessagesRepository {
      /**
       * Criar nova mensagem
       */
      async create(data: Partial<Message>): Promise<Message> {
        const messageId = data.id || uuidv4();
        const { conversationId, tenantId, content, role } = data;
        
        if (!conversationId || !tenantId) {
          throw new Error('Os IDs do tenant e da conversa são obrigatórios');
        }
        
        const now = new Date().toISOString();
        
        const item = {
          PK: `TENANT#${tenantId}`,
          SK: `CONVERSATION#${conversationId}#MESSAGE#${messageId}`,
          id: messageId,
          conversationId,
          tenantId,
          content: content || '',
          role: role || 'user',
          createdAt: now,
          updatedAt: now,
          GSI1PK: `CONVERSATION#${conversationId}`,
          GSI1SK: `MESSAGE#${now}`,
          ...data
        };
        
        // Criar a mensagem
        await baseRepo.create(item);
        
        // Atualizar informações da conversa
        if (role !== 'system') {
          await conversationsRepo.update(tenantId, conversationId, {
            lastMessageAt: now,
            lastMessagePreview: content?.substring(0, 100) || ''
          });
        }
        
        return item as unknown as Message;
      }
      
      /**
       * Buscar mensagem por ID
       */
      async getById(tenantId: string, conversationId: string, messageId: string): Promise<Message | null> {
        const result = await baseRepo.get(
          `TENANT#${tenantId}`,
          `CONVERSATION#${conversationId}#MESSAGE#${messageId}`
        );
        
        return result as unknown as Message;
      }
      
      /**
       * Listar mensagens de uma conversa
       */
      async listByConversation(tenantId: string, conversationId: string, options: {
        limit?: number;
        nextToken?: string;
      } = {}): Promise<{
        items: Message[];
        nextToken?: string;
      }> {
        const { limit = 50, nextToken } = options;
        
        const result = await baseRepo.query({
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :gsi1sk)',
          ExpressionAttributeValues: {
            ':gsi1pk': `CONVERSATION#${conversationId}`,
            ':gsi1sk': 'MESSAGE#'
          },
          Limit: limit,
          ScanIndexForward: true, // Ordem crescente (mais antigas primeiro)
          ExclusiveStartKey: nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString()) : undefined,
        });
        
        // Preparar token para próxima página
        let newNextToken;
        if (result.LastEvaluatedKey) {
          newNextToken = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
        }
        
        return {
          items: (result.Items || []) as unknown as Message[],
          nextToken: newNextToken,
        };
      }
      
      /**
       * Atualizar mensagem
       */
      async update(tenantId: string, conversationId: string, messageId: string, data: Partial<Message>): Promise<Message | null> {
        const { id, PK, SK, GSI1PK, GSI1SK, tenantId: _, conversationId: __, ...updateData } = data as any;
        
        const result = await baseRepo.update(
          `TENANT#${tenantId}`,
          `CONVERSATION#${conversationId}#MESSAGE#${messageId}`,
          updateData
        );
        
        return result as unknown as Message;
      }
      
      /**
       * Excluir mensagem
       */
      async delete(tenantId: string, conversationId: string, messageId: string): Promise<boolean> {
        return baseRepo.delete(
          `TENANT#${tenantId}`,
          `CONVERSATION#${conversationId}#MESSAGE#${messageId}`
        );
      }
    }
    
    export const messagesRepo = new MessagesRepository();
    ```

- [ ] **Implementar repositório de documentos**
  - Criar arquivo `src/repositories/documentsRepo.ts`:
    ```typescript
    import { v4 as uuidv4 } from 'uuid';
    import { Document } from '../types';
    import { baseRepo } from './baseRepo';
    
    export class DocumentsRepository {
      /**
       * Criar novo documento
       */
      async create(data: Partial<Document>): Promise<Document> {
        const documentId = data.id || uuidv4();
        const { tenantId, title, fileUrl, fileType, fileSize, fileName } = data;
        
        if (!tenantId || !title || !fileUrl || !fileType || !fileSize || !fileName) {
          throw new Error('Dados obrigatórios do documento não fornecidos');
        }
        
        const now = new Date().toISOString();
        
        const item = {
          PK: `TENANT#${tenantId}`,
          SK: `DOCUMENT#${documentId}`,
          id: documentId,
          tenantId,
          title,
          fileUrl,
          fileType,
          fileSize,
          fileName,
          category: data.category || 'Outros',
          tags: data.tags || [],
          createdAt: now,
          updatedAt: now,
          createdBy: data.createdBy,
          status: data.status || 'processing',
          GSI1PK: `TENANT#${tenantId}`,
          GSI1SK: `DOCUMENT#${now}`,
          ...data
        };
        
        await baseRepo.create(item);
        
        return item as unknown as Document;
      }
      
      /**
       * Buscar documento por ID
       */
      async getById(tenantId: string, documentId: string): Promise<Document | null> {
        const result = await baseRepo.get(
          `TENANT#${tenantId}`,
          `DOCUMENT#${documentId}`
        );
        
        return result as unknown as Document;
      }
      
      /**
       * Listar documentos de um tenant
       */
      async listByTenant(tenantId: string, options: {
        limit?: number;
        category?: string;
        tags?: string[];
        status?: string;
        nextToken?: string;
      } = {}): Promise<{
        items: Document[];
        nextToken?: string;
      }> {
        const { limit = 20, category, tags, status, nextToken } = options;
        
        let filterExpressions: string[] = [];
        let expressionAttributeValues: Record<string, any> = {};
        let expressionAttributeNames: Record<string, string> = {};
        
        if (category) {
          filterExpressions.push('#category = :category');
          expressionAttributeValues[':category'] = category;
          expressionAttributeNames['#category'] = 'category';
        }
        
        if (status) {
          filterExpressions.push('#status = :status');
          expressionAttributeValues[':status'] = status;
          expressionAttributeNames['#status'] = 'status';
        }
        
        if (tags && tags.length > 0) {
          const tagConditions = tags.map((tag, index) => `contains(#tags, :tag${index})`);
          filterExpressions.push(`(${tagConditions.join(' OR ')})`);
          tags.forEach((tag, index) => {
            expressionAttributeValues[`:tag${index}`] = tag;
          });
          expressionAttributeNames['#tags'] = 'tags';
        }
        
        const filterExpression = filterExpressions.length > 0 
          ? filterExpressions.join(' AND ') 
          : undefined;
        
        const result = await baseRepo.query({
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :gsi1sk)',
          ExpressionAttributeValues: {
            ':gsi1pk': `TENANT#${tenantId}`,
            ':gsi1sk': 'DOCUMENT#',
            ...expressionAttributeValues,
          },
          ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 
            ? expressionAttributeNames 
            : undefined,
          FilterExpression: filterExpression,
          Limit: limit,
          ScanIndexForward: false, // Ordem decrescente (mais recentes primeiro)
          ExclusiveStartKey: nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString()) : undefined,
        });
        
        // Preparar token para próxima página
        let newNextToken;
        if (result.LastEvaluatedKey) {
          newNextToken = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
        }
        
        return {
          items: (result.Items || []) as unknown as Document[],
          nextToken: newNextToken,
        };
      }
      
      /**
       * Atualizar documento
       */
      async update(tenantId: string, documentId: string, data: Partial<Document>): Promise<Document | null> {
        const { id, PK, SK, GSI1PK, GSI1SK, tenantId: _, ...updateData } = data as any;
        
        const result = await baseRepo.update(
          `TENANT#${tenantId}`,
          `DOCUMENT#${documentId}`,
          updateData
        );
        
        return result as unknown as Document;
      }
      
      /**
       * Excluir documento
       */
      async delete(tenantId: string, documentId: string): Promise<boolean> {
        return baseRepo.delete(
          `TENANT#${tenantId}`,
          `DOCUMENT#${documentId}`
        );
      }
    }
    
    export const documentsRepo = new DocumentsRepository();
    ```

- [ ] **Implementar repositório de anexos**
  - Criar arquivo `src/repositories/attachmentsRepo.ts` para gerenciar os anexos em mensagens e documentos
  - Implementar métodos para criar, listar e excluir anexos

- [ ] **Implementar repositório de análise de documentos**
  - Criar arquivo `src/repositories/documentAnalysisRepo.ts` para gerenciar as análises geradas para os documentos
  - Implementar métodos para criar, buscar e atualizar análises

## 3.4. Estrutura de API (3 dias)

- [ ] **Criar middleware de autenticação e autorização**
  - Implementar middleware para verificação de tokens JWT em `src/middlewares/auth.ts`
  - Criar middleware para validação de tenants em `src/middlewares/tenant.ts`
  - Implementar middleware para validação de input com Zod em `src/middlewares/validation.ts`

- [ ] **Implementar endpoints de API para gerenciamento de usuários**
  - Criar rotas em `src/app/api/auth/` para cadastro, login e gestão de usuários
  - Implementar integração com Cognito para autenticação

- [ ] **Desenvolver endpoints para o sistema de conversas**
  - Criar API RESTful para gerenciamento de conversas e mensagens
  - Implementar streaming de resposta para mensagens do assistente

- [ ] **Desenvolver endpoints para gestão de documentos**
  - Criar API para upload, listagem e análise de documentos
  - Implementar sistema de tags e categorização
  
- [ ] **Configurar CORS e segurança da API**
  - Implementar configurações de CORS adequadas para acesso frontend
  - Configurar headers de segurança para proteção da API
