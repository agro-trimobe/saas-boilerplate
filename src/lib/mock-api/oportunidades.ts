import { Oportunidade, gerarIdAleatorio } from '../crm-utils'

// Dados mockados para oportunidades
const oportunidadesMock: Oportunidade[] = [
  {
    id: '1',
    clienteId: '1',
    titulo: 'Financiamento de Implementos Agrícolas',
    descricao: 'Cliente demonstrou interesse em financiar implementos para o trator que está adquirindo. Potencial para grade aradora e pulverizador.',
    valor: 45000,
    status: 'Contato Inicial',
    proximoContato: '2024-03-10T10:00:00Z',
    dataCriacao: '2024-02-10T16:30:00Z',
    dataAtualizacao: '2024-02-10T16:30:00Z'
  },
  {
    id: '2',
    clienteId: '2',
    titulo: 'Expansão de Pomar',
    descricao: 'Cliente mencionou planos para expandir o pomar de laranja em mais 10ha. Oportunidade para novo projeto de financiamento.',
    valor: 120000,
    status: 'Contato Inicial',
    proximoContato: '2024-03-15T14:00:00Z',
    dataCriacao: '2024-02-25T17:45:00Z',
    dataAtualizacao: '2024-02-25T17:45:00Z'
  },
  {
    id: '3',
    clienteId: '3',
    titulo: 'Sistema de Energia Solar',
    descricao: 'Cliente busca reduzir custos com energia elétrica para o sistema de irrigação. Oportunidade para projeto de energia solar.',
    valor: 850000,
    status: 'Proposta Enviada',
    proximoContato: '2024-03-05T11:00:00Z',
    dataCriacao: '2024-02-20T17:30:00Z',
    dataAtualizacao: '2024-02-28T09:15:00Z'
  },
  {
    id: '4',
    clienteId: '3',
    titulo: 'Aquisição de Colheitadeira',
    descricao: 'Cliente planeja adquirir uma nova colheitadeira para a próxima safra. Oportunidade para financiamento via Finame.',
    valor: 1200000,
    status: 'Negociação',
    proximoContato: '2024-03-08T14:30:00Z',
    dataCriacao: '2024-01-25T10:00:00Z',
    dataAtualizacao: '2024-02-20T15:45:00Z'
  },
  {
    id: '5',
    clienteId: '4',
    titulo: 'Reforma de Pastagem',
    descricao: 'Cliente necessita reformar área de pastagem para melhorar produtividade leiteira. Oportunidade para projeto de financiamento.',
    valor: 35000,
    status: 'Contato Inicial',
    proximoContato: '2024-03-10T09:00:00Z',
    dataCriacao: '2024-03-01T18:15:00Z',
    dataAtualizacao: '2024-03-01T18:15:00Z'
  },
  {
    id: '6',
    clienteId: '5',
    titulo: 'Sistema de Agricultura de Precisão',
    descricao: 'Cliente interessado em implementar sistema de agricultura de precisão em toda a propriedade. Oportunidade para projeto via Inovagro.',
    valor: 750000,
    status: 'Proposta Enviada',
    proximoContato: '2024-03-12T10:00:00Z',
    dataCriacao: '2024-02-15T16:30:00Z',
    dataAtualizacao: '2024-02-28T11:45:00Z'
  },
  {
    id: '7',
    clienteId: '1',
    titulo: 'Construção de Curral',
    descricao: 'Cliente mencionou interesse em iniciar criação de gado de corte e necessita construir curral.',
    valor: 80000,
    status: 'Contato Inicial',
    proximoContato: '2024-03-20T14:00:00Z',
    dataCriacao: '2024-02-10T16:45:00Z',
    dataAtualizacao: '2024-02-10T16:45:00Z'
  },
  {
    id: '8',
    clienteId: '5',
    titulo: 'Aquisição de Caminhões',
    descricao: 'Cliente necessita renovar frota de caminhões para transporte da produção. Oportunidade para financiamento de 3 veículos.',
    valor: 900000,
    status: 'Ganho',
    dataCriacao: '2023-10-15T09:30:00Z',
    dataAtualizacao: '2023-12-20T14:00:00Z'
  },
  {
    id: '9',
    clienteId: '3',
    titulo: 'Implantação de Sistema ERP',
    descricao: 'Cliente busca melhorar gestão da fazenda com implantação de sistema ERP especializado.',
    valor: 150000,
    status: 'Perdido',
    dataCriacao: '2023-09-10T11:00:00Z',
    dataAtualizacao: '2023-11-05T16:30:00Z'
  }
]

