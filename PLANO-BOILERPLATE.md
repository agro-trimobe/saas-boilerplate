# Plano de Trabalho para Criação do Boilerplate

## Análise do Projeto Atual

Após analisar o projeto, identificamos que ele é uma aplicação completa de gerenciamento para crédito rural (Trimobe) com as seguintes características técnicas:

- **Framework**: Next.js 15.1.3 com App Router
- **Linguagem**: TypeScript
- **UI/UX**: Tailwind CSS + Shadcn/UI (componentes)
- **Autenticação**: AWS Cognito
- **Banco de Dados**: AWS DynamoDB
- **Pagamentos**: Integração com API Asaas
- **Infraestrutura**: Multi-tenant

## Objetivo do Boilerplate

Criar um boilerplate limpo e reutilizável que contenha apenas:
1. Landing Page
2. Cadastro e autenticação de usuários
3. Integração com Asaas para assinatura e pagamento

## Plano de Trabalho Detalhado

### 1. Preparação e Limpeza da Base

1. **Criar um novo repositório** baseado no código atual
   - Fazer uma cópia inicial do projeto atual
   - Configurar o .gitignore adequadamente

2. **Remover módulos não essenciais**
   - Remover todos os módulos específicos do negócio (clientes, projetos, propriedades, etc.)
   - Remover componentes não utilizados pelas funcionalidades principais
   - Manter apenas os componentes UI essenciais do Shadcn

3. **Simplificar estrutura de diretórios**
   - Manter apenas as pastas essenciais (app, components, lib, styles, types)
   - Remover rotas não necessárias

### 2. Landing Page

1. **Simplificar a página inicial**
   - Manter a estrutura básica da landing page (src/app/page.tsx)
   - Remover conteúdo específico do CRM rural
   - Criar uma landing page genérica com:
     * Header com navegação
     * Seção hero com call-to-action para cadastro
     * Seção de recursos/benefícios
     * Seção de planos/preços
     * Seção de FAQ
     * Footer

2. **Adaptar componentes visuais**
   - Simplificar componentes mantendo apenas o necessário
   - Manter componentes reutilizáveis (cards, botões, etc.)

### 3. Sistema de Autenticação

1. **Manter estrutura de autenticação**
   - Preservar diretórios `/app/auth/` e `/app/api/auth/`
   - Manter integração com AWS Cognito
   - Manter middleware de autenticação (simplificado)

2. **Simplificar fluxos de autenticação**
   - Manter páginas de login, registro e recuperação de senha
   - Limpar código redundante
   - Manter configuração do NextAuth.js
   - Limpar verificações específicas do sistema atual

3. **Refatorar middleware.ts**
   - Simplificar para focar apenas em autenticação
   - Remover lógica específica do negócio (verificações de assinatura complexas)

### 4. Sistema de Assinaturas com Asaas

1. **Manter integração com Asaas**
   - Preservar `/lib/asaas-config.ts`
   - Preservar `/lib/subscription-service.ts` (simplificado)
   - Manter rotas de API para integração com Asaas

2. **Simplificar fluxo de assinatura**
   - Manter apenas funcionalidades essenciais:
     * Criação de cliente no Asaas
     * Criação de assinatura
     * Verificação de status
     * Cancelamento

3. **Limpar estrutura de banco de dados**
   - Simplificar esquema para armazenar apenas dados essenciais do usuário e assinatura
   - Manter funções essenciais do DynamoDB ou opcionalmente substituir por alternativa mais simples

### 5. Configuração e Documentação

1. **Criar arquivo de variáveis de ambiente de exemplo**
   - Documentar todas as variáveis necessárias
   - Criar um `.env.example` completo

2. **Atualizar o README.md**
   - Documentar propósito do boilerplate
   - Explicar requisitos (AWS, Asaas)
   - Detalhar como configurar o ambiente
   - Explicar estrutura do projeto
   - Fornecer instruções para implantação

3. **Criar documentação de componentes**
   - Documentar componentes reutilizáveis
   - Criar exemplos de uso

### 6. Refatoração e Otimização

1. **Simplificar gerenciamento de estado**
   - Remover estados complexos relacionados ao CRM
   - Manter apenas o essencial para autenticação e assinatura

2. **Otimizar carregamento**
   - Implementar carregamento otimizado de componentes
   - Garantir boa experiência de usuário

3. **Testes**
   - Implementar testes básicos para fluxos principais
   - Garantir que o fluxo completo funcione corretamente

### 7. Implementação Multi-tenant Simplificada

1. **Simplificar a estrutura multi-tenant**
   - Manter apenas o essencial para separação de dados por inquilino
   - Simplificar funções relacionadas em `tenant-utils.ts`

2. **Configuração AWS simplificada**
   - Documentar requisitos mínimos para AWS Cognito e DynamoDB
   - Criar instruções claras para configuração

## Arquivos Principais a Manter

1. **Autenticação**
   - `src/app/auth/login/page.tsx`
   - `src/app/auth/register/route.ts`
   - `src/app/api/auth/[...nextauth]/route.ts`
   - `src/app/api/auth/auth-options.ts`

2. **Assinatura**
   - `src/lib/asaas-config.ts`
   - `src/lib/subscription-service.ts` (simplificado)
   - `src/app/api/subscription/route.ts`

3. **UI Base**
   - `src/app/page.tsx` (landing page simplificada)
   - `src/components/ui/` (componentes essenciais do Shadcn)
   - `src/app/dashboard/page.tsx` (simplificada)

4. **Core**
   - `src/lib/aws-config.ts` (simplificado)
   - `src/lib/tenant-utils.ts` (simplificado)
   - `src/middleware.ts` (simplificado)

## Cronograma Estimado

1. **Fase 1: Preparação e Limpeza** - 2 dias
2. **Fase 2: Landing Page** - 2 dias
3. **Fase 3: Sistema de Autenticação** - 3 dias
4. **Fase 4: Integração com Asaas** - 3 dias
5. **Fase 5: Configuração e Documentação** - 2 dias
6. **Fase 6: Refatoração e Otimização** - 3 dias
7. **Fase 7: Multi-tenant Simplificado** - 2 dias

**Tempo total estimado:** 17 dias úteis

## Considerações Técnicas

1. **Arquitetura simplificada**: Manter a arquitetura básica do Next.js App Router, mas remover complexidades desnecessárias
2. **Segurança**: Preservar boas práticas de segurança para autenticação e pagamentos
3. **Tipagem forte**: Manter TypeScript em todo o projeto para garantir robustez
4. **Escalabilidade**: Manter uma estrutura que permita fácil expansão para novos recursos
