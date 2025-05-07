import { Propriedade } from '@/lib/crm-utils';

/**
 * API de propriedades para o lado do cliente
 * Usa as APIs REST para acessar os dados em vez de acessar o DynamoDB diretamente
 */
export const propriedadesApi = {
  listarPropriedades: async (): Promise<Propriedade[]> => {
    try {
      const response = await fetch('/api/propriedades');
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error('Erro ao listar propriedades:', data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error('Erro ao listar propriedades:', error);
      return [];
    }
  },

  buscarPropriedadePorId: async (id: string): Promise<Propriedade | null> => {
    try {
      const response = await fetch(`/api/propriedades/${id}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao buscar propriedade ${id}:`, data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao buscar propriedade ${id}:`, error);
      return null;
    }
  },

  listarPropriedadesPorCliente: async (clienteId: string): Promise<Propriedade[]> => {
    try {
      const response = await fetch(`/api/propriedades/cliente/${clienteId}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao listar propriedades do cliente ${clienteId}:`, data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao listar propriedades do cliente ${clienteId}:`, error);
      return [];
    }
  },

  criarPropriedade: async (propriedade: Omit<Propriedade, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Propriedade> => {
    try {
      const response = await fetch('/api/propriedades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(propriedade)
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error('Erro ao criar propriedade:', data.message);
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      console.error('Erro ao criar propriedade:', error);
      throw new Error(`Falha ao criar propriedade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  atualizarPropriedade: async (id: string, propriedade: Partial<Omit<Propriedade, 'id' | 'dataCriacao'>>): Promise<Propriedade | null> => {
    try {
      const response = await fetch(`/api/propriedades/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(propriedade)
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao atualizar propriedade ${id}:`, data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao atualizar propriedade ${id}:`, error);
      return null;
    }
  },

  excluirPropriedade: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/propriedades/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao excluir propriedade ${id}:`, data.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir propriedade ${id}:`, error);
      return false;
    }
  }
};
