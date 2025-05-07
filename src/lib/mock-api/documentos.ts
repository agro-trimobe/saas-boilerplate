import { Documento, gerarIdAleatorio } from '../crm-utils'
import { projetosApi } from './projetos'

// Dados mockados para documentos
const documentosMock: Documento[] = [
  {
    id: '1',
    nome: 'Projeto Técnico - Aquisição de Trator',
    tipo: 'Projeto',
    formato: 'pdf',
    tamanho: 2458000,
    url: '/documentos/projeto-trator.pdf',
    clienteId: '1',
    projetoId: '1',
    dataCriacao: '2024-02-10T14:30:00Z',
    dataAtualizacao: '2024-02-10T14:30:00Z',
    tags: ['Projeto', 'Maquinário', 'Pronaf'],
    status: 'Aprovado'
  },
  {
    id: '2',
    nome: 'RG e CPF',
    tipo: 'Documentação Pessoal',
    formato: 'pdf',
    tamanho: 1240000,
    url: '/documentos/rg-cpf-cliente1.pdf',
    clienteId: '1',
    dataCriacao: '2024-02-05T10:15:00Z',
    dataAtualizacao: '2024-02-05T10:15:00Z',
    tags: ['Documentação Pessoal', 'Identificação'],
    status: 'Aprovado'
  },
  {
    id: '3',
    nome: 'Matrícula do Imóvel',
    tipo: 'Documentação Imobiliária',
    formato: 'pdf',
    tamanho: 3560000,
    url: '/documentos/matricula-imovel-cliente1.pdf',
    clienteId: '1',
    dataCriacao: '2024-02-05T10:20:00Z',
    dataAtualizacao: '2024-02-05T10:20:00Z',
    tags: ['Documentação Imobiliária', 'Matrícula'],
    status: 'Aprovado'
  },
  {
    id: '4',
    nome: 'Contrato de Financiamento',
    tipo: 'Contrato',
    formato: 'pdf',
    tamanho: 4250000,
    url: '/documentos/contrato-financiamento-projeto1.pdf',
    clienteId: '1',
    projetoId: '1',
    dataCriacao: '2024-02-25T16:45:00Z',
    dataAtualizacao: '2024-02-25T16:45:00Z',
    tags: ['Contrato', 'Financiamento', 'Banco do Brasil'],
    status: 'Enviado'
  },
  {
    id: '5',
    nome: 'Laudo de Vistoria Inicial',
    tipo: 'Laudo',
    formato: 'pdf',
    tamanho: 8900000,
    url: '/documentos/laudo-vistoria-inicial-projeto1.pdf',
    clienteId: '1',
    projetoId: '1',
    visitaId: '1',
    dataCriacao: '2024-02-15T11:30:00Z',
    dataAtualizacao: '2024-02-15T11:30:00Z',
    tags: ['Laudo', 'Vistoria', 'Fotos'],
    status: 'Aprovado'
  },
  {
    id: '6',
    nome: 'Projeto Técnico - Expansão de Pomar',
    tipo: 'Projeto',
    formato: 'pdf',
    tamanho: 3250000,
    url: '/documentos/projeto-expansao-pomar.pdf',
    clienteId: '2',
    projetoId: '2',
    dataCriacao: '2024-02-20T09:15:00Z',
    dataAtualizacao: '2024-02-20T09:15:00Z',
    tags: ['Projeto', 'Fruticultura', 'Pronamp'],
    status: 'Pendente'
  },
  {
    id: '7',
    nome: 'Documentação Completa',
    tipo: 'Documentação Pessoal',
    formato: 'pdf',
    tamanho: 5680000,
    url: '/documentos/documentacao-completa-cliente2.pdf',
    clienteId: '2',
    dataCriacao: '2024-02-18T14:20:00Z',
    dataAtualizacao: '2024-02-18T14:20:00Z',
    tags: ['Documentação Pessoal', 'Identificação', 'Comprovantes'],
    status: 'Enviado'
  },
  {
    id: '8',
    nome: 'Orçamento - Sistema de Irrigação',
    tipo: 'Orçamento',
    formato: 'pdf',
    tamanho: 1850000,
    url: '/documentos/orcamento-irrigacao-projeto2.pdf',
    clienteId: '2',
    projetoId: '2',
    dataCriacao: '2024-02-19T16:30:00Z',
    dataAtualizacao: '2024-02-19T16:30:00Z',
    tags: ['Orçamento', 'Irrigação', 'Fornecedor'],
    status: 'Pendente'
  },
  {
    id: '9',
    nome: 'Projeto Técnico - Sistema de Energia Solar',
    tipo: 'Projeto',
    formato: 'pdf',
    tamanho: 4580000,
    url: '/documentos/projeto-energia-solar.pdf',
    clienteId: '3',
    projetoId: '3',
    dataCriacao: '2024-02-28T10:45:00Z',
    dataAtualizacao: '2024-02-28T10:45:00Z',
    tags: ['Projeto', 'Energia Solar', 'Sustentabilidade'],
    status: 'Enviado'
  },
  {
    id: '10',
    nome: 'Laudo de Vistoria - Fazenda Esperança',
    tipo: 'Laudo',
    formato: 'pdf',
    tamanho: 7650000,
    url: '/documentos/laudo-vistoria-fazenda-esperanca.pdf',
    clienteId: '3',
    visitaId: '3',
    dataCriacao: '2024-02-26T15:20:00Z',
    dataAtualizacao: '2024-02-26T15:20:00Z',
    tags: ['Laudo', 'Vistoria', 'Fotos'],
    status: 'Aprovado'
  },
  {
    id: '11',
    nome: 'Análise de Solo - Talhão 1',
    tipo: 'Análise Técnica',
    formato: 'pdf',
    tamanho: 2340000,
    url: '/documentos/analise-solo-talhao1-cliente3.pdf',
    clienteId: '3',
    visitaId: '3',
    dataCriacao: '2024-02-26T16:10:00Z',
    dataAtualizacao: '2024-02-26T16:10:00Z',
    tags: ['Análise', 'Solo', 'Laboratório'],
    status: 'Aprovado'
  },
  {
    id: '12',
    nome: 'Projeto Técnico - Reforma de Pastagem',
    tipo: 'Projeto',
    formato: 'pdf',
    tamanho: 2890000,
    url: '/documentos/projeto-reforma-pastagem.pdf',
    clienteId: '4',
    projetoId: '4',
    dataCriacao: '2024-03-01T11:30:00Z',
    dataAtualizacao: '2024-03-01T11:30:00Z',
    tags: ['Projeto', 'Pastagem', 'Pecuária'],
    status: 'Pendente'
  },
  {
    id: '13',
    nome: 'Orçamento - Sementes e Insumos',
    tipo: 'Orçamento',
    formato: 'pdf',
    tamanho: 1850000,
    url: '/documentos/orcamento-sementes-insumos.pdf',
    clienteId: '4',
    projetoId: '4',
    dataCriacao: '2024-03-01T14:45:00Z',
    dataAtualizacao: '2024-03-01T14:45:00Z',
    tags: ['Orçamento', 'Sementes', 'Insumos'],
    status: 'Pendente'
  },
  {
    id: '14',
    nome: 'Projeto Técnico - Agricultura de Precisão',
    tipo: 'Projeto',
    formato: 'pdf',
    tamanho: 5670000,
    url: '/documentos/projeto-agricultura-precisao.pdf',
    clienteId: '5',
    projetoId: '5',
    dataCriacao: '2024-02-28T09:30:00Z',
    dataAtualizacao: '2024-02-28T09:30:00Z',
    tags: ['Projeto', 'Agricultura de Precisão', 'Inovação'],
    status: 'Rejeitado'
  },
  {
    id: '15',
    nome: 'Orçamento - Equipamentos de Precisão',
    tipo: 'Orçamento',
    formato: 'pdf',
    tamanho: 2450000,
    url: '/documentos/orcamento-equipamentos-precisao.pdf',
    clienteId: '5',
    projetoId: '5',
    dataCriacao: '2024-02-28T10:15:00Z',
    dataAtualizacao: '2024-02-28T10:15:00Z',
    tags: ['Orçamento', 'Equipamentos', 'Tecnologia'],
    status: 'Pendente'
  },
  {
    id: '16',
    nome: 'Orçamento - Sementes e Insumos',
    tipo: 'Orçamento',
    formato: 'pdf',
    tamanho: 1850000,
    url: '/documentos/orcamento-sementes-projeto5.pdf',
    clienteId: '4',
    projetoId: '5',
    dataCriacao: '2024-03-01T09:45:00Z',
    dataAtualizacao: '2024-03-01T09:45:00Z',
    tags: ['Orçamento', 'Insumos', 'Sementes'],
    status: 'Aprovado'
  },
  {
    id: '17',
    nome: 'Relatório de Visita Técnica - Avaliação de Solo',
    tipo: 'Relatório',
    formato: 'pdf',
    tamanho: 3250000,
    url: '/documentos/relatorio-visita-avaliacao-solo.pdf',
    clienteId: '5',
    visitaId: '7',
    dataCriacao: '2024-02-15T16:30:00Z',
    dataAtualizacao: '2024-02-15T16:30:00Z',
    tags: ['Relatório', 'Visita Técnica', 'Análise de Solo'],
    status: 'Aprovado'
  },
  {
    id: '18',
    nome: 'Fotos da Propriedade - Visita Inicial',
    tipo: 'Imagens',
    formato: 'zip',
    tamanho: 15750000,
    url: '/documentos/fotos-propriedade-visita-inicial.zip',
    clienteId: '1',
    visitaId: '1',
    dataCriacao: '2024-02-10T15:45:00Z',
    dataAtualizacao: '2024-02-10T15:45:00Z',
    tags: ['Fotos', 'Propriedade', 'Documentação Visual'],
    status: 'Aprovado'
  },
  {
    id: '19',
    nome: 'Laudo Técnico - Condições de Solo',
    tipo: 'Laudo',
    formato: 'pdf',
    tamanho: 4250000,
    url: '/documentos/laudo-tecnico-condicoes-solo.pdf',
    clienteId: '2',
    visitaId: '2',
    dataCriacao: '2024-02-25T17:45:00Z',
    dataAtualizacao: '2024-02-25T17:45:00Z',
    tags: ['Laudo', 'Análise Técnica', 'Solo'],
    status: 'Aprovado'
  },
  {
    id: '20',
    nome: 'Termo de Vistoria - Expansão Sistema Irrigação',
    tipo: 'Termo',
    formato: 'pdf',
    tamanho: 2150000,
    url: '/documentos/termo-vistoria-expansao-irrigacao.pdf',
    clienteId: '3',
    visitaId: '5',
    dataCriacao: '2024-02-20T17:30:00Z',
    dataAtualizacao: '2024-02-20T17:30:00Z',
    tags: ['Termo', 'Vistoria', 'Irrigação'],
    status: 'Aprovado'
  }
]

