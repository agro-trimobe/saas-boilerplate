import { Projeto, Documento, gerarIdAleatorio } from '../crm-utils'
import { v4 as uuidv4 } from 'uuid'

// Dados mockados para projetos
const projetosMock: Projeto[] = [
  {
    id: '1',
    titulo: 'Financiamento para Aquisição de Trator',
    descricao: 'Projeto para aquisição de trator agrícola para pequena propriedade através do Pronaf.',
    clienteId: '1',
    propriedadeId: '1',
    status: 'Em Análise',
    valorTotal: 120000,
    linhaCredito: 'Pronaf Mais Alimentos',
    documentos: [],
    dataCriacao: '2024-02-05T10:30:00Z',
    dataAtualizacao: '2024-02-20T14:15:00Z',
    dataPrevisaoTermino: '2024-04-10T00:00:00Z'
  },
  {
    id: '2',
    titulo: 'Sistema de Irrigação por Gotejamento',
    descricao: 'Implantação de sistema de irrigação por gotejamento em pomar de laranja.',
    clienteId: '2',
    propriedadeId: '2',
    status: 'Em Elaboração',
    valorTotal: 85000,
    linhaCredito: 'Pronamp',
    documentos: [],
    dataCriacao: '2024-02-18T09:45:00Z',
    dataAtualizacao: '2024-02-18T09:45:00Z',
    dataPrevisaoTermino: '2024-05-20T00:00:00Z'
  },
  {
    id: '3',
    titulo: 'Expansão de Sistema de Irrigação',
    descricao: 'Projeto para expansão do sistema de irrigação por pivô central em área de 500ha de milho.',
    clienteId: '3',
    propriedadeId: '3',
    status: 'Aprovado',
    valorTotal: 1200000,
    linhaCredito: 'Moderinfra',
    documentos: [],
    dataCriacao: '2024-01-10T11:20:00Z',
    dataAtualizacao: '2024-02-25T16:30:00Z',
    dataPrevisaoTermino: '2024-03-30T00:00:00Z'
  },
  {
    id: '4',
    titulo: 'Construção de Galpão para Armazenamento',
    descricao: 'Projeto para construção de galpão para armazenamento de grãos com capacidade para 2.000 toneladas.',
    clienteId: '3',
    propriedadeId: '4',
    status: 'Contratado',
    valorTotal: 750000,
    linhaCredito: 'PCA - Programa para Construção e Ampliação de Armazéns',
    documentos: [],
    dataCriacao: '2023-11-15T10:00:00Z',
    dataAtualizacao: '2024-01-20T14:45:00Z',
    dataPrevisaoTermino: '2024-06-30T00:00:00Z'
  },
  {
    id: '5',
    titulo: 'Financiamento para Aquisição de Matrizes',
    descricao: 'Projeto para aquisição de 10 matrizes bovinas para produção leiteira.',
    clienteId: '4',
    propriedadeId: '5',
    status: 'Em Elaboração',
    valorTotal: 60000,
    linhaCredito: 'Pronaf',
    documentos: [],
    dataCriacao: '2024-03-01T17:30:00Z',
    dataAtualizacao: '2024-03-01T17:30:00Z',
    dataPrevisaoTermino: '2024-05-15T00:00:00Z'
  },
  {
    id: '6',
    titulo: 'Expansão de Área de Plantio',
    descricao: 'Projeto para expansão de área de plantio de soja em 1.000ha, incluindo correção de solo e aquisição de maquinário.',
    clienteId: '5',
    propriedadeId: '6',
    status: 'Em Análise',
    valorTotal: 3500000,
    linhaCredito: 'Inovagro',
    documentos: [],
    dataCriacao: '2024-02-01T09:00:00Z',
    dataAtualizacao: '2024-02-28T11:20:00Z',
    dataPrevisaoTermino: '2024-07-30T00:00:00Z'
  }
]

