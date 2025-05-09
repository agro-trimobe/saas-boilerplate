# Prompt: Fase 1 - Preparação do Ambiente

## Objetivo
Configurar o ambiente de desenvolvimento completo para o Trimobe conforme especificado na Fase 1 do Plano de Trabalho.

## Contexto
Esta é a fase inicial do projeto que estabelecerá a base para todo o desenvolvimento subsequente. É necessário configurar todos os serviços AWS, estrutura de bancos de dados, armazenamento e ambiente de desenvolvimento local.

## Tarefas Específicas

### 1.1. Configuração do Ambiente de Desenvolvimento
- Configurar repositório Git para controle de versão
- Revisar estrutura do boilerplate e dependências atuais
- Configurar variáveis de ambiente (.env)
- Configurar IDE e ferramentas de desenvolvimento

### 1.2. Configuração dos Serviços AWS
- Criar conta/configurar AWS (ou usar existente)
- Configurar DynamoDB com as tabelas necessárias
  - Verificar tabelas existentes (Users, Tenants)
  - Criar tabela RuralCreditAI conforme modelagem
- Configurar bucket S3 com a estrutura definida
  - Criar bucket `rural-credit-ai-app-files`
  - Definir políticas de acesso e lifecycle
- Configurar AWS Cognito para autenticação
- Preparar integração com AWS Bedrock

### 1.3. Configuração do Pinecone
- Criar conta no Pinecone (ou usar existente)
- Configurar índice vetorial para conhecimento especializado
- Definir dimensão de embeddings e métricas

## Instruções Adicionais
- Gerar scripts de configuração automatizada quando possível
- Documentar cada etapa do processo para referência futura
- Verificar a compatibilidade de todas as configurações com a arquitetura planejada
- Priorizar a segurança em todas as configurações de serviços AWS
- Seguir as convenções de nomenclatura definidas na documentação

## Entregáveis Esperados
- Repositório Git configurado
- Arquivos .env com variáveis necessárias
- Scripts de criação da tabela RuralCreditAI
- Scripts de configuração do bucket S3
- Configuração do Pinecone documentada
- Instruções para configuração de integração com AWS Bedrock