// API mockada para oportunidades
export const oportunidadesApi = {
  // Listar todas as oportunidades
  listarOportunidades: async (): Promise<Oportunidade[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...oportunidadesMock])
      }, 500)
    })
  },

  // Buscar oportunidade por ID
  buscarOportunidadePorId: async (id: string): Promise<Oportunidade | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const oportunidade = oportunidadesMock.find(o => o.id === id) || null
        resolve(oportunidade ? { ...oportunidade } : null)
      }, 300)
    })
  },

  // Listar oportunidades por cliente
  listarOportunidadesPorCliente: async (clienteId: string): Promise<Oportunidade[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const oportunidades = oportunidadesMock.filter(o => o.clienteId === clienteId)
        resolve([...oportunidades])
      }, 400)
    })
  },

  // Listar oportunidades por status
  listarOportunidadesPorStatus: async (status: string): Promise<Oportunidade[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const oportunidades = oportunidadesMock.filter(o => o.status === status)
        resolve([...oportunidades])
      }, 400)
    })
  },

  // Criar nova oportunidade
  criarOportunidade: async (oportunidade: Omit<Oportunidade, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Oportunidade> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const novaOportunidade: Oportunidade = {
          ...oportunidade,
          id: gerarIdAleatorio(),
          dataCriacao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString()
        }
        
        oportunidadesMock.push(novaOportunidade)
        resolve({ ...novaOportunidade })
      }, 700)
    })
  },

  // Atualizar oportunidade
  atualizarOportunidade: async (id: string, dadosAtualizados: Partial<Omit<Oportunidade, 'id' | 'dataCriacao' | 'dataAtualizacao'>>): Promise<Oportunidade | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = oportunidadesMock.findIndex(o => o.id === id)
        if (index === -1) {
          resolve(null)
          return
        }
        
        const oportunidadeAtualizada: Oportunidade = {
          ...oportunidadesMock[index],
          ...dadosAtualizados,
          dataAtualizacao: new Date().toISOString()
        }
        
        oportunidadesMock[index] = oportunidadeAtualizada
        resolve({ ...oportunidadeAtualizada })
      }, 600)
    })
  },

  // Excluir oportunidade
  excluirOportunidade: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = oportunidadesMock.findIndex(o => o.id === id)
        if (index === -1) {
          resolve(false)
          return
        }
        
        oportunidadesMock.splice(index, 1)
        resolve(true)
      }, 400)
    })
  },

  // Atualizar status da oportunidade
  atualizarStatusOportunidade: async (id: string, status: 'Contato Inicial' | 'Proposta Enviada' | 'Negociação' | 'Ganho' | 'Perdido'): Promise<Oportunidade | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = oportunidadesMock.findIndex(o => o.id === id)
        if (index === -1) {
          resolve(null)
          return
        }
        
        const oportunidadeAtualizada: Oportunidade = {
          ...oportunidadesMock[index],
          status,
          dataAtualizacao: new Date().toISOString()
        }
        
        // Se o status for Ganho ou Perdido, remover próximo contato
        if (status === 'Ganho' || status === 'Perdido') {
          delete oportunidadeAtualizada.proximoContato
        }
        
        oportunidadesMock[index] = oportunidadeAtualizada
        resolve({ ...oportunidadeAtualizada })
      }, 400)
    })
  },

  // Obter estatísticas de oportunidades
  obterEstatisticas: async (): Promise<{
    total: number,
    valorTotal: number,
    porStatus: { [key: string]: { quantidade: number, valor: number } }
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const statusPossiveis = ['Contato Inicial', 'Proposta Enviada', 'Negociação', 'Ganho', 'Perdido']
        
        const porStatus: { [key: string]: { quantidade: number, valor: number } } = {}
        let valorTotal = 0
        
        statusPossiveis.forEach(status => {
          const oportunidades = oportunidadesMock.filter(o => o.status === status)
          const valor = oportunidades.reduce((sum, o) => sum + o.valor, 0)
          
          porStatus[status] = {
            quantidade: oportunidades.length,
            valor
          }
          
          if (status !== 'Perdido') {
            valorTotal += valor
          }
        })
        
        resolve({
          total: oportunidadesMock.filter(o => o.status !== 'Perdido').length,
          valorTotal,
          porStatus
        })
      }, 600)
    })
  }
}
