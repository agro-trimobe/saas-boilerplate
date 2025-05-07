import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from '../aws-config';
import { Cliente } from '../crm-utils';
import { ClienteItem, clienteToItem, itemToCliente } from '../types/dynamodb-types';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'RuralCredit';

export const clienteRepository = {
  async listarClientes(tenantId: string): Promise<Cliente[]> {
    try {
      console.log(`Listando clientes para o tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `TENANT#${tenantId}`,
          ':sk': 'CLIENTE#'
        }
      });

      const response = await dynamodb.send(command);
      console.log(`Encontrados ${response.Items?.length || 0} clientes`);
      
      return (response.Items || []).map(item => itemToCliente(item as ClienteItem));
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      throw new Error(`Falha ao listar clientes: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async buscarClientePorId(tenantId: string, clienteId: string): Promise<Cliente | null> {
    try {
      console.log(`Buscando cliente ${clienteId} para o tenant ${tenantId}`);
      
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `CLIENTE#${clienteId}`
        }
      });

      const response = await dynamodb.send(command);
      
      if (!response.Item) {
        console.log(`Cliente ${clienteId} não encontrado`);
        return null;
      }
      
      console.log(`Cliente ${clienteId} encontrado`);
      return itemToCliente(response.Item as ClienteItem);
    } catch (error) {
      console.error(`Erro ao buscar cliente ${clienteId}:`, error);
      throw new Error(`Falha ao buscar cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async buscarClientePorCpfCnpj(tenantId: string, cpfCnpj: string): Promise<Cliente | null> {
    try {
      console.log(`Buscando cliente por CPF/CNPJ ${cpfCnpj} para o tenant ${tenantId}`);
      
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :gsi2pk',
        ExpressionAttributeValues: {
          ':gsi2pk': `TENANT#${tenantId}#CPFCNPJ#${cpfCnpj}`
        }
      });

      const response = await dynamodb.send(command);
      
      if (!response.Items || response.Items.length === 0) {
        console.log(`Cliente com CPF/CNPJ ${cpfCnpj} não encontrado`);
        return null;
      }
      
      console.log(`Cliente com CPF/CNPJ ${cpfCnpj} encontrado`);
      return itemToCliente(response.Items[0] as ClienteItem);
    } catch (error) {
      console.error(`Erro ao buscar cliente por CPF/CNPJ ${cpfCnpj}:`, error);
      throw new Error(`Falha ao buscar cliente por CPF/CNPJ: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async criarCliente(tenantId: string, cliente: Omit<Cliente, 'id' | 'dataCadastro' | 'dataAtualizacao'>): Promise<Cliente> {
    try {
      console.log(`Criando novo cliente para o tenant ${tenantId}`);
      
      const timestamp = new Date().toISOString();
      const clienteId = uuidv4();

      const novoCliente: Cliente = {
        id: clienteId,
        ...cliente,
        dataCadastro: timestamp,
        dataAtualizacao: timestamp
      };

      const clienteItem = clienteToItem(novoCliente, tenantId);
      
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: clienteItem
      });

      await dynamodb.send(command);
      console.log(`Cliente ${clienteId} criado com sucesso`);
      
      return novoCliente;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw new Error(`Falha ao criar cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async atualizarCliente(tenantId: string, clienteId: string, dadosAtualizados: Partial<Omit<Cliente, 'id' | 'dataCadastro'>>): Promise<Cliente | null> {
    try {
      console.log(`Atualizando cliente ${clienteId} para o tenant ${tenantId}`);
      
      // Primeiro, buscar o cliente atual
      const clienteAtual = await this.buscarClientePorId(tenantId, clienteId);
      if (!clienteAtual) {
        console.log(`Cliente ${clienteId} não encontrado para atualização`);
        return null;
      }

      const timestamp = new Date().toISOString();
      const clienteAtualizado: Cliente = {
        ...clienteAtual,
        ...dadosAtualizados,
        dataAtualizacao: timestamp
      };

      const clienteItem = clienteToItem(clienteAtualizado, tenantId);
      
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: clienteItem
      });

      await dynamodb.send(command);
      console.log(`Cliente ${clienteId} atualizado com sucesso`);
      
      return clienteAtualizado;
    } catch (error) {
      console.error(`Erro ao atualizar cliente ${clienteId}:`, error);
      throw new Error(`Falha ao atualizar cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  async excluirCliente(tenantId: string, clienteId: string): Promise<boolean> {
    try {
      console.log(`Excluindo cliente ${clienteId} para o tenant ${tenantId}`);
      
      const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `CLIENTE#${clienteId}`
        }
      });

      await dynamodb.send(command);
      console.log(`Cliente ${clienteId} excluído com sucesso`);
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir cliente ${clienteId}:`, error);
      throw new Error(`Falha ao excluir cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
};
