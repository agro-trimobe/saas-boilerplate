# Fase 4: Integração com IA e Knowledge Base (2 semanas)

Este documento detalha as tarefas relacionadas à implementação da integração com serviços de IA e Knowledge Base para o AgroCredit (Trimobe), focando na especialização do sistema para o contexto de crédito rural.

## Visão Geral

A integração com serviços de IA é a base do diferencial do AgroCredit, permitindo que o assistente conversacional compreenda o contexto específico de crédito rural, analise documentos e gere conteúdo relevante para os usuários. A implementação utilizará a arquitetura RAG (Retrieval Augmented Generation) para potencializar as respostas do modelo de linguagem com conhecimento especializado do domínio.

## 4.1. Configuração da Base de Conhecimento (5 dias)

- [ ] **Implementar serviço de conexão com Pinecone**
  - Criar biblioteca de conexão em `src/lib/pinecone/index.ts`:
    ```typescript
    import { Pinecone } from '@pinecone-database/pinecone';
    import config from '@/config';

    const pinecone = new Pinecone({
      apiKey: config.pinecone.apiKey,
      environment: config.pinecone.environment,
    });

    export const vectorStore = pinecone.Index(config.pinecone.index);

    interface VectorEmbedding {
      id: string;
      values: number[];
      metadata: {
        text: string;
        source: string;
        category: string;
        [key: string]: any;
      };
    }

    /**
     * Insere um vetor de embedding no Pinecone
     */
    export async function insertVector(embedding: VectorEmbedding): Promise<string> {
      try {
        await vectorStore.upsert([{
          id: embedding.id,
          values: embedding.values,
          metadata: embedding.metadata,
        }]);
        
        return embedding.id;
      } catch (error) {
        console.error('Erro ao inserir vetor no Pinecone:', error);
        throw error;
      }
    }

    /**
     * Insere múltiplos vetores de embedding no Pinecone
     */
    export async function insertVectors(embeddings: VectorEmbedding[]): Promise<string[]> {
      if (!embeddings.length) return [];
      
      try {
        const vectors = embeddings.map(emb => ({
          id: emb.id,
          values: emb.values,
          metadata: emb.metadata,
        }));
        
        await vectorStore.upsert(vectors);
        
        return embeddings.map(emb => emb.id);
      } catch (error) {
        console.error('Erro ao inserir vetores no Pinecone:', error);
        throw error;
      }
    }

    /**
     * Busca vetores mais similares a um embedding fornecido
     */
    export async function queryVectors(
      queryEmbedding: number[],
      filter?: Record<string, any>,
      topK: number = 5
    ): Promise<{
      id: string;
      score: number;
      metadata: Record<string, any>;
    }[]> {
      try {
        const results = await vectorStore.query({
          vector: queryEmbedding,
          topK,
          filter,
          includeMetadata: true,
        });
        
        return results.matches.map(match => ({
          id: match.id,
          score: match.score,
          metadata: match.metadata as Record<string, any>,
        }));
      } catch (error) {
        console.error('Erro ao consultar vetores no Pinecone:', error);
        throw error;
      }
    }

    /**
     * Deleta vetores do Pinecone por ID
     */
    export async function deleteVectors(ids: string[]): Promise<void> {
      if (!ids.length) return;
      
      try {
        await vectorStore.deleteMany(ids);
      } catch (error) {
        console.error('Erro ao excluir vetores do Pinecone:', error);
        throw error;
      }
    }

    /**
     * Deleta vetores com base em um filtro de metadados
     */
    export async function deleteVectorsByFilter(filter: Record<string, any>): Promise<void> {
      try {
        await vectorStore.deleteMany({
          filter,
        });
      } catch (error) {
        console.error('Erro ao excluir vetores por filtro do Pinecone:', error);
        throw error;
      }
    }
    ```