// API mockada para documentos
export const documentosApi = {
  // Listar todos os documentos
  listarDocumentos: async (): Promise<Documento[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...documentosMock])
      }, 500)
    })
  },

  // Buscar documento por ID
  buscarDocumentoPorId: async (id: string): Promise<Documento | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const documento = documentosMock.find(d => d.id === id) || null
        resolve(documento ? { ...documento } : null)
      }, 300)
    })
  },

  // Obter documento por ID (lança erro se não encontrar)
  obterDocumentoPorId: async (id: string): Promise<Documento> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const documento = documentosMock.find(d => d.id === id)
        if (documento) {
          resolve({ ...documento })
        } else {
          reject(new Error(`Documento com ID ${id} não encontrado`))
        }
      }, 300)
    })
  },

  // Listar documentos por cliente
  listarDocumentosPorCliente: async (clienteId: string): Promise<Documento[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const documentos = documentosMock.filter(d => d.clienteId === clienteId)
        resolve([...documentos])
      }, 400)
    })
  },

  // Listar documentos por projeto
  listarDocumentosPorProjeto: async (projetoId: string): Promise<Documento[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const documentos = documentosMock.filter(d => d.projetoId === projetoId)
        resolve([...documentos])
      }, 400)
    })
  },

  // Listar documentos por visita
  listarDocumentosPorVisita: async (visitaId: string): Promise<Documento[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const documentos = documentosMock.filter(d => d.visitaId === visitaId)
        resolve([...documentos])
      }, 400)
    })
  },

  // Listar documentos por tipo
  listarDocumentosPorTipo: async (tipo: string): Promise<Documento[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const documentos = documentosMock.filter(d => d.tipo === tipo)
        resolve([...documentos])
      }, 400)
    })
  },

  // Listar documentos por tag
  listarDocumentosPorTag: async (tag: string): Promise<Documento[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const documentos = documentosMock.filter(d => d.tags && d.tags.includes(tag))
        resolve([...documentos])
      }, 400)
    })
  },
  
  // Listar documentos por status
  listarDocumentosPorStatus: async (status: string): Promise<Documento[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const documentos = documentosMock.filter(d => d.status === status)
        resolve([...documentos])
      }, 400)
    })
  },

  // Atualizar status do documento
  atualizarStatusDocumento: async (id: string, status: string): Promise<Documento | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = documentosMock.findIndex(d => d.id === id)
        if (index === -1) {
          resolve(null)
          return
        }
        
        const documentoAtualizado: Documento = {
          ...documentosMock[index],
          status,
          dataAtualizacao: new Date().toISOString()
        }
        
        documentosMock[index] = documentoAtualizado
        resolve({ ...documentoAtualizado })
      }, 400)
    })
  },

