'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Coordenadas } from '@/lib/crm-utils'

// Interface para o componente
interface ClienteMapaProps {
  coordenadas?: Coordenadas
  nome: string
  municipio?: string
  estado?: string
  id?: string // ID da propriedade para criar uma chave única
}

// Componente cliente que só carrega o mapa quando estiver no navegador
export default function ClienteMapa(props: ClienteMapaProps) {
  // Estado para controlar se estamos no cliente ou não
  const [isClient, setIsClient] = useState(false)
  
  // Só renderizar quando o componente montar no cliente
  useEffect(() => {
    setIsClient(true)
    
    // Função de limpeza quando o componente desmontar
    return () => {
      setIsClient(false)
    }
  }, [])
  
  // Importar o MapaPropriedade dinamicamente para evitar problemas com SSR
  const MapaPropriedade = dynamic(
    () => import('./mapa-propriedade'),
    { 
      ssr: false,
      loading: () => (
        <div className="h-[250px] rounded-lg bg-muted/20 border flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-muted-foreground">Carregando mapa...</p>
          </div>
        </div>
      )
    }
  )
  
  // Se não estivermos no cliente, mostrar um placeholder
  if (!isClient) {
    return (
      <div className="h-[250px] rounded-lg bg-muted/20 border flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando mapa...</p>
      </div>
    )
  }
  
  // Criar uma chave única para o componente usando o ID da propriedade
  const componenteKey = props.id || `propriedade-${props.nome}-${Date.now()}`
  
  // No cliente, renderizar o mapa com uma chave única
  return (
    <div key={componenteKey}>
      <MapaPropriedade {...props} />
    </div>
  )
}
