# Análise e Modelagem de Dados DynamoDB para o Trimobe

## Introdução

Este documento apresenta uma análise detalhada da arquitetura de dados proposta para o sistema Trimobe, utilizando uma abordagem híbrida de modelagem no DynamoDB. A solução combina a estrutura existente do boilerplate (tabelas `Users` e `Tenants`) com uma nova tabela única para os dados específicos da aplicação, otimizando tanto para compatibilidade quanto para desempenho.

## Análise da Arquitetura Híbrida

### Contexto da Solução

O Trimobe é um Micro SaaS voltado para profissionais do agronegócio que trabalham com crédito rural no Brasil. O sistema precisa suportar:

1. Interface conversacional com inteligência artificial especializada
2. Processamento e análise de documentos
3. Geração de contratos e relatórios financeiros
4. Armazenamento e recuperação de conversas e arquivos

Esta arquitetura híbrida visa preservar os componentes existentes de autenticação e gestão multi-tenant do boilerplate, enquanto implementa uma modelagem eficiente para os requisitos específicos da aplicação.

### Fundamentação Técnica

A decisão de utilizar uma abordagem híbrida baseia-se em princípios consolidados de engenharia de dados e nas melhores práticas atuais para DynamoDB:

#### 1. Princípio "Acessados Juntos, Armazenados Juntos"

Segundo a própria AWS: "Items that are accessed together should be stored together." Este princípio orienta que dados frequentemente acessados em conjunto devem ser armazenados na mesma tabela, permitindo consultas mais eficientes.

#### 2. Balanceamento entre Complexidade e Desempenho

A abordagem híbrida equilibra o desejo de otimização de desempenho (favorecido pelo design de tabela única) com a necessidade de manter a compatibilidade com o código existente e limitar a complexidade de implementação.

#### 3. Adaptação ao Padrão de Acesso

Como destaca Alex DeBrie, especialista em DynamoDB: "A modelagem eficiente foca nos padrões de acesso primeiro e depois projeta as chaves primárias para atender a esses padrões." Nossa modelagem segue este princípio, otimizando para os padrões de acesso específicos do Trimobe.

## Modelo de Dados Proposto

A arquitetura de dados do Trimobe será composta por três tabelas principais:

### 1. Tabela `Tenants` (Existente)

Responsável pelo armazenamento de informações organizacionais e configurações multi-tenant.

**Estrutura de Chaves:**
- PK: `TENANT#<tenantId>`
- SK: `METADATA#1`

**Atributos Principais:**
- `id`: UUID único da organização
- `name`: Nome da organização
- `status`: Estado (ACTIVE, SUSPENDED)
- `settings`: Configurações específicas (plano, recursos, etc.)
- `createdAt` e `updatedAt`: Timestamps para auditoria

### 2. Tabela `Users` (Existente)

Gerencia usuários e autenticação no contexto multi-tenant.

**Estrutura de Chaves:**
- PK: `TENANT#<tenantId>`
- SK: `USER#<cognitoId>`
- GSI1PK: `USER#<cognitoId>`
- GSI1SK: `TENANT#<tenantId>`

**Atributos Principais:**
- `tenantId`: Referência ao tenant
- `cognitoId`: ID do usuário no Cognito
- `email`: Email do usuário (único)
- `name`: Nome do usuário
- `role`: Função no sistema (ADMIN, USER)
- `status`: Estado da conta
- `createdAt` e `updatedAt`: Timestamps para auditoria

### 3. Tabela `RuralCreditAI` (Nova)

Tabela única para todos os dados específicos da aplicação, utilizando design de single-table para otimização de acesso.

**Estrutura de Chaves:**
- PK (Partition Key): Identificador principal da entidade
- SK (Sort Key): Discriminador/ordenador de entidades
- GSI1: Índice para consultas por usuário
- GSI2: Índice para consultas por tipo e timestamp

**Entidades Armazenadas:**

#### 3.1. Conversas

**Chaves:**
- PK: `TENANT#<tenantId>`
- SK: `CONVERSATION#<conversationId>`
- GSI1PK: `USER#<userId>`
- GSI1SK: `CONVERSATION#<timestamp>`
- GSI2PK: `TENANT#<tenantId>#CONVERSATION`
- GSI2SK: `<timestamp>`

**Atributos:**
- `id`: UUID da conversa
- `tenantId`: ID do tenant
- `userId`: ID do usuário
- `title`: Título gerado ou personalizado
- `summary`: Resumo da conversa
- `status`: Estado (ACTIVE, ARCHIVED)
- `lastMessageAt`: Timestamp da última interação
- `createdAt` e `updatedAt`: Timestamps para auditoria