// Dados mockados para documentos
const documentosMock: Documento[] = [
  {
    id: '1',
    nome: 'Projeto Técnico',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 2500000,
    status: 'Aprovado',
    url: '/documentos/projeto-tecnico-1.pdf',
    dataCriacao: '2024-02-05T11:00:00Z',
    dataAtualizacao: '2024-02-20T14:00:00Z',
    clienteId: '1',
  },
  {
    id: '2',
    nome: 'Matrícula do Imóvel',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 1800000,
    status: 'Aprovado',
    url: '/documentos/matricula-1.pdf',
    dataCriacao: '2024-02-05T11:15:00Z',
    dataAtualizacao: '2024-02-20T14:00:00Z',
    clienteId: '1',
  },
  {
    id: '3',
    nome: 'Orçamento do Trator',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 1200000,
    status: 'Aprovado',
    url: '/documentos/orcamento-trator-1.pdf',
    dataCriacao: '2024-02-05T11:30:00Z',
    dataAtualizacao: '2024-02-20T14:00:00Z',
    clienteId: '1',
  },
  {
    id: '4',
    nome: 'DAP - Declaração de Aptidão ao Pronaf',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 950000,
    status: 'Pendente',
    url: '/documentos/dap-1.pdf',
    dataCriacao: '2024-02-05T11:45:00Z',
    dataAtualizacao: '2024-02-05T11:45:00Z',
    clienteId: '1',
  },
  {
    id: '5',
    nome: 'Projeto Técnico',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 2200000,
    status: 'Enviado',
    url: '/documentos/projeto-tecnico-2.pdf',
    dataCriacao: '2024-02-18T10:00:00Z',
    dataAtualizacao: '2024-02-18T10:00:00Z',
    clienteId: '2',
  },
  {
    id: '6',
    nome: 'Orçamento do Sistema de Irrigação',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 1500000,
    status: 'Enviado',
    url: '/documentos/orcamento-irrigacao-2.pdf',
    dataCriacao: '2024-02-18T10:15:00Z',
    dataAtualizacao: '2024-02-18T10:15:00Z',
    clienteId: '2',
  },
  {
    id: '7',
    nome: 'Projeto Técnico',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 2000000,
    status: 'Aprovado',
    url: '/documentos/projeto-tecnico-3.pdf',
    dataCriacao: '2024-01-10T11:30:00Z',
    dataAtualizacao: '2024-02-25T16:00:00Z',
    clienteId: '3',
  },
  {
    id: '8',
    nome: 'Licença Ambiental',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 1000000,
    status: 'Aprovado',
    url: '/documentos/licenca-ambiental-3.pdf',
    dataCriacao: '2024-01-10T11:45:00Z',
    dataAtualizacao: '2024-02-25T16:00:00Z',
    clienteId: '3',
  },
  {
    id: '9',
    nome: 'Orçamento do Sistema de Irrigação',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 1800000,
    status: 'Aprovado',
    url: '/documentos/orcamento-irrigacao-3.pdf',
    dataCriacao: '2024-01-10T12:00:00Z',
    dataAtualizacao: '2024-02-25T16:00:00Z',
    clienteId: '3',
  },
  {
    id: '10',
    nome: 'Projeto Técnico',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 2500000,
    status: 'Aprovado',
    url: '/documentos/projeto-tecnico-4.pdf',
    dataCriacao: '2023-11-15T10:30:00Z',
    dataAtualizacao: '2024-01-20T14:30:00Z',
    clienteId: '3',
  },
  {
    id: '11',
    nome: 'Licença Ambiental',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 1200000,
    status: 'Aprovado',
    url: '/documentos/licenca-ambiental-4.pdf',
    dataCriacao: '2023-11-15T10:45:00Z',
    dataAtualizacao: '2024-01-20T14:30:00Z',
    clienteId: '3',
  },
  {
    id: '12',
    nome: 'Orçamento da Construção',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 2000000,
    status: 'Aprovado',
    url: '/documentos/orcamento-construcao-4.pdf',
    dataCriacao: '2023-11-15T11:00:00Z',
    dataAtualizacao: '2024-01-20T14:30:00Z',
    clienteId: '3',
  },
  {
    id: '13',
    nome: 'Projeto Técnico',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 2200000,
    status: 'Pendente',
    url: '/documentos/projeto-tecnico-5.pdf',
    dataCriacao: '2024-03-01T17:45:00Z',
    dataAtualizacao: '2024-03-01T17:45:00Z',
    clienteId: '4',
  },
  {
    id: '14',
    nome: 'Projeto Técnico',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 2000000,
    status: 'Enviado',
    url: '/documentos/projeto-tecnico-6.pdf',
    dataCriacao: '2024-02-01T09:30:00Z',
    dataAtualizacao: '2024-02-28T11:00:00Z',
    clienteId: '5',
  },
  {
    id: '15',
    nome: 'Estudo de Viabilidade Econômica',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 1500000,
    status: 'Enviado',
    url: '/documentos/viabilidade-6.pdf',
    dataCriacao: '2024-02-01T09:45:00Z',
    dataAtualizacao: '2024-02-28T11:00:00Z',
    clienteId: '5',
  },
  {
    id: '16',
    nome: 'Licença Ambiental',
    tipo: 'PDF',
    formato: 'application/pdf',
    tamanho: 1000000,
    status: 'Pendente',
    url: '/documentos/licenca-ambiental-5.pdf',
    dataCriacao: '2024-02-01T10:00:00Z',
    dataAtualizacao: '2024-02-01T10:00:00Z',
    clienteId: '5',
  }
]

