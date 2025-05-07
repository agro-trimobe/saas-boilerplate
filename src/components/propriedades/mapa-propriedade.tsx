'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Map } from 'lucide-react'
import type { LatLngExpression } from 'leaflet'

// Interface para as coordenadas
interface Coordenadas {
  latitude: number
  longitude: number
}

// Interface para o componente de mapa da propriedade
interface MapaPropriedadeProps {
  coordenadas?: Coordenadas
  nome: string
  municipio?: string
  estado?: string
  id?: string // ID da propriedade para criar uma chave única
}

// Interface para os dados do mapa
interface DadosMapaPropriedade {
  coordenadas: LatLngExpression
  nome: string
  municipio?: string
  estado?: string
  id?: string // ID da propriedade para criar uma chave única
}

// Interface para o componente de mapa
interface MapComponentsPropriedadeProps {
  dados: DadosMapaPropriedade
}

// Importação dinâmica dos componentes do Leaflet para evitar erros de SSR
const MapComponentsPropriedade = dynamic<MapComponentsPropriedadeProps>(
  () => import('./map-components-propriedade'),
  { 
    loading: () => (
      <div className="flex items-center justify-center h-[350px] bg-slate-50">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-3"></div>
          <p className="text-sm text-muted-foreground">Carregando mapa...</p>
        </div>
      </div>
    ),
    ssr: false 
  }
)

export default function MapaPropriedade({ coordenadas, nome, municipio, estado, id }: MapaPropriedadeProps) {
  // Não precisamos mais gerenciar chaves aqui, pois o componente MapComponentsPropriedade
  // agora gerencia seu próprio ciclo de vida com base no ID da propriedade
  
  // Usamos um estado para forçar uma remontagem completa do componente quando as props mudarem
  const [recarregar, setRecarregar] = useState(0)
  
  // Hook para forçar remontagem quando propriedades importantes mudarem
  useEffect(() => {
    // Forçar remontagem incrementando o contador
    setRecarregar(prev => prev + 1)
    
    // Limpar quaisquer recursos quando o componente for desmontado
    return () => {
      console.log('Componente de mapa desmontado')
    }
  }, [id, nome, coordenadas?.latitude, coordenadas?.longitude])

  if (!coordenadas) {
    return (
      <div className="w-full h-full">
        <CardContent className="p-0 h-[300px] rounded-lg overflow-hidden">
          <div className="bg-slate-50 h-full w-full flex items-center justify-center">
            <div className="text-center p-6 max-w-xs">
              <Map className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <p className="text-sm font-medium text-muted-foreground mb-2">Coordenadas não disponíveis</p>
              <p className="text-xs text-muted-foreground">Adicione coordenadas para visualizar o mapa</p>
            </div>
          </div>
        </CardContent>
      </div>
    )
  }

  // Converter coordenadas para o formato do Leaflet
  const coordenadasLeaflet: LatLngExpression = [coordenadas.latitude, coordenadas.longitude]

  // Preparar dados para o componente de mapa
  const dadosMapa: DadosMapaPropriedade = {
    coordenadas: coordenadasLeaflet,
    nome,
    municipio,
    estado,
    id // Passar o ID da propriedade para criar uma chave única
  }

  return (
    <div className="w-full h-full">
      <CardContent className="p-0 h-[350px] rounded-lg overflow-hidden">
        {/* 
          Fornecer uma key baseada na propriedade id e no contador de recarga
          para garantir que o componente seja completamente remontado quando necessário 
        */}
        <div key={`mapa-container-${id || nome}-${recarregar}`} className="h-full w-full relative">
          <MapComponentsPropriedade dados={dadosMapa} />
          {municipio && estado && (
            <div className="absolute bottom-3 left-3 bg-white bg-opacity-80 py-1 px-3 rounded-md shadow-sm text-xs font-medium z-[400]">
              {municipio}, {estado}
            </div>
          )}
        </div>
      </CardContent>
    </div>
  )
}
