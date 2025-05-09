# Fase 5: Testes e Otimização (1 semana)

Este documento detalha as tarefas relacionadas à fase de testes e otimização do AgroCredit (Trimobe), garantindo a qualidade, desempenho e segurança do sistema antes do lançamento.

## 5.1. Implementação de Testes Automatizados (3 dias)

- [ ] **Configurar ambiente de testes unitários**
  - Implementar testes para os repositórios:
    ```typescript
    // src/repositories/__tests__/conversationsRepo.test.ts
    import { conversationsRepo } from '../conversationsRepo';
    import { baseRepo } from '../baseRepo';
    
    // Mock do repositório base
    jest.mock('../baseRepo', () => ({
      baseRepo: {
        create: jest.fn(),
        get: jest.fn(),
        query: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    }));
    
    describe('ConversationsRepository', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });
      
      describe('create', () => {
        it('deve criar uma nova conversa com os valores padrão', async () => {
          // Configurar mock
          (baseRepo.create as jest.Mock).mockResolvedValue({
            PK: 'TENANT#tenant123',
            SK: 'CONVERSATION#conv123',
            id: 'conv123',
            tenantId: 'tenant123',
            title: 'Nova Conversa',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            status: 'active',
          });
          
          // Chamar método
          const result = await conversationsRepo.create({
            tenantId: 'tenant123',
            id: 'conv123',
          });
          
          // Verificar resultados
          expect(baseRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            PK: 'TENANT#tenant123',
            SK: 'CONVERSATION#conv123',
            id: 'conv123',
            tenantId: 'tenant123',
            title: 'Nova Conversa',
            status: 'active',
          }));
          
          expect(result).toEqual(expect.objectContaining({
            id: 'conv123',
            tenantId: 'tenant123',
            title: 'Nova Conversa',
            status: 'active',
          }));
        });
        
        it('deve lançar erro quando o tenantId não for fornecido', async () => {
          await expect(conversationsRepo.create({
            id: 'conv123',
          })).rejects.toThrow('O ID do tenant é obrigatório');
        });
      });
      
      // Adicionar mais testes para outros métodos
    });
    ```
  
  - Implementar testes para os serviços:
    ```typescript
    // src/services/__tests__/rag.test.ts
    import { retrieveRelevantContext, generateRAGResponse } from '../rag';
    import { generateEmbedding } from '@/lib/openai/embeddings';
    import { queryVectors } from '@/lib/pinecone';
    import { generateCompletion } from '@/lib/openai';
    
    // Mocks
    jest.mock('@/lib/openai/embeddings', () => ({
      generateEmbedding: jest.fn(),
    }));
    
    jest.mock('@/lib/pinecone', () => ({
      queryVectors: jest.fn(),
    }));
    
    jest.mock('@/lib/openai', () => ({
      generateCompletion: jest.fn(),
    }));
    
    describe('RAG Service', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });
      
      describe('retrieveRelevantContext', () => {
        it('deve recuperar contextos relevantes com base na consulta', async () => {
          // Mock de embedding
          (generateEmbedding as jest.Mock).mockResolvedValue([0.1, 0.2, 0.3]);
          
          // Mock de resultados do Pinecone
          (queryVectors as jest.Mock).mockResolvedValue([
            {
              id: 'doc1-chunk1',
              score: 0.92,
              metadata: {
                text: 'Conteúdo do documento 1',
                source: 'MCR 2023',
                category: 'legislacao',
              },
            },
            {
              id: 'doc2-chunk3',
              score: 0.85,
              metadata: {
                text: 'Conteúdo do documento 2',
                source: 'Resolução 123',
                category: 'normas',
              },
            },
          ]);
          
          // Chamar método
          const result = await retrieveRelevantContext(
            'Como calcular limite de crédito Pronaf?',
            { category: 'legislacao' },
            3
          );
          
          // Verificar chamadas
          expect(generateEmbedding).toHaveBeenCalledWith('Como calcular limite de crédito Pronaf?');
          expect(queryVectors).toHaveBeenCalledWith(
            [0.1, 0.2, 0.3],
            { category: 'legislacao' },
            3
          );
          
          // Verificar resultado
          expect(result).toEqual([
            {
              text: 'Conteúdo do documento 1',
              source: 'MCR 2023',
              category: 'legislacao',
              relevanceScore: 0.92,
            },
            {
              text: 'Conteúdo do documento 2',
              source: 'Resolução 123',
              category: 'normas',
              relevanceScore: 0.85,
            },
          ]);
        });
      });
      
      // Adicionar mais testes para outros métodos
    });
    ```

  - Implementar testes para API routes:
    ```typescript
    // src/app/api/__tests__/conversations.test.ts
    import { NextRequest } from 'next/server';
    import { POST, GET } from '../conversations/route';
    import { conversationsRepo } from '@/repositories/conversationsRepo';
    import { getServerSession } from 'next-auth';
    
    // Mocks
    jest.mock('@/repositories/conversationsRepo', () => ({
      conversationsRepo: {
        create: jest.fn(),
        listByTenant: jest.fn(),
      },
    }));
    
    jest.mock('next-auth', () => ({
      getServerSession: jest.fn(),
    }));
    
    describe('Conversations API', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });
      
      describe('POST /api/conversations', () => {
        it('deve criar uma nova conversa quando o usuário está autenticado', async () => {
          // Mock da sessão
          (getServerSession as jest.Mock).mockResolvedValue({
            user: {
              id: 'user123',
              tenantId: 'tenant123',
            },
          });
          
          // Mock da resposta do repositório
          (conversationsRepo.create as jest.Mock).mockResolvedValue({
            id: 'conv123',
            tenantId: 'tenant123',
            title: 'Nova Conversa de Teste',
            createdAt: '2023-01-01T00:00:00Z',
          });
          
          // Mock da requisição
          const request = new NextRequest('http://localhost:3000/api/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: 'Nova Conversa de Teste',
            }),
          });
          
          // Chamar endpoint
          const response = await POST(request);
          const data = await response.json();
          
          // Verificar resultado
          expect(response.status).toBe(201);
          expect(data).toEqual({
            id: 'conv123',
            tenantId: 'tenant123',
            title: 'Nova Conversa de Teste',
            createdAt: '2023-01-01T00:00:00Z',
          });
          
          // Verificar chamada ao repositório
          expect(conversationsRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            tenantId: 'tenant123',
            title: 'Nova Conversa de Teste',
            createdBy: 'user123',
          }));
        });
        
        it('deve retornar erro 401 quando o usuário não está autenticado', async () => {
          // Mock da sessão (não autenticado)
          (getServerSession as jest.Mock).mockResolvedValue(null);
          
          // Mock da requisição
          const request = new NextRequest('http://localhost:3000/api/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: 'Nova Conversa de Teste',
            }),
          });
          
          // Chamar endpoint
          const response = await POST(request);
          
          // Verificar resultado
          expect(response.status).toBe(401);
        });
      });
      
      // Adicionar mais testes para outros endpoints
    });
    ```

