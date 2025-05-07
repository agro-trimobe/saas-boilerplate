'use client'

import { Card, CardContent } from '@/components/ui/card'
import { MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import dynamic from 'next/dynamic'

// Importação dinâmica do mapa para evitar problemas de SSR
interface MapViewerProps {
  position: { latitude: number; longitude: number }
  readOnly?: boolean
  onPositionChange?: (position: { latitude: number; longitude: number }) => void
}

const MapViewer = dynamic<MapViewerProps>(() => import('./map-viewer'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Carregando mapa...</p>
      </div>
    </div>
  )
})

interface PropriedadeMapaVisualizacaoProps {
  coordenadas: {
    latitude: number
    longitude: number
  }
  onCoordenadasChange: (coordenadas: { latitude: number; longitude: number }) => void
}

export function PropriedadeMapaVisualizacao({
  coordenadas,
  onCoordenadasChange
}: PropriedadeMapaVisualizacaoProps) {
  const coordenadasEncontradas = coordenadas.latitude !== 0 && coordenadas.longitude !== 0

  return (
    <Card className="shadow-sm hover:shadow border-t-4 border-t-blue-500 h-full">
      <CardContent className="p-0 relative h-[calc(100%-1rem)]">
        {/* Mapa ocupando toda a área do card */}
        <div className="h-[500px] md:h-full w-full relative">
          <MapViewer 
            position={coordenadas} 
            onPositionChange={onCoordenadasChange}
          />
          
          {/* Badge informativa no canto superior direito do mapa */}
          <div className="absolute top-2 right-2 z-10">
            <Badge variant={coordenadasEncontradas ? "default" : "outline"} className={`text-xs ${coordenadasEncontradas ? 'bg-green-500 hover:bg-green-500' : ''}`}>
              {coordenadasEncontradas ? (
                <span className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  Localização definida
                </span>
              ) : "Aguardando localização"}
            </Badge>
          </div>
          
          {/* Coordenadas no canto inferior direito do mapa */}
          {coordenadasEncontradas && (
            <div className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur-sm p-1.5 rounded-md text-xs shadow-sm">
              <div><strong>Lat:</strong> {coordenadas.latitude.toFixed(6)}</div>
              <div><strong>Lon:</strong> {coordenadas.longitude.toFixed(6)}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
