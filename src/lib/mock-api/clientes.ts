import { Cliente, Propriedade, Interacao, gerarIdAleatorio, gerarDataAleatoria, gerarValorAleatorio } from '../crm-utils'

// Dados mockados para clientes
const clientesMock: Cliente[] = [
  {
    id: '1',
    nome: 'João Silva',
    cpfCnpj: '123.456.789-00',
    email: 'joao.silva@email.com',
    telefone: '(11) 98765-4321',
    tipo: 'PF',
    perfil: 'pequeno',
    dataNascimento: '1985-06-12',
    endereco: 'Rua das Flores, 123',
    cidade: 'Ribeirão Preto',
    estado: 'SP',
    cep: '14010-000',
    dataCadastro: '2024-01-15T10:30:00Z',
    dataAtualizacao: '2024-01-15T10:30:00Z',
    propriedades: [],
    projetos: [],
    interacoes: []
  },
  {
    id: '2',
    nome: 'Maria Oliveira',
    cpfCnpj: '987.654.321-00',
    email: 'maria.oliveira@email.com',
    telefone: '(16) 98765-1234',
    tipo: 'PF',
    perfil: 'medio',
    dataNascimento: '1978-03-25',
    endereco: 'Avenida Brasil, 456',
    cidade: 'São Carlos',
    estado: 'SP',
    cep: '13560-000',
    dataCadastro: '2024-02-10T14:20:00Z',
    dataAtualizacao: '2024-02-10T14:20:00Z',
    propriedades: [],
    projetos: [],
    interacoes: []
  },
  {
    id: '3',
    nome: 'Fazenda São Francisco Ltda',
    cpfCnpj: '12.345.678/0001-90',
    email: 'contato@fazendafrancisco.com.br',
    telefone: '(17) 3322-5544',
    tipo: 'PJ',
    perfil: 'grande',
    endereco: 'Rodovia SP-333, Km 122',
    cidade: 'Jaboticabal',
    estado: 'SP',
    cep: '14870-000',
    dataCadastro: '2023-11-05T09:15:00Z',
    dataAtualizacao: '2024-01-20T11:30:00Z',
    propriedades: [],
    projetos: [],
    interacoes: []
  },
  {
    id: '4',
    nome: 'Carlos Mendes',
    cpfCnpj: '456.789.123-00',
    email: 'carlos.mendes@email.com',
    telefone: '(14) 99876-5432',
    tipo: 'PF',
    perfil: 'pequeno',
    dataNascimento: '1990-11-08',
    endereco: 'Rua dos Ipês, 789',
    cidade: 'Bauru',
    estado: 'SP',
    cep: '17020-000',
    dataCadastro: '2024-03-01T16:45:00Z',
    dataAtualizacao: '2024-03-01T16:45:00Z',
    propriedades: [],
    projetos: [],
    interacoes: []
  },
  {
    id: '5',
    nome: 'Agropecuária Bom Futuro S.A.',
    cpfCnpj: '98.765.432/0001-10',
    email: 'financeiro@bomfuturo.com.br',
    telefone: '(18) 3223-4455',
    tipo: 'PJ',
    perfil: 'grande',
    endereco: 'Rodovia BR-153, Km 45',
    cidade: 'Marília',
    estado: 'SP',
    cep: '17500-000',
    dataCadastro: '2023-08-20T10:00:00Z',
    dataAtualizacao: '2024-02-15T14:30:00Z',
    propriedades: [],
    projetos: [],
    interacoes: []
  }
]