- [ ] **Implementar testes de integração**
  - Criar testes para fluxos completos de uso:
    - Fluxo de autenticação
    - Criação e gerenciamento de conversas
    - Upload e análise de documentos
    - Integração com IA

- [ ] **Configurar testes de interface e E2E**
  - Implementar testes com Playwright para cenários críticos:
    ```typescript
    // tests/e2e/conversation.spec.ts
    import { test, expect } from '@playwright/test';
    
    test.describe('Fluxo de conversa', () => {
      test.beforeEach(async ({ page }) => {
        // Fazer login antes de cada teste
        await page.goto('/login');
        await page.fill('input[name="email"]', 'teste@exemplo.com');
        await page.fill('input[name="password"]', 'senha123');
        await page.click('button[type="submit"]');
        
        // Verificar se o login foi bem-sucedido
        await expect(page).toHaveURL('/dashboard');
      });
      
      test('deve criar uma nova conversa e enviar mensagem', async ({ page }) => {
        // Navegar para página de conversas
        await page.goto('/dashboard/conversas');
        
        // Criar nova conversa
        await page.click('button:has-text("Nova Conversa")');
        
        // Verificar se fomos redirecionados para a conversa
        await expect(page.url()).toMatch(/\/dashboard\/conversas\/[\w-]+/);
        
        // Digitar e enviar mensagem
        await page.fill('textarea[placeholder*="Digite sua mensagem"]', 'Olá, gostaria de saber mais sobre o Pronaf');
        await page.click('button[aria-label="Enviar mensagem"]');
        
        // Verificar se a mensagem foi enviada
        await expect(page.locator('.message-list')).toContainText('Olá, gostaria de saber mais sobre o Pronaf');
        
        // Esperar resposta do assistente
        await expect(page.locator('.message-list')).toContainText('Assistente AgroCredit');
      });
      
      test('deve fazer upload de documento na conversa', async ({ page }) => {
        // Navegar para página de conversas
        await page.goto('/dashboard/conversas');
        
        // Abrir conversa existente (primeira da lista)
        await page.click('.conversation-item');
        
        // Anexar arquivo
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.click('button[aria-label="Anexar arquivo"]');
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles('tests/fixtures/exemplo_contrato.pdf');
        
        // Digitar mensagem de contexto
        await page.fill('textarea[placeholder*="Digite sua mensagem"]', 'Analise este contrato de Pronaf');
        await page.click('button[aria-label="Enviar mensagem"]');
        
        // Verificar se o anexo foi enviado
        await expect(page.locator('.message-list')).toContainText('exemplo_contrato.pdf');
        
        // Esperar análise do assistente
        await expect(page.locator('.message-list', { timeout: 30000 })).toContainText('Análise do Contrato');
      });
    });
    ```

