// Tipos para a camada de repositório do DynamoDB
import { 
  Cliente, 
  Propriedade, 
  Projeto, 
  Documento, 
  Oportunidade, 
  Simulacao,
  Quadro,
  Lista,
  Tarefa
} from '../crm-utils';

// Tipo base para todos os itens do DynamoDB
export interface DynamoDBItem {
  PK: string;
  SK: string;
  GSI1PK?: string;
  GSI1SK?: string;
  GSI2PK?: string;
  GSI2SK?: string;
  GSI3PK?: string;
  GSI3SK?: string;
  GSI4PK?: string;
  GSI4SK?: string;
  tenantId: string;
}

// Tipos específicos para cada entidade no DynamoDB
export interface ClienteItem extends DynamoDBItem, Omit<Cliente, 'propriedades' | 'projetos' | 'interacoes'> {
  propriedades?: string[]; // IDs das propriedades
  projetos?: string[]; // IDs dos projetos
  interacoes?: string[]; // IDs das interações
}

export interface PropriedadeItem extends DynamoDBItem, Propriedade {}

export interface ProjetoItem extends DynamoDBItem, Projeto {}

export interface DocumentoItem extends DynamoDBItem, Documento {}



export interface OportunidadeItem extends DynamoDBItem, Oportunidade {}



export interface SimulacaoItem extends DynamoDBItem, Simulacao {}

// Novos tipos para o sistema de Gestão de Tarefas
export interface QuadroItem extends DynamoDBItem, Quadro {}

export interface ListaItem extends DynamoDBItem, Lista {}

export interface TarefaItem extends DynamoDBItem, Tarefa {}

// Funções auxiliares para conversão entre tipos de domínio e tipos do DynamoDB

// Funções para o sistema de Gestão de Tarefas
export function quadroToItem(quadro: Quadro, tenantId: string): QuadroItem {
  return {
    PK: `TENANT#${tenantId}`,
    SK: `QUADRO#${quadro.id}`,
    GSI1PK: `QUADRO#${quadro.id}`,
    GSI1SK: `TENANT#${tenantId}`,
    tenantId,
    ...quadro
  };
}

export function itemToQuadro(item: QuadroItem): Quadro {
  return {
    id: item.id,
    titulo: item.titulo,
    descricao: item.descricao,
    cor: item.cor,
    dataCriacao: item.dataCriacao,
    dataAtualizacao: item.dataAtualizacao
  };
}

export function listaToItem(lista: Lista, tenantId: string): ListaItem {
  return {
    PK: `TENANT#${tenantId}`,
    SK: `LISTA#${lista.id}`,
    GSI1PK: `QUADRO#${lista.quadroId}`,
    GSI1SK: `LISTA#${String(lista.ordem).padStart(4, '0')}#${lista.id}`,
    tenantId,
    ...lista
  };
}

export function itemToLista(item: ListaItem): Lista {
  return {
    id: item.id,
    quadroId: item.quadroId,
    titulo: item.titulo,
    ordem: item.ordem,
    cor: item.cor,
    dataCriacao: item.dataCriacao,
    dataAtualizacao: item.dataAtualizacao
  };
}

export function tarefaToItem(tarefa: Tarefa, tenantId: string): TarefaItem {
  const item: TarefaItem = {
    PK: `TENANT#${tenantId}`,
    SK: `TAREFA#${tarefa.id}`,
    GSI1PK: `LISTA#${tarefa.listaId}`,
    GSI1SK: `TAREFA#${String(tarefa.ordem).padStart(4, '0')}#${tarefa.id}`,
    tenantId,
    ...tarefa
  };
  
  // Adicionar índice para busca por cliente, se existir
  if (tarefa.clienteId) {
    item.GSI2PK = `CLIENTE#${tarefa.clienteId}`;
    item.GSI2SK = `TAREFA#${tarefa.id}`;
  }
  
  // Adicionar índice para busca por projeto, se existir
  if (tarefa.projetoId) {
    item.GSI3PK = `PROJETO#${tarefa.projetoId}`;
    item.GSI3SK = `TAREFA#${tarefa.id}`;
  }
  
  // Adicionar índice para busca por propriedade, se existir
  if (tarefa.propriedadeId) {
    item.GSI4PK = `PROPRIEDADE#${tarefa.propriedadeId}`;
    item.GSI4SK = `TAREFA#${tarefa.id}`;
  }
  
  return item;
}

