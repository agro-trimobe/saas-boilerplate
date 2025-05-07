import { Oportunidade } from '@/lib/crm-utils';

/**
 * API de oportunidades para o lado do cliente
 * Usa as APIs REST para acessar os dados em vez de acessar o DynamoDB diretamente
 */
export const oportunidadesApi = {
  listarOportunidades: async (): Promise<Oportunidade[]> => {
    try {
      const response = await fetch('/api/oportunidades');
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error('Erro ao listar oportunidades:', data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error('Erro ao listar oportunidades:', error);
      return [];
    }
  },

  buscarOportunidadePorId: async (id: string): Promise<Oportunidade | null> => {
    try {
      const response = await fetch(`/api/oportunidades/${id}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao buscar oportunidade ${id}:`, data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao buscar oportunidade ${id}:`, error);
      return null;
    }
  },

  listarOportunidadesPorCliente: async (clienteId: string): Promise<Oportunidade[]> => {
    try {
      const response = await fetch(`/api/oportunidades/cliente/${clienteId}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao listar oportunidades do cliente ${clienteId}:`, data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao listar oportunidades do cliente ${clienteId}:`, error);
      return [];
    }
  },

  listarOportunidadesPorStatus: async (status: string): Promise<Oportunidade[]> => {
    try {
      const response = await fetch(`/api/oportunidades/status/${status}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao listar oportunidades com status ${status}:`, data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao listar oportunidades com status ${status}:`, error);
      return [];
    }
  },

  criarOportunidade: async (oportunidade: Omit<Oportunidade, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Oportunidade> => {
    try {
      const response = await fetch('/api/oportunidades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(oportunidade),
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      console.error('Erro ao criar oportunidade:', error);
      throw error;
    }
  },

  atualizarOportunidade: async (id: string, oportunidade: Partial<Omit<Oportunidade, 'id' | 'dataCriacao'>>): Promise<Oportunidade | null> => {
    try {
      const response = await fetch(`/api/oportunidades/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(oportunidade),
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao atualizar oportunidade ${id}:`, data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao atualizar oportunidade ${id}:`, error);
      return null;
    }
  },

  excluirOportunidade: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/oportunidades/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao excluir oportunidade ${id}:`, data.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir oportunidade ${id}:`, error);
      return false;
    }
  },

  obterEstatisticas: async () => {
    try {
      const response = await fetch('/api/oportunidades/estatisticas');
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error('Erro ao obter estatísticas de oportunidades:', data.message);
        return {
          total: 0,
          valorTotal: 0,
          porStatus: {}
        };
      }
      
      return data.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas de oportunidades:', error);
      return {
        total: 0,
        valorTotal: 0,
        porStatus: {}
      };
    }
  }
};
