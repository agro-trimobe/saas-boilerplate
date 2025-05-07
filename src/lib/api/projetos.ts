import { Projeto } from '@/lib/crm-utils';

/**
 * API de projetos para o lado do cliente
 * Usa as APIs REST para acessar os dados em vez de acessar o DynamoDB diretamente
 */
export const projetosApi = {
  listarProjetos: async (): Promise<Projeto[]> => {
    try {
      const response = await fetch('/api/projetos');
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error('Erro ao listar projetos:', data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error('Erro ao listar projetos:', error);
      return [];
    }
  },

  buscarProjetoPorId: async (id: string): Promise<Projeto | null> => {
    try {
      const response = await fetch(`/api/projetos/${id}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao buscar projeto ${id}:`, data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao buscar projeto ${id}:`, error);
      return null;
    }
  },

  listarProjetosPorCliente: async (clienteId: string): Promise<Projeto[]> => {
    try {
      const response = await fetch(`/api/projetos/cliente/${clienteId}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao listar projetos do cliente ${clienteId}:`, data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao listar projetos do cliente ${clienteId}:`, error);
      return [];
    }
  },

  listarProjetosPorPropriedade: async (propriedadeId: string): Promise<Projeto[]> => {
    try {
      const response = await fetch(`/api/projetos/propriedade/${propriedadeId}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao listar projetos da propriedade ${propriedadeId}:`, data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao listar projetos da propriedade ${propriedadeId}:`, error);
      return [];
    }
  },

  criarProjeto: async (projeto: Omit<Projeto, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Projeto> => {
    try {
      const response = await fetch('/api/projetos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projeto),
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      throw error;
    }
  },

  atualizarProjeto: async (id: string, projeto: Partial<Omit<Projeto, 'id' | 'dataCriacao'>>): Promise<Projeto | null> => {
    try {
      const response = await fetch(`/api/projetos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projeto),
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao atualizar projeto ${id}:`, data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao atualizar projeto ${id}:`, error);
      return null;
    }
  },

  excluirProjeto: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/projetos/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao excluir projeto ${id}:`, data.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir projeto ${id}:`, error);
      return false;
    }
  }
};
