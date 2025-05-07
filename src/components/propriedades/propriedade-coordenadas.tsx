'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Info, MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'

interface PropriedadeCoordendasProps {
  latitude: number
  longitude: number
  onLatitudeChange: (latitude: number) => void
  onLongitudeChange: (longitude: number) => void
}

export function PropriedadeCoordenadas({
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange
}: PropriedadeCoordendasProps) {
  const [latitudeStr, setLatitudeStr] = useState(latitude === 0 ? '' : latitude.toString())
  const [longitudeStr, setLongitudeStr] = useState(longitude === 0 ? '' : longitude.toString())

  // Atualizar os valores quando as props mudarem
  useEffect(() => {
    setLatitudeStr(latitude === 0 ? '' : latitude.toString())
    setLongitudeStr(longitude === 0 ? '' : longitude.toString())
  }, [latitude, longitude])

  // Manipular mudanças na latitude
  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLatitudeStr(value)
    
    if (value === '' || value === '-') {
      onLatitudeChange(0)
    } else {
      const numValue = parseFloat(value)
      if (!isNaN(numValue)) {
        onLatitudeChange(numValue)
      }
    }
  }

  // Manipular mudanças na longitude
  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLongitudeStr(value)
    
    if (value === '' || value === '-') {
      onLongitudeChange(0)
    } else {
      const numValue = parseFloat(value)
      if (!isNaN(numValue)) {
        onLongitudeChange(numValue)
      }
    }
  }

  return (
    <Card className="mt-4 border-muted bg-muted/30">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium">Coordenadas Geográficas</h4>
          </div>
          <Badge 
            variant={latitude !== 0 && longitude !== 0 ? "default" : "outline"}
            className="text-xs"
          >
            {latitude !== 0 && longitude !== 0 ? "Definidas" : "Não definidas"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="latitude" className="text-xs">
                Latitude
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="w-[180px] text-xs">
                      Coordenada vertical (norte/sul). 
                      No Brasil, geralmente é negativa.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="latitude"
              type="text"
              inputMode="decimal"
              pattern="-?\d*\.?\d*"
              value={latitudeStr}
              onChange={handleLatitudeChange}
              placeholder="Ex: -23.5505"
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="longitude" className="text-xs">
                Longitude
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="w-[180px] text-xs">
                      Coordenada horizontal (leste/oeste). 
                      No Brasil, geralmente é negativa.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="longitude"
              type="text"
              inputMode="decimal"
              pattern="-?\d*\.?\d*"
              value={longitudeStr}
              onChange={handleLongitudeChange}
              placeholder="Ex: -46.6333"
              className="text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
