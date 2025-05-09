# Prompt: Fase 3 - Desenvolvimento do Backend

## Objetivo
Implementar o backend completo do Trimobe conforme especificado na Fase 3 do Plano de Trabalho, com foco nas APIs e integração com serviços AWS.

## Contexto
Esta fase é fundamental para estabelecer a infraestrutura de suporte à interface conversacional, gerenciamento de mensagens, arquivos e integração com serviços de IA.

## Tarefas Específicas

### 3.1. Configuração da API Principal
- Definir estrutura de rotas para API NextJS
- Implementar middlewares de autenticação
- Configurar integração com DynamoDB

### 3.2. Implementação do Sistema de Mensagens
- Desenvolver endpoints para:
  - Envio de mensagens
  - Recuperação de histórico
  - Criação de novas conversas
- Implementar lógica de armazenamento no DynamoDB
- Configurar sistema de streaming para mensagens longas

### 3.3. Desenvolvimento do Sistema de Arquivos
- Implementar endpoints para:
  - Upload de arquivos
  - Download de documentos
  - Listagem de arquivos
- Desenvolver integração com S3
- Configurar geração de URLs pré-assinados

### 3.4. Manutenção do Sistema de Assinatura
- Validar integração com Asaas
- Adaptar para planos específicos do Trimobe
- Implementar verificação de status de assinatura
- Configurar período de trial de 7 dias

## Instruções Adicionais
- Seguir a modelagem de dados do DynamoDB conforme documentação
- Estruturar o código para facilitar testes unitários
- Implementar tratamento de erros robusto
- Manter logs detalhados para debugging
- Seguir princípios de segurança em todas as APIs

## Entregáveis Esperados
- API NextJS completa com endpoints documentados
- Sistema de mensagens e conversas implementado
- Sistema de gerenciamento de arquivos integrado ao S3
- Sistema de assinatura adaptado ao modelo de negócio do Trimobe
- Documentação técnica das integrações com AWS
