'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Info, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import dynamic from 'next/dynamic'

// Lista de estados brasileiros
const estadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

// Não precisamos mais importar o mapa neste componente pois ele será exibido separadamente

interface PropriedadeEnderecoUnificadoProps {
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

export function PropriedadeEnderecoUnificado({
  endereco,
  municipio,
  estado,
  coordenadas,
  errosValidacao,
  onEnderecoChange,
  onMunicipioChange,
  onEstadoChange,
  onCoordenadasChange
}: PropriedadeEnderecoUnificadoProps) {
  const [enderecoTemp, setEnderecoTemp] = useState(endereco)
  const [buscando, setBuscando] = useState(false)
  const [coordenadasEncontradas, setCoordenadasEncontradas] = useState(false)
  const [ajusteManualAtivo, setAjusteManualAtivo] = useState(false)
  const [latitudeManual, setLatitudeManual] = useState(coordenadas.latitude.toString())
  const [longitudeManual, setLongitudeManual] = useState(coordenadas.longitude.toString())
  
  // Atualizar estados internos quando as props mudarem
  useEffect(() => {
    setEnderecoTemp(endereco)
  }, [endereco])
  
  useEffect(() => {
    setLatitudeManual(coordenadas.latitude === 0 ? '' : coordenadas.latitude.toString())
    setLongitudeManual(coordenadas.longitude === 0 ? '' : coordenadas.longitude.toString())
    
    // Verificar se temos coordenadas válidas
    setCoordenadasEncontradas(coordenadas.latitude !== 0 && coordenadas.longitude !== 0)
  }, [coordenadas])
  
  // Buscar coordenadas a partir do endereço
  const buscarCoordenadas = async () => {
    if (!enderecoTemp.trim()) {
      toast({
        title: 'Endereço vazio',
        description: 'Digite um endereço para localizar no mapa',
        variant: 'destructive'
      })
      return
    }
    
    try {
      setBuscando(true)
      
      // Construir a consulta incluindo município e estado quando disponíveis
      let consultaEndereco = enderecoTemp.trim();
      
      // Adicionar município se estiver preenchido e não estiver já no endereço
      if (municipio.trim() && !consultaEndereco.toLowerCase().includes(municipio.toLowerCase())) {
        consultaEndereco += `, ${municipio}`;
      }
      
      // Adicionar estado se estiver preenchido e não estiver já no endereço
      if (estado.trim() && !consultaEndereco.toLowerCase().includes(estado.toLowerCase())) {
        consultaEndereco += `, ${estado}`;
      }
      
      // Adicionar Brasil para melhorar a precisão da busca
      consultaEndereco += ', Brasil';
      
      console.log('Buscando endereço:', consultaEndereco);
      
      // Fazer a requisição para a API Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(consultaEndereco)}&limit=1`
      )
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const latitude = parseFloat(lat)
        const longitude = parseFloat(lon)
        
        // Extrair município e estado do endereço encontrado
        const partes = display_name.split(', ')
        let novoMunicipio = ''
        let novoEstado = ''
        
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
        
        // Atualizar estados com os dados encontrados
        const novoEndereco = display_name.split(', Brasil')[0]
        onEnderecoChange(novoEndereco)
        onMunicipioChange(novoMunicipio)
        onEstadoChange(novoEstado)
        onCoordenadasChange({ latitude, longitude })
        
        // Atualizar estado interno
        setEnderecoTemp(novoEndereco)
        setCoordenadasEncontradas(true)
        
        // Atualizar campos manuais
        setLatitudeManual(latitude.toString())
        setLongitudeManual(longitude.toString())
        
        toast({
          title: 'Endereço localizado',
          description: 'As coordenadas foram atualizadas com sucesso'
        })
      } else {
        toast({
          title: 'Endereço não encontrado',
          description: 'Não foi possível encontrar coordenadas para este endereço',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error)
      toast({
        title: 'Erro na busca',
        description: 'Ocorreu um erro ao tentar localizar o endereço',
        variant: 'destructive'
      })
    } finally {
      setBuscando(false)
    }
  }
  
  // Alternar exibição dos campos de ajuste manual
  const toggleAjusteManual = () => {
    setAjusteManualAtivo(!ajusteManualAtivo)
  }
  
  // Aplicar coordenadas manuais
  const aplicarCoordenadasManuais = () => {
    const latitude = parseFloat(latitudeManual)
    const longitude = parseFloat(longitudeManual)
    
    if (isNaN(latitude) || isNaN(longitude)) {
      toast({
        title: 'Coordenadas inválidas',
        description: 'Digite valores numéricos válidos para latitude e longitude',
        variant: 'destructive'
      })
      return
    }
    
    onCoordenadasChange({ latitude, longitude })
    setCoordenadasEncontradas(true)
    setAjusteManualAtivo(false)
    
    toast({
      title: 'Coordenadas atualizadas',
      description: 'As coordenadas foram atualizadas manualmente'
    })
  }
  return (
    <Card className="shadow-sm hover:shadow border-t-4 border-t-emerald-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-primary" />
          Localização da Propriedade
        </CardTitle>
        <CardDescription>
          Digite o endereço completo para localizar automaticamente no mapa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campo de endereço */}
        <div>
          <Input
            id="endereco-completo"
            placeholder="Digite o endereço completo da propriedade..."
            value={enderecoTemp}
            onChange={(e) => setEnderecoTemp(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarCoordenadas()}
            className={errosValidacao.endereco ? 'border-destructive' : ''}
          />
          {errosValidacao.endereco && (
            <p className="text-xs text-destructive mt-1">{errosValidacao.endereco}</p>
          )}
        </div>
        
        {/* Campos de município e estado */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="municipio" className={errosValidacao.municipio ? 'text-destructive' : ''}>
                Município
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
            <Input
              id="municipio"
              value={municipio}
              onChange={(e) => onMunicipioChange(e.target.value)}
              placeholder="Ex: São Paulo"
              className={errosValidacao.municipio ? 'border-destructive' : ''}
            />
            {errosValidacao.municipio && (
              <p className="text-xs text-destructive">{errosValidacao.municipio}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="estado" className={errosValidacao.estado ? 'text-destructive' : ''}>
                Estado
              </Label>
            </div>
            <Input
              id="estado"
              value={estado}
              onChange={(e) => {
                // Converter para maiúsculo e remover caracteres não alfabéticos
                const valor = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                onEstadoChange(valor);
              }}
              placeholder="Ex: SP"
              maxLength={2}
              className={`uppercase ${errosValidacao.estado ? 'border-destructive' : ''}`}
            />
            {errosValidacao.estado && (
              <p className="text-xs text-destructive">{errosValidacao.estado}</p>
            )}
            {!errosValidacao.estado && estado && (
              <p className="text-xs text-muted-foreground mt-1">Use a sigla do estado (2 letras)</p>
            )}
          </div>
        </div>
        
        {/* Botão de localização posicionado após os campos */}
        <div className="mt-4">
          <Button 
            type="button"
            size="sm"
            className="w-full"
            onClick={buscarCoordenadas}
            disabled={buscando}
          >
            {buscando ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Buscando endereço...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Localizar endereço no mapa
              </>
            )}
          </Button>
        </div>
        
        {/* Seção de coordenadas */}
        <div className="mt-3 p-3 bg-muted/30 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium flex items-center">
              <MapPin className="h-4 w-4 mr-1.5 text-primary" />
              Coordenadas Geográficas
            </h4>
            <Badge variant={coordenadasEncontradas ? "default" : "outline"} className={`text-xs ${coordenadasEncontradas ? 'bg-green-500 hover:bg-green-500' : ''}`}>
              {coordenadasEncontradas ? "Localizadas" : "Não localizadas"}
            </Badge>
          </div>
          
          {/* Exibição das coordenadas atuais */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Latitude:</span>{' '}
              <span className="font-medium">{coordenadas.latitude !== 0 ? coordenadas.latitude.toFixed(6) : '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Longitude:</span>{' '}
              <span className="font-medium">{coordenadas.longitude !== 0 ? coordenadas.longitude.toFixed(6) : '-'}</span>
            </div>
          </div>
          
          {/* Botão para alternar exibição do ajuste manual */}
          <Button variant="link" size="sm" className="mt-1 h-6 p-0" onClick={toggleAjusteManual}>
            {ajusteManualAtivo ? 'Cancelar ajuste manual' : 'Ajustar manualmente'}
          </Button>
          
          {/* Campos de ajuste manual de coordenadas */}
          {ajusteManualAtivo && (
            <div className="mt-2 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Latitude</Label>
                  <Input 
                    type="text" 
                    inputMode="decimal"
                    pattern="-?\d*\.?\d*"
                    value={latitudeManual} 
                    onChange={e => setLatitudeManual(e.target.value)}
                    placeholder="-23.5505" 
                    className="h-8 text-sm" 
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Longitude</Label>
                  <Input 
                    type="text" 
                    inputMode="decimal"
                    pattern="-?\d*\.?\d*"
                    value={longitudeManual} 
                    onChange={e => setLongitudeManual(e.target.value)}
                    placeholder="-46.6333" 
                    className="h-8 text-sm" 
                  />
                </div>
              </div>
              <Button size="sm" onClick={aplicarCoordenadasManuais} className="w-full">
                Aplicar coordenadas manuais
              </Button>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-2">
            As coordenadas serão atualizadas automaticamente ao localizar um endereço, ou você pode ajustá-las manualmente ou clicando no mapa.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

