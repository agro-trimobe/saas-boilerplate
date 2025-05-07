import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from '../aws-config';
import { Simulacao } from '../crm-utils';
import { SimulacaoItem, simulacaoToItem, itemToSimulacao } from '../types/dynamodb-types';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'RuralCredit';

export const simulacaoRepository = {
  async listarSimulacoes(tenantId: string): Promise<Simulacao[]> {
    try {
      console.log(`Listando simulações para o tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `TENANT#${tenantId}`,
          ':sk': 'SIMULACAO#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} simulações`);
      
      return (response.Items || []).map(item => itemToSimulacao(item as SimulacaoItem));
    } catch (error) {
      console.error('Erro ao listar simulações:', error);
      throw new Error(`Falha ao listar simulações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async buscarSimulacaoPorId(tenantId: string, simulacaoId: string): Promise<Simulacao | null> {
    try {
      console.log(`Buscando simulação ${simulacaoId} para o tenant ${tenantId}`);
      
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `SIMULACAO#${simulacaoId}`
        }
      });

      const response = await dynamodb.send(command);
      
      if (!response.Item) {
        console.log(`Simulação ${simulacaoId} não encontrada`);
        return null;
      }
      
      console.log(`Simulação ${simulacaoId} encontrada`);
      return itemToSimulacao(response.Item as SimulacaoItem);
    } catch (error) {
      console.error(`Erro ao buscar simulação ${simulacaoId}:`, error);
      throw new Error(`Falha ao buscar simulação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async listarSimulacoesPorCliente(tenantId: string, clienteId: string): Promise<Simulacao[]> {
    try {
      console.log(`Listando simulações para o cliente ${clienteId} no tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :gsi1sk)',
        ExpressionAttributeValues: {
          ':gsi1pk': `CLIENTE#${clienteId}`,
          ':gsi1sk': 'SIMULACAO#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} simulações para o cliente ${clienteId}`);
      
      return (response.Items || []).map(item => itemToSimulacao(item as SimulacaoItem));
    } catch (error) {
      console.error(`Erro ao listar simulações do cliente ${clienteId}:`, error);
      throw new Error(`Falha ao listar simulações do cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async listarSimulacoesPorProjeto(tenantId: string, projetoId: string): Promise<Simulacao[]> {
    try {
      console.log(`Listando simulações para o projeto ${projetoId} no tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        FilterExpression: 'projetoId = :projetoId',
        ExpressionAttributeValues: {
          ':pk': `TENANT#${tenantId}`,
          ':sk': 'SIMULACAO#',
          ':projetoId': projetoId
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} simulações para o projeto ${projetoId}`);
      
      return (response.Items || []).map(item => itemToSimulacao(item as SimulacaoItem));
    } catch (error) {
      console.error(`Erro ao listar simulações do projeto ${projetoId}:`, error);
      throw new Error(`Falha ao listar simulações do projeto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async listarSimulacoesPorLinha(tenantId: string, linhaCredito: string): Promise<Simulacao[]> {
    try {
      console.log(`Listando simulações para a linha de crédito ${linhaCredito} no tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :gsi2pk',
        ExpressionAttributeValues: {
          ':gsi2pk': `LINHA#${linhaCredito}`
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} simulações para a linha de crédito ${linhaCredito}`);
      
      return (response.Items || []).map(item => itemToSimulacao(item as SimulacaoItem));
    } catch (error) {
      console.error(`Erro ao listar simulações da linha de crédito ${linhaCredito}:`, error);
      throw new Error(`Falha ao listar simulações por linha de crédito: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async criarSimulacao(tenantId: string, simulacao: Omit<Simulacao, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Simulacao> {
    try {
      console.log(`Criando nova simulação para o tenant ${tenantId}`);
      
      const timestamp = new Date().toISOString();
      const simulacaoId = uuidv4();

      const novaSimulacao: Simulacao = {
        id: simulacaoId,
        ...simulacao,
        dataCriacao: timestamp,
        dataAtualizacao: timestamp
      };

      const simulacaoItem = simulacaoToItem(novaSimulacao, tenantId);
      
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: simulacaoItem
      });

      await dynamodb.send(command);
      console.log(`Simulação ${simulacaoId} criada com sucesso`);
      
      return novaSimulacao;
    } catch (error) {
      console.error('Erro ao criar simulação:', error);
      throw new Error(`Falha ao criar simulação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async atualizarSimulacao(tenantId: string, simulacaoId: string, dadosAtualizados: Partial<Omit<Simulacao, 'id' | 'dataCriacao'>>): Promise<Simulacao | null> {
    try {
      console.log(`Atualizando simulação ${simulacaoId} para o tenant ${tenantId}`);
      
      // Primeiro, buscar a simulação atual
      const simulacaoAtual = await this.buscarSimulacaoPorId(tenantId, simulacaoId);
      if (!simulacaoAtual) {
        console.log(`Simulação ${simulacaoId} não encontrada para atualização`);
        return null;
      }

      const timestamp = new Date().toISOString();
      const simulacaoAtualizada: Simulacao = {
        ...simulacaoAtual,
        ...dadosAtualizados,
        dataAtualizacao: timestamp
      };

      const simulacaoItem = simulacaoToItem(simulacaoAtualizada, tenantId);
      
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: simulacaoItem
      });

      await dynamodb.send(command);
      console.log(`Simulação ${simulacaoId} atualizada com sucesso`);
      
      return simulacaoAtualizada;
    } catch (error) {
      console.error(`Erro ao atualizar simulação ${simulacaoId}:`, error);
      throw new Error(`Falha ao atualizar simulação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async excluirSimulacao(tenantId: string, simulacaoId: string): Promise<boolean> {
    try {
      console.log(`Excluindo simulação ${simulacaoId} para o tenant ${tenantId}`);
      
      const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `SIMULACAO#${simulacaoId}`
        }
      });

      await dynamodb.send(command);
      console.log(`Simulação ${simulacaoId} excluída com sucesso`);
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir simulação ${simulacaoId}:`, error);
      throw new Error(`Falha ao excluir simulação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
};
