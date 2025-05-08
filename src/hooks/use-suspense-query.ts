'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNotificationStore } from './use-notification-store';

// Representa o estado da requisição
type QueryState<T> = {
  data: T | null;
  error: Error | null;
  status: 'idle' | 'loading' | 'success' | 'error';
};

// Tipo de função de busca de dados para uso com o hook
type FetchFn<T> = () => Promise<T>;

// Classe de erro para gerenciar rejeições e suspense
class SuspenseError extends Error {
  promise: Promise<any>;
  
  constructor(message: string, promise: Promise<any>) {
    super(message);
    this.promise = promise;
    this.name = 'SuspenseError';
  }
}

/**
 * Hook para gerenciar requisições de dados com suporte a Suspense
 * Permite melhor UX durante carregamento de dados assíncronos
 * 
 * @param fetchFn - Função que retorna uma Promise com os dados
 * @param options - Opções adicionais de configuração
 */
export function useSuspenseQuery<T>(
  fetchFn: FetchFn<T>,
  options?: {
    suspense?: boolean;
    retry?: number;
    onError?: (error: Error) => void;
    onSuccess?: (data: T) => void;
    cacheKey?: string;
  }
) {
  const { addNotification } = useNotificationStore();
  const { 
    suspense = true, 
    retry = 2,
    onError,
    onSuccess,
    cacheKey
  } = options || {};

  // Controle do estado interno
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    error: null,
    status: 'idle'
  });
  
  // Referências para controle
  const retryCount = useRef(0);
  const promiseCache = useRef<Record<string, Promise<T>>>({});

  // Função para buscar dados com retry e lógica de suspense
  const fetchData = useCallback(async (skipCache = false): Promise<T> => {
    // Se temos um cacheKey e os dados já estão em cache e não estamos pulando o cache
    const cachedPromise = cacheKey && promiseCache.current[cacheKey];
    if (cachedPromise && !skipCache) {
      return cachedPromise;
    }

    setState(prev => ({ ...prev, status: 'loading' }));
    
    try {
      // Cria a promise para buscar dados com possibilidade de retry
      const fetchPromise = async (): Promise<T> => {
        try {
          const data = await fetchFn();
          
          // Atualiza estado e chama callback de sucesso
          setState({ data, error: null, status: 'success' });
          if (onSuccess) onSuccess(data);
          
          return data;
        } catch (error) {
          // Lógica de retry
          if (retryCount.current < retry) {
            retryCount.current++;
            
            // Exponential backoff para retry
            const delay = Math.min(1000 * 2 ** retryCount.current, 10000);
            await new Promise(r => setTimeout(r, delay));
            
            return fetchPromise();
          }
          
          // Se exceder número de retries, propaga erro
          const err = error instanceof Error ? error : new Error(String(error));
          
          setState({ data: null, error: err, status: 'error' });
          if (onError) onError(err);
          
          // Adiciona notificação de erro para o usuário
          addNotification({
            title: 'Erro ao carregar dados',
            message: err.message,
            type: 'error',
            autoClose: true
          });
          
          throw err;
        }
      };

      // Inicia a fetch e armazena em cache se necessário
      const promise = fetchPromise();
      if (cacheKey) {
        promiseCache.current[cacheKey] = promise;
      }
      
      // Se suspense está ativado e estamos em cliente, lança o erro que será capturado pelo Suspense
      if (suspense && typeof window !== 'undefined') {
        throw new SuspenseError('Suspense loading', promise);
      }
      
      return promise;
    } catch (error) {
      // Se o erro for do tipo SuspenseError, propaga para o Suspense
      if (error instanceof SuspenseError) {
        throw error.promise;
      }
      throw error;
    }
  }, [fetchFn, retry, suspense, cacheKey, onError, onSuccess, addNotification]);

  // Efeito para iniciar a busca de dados automaticamente
  useEffect(() => {
    if (state.status === 'idle') {
      fetchData().catch(() => {
        // Erro já tratado no fetchData
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    refetch: (skipCache = true) => fetchData(skipCache),
    // Função auxiliar para limpar o cache
    clearCache: () => {
      if (cacheKey) {
        delete promiseCache.current[cacheKey];
      } else {
        promiseCache.current = {};
      }
    }
  };
}
