# Plano de Trabalho Técnico - AgroCredit (Trimobe)

Este documento apresenta o planejamento detalhado e sequencial para o desenvolvimento do Trimobe (AgroCredit), um Micro SaaS de assistência inteligente para profissionais do setor de crédito rural no Brasil. O plano contém detalhes técnicos específicos para cada etapa de implementação.

## Fase 1: Preparação do Ambiente (1 semana)

### 1.1. Configuração do Ambiente de Desenvolvimento (2 dias)
- [ ] **Configurar repositório Git para controle de versão**
  - Criar branches principais: `main` (produção) e `develop` (desenvolvimento)
  - Criar arquivo `.gitignore` incluindo: `.env*`, `node_modules/`, `.next/`, `coverage/`, `dist/`
  - Comando: `git init && git branch -M main && git branch develop && git checkout develop`

- [ ] **Revisar estrutura do boilerplate e dependências atuais**
  - Analisar diretórios principais: `/src`, `/public`, `/components`, `/pages` ou `/app`
  - Verificar se está usando Pages Router ou App Router do Next.js
  - Listar dependências principais e suas versões em `package.json`
  - Atualizar dependências críticas para últimas versões estáveis:
    ```bash
    npm outdated
    npm update
    ```
  - Documentar componentes reutilizáveis existentes para o sistema de chat

- [ ] **Configurar variáveis de ambiente (.env)**
  - Criar arquivo base `.env.example` com todas as variáveis necessárias (sem valores reais)
  - Criar configurações específicas para ambientes:
    - `.env.local` - desenvolvimento local
    - `.env.development` - ambiente de desenvolvimento
    - `.env.staging` - ambiente de homologação
    - `.env.production` - ambiente de produção
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
  - Variáveis Pinecone requeridas:
    ```
    PINECONE_API_KEY=
    PINECONE_ENVIRONMENT=
    PINECONE_INDEX_NAME=rural-credit-knowledge
    ```
  - Variáveis Asaas (pagamentos):
    ```
    ASAAS_API_KEY=
    ASAAS_API_URL=https://sandbox.asaas.com/api/v3/
    ASAAS_ACCESS_TOKEN=
    ```

- [ ] **Configurar IDE e ferramentas de desenvolvimento**
  - Configurar ESLint para TypeScript e React:
    ```bash
    npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks
    ```
  - Criar arquivo `.eslintrc.js` com regras para projeto específico
  - Configurar Prettier para formatação consistente:
    ```bash
    npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
    ```
  - Criar arquivo `.prettierrc` com regras de formatação
  - Configurar husky para pre-commit hooks:
    ```bash
    npm install --save-dev husky lint-staged
    npx husky install
    npx husky add .husky/pre-commit "npx lint-staged"
    ```
  - Adicionar em `package.json`:
    ```json
    "lint-staged": {
      "*.{js,jsx,ts,tsx}": ["eslint --fix"],
      "*.{json,css,md}": ["prettier --write"]
    }
    ```

### 1.2. Configuração dos Serviços AWS (3 dias)
- [ ] **Criar conta/configurar AWS (ou usar existente)**
  - Criar usuário IAM para desenvolvimento com permissões:
    - AmazonDynamoDBFullAccess
    - AmazonS3FullAccess
    - AmazonCognitoFullAccess
    - AmazonBedrockFullAccess
  - Configurar MFA para todos os usuários administrativos
  - Criar arquivo de configuração AWS CLI local:
    ```bash
    aws configure
    ```
  - Testar acesso com comando básico:
    ```bash
    aws s3 ls
    aws dynamodb list-tables
    ```

- [ ] **Configurar DynamoDB com as tabelas necessárias**
  - **Verificar tabelas existentes (Users, Tenants)**
    - Listar tabelas existentes: `aws dynamodb list-tables`
    - Analisar esquema de tabelas existentes:
      ```bash
      aws dynamodb describe-table --table-name Users
      aws dynamodb describe-table --table-name Tenants
      ```
  - **Criar tabela AgroCredit conforme modelagem**
    - Implementar script de criação de tabelas:
      ```typescript
      // scripts/create-tables.ts
      import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
      import { DynamoDBDocumentClient, CreateTableCommand } from "@aws-sdk/lib-dynamodb";
      
      const client = new DynamoDBClient({ region: process.env.AWS_REGION });
      const docClient = DynamoDBDocumentClient.from(client);
      
      // Tabela Conversations
      const createConversationsTable = async () => {
        const command = new CreateTableCommand({
          TableName: `${process.env.DYNAMODB_TABLE_PREFIX}Conversations`,
          KeySchema: [
            { AttributeName: "tenantId", KeyType: "HASH" },
            { AttributeName: "conversationId", KeyType: "RANGE" }
          ],
          AttributeDefinitions: [
            { AttributeName: "tenantId", AttributeType: "S" },
            { AttributeName: "conversationId", AttributeType: "S" },
            { AttributeName: "createdAt", AttributeType: "S" },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: "byCreatedAt",
              KeySchema: [
                { AttributeName: "tenantId", KeyType: "HASH" },
                { AttributeName: "createdAt", KeyType: "RANGE" }
              ],
              Projection: { ProjectionType: "ALL" },
              ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
            }
          ],
          BillingMode: "PAY_PER_REQUEST"
        });
        return docClient.send(command);
      };
      
      // Executar criação das tabelas
      async function main() {
        try {
          await createConversationsTable();
          // Adicionar outras tabelas: Messages, Documents, etc.
          console.log("Tabelas criadas com sucesso!");
        } catch (error) {
          console.error("Erro ao criar tabelas:", error);
        }
      }
      
      main();
      ```
    - Criar tabelas principais:
      - `{prefix}Conversations`: conversas dos usuários
      - `{prefix}Messages`: mensagens individuais
      - `{prefix}Documents`: documentos enviados/processados
      - `{prefix}Contracts`: contratos gerados
      - `{prefix}SimulationResults`: resultados de simulações financeiras
    - Configurar índices GSI para consultas eficientes por data, tipo e status

- [ ] **Configurar bucket S3 com a estrutura definida**
  - **Criar bucket `rural-credit-ai-app-files`**
    ```bash
    aws s3api create-bucket --bucket rural-credit-ai-app-files --region us-east-1
    ```
  - **Definir políticas de acesso e lifecycle**
    - Criar arquivo de política de bucket `bucket-policy.json`:
      ```json
      {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": {
              "AWS": "arn:aws:iam::ACCOUNT_ID:role/authenticated-user-role"
            },
            "Action": [
              "s3:GetObject",
              "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::rural-credit-ai-app-files/tenants/${cognito:sub}/*"
          }
        ]
      }
      ```
    - Aplicar política:
      ```bash
      aws s3api put-bucket-policy --bucket rural-credit-ai-app-files --policy file://bucket-policy.json
      ```
    - Configurar CORS para o bucket:
      ```bash
      aws s3api put-bucket-cors --bucket rural-credit-ai-app-files --cors-configuration file://cors.json
      ```
    - Criar regras de lifecycle para arquivos temporários (expiração em 7 dias)
  - Criar estrutura de pastas inicial:
    ```bash
    # Script para criar estrutura de pastas
    aws s3api put-object --bucket rural-credit-ai-app-files --key tenants/
    aws s3api put-object --bucket rural-credit-ai-app-files --key system/templates/
    aws s3api put-object --bucket rural-credit-ai-app-files --key system/templates/contracts/
    ```

- [ ] **Configurar AWS Cognito para autenticação**
  - Criar User Pool para autenticação:
    ```bash
    aws cognito-idp create-user-pool --pool-name AgroCreditUserPool --auto-verify-attributes email --schema Name=tenantId,AttributeDataType=String,Mutable=true
    ```
  - Configurar Client App:
    ```bash
    aws cognito-idp create-user-pool-client --user-pool-id YOUR_USER_POOL_ID --client-name AgroCreditClient --generate-secret --allowed-o-auth-flows implicit --allowed-o-auth-scopes openid --callback-urls https://localhost:3000/api/auth/callback
    ```
  - Criar Identity Pool para acesso a recursos AWS:
    ```bash
    aws cognito-identity create-identity-pool --identity-pool-name AgroCreditIdentityPool --allow-unauthenticated-identities --cognito-identity-providers ProviderName=cognito-idp.us-east-1.amazonaws.com/YOUR_USER_POOL_ID,ClientId=YOUR_CLIENT_ID
    ```
  - Implementar classe de autenticação em `/src/lib/auth.ts`:
    ```typescript
    import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
    
    export class AuthService {
      private client: CognitoIdentityProviderClient;
      
      constructor() {
        this.client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
      }
      
      async login(username: string, password: string) {
        const command = new InitiateAuthCommand({
          AuthFlow: "USER_PASSWORD_AUTH",
          ClientId: process.env.AWS_COGNITO_CLIENT_ID!,
          AuthParameters: {
            USERNAME: username,
            PASSWORD: password
          }
        });
        
        try {
          const response = await this.client.send(command);
          return response.AuthenticationResult;
        } catch (error) {
          console.error("Erro no login:", error);
          throw error;
        }
      }
      
      // Adicionar métodos para signup, confirmarConta, resetarSenha, etc.
    }
    ```

- [ ] **Preparar integração com AWS Bedrock**
  - Solicitar acesso aos modelos no console AWS
  - Configurar permissões IAM para Bedrock
  - Criar classe helper em `/src/lib/bedrock.ts`:
    ```typescript
    import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
    
    export class BedrockService {
      private client: BedrockRuntimeClient;
      private modelId: string;
      
      constructor() {
        this.client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
        this.modelId = process.env.AWS_BEDROCK_MODEL_ID || "anthropic.claude-3-sonnet-20240229-v1:0";
      }
      
      async generateResponse(prompt: string, system?: string) {
        const input = {
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 4000,
          temperature: 0.7,
          system: system || "Você é um assistente especialista em crédito rural no Brasil.",
          messages: [
            { role: "user", content: prompt }
          ]
        };
        
        const command = new InvokeModelCommand({
          modelId: this.modelId,
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify(input)
        });
        
        try {
          const response = await this.client.send(command);
          const responseBody = JSON.parse(new TextDecoder().decode(response.body));
          return responseBody.content[0].text;
        } catch (error) {
          console.error("Erro ao chamar Bedrock:", error);
          throw error;
        }
      }
    }
    ```
  - Implementar função de teste para verificar acesso:
    ```typescript
    // scripts/test-bedrock.ts
    import { BedrockService } from "../src/lib/bedrock";
    
    async function testBedrock() {
      const service = new BedrockService();
      try {
        const response = await service.generateResponse("O que é crédito rural?");
        console.log("Resposta:", response);
      } catch (error) {
        console.error("Erro no teste:", error);
      }
    }
    
    testBedrock();
    ```

### 1.3. Configuração do Pinecone (2 dias)
- [ ] **Criar conta no Pinecone (ou usar existente)**
  - Acessar https://app.pinecone.io/ e criar conta
  - Escolher plano Starter (gratuito) para desenvolvimento inicial
  - Gerar API Key e armazenar em variáveis de ambiente

- [ ] **Configurar índice vetorial para conhecimento especializado**
  - Acessar console Pinecone e criar índice `rural-credit-knowledge`
  - Configurar parâmetros do índice:
    - Dimensão: 1536 (para compatibilidade com modelos de embedding da OpenAI/AWS)
    - Métrica: cosine (para similaridade semântica)
    - Tipo de pod: starter (para desenvolvimento)
  - Desenvolver script de inicialização de índices:
    ```typescript
    // scripts/setup-pinecone.ts
    import { Pinecone } from '@pinecone-database/pinecone';
    
    async function setupPinecone() {
      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
        environment: process.env.PINECONE_ENVIRONMENT!,
      });
      
      // Verificar se o índice já existe
      const indexes = await pinecone.listIndexes();
      const indexExists = indexes.some(index => index.name === process.env.PINECONE_INDEX_NAME);
      
      if (!indexExists) {
        console.log(`Criando índice: ${process.env.PINECONE_INDEX_NAME}`);
        await pinecone.createIndex({
          name: process.env.PINECONE_INDEX_NAME!,
          dimension: 1536,
          metric: 'cosine',
          spec: { serverless: { cloud: 'aws', region: 'us-east-1' } }
        });
        console.log('Índice criado com sucesso!');
      } else {
        console.log(`Índice ${process.env.PINECONE_INDEX_NAME} já existe.`);
      }
    }
    
    setupPinecone().catch(console.error);
    ```

- [ ] **Definir dimensão de embeddings e métricas**
  - Testar geração de embeddings com AWS Bedrock:
    ```typescript
    // src/lib/embeddings.ts
    import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
    
    export class EmbeddingService {
      private client: BedrockRuntimeClient;
      private modelId: string;
      
      constructor() {
        this.client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
        this.modelId = "amazon.titan-embed-text-v1";
      }
      
      async generateEmbedding(text: string): Promise<number[]> {
        const command = new InvokeModelCommand({
          modelId: this.modelId,
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify({
            inputText: text
          })
        });
        
        try {
          const response = await this.client.send(command);
          const responseBody = JSON.parse(new TextDecoder().decode(response.body));
          return responseBody.embedding;
        } catch (error) {
          console.error("Erro ao gerar embedding:", error);
          throw error;
        }
      }
    }
    ```
  - Criar script de teste para verificar dimensão:
    ```typescript
    // scripts/test-embedding.ts
    import { EmbeddingService } from "../src/lib/embeddings";
    
    async function testEmbedding() {
      const service = new EmbeddingService();
      try {
        const embedding = await service.generateEmbedding("Teste de embedding para crédito rural");
        console.log(`Dimensão do embedding: ${embedding.length}`);
        console.log(`Primeiros 5 valores: ${embedding.slice(0, 5)}`);
      } catch (error) {
        console.error("Erro no teste:", error);
      }
    }
    
    testEmbedding();
    ```

## Fase 2: Adaptação da Interface de Usuário (2 semanas)

### 2.1. Adaptação da Landing Page (3 dias)
- [ ] **Personalizar conteúdo para público-alvo de crédito rural**
  - Identificar arquivos principais da landing page:
    ```bash
    # Localizar arquivos da landing page
    find ./src -type f -name "*.tsx" | grep -i landing
    find ./src/app/\(marketing\) -type f -name "*.tsx"
    ```
  - Modificar componentes principais em `/src/app/(marketing)/page.tsx`:
    ```typescript
    // Exemplo de atualização do Hero Section
    export function HeroSection() {
      return (
        <div className="...">
          <h1 className="text-4xl font-bold">AgroCredit AI: Assistente Inteligente para Crédito Rural</h1>
          <p className="text-xl mt-4">
            Simplifique a análise, documentação e gestão de processos de crédito rural 
            com nossa solução especializada para o agronegócio brasileiro.
          </p>
          {/* Botões de CTA */}
        </div>
      );
    }
    ```
  - Atualizar seções de features com casos de uso específicos:
    ```typescript
    const ruralCreditFeatures = [
      {
        title: "Análise de Contratos",
        description: "Interpretação automática de contratos e documentos de crédito rural",
        icon: DocumentCheckIcon
      },
      {
        title: "Simulação Financeira",
        description: "Calcule condições de financiamento para diferentes linhas de crédito rural",
        icon: CalculatorIcon
      },
      // Mais features específicas
    ];
    ```
  - Adaptar seção de testemunhos para perfis do setor agrícola