- [ ] **Desenvolver testes de carga e performance**
  - Implementar testes para avaliar limites de performance:
    - Resposta do chat em situações de alta demanda
    - Processamento de múltiplos documentos simultaneamente
    - Capacidade do sistema sob carga de múltiplos usuários

## 5.2. Otimização de Performance e Segurança (2 dias)

- [ ] **Implementar caching estratégico**
  - Configurar Redis para caching de dados frequentemente acessados:
    ```typescript
    // src/lib/redis/index.ts
    import { Redis } from '@upstash/redis';
    import config from '@/config';
    
    export const redis = new Redis({
      url: config.redis.url,
      token: config.redis.token,
    });
    
    interface CacheOptions {
      ttl?: number; // Tempo de vida em segundos
      namespace?: string;
    }
    
    /**
     * Recupera um item do cache
     */
    export async function getCacheItem<T>(
      key: string,
      options: CacheOptions = {}
    ): Promise<T | null> {
      const { namespace = 'app' } = options;
      const fullKey = `${namespace}:${key}`;
      
      try {
        const cachedData = await redis.get(fullKey);
        return cachedData as T || null;
      } catch (error) {
        console.error('Erro ao recuperar item do cache:', error);
        return null;
      }
    }
    
    /**
     * Armazena um item no cache
     */
    export async function setCacheItem<T>(
      key: string,
      value: T,
      options: CacheOptions = {}
    ): Promise<void> {
      const { ttl, namespace = 'app' } = options;
      const fullKey = `${namespace}:${key}`;
      
      try {
        if (ttl) {
          await redis.set(fullKey, value, { ex: ttl });
        } else {
          await redis.set(fullKey, value);
        }
      } catch (error) {
        console.error('Erro ao armazenar item no cache:', error);
      }
    }
    
    /**
     * Remove um item do cache
     */
    export async function invalidateCacheItem(
      key: string,
      options: CacheOptions = {}
    ): Promise<void> {
      const { namespace = 'app' } = options;
      const fullKey = `${namespace}:${key}`;
      
      try {
        await redis.del(fullKey);
      } catch (error) {
        console.error('Erro ao invalidar item do cache:', error);
      }
    }
    
    /**
     * Função helper para implementar cache em funções
     */
    export async function withCache<T>(
      key: string,
      fetchFn: () => Promise<T>,
      options: CacheOptions = {}
    ): Promise<T> {
      // Tentar obter do cache primeiro
      const cachedData = await getCacheItem<T>(key, options);
      
      if (cachedData !== null) {
        return cachedData;
      }
      
      // Se não estiver em cache, buscar dados frescos
      const freshData = await fetchFn();
      
      // Armazenar no cache para futuras requisições
      await setCacheItem(key, freshData, options);
      
      return freshData;
    }
    ```

  - Implementar caching em endpoints críticos:
    ```typescript
    // src/app/api/documents/[id]/route.ts
    import { NextRequest, NextResponse } from 'next/server';
    import { documentsRepo } from '@/repositories/documentsRepo';
    import { withCache } from '@/lib/redis';
    import { getServerSession } from 'next-auth';
    import { authOptions } from '@/lib/auth';
    
    export async function GET(
      request: NextRequest,
      { params }: { params: { id: string } }
    ) {
      try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
          return NextResponse.json(
            { error: 'Não autorizado' },
            { status: 401 }
          );
        }
        
        const tenantId = session.user.tenantId;
        const documentId = params.id;
        
        // Usar cache para dados do documento
        const document = await withCache(
          `document:${documentId}`,
          () => documentsRepo.getById(tenantId, documentId),
          { ttl: 300, namespace: 'documents' } // Cache por 5 minutos
        );
        
        if (!document) {
          return NextResponse.json(
            { error: 'Documento não encontrado' },
            { status: 404 }
          );
        }
        
        return NextResponse.json(document);
      } catch (error: any) {
        console.error('Erro ao buscar documento:', error);
        return NextResponse.json(
          { error: error.message || 'Erro ao buscar documento' },
          { status: 500 }
        );
      }
    }
    ```

