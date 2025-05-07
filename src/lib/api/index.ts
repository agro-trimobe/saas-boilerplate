// Exportação centralizada de todas as APIs reais que usam DynamoDB
export { clientesApi } from './clientes';
export { propriedadesApi } from './propriedades';
export { projetosApi } from './projetos';
export { documentosApi } from './documentos';
export { oportunidadesApi } from './oportunidades';
export { simulacoesApi } from './simulacoes';

// Exportar funções utilitárias
export { getTenantId } from './tenant-utils';
