'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronDown, Filter, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ClienteFiltrosProps {
  busca: string
  setBusca: (valor: string) => void
  filtro: 'Todos' | 'Pequeno' | 'Médio' | 'Grande'
  setFiltro: (valor: 'Todos' | 'Pequeno' | 'Médio' | 'Grande') => void
  filtroTipo: 'Todos' | 'PF' | 'PJ'
  setFiltroTipo: (valor: 'Todos' | 'PF' | 'PJ') => void
  ultimaInteracao: 'Todos' | '7dias' | '30dias' | '90dias'
  setUltimaInteracao: (valor: 'Todos' | '7dias' | '30dias' | '90dias') => void
  resetarFiltros: () => void
}

export function ClienteFiltros({
  busca,
  setBusca,
  filtro,
  setFiltro,
  filtroTipo,
  setFiltroTipo,
  ultimaInteracao,
  setUltimaInteracao,
  resetarFiltros
}: ClienteFiltrosProps) {
  const [aberto, setAberto] = useState(false)
  const [filtrosAtivos, setFiltrosAtivos] = useState(0)
  
  // Verifica quantos filtros estão ativos
  React.useEffect(() => {
    let count = 0
    if (filtro !== 'Todos') count++
    if (filtroTipo !== 'Todos') count++
    if (ultimaInteracao !== 'Todos') count++
    setFiltrosAtivos(count)
  }, [filtro, filtroTipo, ultimaInteracao])
  
  return (
    <div className="space-y-2 mb-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF/CNPJ ou email..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-8 w-full"
          />
          {busca && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6" 
              onClick={() => setBusca('')}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Limpar busca</span>
            </Button>
          )}
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className={cn(
                  filtrosAtivos > 0 && "relative"
                )}
                onClick={() => setAberto(!aberto)}
              >
                <Filter className="h-4 w-4" />
                {filtrosAtivos > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                  >
                    {filtrosAtivos}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Filtros avançados</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button variant="outline" size="sm" onClick={resetarFiltros} disabled={filtrosAtivos === 0 && !busca}>
          Limpar filtros
        </Button>
      </div>
      
      <Collapsible open={aberto} onOpenChange={setAberto}>
        <CollapsibleContent className="mt-2 bg-card rounded-md border p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                Perfil do Cliente
              </label>
              <Select value={filtro} onValueChange={(value: any) => setFiltro(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos os perfis</SelectItem>
                  <SelectItem value="Pequeno">Pequeno</SelectItem>
                  <SelectItem value="Médio">Médio</SelectItem>
                  <SelectItem value="Grande">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-green-500"></span>
                Tipo de Cliente
              </label>
              <Select value={filtroTipo} onValueChange={(value: any) => setFiltroTipo(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos os tipos</SelectItem>
                  <SelectItem value="PF">Pessoa Física</SelectItem>
                  <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-purple-500"></span>
                Última Interação
              </label>
              <Select value={ultimaInteracao} onValueChange={(value: any) => setUltimaInteracao(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Qualquer período</SelectItem>
                  <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                  <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                  <SelectItem value="90dias">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