#### 3.2. Mensagens

**Chaves:**
- PK: `CONVERSATION#<conversationId>`
- SK: `MESSAGE#<timestamp>`
- GSI1PK: `TENANT#<tenantId>`
- GSI1SK: `CONVERSATION#<conversationId>#<timestamp>`

**Atributos:**
- `id`: UUID da mensagem
- `tenantId`: ID do tenant
- `conversationId`: ID da conversa
- `role`: Origem (USER, ASSISTANT)
- `content`: Conteúdo da mensagem
- `attachments`: Lista de IDs de arquivos anexados
- `createdAt`: Timestamp de criação

#### 3.3. Arquivos

**Chaves:**
- PK: `TENANT#<tenantId>`
- SK: `FILE#<fileId>`
- GSI1PK: `CONVERSATION#<conversationId>` 
- GSI1SK: `FILE#<timestamp>`
- GSI2PK: `USER#<userId>`
- GSI2SK: `FILE#<timestamp>`

**Atributos:**
- `id`: UUID do arquivo
- `tenantId`: ID do tenant
- `conversationId`: ID da conversa relacionada (opcional)
- `messageId`: ID da mensagem relacionada (opcional)
- `userId`: ID do usuário proprietário
- `name`: Nome original do arquivo
- `type`: Tipo MIME
- `size`: Tamanho em bytes
- `s3Key`: Chave para acesso no S3
- `status`: Estado (PROCESSING, READY, ERROR)
- `analysis`: Resultado da análise (objeto JSON)
- `createdAt` e `updatedAt`: Timestamps para auditoria

#### 3.4. Documentos Gerados

**Chaves:**
- PK: `TENANT#<tenantId>`
- SK: `DOCUMENT#<documentId>`
- GSI1PK: `CONVERSATION#<conversationId>`
- GSI1SK: `DOCUMENT#<timestamp>`
- GSI2PK: `USER#<userId>`
- GSI2SK: `DOCUMENT#<timestamp>`

**Atributos:**
- `id`: UUID do documento
- `tenantId`: ID do tenant
- `conversationId`: ID da conversa relacionada
- `messageId`: ID da mensagem relacionada
- `userId`: ID do usuário proprietário
- `type`: Tipo de documento (CONTRACT, SIMULATION, REPORT)
- `title`: Título do documento
- `description`: Descrição breve
- `s3Key`: Chave para acesso no S3
- `metadata`: Dados específicos do tipo de documento (JSON)
- `createdAt` e `updatedAt`: Timestamps para auditoria

## Análise Técnica da Abordagem Híbrida

### 1. Impacto na Latência

#### Aspectos Positivos:
- **Consultas Otimizadas**: A modelagem da tabela `AgroCredit` permite recuperar todas as mensagens de uma conversa com uma única operação Query, reduzindo latência.
- **Consultas Paralelas Eficientes**: Quando necessário acessar dados de diferentes tabelas, as operações podem ser executadas em paralelo, não serialmente.
- **Localidade de Dados**: Entidades relacionadas (ex: mensagens de uma conversa) são armazenadas fisicamente próximas, aumentando a eficiência de acesso.

#### Potenciais Desafios:
- **Joins Lógicos**: Relações entre `Users` e entidades da tabela `AgroCredit` exigirão joins lógicos na aplicação, mas estes são limitados a cenários específicos e bem definidos.
- **Impacto Controlado**: Como a maioria das operações intensivas (histórico de conversas, anexos) está na mesma tabela, o impacto da separação é minimizado.

### 2. Consumo de RCUs e WCUs (Capacidade de Leitura/Escrita)

#### Vantagens:
- **Eficiência em Leituras Relacionadas**: Recuperar uma conversa e todas suas mensagens numa única consulta consome menos RCUs do que múltiplas operações em tabelas separadas.
- **Otimização de Custos em Atualizações**: Atualizar um campo pequeno em uma entidade grande (ex: status de uma conversa) é mais eficiente quando modelado separadamente.
- **Balanceamento de Carga**: A separação entre tabelas de autenticação (`Users`/`Tenants`) e dados da aplicação (`AgroCredit`) distribui melhor a carga de leitura/escrita.

