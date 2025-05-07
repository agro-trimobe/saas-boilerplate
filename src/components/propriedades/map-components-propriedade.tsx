'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Info } from 'lucide-react'
import type { LatLngExpression, Map as LeafletMap } from 'leaflet'

// Importar estilos do Leaflet apenas no lado do cliente
import 'leaflet/dist/leaflet.css'

// Interface para os dados do mapa
interface DadosMapaPropriedade {
  coordenadas: LatLngExpression
  nome: string
  municipio?: string
  estado?: string
  id?: string // Identificador único da propriedade
}

// Configuração do ícone do marcador (será definido dentro do useEffect)
let markerIcon: any = null

// Utilizar uma abordagem imperativa com Leaflet puro em vez de React-Leaflet
export default function MapComponentsPropriedade({ dados }: { dados: DadosMapaPropriedade }) {
  // Referência para o contêiner do mapa
  const mapContainerRef = useRef<HTMLDivElement>(null)
  
  // Referência para a instância do mapa (externa ao React)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  
  // Extrair dados do mapa
  const { coordenadas, nome, municipio, estado, id } = dados
  
  // Estado para verificar se estamos no lado cliente
  const [ready, setReady] = useState(false)

  // Certificar-se de que o mapa será inicializado apenas uma vez e limpo adequadamente
  useEffect(() => {
    // Verificar se estamos no navegador
    if (typeof window === 'undefined') {
      return; // Não executar no servidor
    }

    // Carregar o Leaflet dinamicamente apenas no lado do cliente
    import('leaflet').then((L) => {
      setReady(true);
      
      // Se já existir uma instância do mapa, destruí-la primeiro
      if (mapInstanceRef.current) {
        console.log('Removendo instância existente do mapa')
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      
      // Certificar-se de que o elemento DOM existe
      if (!mapContainerRef.current) {
        console.error('Elemento DOM para o mapa não encontrado')
        return
      }

      // Configurar o ícone do marcador
      markerIcon = L.icon({
        iconUrl: '/images/marker-icon.png',
        iconRetinaUrl: '/images/marker-icon-2x.png',
        shadowUrl: '/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
      
      // Configurar ícones do Leaflet
      try {
        delete (L.Icon.Default.prototype as any)._getIconUrl
        
        L.Icon.Default.mergeOptions({
          iconUrl: '/images/marker-icon.png',
          iconRetinaUrl: '/images/marker-icon-2x.png',
          shadowUrl: '/images/marker-shadow.png',
        })
      } catch (err) {
        console.error('Erro ao configurar ícones do Leaflet:', err)
        return;
      }

      try {
        // Limpar qualquer conteúdo existente do elemento
        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML = ''
          
          // Criar uma nova instância do mapa Leaflet
          const map = L.map(mapContainerRef.current).setView(
            coordenadas as [number, number], 
            15
          )
          
          // Guardar a referência do mapa para limpar depois
          mapInstanceRef.current = map
          
          // Adicionar tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map)
          
          // Adicionar marcador com popup
          const marker = L.marker(coordenadas as [number, number], { icon: markerIcon }).addTo(map)
          
          // Criar conteúdo HTML para o popup
          let popupContent = `
            <div class="map-popup-title">
              ${nome}
            </div>
            
            <div class="map-popup-info">
          `
          
          if (municipio || estado) {
            popupContent += `
              <div class="map-popup-info-item">
                <span>
                  ${municipio}${municipio && estado ? ', ' : ''}${estado}
                </span>
              </div>
            `
          }
          
          // Adicionar coordenadas
          const lat = Array.isArray(coordenadas) ? coordenadas[0].toFixed(6) : ''
          const lng = Array.isArray(coordenadas) ? coordenadas[1].toFixed(6) : ''
          
          popupContent += `
              <div class="map-popup-info-item">
                <span>
                  Lat: ${lat}, Lng: ${lng}
                </span>
              </div>
            </div>
          `
          
          // Adicionar popup ao marcador
          marker.bindPopup(popupContent)
          
          console.log('Mapa inicializado com sucesso')
        }
      } catch (error) {
        console.error('Erro ao inicializar mapa:', error)
      }
    }).catch(err => {
      console.error('Erro ao carregar o Leaflet:', err)
    })
    
    // Limpar mapa quando o componente for desmontado
    return () => {
      if (mapInstanceRef.current) {
        console.log('Limpando mapa na desmontagem do componente')
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [coordenadas, nome, municipio, estado, id]) // Re-criar o mapa quando os dados mudarem
  
  return (
    <div 
      ref={mapContainerRef} 
      id={`mapa-manual-${id || Date.now()}`} 
      className="h-full w-full"
      style={{ position: 'relative' }}
    />
  )
}
