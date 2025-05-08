'use client';

import { useState, useEffect, useCallback } from 'react';
import { SubscriptionData, isSubscriptionActive, hasPremiumAccess } from '@/lib/types/subscription';
import { useSuspenseQuery } from './use-suspense-query';

/**
 * Evento personalizado para atualizar assinatura em todos os componentes
 * Permite sincronizar o estado da assinatura em diferentes partes da aplicação
 */
type SubscriptionRefreshEvent = CustomEvent<{ source: string }>;

// Declaração para TypeScript
declare global {
  interface WindowEventMap {
    'subscription:refresh': SubscriptionRefreshEvent;
  }
}

/**
 * Interface que define as informações de assinatura retornadas pelo hook
 */
export interface SubscriptionInfo {
  isLoading: boolean;              // Indica se os dados estão sendo carregados
  subscription: SubscriptionData | null; // Dados da assinatura
  isActive: boolean;              // Se a assinatura está ativa
  isPremium: boolean;             // Se o usuário tem acesso premium
  error: string | null;           // Mensagem de erro, se houver
  refreshSubscription: () => void; // Função para atualizar os dados
}

/**
 * Hook para gerenciar o estado da assinatura do usuário
 * Centraliza a lógica de verificação e atualização da assinatura
 * Utiliza suspense para melhor experiência de carregamento
 */
export function useSubscription(options?: { suspense?: boolean }): SubscriptionInfo {
  // Estado para controlar atualizações forçadas
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Função para buscar dados da assinatura
  const fetchSubscription = useCallback(async (): Promise<SubscriptionData> => {
    // Adicionar parâmetro para evitar cache
    const cacheParam = new Date().getTime();
    const response = await fetch(`/api/subscription?_=${cacheParam}&refreshToken=${refreshCounter}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao verificar assinatura: ${response.status}`);
    }
    
    const data = await response.json();
    return data.subscription;
  }, [refreshCounter]);
  
  // Usar o hook de suspense para buscar dados
  const { 
    data: subscription, 
    error, 
    status,
    refetch 
  } = useSuspenseQuery<SubscriptionData>(
    fetchSubscription,
    {
      suspense: options?.suspense !== false,
      retry: 2,
      cacheKey: `subscription-${refreshCounter}`,
      onError: (error) => {
        console.error('Erro ao buscar assinatura:', error);
      }
    }
  );
  
  // Função para atualizar os dados da assinatura
  const refreshSubscription = useCallback(() => {
    // Atualiza o contador para forçar refetch
    setRefreshCounter(prev => prev + 1);
    
    // Dispara evento para sincronizar outros componentes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('subscription:refresh', {
        detail: { source: 'hook' }
      }));
    }
    
    // Refetch dos dados
    refetch(true);
  }, [refetch]);
  
  // Sincronizar estado entre componentes via eventos personalizados
  useEffect(() => {
    const handleRefreshEvent = (event: SubscriptionRefreshEvent) => {
      // Evitar loop infinito, só atualiza se o evento não veio deste hook
      if (event.detail.source !== 'hook') {
        refetch(true);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('subscription:refresh', handleRefreshEvent);
      
      return () => {
        window.removeEventListener('subscription:refresh', handleRefreshEvent);
      };
    }
  }, [refetch]);
  
  // Calcular estados derivados
  const isActive = subscription ? isSubscriptionActive(subscription) : false;
  const isPremium = subscription ? hasPremiumAccess(subscription) : false;
  const isLoading = status === 'loading';

  return {
    isLoading,
    subscription,
    isActive,
    isPremium,
    error: error?.message || null,
    refreshSubscription
  };
}
