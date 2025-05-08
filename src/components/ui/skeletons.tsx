'use client';

import { Card, CardContent, CardHeader, CardFooter } from './card';

/**
 * Componente de esqueleto para cartões
 * Exibe uma versão em carregamento dos cartões da interface
 */
export function CardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2 gap-1.5">
        <div className="h-5 w-1/3 bg-muted/70 rounded-md animate-pulse" />
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        <div className="h-4 w-full bg-muted/60 rounded-md animate-pulse" />
        <div className="h-4 w-2/3 bg-muted/60 rounded-md animate-pulse" />
        <div className="h-10 w-1/2 bg-muted/50 rounded-md animate-pulse" />
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between">
        <div className="h-3 w-1/4 bg-muted/40 rounded-md animate-pulse" />
      </CardFooter>
    </Card>
  );
}

/**
 * Esqueleto para exibição de texto em carregamento
 */
export function TextSkeleton({ width = 'w-full', height = 'h-4' }: { width?: string, height?: string }) {
  return (
    <div className={`${width} ${height} bg-muted/60 rounded-md animate-pulse`} />
  );
}

/**
 * Esqueleto para avatares e imagens em carregamento
 */
export function AvatarSkeleton({ size = 'h-10 w-10' }: { size?: string }) {
  return (
    <div className={`${size} rounded-full bg-muted/70 animate-pulse`} />
  );
}

/**
 * Esqueleto para tabelas em carregamento
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="w-full flex items-center space-x-4 py-3">
      {Array(columns).fill(0).map((_, index) => (
        <div 
          key={index} 
          className={`h-4 bg-muted/60 rounded-md animate-pulse ${index === 0 ? 'w-1/6' : 'flex-1'}`} 
        />
      ))}
    </div>
  );
}
