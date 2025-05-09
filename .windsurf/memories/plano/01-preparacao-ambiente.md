# Fase 1: Preparação do Ambiente (1 semana)

## 1.1. Configuração do Ambiente de Desenvolvimento (2 dias)
- [ ] **Criar novo repositório para o projeto**
  - Criar um novo repositório GitHub chamado "rural-credit-ai" a partir do boilerplate atual
  - Atualizar README.md com informações específicas do projeto

- [ ] **Confirmar configuração do repositório Git**
  - Verificar a estrutura de branches existente
  - Verificar se o arquivo `.gitignore` já inclui: `.env*`, `node_modules/`, `.next/`, `coverage/`, `dist/`
  - Adicionar outros arquivos específicos ao `.gitignore` se necessário

- [ ] **Revisar estrutura do boilerplate e dependências atuais**
  - Analisar diretórios principais: `/src`, `/public`, `/components`
  - Confirmar que está utilizando o App Router do Next.js (estrutura /src/app)
  - Listar dependências principais e suas versões em `package.json`
  - Atualizar dependências críticas para últimas versões estáveis:
    ```bash
    npm outdated
    npm update
    ```
  - Documentar componentes reutilizáveis existentes que podem ser adaptados para o sistema de chat

- [ ] **Configurar variáveis de ambiente (.env)**
  - Criar arquivo base `.env.example` com todas as variáveis necessárias (sem valores reais)
  - Criar arquivo `.env.local` para desenvolvimento local
  - Criar arquivo `.env.production` para ambiente de produção
  - Variáveis AWS requeridas:
    ```
    AWS_REGION=us-east-1
    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    AWS_COGNITO_USER_POOL_ID=
    AWS_COGNITO_CLIENT_ID=
    AWS_COGNITO_IDENTITY_POOL_ID=
    DYNAMODB_TABLE_PREFIX=agrocredit_
    S3_BUCKET_NAME=rural-credit-ai-app-files
    AWS_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
    ```
  - Variáveis Asaas (pagamentos):
    ```
    ASAAS_API_KEY=
    ASAAS_API_URL=https://sandbox.asaas.com/api/v3/
    ASAAS_ACCESS_TOKEN=
    ```
  - Variáveis da aplicação:
    ```
    NEXTAUTH_SECRET=
    NEXTAUTH_URL=http://localhost:3000
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```

- [ ] **Verificar configurações de desenvolvimento no boilerplate**
  - Confirmar presença e funcionamento dos arquivos de configuração:
    - `.eslintrc.js` ou `.eslintrc.json` para regras de linting
    - `.prettierrc` para regras de formatação
    - Configurações em `package.json` para scripts de lint e formatação
  - Testar scripts de desenvolvimento:
    ```bash
    npm run lint # Verificar se o linting está funcionando
    npm run dev # Testar servidor de desenvolvimento
    ```
  - Instalar extensões recomendadas no VS Code se necessário (ESLint, Prettier)
  - Instalar extensões recomendadas no VS Code se necessário (ESLint, Prettier)

## 1.2. Configuração dos Serviços AWS (3 dias)
- [ ] **Validar conta AWS existente para o projeto**
  - Verificar configuração IAM e política de permissões
  - Confirmar acesso programático com o perfil existente
  - Validar que as credenciais estão configuradas corretamente:
    ```bash
    aws sts get-caller-identity
    ```
  - Verificar a região padrão configurada:
    ```bash
    aws configure get region
    ```

