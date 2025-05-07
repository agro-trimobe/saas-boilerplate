'use client'

import { Card, CardContent } from '@/components/ui/card'
import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'

// Importação dinâmica do mapa para evitar problemas de SSR
interface MapSelectorProps {
  initialPosition?: { latitude: number; longitude: number }
  onPositionChange: (position: { latitude: number; longitude: number }) => void
  onAddressFound?: (address: string, municipio: string, estado: string) => void
}

const MapSelector = dynamic<MapSelectorProps>(() => import('./map-selector'), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] w-full flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Carregando mapa...</p>
      </div>
    </div>
  )
})

interface PropriedadeMapaMelhoradoProps {
  coordenadas: {
    latitude: number
    longitude: number
  }
  onCoordenadasChange: (coordenadas: { latitude: number; longitude: number }) => void
  onAddressFound?: (address: string, municipio: string, estado: string) => void
}

export function PropriedadeMapaMelhorado({
  coordenadas,
  onCoordenadasChange,
  onAddressFound
}: PropriedadeMapaMelhoradoProps) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-2 sm:p-3">
        <div className="flex items-center gap-2 mb-3 px-1">
          <MapPin className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-medium">Selecione a localização no mapa</h4>
        </div>
        <div className="h-[360px] rounded-md overflow-hidden border border-muted">
          <MapSelector
            initialPosition={coordenadas.latitude !== 0 && coordenadas.longitude !== 0 
              ? coordenadas 
              : undefined}
            onPositionChange={onCoordenadasChange}
            onAddressFound={onAddressFound}
          />
        </div>
      </CardContent>
    </Card>
  )
}