// Dados mockados para propriedades
const propriedadesMock: Propriedade[] = [
  {
    id: '1',
    nome: 'Sítio Boa Esperança',
    clienteId: '1',
    endereco: 'Estrada Municipal, Km 5, Zona Rural',
    area: 12.5,
    municipio: 'Ribeirão Preto',
    estado: 'SP',
    coordenadas: {
      latitude: -21.1767,
      longitude: -47.8208
    },
    dataCriacao: '2024-01-15T11:00:00Z',
    dataAtualizacao: '2024-01-15T11:00:00Z'
  },
  {
    id: '2',
    nome: 'Fazenda Santa Luzia',
    clienteId: '2',
    endereco: 'Rodovia SP-215, Km 150, Zona Rural',
    area: 85,
    municipio: 'São Carlos',
    estado: 'SP',
    coordenadas: {
      latitude: -22.0087,
      longitude: -47.8909
    },
    dataCriacao: '2024-02-10T15:00:00Z',
    dataAtualizacao: '2024-02-10T15:00:00Z'
  },
  {
    id: '3',
    nome: 'Fazenda São Francisco - Sede',
    clienteId: '3',
    endereco: 'Rodovia SP-333, Km 122, Zona Rural',
    area: 1200,
    municipio: 'Jaboticabal',
    estado: 'SP',
    coordenadas: {
      latitude: -21.2551,
      longitude: -48.3225
    },
    dataCriacao: '2023-11-05T10:00:00Z',
    dataAtualizacao: '2023-11-05T10:00:00Z'
  },
  {
    id: '4',
    nome: 'Fazenda São Francisco - Filial',
    clienteId: '3',
    endereco: 'Rodovia SP-333, Km 135, Zona Rural',
    area: 850,
    municipio: 'Jaboticabal',
    estado: 'SP',
    coordenadas: {
      latitude: -21.3012,
      longitude: -48.4001
    },
    dataCriacao: '2023-11-05T10:30:00Z',
    dataAtualizacao: '2023-11-05T10:30:00Z'
  },
  {
    id: '5',
    nome: 'Chácara Recanto',
    clienteId: '4',
    endereco: 'Estrada Vicinal, Km 3, Zona Rural',
    area: 5.2,
    municipio: 'Bauru',
    estado: 'SP',
    coordenadas: {
      latitude: -22.3156,
      longitude: -49.0522
    },
    dataCriacao: '2024-03-02T09:15:00Z',
    dataAtualizacao: '2024-03-02T09:15:00Z'
  },
  {
    id: '6',
    nome: 'Fazenda Bom Futuro - Unidade 1',
    clienteId: '5',
    endereco: 'Rodovia BR-153, Km 45, Zona Rural',
    area: 3500,
    municipio: 'Marília',
    estado: 'SP',
    coordenadas: {
      latitude: -22.2014,
      longitude: -49.9154
    },
    dataCriacao: '2023-08-20T11:00:00Z',
    dataAtualizacao: '2023-08-20T11:00:00Z'
  },
  {
    id: '7',
    nome: 'Fazenda Bom Futuro - Unidade 2',
    clienteId: '5',
    endereco: 'Rodovia SP-294, Km 480, Zona Rural',
    area: 2800,
    municipio: 'Tupã',
    estado: 'SP',
    coordenadas: {
      latitude: -21.9335,
      longitude: -50.5135
    },
    dataCriacao: '2023-08-20T11:30:00Z',
    dataAtualizacao: '2023-08-20T11:30:00Z'
  }
]

