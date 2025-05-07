import { Documento } from '@/lib/crm-utils';

/**
 * API de documentos para o lado do cliente
 * Usa as APIs REST para acessar os dados em vez de acessar o DynamoDB diretamente
 */
export const documentosApi = {
  listarDocumentos: async (): Promise<Documento[]> => {
    try {
      const response = await fetch('/api/documentos');
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error('Erro ao listar documentos:', data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error('Erro ao listar documentos:', error);
      return [];
    }
  },

  buscarDocumentoPorId: async (id: string): Promise<Documento | null> => {
    try {
      const response = await fetch(`/api/documentos/${id}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao buscar documento ${id}:`, data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao buscar documento ${id}:`, error);
      return null;
    }
  },

  listarDocumentosPorCliente: async (clienteId: string): Promise<Documento[]> => {
    try {
      const response = await fetch(`/api/documentos/cliente/${clienteId}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao listar documentos do cliente ${clienteId}:`, data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao listar documentos do cliente ${clienteId}:`, error);
      return [];
    }
  },

  listarDocumentosPorTipo: async (tipo: string): Promise<Documento[]> => {
    try {
      const response = await fetch(`/api/documentos/tipo/${tipo}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao listar documentos do tipo ${tipo}:`, data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao listar documentos do tipo ${tipo}:`, error);
      return [];
    }
  },

  listarDocumentosPorProjeto: async (projetoId: string): Promise<Documento[]> => {
    try {
      const response = await fetch(`/api/documentos/projeto/${projetoId}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao listar documentos do projeto ${projetoId}:`, data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao listar documentos do projeto ${projetoId}:`, error);
      return [];
    }
  },

  listarDocumentosPorVisita: async (visitaId: string): Promise<Documento[]> => {
    try {
      const response = await fetch(`/api/documentos/visita/${visitaId}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao listar documentos da visita ${visitaId}:`, data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao listar documentos da visita ${visitaId}:`, error);
      return [];
    }
  },

  criarDocumento: async (documento: Omit<Documento, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Documento> => {
    try {
      const response = await fetch('/api/documentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(documento)
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error('Erro ao criar documento:', data.message);
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      throw new Error(`Falha ao criar documento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  atualizarDocumento: async (id: string, documento: Partial<Omit<Documento, 'id' | 'dataCriacao'>>): Promise<Documento | null> => {
    try {
      const response = await fetch(`/api/documentos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(documento)
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao atualizar documento ${id}:`, data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao atualizar documento ${id}:`, error);
      return null;
    }
  },

  atualizarStatusDocumento: async (id: string, status: string): Promise<Documento | null> => {
    try {
      const response = await fetch(`/api/documentos/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao atualizar status do documento ${id}:`, data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao atualizar status do documento ${id}:`, error);
      return null;
    }
  },

  excluirDocumento: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/documentos/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao excluir documento ${id}:`, data.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir documento ${id}:`, error);
      return false;
    }
  }
};
