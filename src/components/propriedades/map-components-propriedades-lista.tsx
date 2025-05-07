'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { 
  MapPin, 
  Ruler, 
  FileText,
  Eye,
  Info
} from 'lucide-react'
import { Propriedade } from '@/lib/crm-utils'
import Link from 'next/link'
import type { LatLngExpression } from 'leaflet'
import { Badge } from '@/components/ui/badge'

// Importar estilos do Leaflet
import 'leaflet/dist/leaflet.css'

// Corrigir problema com os ícones do Leaflet
const markerIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Componente para centralizar o mapa
function CentralizarMapa({ coordenadas }: { coordenadas: LatLngExpression }) {
  const map = useMap()
  useEffect(() => {
    map.setView(coordenadas, 4)
  }, [coordenadas, map])
  return null
}

// Interface para os dados do mapa
interface DadosMapaPropriedades {
  propriedades: Propriedade[]
  classificarTamanho: (area: number) => { texto: string; cor: string }
  projetosPorPropriedade: Record<string, number>
  centroDoBrasil: LatLngExpression
  propriedadeSelecionada: string | null
  onSelecionarPropriedade: (id: string) => void
}

interface MapComponentsPropriedadesProps {
  dados: DadosMapaPropriedades;
  containerId?: string;
}

export default function MapComponentsPropriedades({ dados, containerId }: MapComponentsPropriedadesProps) {
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Corrigir problema com o Leaflet no SSR e lidar com o ciclo de vida do mapa
  useEffect(() => {
    // Verificar se estamos no browser
    if (typeof window === 'undefined') return;
    
    // Evitar re-inicialização do mapa
    if (mapInitialized) return;
    
    // Corrigir o problema com os ícones padrão do Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl
    
    L.Icon.Default.mergeOptions({
      iconUrl: '/images/marker-icon.png',
      iconRetinaUrl: '/images/marker-icon-2x.png',
      shadowUrl: '/images/marker-shadow.png',
    })
    
    setMapInitialized(true);
    
    // Limpeza ao desmontar o componente
    return () => {
      if (mapInstanceRef.current) {
        console.log('Removendo instância do mapa');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapInitialized(false);
      }
    };
  }, [mapInitialized])

  const { propriedades, classificarTamanho, projetosPorPropriedade, centroDoBrasil, propriedadeSelecionada, onSelecionarPropriedade } = dados

  // Função para obter coordenadas de uma propriedade
  const obterCoordenadas = (propriedade: Propriedade): LatLngExpression | null => {
    if (!propriedade.coordenadas) return null
    return [propriedade.coordenadas.latitude, propriedade.coordenadas.longitude]
  }

  // Função para obter a classe CSS do marcador com base no tamanho da propriedade
  const obterClasseMarcador = (propriedade: Propriedade): string => {
    const tamanho = classificarTamanho(propriedade.area)
    if (tamanho.texto === 'Pequena') return 'pequena'
    if (tamanho.texto === 'Média') return 'media'
    return 'grande'
  }

  // Componente para capturar a referência do mapa quando ele estiver pronto
  const MapReference = () => {
    const map = useMap();
    
    useEffect(() => {
      if (map) {
        mapInstanceRef.current = map;
      }
      
      return () => {
        mapInstanceRef.current = null;
      };
    }, [map]);
    
    return null;
  };
  
  // ID único para o contêiner do mapa
  const mapId = containerId || `map-${Math.random().toString(36).substring(2, 11)}`;

  return (
    <>
      {/* Usar chave para garantir remontagem completa */}
      <div id={mapId} className="h-full w-full">
        <MapContainer 
          center={centroDoBrasil} 
          zoom={4} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', minHeight: '580px' }}
          className="leaflet-container z-0"
          key={mapId}
          id={mapId}
        >
        <MapReference />
        <CentralizarMapa coordenadas={centroDoBrasil} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {propriedades.map(propriedade => {
          const coordenadas = obterCoordenadas(propriedade)
          if (!coordenadas) return null
          
          const tamanho = classificarTamanho(propriedade.area)
          const classeMarcador = obterClasseMarcador(propriedade)
          
          return (
            <Marker 
              key={propriedade.id} 
              position={coordenadas}
              icon={markerIcon}
            >
              <Popup>
                <div className="map-popup-title">
                  {propriedade.nome}
                </div>
                
                <div className="map-popup-info">
                  <div className="map-popup-info-item">
                    <MapPin className="h-4 w-4" />
                    <span>{propriedade.municipio}, {propriedade.estado}</span>
                  </div>
                  
                  <div className="map-popup-info-item">
                    <Ruler className="h-4 w-4" />
                    <span>{propriedade.area.toLocaleString('pt-BR')} hectares</span>
                    <Badge className={tamanho.cor}>
                      {tamanho.texto}
                    </Badge>
                  </div>
                  
                  {propriedade.endereco && (
                    <div className="map-popup-info-item">
                      <Info className="h-4 w-4" />
                      <span>{propriedade.endereco}</span>
                    </div>
                  )}
                  
                  <div className="map-popup-info-item">
                    <FileText className="h-4 w-4" />
                    <span>{projetosPorPropriedade[propriedade.id] || 0} projeto(s)</span>
                  </div>
                </div>
                
                <div className="map-popup-actions">
                  <Link href={`/propriedades/${propriedade.id}`} className="map-popup-button" style={{ color: 'white' }}>
                    <Eye className="h-3 w-3" /> Ver Detalhes
                  </Link>
                </div>
              </Popup>
            </Marker>
          )
        })}
        </MapContainer>
      </div>
      
      {/* Legenda do mapa */}
      <div className="map-legend">
        <div className="map-legend-title">Legenda</div>
        <div className="map-legend-items">
          <div className="map-legend-item">
            <div className="map-legend-color pequena"></div>
            <span>Pequena (até 20 ha)</span>
          </div>
          <div className="map-legend-item">
            <div className="map-legend-color media"></div>
            <span>Média (20 a 100 ha)</span>
          </div>
          <div className="map-legend-item">
            <div className="map-legend-color grande"></div>
            <span>Grande (mais de 100 ha)</span>
          </div>
        </div>
      </div>
    </>
  )
}
