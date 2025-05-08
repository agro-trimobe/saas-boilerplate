import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { useSubscription } from '@/hooks/use-subscription';
import { SubscriptionData } from '@/lib/types/subscription';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock do fetch global
global.fetch = vi.fn();

describe('Hook useSubscription', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Configurar o mock do CustomEvent para o teste
    global.CustomEvent = vi.fn().mockImplementation((type: string, options: any) => ({
      type,
      ...options
    }));
    
    // Mock do addEventListener
    global.window.addEventListener = vi.fn();
    global.window.removeEventListener = vi.fn();
  });

  it('deve iniciar com estado de carregamento', async () => {
    // Mock da resposta de API
    const mockSubscription: SubscriptionData = {
      status: 'ACTIVE',
      plan: 'BASIC',
      createdAt: '2025-01-01T00:00:00Z',
      expiresAt: '2026-01-01T00:00:00Z',
      trialEndsAt: '2025-01-15T00:00:00Z'
    };
    
    // Configurar o mock do fetch para retornar dados simulados
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ subscription: mockSubscription })
    });
    
    const { result } = renderHook(() => useSubscription());
    
    // Inicialmente, devemos estar em estado de carregamento
    expect(result.current.isLoading).toBe(true);
    expect(result.current.subscription).toBeNull();
    
    // Esperar a atualização de estado após o fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Verificar se o estado foi atualizado corretamente
    expect(result.current.subscription).toEqual(mockSubscription);
    expect(result.current.isActive).toBe(true);
  });

  it('deve atualizar quando o evento subscription:refresh for disparado', async () => {
    // Configurar mocks para dois fetch diferentes
    const mockInitialSubscription: SubscriptionData = {
      status: 'TRIAL',
      plan: 'BASIC',
      createdAt: '2025-01-01T00:00:00Z',
      expiresAt: '2026-01-01T00:00:00Z',
      trialEndsAt: '2025-06-01T00:00:00Z'
    };
    
    const mockUpdatedSubscription: SubscriptionData = {
      status: 'ACTIVE',
      plan: 'PREMIUM',
      createdAt: '2025-01-01T00:00:00Z',
      expiresAt: '2026-01-01T00:00:00Z',
      trialEndsAt: '2025-06-01T00:00:00Z'
    };
    
    // Primeiro fetch retorna o estado inicial
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ subscription: mockInitialSubscription })
    });
    
    // Segundo fetch (após o evento de refresh) retorna estado atualizado
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ subscription: mockUpdatedSubscription })
    });
    
    // Renderizar o hook
    const { result } = renderHook(() => useSubscription());
    
    // Esperar o primeiro fetch completar
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Verificar estado inicial
    expect(result.current.subscription?.plan).toBe('BASIC');
    expect(result.current.isActive).toBe(true); // TRIAL está ativo
    
    // Capturar o listener para poder simular o evento
    const addEventListenerMock = global.window.addEventListener as unknown as ReturnType<typeof vi.fn>;
    const [eventName, eventHandler] = addEventListenerMock.mock.calls[0];
    
    // Verificar se o evento correto foi registrado
    expect(eventName).toBe('subscription:refresh');
    
    // Simular o disparo do evento
    act(() => {
      eventHandler({ detail: { source: 'test' } });
    });
    
    // Esperar o segundo fetch completar
    await waitFor(() => {
      expect(result.current.subscription?.plan).toBe('PREMIUM');
    });
    
    // Verificar se os dados foram atualizados
    expect(result.current.isActive).toBe(true);
    expect(result.current.isPremium).toBe(true);
  });

  it('deve tratar erros ao buscar dados da assinatura', async () => {
    // Configurar fetch para falhar
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500
    });
    
    const { result } = renderHook(() => useSubscription());
    
    // Inicialmente em carregamento
    expect(result.current.isLoading).toBe(true);
    
    // Esperar completar
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Deve ter definido a mensagem de erro e não estar mais carregando
    expect(result.current.error).toBe('Não foi possível verificar o status da sua assinatura.');
    expect(result.current.subscription).toBeNull();
  });
});
