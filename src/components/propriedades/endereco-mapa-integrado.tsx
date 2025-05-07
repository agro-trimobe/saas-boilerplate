'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, LocateFixed, Building } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

// Lista de estados brasileiros
const estadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

interface EnderecoMapaIntegradoProps {
  endereco: string
  municipio: string
  estado: string
  coordenadas: {
    latitude: number
    longitude: number
  }
  errosValidacao: Record<string, string>
  onEnderecoChange: (endereco: string) => void
  onMunicipioChange: (municipio: string) => void
  onEstadoChange: (estado: string) => void
  onCoordenadasChange: (coordenadas: { latitude: number; longitude: number }) => void
}

// Importação dinâmica do mapa para evitar problemas de SSR
interface MapSelectorProps {
  initialPosition?: { latitude: number; longitude: number }
  onPositionChange: (position: { latitude: number; longitude: number }) => void
  onAddressFound?: (address: string, municipio: string, estado: string) => void
}

const MapSelector = dynamic<MapSelectorProps>(() => import('./map-selector'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Carregando mapa...</p>
      </div>
    </div>
  )
})

export function EnderecoMapaIntegrado({
  endereco,
  municipio,
  estado,
  coordenadas,
  errosValidacao,
  onEnderecoChange,
  onMunicipioChange,
  onEstadoChange,
  onCoordenadasChange
}: EnderecoMapaIntegradoProps) {
  const [busca, setBusca] = useState('')
  
  // Buscar endereço e atualizar campos
  const buscarEndereco = async () => {
    if (!busca.trim()) return
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busca)}, Brasil&limit=1`
      )
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const latitude = parseFloat(lat)
        const longitude = parseFloat(lon)
        
        // Extrair município e estado do endereço encontrado
        const partes = display_name.split(', ')
        let novoMunicipio = municipio
        let novoEstado = estado
        
        // Tentar extrair município (geralmente é o 3º do fim para o início)
        if (partes.length > 2) {
          novoMunicipio = partes[partes.length - 3]
        }
        
        // Tentar extrair o estado (geralmente é o 2º do fim para o início)
        if (partes.length > 1) {
          const possiveisEstados = partes[partes.length - 2].split(' ')
          if (possiveisEstados.length > 0) {
            const candidatoEstado = possiveisEstados[0].toUpperCase()
            if (estadosBrasileiros.includes(candidatoEstado)) {
              novoEstado = candidatoEstado
            }
          }
        }
        
        // Atualizar coordenadas
        onCoordenadasChange({
          latitude,
          longitude
        })
        
        // Atualizar endereço, município e estado
        onEnderecoChange(display_name.split(', Brasil')[0])
        onMunicipioChange(novoMunicipio)
        onEstadoChange(novoEstado)
        
        toast({
          title: 'Endereço encontrado',
          description: 'Dados do endereço atualizados com sucesso'
        })
        
        // Limpar campo de busca
        setBusca('')
      } else {
        toast({
          title: 'Endereço não encontrado',
          description: 'Tente um endereço mais específico',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Erro ao buscar endereço:', error)
      toast({
        title: 'Erro na busca',
        description: 'Não foi possível buscar o endereço',
        variant: 'destructive'
      })
    }
  }

  // Função para lidar com resultado de busca do mapa
  const handleAddressFound = (novoEndereco: string, novoMunicipio: string, novoEstado: string) => {
    onEnderecoChange(novoEndereco)
    onMunicipioChange(novoMunicipio)
    onEstadoChange(novoEstado)
  }

  return (
    <Card className="shadow-sm hover:shadow transition-shadow border-t-4 border-t-emerald-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-primary" />
          Localização e Endereço
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Instruções claras */}
        <div className="bg-muted/40 p-3 rounded-md border border-muted">
          <p className="text-sm flex items-start">
            <Search className="h-4 w-4 mr-2 mt-0.5 text-primary" />
            <span>
              <strong>Como localizar sua propriedade:</strong> Digite o endereço completo na barra de pesquisa ou selecione o local diretamente no mapa.
            </span>
          </p>
        </div>
        
        {/* Busca de endereço - mais proeminente */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="busca-endereco"
                placeholder="Digite o endereço completo da propriedade..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscarEndereco()}
                className="pr-10 h-11"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={buscarEndereco}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11"
              title="Usar minha localização atual"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      onCoordenadasChange({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                      })
                      toast({
                        title: 'Localização encontrada',
                        description: 'Sua localização atual foi registrada'
                      })
                    },
                    () => {
                      toast({
                        title: 'Localização indisponível',
                        description: 'Não foi possível obter sua localização atual',
                        variant: 'destructive'
                      })
                    }
                  )
                }
              }}
            >
              <LocateFixed className="h-5 w-5" />
            </Button>
          </div>
          <Button 
            type="button" 
            onClick={buscarEndereco}
            className="w-full"
            variant="secondary"
            size="sm"
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar no mapa
          </Button>
        </div>

        {/* Mapa interativo */}
        <div className="rounded-md overflow-hidden h-[400px] border">
          <MapSelector
            initialPosition={coordenadas.latitude !== 0 || coordenadas.longitude !== 0 ? coordenadas : undefined}
            onPositionChange={onCoordenadasChange}
            onAddressFound={handleAddressFound}
          />
        </div>

        {/* Dados do endereço - seção com título */}
        <div className="border rounded-md p-4 space-y-4">
          <h3 className="text-sm font-medium flex items-center">
            <Building className="h-4 w-4 mr-2 text-primary" />
            Dados do endereço
          </h3>
          
          {/* Endereço completo */}
          <div className="space-y-2">
            <Label htmlFor="endereco" className={errosValidacao.endereco ? 'text-destructive' : ''}>
              Endereço completo *
            </Label>
            <Input
              id="endereco"
              value={endereco}
              onChange={(e) => onEnderecoChange(e.target.value)}
              placeholder="Ex: Avenida Paulista, 1000"
              className={errosValidacao.endereco ? 'border-destructive' : ''}
              required
            />
            {errosValidacao.endereco && (
              <p className="text-xs text-destructive">{errosValidacao.endereco}</p>
            )}
          </div>
          
          {/* Município e Estado - numa mesma seção visual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="municipio" className={errosValidacao.municipio ? 'text-destructive' : ''}>
                Município *
              </Label>
              <Input
                id="municipio"
                value={municipio}
                onChange={(e) => onMunicipioChange(e.target.value)}
                placeholder="Ex: São Paulo"
                className={errosValidacao.municipio ? 'border-destructive' : ''}
                required
              />
              {errosValidacao.municipio && (
                <p className="text-xs text-destructive">{errosValidacao.municipio}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado" className={errosValidacao.estado ? 'text-destructive' : ''}>
                Estado *
              </Label>
              <Select
                value={estado}
                onValueChange={onEstadoChange}
              >
                <SelectTrigger id="estado" className={errosValidacao.estado ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosBrasileiros.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
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

        {/* Coordenadas - agora mais visível */}
        <div className={`flex items-center justify-between p-3 rounded-md ${coordenadas.latitude !== 0 || coordenadas.longitude !== 0 ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
          <span className="flex items-center text-sm font-medium">
            <LocateFixed className={`h-4 w-4 mr-2 ${coordenadas.latitude !== 0 || coordenadas.longitude !== 0 ? 'text-green-600' : 'text-amber-600'}`} />
            Coordenadas
          </span>
          <span className={`text-sm ${coordenadas.latitude !== 0 || coordenadas.longitude !== 0 ? 'text-green-700' : 'text-amber-700'}`}>
            {coordenadas.latitude !== 0 || coordenadas.longitude !== 0 
              ? `Lat: ${coordenadas.latitude.toFixed(6)}, Lon: ${coordenadas.longitude.toFixed(6)}` 
              : 'Não definidas - localize no mapa'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
