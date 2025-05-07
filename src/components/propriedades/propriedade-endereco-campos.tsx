'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { MapPin, Building, MapPinned, Info } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

// Lista de estados brasileiros
const estadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

interface PropriedadeEnderecoCamposProps {
  endereco: string
  municipio: string
  estado: string
  errosValidacao: Record<string, string>
  onEnderecoChange: (endereco: string) => void
  onMunicipioChange: (municipio: string) => void
  onEstadoChange: (estado: string) => void
}

export function PropriedadeEnderecoCampos({
  endereco,
  municipio,
  estado,
  errosValidacao,
  onEnderecoChange,
  onMunicipioChange,
  onEstadoChange
}: PropriedadeEnderecoCamposProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <MapPinned className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-medium">Dados do endereço</h4>
      </div>
      <Separator />
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label 
            htmlFor="endereco" 
            className={errosValidacao.endereco ? 'text-destructive' : ''}
          >
            Endereço completo *
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="w-[200px] text-xs">Endereço completo da propriedade com rua, número, bairro, etc.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            id="endereco"
            value={endereco}
            onChange={(e) => onEnderecoChange(e.target.value)}
            placeholder="Endereço da propriedade"
            className={`pl-10 ${errosValidacao.endereco ? 'border-destructive' : ''}`}
          />
        </div>
        {errosValidacao.endereco && (
          <p className="text-xs text-destructive">{errosValidacao.endereco}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label 
              htmlFor="municipio" 
              className={errosValidacao.municipio ? 'text-destructive' : ''}
            >
              Município *
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="w-[160px] text-xs">Município/cidade onde a propriedade está localizada</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Building className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              id="municipio"
              value={municipio}
              onChange={(e) => onMunicipioChange(e.target.value)}
              placeholder="Ex: São Paulo"
              className={`pl-10 ${errosValidacao.municipio ? 'border-destructive' : ''}`}
            />
          </div>
          {errosValidacao.municipio && (
            <p className="text-xs text-destructive">{errosValidacao.municipio}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label 
              htmlFor="estado" 
              className={errosValidacao.estado ? 'text-destructive' : ''}
            >
              Estado *
            </Label>
          </div>
          <Select
            value={estado}
            onValueChange={onEstadoChange}
          >
            <SelectTrigger 
              id="estado" 
              className={errosValidacao.estado ? 'border-destructive' : ''}
            >
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent position="popper">
              {estadosBrasileiros.map((sigla) => (
                <SelectItem key={sigla} value={sigla}>
                  {sigla}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errosValidacao.estado && (
            <p className="text-xs text-destructive">{errosValidacao.estado}</p>
          )}
        </div>
      </div>
    </div>
  )
}
