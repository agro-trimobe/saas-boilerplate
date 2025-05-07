import { Simulacao } from '@/lib/crm-utils';

/**
 * API de simulações para o lado do cliente
 * Usa as APIs REST para acessar os dados em vez de acessar o DynamoDB diretamente
 */
export const simulacoesApi = {
  listarSimulacoes: async (): Promise<Simulacao[]> => {
    try {
      const response = await fetch('/api/simulacoes');
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error('Erro ao listar simulações:', data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error('Erro ao listar simulações:', error);
      return [];
    }
  },

  buscarSimulacaoPorId: async (id: string): Promise<Simulacao | null> => {
    try {
      const response = await fetch(`/api/simulacoes/${id}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao buscar simulação ${id}:`, data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao buscar simulação ${id}:`, error);
      return null;
    }
  },

  listarSimulacoesPorCliente: async (clienteId: string): Promise<Simulacao[]> => {
    try {
      const response = await fetch(`/api/simulacoes/cliente/${clienteId}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao listar simulações do cliente ${clienteId}:`, data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao listar simulações do cliente ${clienteId}:`, error);
      return [];
    }
  },

  listarSimulacoesPorProjeto: async (projetoId: string): Promise<Simulacao[]> => {
    try {
      const response = await fetch(`/api/simulacoes/projeto/${projetoId}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao listar simulações do projeto ${projetoId}:`, data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao listar simulações do projeto ${projetoId}:`, error);
      return [];
    }
  },

  listarSimulacoesPorLinha: async (linhaCredito: string): Promise<Simulacao[]> => {
    try {
      const response = await fetch(`/api/simulacoes/linha/${linhaCredito}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao listar simulações da linha de crédito ${linhaCredito}:`, data.message);
        return [];
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao listar simulações da linha de crédito ${linhaCredito}:`, error);
      return [];
    }
  },

  criarSimulacao: async (simulacao: Omit<Simulacao, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Simulacao> => {
    try {
      const response = await fetch('/api/simulacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(simulacao)
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error('Erro ao criar simulação:', data.message);
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      console.error('Erro ao criar simulação:', error);
      throw new Error(`Falha ao criar simulação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },

  atualizarSimulacao: async (id: string, simulacao: Partial<Omit<Simulacao, 'id' | 'dataCriacao'>>): Promise<Simulacao | null> => {
    try {
      const response = await fetch(`/api/simulacoes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(simulacao)
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao atualizar simulação ${id}:`, data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erro ao atualizar simulação ${id}:`, error);
      return null;
    }
  },

  excluirSimulacao: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/simulacoes/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error(`Erro ao excluir simulação ${id}:`, data.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir simulação ${id}:`, error);
      return false;
    }
  },

  calcularParcela: async (
    valorFinanciamento: number,
    taxaJuros: number,
    prazoTotal: number,
    carencia: number
  ): Promise<number> => {
    try {
      const response = await fetch('/api/simulacoes/calcular-parcela', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          valorFinanciamento,
          taxaJuros,
          prazoTotal,
          carencia
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error('Erro ao calcular parcela:', data.message);
        throw new Error(data.message);
      }
      
      return data.data.parcela;
    } catch (error) {
      console.error('Erro ao calcular parcela:', error);
      // Cálculo de fallback no cliente em caso de falha na API
      console.log('Usando cálculo de fallback para parcela');
      
      // Converter taxa anual para mensal
      const taxaMensal = Math.pow(1 + taxaJuros / 100, 1 / 12) - 1;
      
      // Número de parcelas após carência
      const numeroParcelas = prazoTotal - carencia;
      
      // Cálculo da parcela usando a fórmula de amortização
      const parcela = valorFinanciamento * 
        (taxaMensal * Math.pow(1 + taxaMensal, numeroParcelas)) / 
        (Math.pow(1 + taxaMensal, numeroParcelas) - 1);
      
      return Math.round(parcela * 100) / 100; // Arredonda para 2 casas decimais
    }
  }
};
