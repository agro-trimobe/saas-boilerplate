import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from '../aws-config';
import { Oportunidade } from '../crm-utils';
import { OportunidadeItem, oportunidadeToItem, itemToOportunidade } from '../types/dynamodb-types';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'RuralCredit';

export const oportunidadeRepository = {
  async listarOportunidades(tenantId: string): Promise<Oportunidade[]> {
    try {
      console.log(`Listando oportunidades para o tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `TENANT#${tenantId}`,
          ':sk': 'OPORTUNIDADE#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} oportunidades`);
      
      return (response.Items || []).map(item => itemToOportunidade(item as OportunidadeItem));
    } catch (error) {
      console.error('Erro ao listar oportunidades:', error);
      throw new Error(`Falha ao listar oportunidades: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async buscarOportunidadePorId(tenantId: string, oportunidadeId: string): Promise<Oportunidade | null> {
    try {
      console.log(`Buscando oportunidade ${oportunidadeId} para o tenant ${tenantId}`);
      
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `OPORTUNIDADE#${oportunidadeId}`
        }
      });

      const response = await dynamodb.send(command);
      
      if (!response.Item) {
        console.log(`Oportunidade ${oportunidadeId} não encontrada`);
        return null;
      }
      
      console.log(`Oportunidade ${oportunidadeId} encontrada`);
      return itemToOportunidade(response.Item as OportunidadeItem);
    } catch (error) {
      console.error(`Erro ao buscar oportunidade ${oportunidadeId}:`, error);
      throw new Error(`Falha ao buscar oportunidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async listarOportunidadesPorCliente(tenantId: string, clienteId: string): Promise<Oportunidade[]> {
    try {
      console.log(`Listando oportunidades para o cliente ${clienteId} no tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :gsi1sk)',
        ExpressionAttributeValues: {
          ':gsi1pk': `CLIENTE#${clienteId}`,
          ':gsi1sk': 'OPORTUNIDADE#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} oportunidades para o cliente ${clienteId}`);
      
      return (response.Items || []).map(item => itemToOportunidade(item as OportunidadeItem));
    } catch (error) {
      console.error(`Erro ao listar oportunidades do cliente ${clienteId}:`, error);
      throw new Error(`Falha ao listar oportunidades do cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async listarOportunidadesPorStatus(tenantId: string, status: string): Promise<Oportunidade[]> {
    try {
      console.log(`Listando oportunidades com status ${status} para o tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :gsi2pk',
        ExpressionAttributeValues: {
          ':gsi2pk': `TENANT#${tenantId}#STATUS#${status}`
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} oportunidades com status ${status}`);
      
      return (response.Items || []).map(item => itemToOportunidade(item as OportunidadeItem));
    } catch (error) {
      console.error(`Erro ao listar oportunidades com status ${status}:`, error);
      throw new Error(`Falha ao listar oportunidades por status: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async criarOportunidade(tenantId: string, oportunidade: Omit<Oportunidade, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Oportunidade> {
    try {
      console.log(`Criando nova oportunidade para o tenant ${tenantId}`);
      
      const timestamp = new Date().toISOString();
      const oportunidadeId = uuidv4();

      const novaOportunidade: Oportunidade = {
        id: oportunidadeId,
        ...oportunidade,
        dataCriacao: timestamp,
        dataAtualizacao: timestamp
      };

      const oportunidadeItem = oportunidadeToItem(novaOportunidade, tenantId);
      
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: oportunidadeItem
      });

      await dynamodb.send(command);
      console.log(`Oportunidade ${oportunidadeId} criada com sucesso`);
      
      return novaOportunidade;
    } catch (error) {
      console.error('Erro ao criar oportunidade:', error);
      throw new Error(`Falha ao criar oportunidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async atualizarOportunidade(tenantId: string, oportunidadeId: string, dadosAtualizados: Partial<Omit<Oportunidade, 'id' | 'dataCriacao'>>): Promise<Oportunidade | null> {
    try {
      console.log(`Atualizando oportunidade ${oportunidadeId} para o tenant ${tenantId}`);
      
      // Primeiro, buscar a oportunidade atual
      const oportunidadeAtual = await this.buscarOportunidadePorId(tenantId, oportunidadeId);
      if (!oportunidadeAtual) {
        console.log(`Oportunidade ${oportunidadeId} não encontrada para atualização`);
        return null;
      }

      const timestamp = new Date().toISOString();
      const oportunidadeAtualizada: Oportunidade = {
        ...oportunidadeAtual,
        ...dadosAtualizados,
        dataAtualizacao: timestamp
      };

      const oportunidadeItem = oportunidadeToItem(oportunidadeAtualizada, tenantId);
      
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: oportunidadeItem
      });

      await dynamodb.send(command);
      console.log(`Oportunidade ${oportunidadeId} atualizada com sucesso`);
      
      return oportunidadeAtualizada;
    } catch (error) {
      console.error(`Erro ao atualizar oportunidade ${oportunidadeId}:`, error);
      throw new Error(`Falha ao atualizar oportunidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async excluirOportunidade(tenantId: string, oportunidadeId: string): Promise<boolean> {
    try {
      console.log(`Excluindo oportunidade ${oportunidadeId} para o tenant ${tenantId}`);
      
      const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `OPORTUNIDADE#${oportunidadeId}`
        }
      });

      await dynamodb.send(command);
      console.log(`Oportunidade ${oportunidadeId} excluída com sucesso`);
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir oportunidade ${oportunidadeId}:`, error);
      throw new Error(`Falha ao excluir oportunidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
};
