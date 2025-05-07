import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from '../aws-config';
import { Quadro } from '../crm-utils';
import { QuadroItem, quadroToItem, itemToQuadro } from '../types/dynamodb-types';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'RuralCredit';

export const quadroRepository = {
  async listarQuadros(tenantId: string): Promise<Quadro[]> {
    try {
      console.log(`Listando quadros para o tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `TENANT#${tenantId}`,
          ':sk': 'QUADRO#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontrados ${response.Items?.length || 0} quadros`);
      
      return (response.Items || []).map(item => itemToQuadro(item as QuadroItem));
    } catch (error) {
      console.error('Erro ao listar quadros:', error);
      throw new Error(`Falha ao listar quadros: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async buscarQuadroPorId(tenantId: string, quadroId: string): Promise<Quadro | null> {
    try {
      console.log(`Buscando quadro ${quadroId} para o tenant ${tenantId}`);
      
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `QUADRO#${quadroId}`
        }
      });

      const response = await dynamodb.send(command);
      
      if (!response.Item) {
        console.log(`Quadro ${quadroId} não encontrado`);
        return null;
      }
      
      return itemToQuadro(response.Item as QuadroItem);
    } catch (error) {
      console.error(`Erro ao buscar quadro ${quadroId}:`, error);
      throw new Error(`Falha ao buscar quadro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async criarQuadro(tenantId: string, quadro: Omit<Quadro, 'id' | 'dataCriacao'>): Promise<Quadro> {
    try {
      const novoQuadro: Quadro = {
        ...quadro,
        id: uuidv4(),
        dataCriacao: new Date().toISOString()
      };
      
      console.log(`Criando novo quadro para o tenant ${tenantId}`);
      
      const item = quadroToItem(novoQuadro, tenantId);
      
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      });
      
      await dynamodb.send(command);
      console.log(`Quadro ${novoQuadro.id} criado com sucesso`);
      
      return novoQuadro;
    } catch (error) {
      console.error('Erro ao criar quadro:', error);
      throw new Error(`Falha ao criar quadro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async atualizarQuadro(tenantId: string, quadroId: string, dados: Partial<Omit<Quadro, 'id' | 'dataCriacao'>>): Promise<Quadro> {
    try {
      console.log(`Atualizando quadro ${quadroId} para o tenant ${tenantId}`);
      
      // Construir expressão de atualização dinamicamente
      let updateExpression = 'SET dataAtualizacao = :dataAtualizacao';
      const expressionAttributeValues: Record<string, any> = {
        ':dataAtualizacao': new Date().toISOString()
      };
      
      // Adicionar cada campo para atualização
      Object.entries(dados).forEach(([chave, valor]) => {
        if (valor !== undefined) {
          updateExpression += `, ${chave} = :${chave}`;
          expressionAttributeValues[`:${chave}`] = valor;
        }
      });
      
      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `QUADRO#${quadroId}`
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      });
      
      const response = await dynamodb.send(command);
      console.log(`Quadro ${quadroId} atualizado com sucesso`);
      
      return itemToQuadro(response.Attributes as QuadroItem);
    } catch (error) {
      console.error(`Erro ao atualizar quadro ${quadroId}:`, error);
      throw new Error(`Falha ao atualizar quadro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async excluirQuadro(tenantId: string, quadroId: string): Promise<void> {
    try {
      console.log(`Excluindo quadro ${quadroId} para o tenant ${tenantId}`);
      
      const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `QUADRO#${quadroId}`
        }
      });
      
      await dynamodb.send(command);
      console.log(`Quadro ${quadroId} excluído com sucesso`);
    } catch (error) {
      console.error(`Erro ao excluir quadro ${quadroId}:`, error);
      throw new Error(`Falha ao excluir quadro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
};
