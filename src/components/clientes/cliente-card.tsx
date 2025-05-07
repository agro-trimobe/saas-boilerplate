'use client'

import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ClienteCardProps {
  titulo: string
  valor: string
  icone: React.ReactNode
  corBorda: string
  corIcone: string
  corFundo?: string
  indicador?: {
    valor: number
    tendencia: 'up' | 'down'
    texto: string
  }
  link?: {
    texto: string
    href: string
  }
}

export function ClienteCard({
  titulo,
  valor,
  icone,
  corBorda,
  corIcone,
  corFundo,
  indicador,
  link
}: ClienteCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden border-l-4 shadow-sm hover:shadow-md transition-shadow flex flex-col",
      corBorda
    )}>
      <CardHeader className="p-3 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{titulo}</CardTitle>
          <div className={corIcone}>{icone}</div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-2 flex-grow">
        <div className="flex items-baseline gap-1">
          <div className="text-2xl font-bold">{valor}</div>
          {indicador && (
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px] h-4 border",
                indicador.tendencia === 'up' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' 
                  : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              )}
            >
              <span className="flex items-center gap-px">
                {indicador.tendencia === 'up' 
                  ? <ArrowUp className="h-3 w-3" /> 
                  : <ArrowDown className="h-3 w-3" />}
                <span>{indicador.valor}%</span>
              </span>
            </Badge>
          )}
        </div>
        {indicador && (
          <p className="text-xs text-muted-foreground mt-1">{indicador.texto}</p>
        )}
      </CardContent>
      {link && (
        <CardFooter className="p-0 mt-auto">
          <Link 
            href={link.href} 
            className="w-full text-center text-xs py-1.5 border-t hover:bg-muted/50 transition-colors font-medium text-primary flex items-center justify-center gap-1"
          >
            <span>{link.texto}</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}
