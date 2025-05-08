'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SubscriptionData, isSubscriptionActive, hasPremiumAccess } from '@/lib/types/subscription';

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
 * Versão simplificada para evitar loops infinitos
 */
export function useSubscription(options?: { suspense?: boolean }): SubscriptionInfo {
  // Estados do hook
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Referência para controlar chamadas simultâneas
  const fetchingRef = useRef<boolean>(false);
  const lastFetchRef = useRef<number>(0);
  
  // Função para buscar dados da assinatura de forma simplificada
  const fetchSubscriptionData = useCallback(async (force = false): Promise<void> => {
    // Evitar múltiplas solicitações simultâneas
    if (fetchingRef.current) return;
    
    // Verificar limite de tempo entre chamadas (3 segundos)
    const now = Date.now();
    const minInterval = 3000; 
    if (!force && (now - lastFetchRef.current) < minInterval) return;
    
    try {
      // Marcar início da busca e atualizar timestamp
      fetchingRef.current = true;
      lastFetchRef.current = now;
      setIsLoading(true);
      
      // Parâmetro para evitar cache
      const cacheParam = new Date().getTime();
      const response = await fetch(`/api/subscription?_=${cacheParam}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao verificar assinatura: ${response.status}`);
      }
      
      const data = await response.json();
      setSubscription(data.subscription);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar dados de assinatura:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar assinatura');
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, []);
  
  // Carregamento inicial dos dados
  useEffect(() => {
    // Buscar dados na montagem do componente
    fetchSubscriptionData();
    
    // Não adicionamos dependências para evitar múltiplas chamadas
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Função para forçar atualização dos dados
  const refreshSubscription = useCallback(() => {
    fetchSubscriptionData(true);
  }, [fetchSubscriptionData]);
  
  // Calcular estados derivados
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
