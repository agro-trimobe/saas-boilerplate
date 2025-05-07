'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

interface CabecalhoPaginaProps {
  titulo: string
  descricao?: string
  acoes?: React.ReactNode
  breadcrumbs?: Array<{ titulo: string; href?: string }>
  badges?: React.ReactNode
  className?: string
}

export function CabecalhoPagina({
  titulo,
  descricao,
  acoes,
  breadcrumbs,
  badges,
  className
}: CabecalhoPaginaProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5", className)}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="mx-2 h-4 w-4" />}
                {item.href ? (
                  <Link href={item.href} className="hover:underline">
                    {item.titulo}
                  </Link>
                ) : (
                  <span>{item.titulo}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
          {badges && badges}
        </div>
        {descricao && <p className="text-sm text-muted-foreground mt-1">{descricao}</p>}
      </div>
      {acoes && (
        <div className="flex items-center gap-3">
          {acoes}
        </div>
      )}
    </div>
  )
}

interface CabecalhoVoltarProps {
  titulo: string
  descricao?: string
  urlVoltar: string
  textoBotaoVoltar?: string
  className?: string
}

export function CabecalhoVoltar({
  titulo,
  descricao,
  urlVoltar,
  textoBotaoVoltar = 'Voltar',
  className
}: CabecalhoVoltarProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5", className)}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
        {descricao && <p className="text-sm text-muted-foreground mt-1">{descricao}</p>}
      </div>
      <Button variant="outline" asChild>
        <Link href={urlVoltar} className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          {textoBotaoVoltar}
        </Link>
      </Button>
    </div>
  )
}
