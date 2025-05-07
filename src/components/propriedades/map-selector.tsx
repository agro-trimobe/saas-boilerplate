'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Search, Crosshair } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

// Centro aproximado do Brasil
const BRASIL_CENTER: [number, number] = [-15.77972, -47.92972]
const DEFAULT_ZOOM = 4

interface MapSelectorProps {
  initialPosition?: { latitude: number; longitude: number }
  onPositionChange: (position: { latitude: number; longitude: number }) => void
  onAddressFound?: (address: string, municipio: string, estado: string) => void
}

export default function MapSelector({ initialPosition, onPositionChange, onAddressFound }: MapSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [searchAddress, setSearchAddress] = useState('')

  // Inicializar mapa
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    // Garantir limpeza de qualquer mapa existente antes de inicializar
    if (leafletMapRef.current) {
      leafletMapRef.current.remove()
      leafletMapRef.current = null
      markerRef.current = null
    }

    // Configurar ícones do Leaflet
    L.Icon.Default.imagePath = '/images/'

    // Inicializar mapa
    const map = L.map(mapRef.current).setView(
      initialPosition && initialPosition.latitude && initialPosition.longitude
        ? [initialPosition.latitude, initialPosition.longitude] as [number, number]
        : BRASIL_CENTER as [number, number],
      initialPosition && initialPosition.latitude && initialPosition.longitude ? 10 : DEFAULT_ZOOM
    )

    // Adicionar camada de tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    // Adicionar um marcador se houver posição inicial
    if (initialPosition && initialPosition.latitude && initialPosition.longitude) {
      markerRef.current = L.marker([initialPosition.latitude, initialPosition.longitude] as [number, number])
        .addTo(map)
        .bindPopup('Localização da propriedade')
        .openPopup()
    }

    // Adicionar evento de clique no mapa
    map.on('click', (e) => {
      const { lat, lng } = e.latlng

      // Se já existe um marcador, atualizar a posição
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng] as [number, number])
      } else {
        // Caso contrário, criar um novo marcador
        markerRef.current = L.marker([lat, lng] as [number, number])
          .addTo(map)
          .bindPopup('Localização da propriedade')
          .openPopup()
      }

      // Atualizar coordenadas no formulário
      onPositionChange({
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lng.toFixed(6))
      })
    })

    // Salvar referência do mapa
    leafletMapRef.current = map

    // Cleanup ao desmontar
    return () => {
      if (leafletMapRef.current) {
        // Remover todos os event listeners antes de remover o mapa
        leafletMapRef.current.off()
        leafletMapRef.current.remove()
        leafletMapRef.current = null
        markerRef.current = null
      }
    }
  }, [initialPosition, onPositionChange])

  // Função para buscar endereço usando a API Nominatim do OpenStreetMap
  const searchForLocation = async () => {
    if (!searchAddress.trim() || !leafletMapRef.current) return

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}, Brasil&limit=1`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const latitude = parseFloat(lat)
        const longitude = parseFloat(lon)

        // Extrair informações do endereço
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
            // Verificar se o primeiro item parece uma sigla de estado (2 letras maiúsculas)
            const candidatoEstado = possiveisEstados[0].toUpperCase()
            if (/^[A-Z]{2}$/.test(candidatoEstado)) {
              estado = candidatoEstado
            }
          }
        }
        
        // Formato do endereço sem o país no final
        const endereco = display_name.split(', Brasil')[0]

        // Atualizar mapa e marcador
        leafletMapRef.current.setView([latitude, longitude], 13)

        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude])
        } else {
          markerRef.current = L.marker([latitude, longitude])
            .addTo(leafletMapRef.current)
            .bindPopup('Localização da propriedade')
            .openPopup()
        }

        // Atualizar coordenadas no formulário
        onPositionChange({
          latitude: parseFloat(latitude.toFixed(6)),
          longitude: parseFloat(longitude.toFixed(6))
        })
        
        // Retornar informações do endereço encontrado
        if (onAddressFound) {
          onAddressFound(endereco, municipio, estado)
        }

        toast({
          title: 'Localização encontrada',
          description: `Endereço localizado com sucesso`,
        })
      } else {
        toast({
          title: 'Endereço não encontrado',
          description: 'Tente um endereço mais específico ou selecione manualmente no mapa',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Erro ao buscar localização:', error)
      toast({
        title: 'Erro na busca',
        description: 'Não foi possível buscar o endereço. Tente novamente mais tarde.',
        variant: 'destructive'
      })
    }
  }

  // Função para centralizar mapa no Brasil
  const centerOnBrasil = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView(BRASIL_CENTER as [number, number], DEFAULT_ZOOM)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder="Buscar endereço..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchForLocation()}
            className="pr-10"
          />
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="absolute right-0 top-0 h-full"
            onClick={searchForLocation}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={centerOnBrasil}
          title="Centralizar no Brasil"
        >
          <Crosshair className="h-4 w-4" />
        </Button>
      </div>
      <div 
        ref={mapRef} 
        className="h-[300px] w-full rounded-md border" 
      />
      <p className="text-xs text-muted-foreground">
        Clique no mapa para selecionar a localização da propriedade ou busque por um endereço
      </p>
    </div>
  )
}
