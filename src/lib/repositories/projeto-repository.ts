import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from '../aws-config';
import { Projeto } from '../crm-utils';
import { ProjetoItem, projetoToItem, itemToProjeto } from '../types/dynamodb-types';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'RuralCredit';

export const projetoRepository = {
  async listarProjetos(tenantId: string): Promise<Projeto[]> {
    try {
      console.log(`Listando projetos para o tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `TENANT#${tenantId}`,
          ':sk': 'PROJETO#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontrados ${response.Items?.length || 0} projetos`);
      
      return (response.Items || []).map(item => itemToProjeto(item as ProjetoItem));
    } catch (error) {
      console.error('Erro ao listar projetos:', error);
      throw new Error(`Falha ao listar projetos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async buscarProjetoPorId(tenantId: string, projetoId: string): Promise<Projeto | null> {
    try {
      console.log(`Buscando projeto ${projetoId} para o tenant ${tenantId}`);
      
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `PROJETO#${projetoId}`
        }
      });

      const response = await dynamodb.send(command);
      
      if (!response.Item) {
        console.log(`Projeto ${projetoId} não encontrado`);
        return null;
      }
      
      console.log(`Projeto ${projetoId} encontrado`);
      return itemToProjeto(response.Item as ProjetoItem);
    } catch (error) {
      console.error(`Erro ao buscar projeto ${projetoId}:`, error);
      throw new Error(`Falha ao buscar projeto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async listarProjetosPorCliente(tenantId: string, clienteId: string): Promise<Projeto[]> {
    try {
      console.log(`Listando projetos para o cliente ${clienteId} no tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :gsi1sk)',
        ExpressionAttributeValues: {
          ':gsi1pk': `CLIENTE#${clienteId}`,
          ':gsi1sk': 'PROJETO#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontrados ${response.Items?.length || 0} projetos para o cliente ${clienteId}`);
      
      return (response.Items || []).map(item => itemToProjeto(item as ProjetoItem));
    } catch (error) {
      console.error(`Erro ao listar projetos do cliente ${clienteId}:`, error);
      throw new Error(`Falha ao listar projetos do cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async listarProjetosPorPropriedade(tenantId: string, propriedadeId: string): Promise<Projeto[]> {
    try {
      console.log(`Listando projetos para a propriedade ${propriedadeId} no tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :gsi2pk AND begins_with(GSI2SK, :gsi2sk)',
        ExpressionAttributeValues: {
          ':gsi2pk': `PROPRIEDADE#${propriedadeId}`,
          ':gsi2sk': 'PROJETO#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontrados ${response.Items?.length || 0} projetos para a propriedade ${propriedadeId}`);
      
      return (response.Items || []).map(item => itemToProjeto(item as ProjetoItem));
    } catch (error) {
      console.error(`Erro ao listar projetos da propriedade ${propriedadeId}:`, error);
      throw new Error(`Falha ao listar projetos da propriedade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async criarProjeto(tenantId: string, projeto: Omit<Projeto, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Projeto> {
    try {
      console.log(`Criando novo projeto para o tenant ${tenantId}`);
      
      const timestamp = new Date().toISOString();
      const projetoId = uuidv4();

      const novoProjeto: Projeto = {
        id: projetoId,
        ...projeto,
        dataCriacao: timestamp,
        dataAtualizacao: timestamp
      };

      const projetoItem = projetoToItem(novoProjeto, tenantId);
      
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: projetoItem
      });

      await dynamodb.send(command);
      console.log(`Projeto ${projetoId} criado com sucesso`);
      
      return novoProjeto;
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      throw new Error(`Falha ao criar projeto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async atualizarProjeto(tenantId: string, projetoId: string, dadosAtualizados: Partial<Omit<Projeto, 'id' | 'dataCriacao'>>): Promise<Projeto | null> {
    try {
      console.log(`Atualizando projeto ${projetoId} para o tenant ${tenantId}`);
      
      // Primeiro, buscar o projeto atual
      const projetoAtual = await this.buscarProjetoPorId(tenantId, projetoId);
      if (!projetoAtual) {
        console.log(`Projeto ${projetoId} não encontrado para atualização`);
        return null;
      }

      const timestamp = new Date().toISOString();
      const projetoAtualizado: Projeto = {
        ...projetoAtual,
        ...dadosAtualizados,
        dataAtualizacao: timestamp
      };

      const projetoItem = projetoToItem(projetoAtualizado, tenantId);
      
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: projetoItem
      });

      await dynamodb.send(command);
      console.log(`Projeto ${projetoId} atualizado com sucesso`);
      
      return projetoAtualizado;
    } catch (error) {
      console.error(`Erro ao atualizar projeto ${projetoId}:`, error);
      throw new Error(`Falha ao atualizar projeto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async excluirProjeto(tenantId: string, projetoId: string): Promise<boolean> {
    try {
      console.log(`Excluindo projeto ${projetoId} para o tenant ${tenantId}`);
      
      const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `PROJETO#${projetoId}`
        }
      });

      await dynamodb.send(command);
      console.log(`Projeto ${projetoId} excluído com sucesso`);
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir projeto ${projetoId}:`, error);
      throw new Error(`Falha ao excluir projeto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
};
