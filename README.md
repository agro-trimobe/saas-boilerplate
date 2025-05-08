# SaaS Boilerplate

## Visão Geral

Este projeto é um boilerplate completo para aplicações SaaS (Software as a Service) construído com tecnologias modernas. O boilerplate fornece uma estrutura prática e eficiente para desenvolvimento rápido de aplicações SaaS com as principais funcionalidades essenciais.

### Funcionalidades Principais

- **Autenticação completa** com AWS Cognito
- **Sistema de assinaturas** integrado com Asaas
- **Multi-tenancy simplificado** com isolamento de dados
- **Design responsivo** com componentes modernos baseados em Tailwind
- **Carregamento otimizado** com lazy loading e suspense
- **Dashboard básico** para gerenciamento de conta e assinatura

## Tecnologias Utilizadas

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React 18](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Shadcn/UI](https://ui.shadcn.com/)
- **Backend**: Next.js API Routes, serverless-ready
- **Autenticação**: [NextAuth.js](https://next-auth.js.org/) com AWS Cognito
- **Banco de Dados**: AWS DynamoDB com padrões otimizados para multi-tenant
- **Pagamentos**: Integração com [Asaas](https://www.asaas.com/) (gateway brasileiro)
- **Implantação**: Suporte para Vercel, AWS Amplify ou hospedagem personalizada

## Primeiros Passos

### Pré-requisitos

- Node.js 18 ou superior
- Conta AWS (para Cognito e DynamoDB)
- Conta Asaas (para processamento de pagamentos)

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/saas-boilerplate.git
cd saas-boilerplate
```

2. Instale as dependências:

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e preencha com suas configurações conforme documentado no arquivo.

4. Execute o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) em seu navegador para ver o resultado.

## Configuração do Sistema Multi-tenant

O boilerplate implementa um sistema multi-tenant simplificado que proporciona isolamento de dados entre diferentes organizações (tenants). A implementação foi pensada para ser prática e fácil de entender.

### Documentação Detalhada

Para uma documentação completa da configuração AWS para o sistema multi-tenant, consulte o arquivo:

- [Configuração AWS para Multi-tenant](./docs/CONFIGURACAO-AWS.md)

### Resumo da Configuração AWS

#### AWS Cognito

1. **Criar User Pool no AWS Cognito**:
   - Acesse o [AWS Console](https://console.aws.amazon.com/)
   - Navegue até o serviço Cognito
   - Crie um novo User Pool com email como opção de login
   - Configure um app client para sua aplicação web
   - Anote o "User Pool ID", "App Client ID" e "App Client Secret"

#### AWS DynamoDB

1. **Criar tabelas principais**:
   - No AWS Console, navegue até o DynamoDB
   - Crie as seguintes tabelas:
     - `Tenants` (PK: "TENANT#<id>", SK: "METADATA#1")
     - `Users` (PK: "TENANT#<id>", SK: "USER#<id>")
     - `Subscriptions` (PK: "TENANT#<id>", SK: "SUBSCRIPTION#<id>")

2. **Índices Secundários Globais (GSI)**:
   - Para a tabela `Users`: GSI1 com GSI1PK="USER#<id>" e GSI1SK="TENANT#<id>"
   - Para a tabela `Subscriptions`: GSI1 com GSI1PK="ASAAS#<id>" e GSI1SK="TENANT#<id>"

#### Políticas IAM

Crie um usuário IAM com as seguintes permissões mínimas:

- Cognito: AdminCreateUser, AdminInitiateAuth, AdminGetUser
- DynamoDB: PutItem, GetItem, UpdateItem, DeleteItem, Query, Scan
- S3 (opcional): PutObject, GetObject, DeleteObject, ListBucket

1. **Criar Conta Sandbox**:
   - Acesse [https://sandbox.asaas.com](https://sandbox.asaas.com)
   - Crie uma nova conta seguindo o processo normal
   - As contas são aprovadas automaticamente no sandbox

2. **Obter Chave de API**:
   - Após criar a conta, acesse o painel do sandbox
   - Vá em "Configurações" > "Integrações"
   - Gere uma nova chave de API
   - Adicione a chave ao seu arquivo `.env.local`

3. **Cartões de Teste**:
   - **Aprovado**: 5162306219378829
   - **Recusado**: 5162306219378828
   - **Timeout**: 5162306219378827

   Todos os cartões de teste usam:
   - Validade: 05/2025
   - CCV: 318
   - Nome: TEST CREDIT CARD

## Estrutura do Projeto

```
├── public/               # Arquivos estáticos
├── src/
│   ├── app/              # Rotas e páginas da aplicação (App Router)
│   │   ├── api/          # API Routes para backend
│   │   │   ├── auth/     # Endpoints de autenticação
│   │   │   └── subscription/ # Endpoints de assinatura
│   │   ├── auth/         # Páginas de autenticação
│   │   ├── dashboard/    # Área logada da aplicação
│   │   └── page.tsx      # Página inicial
│   ├── components/       # Componentes reutilizáveis
│   ├── lib/              # Utilitários e configurações
│   │   ├── asaas-config.ts   # Configuração do Asaas
│   │   ├── auth-config.ts    # Configuração de autenticação
│   │   ├── aws-config.ts     # Configuração da AWS
│   │   ├── subscription-service.ts # Serviços de assinatura
│   │   └── tenant-utils.ts   # Utilitários de multi-tenancy
│   └── middleware.ts     # Middleware do Next.js
├── .env.example          # Exemplo de variáveis de ambiente
├── .gitignore            # Arquivos ignorados pelo Git
├── next.config.js        # Configuração do Next.js
├── package.json          # Dependências e scripts
├── tailwind.config.js    # Configuração do Tailwind CSS
└── tsconfig.json         # Configuração do TypeScript
```

## Fluxos Principais

### Autenticação

O sistema de autenticação utiliza NextAuth.js integrado com AWS Cognito e inclui:

- Registro de novos usuários
- Login com email e senha
- Recuperação de senha
- Confirmação de conta
- Middleware para proteção de rotas

### Assinaturas

O sistema de assinaturas é gerenciado pelo Asaas e inclui:

- Criação de assinatura para novos usuários
- Período de avaliação gratuito
- Múltiplos planos de assinatura
- Atualização de plano
- Cancelamento de assinatura

## Implantação

### Opção 1: Vercel

A maneira mais fácil de implantar sua aplicação Next.js é usar a [Plataforma Vercel](https://vercel.com/new).

1. Faça o push do seu repositório para o GitHub, GitLab ou Bitbucket
2. Importe o projeto na Vercel
3. Configure as variáveis de ambiente
4. Clique em "Deploy"

### Opção 2: AWS Amplify

Você também pode implantar o projeto usando AWS Amplify:

1. Crie um novo app no AWS Amplify Console
2. Conecte seu repositório Git
3. Configure as variáveis de ambiente
4. Inicie a implantação

## Contribuições

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).

## Suporte

Para suporte, entre em contato conosco pelo email suporte@exemplo.com ou abra uma issue no GitHub.
