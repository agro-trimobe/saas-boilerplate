This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Configuração do Ambiente de Testes (Asaas Sandbox)

### 1. Criar Conta Sandbox
1. Acesse [https://sandbox.asaas.com](https://sandbox.asaas.com)
2. Crie uma nova conta seguindo o processo normal
3. As contas são aprovadas automaticamente no sandbox
4. Você pode enviar qualquer imagem como documento

### 2. Obter Chave de API
1. Após criar a conta, acesse o painel do sandbox
2. Vá em "Configurações" > "Integrações"
3. Gere uma nova chave de API
4. Adicione as configurações ao arquivo `.env.local`:
```
# Obrigatório - Chave de API do Asaas
# IMPORTANTE: Se sua chave começar com $, use aspas simples para evitar problemas
ASAAS_API_KEY='sua_chave_sandbox_aqui'

# Opcional - URL base da API (caso não definida, usa URL padrão do ambiente)
ASAAS_API_URL=https://api-sandbox.asaas.com/v3
```

### 3. Cartões de Teste
- Aprovado: 5162306219378829
- Recusado: 5162306219378828
- Timeout: 5162306219378827

Todos os cartões de teste usam:
- Validade: 05/2025
- CCV: 318
- Nome: TEST CREDIT CARD

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