- [ ] **Ajustar textos, imagens e mensagens de marketing**
  - Criar pasta de assets específicos para o setor agrícola:
    ```bash
    mkdir -p public/images/agro
    ```
  - Baixar e otimizar imagens relevantes para o setor:
    ```bash
    # Otimizar imagens após download
    npx sharp-cli --input "./public/images/agro/*.{jpg,png}" --output "./public/images/agro/optimized/"
    ```
  - Implementar nova paleta de cores em `/src/styles/theme.ts`:
    ```typescript
    export const agroCreditTheme = {
      colors: {
        primary: { 
          light: '#4CAF50', // Verde claro
          DEFAULT: '#2E7D32', // Verde
          dark: '#1B5E20'  // Verde escuro
        },
        accent: {
          light: '#FFD54F', // Amarelo claro
          DEFAULT: '#FFC107', // Amarelo
          dark: '#FFA000'  // Amarelo escuro
        },
        // Outras cores específicas...
      }
      // Restante da configuração
    };
    ```
  - Configurar TailwindCSS para usar a nova paleta em `tailwind.config.js`:
    ```javascript
    const { agroCreditTheme } = require('./src/styles/theme');
    
    module.exports = {
      theme: {
        extend: {
          colors: agroCreditTheme.colors,
        },
      },
      // Resto da configuração
    };
    ```

- [ ] **Revisar SEO e metadados**
  - Atualizar arquivo de metadados em `/src/app/layout.tsx` ou `/src/app/(marketing)/layout.tsx`:
    ```typescript
    export const metadata = {
      title: 'AgroCredit AI | Assistente Inteligente para Crédito Rural',
      description: 'Otimize processos de crédito rural com nossa plataforma de IA especializada para o agronegócio brasileiro. Analise contratos, simule financiamentos e gere documentos automaticamente.',
      keywords: 'crédito rural, financiamento agrícola, assistente IA, agronegócio, análise de contratos, SNCR, Pronaf, Pronamp',
      openGraph: {
        title: 'AgroCredit AI | Assistente Inteligente para Crédito Rural',
        description: 'Otimize processos de crédito rural com nossa plataforma de IA especializada',
        images: [
          {
            url: '/images/agro/og-image.jpg',
            width: 1200,
            height: 630,
            alt: 'AgroCredit AI',
          },
        ],
      },
    };
    ```
  - Criar arquivo `public/sitemap.xml` com URLs relevantes:
    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://agrocredit.ai/</loc>
        <lastmod>2025-05-09</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>https://agrocredit.ai/precos</loc>
        <lastmod>2025-05-09</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>
      <!-- Outras URLs importantes -->
    </urlset>
    ```
  - Configurar arquivo `public/robots.txt`:
    ```
    User-agent: *
    Allow: /
    
    Sitemap: https://agrocredit.ai/sitemap.xml
    ```
  - Adicionar script de análise do Google em `src/app/layout.tsx`:
    ```typescript
    <Script
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
      `}
    </Script>
    ```

### 2.2. Desenvolvimento da Interface de Chat (5 dias)
- [ ] **Criar componente de interface de chat principal**
  - Criar diretórios para os componentes de chat:
    ```bash
    mkdir -p src/components/chat
    mkdir -p src/types/chat
    ```
  - Definir tipos de dados para mensagens em `src/types/chat/index.ts`:
    ```typescript
    export enum MessageRole {
      USER = 'user',
      ASSISTANT = 'assistant',
      SYSTEM = 'system'
    }
    
    export enum MessageStatus {
      SENDING = 'sending',
      SENT = 'sent',
      ERROR = 'error'
    }
    
    export interface Attachment {
      id: string;
      name: string;
      url: string;
      size: number;
      type: string;
      uploadedAt: string;
    }
    
    export interface Message {
      id: string;
      conversationId: string;
      role: MessageRole;
      content: string;
      createdAt: string;
      status?: MessageStatus;
      attachments?: Attachment[];
    }
    
    export interface Conversation {
      id: string;
      title: string;
      createdAt: string;
      updatedAt: string;
      messages: Message[];
    }
    ```
  - Implementar container principal do chat em `src/components/chat/ChatContainer.tsx`:
    ```typescript
    import React, { useState, useEffect, useRef } from 'react';
    import { Message, Conversation } from '@/types/chat';
    import MessageList from './MessageList';
    import MessageInput from './MessageInput';
    import { useAuth } from '@/hooks/useAuth';
    
    interface ChatContainerProps {
      conversationId?: string;
    }
    
    export default function ChatContainer({ conversationId }: ChatContainerProps) {
      const [conversation, setConversation] = useState<Conversation | null>(null);
      const [messages, setMessages] = useState<Message[]>([]);
      const [loading, setLoading] = useState(false);
      const messagesEndRef = useRef<HTMLDivElement>(null);
      const { user } = useAuth();
      
      // Efeito para carregar conversa existente ou criar nova
      useEffect(() => {
        if (conversationId) {
          // Carregar conversa existente
          fetchConversation(conversationId);
        } else {
          // Criar nova conversa
          createNewConversation();
        }
      }, [conversationId]);
      
      // Efeito para rolar para a última mensagem
      useEffect(() => {
        scrollToBottom();
      }, [messages]);
      
      const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      };
      
      const fetchConversation = async (id: string) => {
        setLoading(true);
        try {
          const response = await fetch(`/api/conversations/${id}`);
          const data = await response.json();
          setConversation(data);
          setMessages(data.messages || []);
        } catch (error) {
          console.error('Erro ao carregar conversa:', error);
        } finally {
          setLoading(false);
        }
      };
      
      const createNewConversation = async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Nova conversa' })
          });
          const data = await response.json();
          setConversation(data);
          // Iniciar com mensagem de boas-vindas
          setMessages([
            {
              id: 'welcome',
              conversationId: data.id,
              role: 'assistant',
              content: 'Olá! Sou seu assistente especializado em crédito rural. Como posso ajudar você hoje?',
              createdAt: new Date().toISOString()
            }
          ]);
        } catch (error) {
          console.error('Erro ao criar conversa:', error);
        } finally {
          setLoading(false);
        }
      };
      
      const sendMessage = async (content: string, attachments?: File[]) => {
        if (!content.trim() && (!attachments || attachments.length === 0)) return;
        if (!conversation) return;
        
        // Criar ID temporário para a mensagem
        const tempId = `temp-${Date.now()}`;
        
        // Adicionar mensagem do usuário localmente
        const userMessage: Message = {
          id: tempId,
          conversationId: conversation.id,
          role: 'user',
          content,
          createdAt: new Date().toISOString(),
          status: 'sending'
        };
        
        setMessages(prev => [...prev, userMessage]);
        
        // Enviar arquivos se existirem
        let attachmentsList: Attachment[] = [];
        if (attachments && attachments.length > 0) {
          // Upload de arquivos será implementado
        }
        
        try {
          // Enviar mensagem para a API
          const response = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId: conversation.id,
              content,
              attachments: attachmentsList
            })
          });
          
          if (!response.ok) throw new Error('Falha ao enviar mensagem');
          
          const data = await response.json();
          
          // Atualizar mensagem do usuário com ID real
          setMessages(prev => prev.map(msg => 
            msg.id === tempId ? { ...msg, id: data.userMessage.id, status: 'sent' } : msg
          ));
          
          // Adicionar resposta do assistente
          setMessages(prev => [...prev, data.assistantMessage]);
        } catch (error) {
          console.error('Erro ao enviar mensagem:', error);
          // Marcar mensagem com erro
          setMessages(prev => prev.map(msg => 
            msg.id === tempId ? { ...msg, status: 'error' } : msg
          ));
        }
      };
      
      return (
        <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow-sm">
          <div className="flex-1 overflow-y-auto p-4">
            <MessageList messages={messages} loading={loading} />
            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t border-gray-200 p-4">
            <MessageInput onSendMessage={sendMessage} />
          </div>
        </div>
      );
    }
    ```