- [ ] **Otimizar consultas ao banco de dados**
  - Revisar e otimizar padrões de acesso ao DynamoDB:
    - Utilizar índices eficientemente
    - Minimizar operações de scan
    - Implementar batch operations quando possível

- [ ] **Implementar medidas de segurança adicionais**
  - Configurar headers de segurança:
    ```typescript
    // middleware.ts
    import { NextResponse } from 'next/server';
    import type { NextRequest } from 'next/server';
    
    export function middleware(request: NextRequest) {
      // Obter resposta
      const response = NextResponse.next();
      
      // Adicionar headers de segurança
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' *.amazonaws.com *.openai.com;"
      );
      
      return response;
    }
    
    export const config = {
      matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
    };
    ```

  - Implementar rate limiting:
    ```typescript
    // src/middlewares/rateLimit.ts
    import { NextRequest, NextResponse } from 'next/server';
    import { redis } from '@/lib/redis';
    
    interface RateLimitOptions {
      limit: number;  // Número máximo de requisições
      window: number; // Janela de tempo em segundos
      identifier?: (req: NextRequest) => string; // Função para obter identificador (IP, usuário, etc)
    }
    
    export function rateLimit(options: RateLimitOptions) {
      const { limit, window, identifier } = options;
      
      return async function rateLimitMiddleware(
        req: NextRequest,
        res: NextResponse,
        next: () => Promise<void>
      ) {
        try {
          // Obter identificador (padrão: IP)
          const ip = req.ip || '127.0.0.1';
          const id = identifier ? identifier(req) : ip;
          
          // Criar chave para o Redis
          const key = `rate-limit:${id}`;
          
          // Obter contagem atual
          const currentCount = await redis.get<number>(key) || 0;
          
          // Verificar se excedeu limite
          if (currentCount >= limit) {
            return NextResponse.json(
              { error: 'Limite de requisições excedido. Tente novamente mais tarde.' },
              { status: 429 }
            );
          }
          
          // Incrementar contador
          await redis.set(key, currentCount + 1, { ex: window });
          
          // Adicionar headers com informações sobre limites
          res.headers.set('X-RateLimit-Limit', String(limit));
          res.headers.set('X-RateLimit-Remaining', String(limit - (currentCount + 1)));
          res.headers.set('X-RateLimit-Reset', String(Math.floor(Date.now() / 1000) + window));
          
          // Continuar com a requisição
          return next();
        } catch (error) {
          console.error('Erro ao aplicar rate limit:', error);
          return next();
        }
      };
    }
    ```

