import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { useSubscription } from '@/hooks/use-subscription';
import { SubscriptionData } from '@/lib/types/subscription';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock do hook useSuspenseQuery para simulação simplificada nos testes
vi.mock('@/hooks/use-suspense-query', () => {
  // Usamos React real em vez de tentar usar os hooks do vi
  const React = require('react');
  
  return {
    useSuspenseQuery: (fetchFn, options) => {
      // Mock simples que executa a função de busca diretamente usando React.useState
      const [data, setData] = React.useState(null);
      const [status, setStatus] = React.useState('loading');
      const [error, setError] = React.useState(null);
      
      React.useEffect(() => {
        const load = async () => {
          try {
            setStatus('loading');
            const result = await fetchFn();
            setData(result);
            setStatus('success');
          } catch (err) {
            setError(err);
            setStatus('error');
          }
        };
        
        load();
      }, [fetchFn]);
      
      return {
        data,
        status,
        error,
        refetch: async () => {
          try {
            setStatus('loading');
            const result = await fetchFn();
            setData(result);
            setStatus('success');
            return result;
          } catch (err) {
            setError(err);
            setStatus('error');
            throw err;
          }
        },
        clearCache: vi.fn()
      };
    }
  };
});

// Mock do fetch global
global.fetch = vi.fn();

describe('Hook useSubscription (Versão atualizada)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock do dispatchEvent e addEventListener
    global.window.dispatchEvent = vi.fn();
    global.window.addEventListener = vi.fn();
    global.window.removeEventListener = vi.fn();
  });

  it('deve iniciar com estado de carregamento e buscar dados corretamente', async () => {
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
    
    const { result } = renderHook(() => useSubscription({ suspense: false }));
    
    // Inicialmente, devemos estar em estado de carregamento
    expect(result.current.isLoading).toBe(true);
    
    // Esperar a atualização de estado após o fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Verificar se o estado foi atualizado corretamente
    expect(result.current.subscription).toEqual(mockSubscription);
    expect(result.current.isActive).toBe(true);
  });

  it('deve realizar refresh da assinatura quando solicitado', async () => {
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
    
    // Segundo fetch (após o refresh) retorna estado atualizado
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ subscription: mockUpdatedSubscription })
    });
    
    // Renderizar o hook
    const { result } = renderHook(() => useSubscription({ suspense: false }));
    
    // Esperar o primeiro fetch completar
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Verificar estado inicial
    expect(result.current.subscription?.plan).toBe('BASIC');
    expect(result.current.isActive).toBe(true); // TRIAL está ativo
    
    // Solicitar refresh
    act(() => {
      result.current.refreshSubscription();
    });
    
    // Esperar o segundo fetch completar
    await waitFor(() => {
      expect(result.current.subscription?.plan).toBe('PREMIUM');
    });
    
    // Verificar se os dados foram atualizados
    expect(result.current.isActive).toBe(true);
    expect(result.current.isPremium).toBe(true);
    
    // Verificar se o evento foi disparado
    expect(global.window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'subscription:refresh'
      })
    );
  });

  it('deve tratar erros ao buscar dados da assinatura', async () => {
    // Configurar fetch para falhar
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500
    });
    
    const { result } = renderHook(() => useSubscription({ suspense: false }));
    
    // Esperar completar com erro
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Deve ter definido a mensagem de erro e não estar mais carregando
    expect(result.current.error).toBeTruthy();
    expect(result.current.subscription).toBeNull();
  });
});
