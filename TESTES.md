# Metodologia de Testes no Boilerplate

Este documento descreve a abordagem de testes adotada neste boilerplate SaaS, explicando os diferentes tipos de testes implementados e como executá-los.

## Visão Geral

A estratégia de testes do projeto é focada em:

1. **Testes de Unidade**: Para hooks e funções utilitárias
2. **Testes de Componentes**: Para componentes UI isolados  
3. **Testes de Integração**: Para fluxos completos da aplicação

## Estrutura de Testes

Os testes estão organizados no diretório `__tests__`, seguindo uma estrutura que espelha a do código-fonte:

```
__tests__/
  ├── hooks/              # Testes para hooks customizados
  ├── components/         # Testes para componentes UI
  │   └── ui/             # Testes para componentes de UI básicos
  └── integration/        # Testes de integração de fluxos completos
```

## Ferramentas Utilizadas

- **Vitest**: Framework de testes principal, escolhido pela sua velocidade e compatibilidade com Vite
- **Testing Library**: Para testes de componentes React
- **JSDOM**: Para simular o ambiente do navegador

## Como Executar os Testes

### Executando Todos os Testes

```bash
npm test
```

### Executando Testes Específicos

```bash
# Testes de uma categoria
npm test -- __tests__/hooks

# Teste específico
npm test -- __tests__/hooks/use-loading-state.test.tsx
```

## Hooks Testados

Os seguintes hooks personalizados foram testados:

### useLoadingState

Hook para gerenciar estados de carregamento em componentes. Testado para verificar:

- Inicialização correta dos estados
- Ativação/desativação de estados de carregamento
- Gerenciamento de múltiplos estados simultâneos
- Execução de funções com tratamento automático de loading

### useSuspenseQuery

Hook para busca de dados com suporte a Suspense. Testado para verificar:

- Carregamento e exibição de dados com sucesso
- Tratamento adequado de erros
- Funcionalidade de refetch (recarregamento de dados)
- Funcionalidade de cache

### useSubscription

Hook para gerenciar o estado da assinatura do usuário. Testado para verificar:

- Carregamento inicial dos dados da assinatura
- Atualização de dados via eventos
- Tratamento de erros na busca de dados

## Componentes Testados

Os seguintes componentes foram testados:

### Componentes de Carregamento

- **Loading**: Indicadores de carregamento
- **Skeletons**: Esqueletos de conteúdo para carregamento
- **LoadingBoundary**: Componente para gerenciar fronteiras de Suspense

### Componentes de UI

- **LazyComponent**: Componente para carregamento lazy

## Considerações sobre Testes com React Suspense

Testes de componentes que utilizam React Suspense podem ser desafiadores devido à natureza assíncrona do Suspense e à forma como ele interage com o React Testing Library. Para esses casos, recomendamos:

1. Testar os hooks subjacentes isoladamente
2. Usar mocks para simular o comportamento do Suspense
3. Focar em testes de integração para os fluxos completos

## Práticas Recomendadas para Novos Testes

Ao adicionar novos testes:

1. Isole bem as unidades de teste
2. Use mocks para dependências externas
3. Teste estados extremos (loading, erro, sucesso)
4. Evite testes acoplados à implementação
5. Foque em comportamento, não em detalhes de implementação

## Evolução Futura

A estratégia de testes deve evoluir para incluir:

1. Testes e2e com Cypress ou Playwright
2. Testes de performance
3. Testes de acessibilidade
