'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

interface SecaoFormularioProps {
  titulo: string
  icone?: React.ReactNode
  className?: string
  children: React.ReactNode
  semSeparador?: boolean
}

export function SecaoFormulario({
  titulo,
  icone,
  className,
  children,
  semSeparador = false
}: SecaoFormularioProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 text-gray-900 font-medium">
        {icone && <span className="text-muted-foreground">{icone}</span>}
        {titulo}
      </div>
      <div className="space-y-4">
        {children}
      </div>
      {!semSeparador && <Separator className="my-2" />}
    </div>
  )
}

interface GrupoInputProps {
  label: string
  htmlFor: string
  obrigatorio?: boolean
  tooltip?: string
  tooltipIcone?: React.ReactNode
  mensagemErro?: string
  className?: string
  children: React.ReactNode
}

export function GrupoInput({
  label,
  htmlFor,
  obrigatorio,
  tooltip,
  tooltipIcone,
  mensagemErro,
  className,
  children
}: GrupoInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
        <label htmlFor={htmlFor}>
          {label} {obrigatorio && <span className="text-destructive">*</span>}
        </label>
        {tooltip && tooltipIcone && (
          <span className="text-muted-foreground cursor-help" title={tooltip}>
            {tooltipIcone}
          </span>
        )}
      </div>
      {children}
      {mensagemErro && (
        <p className="text-sm text-destructive">{mensagemErro}</p>
      )}
    </div>
  )
}
