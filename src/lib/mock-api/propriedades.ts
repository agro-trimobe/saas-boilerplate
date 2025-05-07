import { v4 as uuidv4 } from 'uuid'

// Interface para propriedades rurais
export interface Propriedade {
  id: string
  nome: string
  clienteId: string
  endereco: string
  area: number
  municipio: string
  estado: string
  coordenadas?: {
    latitude: number
    longitude: number
  }
  dataCriacao: string
  dataAtualizacao?: string
}

// Dados mockados de propriedades
const propriedadesMock: Propriedade[] = [
  {
    id: '1',
    nome: 'Fazenda São João',
    clienteId: '1',
    endereco: 'Estrada Rural, Km 15',
    area: 150,
    municipio: 'Ribeirão Preto',
    estado: 'SP',
    coordenadas: {
      latitude: -21.1767,
      longitude: -47.8208
    },
    dataCriacao: '2023-01-15T10:30:00Z'
  },
  {
    id: '2',
    nome: 'Sítio Boa Esperança',
    clienteId: '1',
    endereco: 'Rodovia SP-330, Km 253',
    area: 45,
    municipio: 'Ribeirão Preto',
    estado: 'SP',
    coordenadas: {
      latitude: -21.2056,
      longitude: -47.7869
    },
    dataCriacao: '2023-03-20T14:15:00Z'
  },
  {
    id: '3',
    nome: 'Fazenda Santa Luzia',
    clienteId: '2',
    endereco: 'Estrada Municipal, Km 7',
    area: 320,
    municipio: 'Sertãozinho',
    estado: 'SP',
    coordenadas: {
      latitude: -21.1378,
      longitude: -47.9875
    },
    dataCriacao: '2022-11-05T09:45:00Z'
  },
  {
    id: '4',
    nome: 'Rancho Alegre',
    clienteId: '3',
    endereco: 'Rodovia BR-050, Km 153',
    area: 75,
    municipio: 'Uberaba',
    estado: 'MG',
    coordenadas: {
      latitude: -19.7472,
      longitude: -47.9381
    },
    dataCriacao: '2023-05-12T11:20:00Z'
  },
  {
    id: '5',
    nome: 'Fazenda Três Irmãos',
    clienteId: '4',
    endereco: 'Estrada Vicinal, Km 12',
    area: 420,
    municipio: 'Barretos',
    estado: 'SP',
    coordenadas: {
      latitude: -20.5575,
      longitude: -48.5696
    },
    dataCriacao: '2022-09-30T16:40:00Z'
  },
  {
    id: '6',
    nome: 'Sítio Recanto Verde',
    clienteId: '5',
    endereco: 'Estrada da Serra, Km 5',
    area: 28,
    municipio: 'São Carlos',
    estado: 'SP',
    coordenadas: {
      latitude: -22.0087,
      longitude: -47.8909
    },
    dataCriacao: '2023-02-18T13:10:00Z'
  }
]

// API mockada para propriedades
export const propriedadesApi = {
  listarPropriedades: async (): Promise<Propriedade[]> => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500))
    return [...propriedadesMock]
  },

  buscarPropriedadePorId: async (id: string): Promise<Propriedade | null> => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 300))
    const propriedade = propriedadesMock.find(p => p.id === id)
    return propriedade || null
  },

  listarPropriedadesPorCliente: async (clienteId: string): Promise<Propriedade[]> => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 400))
    return propriedadesMock.filter(p => p.clienteId === clienteId)
  },

  criarPropriedade: async (propriedade: Omit<Propriedade, 'id' | 'dataCriacao'>): Promise<Propriedade> => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 700))
    
    const novaPropriedade: Propriedade = {
      id: uuidv4(),
      dataCriacao: new Date().toISOString(),
      ...propriedade
    }
    
    propriedadesMock.push(novaPropriedade)
    return novaPropriedade
  },

  atualizarPropriedade: async (id: string, dadosAtualizados: Partial<Propriedade>): Promise<Propriedade | null> => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const index = propriedadesMock.findIndex(p => p.id === id)
    if (index === -1) {
      return null
    }
    
    const propriedadeAtualizada: Propriedade = {
      ...propriedadesMock[index],
      ...dadosAtualizados,
      dataAtualizacao: new Date().toISOString()
    }
    
    propriedadesMock[index] = propriedadeAtualizada
    return propriedadeAtualizada
  },

  excluirPropriedade: async (id: string): Promise<boolean> => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const index = propriedadesMock.findIndex(p => p.id === id)
    if (index === -1) {
      return false
    }
    
    propriedadesMock.splice(index, 1)
    return true
  }
}
