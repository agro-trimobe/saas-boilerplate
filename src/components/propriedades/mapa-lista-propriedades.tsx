'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Propriedade } from '@/lib/crm-utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Ruler, FileText, ArrowRight } from 'lucide-react';
import type { LatLngExpression } from 'leaflet';

// Interface para o componente
interface MapaListaPropriedadesProps {
  propriedades: Propriedade[];
  classificarTamanho: (area: number) => { texto: string; cor: string };
  projetosPorPropriedade: Record<string, number>;
}

// Interface para os dados do mapa
interface DadosMapaPropriedades {
  propriedades: Propriedade[];
  classificarTamanho: (area: number) => { texto: string; cor: string };
  projetosPorPropriedade: Record<string, number>;
  centroDoBrasil: LatLngExpression;
  propriedadeSelecionada: string | null;
  onSelecionarPropriedade: (id: string) => void;
}

// Import o mapa direto, sem usar react-leaflet
import 'leaflet/dist/leaflet.css';

export default function MapaListaPropriedades({ 
  propriedades, 
  classificarTamanho,
  projetosPorPropriedade
}: MapaListaPropriedadesProps) {
  const [propriedadeSelecionada, setPropriedadeSelecionada] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Coordenadas aproximadas do centro do Brasil
  const centroDoBrasil: LatLngExpression = [-15.77972, -47.92972];

  // Selecionar uma propriedade
  const handleSelecionarPropriedade = (id: string) => {
    setPropriedadeSelecionada(id === propriedadeSelecionada ? null : id);
  };
  
  // Inicialização e gerenciamento do mapa Leaflet
  useEffect(() => {
    // Verificar se estamos no lado do cliente
    if (typeof window === 'undefined' || !mapRef.current) return;
    
    // Criar ID único baseado no timestamp para contêiner do mapa
    const mapContainerId = `leaflet-map-${Date.now()}`;
    mapRef.current.id = mapContainerId;
    
    // Se já existe um mapa, destrua-o para evitar duplicação
    if (leafletMapRef.current) {
      try {
        // Limpar marcadores
        markersRef.current.forEach(marker => {
          if (marker) marker.remove();
        });
        markersRef.current = [];
        
        // Remover mapa
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      } catch (e) {
        console.error('Erro ao limpar mapa anterior:', e);
      }
    }
    
    // Importar Leaflet dinamicamente para garantir que só será usado no cliente
    import('leaflet').then((L) => {
      try {        
        // Verificar novamente se o elemento existe
        if (!mapRef.current) return;
        
        // Evitar inicialização múltipla do mapa no mesmo elemento
        // Usando checagem segura com in operator para verificar se o Leaflet já inicializou este container
        if (mapRef.current && '_leaflet_id' in mapRef.current) {
          console.log('Container já tem um mapa inicializado, ignorando.');
          return;
        }
        
        // Inicializar o mapa
        leafletMapRef.current = L.map(mapRef.current).setView(centroDoBrasil, 4);
        
        // Adicionar camada de tiles do OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(leafletMapRef.current);
        
        // Função para criar ícones coloridos para cada tipo de propriedade
        const criarIcone = (corHex: string) => {
          return L.divIcon({
            html: `<div style="
              width: 24px; 
              height: 24px; 
              border-radius: 50%; 
              background-color: ${corHex}; 
              border: 2px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            "></div>`,
            className: 'custom-div-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
          });
        };
        
        // Definir cores para cada tamanho de propriedade
        const icones = {
          pequena: criarIcone('hsl(12, 76%, 61%)'),  // --chart-1
          media: criarIcone('hsl(173, 58%, 39%)'),     // --chart-2
          grande: criarIcone('hsl(197, 37%, 24%)')     // --chart-3
        };
        
        // Adicionar marcadores para cada propriedade
        const marcadores: L.Marker[] = [];
        
        for (const propriedade of propriedades) {
          if (!propriedade.coordenadas) continue;
          
          const tamanho = classificarTamanho(propriedade.area);
          const latLng = [propriedade.coordenadas.latitude, propriedade.coordenadas.longitude] as L.LatLngExpression;
          
          // Determinar o tipo de ícone com base no tamanho
          const tipoIcone = tamanho.texto === 'Pequena' ? 'pequena' : 
                           tamanho.texto === 'Média' ? 'media' : 'grande';
          
          // Criar HTML do popup
          const popupContent = `
            <div class="map-popup-title">
                ${propriedade.nome}
              </div>
              <div class="map-popup-info">
                <div class="map-popup-info-item">
                  <span>${propriedade.municipio}, ${propriedade.estado}</span>
                </div>
                <div class="map-popup-info-item">
                  <span>${propriedade.area.toLocaleString('pt-BR')} hectares (${tamanho.texto})</span>
                </div>
                ${propriedade.endereco ? `
                <div class="map-popup-info-item">
                  <span>${propriedade.endereco}</span>
                </div>` : ''}
                <div class="map-popup-info-item">
                  <span>${projetosPorPropriedade[propriedade.id] || 0} projeto(s)</span>
                </div>
              </div>
              <div class="map-popup-actions">
                <a href="/propriedades/${propriedade.id}" class="map-popup-button" style="color: white;">
                  Ver Detalhes
                </a>
              </div>
          `;
          
          // Criar marcador com o ícone colorido
          const marker = L.marker(latLng, {
            icon: icones[tipoIcone as keyof typeof icones]
          }).addTo(leafletMapRef.current!);
          
          // Configurar popup
          marker.bindPopup(popupContent);
          
          // Adicionar evento de clique
          marker.on('click', () => {
            handleSelecionarPropriedade(propriedade.id);
          });
          
          // Adicionar à lista de marcadores
          marcadores.push(marker);
          
          // Se a propriedade for a selecionada, abrir o popup
          if (propriedade.id === propriedadeSelecionada) {
            setTimeout(() => marker.openPopup(), 100);
          }
        }
        
        // Guardar referências para limpar depois
        markersRef.current = marcadores;
      } catch (e) {
        console.error('Erro ao inicializar o mapa:', e);
      }
    });
    
    // Limpeza quando o componente for desmontado
    return () => {
      if (leafletMapRef.current) {
        try {
          markersRef.current.forEach(marker => {
            if (marker) marker.remove();
          });
          markersRef.current = [];
          
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        } catch (e) {
          console.error('Erro ao limpar mapa:', e);
        }
      }
    };
  }, [propriedades, classificarTamanho, projetosPorPropriedade, propriedadeSelecionada]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] relative">
      {/* Painel lateral com lista de propriedades */}
      <Card className="overflow-hidden h-full shadow-sm">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Propriedades no Mapa
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[520px]">
            <div className="space-y-2 p-3">
              {propriedades.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">Nenhuma propriedade com coordenadas encontrada</p>
                </div>
              ) : (
                propriedades.map((propriedade) => {
                  const tamanho = classificarTamanho(propriedade.area);
                  return (
                    <div 
                      key={propriedade.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${propriedade.id === propriedadeSelecionada 
                        ? 'bg-accent border-primary shadow-sm' 
                        : 'hover:bg-muted/50 hover:border-primary/50'}`}
                      onClick={() => handleSelecionarPropriedade(propriedade.id)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-medium text-sm">{propriedade.nome}</h3>
                        <Badge className={`${tamanho.cor} text-xs`}>{tamanho.texto}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{propriedade.municipio}, {propriedade.estado}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs flex items-center text-muted-foreground">
                          <Ruler className="h-3 w-3 mr-1" /> 
                          {propriedade.area.toLocaleString('pt-BR')} ha
                        </span>
                        {projetosPorPropriedade[propriedade.id] > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            {projetosPorPropriedade[propriedade.id]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Mapa ocupando 2/3 da largura */}
      <Card className="md:col-span-2 overflow-hidden h-full shadow-sm">
        <CardContent className="p-0 h-full relative">
          <div ref={mapRef} className="h-full w-full" style={{ minHeight: '580px' }}></div>
          
          {/* Legenda do mapa */}
          {propriedades.length > 0 && (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
