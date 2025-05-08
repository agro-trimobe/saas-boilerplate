'use client';

import { Suspense, ReactNode, useState, useEffect } from 'react';
import { Loading } from './loading';

interface LoadingBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  delay?: number;
  minDuration?: number;
}

/**
 * Componente que cria uma fronteira de carregamento com Suspense
 * Inclui recursos avançados como atraso mínimo e máximo para evitar flash de conteúdo
 * 
 * @param children - Componentes filhos que podem disparar suspense
 * @param fallback - Componente de fallback para exibir durante carregamento
 * @param delay - Atraso antes de mostrar o indicador de carregamento (ms)
 * @param minDuration - Duração mínima do estado de carregamento (ms)
 */
export function LoadingBoundary({
  children,
  fallback = <Loading size="default" />,
  delay = 200,
  minDuration = 500
}: LoadingBoundaryProps) {
  const [showFallback, setShowFallback] = useState(false);
  
  // Controle de timers para evitar flash de conteúdo
  useEffect(() => {
    if (delay <= 0) {
      setShowFallback(true);
      return;
    }
    
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  // Wrapper que controla o tempo mínimo de exibição do loader
  const DelayedFallback = () => {
    const [showContent, setShowContent] = useState(false);
    
    useEffect(() => {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, minDuration);
      
      return () => clearTimeout(timer);
    }, []);
    
    return showContent ? fallback : null;
  };
  
  return (
    <Suspense fallback={showFallback ? <DelayedFallback /> : null}>
      {children}
    </Suspense>
  );
}
