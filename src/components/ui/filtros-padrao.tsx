'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FiltrosPadraoProps {
  titulo?: string
  subtitulo?: string
  children?: React.ReactNode
  filtrosAvancados?: React.ReactNode
  classNameContainer?: string
  onBusca?: (valor: string) => void
  termoBusca?: string
  onChangeBusca?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholderBusca?: string
  valorBusca?: string
  onResetarFiltros?: () => void
  botaoNovo?: {
    texto: string
    onClick: () => void
    icone?: React.ReactNode
  }
}

export function FiltrosPadrao({
  titulo,
  subtitulo,
  children,
  filtrosAvancados,
  classNameContainer,
  onBusca,
  termoBusca,
  onChangeBusca,
  placeholderBusca = "Buscar...",
  valorBusca = "",
  onResetarFiltros,
  botaoNovo
}: FiltrosPadraoProps) {
  const [busca, setBusca] = React.useState(valorBusca || termoBusca || "")
  const [filtrosAbertos, setFiltrosAbertos] = React.useState(false)

  // Manipula a busca
  const handleBusca = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    setBusca(valor)
  }

  // Submete a busca
  const submitBusca = () => {
    if (onBusca) {
      onBusca(busca)
    }
  }

  // Submete a busca ao pressionar Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submitBusca()
    }
  }
  
  return (
    <div className={cn("mb-4", classNameContainer)}>
      {(titulo || subtitulo) && (
        <div className="mb-4">
          {titulo && <h3 className="text-xl font-bold">{titulo}</h3>}
          {subtitulo && <p className="text-sm text-muted-foreground">{subtitulo}</p>}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Campo de busca */}
        <div className="relative w-full sm:w-auto flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={termoBusca !== undefined ? termoBusca : busca}
            onChange={(e) => {
              if (onChangeBusca) {
                onChangeBusca(e)
              } else {
                setBusca(e.target.value)
                // Opcionalmente, atualizar a busca externa enquanto digita
                onBusca && onBusca(e.target.value)
              }
            }}
            className="pl-9"
            placeholder={placeholderBusca}
          />
        </div>
        
        {/* Filtros e opções */}
        {children && (
          <div className="flex flex-wrap gap-2 items-center">
            {children}
            
            {onResetarFiltros && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onResetarFiltros}
                className="h-9"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Filtros avançados */}
      {filtrosAvancados && (
        <Collapsible
          open={filtrosAbertos}
          onOpenChange={setFiltrosAbertos}
          className="mt-4"
        >
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center gap-1 text-muted-foreground"
            >
              <span>Filtros avançados</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filtrosAvancados}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}

interface FiltroSelectProps {
  label: string
  valor: string
  onChange: (valor: string) => void
  opcoes: Array<{ valor: string, label: string }>
  className?: string
}

export function FiltroSelect({ label, valor, onChange, opcoes, className }: FiltroSelectProps) {
  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <select
        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background cursor-pointer pr-10"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
      >
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}