export function itemToTarefa(item: TarefaItem): Tarefa {
  return {
    id: item.id,
    listaId: item.listaId,
    quadroId: item.quadroId,
    titulo: item.titulo,
    descricao: item.descricao,
    prazo: item.prazo,
    responsavel: item.responsavel,
    etiquetas: item.etiquetas,
    prioridade: item.prioridade,
    ordem: item.ordem,
    clienteId: item.clienteId,
    projetoId: item.projetoId,
    propriedadeId: item.propriedadeId,
    dataCriacao: item.dataCriacao,
    dataAtualizacao: item.dataAtualizacao,
    dataConclusao: item.dataConclusao
  };
}
export function clienteToItem(cliente: Cliente, tenantId: string): ClienteItem {
  return {
    PK: `TENANT#${tenantId}`,
    SK: `CLIENTE#${cliente.id}`,
    GSI1PK: `CLIENTE#${cliente.id}`,
    GSI1SK: `TENANT#${tenantId}`,
    GSI2PK: `TENANT#${tenantId}#CPFCNPJ#${cliente.cpfCnpj}`,
    GSI2SK: `CLIENTE#${cliente.id}`,
    tenantId,
    ...cliente,
    propriedades: cliente.propriedades?.map(p => p.id),
    projetos: cliente.projetos?.map(p => p.id),

  };
}

export function itemToCliente(item: ClienteItem): Cliente {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, tenantId, propriedades, projetos, ...cliente } = item;
  return cliente as Cliente;
}

export function propriedadeToItem(propriedade: Propriedade, tenantId: string): PropriedadeItem {
  return {
    PK: `TENANT#${tenantId}`,
    SK: `PROPRIEDADE#${propriedade.id}`,
    GSI1PK: `CLIENTE#${propriedade.clienteId}`,
    GSI1SK: `PROPRIEDADE#${propriedade.id}`,
    GSI2PK: `TENANT#${tenantId}#MUNICIPIO#${propriedade.municipio}`,
    GSI2SK: `PROPRIEDADE#${propriedade.id}`,
    tenantId,
    ...propriedade
  };
}

export function itemToPropriedade(item: PropriedadeItem): Propriedade {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, tenantId, ...propriedade } = item;
  return propriedade as Propriedade;
}

export function projetoToItem(projeto: Projeto, tenantId: string): ProjetoItem {
  return {
    PK: `TENANT#${tenantId}`,
    SK: `PROJETO#${projeto.id}`,
    GSI1PK: `CLIENTE#${projeto.clienteId}`,
    GSI1SK: `PROJETO#${projeto.id}`,
    GSI2PK: `PROPRIEDADE#${projeto.propriedadeId}`,
    GSI2SK: `PROJETO#${projeto.id}`,
    tenantId,
    ...projeto
  };
}

export function itemToProjeto(item: ProjetoItem): Projeto {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, tenantId, ...projeto } = item;
  return projeto as Projeto;
}

export function documentoToItem(documento: Documento, tenantId: string): DocumentoItem {
  return {
    PK: `TENANT#${tenantId}`,
    SK: `DOCUMENTO#${documento.id}`,
    GSI1PK: `CLIENTE#${documento.clienteId}`,
    GSI1SK: `DOCUMENTO#${documento.id}`,
    GSI2PK: `TIPO#${documento.tipo}`,
    GSI2SK: `TENANT#${tenantId}#DOCUMENTO#${documento.id}`,
    tenantId,
    ...documento
  };
}

export function itemToDocumento(item: DocumentoItem): Documento {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, tenantId, ...documento } = item;
  return documento as Documento;
}





export function oportunidadeToItem(oportunidade: Oportunidade, tenantId: string): OportunidadeItem {
  return {
    PK: `TENANT#${tenantId}`,
    SK: `OPORTUNIDADE#${oportunidade.id}`,
    GSI1PK: `CLIENTE#${oportunidade.clienteId}`,
    GSI1SK: `OPORTUNIDADE#${oportunidade.id}`,
    GSI2PK: `TENANT#${tenantId}#STATUS#${oportunidade.status}`,
    GSI2SK: `OPORTUNIDADE#${oportunidade.id}`,
    tenantId,
    ...oportunidade
  };
}

export function itemToOportunidade(item: OportunidadeItem): Oportunidade {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, tenantId, ...oportunidade } = item;
  return oportunidade as Oportunidade;
}





export function simulacaoToItem(simulacao: Simulacao, tenantId: string): SimulacaoItem {
  return {
    PK: `TENANT#${tenantId}`,
    SK: `SIMULACAO#${simulacao.id}`,
    GSI1PK: `CLIENTE#${simulacao.clienteId}`,
    GSI1SK: `SIMULACAO#${simulacao.id}`,
    GSI2PK: `TENANT#${tenantId}#LINHACREDITO#${simulacao.linhaCredito}`,
    GSI2SK: `SIMULACAO#${simulacao.id}`,
    tenantId,
    ...simulacao
  };
}

export function itemToSimulacao(item: SimulacaoItem): Simulacao {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, tenantId, ...simulacao } = item;
  return simulacao as Simulacao;
}
