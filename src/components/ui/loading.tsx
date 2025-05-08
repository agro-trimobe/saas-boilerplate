'use client';

import React from 'react';

interface LoadingProps {
  /**
   * Tamanho do indicador de carregamento
   * @default "default"
   */
  size?: "small" | "default" | "large";
  
  /**
   * Texto a ser exibido abaixo do spinner (opcional)
   */
  text?: string;
  
  /**
   * Se deve ocupar toda a área disponível (altura total)
   * @default false
   */
  fullHeight?: boolean;
  
  /**
   * Classe CSS adicional para o container
   */
  className?: string;
}

/**
 * Componente de loading reutilizável que exibe um spinner com opções de personalização
 */
export function Loading({
  size = "default",
  text,
  fullHeight = false,
  className = "",
}: LoadingProps) {
  // Mapeamento de tamanhos para classes
  const sizeClasses = {
    small: "h-4 w-4 border-2",
    default: "h-8 w-8 border-2",
    large: "h-12 w-12 border-3",
  };
  
  // Altura do container
  const heightClass = fullHeight ? "h-[calc(100vh-4rem)]" : "h-full min-h-[100px]";
  
  return (
    <div className={`flex flex-col items-center justify-center ${heightClass} ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`}
        aria-label="Carregando"
      />
      {text && (
        <p className="mt-4 text-sm text-muted-foreground font-medium">{text}</p>
      )}
    </div>
  );
}

/**
 * Componente de esqueleto para usar durante o carregamento de conteúdo
 * Exibe um efeito de pulso para indicar carregamento
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/60 ${className}`}
      {...props}
    />
  );
}

/**
 * Layout de esqueleto para carregamento de cards
 */
export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="px-6 py-4 bg-muted/30">
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}

/**
 * Layout de esqueleto para carregamento de tabelas
 */
export function TableSkeleton() {
  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-32" />
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <div className="p-3 bg-muted/20 border-b">
          <div className="flex gap-3">
            <Skeleton className="h-5 w-1/6" />
            <Skeleton className="h-5 w-1/6" />
            <Skeleton className="h-5 w-1/6" />
            <Skeleton className="h-5 w-1/6" />
          </div>
        </div>
        
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-3 border-b last:border-b-0">
            <div className="flex gap-3">
              <Skeleton className="h-5 w-1/6" />
              <Skeleton className="h-5 w-1/6" />
              <Skeleton className="h-5 w-1/6" />
              <Skeleton className="h-5 w-1/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