- [ ] **Implementar serviço de geração de embeddings**
  - Criar módulo em `src/lib/openai/embeddings.ts`:
    ```typescript
    import OpenAI from 'openai';
    import config from '@/config';
    import { chunkText } from '@/utils/text';

    const openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });

    const EMBEDDING_MODEL = 'text-embedding-ada-002';
    const MAX_TOKENS_PER_CHUNK = 8000;

    /**
     * Gera embedding para um texto usando OpenAI
     */
    export async function generateEmbedding(text: string): Promise<number[]> {
      try {
        const response = await openai.embeddings.create({
          model: EMBEDDING_MODEL,
          input: text.trim(),
        });
        
        return response.data[0].embedding;
      } catch (error) {
        console.error('Erro ao gerar embedding:', error);
        throw error;
      }
    }

    /**
     * Gera embeddings para múltiplos textos
     */
    export async function generateMultipleEmbeddings(texts: string[]): Promise<number[][]> {
      if (!texts.length) return [];
      
      try {
        const response = await openai.embeddings.create({
          model: EMBEDDING_MODEL,
          input: texts.map(t => t.trim()),
        });
        
        return response.data.map(item => item.embedding);
      } catch (error) {
        console.error('Erro ao gerar múltiplos embeddings:', error);
        throw error;
      }
    }

    /**
     * Processa um documento grande, dividindo em chunks e gerando embeddings
     */
    export async function processDocumentEmbeddings(
      document: string,
      metadata: Record<string, any> = {},
      chunkSize: number = 1000,
      chunkOverlap: number = 200
    ): Promise<{
      id: string;
      values: number[];
      metadata: Record<string, any>;
    }[]> {
      // Dividir documento em chunks menores
      const chunks = chunkText(document, chunkSize, chunkOverlap);
      
      // Gerar ID base
      const baseId = metadata.docId || crypto.randomUUID();
      
      // Gerar embeddings para cada chunk
      const embeddings = await generateMultipleEmbeddings(chunks);
      
      // Construir resultado
      return chunks.map((chunk, index) => ({
        id: `${baseId}-chunk-${index}`,
        values: embeddings[index],
        metadata: {
          ...metadata,
          text: chunk,
          chunkIndex: index,
        },
      }));
    }
    ```

- [ ] **Implementar serviço para processamento de documentos MCR**
  - Criar sistema para indexação do Manual de Crédito Rural e legislações específicas
  - Desenvolver componente para manter a base de conhecimento atualizada
  - Garantir categorização adequada do conteúdo para pesquisas eficientes

- [ ] **Implementar módulo para análise e indexação dos principais bancos**
  - Criar sistema para documentos de cada banco (Banco do Brasil, BNDES, Sicredi, etc.)
  - Indexar especificidades de cada instituição financeira
  - Mapear processos e exigências específicas por instituição

- [ ] **Desenvolver sistema de carregamento de metadados e anotações manuais**
  - Implementar ferramentas para adicionar metadados a documentos
  - Criar sistema para anotações e correções manuais na base de conhecimento
  - Garantir que o conhecimento especializado possa ser facilmente atualizado

## 4.2. Implementação do Agente Conversacional (4 dias)

- [ ] **Criar serviço de conexão com OpenAI**
  - Desenvolver módulo de conexão em `src/lib/openai/index.ts`:
    ```typescript
    import OpenAI from 'openai';
    import config from '@/config';
    import { Stream } from 'openai/streaming';

    const openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });

    /**
     * Gera uma resposta completa (não-streaming)
     */
    export async function generateCompletion(
      messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
      options: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
      } = {}
    ): Promise<string> {
      const {
        model = config.openai.model,
        temperature = 0.5,
        maxTokens = 4000,
      } = options;
      
      try {
        const completion = await openai.chat.completions.create({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        });
        
        return completion.choices[0]?.message?.content || '';
      } catch (error) {
        console.error('Erro ao gerar completions:', error);
        throw error;
      }
    }

    /**
     * Gera uma resposta em formato de stream
     */
    export async function generateCompletionStream(
      messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
      options: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
      } = {}
    ): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
      const {
        model = config.openai.model,
        temperature = 0.5,
        maxTokens = 4000,
      } = options;
      
      try {
        const stream = await openai.chat.completions.create({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        });
        
        return stream;
      } catch (error) {
        console.error('Erro ao gerar stream de completions:', error);
        throw error;
      }
    }

    /**
     * Gera uma resposta formatada como JSON
     */
    export async function generateStructuredOutput<T>(
      messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
      jsonStructure: any,
      options: {
        model?: string;
        temperature?: number;
      } = {}
    ): Promise<T> {
      const {
        model = config.openai.model,
        temperature = 0.2, // Temperatura mais baixa para saídas estruturadas
      } = options;
      
      try {
        const completion = await openai.chat.completions.create({
          model,
          messages: [
            ...messages,
            {
              role: 'system',
              content: 'Você deve responder apenas com um objeto JSON válido seguindo a estrutura fornecida.',
            },
          ],
          temperature,
          response_format: { type: 'json_object' },
        });
        
        const responseText = completion.choices[0]?.message?.content || '{}';
        return JSON.parse(responseText) as T;
      } catch (error) {
        console.error('Erro ao gerar saída estruturada:', error);
        throw error;
      }
    }
    ```