// Dados mockados para interações
const interacoesMock: Interacao[] = [
  {
    id: '1',
    clienteId: '1',
    tipo: 'Ligação',
    data: '2024-01-20T09:30:00Z',
    assunto: 'Apresentação de linhas de crédito',
    descricao: 'Primeiro contato com o cliente para apresentação das linhas de crédito disponíveis.',
    responsavel: 'Carlos Eduardo',
    dataCriacao: '2024-01-20T09:30:00Z',
    dataAtualizacao: '2024-01-20T09:30:00Z'
  },
  {
    id: '2',
    clienteId: '1',
    tipo: 'Email',
    data: '2024-02-02T14:15:00Z',
    assunto: 'Material informativo Pronaf',
    descricao: 'Enviado material informativo sobre o Pronaf.',
    responsavel: 'Ana Paula',
    dataCriacao: '2024-02-02T14:15:00Z',
    dataAtualizacao: '2024-02-02T14:15:00Z'
  },
  {
    id: '3',
    clienteId: '2',
    tipo: 'Reunião',
    data: '2024-02-15T10:00:00Z',
    assunto: 'Financiamento para aquisição de trator',
    descricao: 'Reunião presencial para discutir projeto de financiamento para aquisição de trator.',
    responsavel: 'Carlos Eduardo',
    dataCriacao: '2024-02-15T10:00:00Z',
    dataAtualizacao: '2024-02-15T10:00:00Z'
  },
  {
    id: '4',
    clienteId: '3',
    tipo: 'Outro',
    data: '2024-01-25T16:40:00Z',
    assunto: 'Solicitação de visita técnica',
    descricao: 'Cliente solicitou agendamento de visita técnica para avaliação de projeto de irrigação.',
    responsavel: 'Marcelo Santos',
    dataCriacao: '2024-01-25T16:40:00Z',
    dataAtualizacao: '2024-01-25T16:40:00Z'
  },
  {
    id: '5',
    clienteId: '3',
    tipo: 'Reunião',
    data: '2024-02-10T14:00:00Z',
    assunto: 'Apresentação de proposta',
    descricao: 'Apresentação de proposta para financiamento de sistema de irrigação.',
    responsavel: 'Marcelo Santos',
    dataCriacao: '2024-02-10T14:00:00Z',
    dataAtualizacao: '2024-02-10T14:00:00Z'
  },
  {
    id: '6',
    clienteId: '4',
    tipo: 'Ligação',
    data: '2024-03-01T15:30:00Z',
    assunto: 'Primeiro contato',
    descricao: 'Primeiro contato com o cliente, que busca informações sobre crédito para pequenos produtores.',
    responsavel: 'Ana Paula',
    dataCriacao: '2024-03-01T15:30:00Z',
    dataAtualizacao: '2024-03-01T15:30:00Z'
  },
  {
    id: '7',
    clienteId: '5',
    tipo: 'Email',
    data: '2024-02-20T11:20:00Z',
    assunto: 'Documentação complementar',
    descricao: 'Envio de documentação complementar para análise de projeto de expansão.',
    responsavel: 'Marcelo Santos',
    dataCriacao: '2024-02-20T11:20:00Z',
    dataAtualizacao: '2024-02-20T11:20:00Z'
  }
]

// Vincular propriedades e interações aos clientes
clientesMock.forEach(cliente => {
  cliente.propriedades = propriedadesMock.filter(prop => prop.clienteId === cliente.id)
  cliente.interacoes = interacoesMock.filter(inter => inter.clienteId === cliente.id)
})