- [ ] **Implementar área de entrada de mensagens**
  - Criar componente `src/components/chat/MessageInput.tsx` com recursos avançados:
    ```typescript
    import React, { useState, useRef, useEffect } from 'react';
    import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/outline';
    
    interface MessageInputProps {
      onSendMessage: (content: string, attachments?: File[]) => void;
      disabled?: boolean;
    }
    
    export default function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
      const [message, setMessage] = useState('');
      const [files, setFiles] = useState<File[]>([]);
      const [isUploading, setIsUploading] = useState(false);
      const textareaRef = useRef<HTMLTextAreaElement>(null);
      const fileInputRef = useRef<HTMLInputElement>(null);
      
      // Auto-resize textarea
      useEffect(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(
            textareaRef.current.scrollHeight,
            200 // Altura máxima
          )}px`;
        }
      }, [message]);
      
      const handleSend = () => {
        if (disabled || (!message.trim() && files.length === 0)) return;
        
        onSendMessage(message, files.length > 0 ? files : undefined);
        setMessage('');
        setFiles([]);
        
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      };
      
      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      };
      
      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
          setFiles(Array.from(e.target.files));
        }
      };
      
      const handleFileClick = () => {
        fileInputRef.current?.click();
      };
      
      const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
      };
      
      return (
        <div className="relative">
          {/* Lista de arquivos selecionados */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center bg-gray-100 rounded px-2 py-1">
                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                  <button 
                    onClick={() => removeFile(index)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-end border rounded-lg bg-white overflow-hidden">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              className="flex-1 p-3 outline-none resize-none min-h-[44px] max-h-[200px]"
              disabled={disabled}
              rows={1}
            />
            
            <div className="flex items-center p-2">
              <button
                type="button"
                onClick={handleFileClick}
                className="p-1 rounded-full hover:bg-gray-100"
                disabled={disabled}
              >
                <PaperClipIcon className="h-5 w-5 text-gray-500" />
              </button>
              
              <button
                type="button"
                onClick={handleSend}
                className="ml-1 p-1 rounded-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                disabled={disabled || (!message.trim() && files.length === 0)}
              >
                <PaperAirplaneIcon className="h-5 w-5 text-white" />
              </button>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.jpg,.jpeg,.png"
              disabled={disabled}
            />
          </div>
        </div>
      );
    }
    ```
    
  - **Campo de texto** - implementado com autoexpansão e suporte a atalhos
  - **Botão de envio** - com estados visuais e atalho de teclado (Enter)
  - **Upload de arquivos** - implementar componente para upload de arquivos:
    - Criar serviço de upload em `src/lib/fileUpload.ts`:
      ```typescript
      import { v4 as uuidv4 } from 'uuid';
      
      export async function uploadFile(file: File, conversationId: string): Promise<string> {
        // 1. Solicitar URL pré-assinada para upload
        const response = await fetch('/api/files/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            conversationId
          })
        });
        
        if (!response.ok) {
          throw new Error('Falha ao obter URL para upload');
        }
        
        const { uploadUrl, fileId } = await response.json();
        
        // 2. Fazer upload direto para S3 usando a URL pré-assinada
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type
          }
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Falha ao fazer upload do arquivo');
        }
        
        return fileId;
      }
      ```

- [ ] **Desenvolver visualização de mensagens**
  - Criar componente `src/components/chat/MessageList.tsx`:
    ```typescript
    import React from 'react';
    import { Message, MessageRole } from '@/types/chat';
    import MessageItem from './MessageItem';
    
    interface MessageListProps {
      messages: Message[];
      loading?: boolean;
    }
    
    export default function MessageList({ messages, loading = false }: MessageListProps) {
      if (messages.length === 0 && !loading) {
        return (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 text-center">
              Ainda não há mensagens nesta conversa.<br />
              Comece enviando uma pergunta abaixo.
            </p>
          </div>
        );
      }
      
      return (
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
          
          {loading && (
            <div className="flex items-center space-x-2 p-3">
              <div className="animate-pulse flex space-x-1">
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
              </div>
              <span className="text-sm text-gray-500">O assistente está digitando...</span>
            </div>
          )}
        </div>
      );
    }
    ```
  
  - **Diferenciação entre mensagens do usuário e do assistente**
    - Criar componente `src/components/chat/MessageItem.tsx` para renderizar cada mensagem:
      ```typescript
      import React from 'react';
      import { Message, MessageRole } from '@/types/chat';
      import ReactMarkdown from 'react-markdown';
      import { format } from 'date-fns';
      import { ptBR } from 'date-fns/locale';
      import { UserCircleIcon } from '@heroicons/react/24/solid';
      import AttachmentList from './AttachmentList';
      
      interface MessageItemProps {
        message: Message;
      }
      
      export default function MessageItem({ message }: MessageItemProps) {
        const isUser = message.role === MessageRole.USER;
        
        return (
          <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className="flex-shrink-0">
                {isUser ? (
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <UserCircleIcon className="h-7 w-7 text-primary-600" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">AI</span>
                  </div>
                )}
              </div>
              
              {/* Conteúdo */}
              <div className={`mx-2 ${isUser ? 'text-right' : 'text-left'}`}>
                <div 
                  className={`px-4 py-3 rounded-lg ${isUser 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  {/* Mensagem com suporte a markdown */}
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  
                  {/* Anexos, se houver */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2">
                      <AttachmentList attachments={message.attachments} />
                    </div>
                  )}
                </div>
                
                {/* Timestamp */}
                <div className="mt-1 text-xs text-gray-500">
                  {format(new Date(message.createdAt), 'HH:mm', { locale: ptBR })}
                </div>
              </div>
            </div>
          </div>
        );
      }
      ```
  
  - **Suporte a markdown/formatação**
    - Instalar biblioteca para renderização markdown:
      ```bash
      npm install react-markdown rehype-highlight remark-gfm
      ```
    - Configurar opções de formatação para código, tabelas, etc.
  
  - **Exibição de links/documentos**
    - Implementar componente `src/components/chat/AttachmentList.tsx` para exibir anexos:
      ```typescript
      import React from 'react';
      import { Attachment } from '@/types/chat';
      import { DocumentIcon, PhotoIcon, TableCellsIcon } from '@heroicons/react/24/outline';
      import { formatBytes } from '@/utils/format';
      
      interface AttachmentListProps {
        attachments: Attachment[];
      }
      
      export default function AttachmentList({ attachments }: AttachmentListProps) {
        if (!attachments || attachments.length === 0) return null;
        
        const getIconForType = (type: string) => {
          if (type.startsWith('image/')) {
            return <PhotoIcon className="h-5 w-5" />;
          } else if (['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(type)) {
            return <DocumentIcon className="h-5 w-5" />;
          } else if (['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(type)) {
            return <TableCellsIcon className="h-5 w-5" />;
          }
          return <DocumentIcon className="h-5 w-5" />;
        };
        
        return (
          <div className="flex flex-col space-y-2">
            {attachments.map((attachment) => (
              <a 
                key={attachment.id} 
                href={attachment.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-2 rounded border bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="text-gray-500 mr-2">
                  {getIconForType(attachment.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatBytes(attachment.size)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        );
      }
      ```
    - Criar função utility para formatar tamanho de arquivo em `src/utils/format.ts`:
      ```typescript
      export function formatBytes(bytes: number, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
      }
      ```

### 2.3. Implementação do Histórico de Conversas (4 dias)
- [ ] **Criar interface de listagem de conversas**
  - Implementar página para listagem em `src/app/dashboard/conversas/page.tsx`:
    ```typescript
    import React from 'react';
    import ConversationList from '@/components/conversations/ConversationList';
    import NewConversationButton from '@/components/conversations/NewConversationButton';
    import DashboardLayout from '@/components/layouts/DashboardLayout';
    
    export default function ConversationsPage() {
      return (
        <DashboardLayout>
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Minhas Conversas</h1>
              <NewConversationButton />
            </div>
            
            <ConversationList />
          </div>
        </DashboardLayout>
      );
    }
    ```
  
  - Criar componente de listagem em `src/components/conversations/ConversationList.tsx`:
    ```typescript
    'use client';
    
    import React, { useState, useEffect } from 'react';
    import { Conversation } from '@/types/chat';
    import ConversationItem from './ConversationItem';
    import { useRouter } from 'next/navigation';
    import { formatDistanceToNow } from 'date-fns';
    import { ptBR } from 'date-fns/locale';
    
    export default function ConversationList() {
      const [conversations, setConversations] = useState<Conversation[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const router = useRouter();
      
      useEffect(() => {
        const fetchConversations = async () => {
          try {
            const response = await fetch('/api/conversations');
            
            if (!response.ok) {
              throw new Error('Falha ao carregar conversas');
            }
            
            const data = await response.json();
            setConversations(data);
          } catch (err) {
            setError('Erro ao carregar conversas. Tente novamente mais tarde.');
            console.error('Erro ao buscar conversas:', err);
          } finally {
            setLoading(false);
          }
        };
        
        fetchConversations();
      }, []);
      
      const handleConversationClick = (id: string) => {
        router.push(`/dashboard/conversas/${id}`);
      };
      
      if (loading) {
        return (
          <div className="flex justify-center p-8">
            <div className="animate-pulse space-y-4 w-full max-w-3xl">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        );
      }
      
      if (error) {
        return (
          <div className="text-center p-8">
            <p className="text-red-500">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </button>
          </div>
        );
      }
      
      if (conversations.length === 0) {
        return (
          <div className="text-center p-8">
            <p className="text-gray-500 mb-4">Você ainda não tem nenhuma conversa.</p>
            <button 
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              onClick={() => router.push('/dashboard/chat')}
            >
              Iniciar nova conversa
            </button>
          </div>
        );
      }
      
      return (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              onClick={() => handleConversationClick(conversation.id)}
            />
          ))}
        </div>
      );
    }
    ```
  
  - Implementar componente de item de conversa em `src/components/conversations/ConversationItem.tsx`:
    ```typescript
    import React from 'react';
    import { Conversation } from '@/types/chat';
    import { formatDistanceToNow } from 'date-fns';
    import { ptBR } from 'date-fns/locale';
    import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
    
    interface ConversationItemProps {
      conversation: Conversation;
      onClick: () => void;
    }
    
    export default function ConversationItem({ conversation, onClick }: ConversationItemProps) {
      // Extrair resumo da última mensagem, se existir
      const lastMessage = conversation.messages && conversation.messages.length > 0
        ? conversation.messages[conversation.messages.length - 1]
        : null;
      
      const lastMessagePreview = lastMessage
        ? lastMessage.content.substring(0, 100) + (lastMessage.content.length > 100 ? '...' : '')
        : 'Nova conversa';
      
      const timeAgo = formatDistanceToNow(new Date(conversation.updatedAt), {
        addSuffix: true,
        locale: ptBR
      });
      
      return (
        <div 
          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={onClick}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-900">{conversation.title}</h3>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
          
          <div className="flex items-start space-x-2">
            <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 line-clamp-2">{lastMessagePreview}</p>
          </div>
        </div>
      );
    }
    ```
  
  - Implementar botão para nova conversa em `src/components/conversations/NewConversationButton.tsx`:
    ```typescript
    'use client';
    
    import React from 'react';
    import { useRouter } from 'next/navigation';
    import { PlusIcon } from '@heroicons/react/24/outline';
    
    export default function NewConversationButton() {
      const router = useRouter();
      
      const handleClick = () => {
        router.push('/dashboard/chat');
      };
      
      return (
        <button
          onClick={handleClick}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nova Conversa</span>
        </button>
      );
    }
    ```

- [ ] **Implementar funcionalidade de busca e filtros**
  - Adicionar barra de busca em `src/components/conversations/ConversationList.tsx`:
    ```typescript
    // Adicionar estado para busca no componente ConversationList
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
    
    // Adicionar efeito para filtrar conversas
    useEffect(() => {
      if (!searchTerm.trim()) {
        setFilteredConversations(conversations);
        return;
      }
      
      const filtered = conversations.filter((conversation) => {
        // Buscar no título
        if (conversation.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          return true;
        }
        
        // Buscar nas mensagens se disponíveis
        if (conversation.messages) {
          return conversation.messages.some((message) => 
            message.content.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        return false;
      });
      
      setFilteredConversations(filtered);
    }, [searchTerm, conversations]);
    ```
  
  - Criar componente de barra de busca em `src/components/conversations/SearchBar.tsx`:
    ```typescript
    import React from 'react';
    import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
    
    interface SearchBarProps {
      value: string;
      onChange: (value: string) => void;
      placeholder?: string;
    }
    
    export default function SearchBar({ 
      value, 
      onChange, 
      placeholder = 'Buscar conversas...' 
    }: SearchBarProps) {
      return (
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder={placeholder}
          />
        </div>
      );
    }
    ```
  
  - Implementar componente de filtros em `src/components/conversations/ConversationFilters.tsx`:
    ```typescript
    import React from 'react';
    import { FunnelIcon } from '@heroicons/react/24/outline';
    
    interface ConversationFiltersProps {
      onFilterChange: (filters: any) => void;
    }
    
    export default function ConversationFilters({ onFilterChange }: ConversationFiltersProps) {
      const [showFilters, setShowFilters] = React.useState(false);
      const [dateRange, setDateRange] = React.useState<{ start?: Date; end?: Date }>({});
      
      const handleApplyFilters = () => {
        onFilterChange({
          dateRange
        });
        setShowFilters(false);
      };
      
      return (
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
          >
            <FunnelIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Filtros</span>
          </button>
          
          {showFilters && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-4">
              <h4 className="font-medium text-gray-900 mb-3">Filtrar por data</h4>
              
              <div className="space-y-2 mb-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Data inicial</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value ? new Date(e.target.value) : undefined })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Data final</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value ? new Date(e.target.value) : undefined })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={handleApplyFilters}
                  className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
    ```

- [ ] **Desenvolver visualização de detalhes da conversa**
  - Criar página de detalhes em `src/app/dashboard/conversas/[id]/page.tsx`:
    ```typescript
    import React from 'react';
    import { notFound } from 'next/navigation';
    import DashboardLayout from '@/components/layouts/DashboardLayout';
    import ChatContainer from '@/components/chat/ChatContainer';
    import ConversationHeader from '@/components/conversations/ConversationHeader';
    import { getConversationById } from '@/services/conversationService';
    
    interface ConversationPageProps {
      params: {
        id: string;
      };
    }
    
    export default async function ConversationPage({ params }: ConversationPageProps) {
      const { id } = params;
      
      try {
        // Verificar se a conversa existe no servidor
        const conversation = await getConversationById(id);
        
        if (!conversation) {
          return notFound();
        }
        
        return (
          <DashboardLayout>
            <div className="h-full flex flex-col">
              <ConversationHeader conversation={conversation} />
              
              <div className="flex-1 overflow-hidden">
                <ChatContainer conversationId={id} />
              </div>
            </div>
          </DashboardLayout>
        );
      } catch (error) {
        console.error('Erro ao carregar conversa:', error);
        return notFound();
      }
    }
    ```
  
  - Implementar cabeçalho da conversa em `src/components/conversations/ConversationHeader.tsx`:
    ```typescript
    'use client';
    
    import React, { useState } from 'react';
    import { Conversation } from '@/types/chat';
    import { useRouter } from 'next/navigation';
    import { ArrowLeftIcon, EllipsisHorizontalIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
    import { format } from 'date-fns';
    import { ptBR } from 'date-fns/locale';
    
    interface ConversationHeaderProps {
      conversation: Conversation;
    }
    
    export default function ConversationHeader({ conversation }: ConversationHeaderProps) {
      const [showMenu, setShowMenu] = useState(false);
      const [isEditing, setIsEditing] = useState(false);
      const [title, setTitle] = useState(conversation.title);
      const router = useRouter();
      
      const handleBack = () => {
        router.push('/dashboard/conversas');
      };
      
      const handleSaveTitle = async () => {
        if (!title.trim()) return;
        
        try {
          const response = await fetch(`/api/conversations/${conversation.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title }),
          });
          
          if (!response.ok) throw new Error('Falha ao atualizar título');
          
          setIsEditing(false);
          // Atualizar cache ou estado global se necessário
        } catch (error) {
          console.error('Erro ao atualizar título:', error);
        }
      };
      
      const handleDeleteConversation = async () => {
        if (!confirm('Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.')) {
          return;
        }
        
        try {
          const response = await fetch(`/api/conversations/${conversation.id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) throw new Error('Falha ao excluir conversa');
          
          router.push('/dashboard/conversas');
        } catch (error) {
          console.error('Erro ao excluir conversa:', error);
        }
      };
      
      const formattedDate = format(new Date(conversation.createdAt), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
      
      return (
        <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBack}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
              </button>
              
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-b border-gray-300 focus:border-primary-500 focus:outline-none px-1 py-0.5"
                    autoFocus
                  />
                  <button 
                    onClick={handleSaveTitle}
                    className="text-xs bg-primary-600 text-white px-2 py-1 rounded"
                  >
                    Salvar
                  </button>
                  <button 
                    onClick={() => {
                      setTitle(conversation.title);
                      setIsEditing(false);
                    }}
                    className="text-xs text-gray-600 px-2 py-1"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <h1 className="text-lg font-medium text-gray-900 flex items-center">
                  {conversation.title}
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </h1>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <EllipsisHorizontalIcon className="h-6 w-6 text-gray-500" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                  <div className="py-1">
                    <button
                      onClick={handleDeleteConversation}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Excluir conversa
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="px-4 pb-2 text-xs text-gray-500">
            Criada em {formattedDate}
          </div>
        </div>
      );
    }
    ```
  
  - Implementar serviço para buscar conversa em `src/services/conversationService.ts`:
    ```typescript
    import { Conversation } from '@/types/chat';
    import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
    import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
    
    const client = new DynamoDBClient({ region: process.env.AWS_REGION });
    const docClient = DynamoDBDocumentClient.from(client);
    
    export async function getConversationById(id: string): Promise<Conversation | null> {
      try {
        // Buscar dados da conversa
        const getConversationCommand = new GetCommand({
          TableName: `${process.env.DYNAMODB_TABLE_PREFIX}Conversations`,
          Key: {
            conversationId: id
          }
        });
        
        const conversationResponse = await docClient.send(getConversationCommand);
        
        if (!conversationResponse.Item) {
          return null;
        }
        
        const conversation = conversationResponse.Item as Conversation;
        
        // Opcionalmente buscar mensagens iniciais
        // Em produção, você pode querer paginar isso
        const getMessagesCommand = new QueryCommand({
          TableName: `${process.env.DYNAMODB_TABLE_PREFIX}Messages`,
          KeyConditionExpression: 'conversationId = :conversationId',
          ExpressionAttributeValues: {
            ':conversationId': id
          },
          Limit: 50,  // Limitar a 50 mensagens iniciais
          ScanIndexForward: true  // Ordem cronológica
        });
        
        const messagesResponse = await docClient.send(getMessagesCommand);
        
        return {
          ...conversation,
          messages: messagesResponse.Items || []
        };
      } catch (error) {
        console.error('Erro ao buscar conversa:', error);
        throw error;
      }
    }
    ```

### 2.4. Adaptação da Área de Gestão de Usuários (2 dias)
- [ ] **Ajustar páginas de cadastro e login**
  - Modificar formulário de cadastro em `src/app/(auth)/signup/page.tsx` para incluir campos específicos:
    ```typescript
    'use client';
    
    import React from 'react';
    import { useForm } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import * as z from 'zod';
    
    // Schema de validação com campos específicos para crédito rural
    const signupSchema = z.object({
      name: z.string().min(1, { message: 'Nome é obrigatório' }),
      email: z.string().email({ message: 'Email inválido' }),
      password: z.string().min(8, { message: 'Senha deve ter no mínimo 8 caracteres' }),
      companyName: z.string().min(1, { message: 'Nome da empresa é obrigatório' }),
      cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, { 
        message: 'CNPJ inválido. Use o formato: 00.000.000/0000-00' 
      }),
      role: z.enum(['Analista', 'Gerente', 'Consultor']),
      segment: z.enum(['Banco', 'Cooperativa', 'Consultoria', 'Produtor Rural', 'Outro'])
    });
    
    export default function SignupPage() {
      const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(signupSchema),
        defaultValues: {
          name: '',
          email: '',
          password: '',
          companyName: '',
          cnpj: '',
          role: 'Analista',
          segment: 'Banco'
        }
      });
      
      const onSubmit = async (data) => {
        try {
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (!response.ok) throw new Error('Falha no cadastro');
          
          // Redirecionar para confirmação ou dashboard
          window.location.href = '/confirmacao';
        } catch (error) {
          console.error('Erro no cadastro:', error);
        }
      };
      
      return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Crie sua conta no AgroCredit AI</h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Campos básicos */}
            <div>
              <label className="block text-sm font-medium mb-1">Nome completo</label>
              <input
                {...register('name')}
                className="w-full border rounded-md px-3 py-2"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            
            {/* Campos específicos do domínio */}
            <div>
              <label className="block text-sm font-medium mb-1">Nome da Empresa/Instituição</label>
              <input
                {...register('companyName')}
                className="w-full border rounded-md px-3 py-2"
              />
              {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">CNPJ</label>
              <input
                {...register('cnpj')}
                placeholder="00.000.000/0000-00"
                className="w-full border rounded-md px-3 py-2"
              />
              {errors.cnpj && <p className="text-red-500 text-xs mt-1">{errors.cnpj.message}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Função/Cargo</label>
                <select 
                  {...register('role')} 
                  className="w-full border rounded-md px-3 py-2 bg-white"
                >
                  <option value="Analista">Analista de Crédito</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Consultor">Consultor</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Segmento</label>
                <select 
                  {...register('segment')} 
                  className="w-full border rounded-md px-3 py-2 bg-white"
                >
                  <option value="Banco">Banco</option>
                  <option value="Cooperativa">Cooperativa</option>
                  <option value="Consultoria">Consultoria</option>
                  <option value="Produtor Rural">Produtor Rural</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>
            
            {/* Outros campos e botão de envio */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Aguarde...' : 'Criar conta'}
            </button>
          </form>
        </div>
      );
    }
    ```

- [ ] **Adaptar página de perfil do usuário**
  - Criar página de perfil em `src/app/dashboard/perfil/page.tsx` com opções específicas:
    ```typescript
    'use client';
    
    import React, { useEffect, useState } from 'react';
    import { useForm } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import * as z from 'zod';
    import DashboardLayout from '@/components/layouts/DashboardLayout';
    import { useAuth } from '@/hooks/useAuth';
    
    const profileSchema = z.object({
      name: z.string().min(1, { message: 'Nome é obrigatório' }),
      email: z.string().email({ message: 'Email inválido' }).optional(),
      companyName: z.string().min(1, { message: 'Nome da empresa é obrigatório' }),
      cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, { 
        message: 'CNPJ inválido. Use o formato: 00.000.000/0000-00' 
      }),
      role: z.enum(['Analista', 'Gerente', 'Consultor']),
      segment: z.enum(['Banco', 'Cooperativa', 'Consultoria', 'Produtor Rural', 'Outro']),
      // Preferências do assistente
      aiPreferences: z.object({
        includeMarketPrices: z.boolean(),
        defaultCreditLines: z.array(z.string()),
        detailLevel: z.enum(['Básico', 'Intermediário', 'Detalhado'])
      })
    });
    
    export default function ProfilePage() {
      const { user, updateUserProfile } = useAuth();
      const [isLoading, setIsLoading] = useState(true);
      
      const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
          name: '',
          email: '',
          companyName: '',
          cnpj: '',
          role: 'Analista',
          segment: 'Banco',
          aiPreferences: {
            includeMarketPrices: true,
            defaultCreditLines: ['Pronaf', 'Pronamp'],
            detailLevel: 'Intermediário'
          }
        }
      });
      
      useEffect(() => {
        if (user) {
          // Carregar dados do usuário
          fetch('/api/users/profile')
            .then(res => res.json())
            .then(data => {
              reset({
                name: data.name,
                email: data.email,
                companyName: data.companyName,
                cnpj: data.cnpj,
                role: data.role,
                segment: data.segment,
                aiPreferences: data.aiPreferences || {
                  includeMarketPrices: true,
                  defaultCreditLines: ['Pronaf', 'Pronamp'],
                  detailLevel: 'Intermediário'
                }
              });
              setIsLoading(false);
            })
            .catch(err => {
              console.error('Erro ao carregar perfil:', err);
              setIsLoading(false);
            });
        }
      }, [user, reset]);
      
      const onSubmit = async (data) => {
        try {
          const response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (!response.ok) throw new Error('Falha ao atualizar perfil');
          
          // Atualizar contexto de autenticação
          const updatedProfile = await response.json();
          updateUserProfile(updatedProfile);
          
          alert('Perfil atualizado com sucesso!');
        } catch (error) {
          console.error('Erro ao atualizar perfil:', error);
          alert('Erro ao atualizar perfil. Tente novamente.');
        }
      };
      
      return (
        <DashboardLayout>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
            
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Informações Pessoais</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Campos de informação pessoal */}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Preferências do Assistente</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          {...register('aiPreferences.includeMarketPrices')} 
                          className="rounded text-primary-600 focus:ring-primary-500"
                        />
                        <span>Incluir preços atuais de mercado nas análises</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Linhas de crédito default</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'pronaf', label: 'Pronaf' },
                          { id: 'pronamp', label: 'Pronamp' },
                          { id: 'funcafe', label: 'Funcafé' },
                          { id: 'inovagro', label: 'Inovagro' },
                          { id: 'moderagro', label: 'Moderagro' },
                          { id: 'abc', label: 'Programa ABC' }
                        ].map(option => (
                          <label key={option.id} className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              value={option.id}
                              {...register('aiPreferences.defaultCreditLines')}
                              className="rounded text-primary-600 focus:ring-primary-500"
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Nível de detalhamento das respostas</label>
                      <select 
                        {...register('aiPreferences.detailLevel')} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="Básico">Básico - Respostas diretas e simples</option>
                        <option value="Intermediário">Intermediário - Respostas balanceadas</option>
                        <option value="Detalhado">Detalhado - Respostas completas com exemplos</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            )}
          </div>
        </DashboardLayout>
      );
    }
    ```

- [ ] **Configurar fluxo de recuperação de senha**
  - Implementar página de recuperação em `src/app/(auth)/recuperar-senha/page.tsx`:
    ```typescript
    'use client';
    
    import React, { useState } from 'react';
    import { useForm } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import * as z from 'zod';
    import Link from 'next/link';
    
    // Step 1: Solicitar código de recuperação
    const requestSchema = z.object({
      email: z.string().email({ message: 'Email inválido' })
    });
    
    // Step 2: Verificar código e definir nova senha
    const resetSchema = z.object({
      email: z.string().email({ message: 'Email inválido' }),
      code: z.string().min(6, { message: 'Código inválido' }),
      password: z.string().min(8, { message: 'Senha deve ter no mínimo 8 caracteres' }),
      confirmPassword: z.string()
    }).refine(data => data.password === data.confirmPassword, {
      message: 'Senhas não conferem',
      path: ['confirmPassword']
    });
    
    export default function PasswordResetPage() {
      const [step, setStep] = useState(1);
      const [email, setEmail] = useState('');
      
      // Step 1 form
      const { register: registerStep1, handleSubmit: handleSubmitStep1, formState: { errors: errors1 } } = useForm({
        resolver: zodResolver(requestSchema)
      });
      
      // Step 2 form
      const { register: registerStep2, handleSubmit: handleSubmitStep2, formState: { errors: errors2 } } = useForm({
        resolver: zodResolver(resetSchema),
        defaultValues: {
          email: ''
        }
      });
      
      const onRequestReset = async (data) => {
        try {
          const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.email })
          });
          
          if (!response.ok) throw new Error('Falha ao solicitar redefinição');
          
          setEmail(data.email);
          setStep(2);
        } catch (error) {
          console.error('Erro ao solicitar redefinição de senha:', error);
        }
      };
      
      const onResetPassword = async (data) => {
        try {
          const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: data.email,
              code: data.code,
              password: data.password
            })
          });
          
          if (!response.ok) throw new Error('Falha ao redefinir senha');
          
          // Redirecionar para página de login com mensagem de sucesso
          window.location.href = '/login?reset=success';
        } catch (error) {
          console.error('Erro ao redefinir senha:', error);
        }
      };
      
      return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          {step === 1 ? (
            <>
              <h1 className="text-2xl font-bold text-center mb-6">Recuperar Senha</h1>
              <p className="text-gray-600 mb-4">Informe seu email para receber um código de redefinição de senha.</p>
              
              <form onSubmit={handleSubmitStep1(onRequestReset)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    {...registerStep1('email')}
                    type="email"
                    className="w-full border rounded-md px-3 py-2"
                  />
                  {errors1.email && <p className="text-red-500 text-xs mt-1">{errors1.email.message}</p>}
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700"
                >
                  Solicitar Código
                </button>
                
                <div className="text-center mt-4">
                  <Link href="/login" className="text-primary-600 hover:text-primary-700 text-sm">
                    Voltar para o login
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center mb-6">Redefinir Senha</h1>
              <p className="text-gray-600 mb-4">Insira o código enviado para {email} e defina sua nova senha.</p>
              
              <form onSubmit={handleSubmitStep2(onResetPassword)} className="space-y-4">
                <input type="hidden" {...registerStep2('email')} value={email} />
                
                <div>
                  <label className="block text-sm font-medium mb-1">Código de Verificação</label>
                  <input
                    {...registerStep2('code')}
                    className="w-full border rounded-md px-3 py-2"
                  />
                  {errors2.code && <p className="text-red-500 text-xs mt-1">{errors2.code.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Nova Senha</label>
                  <input
                    {...registerStep2('password')}
                    type="password"
                    className="w-full border rounded-md px-3 py-2"
                  />
                  {errors2.password && <p className="text-red-500 text-xs mt-1">{errors2.password.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Confirmar Senha</label>
                  <input
                    {...registerStep2('confirmPassword')}
                    type="password"
                    className="w-full border rounded-md px-3 py-2"
                  />
                  {errors2.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors2.confirmPassword.message}</p>}
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700"
                >
                  Redefinir Senha
                </button>
                
                <div className="text-center mt-4">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    Solicitar novo código
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      );
    }
    ```
  
  - Implementar endpoints de API em `src/app/api/auth/`:
    - `forgot-password/route.ts` - Enviar código por email
    - `reset-password/route.ts` - Validar código e atualizar senha
  
  - Integrar com Cognito para o fluxo completo de redefinição de senha:
    ```typescript
    // src/app/api/auth/forgot-password/route.ts
    import { NextResponse } from 'next/server';
    import { CognitoIdentityProviderClient, ForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
    
    export async function POST(request) {
      try {
        const { email } = await request.json();
        
        const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
        
        const command = new ForgotPasswordCommand({
          ClientId: process.env.AWS_COGNITO_CLIENT_ID,
          Username: email
        });
        
        await client.send(command);
        
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('Erro ao solicitar redefinição de senha:', error);
        return NextResponse.json(
          { error: 'Falha ao processar solicitação de redefinição de senha' },
          { status: 500 }
        );
      }
    }
    ```

## Fase 3: Desenvolvimento do Backend (3 semanas)

### 3.1. Configuração da API Principal (4 dias)
- [ ] **Definir estrutura de rotas para API NextJS**
  - Criar estrutura base para as rotas da API em `src/app/api/`:
    ```
    src/app/api/
    ├── auth/
    │   ├── login/
    │   │   └── route.ts
    │   ├── signup/
    │   │   └── route.ts
    │   ├── forgot-password/
    │   │   └── route.ts
    │   └── reset-password/
    │       └── route.ts
    ├── conversations/
    │   ├── route.ts
    │   └── [id]/
    │       ├── route.ts
    │       └── messages/
    │           └── route.ts
    ├── messages/
    │   └── route.ts
    ├── documents/
    │   ├── route.ts
    │   └── [id]/
    │       └── route.ts
    ├── files/
    │   ├── upload-url/
    │   │   └── route.ts
    │   └── download-url/
    │       └── route.ts
    ├── users/
    │   ├── profile/
    │   │   └── route.ts
    │   └── [id]/
    │       └── route.ts
    └── webhooks/
        ├── asaas/
        │   └── route.ts
        └── mailing/
            └── route.ts
    ```
  
  - Implementar estrutura base das rotas com validação de entrada em `src/app/api/conversations/route.ts`:
    ```typescript
    import { NextRequest, NextResponse } from 'next/server';
    import { z } from 'zod';
    import { auth } from '@/lib/auth';
    import { conversationsRepo } from '@/repositories/conversationsRepo';
    
    // Schema de validação
    const createConversationSchema = z.object({
      title: z.string().min(1).optional().default('Nova conversa')
    });
    
    // GET /api/conversations
    export async function GET(request: NextRequest) {
      try {
        // Verificar autenticação
        const session = await auth.getSession(request);
        if (!session) {
          return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }
        
        // Obter parâmetros de consulta
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        
        // Buscar conversas do usuário
        const conversations = await conversationsRepo.listByUser({
          tenantId: session.user.tenantId,
          page,
          limit,
          search
        });
        
        return NextResponse.json(conversations);
      } catch (error) {
        console.error('Erro ao listar conversas:', error);
        return NextResponse.json(
          { error: 'Erro ao processar solicitação' },
          { status: 500 }
        );
      }
    }
    
    // POST /api/conversations
    export async function POST(request: NextRequest) {
      try {
        // Verificar autenticação
        const session = await auth.getSession(request);
        if (!session) {
          return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }
        
        // Validar corpo da requisição
        const body = await request.json();
        const validationResult = createConversationSchema.safeParse(body);
        
        if (!validationResult.success) {
          return NextResponse.json(
            { error: 'Dados inválidos', details: validationResult.error.format() },
            { status: 400 }
          );
        }
        
        // Criar nova conversa
        const conversation = await conversationsRepo.create({
          title: validationResult.data.title,
          tenantId: session.user.tenantId,
          userId: session.user.id
        });
        
        return NextResponse.json(conversation, { status: 201 });
      } catch (error) {
        console.error('Erro ao criar conversa:', error);
        return NextResponse.json(
          { error: 'Erro ao processar solicitação' },
          { status: 500 }
        );
      }
    }
    ```

- [ ] **Implementar middlewares de autenticação**
  - Criar middleware de autenticação em `src/middleware.ts`:
    ```typescript
    import { NextRequest, NextResponse } from 'next/next';
    import { auth } from './lib/auth';
    
    // Rotas protegidas que exigem autenticação
    const protectedPaths = [
      '/dashboard',
      '/api/conversations',
      '/api/messages',
      '/api/documents',
      '/api/files',
      '/api/users'
    ];
    
    // Rotas públicas que não exigem autenticação
    const publicPaths = [
      '/',
      '/login',
      '/signup',
      '/recuperar-senha',
      '/confirmar-cadastro',
      '/precos',
      '/api/auth'
    ];
    
    export async function middleware(request: NextRequest) {
      const { pathname } = new URL(request.url);
      
      // Verificar se a rota atual deve ser protegida
      const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
      const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
      
      // Se não for protegida ou for pública, prosseguir normalmente
      if (!isProtectedPath || isPublicPath) {
        return NextResponse.next();
      }
      
      // Verificar autenticação
      const session = await auth.getSession(request);
      
      // Se não estiver autenticado, redirecionar para login
      if (!session) {
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', encodeURI(request.url));
        return NextResponse.redirect(url);
      }
      
      // Se estiver autenticado, verificar assinatura ativa para APIs não essenciais
      if (pathname.startsWith('/api/')) {
        // Verificar exceções (APIs essenciais que funcionam mesmo sem assinatura ativa)
        const essentialApis = ['/api/users/profile', '/api/auth/'];
        const isEssentialApi = essentialApis.some(api => pathname.startsWith(api));
        
        if (!isEssentialApi) {
          // Verificar assinatura ativa
          const hasActiveSubscription = await auth.checkActiveSubscription(session.user.tenantId);
          
          if (!hasActiveSubscription) {
            return NextResponse.json(
              { error: 'Assinatura inativa ou expirada' },
              { status: 403 }
            );
          }
        }
      }
      
      // Adicionar informações do usuário ao cabeçalho para uso nas APIs
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', session.user.id);
      requestHeaders.set('x-tenant-id', session.user.tenantId);
      
      // Prosseguir com a requisição
      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      });
    }
    
    export const config = {
      matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
      ],
    };
    ```
  
  - Implementar biblioteca de autenticação em `src/lib/auth.ts`:
    ```typescript
    import { NextRequest } from 'next/server';
    import { CognitoJwtVerifier } from 'aws-jwt-verify';
    import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
    import { subscriptionsRepo } from '@/repositories/subscriptionsRepo';
    
    export interface Session {
      user: {
        id: string;
        email: string;
        name: string;
        tenantId: string;
      };
      accessToken: string;
    }
    
    class Auth {
      private verifier;
      private cognitoClient;
      
      constructor() {
        // Criar verificador de JWT para tokens do Cognito
        this.verifier = CognitoJwtVerifier.create({
          userPoolId: process.env.AWS_COGNITO_USER_POOL_ID!,
          clientId: process.env.AWS_COGNITO_CLIENT_ID!,
          tokenUse: 'access',
        });
        
        // Cliente Cognito para operações adicionais
        this.cognitoClient = new CognitoIdentityProviderClient({
          region: process.env.AWS_REGION,
        });
      }
      
      /**
       * Obtém a sessão do usuário a partir do token nos cookies ou cabeçalho
       */
      async getSession(request: NextRequest): Promise<Session | null> {
        try {
          // Verificar token no cookie ou no cabeçalho Authorization
          const token = this.getTokenFromRequest(request);
          
          if (!token) {
            return null;
          }
          
          // Verificar e decodificar o token
          const payload = await this.verifier.verify(token);
          
          // Extrair informações do usuário do token
          return {
            user: {
              id: payload.sub,
              email: payload['email'],
              name: payload['name'] || '',
              tenantId: payload['custom:tenantId'] || payload.sub
            },
            accessToken: token
          };
        } catch (error) {
          console.error('Erro ao verificar sessão:', error);
          return null;
        }
      }
      
      /**
       * Verifica se um tenant tem assinatura ativa
       */
      async checkActiveSubscription(tenantId: string): Promise<boolean> {
        try {
          // Verificar trial ativo ou assinatura ativa no repositório
          const subscription = await subscriptionsRepo.getByTenantId(tenantId);
          
          if (!subscription) {
            return false;
          }
          
          // Verificar se está no período de trial
          const trialEndDate = new Date(subscription.trialEndsAt);
          const now = new Date();
          
          if (now < trialEndDate) {
            return true;
          }
          
          // Verificar status da assinatura
          return subscription.status === 'active';
        } catch (error) {
          console.error('Erro ao verificar assinatura:', error);
          return false;
        }
      }
      
      /**
       * Extrai o token de acesso da requisição (cookie ou cabeçalho)
       */
      private getTokenFromRequest(request: NextRequest): string | null {
        // Tentar obter do cookie
        const tokenFromCookie = request.cookies.get('access_token')?.value;
        
        if (tokenFromCookie) {
          return tokenFromCookie;
        }
        
        // Tentar obter do cabeçalho Authorization
        const authHeader = request.headers.get('Authorization');
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
          return authHeader.substring(7);
        }
        
        return null;
      }
    }
    
    export const auth = new Auth();
    ```

- [ ] **Configurar integração com DynamoDB**
  - Criar repositório base para DynamoDB em `src/repositories/baseRepo.ts`:
    ```typescript
    import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
    import { 
      DynamoDBDocumentClient, 
      GetCommand, 
      PutCommand, 
      UpdateCommand,
      DeleteCommand,
      QueryCommand,
      ScanCommand
    } from '@aws-sdk/lib-dynamodb';
    
    const client = new DynamoDBClient({ region: process.env.AWS_REGION });
    const docClient = DynamoDBDocumentClient.from(client);
    
    export class BaseRepository<T> {
      protected tableName: string;
      
      constructor(tableName: string) {
        this.tableName = process.env.DYNAMODB_TABLE_PREFIX + tableName;
      }
      
      /**
       * Obtém um item pelo ID
       */
      async getById(id: string, sortKey?: string): Promise<T | null> {
        const key: Record<string, any> = { id };
        
        if (sortKey) {
          key.sk = sortKey;
        }
        
        const command = new GetCommand({
          TableName: this.tableName,
          Key: key
        });
        
        const response = await docClient.send(command);
        
        return response.Item as T || null;
      }
      
      /**
       * Cria um novo item
       */
      async create(item: Partial<T>): Promise<T> {
        const now = new Date().toISOString();
        
        const newItem = {
          ...item,
          createdAt: now,
          updatedAt: now
        };
        
        const command = new PutCommand({
          TableName: this.tableName,
          Item: newItem
        });
        
        await docClient.send(command);
        
        return newItem as T;
      }
      
      /**
       * Atualiza um item existente
       */
      async update(key: Record<string, any>, updates: Partial<T>): Promise<T> {
        const now = new Date().toISOString();
        
        // Construir expressão de atualização
        let updateExpression = 'SET updatedAt = :updatedAt';
        const expressionAttributeValues: Record<string, any> = {
          ':updatedAt': now
        };
        
        Object.entries(updates).forEach(([key, value]) => {
          if (key !== 'id' && key !== 'createdAt') {
            updateExpression += `, ${key} = :${key}`;
            expressionAttributeValues[`:${key}`] = value;
          }
        });
        
        const command = new UpdateCommand({
          TableName: this.tableName,
          Key: key,
          UpdateExpression: updateExpression,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: 'ALL_NEW'
        });
        
        const response = await docClient.send(command);
        
        return response.Attributes as T;
      }
      
      /**
       * Remove um item
       */
      async delete(key: Record<string, any>): Promise<void> {
        const command = new DeleteCommand({
          TableName: this.tableName,
          Key: key
        });
        
        await docClient.send(command);
      }
      
      /**
       * Consulta itens com base em expressão
       */
      async query(params: Record<string, any>): Promise<T[]> {
        const command = new QueryCommand({
          TableName: this.tableName,
          ...params
        });
        
        const response = await docClient.send(command);
        
        return response.Items as T[] || [];
      }
      
      /**
       * Escaneia tabela (usar com moderação)
       */
      async scan(params: Record<string, any> = {}): Promise<T[]> {
        const command = new ScanCommand({
          TableName: this.tableName,
          ...params
        });
        
        const response = await docClient.send(command);
        
        return response.Items as T[] || [];
      }
    }
    ```
  
  - Implementar repositório específico para conversas em `src/repositories/conversationsRepo.ts`:
    ```typescript
    import { BaseRepository } from './baseRepo';
    import { v4 as uuidv4 } from 'uuid';
    
    export interface Conversation {
      id: string;
      tenantId: string;
      userId: string;
      title: string;
      createdAt: string;
      updatedAt: string;
      lastMessageAt?: string;
      lastMessagePreview?: string;
    }
    
    export interface ListConversationsParams {
      tenantId: string;
      page?: number;
      limit?: number;
      search?: string;
    }
    
    class ConversationsRepository extends BaseRepository<Conversation> {
      constructor() {
        super('Conversations');
      }
      
      /**
       * Criar nova conversa
       */
      async create(data: Partial<Conversation>): Promise<Conversation> {
        const id = uuidv4();
        
        return super.create({
          id,
          ...data
        });
      }
      
      /**
       * Listar conversas de um tenant com paginação e busca
       */
      async listByUser({ tenantId, page = 1, limit = 20, search = '' }: ListConversationsParams): Promise<Conversation[]> {
        const params: Record<string, any> = {
          KeyConditionExpression: 'tenantId = :tenantId',
          ExpressionAttributeValues: {
            ':tenantId': tenantId
          },
          IndexName: 'byCreatedAt',
          ScanIndexForward: false,
          Limit: limit
        };
        
        // Adicionar filtro de busca se fornecido
        if (search) {
          params.FilterExpression = 'contains(title, :search) OR contains(lastMessagePreview, :search)';
          params.ExpressionAttributeValues[':search'] = search;
        }
        
        // Implementar paginação simples
        if (page > 1) {
          // Nota: Implementação básica - em produção usar LastEvaluatedKey para paginação eficiente
          params.Limit = page * limit;
          const allResults = await this.query(params);
          return allResults.slice((page - 1) * limit, page * limit);
        }
        
        return this.query(params);
      }
      
      /**
       * Obter conversa por ID
       */
      async getById(id: string): Promise<Conversation | null> {
        return super.getById(id);
      }
      
      /**
       * Atualizar conversa
       */
      async update(id: string, tenantId: string, updates: Partial<Conversation>): Promise<Conversation> {
        return super.update({ id, tenantId }, updates);
      }
      
      /**
       * Excluir conversa
       */
      async delete(id: string, tenantId: string): Promise<void> {
        return super.delete({ id, tenantId });
      }
    }
    
    export const conversationsRepo = new ConversationsRepository();
    ```
  
  - Implementar outros repositórios em padrão semelhante:
    - `src/repositories/messagesRepo.ts`
    - `src/repositories/documentsRepo.ts`
    - `src/repositories/usersRepo.ts`
    - `src/repositories/subscriptionsRepo.ts`

### 3.2. Implementação do Sistema de Mensagens (5 dias)
- [ ] **Desenvolver endpoints para mensagens**
  - **Envio de mensagens** - Implementar endpoint em `src/app/api/messages/route.ts`:
    ```typescript
    import { NextRequest, NextResponse } from 'next/server';
    import { z } from 'zod';
    import { auth } from '@/lib/auth';
    import { messagesRepo } from '@/repositories/messagesRepo';
    import { conversationsRepo } from '@/repositories/conversationsRepo';
    import { bedrockService } from '@/lib/bedrock';
    import { v4 as uuidv4 } from 'uuid';
    
    // Schema de validação para envio de mensagem
    const sendMessageSchema = z.object({
      conversationId: z.string().uuid(),
      content: z.string().min(1),
      attachments: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          url: z.string(),
          size: z.number(),
          type: z.string()
        })
      ).optional()
    });
    
    // POST /api/messages
    export async function POST(request: NextRequest) {
      try {
        // Verificar autenticação
        const session = await auth.getSession(request);
        if (!session) {
          return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }
        
        // Validar corpo da requisição
        const body = await request.json();
        const validationResult = sendMessageSchema.safeParse(body);
        
        if (!validationResult.success) {
          return NextResponse.json(
            { error: 'Dados inválidos', details: validationResult.error.format() },
            { status: 400 }
          );
        }
        
        // Verificar se a conversa existe e pertence ao usuário
        const conversation = await conversationsRepo.getById(validationResult.data.conversationId);
        
        if (!conversation) {
          return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 });
        }
        
        if (conversation.tenantId !== session.user.tenantId) {
          return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }
        
        // Criar mensagem do usuário
        const userMessageId = uuidv4();
        const userMessage = await messagesRepo.create({
          id: userMessageId,
          conversationId: validationResult.data.conversationId,
          content: validationResult.data.content,
          role: 'user',
          userId: session.user.id,
          attachments: validationResult.data.attachments
        });
        
        // Atualizar preview da conversa
        await conversationsRepo.update(
          validationResult.data.conversationId,
          session.user.tenantId,
          {
            lastMessageAt: new Date().toISOString(),
            lastMessagePreview: validationResult.data.content.substring(0, 100) + (validationResult.data.content.length > 100 ? '...' : '')
          }
        );
        
        // Obter histórico da conversa para contexto
        const messageHistory = await messagesRepo.getConversationHistory(validationResult.data.conversationId, 10);
        
        // Gerar resposta com IA
        const assistantMessageId = uuidv4();
        
        // Iniciar resposta em streaming
        messagesRepo.create({
          id: assistantMessageId,
          conversationId: validationResult.data.conversationId,
          content: '',  // Iniciar vazio para streaming
          role: 'assistant',
          userId: 'system',
          status: 'generating'
        });
        
        // Preparar contexto para a IA
        const messages = messageHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        // Adicionar a mensagem atual
        messages.push({
          role: 'user',
          content: validationResult.data.content
        });
        
        // Obter dados do usuário e suas preferências
        const userProfile = await fetch(`/api/users/profile?userId=${session.user.id}`)
          .then(res => res.json())
          .catch(() => null);
          
        // Montar prompt do sistema com contexto de crédito rural
        const systemPrompt = `Você é um assistente especializado em crédito rural no Brasil, com conhecimento profundo do Manual de Crédito Rural (MCR), programas como Pronaf, Pronamp, e linhas de crédito de bancos públicos e privados.
        
        ${userProfile?.aiPreferences?.detailLevel === 'Detalhado' 
          ? 'Forneça respostas detalhadas com exemplos e referências quando possível.' 
          : userProfile?.aiPreferences?.detailLevel === 'Básico' 
          ? 'Forneça respostas concisas e diretas.' 
          : 'Mantenha um equilíbrio entre profundidade e concisão.'}
          
        ${userProfile?.aiPreferences?.includeMarketPrices 
          ? 'Quando relevante, mencione preços e tendências atuais de mercado.' 
          : 'Foque nos aspectos financeiros, documentais e jurídicos, sem entrar em aspectos de preços atuais.'}
        `;
        
        // Enviar para Bedrock de forma assíncrona
        bedrockService.generateStreamingResponse({
          messages,
          systemPrompt,
          messageId: assistantMessageId,
          conversationId: validationResult.data.conversationId
        });
        
        // Retornar mensagem do usuário e placeholder para a resposta em andamento
        const assistantMessagePlaceholder = {
          id: assistantMessageId,
          conversationId: validationResult.data.conversationId,
          content: '',
          role: 'assistant',
          createdAt: new Date().toISOString(),
          status: 'generating'
        };
        
        return NextResponse.json({ 
          userMessage, 
          assistantMessage: assistantMessagePlaceholder 
        }, { status: 201 });
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        return NextResponse.json(
          { error: 'Erro ao processar mensagem' },
          { status: 500 }
        );
      }
    }
    ```
  
  - **Recuperação de histórico** - Implementar endpoint para buscar histórico em `src/app/api/conversations/[id]/messages/route.ts`:
    ```typescript
    import { NextRequest, NextResponse } from 'next/server';
    import { auth } from '@/lib/auth';
    import { messagesRepo } from '@/repositories/messagesRepo';
    import { conversationsRepo } from '@/repositories/conversationsRepo';
    
    // GET /api/conversations/[id]/messages
    export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
      try {
        const conversationId = params.id;
        
        // Verificar autenticação
        const session = await auth.getSession(request);
        if (!session) {
          return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }
        
        // Verificar se a conversa existe e pertence ao usuário
        const conversation = await conversationsRepo.getById(conversationId);
        
        if (!conversation) {
          return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 });
        }
        
        if (conversation.tenantId !== session.user.tenantId) {
          return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }
        
        // Obter parâmetros de paginação
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const before = searchParams.get('before');
        
        // Buscar mensagens
        const messages = await messagesRepo.getConversationMessages({
          conversationId,
          limit,
          before
        });
        
        return NextResponse.json(messages);
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        return NextResponse.json(
          { error: 'Erro ao processar solicitação' },
          { status: 500 }
        );
      }
    }
    ```
  
  - **Criação de novas conversas** - Já implementado no endpoint `/api/conversations` da seção 3.1

- [ ] **Implementar lógica de armazenamento no DynamoDB**
  - Criar repositório de mensagens em `src/repositories/messagesRepo.ts`:
    ```typescript
    import { BaseRepository } from './baseRepo';
    import { v4 as uuidv4 } from 'uuid';
    
    export interface Message {
      id: string;
      conversationId: string;
      content: string;
      role: 'user' | 'assistant' | 'system';
      userId: string;
      createdAt: string;
      updatedAt: string;
      status?: 'sending' | 'sent' | 'generating' | 'error';
      attachments?: {
        id: string;
        name: string;
        url: string;
        size: number;
        type: string;
      }[];
    }
    
    export interface GetMessagesParams {
      conversationId: string;
      limit?: number;
      before?: string;
    }
    
    class MessagesRepository extends BaseRepository<Message> {
      constructor() {
        super('Messages');
      }
      
      /**
       * Criar nova mensagem
       */
      async create(data: Partial<Message>): Promise<Message> {
        const id = data.id || uuidv4();
        
        return super.create({
          id,
          ...data
        });
      }
      
      /**
       * Obter mensagens de uma conversa com paginação
       */
      async getConversationMessages({ conversationId, limit = 50, before }: GetMessagesParams): Promise<Message[]> {
        const params: Record<string, any> = {
          KeyConditionExpression: 'conversationId = :conversationId',
          ExpressionAttributeValues: {
            ':conversationId': conversationId
          },
          Limit: limit,
          ScanIndexForward: true  // Ordem cronológica (mais antigas primeiro)
        };
        
        // Implementar paginação usando LastEvaluatedKey
        if (before) {
          params.ExclusiveStartKey = {
            conversationId,
            id: before
          };
        }
        
        return this.query(params);
      }
      
      /**
       * Obter histórico recente de uma conversa (N últimas mensagens)
       */
      async getConversationHistory(conversationId: string, count: number = 10): Promise<Message[]> {
        const params: Record<string, any> = {
          KeyConditionExpression: 'conversationId = :conversationId',
          ExpressionAttributeValues: {
            ':conversationId': conversationId
          },
          Limit: count,
          ScanIndexForward: false  // Ordem inversa (mais recentes primeiro)
        };
        
        const messages = await this.query(params);
        
        // Inverter novamente para ordem cronológica
        return messages.reverse();
      }
      
      /**
       * Atualizar conteúdo de uma mensagem (para streaming)
       */
      async updateContent(id: string, conversationId: string, content: string, status?: string): Promise<Message> {
        const updates: Partial<Message> = { content };
        
        if (status) {
          updates.status = status as any;
        }
        
        return super.update({ id, conversationId }, updates);
      }
      
      /**
       * Excluir uma mensagem
       */
      async delete(id: string, conversationId: string): Promise<void> {
        return super.delete({ id, conversationId });
      }
    }
    
    export const messagesRepo = new MessagesRepository();
    ```

- [ ] **Configurar sistema de streaming para mensagens longas**
  - Implementar streaming com SSE (Server-Sent Events) em `src/app/api/messages/[id]/stream/route.ts`:
    ```typescript
    import { NextRequest } from 'next/server';
    import { auth } from '@/lib/auth';
    import { messagesRepo } from '@/repositories/messagesRepo';
    import { conversationsRepo } from '@/repositories/conversationsRepo';
    
    // GET /api/messages/[id]/stream
    export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
      const messageId = params.id;
      
      // Verificar autenticação
      const session = await auth.getSession(request);
      if (!session) {
        return new Response(JSON.stringify({ error: 'Não autenticado' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      try {
        // Obter a mensagem para verificar a conversa
        const message = await messagesRepo.getById(messageId);
        
        if (!message) {
          return new Response(JSON.stringify({ error: 'Mensagem não encontrada' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Verificar se a conversa pertence ao usuário
        const conversation = await conversationsRepo.getById(message.conversationId);
        
        if (!conversation || conversation.tenantId !== session.user.tenantId) {
          return new Response(JSON.stringify({ error: 'Acesso negado' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Configurar streaming com SSE
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            // Verificar status periodicamente
            const checkInterval = 1000; // 1 segundo
            let lastContent = '';
            
            const checkUpdates = async () => {
              try {
                const updatedMessage = await messagesRepo.getById(messageId);
                
                if (!updatedMessage) {
                  controller.close();
                  return;
                }
                
                // Se o conteúdo mudou, enviar atualização
                if (updatedMessage.content !== lastContent) {
                  const diff = updatedMessage.content.substring(lastContent.length);
                  lastContent = updatedMessage.content;
                  
                  const event = {
                    data: diff,
                    status: updatedMessage.status || 'generating'
                  };
                  
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
                }
                
                // Se a geração está completa, finalizar o stream
                if (updatedMessage.status === 'sent' || updatedMessage.status === 'error') {
                  const finalEvent = {
                    data: '',
                    status: updatedMessage.status,
                    done: true
                  };
                  
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalEvent)}\n\n`));
                  controller.close();
                  return;
                }
                
                // Continuar verificando
                setTimeout(checkUpdates, checkInterval);
              } catch (error) {
                console.error('Erro ao verificar atualizações da mensagem:', error);
                controller.close();
              }
            };
            
            // Iniciar verificação
            checkUpdates();
          }
        });
        
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        });
      } catch (error) {
        console.error('Erro ao configurar streaming:', error);
        return new Response(JSON.stringify({ error: 'Erro interno' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    ```
  
  - Implementar classe de serviço para processar respostas da IA em streaming em `src/lib/bedrock.ts`:
    ```typescript
    // Adicionar ao arquivo existente src/lib/bedrock.ts
    
    // Interface para streaming
    interface StreamingParams {
      messages: Array<{ role: string; content: string }>;
      systemPrompt?: string;
      messageId: string;
      conversationId: string;
    }
    
    // Adicionar método para geração com streaming
    async generateStreamingResponse(params: StreamingParams) {
      const { messages, systemPrompt, messageId, conversationId } = params;
      
      try {
        // Iniciar a mensagem como vazia e em geração
        await messagesRepo.updateContent(messageId, conversationId, '', 'generating');
        
        const input = {
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 4000,
          temperature: 0.7,
          system: systemPrompt || "Você é um assistente especialista em crédito rural no Brasil.",
          messages
        };
        
        const command = new InvokeModelWithResponseStreamCommand({
          modelId: this.modelId,
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify(input)
        });
        
        const response = await this.client.send(command);
        
        // Processar o stream de resposta
        let fullContent = '';
        
        if (response.body) {
          // Para cada chunk recebido
          for await (const chunk of response.body) {
            try {
              const parsed = JSON.parse(Buffer.from(chunk.bytes).toString());
              
              if (parsed.completion) {
                const newContent = parsed.completion;
                fullContent += newContent;
                
                // Atualizar a mensagem no banco de dados a cada chunk
                await messagesRepo.updateContent(messageId, conversationId, fullContent, 'generating');
              }
            } catch (e) {
              console.error('Erro ao processar chunk:', e);
            }
          }
        }
        
        // Finalizar a mensagem com status 'sent'
        await messagesRepo.updateContent(messageId, conversationId, fullContent, 'sent');
        
        return { success: true, messageId };
      } catch (error) {
        console.error('Erro ao gerar resposta em streaming:', error);
        
        // Marcar a mensagem com erro
        await messagesRepo.updateContent(
          messageId, 
          conversationId, 
          'Desculpe, houve um erro ao gerar a resposta. Por favor, tente novamente.', 
          'error'
        );
        
        return { success: false, error };
      }
    }
    ```
  
  - Implementar componente do lado cliente para consumir o streaming em `src/components/chat/StreamingMessage.tsx`:
    ```typescript
    'use client';
    
    import React, { useEffect, useState } from 'react';
    import { Message } from '@/types/chat';
    import MessageItem from './MessageItem';
    
    interface StreamingMessageProps {
      message: Message;
      onComplete?: (finalMessage: Message) => void;
    }
    
    export default function StreamingMessage({ message, onComplete }: StreamingMessageProps) {
      const [content, setContent] = useState(message.content);
      const [status, setStatus] = useState(message.status || 'generating');
      
      useEffect(() => {
        if (status === 'sent' || status === 'error') {
          return;
        }
        
        // Conectar ao stream
        const eventSource = new EventSource(`/api/messages/${message.id}/stream`);
        
        eventSource.onmessage = (event) => {
          try {
            const { data, status: newStatus, done } = JSON.parse(event.data);
            
            if (data) {
              setContent(prev => prev + data);
            }
            
            if (newStatus) {
              setStatus(newStatus);
            }
            
            // Fechar conexão quando finalizado
            if (done) {
              eventSource.close();
              
              if (onComplete) {
                onComplete({
                  ...message,
                  content,
                  status: newStatus
                });
              }
            }
          } catch (error) {
            console.error('Erro ao processar evento:', error);
          }
        };
        
        eventSource.onerror = () => {
          console.error('Erro na conexão SSE');
          eventSource.close();
          setStatus('error');
        };
        
        return () => {
          eventSource.close();
        };
      }, [message.id, status]);
      
      // Renderizar mensagem com conteúdo atual
      const currentMessage = {
        ...message,
        content,
        status
      };
      
      return (
        <div>
          <MessageItem message={currentMessage} />
          {status === 'generating' && (
            <div className="text-xs text-gray-500 mt-1 ml-12 animate-pulse">
              Gerando resposta...
            </div>
          )}
        </div>
      );
    }
    ```

### 3.3. Desenvolvimento do Sistema de Arquivos (4 dias)
- [ ] **Implementar endpoints para gerenciamento de arquivos**
  - **Upload de arquivos** - Implementar endpoint em `src/app/api/files/route.ts`:
    ```typescript
    import { NextRequest, NextResponse } from 'next/server';
    import { auth } from '@/lib/auth';
    import { s3Service } from '@/lib/s3';
    import { filesRepo } from '@/repositories/filesRepo';
    import { v4 as uuidv4 } from 'uuid';
    
    // POST /api/files
    export async function POST(request: NextRequest) {
      try {
        // Verificar autenticação
        const session = await auth.getSession(request);
        if (!session) {
          return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }
        
        // Processar o upload com formData
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const conversationId = formData.get('conversationId') as string;
        
        if (!file) {
          return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 400 });
        }
        
        // Validar tamanho do arquivo (máximo 10MB)
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_SIZE) {
          return NextResponse.json(
            { error: 'O arquivo excede o tamanho máximo permitido de 10MB' },
            { status: 400 }
          );
        }
        
        // Gerar nome único para o arquivo
        const fileName = file.name;
        const fileId = uuidv4();
        const fileType = file.type;
        const fileExt = fileName.split('.').pop();
        const uniqueFileName = `${session.user.tenantId}/${fileId}.${fileExt}`;
        
        // Ler o arquivo como ArrayBuffer
        const buffer = await file.arrayBuffer();
        
        // Fazer upload para o S3
        const uploadResult = await s3Service.uploadFile({
          buffer: Buffer.from(buffer),
          fileName: uniqueFileName,
          contentType: fileType
        });
        
        if (!uploadResult.success) {
          return NextResponse.json(
            { error: 'Erro ao fazer upload do arquivo' },
            { status: 500 }
          );
        }
        
        // Salvar os metadados do arquivo no DynamoDB
        const fileData = {
          id: fileId,
          tenantId: session.user.tenantId,
          userId: session.user.id,
          conversationId: conversationId || null,
          name: fileName,
          size: file.size,
          type: fileType,
          extension: fileExt,
          path: uniqueFileName,
          url: uploadResult.url,
          createdAt: new Date().toISOString()
        };
        
        const savedFile = await filesRepo.create(fileData);
        
        return NextResponse.json(savedFile, { status: 201 });
      } catch (error) {
        console.error('Erro no upload de arquivo:', error);
        return NextResponse.json(
          { error: 'Erro ao processar o upload' },
          { status: 500 }
        );
      }
    }
    
    // GET /api/files
    export async function GET(request: NextRequest) {
      try {
        // Verificar autenticação
        const session = await auth.getSession(request);
        if (!session) {
          return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }
        
        // Obter parâmetros de filtro
        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get('conversationId');
        
        // Buscar arquivos do usuário/tenant
        let files;
        if (conversationId) {
          files = await filesRepo.getByConversationId(conversationId, session.user.tenantId);
        } else {
          files = await filesRepo.getByTenantId(session.user.tenantId);
        }
        
        return NextResponse.json(files);
      } catch (error) {
        console.error('Erro ao listar arquivos:', error);
        return NextResponse.json(
          { error: 'Erro ao listar arquivos' },
          { status: 500 }
        );
      }
    }
    ```
  
  - **Download de arquivos** - Implementar endpoint em `src/app/api/files/[id]/download/route.ts`:
    ```typescript
    import { NextRequest, NextResponse } from 'next/server';
    import { auth } from '@/lib/auth';
    import { s3Service } from '@/lib/s3';
    import { filesRepo } from '@/repositories/filesRepo';
    
    // GET /api/files/[id]/download
    export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
      try {
        const fileId = params.id;
        
        // Verificar autenticação
        const session = await auth.getSession(request);
        if (!session) {
          return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }
        
        // Buscar metadados do arquivo
        const file = await filesRepo.getById(fileId);
        
        if (!file) {
          return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
        }
        
        // Verificar se o usuário tem acesso
        if (file.tenantId !== session.user.tenantId) {
          return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }
        
        // Gerar URL de download temporária
        const presignedUrl = await s3Service.getPresignedUrl(file.path, file.name);
        
        // Redirecionar para a URL pré-assinada
        return NextResponse.redirect(presignedUrl);
      } catch (error) {
        console.error('Erro ao fazer download do arquivo:', error);
        return NextResponse.json(
          { error: 'Erro ao fazer download' },
          { status: 500 }
        );
      }
    }
    ```
  
  - **Exclusão de arquivos** - Implementar endpoint em `src/app/api/files/[id]/route.ts`:
    ```typescript
    import { NextRequest, NextResponse } from 'next/server';
    import { auth } from '@/lib/auth';
    import { s3Service } from '@/lib/s3';
    import { filesRepo } from '@/repositories/filesRepo';
    
    // DELETE /api/files/[id]
    export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
      try {
        const fileId = params.id;
        
        // Verificar autenticação
        const session = await auth.getSession(request);
        if (!session) {
          return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }
        
        // Buscar metadados do arquivo
        const file = await filesRepo.getById(fileId);
        
        if (!file) {
          return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
        }
        
        // Verificar se o usuário tem acesso
        if (file.tenantId !== session.user.tenantId) {
          return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }
        
        // Excluir do S3
        await s3Service.deleteFile(file.path);
        
        // Excluir do DynamoDB
        await filesRepo.delete(fileId);
        
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('Erro ao excluir arquivo:', error);
        return NextResponse.json(
          { error: 'Erro ao excluir arquivo' },
          { status: 500 }
        );
      }
    }
    
    // GET /api/files/[id]
    export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
      try {
        const fileId = params.id;
        
        // Verificar autenticação
        const session = await auth.getSession(request);
        if (!session) {
          return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }
        
        // Buscar metadados do arquivo
        const file = await filesRepo.getById(fileId);
        
        if (!file) {
          return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
        }
        
        // Verificar se o usuário tem acesso
        if (file.tenantId !== session.user.tenantId) {
          return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }
        
        return NextResponse.json(file);
      } catch (error) {
        console.error('Erro ao buscar arquivo:', error);
        return NextResponse.json(
          { error: 'Erro ao buscar arquivo' },
          { status: 500 }
        );
      }
    }
    ```

- [ ] **Configurar integração com o AWS S3**
  - Implementar serviço S3 em `src/lib/s3.ts`:
    ```typescript
    import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
    import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
    
    interface UploadParams {
      buffer: Buffer;
      fileName: string;
      contentType: string;
    }
    
    class S3Service {
      private client: S3Client;
      private bucketName: string;
      private region: string;
      
      constructor() {
        this.region = process.env.AWS_REGION || 'us-east-1';
        this.bucketName = process.env.S3_BUCKET_NAME || 'agrocredit-files';
        
        this.client = new S3Client({
          region: this.region,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
          }
        });
      }
      
      /**
       * Fazer upload de um arquivo para o S3
       */
      async uploadFile({ buffer, fileName, contentType }: UploadParams) {
        try {
          const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileName,
            Body: buffer,
            ContentType: contentType
          });
          
          await this.client.send(command);
          
          // Gerar URL pública
          const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${encodeURIComponent(fileName)}`;
          
          return {
            success: true,
            url: fileUrl
          };
        } catch (error) {
          console.error('Erro ao fazer upload para o S3:', error);
          return {
            success: false,
            error
          };
        }
      }
      
      /**
       * Gerar URL pré-assinada para download
       */
      async getPresignedUrl(key: string, originalFileName: string) {
        const command = new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          ResponseContentDisposition: `attachment; filename="${encodeURIComponent(originalFileName)}"`
        });
        
        // URL expira em 1 hora
        return await getSignedUrl(this.client, command, { expiresIn: 3600 });
      }
      
      /**
       * Excluir arquivo do S3
       */
      async deleteFile(key: string) {
        const command = new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key
        });
        
        return this.client.send(command);
      }
    }
    
    export const s3Service = new S3Service();
    ```