- [ ] **Implementar monitoramento e logging**
  - Configurar sistema de logs estruturados:
    ```typescript
    // src/lib/logger/index.ts
    import pino from 'pino';
    import config from '@/config';
    
    const transport = 
      config.app.env === 'production'
        ? { target: 'pino/file', options: { destination: '/var/log/agrocredit.log' } }
        : { target: 'pino-pretty' };
    
    export const logger = pino({
      level: config.app.env === 'production' ? 'info' : 'debug',
      base: {
        env: config.app.env,
        version: process.env.npm_package_version,
      },
      transport,
    });
    
    // Extensão para log contextual
    export function createContextLogger(context: Record<string, any>) {
      return logger.child(context);
    }
    
    // Middleware para logging de requisições
    export function requestLogger(req: any, res: any, next: () => void) {
      const start = Date.now();
      
      // Após a requisição ser processada
      res.on('finish', () => {
        const duration = Date.now() - start;
        
        logger.info({
          type: 'request',
          method: req.method,
          url: req.url,
          status: res.statusCode,
          duration,
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          userId: req.user?.id,
          tenantId: req.user?.tenantId,
        });
      });
      
      next();
    }
    ```

## 5.3. Preparação para Lançamento (2 dias)

- [ ] **Verificar compatibilidade cross-browser**
  - Testar em navegadores principais:
    - Chrome
    - Firefox
    - Safari
    - Edge
  - Garantir que a interface seja responsiva em diferentes dispositivos

- [ ] **Implementar rastreamento de erro e analytics**
  - Configurar Sentry para monitoramento de erros:
    ```typescript
    // src/lib/sentry/index.ts
    import * as Sentry from '@sentry/nextjs';
    import config from '@/config';
    
    export function initSentry() {
      if (config.app.env === 'production') {
        Sentry.init({
          dsn: config.sentry.dsn,
          environment: config.app.env,
          tracesSampleRate: 0.5,
          // Ajuste para o Next.js App Router
          integrations: [
            new Sentry.Integrations.Http({ tracing: true }),
          ],
        });
      }
    }
    
    export function captureException(error: any, context?: Record<string, any>) {
      if (config.app.env === 'production') {
        Sentry.captureException(error, {
          contexts: {
            custom: context,
          },
        });
      } else {
        console.error('Erro capturado:', error, context);
      }
    }
    ```

  - Implementar Google Analytics para métricas de uso:
    ```typescript
    // src/lib/analytics/index.ts
    export function initAnalytics() {
      if (typeof window !== 'undefined') {
        // Google Analytics
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
          window.dataLayer.push(args);
        }
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXXXXX');
      }
    }
    
    export function trackEvent(category: string, action: string, label?: string, value?: number) {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', action, {
          event_category: category,
          event_label: label,
          value: value,
        });
      }
    }
    ```

- [ ] **Criar página de onboarding e ajuda**
  - Implementar telas de ajuda e instruções iniciais:
    - Tutorial inicial para novos usuários
    - Documentação básica de uso
    - Exemplos de perguntas e ações mais comuns

- [ ] **Realizar testes finais de usabilidade**
  - Validar fluxos críticos com usuários reais:
    - Processo de cadastro e login
    - Criação de conversas e consultas ao assistente
    - Upload e análise de documentos
    - Simulações financeiras e geração de contratos
