import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from '../aws-config';
import { Lista } from '../crm-utils';
import { ListaItem, listaToItem, itemToLista } from '../types/dynamodb-types';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'RuralCredit';

export const listaRepository = {
  async listarListas(tenantId: string): Promise<Lista[]> {
    try {
      console.log(`Listando todas as listas para o tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `TENANT#${tenantId}`,
          ':sk': 'LISTA#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} listas`);
      
      return (response.Items || []).map(item => itemToLista(item as ListaItem));
    } catch (error) {
      console.error('Erro ao listar listas:', error);
      throw new Error(`Falha ao listar listas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async listarListasPorQuadro(tenantId: string, quadroId: string): Promise<Lista[]> {
    try {
      console.log(`Listando listas do quadro ${quadroId} para o tenant ${tenantId}`);
      
      // Usar o GSI1 para buscar listas por quadro (ordenadas por ordem)
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :gsi1sk)',
        ExpressionAttributeValues: {
          ':gsi1pk': `QUADRO#${quadroId}`,
          ':gsi1sk': 'LISTA#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} listas para o quadro ${quadroId}`);
      
      return (response.Items || []).map(item => itemToLista(item as ListaItem));
    } catch (error) {
      console.error(`Erro ao listar listas do quadro ${quadroId}:`, error);
      throw new Error(`Falha ao listar listas do quadro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async buscarListaPorId(tenantId: string, listaId: string): Promise<Lista | null> {
    try {
      console.log(`Buscando lista ${listaId} para o tenant ${tenantId}`);
      
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `LISTA#${listaId}`
        }
      });

      const response = await dynamodb.send(command);
      
      if (!response.Item) {
        console.log(`Lista ${listaId} não encontrada`);
        return null;
      }
      
      return itemToLista(response.Item as ListaItem);
    } catch (error) {
      console.error(`Erro ao buscar lista ${listaId}:`, error);
      throw new Error(`Falha ao buscar lista: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async criarLista(tenantId: string, lista: Omit<Lista, 'id' | 'dataCriacao'>): Promise<Lista> {
    try {
      const novaLista: Lista = {
        ...lista,
        id: uuidv4(),
        dataCriacao: new Date().toISOString()
      };
      
      console.log(`Criando nova lista para o quadro ${lista.quadroId} no tenant ${tenantId}`);
      
      const item = listaToItem(novaLista, tenantId);
      
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      });
      
      await dynamodb.send(command);
      console.log(`Lista ${novaLista.id} criada com sucesso`);
      
      return novaLista;
    } catch (error) {
      console.error('Erro ao criar lista:', error);
      throw new Error(`Falha ao criar lista: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async atualizarLista(tenantId: string, listaId: string, dados: Partial<Omit<Lista, 'id' | 'quadroId' | 'dataCriacao'>>): Promise<Lista> {
    try {
      console.log(`Atualizando lista ${listaId} para o tenant ${tenantId}`);
      
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
          SK: `LISTA#${listaId}`
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      });
      
      const response = await dynamodb.send(command);
      console.log(`Lista ${listaId} atualizada com sucesso`);
      
      return itemToLista(response.Attributes as ListaItem);
    } catch (error) {
      console.error(`Erro ao atualizar lista ${listaId}:`, error);
      throw new Error(`Falha ao atualizar lista: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async excluirLista(tenantId: string, listaId: string): Promise<void> {
    try {
      console.log(`Excluindo lista ${listaId} para o tenant ${tenantId}`);
      
      const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `LISTA#${listaId}`
        }
      });
      
      await dynamodb.send(command);
      console.log(`Lista ${listaId} excluída com sucesso`);
    } catch (error) {
      console.error(`Erro ao excluir lista ${listaId}:`, error);
      throw new Error(`Falha ao excluir lista: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
  
  async reordenarListas(tenantId: string, quadroId: string, ordens: {listaId: string, ordem: number}[]): Promise<void> {
    try {
      console.log(`Reordenando ${ordens.length} listas no quadro ${quadroId}`);
      
      // Realizar atualização em sequência para cada lista
      for (const {listaId, ordem} of ordens) {
        const command = new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: `LISTA#${listaId}`
          },
          UpdateExpression: 'SET ordem = :ordem, dataAtualizacao = :dataAtualizacao, GSI1SK = :gsi1sk',
          ExpressionAttributeValues: {
            ':ordem': ordem,
            ':dataAtualizacao': new Date().toISOString(),
            ':gsi1sk': `LISTA#${String(ordem).padStart(4, '0')}#${listaId}`
          }
        });
        
        await dynamodb.send(command);
      }
      
      console.log('Reordenação de listas concluída com sucesso');
    } catch (error) {
      console.error('Erro ao reordenar listas:', error);
      throw new Error(`Falha ao reordenar listas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
};