- [ ] **Implementar sistema de gestão de anexos**
  - Criar repositório de arquivos em `src/repositories/filesRepo.ts`:
    ```typescript
    import { BaseRepository } from './baseRepo';
    
    export interface File {
      id: string;
      tenantId: string;
      userId: string;
      conversationId: string | null;
      name: string;
      size: number;
      type: string;
      extension: string;
      path: string;
      url: string;
      createdAt: string;
    }
    
    class FilesRepository extends BaseRepository<File> {
      constructor() {
        super('Files');
      }
      
      /**
       * Criar novo arquivo
       */
      async create(data: Partial<File>): Promise<File> {
        return super.create(data);
      }
      
      /**
       * Buscar arquivos por ID da conversa
       */
      async getByConversationId(conversationId: string, tenantId: string): Promise<File[]> {
        const params = {
          FilterExpression: 'conversationId = :conversationId AND tenantId = :tenantId',
          ExpressionAttributeValues: {
            ':conversationId': conversationId,
            ':tenantId': tenantId
          }
        };
        
        return this.scan(params);
      }
      
      /**
       * Buscar todos os arquivos de um tenant
       */
      async getByTenantId(tenantId: string): Promise<File[]> {
        const params = {
          FilterExpression: 'tenantId = :tenantId',
          ExpressionAttributeValues: {
            ':tenantId': tenantId
          }
        };
        
        return this.scan(params);
      }
    }
    
    export const filesRepo = new FilesRepository();
    ```
  
  - Implementar componentes de UI para upload e visualização em `src/components/chat/FileUpload.tsx`:
    ```typescript
    'use client';
    
    import React, { useState, useRef } from 'react';
    import { Upload, X, FileIcon, Paperclip } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Progress } from '@/components/ui/progress';
    import { toast } from '@/components/ui/use-toast';
    
    interface FileUploadProps {
      conversationId: string;
      onFileUploaded: (file: any) => void;
    }
    
    export default function FileUpload({ conversationId, onFileUploaded }: FileUploadProps) {
      const [isUploading, setIsUploading] = useState(false);
      const [progress, setProgress] = useState(0);
      const fileInputRef = useRef<HTMLInputElement>(null);
      
      const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Validar tipo de arquivo
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'text/csv',
          'image/jpeg',
          'image/png',
          'image/gif'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: 'Tipo de arquivo não suportado',
            description: 'Por favor, envie apenas documentos, planilhas, imagens ou arquivos de texto.',
            variant: 'destructive'
          });
          return;
        }
        
        // Validar tamanho (máximo 10MB)
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_SIZE) {
          toast({
            title: 'Arquivo muito grande',
            description: 'O tamanho máximo permitido é 10MB.',
            variant: 'destructive'
          });
          return;
        }
        
        // Iniciar upload
        setIsUploading(true);
        setProgress(0);
        
        // Simular progresso
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 95) {
              clearInterval(interval);
              return 95;
            }
            return prev + 5;
          });
        }, 100);
        
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('conversationId', conversationId);
          
          const response = await fetch('/api/files', {
            method: 'POST',
            body: formData
          });
          
          clearInterval(interval);
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao fazer upload do arquivo');
          }
          
          setProgress(100);
          
          const uploadedFile = await response.json();
          onFileUploaded(uploadedFile);
          
          toast({
            title: 'Upload concluído',
            description: `${file.name} foi enviado com sucesso.`,
            variant: 'default'
          });
        } catch (error) {
          toast({
            title: 'Erro no upload',
            description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
            variant: 'destructive'
          });
        } finally {
          setIsUploading(false);
          setProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      
      return (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif"
          />
          
          {isUploading ? (
            <div className="flex flex-col gap-2 p-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Enviando arquivo...</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => setIsUploading(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-gray-500 hover:text-gray-800"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4 mr-1" />
              Anexar arquivo
            </Button>
          )}
        </div>
      );
    }
    ```
  
  - Implementar componente para exibir anexos em `src/components/chat/FileAttachments.tsx`:
    ```typescript
    'use client';
    
    import React from 'react';
    import { FileIcon, X, Download } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    
    interface Attachment {
      id: string;
      name: string;
      url: string;
      size: number;
      type: string;
    }
    
    interface FileAttachmentsProps {
      attachments: Attachment[];
      onRemove?: (id: string) => void;
      showRemove?: boolean;
    }
    
    export default function FileAttachments({ 
      attachments, 
      onRemove,
      showRemove = false 
    }: FileAttachmentsProps) {
      if (!attachments || attachments.length === 0) {
        return null;
      }
      
      const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' bytes';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      };
      
      const handleDownload = (id: string) => {
        window.open(`/api/files/${id}/download`, '_blank');
      };
      
      return (
        <div className="flex flex-col gap-2 mt-2">
          {attachments.map(attachment => (
            <div 
              key={attachment.id} 
              className="flex items-center gap-2 p-2 rounded-md bg-gray-100 dark:bg-gray-800"
            >
              <FileIcon className="h-4 w-4 text-gray-500" />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handleDownload(attachment.id)}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                {showRemove && onRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-500 hover:text-red-500"
                    onClick={() => onRemove(attachment.id)}
                    title="Remover"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }
    ```

