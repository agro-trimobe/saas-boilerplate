import { Simulacao, gerarIdAleatorio, gerarDataAleatoria, gerarValorAleatorio } from '../crm-utils'

// Dados mockados para simulações
const simulacoesMock: Simulacao[] = [
  {
    id: 'sim001',
    clienteId: 'cli001',
    linhaCredito: 'Pronaf Mais Alimentos',
    valorFinanciamento: 150000,
    taxaJuros: 4.5,
    prazoTotal: 84,
    carencia: 36,
    valorParcela: 2500,
    dataCriacao: new Date('2024-12-15').toISOString()
  },
  {
    id: 'sim002',
    clienteId: 'cli003',
    linhaCredito: 'Pronamp',
    valorFinanciamento: 450000,
    taxaJuros: 6.0,
    prazoTotal: 96,
    carencia: 24,
    valorParcela: 6200,
    dataCriacao: new Date('2025-01-10').toISOString()
  },
  {
    id: 'sim003',
    clienteId: 'cli005',
    linhaCredito: 'Inovagro',
    valorFinanciamento: 750000,
    taxaJuros: 7.5,
    prazoTotal: 120,
    carencia: 36,
    valorParcela: 9800,
    dataCriacao: new Date('2025-02-05').toISOString()
  },
  {
    id: 'sim004',
    clienteId: 'cli002',
    linhaCredito: 'Moderfrota',
    valorFinanciamento: 350000,
    taxaJuros: 8.0,
    prazoTotal: 60,
    carencia: 12,
    valorParcela: 7200,
    dataCriacao: new Date('2025-02-20').toISOString()
  },
  {
    id: 'sim005',
    clienteId: 'cli005',
    linhaCredito: 'ABC Ambiental',
    valorFinanciamento: 200000,
    taxaJuros: 5.5,
    prazoTotal: 96,
    carencia: 24,
    valorParcela: 2800,
    dataCriacao: new Date('2025-02-28').toISOString()
  }
]

// Linhas de crédito disponíveis
export const linhasCredito = [
  { id: 'pronaf', nome: 'Pronaf Mais Alimentos', taxaMin: 4.0, taxaMax: 4.5 },
  { id: 'pronamp', nome: 'Pronamp', taxaMin: 5.5, taxaMax: 6.0 },
  { id: 'inovagro', nome: 'Inovagro', taxaMin: 7.0, taxaMax: 7.5 },
  { id: 'moderfrota', nome: 'Moderfrota', taxaMin: 7.5, taxaMax: 8.5 },
  { id: 'abc', nome: 'ABC Ambiental', taxaMin: 5.0, taxaMax: 5.5 },
  { id: 'moderinfra', nome: 'Moderinfra', taxaMin: 6.0, taxaMax: 7.0 },
  { id: 'pca', nome: 'PCA - Armazenagem', taxaMin: 6.5, taxaMax: 7.0 }
]

// API simulada para simulações
export const simulacoesApi = {
  // Obter todas as simulações
  getAll: async (): Promise<Simulacao[]> => {
    return [...simulacoesMock]
  },

  // Obter simulação por ID
  getById: async (id: string): Promise<Simulacao | undefined> => {
    return simulacoesMock.find(simulacao => simulacao.id === id)
  },

  // Obter simulações por cliente
  getByCliente: async (clienteId: string): Promise<Simulacao[]> => {
    return simulacoesMock.filter(simulacao => simulacao.clienteId === clienteId)
  },

  // Criar nova simulação
  create: async (simulacao: Omit<Simulacao, 'id' | 'dataCriacao'>): Promise<Simulacao> => {
    const novaSimulacao: Simulacao = {
      id: gerarIdAleatorio(),
      ...simulacao,
      dataCriacao: new Date().toISOString()
    }
    simulacoesMock.push(novaSimulacao)
    return novaSimulacao
  },

  // Excluir simulação
  delete: async (id: string): Promise<boolean> => {
    const index = simulacoesMock.findIndex(simulacao => simulacao.id === id)
    if (index !== -1) {
      simulacoesMock.splice(index, 1)
      return true
    }
    return false
  },

  // Calcular parcela com base nos parâmetros
  calcularParcela: async (
    valorFinanciamento: number,
    taxaJuros: number,
    prazoTotal: number,
    carencia: number
  ): Promise<number> => {
    // Cálculo simplificado (SAC)
    const prazoAmortizacao = prazoTotal - carencia
    const amortizacao = valorFinanciamento / prazoAmortizacao
    const jurosInicial = (valorFinanciamento * (taxaJuros / 100)) / 12
    
    // Retorna o valor da primeira parcela após carência
    return Math.round(amortizacao + jurosInicial)
  },

  // Estatísticas para dashboard
  getEstatisticas: async () => {
    return {
      total: simulacoesMock.length,
      valorTotal: simulacoesMock.reduce((acc, sim) => acc + sim.valorFinanciamento, 0),
      mediaValor: simulacoesMock.reduce((acc, sim) => acc + sim.valorFinanciamento, 0) / simulacoesMock.length,
      porLinha: linhasCredito.map(linha => ({
        nome: linha.nome,
        quantidade: simulacoesMock.filter(sim => sim.linhaCredito === linha.nome).length,
        valorTotal: simulacoesMock
          .filter(sim => sim.linhaCredito === linha.nome)
          .reduce((acc, sim) => acc + sim.valorFinanciamento, 0)
      }))
    }
  }
}
