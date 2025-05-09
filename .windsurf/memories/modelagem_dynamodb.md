# Modelagem de Dados DynamoDB para o Trimobe

## Abordagem Híbrida
O Trimobe utiliza uma modelagem híbrida no DynamoDB, combinando a estrutura existente do boilerplate (tabelas `Users` e `Tenants`) com uma nova tabela única para os dados específicos da aplicação.

## Tabelas Principais

### 1. Tabela `Tenants` (Existente)
- PK: `TENANT#<tenantId>`
- SK: `METADATA#1`
- Armazena informações organizacionais e configurações multi-tenant

### 2. Tabela `Users` (Existente)
- PK: `TENANT#<tenantId>`
- SK: `USER#<cognitoId>`
- GSI1PK: `USER#<cognitoId>`
- GSI1SK: `TENANT#<tenantId>`
- Gerencia usuários e autenticação no contexto multi-tenant

### 3. Tabela `RuralCreditAI` (Nova)
Tabela única para todos os dados específicos da aplicação, usando design de single-table para otimização de acesso.

#### Entidades Armazenadas:
- **Conversas**
  - PK: `TENANT#<tenantId>`
  - SK: `CONVERSATION#<conversationId>`
  
- **Mensagens**
  - PK: `CONVERSATION#<conversationId>`
  - SK: `MESSAGE#<timestamp>`
  
- **Arquivos**
  - PK: `TENANT#<tenantId>`
  - SK: `FILE#<fileId>`
  
- **Documentos Gerados**
  - PK: `TENANT#<tenantId>`
  - SK: `DOCUMENT#<documentId>`

## Índices Secundários Globais (GSIs)
- GSI1: Consultas por usuário (conversas, arquivos, documentos)
- GSI2: Consultas por tipo e timestamp (listagens cronológicas)