// Relacionamento entre projetos e documentos
const documentosPorProjeto: Record<string, string[]> = {
  '1': ['1', '2', '3', '4'],
  '2': ['5', '6'],
  '3': ['7', '8', '9'],
  '4': ['10', '11', '12'],
  '5': ['13'],
  '6': ['14', '15', '16']
}

Object.entries(documentosPorProjeto).forEach(([projetoId, docsIds]) => {
  const projeto = projetosMock.find(p => p.id === projetoId)
  if (projeto) {
    projeto.documentos = docsIds
  }
})

// API mockada para projetos
export const projetosApi = {
  // Listar todos os projetos
  listarProjetos: async (): Promise<Projeto[]> => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500))
    return [...projetosMock]
  },

  // Buscar projeto por ID
  buscarProjetoPorId: async (id: string): Promise<Projeto | null> => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 300))
    const projeto = projetosMock.find(p => p.id === id)
    return projeto || null
  },

  // Criar novo projeto
  criarProjeto: async (projeto: Omit<Projeto, 'id' | 'dataCriacao' | 'dataAtualizacao' | 'documentos'>): Promise<Projeto> => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 700))
    
    const novoProjeto: Projeto = {
      ...projeto,
      id: uuidv4(),
      documentos: [],
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    }
    
    projetosMock.push(novoProjeto)
    return novoProjeto
  },

  // Atualizar projeto
  atualizarProjeto: async (id: string, dadosAtualizados: Partial<Omit<Projeto, 'id' | 'dataCriacao' | 'dataAtualizacao'>>): Promise<Projeto | null> => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const index = projetosMock.findIndex(p => p.id === id)
    if (index === -1) {
      return null
    }
    
    const projetoAtualizado: Projeto = {
      ...projetosMock[index],
      ...dadosAtualizados,
      dataAtualizacao: new Date().toISOString()
    }
    
    projetosMock[index] = projetoAtualizado
    return projetoAtualizado
  },

  // Excluir projeto
  excluirProjeto: async (id: string): Promise<boolean> => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const index = projetosMock.findIndex(p => p.id === id)
    if (index === -1) {
      return false
    }
    
    projetosMock.splice(index, 1)
    return true
  },

  // Listar projetos por cliente
  listarProjetosPorCliente: async (clienteId: string): Promise<Projeto[]> => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 400))
    return projetosMock.filter(p => p.clienteId === clienteId)
  },

  // Listar projetos por propriedade
  listarProjetosPorPropriedade: async (propriedadeId: string): Promise<Projeto[]> => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 400))
    return projetosMock.filter(p => p.propriedadeId === propriedadeId)
  },

// Listar documentos de um projeto
listarDocumentos: async (projetoId: string): Promise<Documento[]> => {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const projeto = projetosMock.find(p => p.id === projetoId)
  if (!projeto) {
    return []
  }
  
  // Buscar documentos pelo array de IDs do projeto
  const documentosPorId = projeto.documentos.map(docId => {
    const doc = documentosMock.find(d => d.id === docId)
    return doc ? { ...doc } : null
  }).filter(Boolean) as Documento[]
  
  // Buscar documentos que tenham o projetoId definido
  const documentosPorProjetoId = documentosMock.filter(d => d.projetoId === projetoId)
  
  // Combinar os resultados, removendo duplicatas pelo ID
  const todosDocumentos = [...documentosPorId]
  
  // Adicionar documentos que têm projetoId mas não estão no array documentos do projeto
  documentosPorProjetoId.forEach(doc => {
    if (!todosDocumentos.some(d => d.id === doc.id)) {
      todosDocumentos.push({...doc})
    }
  })
  
  return todosDocumentos
},

// Adicionar documento
adicionarDocumento: async (projetoId: string, documento: Omit<Documento, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Documento | null> => {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const projeto = projetosMock.find(p => p.id === projetoId)
  if (!projeto) {
    return null
  }
  
  const novoDocumento: Documento = {
    ...documento,
    id: uuidv4(),
    projetoId: projetoId, // Adicionar projetoId ao documento
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString()
  }
  
  documentosMock.push(novoDocumento)
  
  // Verificar se o ID já existe no array documentos para evitar duplicatas
  if (!projeto.documentos.includes(novoDocumento.id)) {
    projeto.documentos.push(novoDocumento.id)
  }
  
  return novoDocumento
},

  // Atualizar status do documento
  atualizarStatusDocumento: async (documentoId: string, status: string): Promise<Documento | null> => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const documento = documentosMock.find(d => d.id === documentoId)
    if (!documento) {
      return null
    }
    
    documento.status = status
    documento.dataAtualizacao = new Date().toISOString()
    
    // Atualizar o documento no projeto
    projetosMock.forEach(projeto => {
      const docIndex = projeto.documentos.findIndex(d => d === documentoId)
      if (docIndex !== -1) {
        projeto.documentos[docIndex] = documentoId
      }
    })
    
    return documento
  }
}
