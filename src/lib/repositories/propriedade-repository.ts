import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from '../aws-config';
import { Propriedade } from '../crm-utils';
import { PropriedadeItem, propriedadeToItem, itemToPropriedade } from '../types/dynamodb-types';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'RuralCredit';

export const propriedadeRepository = {
  async listarPropriedades(tenantId: string): Promise<Propriedade[]> {
    try {
      console.log(`Listando propriedades para o tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `TENANT#${tenantId}`,
          ':sk': 'PROPRIEDADE#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} propriedades`);
      
      return (response.Items || []).map(item => itemToPropriedade(item as PropriedadeItem));
    } catch (error) {
      console.error('Erro ao listar propriedades:', error);
      throw new Error(`Falha ao listar propriedades: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async buscarPropriedadePorId(tenantId: string, propriedadeId: string): Promise<Propriedade | null> {
    try {
      console.log(`Buscando propriedade ${propriedadeId} para o tenant ${tenantId}`);
      
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `PROPRIEDADE#${propriedadeId}`
        }
      });

      const response = await dynamodb.send(command);
      
      if (!response.Item) {
        console.log(`Propriedade ${propriedadeId} não encontrada`);
        return null;
      }
      
      console.log(`Propriedade ${propriedadeId} encontrada`);
      return itemToPropriedade(response.Item as PropriedadeItem);
    } catch (error) {
      console.error(`Erro ao buscar propriedade ${propriedadeId}:`, error);
      throw new Error(`Falha ao buscar propriedade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async listarPropriedadesPorCliente(tenantId: string, clienteId: string): Promise<Propriedade[]> {
    try {
      console.log(`Listando propriedades para o cliente ${clienteId} no tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :gsi1sk)',
        ExpressionAttributeValues: {
          ':gsi1pk': `CLIENTE#${clienteId}`,
          ':gsi1sk': 'PROPRIEDADE#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} propriedades para o cliente ${clienteId}`);
      
      return (response.Items || []).map(item => itemToPropriedade(item as PropriedadeItem));
    } catch (error) {
      console.error(`Erro ao listar propriedades do cliente ${clienteId}:`, error);
      throw new Error(`Falha ao listar propriedades do cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async criarPropriedade(tenantId: string, propriedade: Omit<Propriedade, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Propriedade> {
    try {
      console.log(`Criando nova propriedade para o tenant ${tenantId}`);
      
      const timestamp = new Date().toISOString();
      const propriedadeId = uuidv4();

      const novaPropriedade: Propriedade = {
        id: propriedadeId,
        ...propriedade,
        dataCriacao: timestamp,
        dataAtualizacao: timestamp
      };

      const propriedadeItem = propriedadeToItem(novaPropriedade, tenantId);
      
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: propriedadeItem
      });

      await dynamodb.send(command);
      console.log(`Propriedade ${propriedadeId} criada com sucesso`);
      
      return novaPropriedade;
    } catch (error) {
      console.error('Erro ao criar propriedade:', error);
      throw new Error(`Falha ao criar propriedade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async atualizarPropriedade(tenantId: string, propriedadeId: string, dadosAtualizados: Partial<Omit<Propriedade, 'id' | 'dataCriacao'>>): Promise<Propriedade | null> {
    try {
      console.log(`Atualizando propriedade ${propriedadeId} para o tenant ${tenantId}`);
      
      // Primeiro, buscar a propriedade atual
      const propriedadeAtual = await this.buscarPropriedadePorId(tenantId, propriedadeId);
      if (!propriedadeAtual) {
        console.log(`Propriedade ${propriedadeId} não encontrada para atualização`);
        return null;
      }

      const timestamp = new Date().toISOString();
      const propriedadeAtualizada: Propriedade = {
        ...propriedadeAtual,
        ...dadosAtualizados,
        dataAtualizacao: timestamp
      };

      const propriedadeItem = propriedadeToItem(propriedadeAtualizada, tenantId);
      
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: propriedadeItem
      });

      await dynamodb.send(command);
      console.log(`Propriedade ${propriedadeId} atualizada com sucesso`);
      
      return propriedadeAtualizada;
    } catch (error) {
      console.error(`Erro ao atualizar propriedade ${propriedadeId}:`, error);
      throw new Error(`Falha ao atualizar propriedade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async excluirPropriedade(tenantId: string, propriedadeId: string): Promise<boolean> {
    try {
      console.log(`Excluindo propriedade ${propriedadeId} para o tenant ${tenantId}`);
      
      const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `PROPRIEDADE#${propriedadeId}`
        }
      });

      await dynamodb.send(command);
      console.log(`Propriedade ${propriedadeId} excluída com sucesso`);
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir propriedade ${propriedadeId}:`, error);
      throw new Error(`Falha ao excluir propriedade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
};
