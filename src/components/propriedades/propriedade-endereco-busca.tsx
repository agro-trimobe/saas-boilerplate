'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, MapPin, LocateFixed } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'

interface PropriedadeEnderecoBuscaProps {
  onEncontrarEndereco: (endereco: string, municipio: string, estado: string, latitude: number, longitude: number) => void
}

export function PropriedadeEnderecoBusca({
  onEncontrarEndereco,
}: PropriedadeEnderecoBuscaProps) {
  const [busca, setBusca] = useState('')
  const [buscando, setBuscando] = useState(false)
  
  // Lista de estados brasileiros para validação
  const estadosBrasileiros = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  // Buscar endereço e atualizar campos
  const buscarEndereco = async () => {
    if (!busca.trim()) return
    
    try {
      setBuscando(true)
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
        let municipio = ''
        let estado = ''
        
        // Tentar extrair município (geralmente é o 3º do fim para o início)
        if (partes.length > 2) {
          municipio = partes[partes.length - 3]
        }
        
        // Tentar extrair o estado (geralmente é o 2º do fim para o início)
        if (partes.length > 1) {
          const possiveisEstados = partes[partes.length - 2].split(' ')
          if (possiveisEstados.length > 0) {
            const candidatoEstado = possiveisEstados[0].toUpperCase()
            if (estadosBrasileiros.includes(candidatoEstado)) {
              estado = candidatoEstado
            }
          }
        }
        
        // Chamar o callback com todos os dados
        onEncontrarEndereco(
          display_name.split(', Brasil')[0], 
          municipio, 
          estado, 
          latitude, 
          longitude
        )
        
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
    } finally {
      setBuscando(false)
    }
  }

  // Usar minha localização atual
  const usarLocalizacaoAtual = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude
          
          try {
            // Fazer geocodificação reversa para obter o endereço
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            )
            
            const data = await response.json()
            
            if (data && data.display_name) {
              // Extrair informações do resultado
              let endereco = data.display_name.split(', Brasil')[0]
              let municipio = data.address.city || data.address.town || data.address.village || ''
              let estado = ''
              
              // Tentar extrair o estado
              if (data.address.state) {
                const estadoCompleto = data.address.state
                // Tentar encontrar a sigla do estado
                for (const sigla of estadosBrasileiros) {
                  if (estadoCompleto.includes(sigla) || 
                      estadoCompleto.toUpperCase().includes(sigla)) {
                    estado = sigla
                    break
                  }
                }
              }
              
              // Chamar o callback com todos os dados
              onEncontrarEndereco(endereco, municipio, estado, latitude, longitude)
              
              toast({
                title: 'Localização encontrada',
                description: 'Sua localização atual foi carregada com sucesso'
              })
            } else {
              // Se não conseguir obter o endereço, pelo menos atualiza as coordenadas
              onEncontrarEndereco('', '', '', latitude, longitude)
              
              toast({
                title: 'Coordenadas encontradas',
                description: 'Não foi possível obter o endereço completo, mas as coordenadas foram atualizadas',
                variant: 'default'
              })
            }
          } catch (error) {
            console.error('Erro na geocodificação reversa:', error)
            
            // Se houver erro, pelo menos atualiza as coordenadas
            onEncontrarEndereco('', '', '', latitude, longitude)
            
            toast({
              title: 'Coordenadas encontradas',
              description: 'Não foi possível obter o endereço completo, mas as coordenadas foram atualizadas',
              variant: 'default'
            })
          }
        },
        (error) => {
          console.error('Erro ao obter localização:', error)
          
          toast({
            title: 'Erro de localização',
            description: 'Não foi possível obter sua localização atual',
            variant: 'destructive'
          })
        }
      )
    } else {
      toast({
        title: 'Geolocalização não suportada',
        description: 'Seu navegador não suporta geolocalização',
        variant: 'destructive'
      })
    }
  }

  return (
    <Card className="mb-4 border-primary/20">
      <CardContent className="pt-4">
        <div className="bg-muted/40 p-3 rounded-md border border-muted mb-3">
          <p className="text-sm flex items-start">
            <MapPin className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
            <span>
              <strong>Como localizar sua propriedade:</strong> Digite o endereço completo na barra de pesquisa ou selecione o local diretamente no mapa.
            </span>
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="busca-endereco"
              placeholder="Digite o endereço completo da propriedade..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarEndereco()}
              className="pr-10 h-11"
              disabled={buscando}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={buscarEndereco}
              disabled={buscando}
            >
              {buscando ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 flex-shrink-0"
            title="Usar minha localização atual"
            onClick={usarLocalizacaoAtual}
          >
            <LocateFixed className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