- [ ] **Verificar e configurar DynamoDB com as tabelas necessárias conforme o documento ModelagemDynamoDB-AgroCredit.md**
  - **Verificar tabelas existentes (Users, Tenants)**
    - Listar tabelas existentes: `aws dynamodb list-tables`
    - Analisar esquema de tabelas existentes:
      ```bash
      aws dynamodb describe-table --table-name Users
      aws dynamodb describe-table --table-name Tenants
      ```
  - **Criar tabela principal RuralCreditAI para o modelo single-table design conforme estrutura definida no documento de modelagem**
    ```bash
    aws dynamodb create-table \
      --table-name RuralCreditAI \
      --attribute-definitions \
        AttributeName=PK,AttributeType=S \
        AttributeName=SK,AttributeType=S \
        AttributeName=GSI1PK,AttributeType=S \
        AttributeName=GSI1SK,AttributeType=S \
        AttributeName=GSI2PK,AttributeType=S \
        AttributeName=GSI2SK,AttributeType=S \
      --key-schema \
        AttributeName=PK,KeyType=HASH \
        AttributeName=SK,KeyType=RANGE \
      --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
      --global-secondary-indexes \
        "[\
          {\
            \"IndexName\": \"GSI1\",\
            \"KeySchema\": [{\"AttributeName\":\"GSI1PK\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"GSI1SK\",\"KeyType\":\"RANGE\"}],\
            \"Projection\": {\"ProjectionType\":\"ALL\"},\
            \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5, \"WriteCapacityUnits\": 5}\
          },\
          {\
            \"IndexName\": \"GSI2\",\
            \"KeySchema\": [{\"AttributeName\":\"GSI2PK\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"GSI2SK\",\"KeyType\":\"RANGE\"}],\
            \"Projection\": {\"ProjectionType\":\"ALL\"},\
            \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5, \"WriteCapacityUnits\": 5}\
          }\
        ]"
    ```
  - **Verificar a criação bem-sucedida:**
    ```bash
    aws dynamodb scan --table-name RuralCreditAI --limit 1
    ```

- [ ] **Configurar bucket S3 com a estrutura hierárquica definida conforme documento ArmazenamentoS3-AgroCredit.md**
  - **Verificar se o bucket principal `rural-credit-ai-app-files` existe ou criar**
    ```bash
    aws s3api head-bucket --bucket rural-credit-ai-app-files 2>/dev/null || aws s3api create-bucket --bucket rural-credit-ai-app-files --region us-east-1
    ```
  - **Configurar política de acesso privado**
    ```bash
    aws s3api put-public-access-block \
      --bucket rural-credit-ai-app-files \
      --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
    ```
  - **Configurar política de ciclo de vida para arquivos temporários**
    ```bash
    aws s3api put-bucket-lifecycle-configuration \
      --bucket rural-credit-ai-app-files \
      --lifecycle-configuration '{"Rules":[{"ID":"DeleteTempFilesRule","Prefix":"tenants/*/temp/","Status":"Enabled","Expiration":{"Days":1}}]}'
    ```
  - **Criar estrutura básica de diretórios**
    ```bash
    # Criar diretórios do sistema
    aws s3api put-object --bucket rural-credit-ai-app-files --key system/
    aws s3api put-object --bucket rural-credit-ai-app-files --key system/templates/
    aws s3api put-object --bucket rural-credit-ai-app-files --key system/knowledge-base/
    aws s3api put-object --bucket rural-credit-ai-app-files --key system/knowledge-base/mcr/
    aws s3api put-object --bucket rural-credit-ai-app-files --key system/knowledge-base/legislation/
    aws s3api put-object --bucket rural-credit-ai-app-files --key system/knowledge-base/banks/
    
    # Criar diretório base para tenants
    aws s3api put-object --bucket rural-credit-ai-app-files --key tenants/
    ```
  - **Testar upload de arquivo de exemplo**
    ```bash
    echo "Arquivo de teste" > test.txt
    aws s3 cp test.txt s3://rural-credit-ai-app-files/system/test.txt
    aws s3 rm s3://rural-credit-ai-app-files/system/test.txt
    rm test.txt
    ```

## 1.3. Configuração de Serviços de Autenticação (2 dias)
- [ ] **Verificar configuração existente de autenticação no boilerplate**
  - Revisar o middleware existente em `src/middleware.ts`
  - Analisar implementação atual do NextAuth no boilerplate
  - Verificar estrutura de autenticação existente em `/src/app/auth`
  - Adaptar páginas de autenticação para o contexto do AgroCredit, mantendo a estrutura de código existente

- [ ] **Configurar interfaces de perfil de usuário específicas para o AgroCredit**
  - Adaptar componentes existentes para incluir campos específicos:
    - Profissão (engenheiro agrônomo, técnico agrícola, etc.)
    - Área de atuação
    - Preferências do assistente

- [ ] **Validar integração com serviços de armazenamento**
  - Verificar a conexão com o DynamoDB
  - Testar o upload de arquivos para o S3
  - Confirmar permissões adequadas para operações de leitura/escrita

- [ ] **Integrar componentes existentes do boilerplate para o contexto do AgroCredit**
  - Adaptar componentes para incluir campos específicos necessários para crédito rural
  - Reutilizar a integração Asaas já existente no boilerplate
  - Configurar perfis de usuário com informações relevantes para o domínio:
    - Profissão (engenheiro agrônomo, técnico agrícola, etc.)
    - Área de atuação
    - Preferências