### 3.4. Manutenção do Sistema de Assinatura (3 dias)
- [ ] **Validar integração com Asaas**
  - Revisar implementação de webhook em `src/app/api/webhooks/asaas/route.ts`:
    ```typescript
    import { NextRequest, NextResponse } from 'next/server';
    import { z } from 'zod';
    import crypto from 'crypto';
    import { subscriptionsRepo } from '@/repositories/subscriptionsRepo';
    import { tenantsRepo } from '@/repositories/tenantsRepo';
    
    // Schema para validar eventos do Asaas
    const asaasEventSchema = z.object({
      event: z.string(),
      payment: z.object({
        id: z.string(),
        customer: z.string(),
        subscription: z.string().optional(),
        value: z.number(),
        netValue: z.number(),
        billingType: z.string(),
        status: z.string(),
        dueDate: z.string(),
        paymentDate: z.string().optional(),
        invoiceUrl: z.string().optional(),
        invoiceNumber: z.string().optional()
      })
    });
    
    // POST /api/webhooks/asaas
    export async function POST(request: NextRequest) {
      try {
        // Verificar assinatura do webhook para segurança
        const signature = request.headers.get('asaas-signature') || '';
        const body = await request.text();
        
        const secret = process.env.ASAAS_WEBHOOK_SECRET || '';
        const hmac = crypto.createHmac('sha256', secret);
        const calculatedSignature = hmac.update(body).digest('hex');
        
        if (calculatedSignature !== signature) {
          console.error('Assinatura inválida no webhook do Asaas');
          return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
        }
        
        // Processar evento
        const event = JSON.parse(body);
        const validationResult = asaasEventSchema.safeParse(event);
        
        if (!validationResult.success) {
          console.error('Dados inválidos do webhook:', validationResult.error);
          return NextResponse.json(
            { error: 'Formato de dados inválido' },
            { status: 400 }
          );
        }
        
        const { data } = validationResult;
        
        // Processar eventos de pagamento
        if (data.event === 'PAYMENT_RECEIVED' || data.event === 'PAYMENT_CONFIRMED') {
          // Buscar assinatura no DynamoDB
          const subscription = await subscriptionsRepo.getByPaymentGatewayId(data.payment.subscription || '');
          
          if (!subscription) {
            console.error('Assinatura não encontrada para o ID:', data.payment.subscription);
            return NextResponse.json(
              { error: 'Assinatura não encontrada' },
              { status: 404 }
            );
          }
          
          // Atualizar status da assinatura
          await subscriptionsRepo.update(subscription.id, {
            status: 'active',
            currentPeriodEnd: new Date(
              new Date(data.payment.dueDate).getTime() + 30 * 24 * 60 * 60 * 1000 // +30 dias
            ).toISOString(),
            lastPaymentDate: data.payment.paymentDate || new Date().toISOString(),
            lastPaymentAmount: data.payment.value,
            lastInvoiceUrl: data.payment.invoiceUrl
          });
          
          // Atualizar status do tenant
          await tenantsRepo.update(subscription.tenantId, {
            status: 'active'
          });
          
          console.log(`Assinatura ${subscription.id} atualizada com sucesso após pagamento`);
        }
        
        // Processar eventos de falha de pagamento
        if (data.event === 'PAYMENT_OVERDUE' || data.event === 'PAYMENT_DENIED') {
          // Buscar assinatura no DynamoDB
          const subscription = await subscriptionsRepo.getByPaymentGatewayId(data.payment.subscription || '');
          
          if (!subscription) {
            console.error('Assinatura não encontrada para o ID:', data.payment.subscription);
            return NextResponse.json(
              { error: 'Assinatura não encontrada' },
              { status: 404 }
            );
          }
          
          // Contar dias de atraso
          const dueDate = new Date(data.payment.dueDate);
          const today = new Date();
          const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000));
          
          let tenantStatus = 'active';
          
          // Se mais de 7 dias de atraso, suspender acesso
          if (daysOverdue > 7) {
            tenantStatus = 'suspended';
          }
          
          // Atualizar status da assinatura
          await subscriptionsRepo.update(subscription.id, {
            status: 'past_due',
            lastFailedPaymentDate: new Date().toISOString()
          });
          
          // Atualizar status do tenant
          await tenantsRepo.update(subscription.tenantId, {
            status: tenantStatus
          });
          
          console.log(`Assinatura ${subscription.id} marcada como inadimplente`);
        }
        
        // Processar eventos de cancelamento
        if (data.event === 'PAYMENT_DELETED' || data.event === 'SUBSCRIPTION_CANCELED') {
          // Buscar assinatura no DynamoDB
          const subscription = await subscriptionsRepo.getByPaymentGatewayId(data.payment.subscription || '');
          
          if (subscription) {
            // Atualizar status da assinatura
            await subscriptionsRepo.update(subscription.id, {
              status: 'canceled',
              canceledAt: new Date().toISOString()
            });
            
            // Atualizar status do tenant
            await tenantsRepo.update(subscription.tenantId, {
              status: 'canceled'
            });
            
            console.log(`Assinatura ${subscription.id} cancelada com sucesso`);
          }
        }
        
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('Erro ao processar webhook do Asaas:', error);
        return NextResponse.json(
          { error: 'Erro ao processar webhook' },
          { status: 500 }
        );
      }
    }
    ```

