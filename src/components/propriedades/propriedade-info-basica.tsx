'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Home, Building, Ruler, Info } from 'lucide-react'
import { Cliente } from '@/lib/crm-utils'

interface PropriedadeInfoBasicaProps {
  nome: string
  clienteId: string
  area: number
  clientes: Cliente[]
  errosValidacao: Record<string, string>
  onNomeChange: (nome: string) => void
  onClienteIdChange: (clienteId: string) => void
  onAreaChange: (area: number) => void
}

export function PropriedadeInfoBasica({
  nome,
  clienteId,
  area,
  clientes,
  errosValidacao,
  onNomeChange,
  onClienteIdChange,
  onAreaChange
}: PropriedadeInfoBasicaProps) {
  return (
    <Card className="shadow-sm hover:shadow transition-shadow border-t-4 border-t-indigo-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <Home className="h-5 w-5 mr-2 text-primary" />
          Informações Básicas
        </CardTitle>
        <CardDescription>
          Dados principais da propriedade rural
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label 
              htmlFor="nome" 
              className={errosValidacao.nome ? 'text-destructive' : ''}
            >
              Nome da Propriedade *
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="w-[200px] text-xs">Nome pelo qual a propriedade é conhecida ou identificada</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
            placeholder="Nome da propriedade"
            className={errosValidacao.nome ? 'border-destructive' : ''}
            required
          />
          {errosValidacao.nome && (
            <p className="text-xs text-destructive">{errosValidacao.nome}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label 
              htmlFor="clienteId" 
              className={errosValidacao.clienteId ? 'text-destructive' : ''}
            >
              Proprietário *
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="w-[200px] text-xs">Cliente que possui esta propriedade</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select
            value={clienteId}
            onValueChange={onClienteIdChange}
          >
            <SelectTrigger 
              id="clienteId" 
              className={errosValidacao.clienteId ? 'border-destructive' : ''}
            >
              <SelectValue placeholder="Selecione o proprietário" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  <span className="flex items-center gap-2">
                    <Building className="h-3.5 w-3.5 text-muted-foreground" />
                    {cliente.nome}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errosValidacao.clienteId && (
            <p className="text-xs text-destructive">{errosValidacao.clienteId}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label 
              htmlFor="area" 
              className={errosValidacao.area ? 'text-destructive' : ''}
            >
              Área (hectares) *
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="w-[200px] text-xs">
                    Pequena: até 20 ha<br />
                    Média: 20 a 100 ha<br />
                    Grande: mais de 100 ha
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <Input
              id="area"
              type="number"
              value={area === 0 ? '' : area}
              onChange={(e) => onAreaChange(parseFloat(e.target.value) || 0)}
              placeholder="Área em hectares"
              className={`pr-8 ${errosValidacao.area ? 'border-destructive' : ''}`}
              required
            />
            <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">ha</span>
          </div>
          {errosValidacao.area && (
            <p className="text-xs text-destructive">{errosValidacao.area}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