- [ ] **Implementar sistema RAG (Retrieval Augmented Generation)**
  - Criar serviço em `src/services/rag.ts`:
    ```typescript
    import { generateEmbedding } from '@/lib/openai/embeddings';
    import { queryVectors } from '@/lib/pinecone';
    import { generateCompletion, generateCompletionStream } from '@/lib/openai';
    import { formatRetrievedContext } from '@/utils/formatting';
    import { Stream } from 'openai/streaming';
    import OpenAI from 'openai';

    // Prompts base para o sistema
    const baseSystemPrompt = `Você é um assistente especializado em crédito rural brasileiro, chamado AgroCredit AI.
    Sua função é auxiliar profissionais que trabalham com elaboração de projetos de crédito rural.
    Você deve ser preciso, objetivo e técnico em suas respostas.
    Você conhece profundamente o Manual de Crédito Rural (MCR), as legislações específicas e os procedimentos dos principais bancos.
    Quando não tiver certeza sobre alguma informação, reconheça suas limitações.
    Sempre baseie suas respostas nos documentos e contextos fornecidos.`;

    interface RetrievedContext {
      text: string;
      source: string;
      category: string;
      relevanceScore: number;
    }

    /**
     * Recupera contextos relevantes com base na consulta do usuário
     */
    export async function retrieveRelevantContext(
      query: string,
      filter: Record<string, any> = {},
      maxResults: number = 5
    ): Promise<RetrievedContext[]> {
      // Gerar embedding para a consulta
      const queryEmbedding = await generateEmbedding(query);
      
      // Buscar vetores similares no Pinecone
      const results = await queryVectors(queryEmbedding, filter, maxResults);
      
      // Mapear resultados para o formato desejado
      return results.map(result => ({
        text: result.metadata.text,
        source: result.metadata.source,
        category: result.metadata.category,
        relevanceScore: result.score,
      }));
    }

    /**
     * Gera uma resposta baseada no contexto recuperado e na consulta do usuário
     */
    export async function generateRAGResponse(
      query: string,
      conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [],
      options: {
        filter?: Record<string, any>;
        maxContextResults?: number;
        includeSourcesInResponse?: boolean;
        detailLevel?: 'Básico' | 'Padrão' | 'Detalhado';
      } = {}
    ): Promise<string> {
      const {
        filter = {},
        maxContextResults = 5,
        includeSourcesInResponse = true,
        detailLevel = 'Padrão',
      } = options;
      
      // Recuperar contexto relevante
      const contexts = await retrieveRelevantContext(query, filter, maxContextResults);
      
      // Formatar contexto para inclusão no prompt
      const formattedContext = formatRetrievedContext(contexts);
      
      // Ajustar prompt do sistema com base no nível de detalhes solicitado
      let systemPrompt = baseSystemPrompt;
      
      if (detailLevel === 'Básico') {
        systemPrompt += '\nFornecça respostas diretas e concisas, com foco nos pontos principais.';
      } else if (detailLevel === 'Detalhado') {
        systemPrompt += '\nFornecça respostas detalhadas, com exemplos práticos e referências específicas quando possível.';
      }
      
      // Preparar mensagens para a geração
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'system' as const, content: `Contexto relevante:\n${formattedContext}` },
        ...conversationHistory,
        { role: 'user' as const, content: query },
      ];
      
      // Gerar resposta
      const response = await generateCompletion(messages);
      
      // Adicionar fontes se solicitado
      if (includeSourcesInResponse && contexts.length > 0) {
        const sources = [...new Set(contexts.map(ctx => ctx.source))].filter(Boolean);
        
        if (sources.length > 0) {
          return `${response}\n\n---\nFontes consultadas:\n${sources.map(src => `- ${src}`).join('\n')}`;
        }
      }
      
      return response;
    }

    /**
     * Gera uma resposta em streaming baseada no contexto recuperado e na consulta do usuário
     */
    export async function generateRAGResponseStream(
      query: string,
      conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [],
      options: {
        filter?: Record<string, any>;
        maxContextResults?: number;
        detailLevel?: 'Básico' | 'Padrão' | 'Detalhado';
      } = {}
    ): Promise<{
      stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>;
      contexts: RetrievedContext[];
    }> {
      const {
        filter = {},
        maxContextResults = 5,
        detailLevel = 'Padrão',
      } = options;
      
      // Recuperar contexto relevante
      const contexts = await retrieveRelevantContext(query, filter, maxContextResults);
      
      // Formatar contexto para inclusão no prompt
      const formattedContext = formatRetrievedContext(contexts);
      
      // Ajustar prompt do sistema com base no nível de detalhes solicitado
      let systemPrompt = baseSystemPrompt;
      
      if (detailLevel === 'Básico') {
        systemPrompt += '\nFornecça respostas diretas e concisas, com foco nos pontos principais.';
      } else if (detailLevel === 'Detalhado') {
        systemPrompt += '\nFornecça respostas detalhadas, com exemplos práticos e referências específicas quando possível.';
      }
      
      // Preparar mensagens para a geração
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'system' as const, content: `Contexto relevante:\n${formattedContext}` },
        ...conversationHistory,
        { role: 'user' as const, content: query },
      ];
      
      // Gerar stream de resposta
      const stream = await generateCompletionStream(messages);
      
      return {
        stream,
        contexts,
      };
    }
    ```