- [ ] **Adaptar para planos específicos do AgroCredit AI**
  - Criar arquivo de planos em `src/config/plans.ts`:
    ```typescript
    export interface Plan {
      id: string;
      name: string;
      description: string;
      features: string[];
      monthlyPrice: number;
      yearlyPrice: number;
      monthlyPriceId: string; // ID do plano mensal no Asaas
      yearlyPriceId: string;  // ID do plano anual no Asaas
      maxUsers: number;
      maxMessages: number;
      maxUploads: number;
      supportLevel: 'basic' | 'priority' | 'dedicated';
      aiModelAccess: string[];
    }
    
    export const plans: Plan[] = [
      {
        id: 'starter',
        name: 'Starter',
        description: 'Ideal para profissionais autônomos do crédito rural',
        features: [
          'Acesso à base de conhecimento básica',
          'Upload de até 20 arquivos por mês',
          'Até 1.000 mensagens por mês',
          'Suporte por email'
        ],
        monthlyPrice: 147.00,
        yearlyPrice: 1411.20, // 20% de desconto
        monthlyPriceId: 'plan_starter_monthly',
        yearlyPriceId: 'plan_starter_yearly',
        maxUsers: 1,
        maxMessages: 1000,
        maxUploads: 20,
        supportLevel: 'basic',
        aiModelAccess: ['anthropic.claude-instant-v1']
      },
      {
        id: 'professional',
        name: 'Professional',
        description: 'Para consultores e escritórios de pequeno porte',
        features: [
          'Acesso à base de conhecimento completa',
          'Upload de até 50 arquivos por mês',
          'Até 3.000 mensagens por mês',
          'Até 3 usuários',
          'Suporte prioritário'
        ],
        monthlyPrice: 297.00,
        yearlyPrice: 2851.20, // 20% de desconto
        monthlyPriceId: 'plan_professional_monthly',
        yearlyPriceId: 'plan_professional_yearly',
        maxUsers: 3,
        maxMessages: 3000,
        maxUploads: 50,
        supportLevel: 'priority',
        aiModelAccess: ['anthropic.claude-v2']
      },
      {
        id: 'business',
        name: 'Business',
        description: 'Para empresas e escritórios de médio/grande porte',
        features: [
          'Acesso à base de conhecimento premium',
          'Upload ilimitado de arquivos',
          'Mensagens ilimitadas',
          'Até 10 usuários',
          'Gerente de conta dedicado',
          'Personalização de base de conhecimento'
        ],
        monthlyPrice: 797.00,
        yearlyPrice: 7651.20, // 20% de desconto
        monthlyPriceId: 'plan_business_monthly',
        yearlyPriceId: 'plan_business_yearly',
        maxUsers: 10,
        maxMessages: Number.POSITIVE_INFINITY,
        maxUploads: Number.POSITIVE_INFINITY,
        supportLevel: 'dedicated',
        aiModelAccess: ['anthropic.claude-v2', 'anthropic.claude-3-sonnet-20240229-v1:0']
      }
    ];
    
    export function getPlanById(id: string): Plan | undefined {
      return plans.find(plan => plan.id === id);
    }
    
    export function getPlanLimits(planId: string) {
      const plan = getPlanById(planId) || plans[0];
      return {
        maxUsers: plan.maxUsers,
        maxMessages: plan.maxMessages,
        maxUploads: plan.maxUploads,
        supportLevel: plan.supportLevel,
        aiModelAccess: plan.aiModelAccess
      };
    }
    ```

