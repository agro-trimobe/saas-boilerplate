'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapViewerProps {
  position: { latitude: number; longitude: number }
  readOnly?: boolean
  onPositionChange?: (position: { latitude: number; longitude: number }) => void
}

export default function MapViewer({ 
  position, 
  readOnly = false, 
  onPositionChange 
}: MapViewerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [mapInitialized, setMapInitialized] = useState(false)
  
  // Inicializar o mapa uma vez que o componente for montado
  useEffect(() => {
    // Certifique-se de que o mapa é inicializado apenas uma vez
    if (mapRef.current) return;
    
    // Corrigir ícones do Leaflet
    if (typeof window !== 'undefined') {
      // Correção segura para os ícones do Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      
      // Sobrescreve a função getIconUrl para usar caminhos personalizados
      L.Icon.Default.mergeOptions({
        iconUrl: '/images/marker-icon.png',
        iconRetinaUrl: '/images/marker-icon-2x.png',
        shadowUrl: '/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41]
      });
    }
    
    // Posição inicial para o mapa (Brasil central se não houver coordenadas)
    const initialLat = position.latitude || -15.7801;
    const initialLng = position.longitude || -47.9292;
    const initialZoom = position.latitude ? 15 : 4;
    
    // Criar mapa
    const map = L.map('map-viewer', {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      layers: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
      ]
    });
    
    // Adicionar marcador se houver posição
    if (position.latitude && position.longitude) {
      markerRef.current = L.marker([position.latitude, position.longitude], {
        draggable: !readOnly
      }).addTo(map);
      
      if (!readOnly && onPositionChange) {
        markerRef.current.on('dragend', function(e) {
          const marker = e.target;
          const position = marker.getLatLng();
          onPositionChange({
            latitude: position.lat,
            longitude: position.lng
          });
        });
      }
    }
    
    // Evento de clique no mapa (apenas se não for somente leitura)
    if (!readOnly && onPositionChange) {
      map.on('click', function(e) {
        const { lat, lng } = e.latlng;
        
        if (markerRef.current) {
          // Mover marcador existente
          markerRef.current.setLatLng([lat, lng]);
        } else {
          // Criar novo marcador
          markerRef.current = L.marker([lat, lng], {
            draggable: true
          }).addTo(map);
          
          // Adicionar evento de arrasto
          markerRef.current.on('dragend', function(e) {
            const marker = e.target;
            const position = marker.getLatLng();
            onPositionChange({
              latitude: position.lat,
              longitude: position.lng
            });
          });
        }
        
        // Notificar sobre mudança de posição
        onPositionChange({
          latitude: lat,
          longitude: lng
        });
      });
    }
    
    // Salvar referência ao mapa
    mapRef.current = map;
    setMapInitialized(true);
    
    // Limpar ao desmontar
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);
  
  // Atualizar posição do mapa e do marcador quando as props mudarem
  useEffect(() => {
    if (!mapInitialized || !mapRef.current) return;
    
    // Atualizar apenas se houver coordenadas válidas
    if (position.latitude && position.longitude) {
      const map = mapRef.current;
      
      // Centralizar mapa nas novas coordenadas
      map.setView([position.latitude, position.longitude], 15);
      
      // Atualizar ou criar marcador
      if (markerRef.current) {
        markerRef.current.setLatLng([position.latitude, position.longitude]);
      } else {
        markerRef.current = L.marker([position.latitude, position.longitude], {
          draggable: !readOnly
        }).addTo(map);
        
        if (!readOnly && onPositionChange) {
          markerRef.current.on('dragend', function(e) {
            const marker = e.target;
            const position = marker.getLatLng();
            onPositionChange({
              latitude: position.lat,
              longitude: position.lng
            });
          });
        }
      }
    }
  }, [position, mapInitialized, readOnly, onPositionChange]);
  
  return (
    <div id="map-viewer" className="h-full w-full" />
  );
}
