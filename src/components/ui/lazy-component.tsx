'use client';

import { Suspense, lazy, ComponentType, ReactNode } from 'react';
import { Loading } from './loading';

/**
 * Função de ajuda para criar componentes lazy
 * Simplifica o padrão de importação lazy + suspense
 * 
 * @example
 * const MeuComponente = createLazyComponent(() => import('./meu-componente'));
 * 
 * <MeuComponente algumaPropriedade={valor} />
 */
export function createLazyComponent<P = any>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback: ReactNode = <Loading size="default" />
) {
  const LazyComponent = lazy(importFn);
  
  // Definindo o componente wrapper com tipos mais genéricos
  const WrappedComponent = (props: any) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
  
  return WrappedComponent;
}
