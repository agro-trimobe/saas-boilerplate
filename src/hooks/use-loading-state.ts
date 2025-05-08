'use client';

import { useState, useCallback } from 'react';

/**
 * Hook para gerenciar estados de carregamento em componentes
 * Fornece funções para iniciar e finalizar estados de carregamento com identificadores
 */
export function useLoadingState() {
  // Estado para rastrear múltiplos indicadores de carregamento
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  
  // Verifica se qualquer estado de carregamento está ativo
  const isAnyLoading = Object.values(loadingStates).some(state => state);
  
  // Verifica se um estado específico está em carregamento
  const isLoading = useCallback((key: string = 'default') => {
    return !!loadingStates[key];
  }, [loadingStates]);
  
  // Inicia um estado de carregamento específico
  const startLoading = useCallback((key: string = 'default') => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
  }, []);
  
  // Finaliza um estado de carregamento específico
  const stopLoading = useCallback((key: string = 'default') => {
    setLoadingStates(prev => ({ ...prev, [key]: false }));
  }, []);
  
  // Executa uma função com estado de carregamento
  const withLoading = useCallback(async <T,>(
    fn: () => Promise<T>,
    key: string = 'default'
  ): Promise<T> => {
    try {
      startLoading(key);
      return await fn();
    } finally {
      stopLoading(key);
    }
  }, [startLoading, stopLoading]);
  
  return {
    isLoading,
    isAnyLoading,
    startLoading,
    stopLoading,
    withLoading,
    loadingStates
  };
}