// Criar novo documento
criarDocumento: async (documento: Omit<Documento, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<Documento> => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      const novoDocumento: Documento = {
        ...documento,
        id: gerarIdAleatorio(),
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
      }
      
      documentosMock.push(novoDocumento)
      
      // Se o documento estiver associado a um projeto, adicionar o ID do documento ao array documentos do projeto
      if (novoDocumento.projetoId) {
        try {
          const projeto = await projetosApi.buscarProjetoPorId(novoDocumento.projetoId)
          if (projeto && !projeto.documentos.includes(novoDocumento.id)) {
            projeto.documentos.push(novoDocumento.id)
          }
        } catch (error) {
          console.error('Erro ao associar documento ao projeto:', error)
        }
      }
      
      resolve({ ...novoDocumento })
    }, 700)
  })
},

  // Atualizar documento
  atualizarDocumento: async (id: string, dadosAtualizados: Partial<Omit<Documento, 'id' | 'dataCriacao' | 'dataAtualizacao'>>): Promise<Documento | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = documentosMock.findIndex(d => d.id === id)
        if (index === -1) {
          resolve(null)
          return
        }
        
        const documentoAtualizado: Documento = {
          ...documentosMock[index],
          ...dadosAtualizados,
          dataAtualizacao: new Date().toISOString()
        }
        
        documentosMock[index] = documentoAtualizado
        resolve({ ...documentoAtualizado })
      }, 600)
    })
  },

  // Excluir documento
  excluirDocumento: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = documentosMock.findIndex(d => d.id === id)
        if (index === -1) {
          resolve(false)
          return
        }
        
        documentosMock.splice(index, 1)
        resolve(true)
      }, 400)
    })
  },

  // Adicionar tag a um documento
  adicionarTag: async (id: string, tag: string): Promise<Documento | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = documentosMock.findIndex(d => d.id === id)
        if (index === -1) {
          resolve(null)
          return
        }
        
        const documento = { ...documentosMock[index] }
        if (!documento.tags) {
          documento.tags = []
        }
        
        if (!documento.tags.includes(tag)) {
          documento.tags.push(tag)
          documento.dataAtualizacao = new Date().toISOString()
          documentosMock[index] = documento
        }
        
        resolve({ ...documento })
      }, 400)
    })
  },

  // Remover tag de um documento
  removerTag: async (id: string, tag: string): Promise<Documento | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = documentosMock.findIndex(d => d.id === id)
        if (index === -1) {
          resolve(null)
          return
        }
        
        const documento = { ...documentosMock[index] }
        if (documento.tags && documento.tags.includes(tag)) {
          documento.tags = documento.tags.filter(t => t !== tag)
          documento.dataAtualizacao = new Date().toISOString()
          documentosMock[index] = documento
        }
        
        resolve({ ...documento })
      }, 400)
    })
  },

  // Obter estatísticas de documentos
  obterEstatisticas: async (): Promise<{
    total: number,
    porTipo: { [key: string]: number },
    porCliente: { [key: string]: number }
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const porTipo: { [key: string]: number } = {}
        const porCliente: { [key: string]: number } = {}
        
        documentosMock.forEach(doc => {
          // Contagem por tipo
          if (!porTipo[doc.tipo]) {
            porTipo[doc.tipo] = 0
          }
          porTipo[doc.tipo]++
          
          // Contagem por cliente
          if (!porCliente[doc.clienteId]) {
            porCliente[doc.clienteId] = 0
          }
          porCliente[doc.clienteId]++
        })
        
        resolve({
          total: documentosMock.length,
          porTipo,
          porCliente
        })
      }, 600)
    })
  }
}