// API mockada para clientes
export const clientesApi = {
  // Listar todos os clientes
  listarClientes: async (): Promise<Cliente[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...clientesMock])
      }, 500)
    })
  },

  // Buscar cliente por ID
  buscarClientePorId: async (id: string): Promise<Cliente | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cliente = clientesMock.find(c => c.id === id) || null
        resolve(cliente ? { ...cliente } : null)
      }, 300)
    })
  },

  // Criar novo cliente
  criarCliente: async (cliente: Omit<Cliente, 'id' | 'dataCadastro' | 'dataAtualizacao' | 'propriedades' | 'interacoes'>): Promise<Cliente> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const novoCliente: Cliente = {
          ...cliente,
          id: gerarIdAleatorio(),
          propriedades: [],
          interacoes: [],
          dataCadastro: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString()
        }
        clientesMock.push(novoCliente)
        resolve({ ...novoCliente })
      }, 700)
    })
  },

  // Atualizar cliente
  atualizarCliente: async (id: string, dadosAtualizados: Partial<Omit<Cliente, 'id' | 'dataCadastro' | 'dataAtualizacao'>>): Promise<Cliente | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = clientesMock.findIndex(c => c.id === id)
        if (index === -1) {
          resolve(null)
          return
        }
        
        const clienteAtualizado: Cliente = {
          ...clientesMock[index],
          ...dadosAtualizados,
          dataAtualizacao: new Date().toISOString()
        }
        
        clientesMock[index] = clienteAtualizado
        resolve({ ...clienteAtualizado })
      }, 600)
    })
  },

  // Excluir cliente
  excluirCliente: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = clientesMock.findIndex(c => c.id === id)
        if (index === -1) {
          resolve(false)
          return
        }
        
        clientesMock.splice(index, 1)
        resolve(true)
      }, 400)
    })
  },

  // Listar propriedades de um cliente
  listarPropriedades: async (clienteId: string): Promise<Propriedade[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const propriedades = propriedadesMock.filter(p => p.clienteId === clienteId)
        resolve([...propriedades])
      }, 300)
    })
  },

  // Adicionar propriedade
  adicionarPropriedade: async (propriedade: Omit<Propriedade, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Propriedade> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const novaPropriedade: Propriedade = {
          ...propriedade,
          id: gerarIdAleatorio(),
          dataCriacao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString()
        }
        
        propriedadesMock.push(novaPropriedade)
        
        // Atualizar a lista de propriedades do cliente
        const cliente = clientesMock.find(c => c.id === propriedade.clienteId)
        if (cliente) {
          if (!cliente.propriedades) {
            cliente.propriedades = [];
          }
          cliente.propriedades.push(novaPropriedade)
        }
        
        resolve({ ...novaPropriedade })
      }, 500)
    })
  },

  // Listar interações de um cliente
  listarInteracoes: async (clienteId: string): Promise<Interacao[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const interacoes = interacoesMock.filter(i => i.clienteId === clienteId)
        resolve([...interacoes])
      }, 300)
    })
  },

  // Adicionar interação
  adicionarInteracao: async (interacao: Omit<Interacao, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Interacao> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const novaInteracao: Interacao = {
          ...interacao,
          id: gerarIdAleatorio(),
          dataCriacao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString()
        }
        
        interacoesMock.push(novaInteracao)
        
        // Atualizar a lista de interações do cliente
        const cliente = clientesMock.find(c => c.id === interacao.clienteId)
        if (cliente && cliente.interacoes) {
          cliente.interacoes.push(novaInteracao)
        }
        
        resolve({ ...novaInteracao })
      }, 400)
    })
  },
  
  // Listar todas as interações (para uso interno)
  listarTodasInteracoes: async (): Promise<Interacao[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...interacoesMock])
      }, 300)
    })
  },
  
  // Excluir interação
  excluirInteracao: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = interacoesMock.findIndex(i => i.id === id)
        
        if (index === -1) {
          resolve(false)
          return
        }
        
        const interacao = interacoesMock[index]
        
        // Remover da lista principal
        interacoesMock.splice(index, 1)
        
        // Remover da lista do cliente
        const cliente = clientesMock.find(c => c.id === interacao.clienteId)
        if (cliente && cliente.interacoes) {
          const indexCliente = cliente.interacoes.findIndex(i => i.id === id)
          if (indexCliente !== -1) {
            cliente.interacoes.splice(indexCliente, 1)
          }
        }
        
        resolve(true)
      }, 400)
    })
  },
  
  // Atualizar interação
  atualizarInteracao: async (id: string, dadosAtualizados: Interacao): Promise<Interacao | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = interacoesMock.findIndex(i => i.id === id)
        
        if (index === -1) {
          resolve(null)
          return
        }
        
        // Atualizar na lista principal
        interacoesMock[index] = {
          ...dadosAtualizados,
          id, // Garantir que o ID não seja alterado
          dataCriacao: interacoesMock[index].dataCriacao // Manter a data de criação original
        }
        
        // Atualizar na lista do cliente
        const cliente = clientesMock.find(c => c.id === dadosAtualizados.clienteId)
        if (cliente && cliente.interacoes) {
          const indexCliente = cliente.interacoes.findIndex(i => i.id === id)
          if (indexCliente !== -1) {
            cliente.interacoes[indexCliente] = interacoesMock[index]
          }
        }
        
        resolve({ ...interacoesMock[index] })
      }, 400)
    })
  }
}
