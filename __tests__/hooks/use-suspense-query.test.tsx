import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { useSuspenseQuery } from '@/hooks/use-suspense-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock do hook de notificações para evitar erros
vi.mock('@/hooks/use-notification-store', () => ({
  useNotificationStore: () => ({
    addNotification: vi.fn()
  })
}));

// Mock do React.Suspense para evitar erros no ambiente de teste
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    Suspense: ({ children }) => children,
  };
});

// Mock do hook de notificações
vi.mock('@/hooks/use-notification-store', () => ({
  useNotificationStore: () => ({
    addNotification: vi.fn()
  })
}));

describe('Hook useSuspenseQuery', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('deve retornar dados com sucesso', async () => {
    const mockData = { id: 1, name: 'Teste' };
    const fetchFn = vi.fn().mockResolvedValue(mockData);
    
    // Use suspense: false para evitar erros de suspense no ambiente de teste
    const { result } = renderHook(() => 
      useSuspenseQuery(fetchFn, { suspense: false })
    );
    
    // Inicialmente em carregamento
    expect(result.current.status).toBe('loading');
    
    // Esperar o carregamento terminar
    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });
    
    // Verificar dados retornados
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('deve lidar com erros corretamente', async () => {
    const error = new Error('Erro de teste');
    const fetchFn = vi.fn().mockRejectedValue(error);
    
    // Mock da função onError
    const onError = vi.fn();
    
    const { result } = renderHook(() => 
      useSuspenseQuery(fetchFn, { 
        suspense: false,
        retry: 0, // Desativar retry para simplificar o teste
        onError
      })
    );
    
    // Esperar o estado de erro
    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    
    // Verificar tratamento de erro
    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(error);
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('deve permitir refetch dos dados', async () => {
    const mockData1 = { id: 1, value: 'inicial' };
    const mockData2 = { id: 1, value: 'atualizado' };
    
    const fetchFn = vi.fn()
      .mockResolvedValueOnce(mockData1)
      .mockResolvedValueOnce(mockData2);
    
    const { result } = renderHook(() => 
      useSuspenseQuery(fetchFn, { suspense: false })
    );
    
    // Esperar carregar os dados iniciais
    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });
    
    expect(result.current.data).toEqual(mockData1);
    
    // Refetch para obter novos dados
    await act(async () => {
      await result.current.refetch();
    });
    
    // Verificar se os dados foram atualizados
    expect(result.current.data).toEqual(mockData2);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('deve usar cache quando configurado', async () => {
    const mockData = { id: 1, name: 'Teste' };
    const fetchFn = vi.fn().mockResolvedValue(mockData);
    
    const { result, rerender } = renderHook(() => 
      useSuspenseQuery(fetchFn, { 
        suspense: false,
        cacheKey: 'test-cache'
      })
    );
    
    // Esperar o primeiro carregamento
    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });
    
    // O fetch deve ter sido chamado uma vez
    expect(fetchFn).toHaveBeenCalledTimes(1);
    
    // Refaz a renderização do hook
    rerender();
    
    // Fetch não deve ser chamado novamente por causa do cache
    expect(fetchFn).toHaveBeenCalledTimes(1);
    
    // Limpa o cache
    act(() => {
      result.current.clearCache();
    });
    
    // Força refetch
    await act(async () => {
      await result.current.refetch();
    });
    
    // Fetch deve ter sido chamado novamente
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});
