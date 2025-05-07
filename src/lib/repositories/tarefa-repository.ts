import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from '../aws-config';
import { Tarefa } from '../crm-utils';
import { TarefaItem, tarefaToItem, itemToTarefa } from '../types/dynamodb-types';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'RuralCredit';

export const tarefaRepository = {
  async listarTarefas(tenantId: string): Promise<Tarefa[]> {
    try {
      console.log(`Listando todas as tarefas para o tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `TENANT#${tenantId}`,
          ':sk': 'TAREFA#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} tarefas`);
      
      return (response.Items || []).map(item => itemToTarefa(item as TarefaItem));
    } catch (error) {
      console.error('Erro ao listar tarefas:', error);
      throw new Error(`Falha ao listar tarefas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
  
  async listarTarefasPorLista(tenantId: string, listaId: string): Promise<Tarefa[]> {
    try {
      console.log(`Listando tarefas da lista ${listaId} para o tenant ${tenantId}`);
      
      // Usar o GSI1 para buscar tarefas por lista (ordenadas por ordem)
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :gsi1sk)',
        ExpressionAttributeValues: {
          ':gsi1pk': `LISTA#${listaId}`,
          ':gsi1sk': 'TAREFA#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} tarefas para a lista ${listaId}`);
      
      return (response.Items || []).map(item => itemToTarefa(item as TarefaItem));
    } catch (error) {
      console.error(`Erro ao listar tarefas da lista ${listaId}:`, error);
      throw new Error(`Falha ao listar tarefas da lista: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
  
  async listarTarefasPorQuadro(tenantId: string, quadroId: string): Promise<Tarefa[]> {
    try {
      console.log(`Listando tarefas do quadro ${quadroId} para o tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        FilterExpression: 'quadroId = :quadroId',
        ExpressionAttributeValues: {
          ':pk': `TENANT#${tenantId}`,
          ':sk': 'TAREFA#',
          ':quadroId': quadroId
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} tarefas para o quadro ${quadroId}`);
      
      return (response.Items || []).map(item => itemToTarefa(item as TarefaItem));
    } catch (error) {
      console.error(`Erro ao listar tarefas do quadro ${quadroId}:`, error);
      throw new Error(`Falha ao listar tarefas do quadro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
  
  async listarTarefasPorCliente(tenantId: string, clienteId: string): Promise<Tarefa[]> {
    try {
      console.log(`Listando tarefas do cliente ${clienteId} para o tenant ${tenantId}`);
      
      // Usar o GSI2 para buscar tarefas por cliente
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :gsi2pk AND begins_with(GSI2SK, :gsi2sk)',
        ExpressionAttributeValues: {
          ':gsi2pk': `CLIENTE#${clienteId}`,
          ':gsi2sk': 'TAREFA#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontradas ${response.Items?.length || 0} tarefas para o cliente ${clienteId}`);
      
      return (response.Items || []).map(item => itemToTarefa(item as TarefaItem));
    } catch (error) {
      console.error(`Erro ao listar tarefas do cliente ${clienteId}:`, error);
      throw new Error(`Falha ao listar tarefas do cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async buscarTarefaPorId(tenantId: string, tarefaId: string): Promise<Tarefa | null> {
    try {
      console.log(`Buscando tarefa ${tarefaId} para o tenant ${tenantId}`);
      
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `TAREFA#${tarefaId}`
        }
      });

      const response = await dynamodb.send(command);
      
      if (!response.Item) {
        console.log(`Tarefa ${tarefaId} não encontrada`);
        return null;
      }
      
      return itemToTarefa(response.Item as TarefaItem);
    } catch (error) {
      console.error(`Erro ao buscar tarefa ${tarefaId}:`, error);
      throw new Error(`Falha ao buscar tarefa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async criarTarefa(tenantId: string, tarefa: Omit<Tarefa, 'id' | 'dataCriacao'>): Promise<Tarefa> {
    try {
      const novaTarefa: Tarefa = {
        ...tarefa,
        id: uuidv4(),
        dataCriacao: new Date().toISOString()
      };
      
      console.log(`Criando nova tarefa na lista ${tarefa.listaId} para o tenant ${tenantId}`);
      
      const item = tarefaToItem(novaTarefa, tenantId);
      
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      });
      
      await dynamodb.send(command);
      console.log(`Tarefa ${novaTarefa.id} criada com sucesso`);
      
      return novaTarefa;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw new Error(`Falha ao criar tarefa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async atualizarTarefa(tenantId: string, tarefaId: string, dados: Partial<Omit<Tarefa, 'id' | 'dataCriacao'>>): Promise<Tarefa> {
    try {
      console.log(`Atualizando tarefa ${tarefaId} para o tenant ${tenantId}`);
      
      // Obter a tarefa atual para verificar se há mudança de lista
      const tarefaAtual = await this.buscarTarefaPorId(tenantId, tarefaId);
      if (!tarefaAtual) {
        throw new Error(`Tarefa ${tarefaId} não encontrada para atualização`);
      }
      
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
      
      // Se a lista mudou, atualizar o índice GSI1
      if (dados.listaId && dados.listaId !== tarefaAtual.listaId) {
        const ordem = dados.ordem !== undefined ? dados.ordem : tarefaAtual.ordem;
        updateExpression += ', GSI1PK = :gsi1pk, GSI1SK = :gsi1sk';
        expressionAttributeValues[':gsi1pk'] = `LISTA#${dados.listaId}`;
        expressionAttributeValues[':gsi1sk'] = `TAREFA#${String(ordem).padStart(4, '0')}#${tarefaId}`;
      } else if (dados.ordem !== undefined) {
        // Se apenas a ordem mudou, atualizar só o GSI1SK
        updateExpression += ', GSI1SK = :gsi1sk';
        expressionAttributeValues[':gsi1sk'] = `TAREFA#${String(dados.ordem).padStart(4, '0')}#${tarefaId}`;
      }
      
      // Se o cliente mudou, atualizar o índice GSI2
      if (dados.clienteId !== undefined) {
        if (dados.clienteId) {
          updateExpression += ', GSI2PK = :gsi2pk, GSI2SK = :gsi2sk';
          expressionAttributeValues[':gsi2pk'] = `CLIENTE#${dados.clienteId}`;
          expressionAttributeValues[':gsi2sk'] = `TAREFA#${tarefaId}`;
        } else if (tarefaAtual.clienteId) {
          // Remover o GSI2 se o clienteId foi removido
          updateExpression += ' REMOVE GSI2PK, GSI2SK';
        }
      }
      
      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `TAREFA#${tarefaId}`
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      });
      
      const response = await dynamodb.send(command);
      console.log(`Tarefa ${tarefaId} atualizada com sucesso`);
      
      return itemToTarefa(response.Attributes as TarefaItem);
    } catch (error) {
      console.error(`Erro ao atualizar tarefa ${tarefaId}:`, error);
      throw new Error(`Falha ao atualizar tarefa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async excluirTarefa(tenantId: string, tarefaId: string): Promise<void> {
    try {
      console.log(`Excluindo tarefa ${tarefaId} para o tenant ${tenantId}`);
      
      const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `TAREFA#${tarefaId}`
        }
      });
      
      await dynamodb.send(command);
      console.log(`Tarefa ${tarefaId} excluída com sucesso`);
    } catch (error) {
      console.error(`Erro ao excluir tarefa ${tarefaId}:`, error);
      throw new Error(`Falha ao excluir tarefa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
  
  async reordenarTarefas(tenantId: string, listaId: string, ordens: {tarefaId: string, ordem: number}[]): Promise<void> {
    try {
      console.log(`Reordenando ${ordens.length} tarefas na lista ${listaId}`);
      
      // Realizar atualização em sequência para cada tarefa
      for (const {tarefaId, ordem} of ordens) {
        const command = new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: `TAREFA#${tarefaId}`
          },
          UpdateExpression: 'SET ordem = :ordem, dataAtualizacao = :dataAtualizacao, GSI1SK = :gsi1sk',
          ExpressionAttributeValues: {
            ':ordem': ordem,
            ':dataAtualizacao': new Date().toISOString(),
            ':gsi1sk': `TAREFA#${String(ordem).padStart(4, '0')}#${tarefaId}`
          }
        });
        
        await dynamodb.send(command);
      }
      
      console.log('Reordenação de tarefas concluída com sucesso');
    } catch (error) {
      console.error('Erro ao reordenar tarefas:', error);
      throw new Error(`Falha ao reordenar tarefas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
  
  async moverTarefa(tenantId: string, tarefaId: string, novaListaId: string, novaOrdem: number): Promise<Tarefa> {
    try {
      console.log(`Movendo tarefa ${tarefaId} para a lista ${novaListaId} com ordem ${novaOrdem}`);
      
      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `TAREFA#${tarefaId}`
        },
        UpdateExpression: 'SET listaId = :listaId, ordem = :ordem, dataAtualizacao = :dataAtualizacao, GSI1PK = :gsi1pk, GSI1SK = :gsi1sk',
        ExpressionAttributeValues: {
          ':listaId': novaListaId,
          ':ordem': novaOrdem,
          ':dataAtualizacao': new Date().toISOString(),
          ':gsi1pk': `LISTA#${novaListaId}`,
          ':gsi1sk': `TAREFA#${String(novaOrdem).padStart(4, '0')}#${tarefaId}`
        },
        ReturnValues: 'ALL_NEW'
      });
      
      const response = await dynamodb.send(command);
      console.log(`Tarefa ${tarefaId} movida com sucesso para a lista ${novaListaId}`);
      
      return itemToTarefa(response.Attributes as TarefaItem);
    } catch (error) {
      console.error(`Erro ao mover tarefa ${tarefaId}:`, error);
      throw new Error(`Falha ao mover tarefa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
};