#### Considerações de Consumo:
- **Granularidade de Provisão**: Capacidade pode ser alocada separadamente para cada tabela conforme seus padrões de uso
- **Hot Partitions**: A modelagem por tenant e por conversa evita concentração de tráfego em partições específicas
- **Previsibilidade de Custos**: Separação clara entre operações de autenticação e operações de aplicação

### 3. Índices e Estratégias de Acesso

#### Índices Estratégicos:
- **GSI1 para Consultas por Usuário**: Permite listar todas as conversas, arquivos e documentos de um usuário de forma eficiente
- **GSI2 para Consultas por Tipo e Data**: Possibilita listagens cronológicas por tipo de entidade dentro de um tenant

#### Eficiência dos Padrões de Acesso:
1. **Fluxo de Autenticação**:
   - Acesso direto à tabela `Users` usando índices existentes
   - Sem necessidade de joins complexos para autorização básica

2. **Fluxo de Conversas**:
   - Listar conversas de um usuário: Query único em GSI1
   - Obter detalhes da conversa + mensagens: Query único na tabela principal
   - Excelente eficiência para o caso de uso principal da aplicação

3. **Fluxo de Documentos/Arquivos**:
   - Recuperar arquivos de uma conversa: Query único em GSI1
   - Listar todos os documentos de um usuário: Query único em GSI2
   - Balanceamento adequado entre flexibilidade e eficiência

### 4. Considerações de Engenharia

#### Boas Práticas Implementadas:
- **Modelagem Dirigida por Acesso**: Design baseado nos padrões de acesso, não na estrutura dos dados
- **Isolamento por Tenant**: Todas as entidades contêm `tenantId` para garantir isolamento multi-tenant
- **Chaves Compostas Inteligentes**: Uso de prefixos e discriminadores nas chaves para organização eficiente
- **Estratégia de GSI Otimizada**: Índices focados nos principais casos de uso, evitando multiplicação desnecessária
- **Estrutura Evolutiva**: Modelagem flexível para acomodar evoluções futuras

#### Mitigação de Complexidade:
- **Camada de Abstração**: Implementação de repositórios que abstraem a complexidade do acesso aos dados
- **Consistência de Nomenclatura**: Padrões padronizados de nomeação de chaves entre todas as entidades
- **Documentação Clara**: Modelagem bem documentada para orientar o desenvolvimento

### 5. Escalabilidade e Evolução

#### Capacidade de Escala:
- **Particionamento Eficiente**: A distribuição de entidades por tenant e por conversa garante distribuição eficiente dos dados
- **Crescimento Proporcional**: À medida que o número de tenants cresce, as partições se distribuem naturalmente
- **Evitação de Hotspots**: Chaves de partição diversificadas evitam sobrecarga em partições específicas

#### Caminhos de Evolução:
- **Adição de Tipos de Entidade**: Nova entidade pode ser facilmente adicionada à tabela `AgroCredit` sem alterações estruturais
- **Refinamento de Índices**: Novos índices podem ser adicionados para otimizar padrões de acesso emergentes
- **Caminho para Single-Table Completa**: Se necessário no futuro, a migração para uma abordagem completamente single-table é viável

## Conclusão

A abordagem híbrida proposta equilibra pragmatismo e otimização técnica. Ao manter as tabelas existentes (`Users` e `Tenants`) e adicionar uma tabela única bem modelada para os dados específicos da aplicação, conseguimos:

1. **Minimizar o Impacto no Código Existente**: A estrutura de autenticação e gestão de tenants permanece intacta
2. **Otimizar para Padrões de Acesso Críticos**: Os principais fluxos de uso do sistema são atendidos por operações eficientes
3. **Manter Flexibilidade para Evolução**: A modelagem permite expansão e refinamento à medida que o sistema cresce
4. **Balancear Complexidade e Desempenho**: Comprometimento adequado entre purismo técnico e pragmatismo de implementação

A implementação desta modelagem híbrida proporciona um equilíbrio sólido entre a teoria ideal do design de tabela única e as necessidades práticas de desenvolvimento, oferecendo uma base sólida para o MVP do AgroCredit AI com espaço para crescimento.

## Referências

1. AWS Documentation. "Best practices for DynamoDB table design." Amazon DynamoDB Developer Guide.
2. DeBrie, Alex. "Single-table vs. multi-table design in Amazon DynamoDB." AWS Database Blog.
3. Serverless Land. "Data modeling foundations in DynamoDB." AWS Serverless Resources.
4. AWS re:Invent 2023. "Advanced design patterns for Amazon DynamoDB." Conference Session DAT328.
5. Dynamoose Documentation. "Schema Design Patterns." v3.0.
