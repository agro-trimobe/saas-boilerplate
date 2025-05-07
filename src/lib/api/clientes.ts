import { Cliente } from '@/lib/crm-utils';

/**
 * API de clientes para o lado do cliente
 * Usa as APIs REST para acessar os dados em vez de acessar o DynamoDB diretamente
 */
export const clientesApi = {
  listarClientes: async (): Promise<Cliente[]> => {
    try {
      const response = await fetch('/api/clientes');
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error('Erro ao listar clientes:', data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      return [];
    }
  },

  buscarClientePorId: async (id: string): Promise<Cliente | null> => {
    try {
      const response = await fetch(`/api/clientes/${id}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao obter cliente ${id}:`, data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao obter cliente ${id}:`, error);
      return null;
    }
  },

  criarCliente: async (cliente: Omit<Cliente, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Cliente> => {
    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cliente),
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  },

  atualizarCliente: async (id: string, cliente: Partial<Omit<Cliente, 'id' | 'dataCriacao'>>): Promise<Cliente | null> => {
    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cliente),
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao atualizar cliente ${id}:`, data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao atualizar cliente ${id}:`, error);
      return null;
    }
  },

  excluirCliente: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao excluir cliente ${id}:`, data.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir cliente ${id}:`, error);
      return false;
    }
  }
};
