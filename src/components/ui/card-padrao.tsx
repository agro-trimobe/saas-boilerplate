'use client'

import React from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Componente Card com ícone
interface CardComIconeProps {
  titulo: string
  descricao?: string
  icone?: React.ReactNode
  className?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function CardComIcone({
  titulo,
  descricao,
  icone,
  className,
  children,
  footer
}: CardComIconeProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          {icone && <span className="text-primary">{icone}</span>}
          {titulo}
        </CardTitle>
        {descricao && <CardDescription>{descricao}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-2">
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="border-t pt-4 flex justify-end gap-3">
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}

// Componente Card de Estatística
interface CardEstatisticaProps {
  titulo: string
  valor: string | number
  icone: React.ReactNode
  corIcone?: string
  className?: string
}

export function CardEstatistica({
  titulo,
  valor,
  icone,
  corIcone = "text-primary",
  className
}: CardEstatisticaProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={cn("p-2 rounded-md mr-4 flex items-center justify-center", 
            corIcone === "text-primary" ? "bg-primary/10" : 
            corIcone === "text-green-600" ? "bg-green-100" :
            corIcone === "text-blue-600" ? "bg-blue-100" :
            corIcone === "text-purple-600" ? "bg-purple-100" :
            "bg-primary/10"
          )}>
            <span className={cn("h-6 w-6", corIcone)}>{icone}</span>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{titulo}</div>
            <div className="text-2xl font-bold">{valor}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente Card de Formulário
interface CardFormularioProps {
  titulo: string
  descricao?: string
  icone?: React.ReactNode
  className?: string
  children: React.ReactNode
  footer: React.ReactNode
}

export function CardFormulario({
  titulo,
  descricao,
  icone,
  className,
  children,
  footer
}: CardFormularioProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          {icone && <span className="text-primary">{icone}</span>}
          {titulo}
        </CardTitle>
        {descricao && <CardDescription>{descricao}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-2 space-y-4">
        {children}
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-end gap-3">
        {footer}
      </CardFooter>
    </Card>
  )
}
