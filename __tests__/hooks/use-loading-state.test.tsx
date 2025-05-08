import { renderHook, act } from '@testing-library/react';
import { useLoadingState } from '@/hooks/use-loading-state';
import { describe, expect, it, vi } from 'vitest';

describe('Hook useLoadingState', () => {
  it('deve iniciar com todos os estados de carregamento inativos', () => {
    const { result } = renderHook(() => useLoadingState());
    
    expect(result.current.isLoading('default')).toBe(false);
    expect(result.current.isAnyLoading).toBe(false);
    expect(result.current.loadingStates).toEqual({});
  });

  it('deve ativar e desativar estados de carregamento individuais', () => {
    const { result } = renderHook(() => useLoadingState());
    
    // Inicialmente inativo
    expect(result.current.isLoading('test')).toBe(false);
    
    // Ativa o carregamento
    act(() => {
      result.current.startLoading('test');
    });
    
    // Deve estar ativo
    expect(result.current.isLoading('test')).toBe(true);
    expect(result.current.isAnyLoading).toBe(true);
    
    // Desativa o carregamento
    act(() => {
      result.current.stopLoading('test');
    });
    
    // Deve estar inativo novamente
    expect(result.current.isLoading('test')).toBe(false);
    expect(result.current.isAnyLoading).toBe(false);
  });

  it('deve gerenciar múltiplos estados de carregamento simultaneamente', () => {
    const { result } = renderHook(() => useLoadingState());
    
    // Ativa dois estados diferentes
    act(() => {
      result.current.startLoading('state1');
      result.current.startLoading('state2');
    });
    
    // Ambos devem estar ativos
    expect(result.current.isLoading('state1')).toBe(true);
    expect(result.current.isLoading('state2')).toBe(true);
    expect(result.current.isAnyLoading).toBe(true);
    
    // Desativa apenas um
    act(() => {
      result.current.stopLoading('state1');
    });
    
    // Verificar estados
    expect(result.current.isLoading('state1')).toBe(false);
    expect(result.current.isLoading('state2')).toBe(true);
    expect(result.current.isAnyLoading).toBe(true);
    
    // Desativa o restante
    act(() => {
      result.current.stopLoading('state2');
    });
    
    // Todos inativos
    expect(result.current.isLoading('state1')).toBe(false);
    expect(result.current.isLoading('state2')).toBe(false);
    expect(result.current.isAnyLoading).toBe(false);
  });

  it('deve executar funções com estado de carregamento', async () => {
    const { result } = renderHook(() => useLoadingState());
    
    // Função que será executada com estado de carregamento
    const mockFn = vi.fn().mockResolvedValue('resultado');
    
    // Antes da execução, loading deve estar inativo
    expect(result.current.isLoading('test')).toBe(false);
    
    // Executa a função com loading
    let returnValue;
    await act(async () => {
      returnValue = await result.current.withLoading(mockFn, 'test');
    });
    
    // Verifica se a função foi chamada e retornou o valor correto
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(returnValue).toBe('resultado');
    
    // Após a execução, loading deve ser desativado automaticamente
    expect(result.current.isLoading('test')).toBe(false);
  });

  it('deve gerenciar estados de carregamento mesmo quando ocorrem erros', async () => {
    const { result } = renderHook(() => useLoadingState());
    
    // Função que lança erro
    const error = new Error('Erro de teste');
    const mockFnWithError = vi.fn().mockRejectedValue(error);
    
    // Antes da execução, loading deve estar inativo
    expect(result.current.isLoading('error-test')).toBe(false);
    
    // Tenta executar a função que vai falhar
    let caughtError;
    await act(async () => {
      try {
        await result.current.withLoading(mockFnWithError, 'error-test');
      } catch (e) {
        caughtError = e;
      }
    });
    
    // Verificações
    expect(mockFnWithError).toHaveBeenCalledTimes(1);
    expect(caughtError).toBe(error);
    
    // Mesmo com erro, o loading deve ser desativado no finally
    expect(result.current.isLoading('error-test')).toBe(false);
  });
});
