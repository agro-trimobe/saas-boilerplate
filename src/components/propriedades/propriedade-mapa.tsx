'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Map, MapPin, Info, Plus, Minus } from 'lucide-react'
import ClienteMapa from '@/components/propriedades/cliente-mapa'
import { Propriedade } from '@/lib/crm-utils'

interface PropriedadeMapaProps {
  propriedade: Propriedade
}

export function PropriedadeMapa({ propriedade }: PropriedadeMapaProps) {
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Map className="h-5 w-5 mr-2 text-indigo-500" />
            Mapa da Propriedade
          </CardTitle>
          {propriedade.coordenadas && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Info className="h-4 w-4" />
                    <span className="sr-only">Informações</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" align="center">
                  <div className="space-y-1 text-xs">
                    <p>Latitude: {propriedade.coordenadas.latitude}</p>
                    <p>Longitude: {propriedade.coordenadas.longitude}</p>
                    <p>Município: {propriedade.municipio}</p>
                    <p>Estado: {propriedade.estado}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {propriedade.coordenadas ? (
          <div className="relative group h-[320px] w-full">
            <ClienteMapa 
              id={propriedade.id}
              coordenadas={propriedade.coordenadas} 
              nome={propriedade.nome}
              municipio={propriedade.municipio}
              estado={propriedade.estado}
            />
            <div className="absolute bottom-3 right-3 z-10 bg-background/80 backdrop-blur-sm rounded-md p-1.5 shadow-sm border flex flex-col gap-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <MapPin className="h-4 w-4" />
                      <span className="sr-only">Centralizar</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p className="text-xs">Centralizar no mapa</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Aumentar zoom</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p className="text-xs">Aumentar zoom</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Minus className="h-4 w-4" />
                      <span className="sr-only">Diminuir zoom</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p className="text-xs">Diminuir zoom</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[320px] text-center p-6">
            <MapPin className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <p className="text-base text-muted-foreground mb-4">Coordenadas não disponíveis</p>
            <Button variant="outline" size="sm" className="gap-1.5">
              <MapPin className="h-4 w-4" />
              Adicionar Coordenadas
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
