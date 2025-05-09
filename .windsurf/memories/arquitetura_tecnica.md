# Arquitetura Técnica Trimobe

## Componentes Principais
- Frontend: Next.js + Interface de chat simplificada
- Backend: API Next.js serverless
- Bancos de Dados: DynamoDB (tabelas Users, Tenants, RuralCreditAI)
- Armazenamento: S3 (bucket rural-credit-ai-app-files)
- IA: AWS Bedrock + Pinecone para RAG
- Autenticação: AWS Cognito
- Pagamentos: Asaas

## Fluxo Principal
Interface de Chat -> API Next.js -> AWS Bedrock (com contexto do Pinecone) -> Resposta ao usuário

## Estrutura de Dados
- DynamoDB: Modelagem híbrida com tabelas existentes (Users, Tenants) e nova tabela RuralCreditAI
- S3: Bucket único com estrutura de prefixos para isolamento de dados por tenant

## Integração com IA
- AWS Bedrock como LLM principal
- Pinecone para armazenamento de vetores da base de conhecimento
- Implementação de RAG para enriquecimento de contexto
- Processamento de documentos via IA

## Segurança
- Autenticação via AWS Cognito
- Isolamento de dados por tenant
- Políticas de acesso no S3
- Controle de permissões baseado em funções

## Infraestrutura
- Serverless com Next.js
- Ambiente multi-tenant
- Escalabilidade horizontal
- Otimização de custos com classes de armazenamento S3
