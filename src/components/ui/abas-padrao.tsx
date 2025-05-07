'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface AbaProps {
  valor: string
  titulo: string
  icone?: React.ReactNode
  conteudo: React.ReactNode
}

interface AbasPadraoProps {
  abas: AbaProps[]
  valorPadrao?: string
  className?: string
  classNameTabs?: string
  classNameConteudo?: string
  tamanhoGrid?: 'auto' | 2 | 3 | 4
}

export function AbasPadrao({
  abas,
  valorPadrao,
  className,
  classNameTabs,
  classNameConteudo,
  tamanhoGrid = 'auto'
}: AbasPadraoProps) {
  // Se não for especificado um valor padrão, usa o valor da primeira aba
  const valorInicial = valorPadrao || (abas.length > 0 ? abas[0].valor : '')

  return (
    <Tabs defaultValue={valorInicial} className={cn("w-full", className)}>
      <TabsList 
        className={cn(
          tamanhoGrid === 'auto' ? '' : `grid grid-cols-${tamanhoGrid}`,
          "mb-6",
          classNameTabs
        )}
      >
        {abas.map((aba) => (
          <TabsTrigger 
            key={aba.valor} 
            value={aba.valor}
            className="flex items-center gap-2"
          >
            {aba.icone && <span className="h-4 w-4">{aba.icone}</span>}
            {aba.titulo}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {abas.map((aba) => (
        <TabsContent 
          key={aba.valor} 
          value={aba.valor}
          className={cn("space-y-5", classNameConteudo)}
        >
          {aba.conteudo}
        </TabsContent>
      ))}
    </Tabs>
  )
}
