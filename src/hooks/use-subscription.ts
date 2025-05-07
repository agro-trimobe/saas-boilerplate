'use client';

import { useState, useEffect, useCallback } from 'react';
import { SubscriptionData, isSubscriptionActive, hasPremiumAccess } from '@/lib/types/subscription';

// Evento personalizado para atualizar assinatura em todos os componentes
type SubscriptionRefreshEvent = CustomEvent<{ source: string }>;

// Declaração para TypeScript
declare global {
  interface WindowEventMap {
    'subscription:refresh': SubscriptionRefreshEvent;
  }
}

export interface SubscriptionInfo {
  isLoading: boolean;
  subscription: SubscriptionData | null;
  isActive: boolean;
  isPremium: boolean;
  error: string | null;
  refreshSubscription: () => void;
}

export function useSubscription(): SubscriptionInfo {
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Função para buscar dados da assinatura
  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('[Assinatura] Buscando dados atualizados da assinatura...');
      
      // Adicionar parâmetro de cache-busting para garantir dados atualizados
      const cacheParam = new Date().getTime();
      const response = await fetch(`/api/subscription?_=${cacheParam}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao verificar assinatura: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[Assinatura] Dados atualizados recebidos:', data.subscription?.plan);
      setSubscription(data.subscription);
    } catch (error) {
      console.error('[Assinatura] Erro ao verificar assinatura:', error);
      setError('Não foi possível verificar o status da sua assinatura.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Função exposta para forçar atualização
  const refreshSubscription = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);
  
  // Efeito para buscar dados na montagem do componente e quando refreshCounter mudar
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription, refreshCounter]);
  
  // Ouvir evento global de atualização de assinatura
  useEffect(() => {
    const handleRefreshEvent = (event: SubscriptionRefreshEvent) => {
      console.log(`[Assinatura] Evento de atualização recebido de: ${event.detail.source}`);
      refreshSubscription();
    };
    
    // Registrar listener para o evento personalizado
    window.addEventListener('subscription:refresh', handleRefreshEvent);
    
    return () => {
      window.removeEventListener('subscription:refresh', handleRefreshEvent);
    };
  }, [refreshSubscription]);
  
  // Determinar se a assinatura está ativa e se é premium
  const isActive = subscription ? isSubscriptionActive(subscription) : false;
  const isPremium = subscription ? hasPremiumAccess(subscription) : false;

  return {
    isLoading,
    subscription,
    isActive,
    isPremium,
    error,
    refreshSubscription
  };
}