- [ ] **Desenvolver prompts especializados**
  - Criar biblioteca de prompts específicos para cada tipo de consulta:
    - Análise de documentos
    - Simulações financeiras
    - Geração de contratos
    - Consultas legislativas
  - Garantir que os prompts incorporem as regras específicas do crédito rural brasileiro

- [ ] **Implementar estratégia de poucas/zero-shot para novas situações**
  - Desenvolver capacidade de adaptação a consultas não previstas
  - Criar sistema para lidar com novos programas de crédito ou alterações legislativas

## 4.3. Integração com Upload e Análise de Documentos (5 dias)

- [ ] **Desenvolver serviço de extração de texto de documentos**
  - Implementar extração de texto de PDFs, DOCXs e imagens
  - Processar formatações específicas de documentos de crédito rural
  - Manter estrutura semântica dos documentos durante extração

- [ ] **Implementar pipeline de análise de documentos**
  - Criar sistema para identificação de tipo de documento
  - Desenvolver extratores específicos para cada tipo de documento:
    - Contratos de crédito
    - Propostas de financiamento
    - Projetos técnicos
    - Garantias
  - Integrar com o RAG para contextualização das análises

- [ ] **Criar serviço de geração de contratos e documentos**
  - Implementar templates para diferentes tipos de documentos
  - Desenvolver sistema de preenchimento de templates com dados extraídos
  - Garantir que os documentos gerados sigam as normas específicas do setor

- [ ] **Implementar API para integração com frontend**
  - Criar endpoints para upload, análise e geração de documentos
  - Desenvolver sistema de webhooks para processamentos assíncronos
  - Garantir que a API suporte streaming de respostas para feedback imediato

## 4.4. Testes e Otimização da Base de Conhecimento (3 dias)

- [ ] **Desenvolver scripts de avaliação de qualidade**
  - Criar conjunto de perguntas e respostas esperadas para avaliação
  - Implementar métricas de avaliação da qualidade das respostas
  - Desenvolver sistema para melhoria contínua da base de conhecimento

- [ ] **Implementar sistema de feedback dos usuários**
  - Criar mecanismo para usuários indicarem a utilidade das respostas
  - Desenvolver pipeline para incorporar feedback nas melhorias do sistema
  - Garantir o aprendizado contínuo com base nas interações reais

- [ ] **Otimizar desempenho e custos**
  - Implementar caching de respostas frequentes
  - Otimizar queries ao Pinecone para reduzir latência
  - Desenvolver estratégias de batching para minimizar custos da API OpenAI
