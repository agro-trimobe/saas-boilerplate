# Configuração das Variáveis de Ambiente

Este documento explica como configurar corretamente as variáveis de ambiente necessárias para o funcionamento do sistema.

## Arquivo `.env.local`

O sistema utiliza um arquivo `.env.local` na raiz do projeto para armazenar variáveis de ambiente sensíveis, como chaves de API. Este arquivo não é versionado no Git por questões de segurança.

### Configuração da API do Asaas

Para que a integração com o Asaas funcione corretamente, é necessário configurar as seguintes variáveis:

```
# URL da API do Asaas (Sandbox ou Produção)
ASAAS_API_URL=https://api-sandbox.asaas.com/v3

# Chave de API do Asaas (obrigatória)
ASAAS_API_KEY=sua_chave_api_aqui_sem_aspas

# Valores dos planos
ASAAS_SUBSCRIPTION_BASIC_VALUE=57.00
ASAAS_SUBSCRIPTION_PREMIUM_VALUE=87.00

# Dias de período de teste
ASAAS_TRIAL_PERIOD_DAYS=14
```

### Atenção

- A variável `ASAAS_API_KEY` deve ser configurada com a chave fornecida pelo painel do Asaas
- Não use aspas na chave
- Não deixe espaços antes ou depois da chave
- Certifique-se de que a chave esteja correta e completa

### Erro 401 (Não Autorizado)

Se você estiver enfrentando erros 401 ao tentar fazer requisições para a API do Asaas, verifique:

1. Se a chave foi configurada corretamente no arquivo `.env.local`
2. Se a chave é válida e está ativa no painel do Asaas
3. Se você está usando a URL correta (sandbox ou produção) de acordo com a chave

## Como configurar o arquivo

1. Crie um arquivo chamado `.env.local` na raiz do projeto (mesmo nível do `package.json`)
2. Adicione as variáveis mencionadas acima com seus valores corretos
3. Reinicie o servidor de desenvolvimento para que as variáveis sejam carregadas

## Testando a configuração

Após configurar o arquivo `.env.local`, você pode verificar se as variáveis estão sendo carregadas corretamente acessando a página `/dashboard`.
