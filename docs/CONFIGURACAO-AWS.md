# Configuração AWS para Multi-tenant

Este documento detalha os requisitos mínimos e as configurações necessárias dos serviços AWS para o funcionamento do sistema multi-tenant do boilerplate.

## Visão Geral dos Serviços AWS Utilizados

O boilerplate utiliza os seguintes serviços AWS:

1. **Amazon Cognito**: Para autenticação e gestão de usuários
2. **Amazon DynamoDB**: Para armazenamento de dados com separação por tenant
3. **Amazon S3** (opcional): Para armazenamento de arquivos

## Requisitos Mínimos

### 1. Conta AWS

- Conta AWS ativa
- Usuário IAM com permissões para criar e gerenciar os serviços necessários
- Chaves de acesso (Access Key ID e Secret Access Key)

### 2. Configuração do Amazon Cognito

#### Criação do User Pool:

1. Acesse o Console AWS > Cognito > User Pools > Create user pool
2. Configure o sign-in experience:
   - Selecione "Email" como opção de login
   - Ative a opção "Allow users to sign in with a preferred username"
3. Configure os requisitos de segurança:
   - Defina políticas de senha (recomendação: mínimo 8 caracteres)
   - Ative a autenticação multifator como opcional
4. Configure a experiência de sign-up:
   - Ative a verificação de email
   - Defina os atributos obrigatórios (nome e email)
5. Configure as mensagens:
   - Personalize os templates de email conforme necessário
6. Integre com o app:
   - Crie um cliente de app
   - Desabilite o Client Secret
   - Configure as URIs de callback (ex: http://localhost:3000/api/auth/callback/cognito)
   - Selecione os OAuth flows: Authorization code grant e Implicit grant
   - Selecione os OAuth scopes: email, openid, profile
7. Revise e crie o User Pool

#### Obtenha os Dados de Configuração:

Anote os seguintes valores que serão necessários para as variáveis de ambiente:
- User Pool ID
- App client ID
- App client secret (se aplicável)
- Região do Cognito

### 3. Configuração do Amazon DynamoDB

#### Criação das Tabelas:

1. **Tabela Tenants**:
   - Nome: Tenants
   - Chave de partição (PK): String (format: "TENANT#<id>")
   - Chave de ordenação (SK): String (format: "METADATA#1")

2. **Tabela Users**:
   - Nome: Users
   - Chave de partição (PK): String (format: "TENANT#<id>")
   - Chave de ordenação (SK): String (format: "USER#<id>")
   - Índice Global Secundário (GSI1):
     - Nome: GSI1
     - Chave de partição: GSI1PK (format: "USER#<id>")
     - Chave de ordenação: GSI1SK (format: "TENANT#<id>")

3. **Tabela Subscriptions**:
   - Nome: Subscriptions
   - Chave de partição (PK): String (format: "TENANT#<id>")
   - Chave de ordenação (SK): String (format: "SUBSCRIPTION#<id>")
   - Índice Global Secundário (GSI1):
     - Nome: GSI1
     - Chave de partição: GSI1PK (format: "ASAAS#<id>")
     - Chave de ordenação: GSI1SK (format: "TENANT#<id>")

#### Configurações de Capacidade:

Para ambientes de desenvolvimento e testes:
- Escolha o modo de capacidade sob demanda (pay-per-request)

Para ambientes de produção:
- Avalie o uso de capacidade provisionada com auto scaling conforme sua demanda

### 4. Configuração do Amazon S3 (opcional)

Se precisar armazenar arquivos:

1. Crie um bucket S3 com:
   - Nome único global
   - Bloqueio de acesso público (recomendado)
   - Versionamento (opcional)
   - Configurações de CORS para permitir uploads do frontend

2. Configure políticas de lifecycle conforme necessário (ex: expiração de arquivos temporários)

## Configuração de Políticas IAM

Crie um usuário IAM com as seguintes permissões mínimas:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:AdminCreateUser",
                "cognito-idp:AdminInitiateAuth",
                "cognito-idp:AdminGetUser"
            ],
            "Resource": "arn:aws:cognito-idp:<região>:<conta>:userpool/<userpool-id>"
        },
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query",
                "dynamodb:Scan"
            ],
            "Resource": [
                "arn:aws:dynamodb:<região>:<conta>:table/Tenants",
                "arn:aws:dynamodb:<região>:<conta>:table/Users",
                "arn:aws:dynamodb:<região>:<conta>:table/Subscriptions",
                "arn:aws:dynamodb:<região>:<conta>:table/Users/index/GSI1",
                "arn:aws:dynamodb:<região>:<conta>:table/Subscriptions/index/GSI1"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::<nome-do-bucket>",
                "arn:aws:s3:::<nome-do-bucket>/*"
            ]
        }
    ]
}
```

## Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no arquivo `.env.local`:

```
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key

# Cognito
COGNITO_USER_POOL_ID=seu_user_pool_id
COGNITO_CLIENT_ID=seu_client_id
COGNITO_CLIENT_SECRET=seu_client_secret (se aplicável)
NEXTAUTH_SECRET=chave_aleatoria_segura_para_nextauth
NEXTAUTH_URL=http://localhost:3000

# DynamoDB
DYNAMODB_TENANTS_TABLE=Tenants
DYNAMODB_USERS_TABLE=Users
DYNAMODB_SUBSCRIPTIONS_TABLE=Subscriptions

# S3 (opcional)
S3_BUCKET_NAME=nome_do_seu_bucket
```

## Diagrama do Modelo de Dados

O sistema multi-tenant utiliza um modelo de dados onde cada recurso pertence a um tenant específico:

```
+------------+       +------------+       +----------------+
|   Tenant   |       |    User    |       |  Subscription  |
+------------+       +------------+       +----------------+
| PK: TENANT#id |<---| PK: TENANT#id |<---| PK: TENANT#id  |
| SK: METADATA#1|    | SK: USER#id   |    | SK: SUB#id     |
+------------+       +------------+       +----------------+
                     | GSI1PK: USER#id |  | GSI1PK: ASAAS#id |
                     | GSI1SK: TENANT#id| | GSI1SK: TENANT#id|
                     +----------------+  +------------------+
```

## Recomendações de Segurança

1. **Rotação de Chaves**: Rotacione regularmente as chaves de acesso da AWS
2. **Ambiente de Produção**: Use IAM Roles em vez de chaves de acesso em produção
3. **Monitoramento**: Configure CloudWatch Alarms para monitorar atividades suspeitas
4. **Backups**: Ative backups automáticos do DynamoDB via AWS Backup

## Solução de Problemas Comuns

### Erro de Conectividade

Se encontrar erros de conexão com os serviços AWS:

1. Verifique se as chaves de acesso estão configuradas corretamente
2. Confirme se o usuário IAM tem as permissões adequadas
3. Verifique se a região está configurada corretamente

### Erros de Acesso Negado

Se encontrar erros "Access Denied":

1. Verifique as políticas IAM do usuário
2. Confirme se as ARNs nas políticas estão corretas
3. Verifique se as tabelas e índices foram criados com os nomes corretos

### Problemas com o Cognito

Se os usuários não conseguirem autenticar:

1. Verifique a configuração do App Client no Cognito
2. Confirme se as URIs de callback estão configuradas corretamente
3. Verifique se os OAuth scopes necessários estão habilitados