- [ ] **Implementar verificação de status de assinatura**
  - Criar middleware de verificação de limite em `src/lib/subscription-limiter.ts`:
    ```typescript
    import { NextRequest, NextResponse } from 'next/server';
    import { auth } from './auth';
    import { subscriptionsRepo } from '@/repositories/subscriptionsRepo';
    import { usageRepo } from '@/repositories/usageRepo';
    import { getPlanLimits } from '@/config/plans';
    
    /**
     * Middleware para verificar limites de uso da assinatura
     */
    export async function checkSubscriptionLimits(request: NextRequest, resourceType: 'message' | 'upload' | 'user') {
      try {
        // Verificar autenticação
        const session = await auth.getSession(request);
        if (!session) {
          return {
            allowed: false,
            error: 'Não autenticado'
          };
        }
        
        // Verificar se o tenant tem uma assinatura ativa
        const subscription = await subscriptionsRepo.getActiveByTenantId(session.user.tenantId);
        
        if (!subscription) {
          return {
            allowed: false,
            error: 'Assinatura não encontrada ou inativa'
          };
        }
        
        // Verificar se a assinatura está em período de trial
        const isInTrialPeriod = subscription.trialEndsAt 
          ? new Date(subscription.trialEndsAt) > new Date() 
          : false;
        
        // Se for período de trial, permitir o acesso
        if (isInTrialPeriod) {
          return { allowed: true };
        }
        
        // Verificar se a assinatura está ativa
        if (subscription.status !== 'active') {
          const errorMessage = subscription.status === 'past_due' 
            ? 'Assinatura com pagamento pendente'
            : 'Assinatura inativa';
            
          return {
            allowed: false,
            error: errorMessage
          };
        }
        
        // Obter limites do plano
        const planLimits = getPlanLimits(subscription.planId);
        
        // Verificar o tipo de recurso solicitado
        const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
        
        if (resourceType === 'message') {
          // Verificar limite de mensagens
          const usage = await usageRepo.getMonthlyUsage(session.user.tenantId, currentMonth);
          
          if (usage.messageCount >= planLimits.maxMessages && planLimits.maxMessages !== Number.POSITIVE_INFINITY) {
            return {
              allowed: false,
              error: 'Limite mensal de mensagens atingido'
            };
          }
        }
        
        if (resourceType === 'upload') {
          // Verificar limite de uploads
          const usage = await usageRepo.getMonthlyUsage(session.user.tenantId, currentMonth);
          
          if (usage.uploadCount >= planLimits.maxUploads && planLimits.maxUploads !== Number.POSITIVE_INFINITY) {
            return {
              allowed: false,
              error: 'Limite mensal de uploads atingido'
            };
          }
        }
        
        if (resourceType === 'user') {
          // Verificar limite de usuários
          const userCount = await usageRepo.getUserCount(session.user.tenantId);
          
          if (userCount >= planLimits.maxUsers) {
            return {
              allowed: false,
              error: 'Limite de usuários atingido'
            };
          }
        }
        
        // Se chegou até aqui, está dentro dos limites
        return { allowed: true };
      } catch (error) {
        console.error('Erro ao verificar limites da assinatura:', error);
        return {
          allowed: false,
          error: 'Erro ao verificar limites da assinatura'
        };
      }
    }
    
    /**
     * Incrementar contador de uso
     */
    export async function incrementUsage(tenantId: string, resourceType: 'message' | 'upload') {
      try {
        const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
        
        // Buscar ou criar registro de uso para o mês atual
        let usage = await usageRepo.getMonthlyUsage(tenantId, currentMonth);
        
        // Se não existir, criar
        if (!usage) {
          usage = await usageRepo.create({
            tenantId,
            month: currentMonth,
            messageCount: 0,
            uploadCount: 0
          });
        }
        
        // Incrementar contador apropriado
        if (resourceType === 'message') {
          await usageRepo.updateMessageCount(tenantId, currentMonth, usage.messageCount + 1);
        }
        
        if (resourceType === 'upload') {
          await usageRepo.updateUploadCount(tenantId, currentMonth, usage.uploadCount + 1);
        }
        
        return true;
      } catch (error) {
        console.error('Erro ao incrementar uso:', error);
        return false;
      }
    }
    ```
  
  - Criar repositório de contagem de uso em `src/repositories/usageRepo.ts`:
    ```typescript
    import { BaseRepository } from './baseRepo';
    
    export interface Usage {
      tenantId: string;
      month: string; // formato: YYYY-MM
      messageCount: number;
      uploadCount: number;
    }
    
    class UsageRepository extends BaseRepository<Usage> {
      constructor() {
        super('Usage');
      }
      
      /**
       * Obter uso mensal de um tenant
       */
      async getMonthlyUsage(tenantId: string, month: string): Promise<Usage | null> {
        const params = {
          KeyConditionExpression: 'tenantId = :tenantId AND #month = :month',
          ExpressionAttributeNames: {
            '#month': 'month'
          },
          ExpressionAttributeValues: {
            ':tenantId': tenantId,
            ':month': month
          }
        };
        
        const results = await this.query(params);
        
        return results.length > 0 ? results[0] : null;
      }
      
      /**
       * Atualizar contador de mensagens
       */
      async updateMessageCount(tenantId: string, month: string, count: number): Promise<void> {
        await this.update(
          { tenantId, month },
          { messageCount: count }
        );
      }
      
      /**
       * Atualizar contador de uploads
       */
      async updateUploadCount(tenantId: string, month: string, count: number): Promise<void> {
        await this.update(
          { tenantId, month },
          { uploadCount: count }
        );
      }
      
      /**
       * Obter contagem de usuários de um tenant
       */
      async getUserCount(tenantId: string): Promise<number> {
        // A contagem de usuários vem da tabela Users
        const params = {
          TableName: 'Users',
          FilterExpression: 'tenantId = :tenantId',
          ExpressionAttributeValues: {
            ':tenantId': tenantId
          },
          Select: 'COUNT'
        };
        
        const result = await this.client.scan(params);
        return result.Count || 0;
      }
    }
    
    export const usageRepo = new UsageRepository();
    ```

