# Plano de Trabalho - Trimobe

Este documento apresenta o planejamento sequencial das etapas necessárias para o desenvolvimento do Trimobe, um Micro SaaS de assistência inteligente para profissionais do setor de crédito rural no Brasil.

## Fase 1: Preparação do Ambiente (1 semana)

### 1.1. Configuração do Ambiente de Desenvolvimento
- [ ] Configurar repositório Git para controle de versão
- [ ] Revisar estrutura do boilerplate e dependências atuais
- [ ] Configurar variáveis de ambiente (.env)
- [ ] Configurar IDE e ferramentas de desenvolvimento

### 1.2. Configuração dos Serviços AWS
- [ ] Criar conta/configurar AWS (ou usar existente)
- [ ] Configurar DynamoDB com as tabelas necessárias
  - [ ] Verificar tabelas existentes (Users, Tenants)
  - [ ] Criar tabela AgroCredit conforme modelagem
- [ ] Configurar bucket S3 com a estrutura definida
  - [ ] Criar bucket `rural-credit-ai-app-files`
  - [ ] Definir políticas de acesso e lifecycle
- [ ] Configurar AWS Cognito para autenticação
- [ ] Preparar integração com AWS Bedrock

### 1.3. Configuração do Pinecone
- [ ] Criar conta no Pinecone (ou usar existente)
- [ ] Configurar índice vetorial para conhecimento especializado
- [ ] Definir dimensão de embeddings e métricas

## Fase 2: Adaptação da Interface de Usuário (2 semanas)

### 2.1. Adaptação da Landing Page
- [ ] Personalizar conteúdo para público-alvo de crédito rural
- [ ] Ajustar textos, imagens e mensagens de marketing
- [ ] Revisar SEO e metadados

### 2.2. Desenvolvimento da Interface de Chat
- [ ] Criar componente de interface de chat principal
- [ ] Implementar área de entrada de mensagens com:
  - [ ] Campo de texto
  - [ ] Botão de envio
  - [ ] Upload de arquivos
- [ ] Desenvolver visualização de mensagens com:
  - [ ] Diferenciação entre mensagens do usuário e do assistente
  - [ ] Suporte a markdown/formatação
  - [ ] Exibição de links/documentos

### 2.3. Implementação do Histórico de Conversas
- [ ] Criar interface de listagem de conversas
- [ ] Implementar funcionalidade de busca e filtros
- [ ] Desenvolver visualização de detalhes da conversa

### 2.4. Adaptação da Área de Gestão de Usuários
- [ ] Ajustar páginas de cadastro e login
- [ ] Adaptar página de perfil do usuário
- [ ] Configurar fluxo de recuperação de senha

## Fase 3: Desenvolvimento do Backend (3 semanas)

### 3.1. Configuração da API Principal
- [ ] Definir estrutura de rotas para API NextJS
- [ ] Implementar middlewares de autenticação
- [ ] Configurar integração com DynamoDB

### 3.2. Implementação do Sistema de Mensagens
- [ ] Desenvolver endpoints para:
  - [ ] Envio de mensagens
  - [ ] Recuperação de histórico
  - [ ] Criação de novas conversas
- [ ] Implementar lógica de armazenamento no DynamoDB
- [ ] Configurar sistema de streaming para mensagens longas

### 3.3. Desenvolvimento do Sistema de Arquivos
- [ ] Implementar endpoints para:
  - [ ] Upload de arquivos
  - [ ] Download de documentos
  - [ ] Listagem de arquivos
- [ ] Desenvolver integração com S3
- [ ] Configurar geração de URLs pré-assinados

### 3.4. Manutenção do Sistema de Assinatura
- [ ] Validar integração com Asaas
- [ ] Adaptar para planos específicos do AgroCredit AI
- [ ] Implementar verificação de status de assinatura
- [ ] Configurar período de trial de 7 dias

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