- [ ] **Configurar período de trial de 7 dias**
  - Ajustar endpoint de criação de assinatura em `src/app/api/subscriptions/route.ts`:
    ```typescript
    import { NextRequest, NextResponse } from 'next/server';
    import { z } from 'zod';
    import { auth } from '@/lib/auth';
    import { subscriptionsRepo } from '@/repositories/subscriptionsRepo';
    import { tenantsRepo } from '@/repositories/tenantsRepo';
    import { asaasService } from '@/lib/asaas';
    import { getPlanById } from '@/config/plans';
    import { v4 as uuidv4 } from 'uuid';
    
    // Schema de validação para nova assinatura
    const newSubscriptionSchema = z.object({
      planId: z.string(),
      billingCycle: z.enum(['monthly', 'yearly']),
      customerName: z.string(),
      customerEmail: z.string().email(),
      customerDocument: z.string(), // CPF ou CNPJ
      customerPhone: z.string(),
      paymentMethod: z.enum(['credit_card', 'boleto', 'pix'])
    });
    
    // POST /api/subscriptions
    export async function POST(request: NextRequest) {
      try {
        // Verificar autenticação
        const session = await auth.getSession(request);
        if (!session) {
          return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }
        
        // Validar dados da requisição
        const body = await request.json();
        const validationResult = newSubscriptionSchema.safeParse(body);
        
        if (!validationResult.success) {
          return NextResponse.json(
            { error: 'Dados inválidos', details: validationResult.error.format() },
            { status: 400 }
          );
        }
        
        const { data } = validationResult;
        
        // Verificar se o plano existe
        const plan = getPlanById(data.planId);
        if (!plan) {
          return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
        }
        
        // Obter preço do plano
        const priceId = data.billingCycle === 'monthly' 
          ? plan.monthlyPriceId 
          : plan.yearlyPriceId;
          
        const price = data.billingCycle === 'monthly'
          ? plan.monthlyPrice
          : plan.yearlyPrice;
        
        // Verificar se o tenant já possui assinatura ativa
        const existingSubscription = await subscriptionsRepo.getActiveByTenantId(session.user.tenantId);
        
        if (existingSubscription) {
          return NextResponse.json(
            { error: 'Este tenant já possui uma assinatura ativa' },
            { status: 400 }
          );
        }
        
        // Calcular data de fim do período trial (7 dias a partir de hoje)
        const now = new Date();
        const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        // Criar ID de assinatura
        const subscriptionId = uuidv4();
        
        // Criar cliente e assinatura no gateway de pagamento (Asaas)
        // Definir início da cobrança após o período de trial
        const asaasSubscription = await asaasService.createSubscription({
          customer: {
            name: data.customerName,
            email: data.customerEmail,
            document: data.customerDocument,
            phone: data.customerPhone
          },
          subscription: {
            planId: priceId,
            nextDueDate: trialEndsAt.toISOString().split('T')[0], // Primeira cobrança após o trial
            billingCycle: data.billingCycle === 'monthly' ? 'MONTHLY' : 'YEARLY',
            value: price,
            description: `AgroCredit AI - Plano ${plan.name} (${data.billingCycle === 'monthly' ? 'Mensal' : 'Anual'})`,
            paymentMethod: data.paymentMethod.toUpperCase()
          }
        });
        
        if (!asaasSubscription.success) {
          return NextResponse.json(
            { error: 'Erro ao criar assinatura no gateway de pagamento', details: asaasSubscription.error },
            { status: 500 }
          );
        }
        
        // Criar assinatura no banco de dados
        const subscription = await subscriptionsRepo.create({
          id: subscriptionId,
          tenantId: session.user.tenantId,
          planId: data.planId,
          status: 'trialing',
          billingCycle: data.billingCycle,
          currentPeriodStart: now.toISOString(),
          currentPeriodEnd: trialEndsAt.toISOString(),
          trialEndsAt: trialEndsAt.toISOString(),
          paymentGatewayId: asaasSubscription.id,
          paymentMethod: data.paymentMethod,
          price: price,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerDocument: data.customerDocument,
          checkoutUrl: asaasSubscription.checkoutUrl
        });
        
        // Atualizar status do tenant
        await tenantsRepo.update(session.user.tenantId, {
          status: 'active',
          planId: data.planId
        });
        
        return NextResponse.json({
          subscription,
          checkoutUrl: asaasSubscription.checkoutUrl
        }, { status: 201 });
      } catch (error) {
        console.error('Erro ao criar assinatura:', error);
        return NextResponse.json(
          { error: 'Erro ao processar solicitação' },
          { status: 500 }
        );
      }
    }
    ```

## Fase 4: Integração com IA e Knowledge Base (2 semanas)

### 4.1. Desenvolvimento da Integração com AWS Bedrock
- [ ] Configurar cliente AWS Bedrock
- [ ] Implementar sistema de prompts para o domínio de crédito rural
- [ ] Desenvolver middleware de processamento de mensagens

### 4.2. Implementação da Knowledge Base
- [ ] Coletar documentação especializada:
  - [ ] Manual de Crédito Rural
  - [ ] Legislações aplicáveis
  - [ ] Documentação bancária
- [ ] Processar documentos para embeddings
- [ ] Carregar embeddings no Pinecone
- [ ] Implementar sistema RAG (Retrieval-Augmented Generation)

### 4.3. Configuração de Agente Especializado
- [ ] Desenvolver prompt de sistema especializado
- [ ] Implementar resposta a intenções específicas:
  - [ ] Análise de documentos
  - [ ] Geração de contratos
  - [ ] Simulações financeiras
- [ ] Configurar limites e parâmetros do modelo

## Fase 5: Funcionalidades Especializadas (2 semanas)

### 5.1. Implementação de Análise de Documentos
- [ ] Desenvolver sistema de processamento de documentos
- [ ] Implementar extração de informações relevantes
- [ ] Criar sistema de resumo e insights

### 5.2. Desenvolvimento do Gerador de Contratos
- [ ] Criar biblioteca de templates de contratos
- [ ] Implementar sistema de preenchimento automático
- [ ] Desenvolver exportação para PDF

### 5.3. Implementação do Simulador Financeiro
- [ ] Desenvolver calculadoras para linhas de crédito rural
- [ ] Implementar comparativo entre diferentes opções
- [ ] Criar sistema de relatórios e exportação

## Fase 6: Testes e Otimizações (1 semana)

### 6.1. Testes Funcionais
- [ ] Realizar testes de integração entre componentes
- [ ] Validar fluxos de usuário completos
- [ ] Testar casos de uso específicos do domínio

### 6.2. Testes de Performance
- [ ] Avaliar tempos de resposta da IA
- [ ] Testar eficiência dos sistemas de armazenamento
- [ ] Identificar e corrigir gargalos

### 6.3. Otimizações Finais
- [ ] Refinar prompts para melhor precisão
- [ ] Otimizar consultas ao DynamoDB
- [ ] Ajustar configurações de cache

## Fase 7: Implantação e Monitoramento (1 semana)

### 7.1. Preparação para Produção
- [ ] Configurar ambientes de staging e produção
- [ ] Implementar pipeline de CI/CD
- [ ] Realizar auditoria de segurança

### 7.2. Implantação
- [ ] Configurar domínio e certificados SSL
- [ ] Implantar frontend e backend
- [ ] Configurar CDN e cache

### 7.3. Monitoramento
- [ ] Implementar logging centralizado
- [ ] Configurar alertas para erros críticos
- [ ] Estabelecer dashboards de performance

## Detalhamento Técnico das Principais Implementações

### 1. Implementação da Interface de Chat

```typescript
// Componente principal de chat (simplificado)
export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Lógica para enviar mensagem
  const sendMessage = async () => {
    setIsLoading(true);
    
    try {
      const userMessage = {
        role: 'user',
        content: inputText,
        timestamp: new Date().toISOString()
      };
      
      // Adicionar mensagem do usuário na UI
      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      
      // Enviar para API
      const response = await axios.post('/api/chat/message', {
        message: userMessage.content,
        conversationId: currentConversationId
      });
      
      // Adicionar resposta do assistente
      setMessages(prev => [...prev, response.data.assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Mostrar erro para o usuário
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map(message => (
          <MessageBubble 
            key={message.timestamp}
            role={message.role}
            content={message.content} 
          />
        ))}
      </div>
      
      <div className="input-container">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={isLoading}
        />
        <button 
          onClick={sendMessage}
          disabled={isLoading || !inputText.trim()}
        >
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
        <FileUploadButton conversationId={currentConversationId} />
      </div>
    </div>
  );
}
```

### 2. Integração com AWS Bedrock

```typescript
// Serviço de integração com AWS Bedrock
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { getRagContext } from './pinecone-service';

export async function generateResponse(message: string, conversationHistory: Message[], tenantId: string) {
  // Inicializar cliente Bedrock
  const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  });
  
  // Obter contexto relevante da base de conhecimento
  const relevantContext = await getRagContext(message);
  
  // Formatar histórico da conversa
  const formattedHistory = conversationHistory.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
  
  // Montar prompt com sistema especializado
  const prompt = {
    messages: [
      {
        role: 'system',
        content: `Você é um assistente especializado em crédito rural no Brasil, com conhecimento profundo do Manual de Crédito Rural, legislações e processos bancários. 
                 Você deve fornecer informações precisas e orientações práticas para profissionais do setor.
                 
                 Contexto adicional da base de conhecimento:
                 ${relevantContext}`
      },
      ...formattedHistory,
      {
        role: 'user',
        content: message
      }
    ],
    max_tokens: 1000,
    temperature: 0.7
  };
  
  // Invocar modelo
  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(prompt)
  });
  
  try {
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    return responseBody.content[0].text;
  } catch (error) {
    console.error('Erro ao gerar resposta:', error);
    throw new Error('Não foi possível gerar uma resposta. Por favor, tente novamente.');
  }
}
```

### 3. Implementação do Gerenciador de Arquivos

```typescript
// API de upload de arquivos
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

export async function generateUploadUrl(
  tenantId: string, 
  userId: string, 
  conversationId: string,
  fileName: string,
  contentType: string
) {
  // Inicializar cliente S3
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  });
  
  const fileId = uuidv4();
  const timestamp = new Date().toISOString();
  const fileNameSanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  // Criar chave S3 seguindo a estrutura definida
  const s3Key = `tenants/${tenantId}/uploads/conversations/${conversationId}/${timestamp}-${fileId}-${fileNameSanitized}`;
  
  // Configurar parâmetros para URL pré-assinada
  const putObjectParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
    ContentType: contentType,
    Metadata: {
      'tenant-id': tenantId,
      'user-id': userId,
      'conversation-id': conversationId,
      'original-name': fileName
    }
  };
  
  // Gerar URL pré-assinada
  const signedUrl = await getSignedUrl(s3Client, new PutObjectCommand(putObjectParams), {
    expiresIn: 900 // 15 minutos
  });
  
  // Registrar metadados do arquivo no DynamoDB
  const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  
  await dynamoClient.send(new PutCommand({
    TableName: process.env.DYNAMODB_RURALCREDITAI_TABLE,
    Item: {
      PK: `TENANT#${tenantId}`,
      SK: `FILE#${fileId}`,
      GSI1PK: `CONVERSATION#${conversationId}`,
      GSI1SK: `FILE#${timestamp}`,
      id: fileId,
      tenantId: tenantId,
      userId: userId,
      conversationId: conversationId,
      name: fileName,
      type: contentType,
      s3Key: s3Key,
      status: 'UPLOADING',
      createdAt: timestamp,
      updatedAt: timestamp
    }
  }));
  
  return {
    fileId,
    signedUrl,
    s3Key
  };
}
```

## Recursos Necessários

### Tecnologias Principais
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Banco de Dados**: Amazon DynamoDB 
- **Armazenamento**: Amazon S3
- **IA**: AWS Bedrock (Claude 3)
- **Vetorização**: Pinecone
- **Autenticação**: Amazon Cognito
- **Pagamentos**: Asaas

### Estimativa de Recursos AWS
- DynamoDB: Capacidade provisionada ou sob demanda
- S3: Estimativa inicial de 100GB
- Bedrock: Pay-as-you-go, dependendo do volume
- Cognito: Tier gratuito suficiente para início
- Lambda (opcional): Para processamentos assíncronos

## Cronograma Resumido

| Fase | Duração | Marcos Principais |
|------|---------|-------------------|
| Fase 1: Preparação | 1 semana | Ambiente configurado, serviços AWS prontos |
| Fase 2: Interface | 2 semanas | UI de chat funcional, histórico de conversas |
| Fase 3: Backend | 3 semanas | API completa, sistema de mensagens, integração com S3 |
| Fase 4: IA | 2 semanas | Integração com Bedrock, RAG implementado |
| Fase 5: Funcionalidades | 2 semanas | Análise de documentos, geração de contratos, simulador |
| Fase 6: Testes | 1 semana | Validação funcional e de performance |
| Fase 7: Implantação | 1 semana | Sistema em produção, monitoramento |

**Tempo Total Estimado**: 12 semanas (3 meses)
