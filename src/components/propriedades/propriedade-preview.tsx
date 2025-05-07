'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, MapPin, Ruler, Building, Home, Save, LocateFixed } from 'lucide-react'

interface PropriedadePreviewProps {
  nome: string
  endereco: string
  municipio: string
  estado: string
  area: number
  coordenadas: {
    latitude: number
    longitude: number
  }
  enviando: boolean
  onSubmit: (e: React.FormEvent) => void
}

// Função para classificar o tamanho da propriedade
const classificarTamanho = (area: number) => {
  if (area < 20) {
    return { texto: 'Pequena', cor: 'bg-[hsl(12,76%,61%)] text-white' }; // --chart-1
  } else if (area >= 20 && area < 100) {
    return { texto: 'Média', cor: 'bg-[hsl(173,58%,39%)] text-white' }; // --chart-2
  } else {
    return { texto: 'Grande', cor: 'bg-[hsl(197,37%,24%)] text-white' }; // --chart-3
  }
};

export function PropriedadePreview({
  nome,
  endereco,
  municipio,
  estado,
  area,
  coordenadas,
  enviando,
  onSubmit
}: PropriedadePreviewProps) {
  const tamanhoPropriedade = classificarTamanho(area || 0);
  const dadosValidos = nome && endereco && municipio && estado && area > 0;
  
  return (
    <Card className="shadow-sm hover:shadow transition-shadow border-t-4 border-t-amber-500 h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <Eye className="h-5 w-5 mr-2 text-primary" />
          Visualização
        </CardTitle>
        <CardDescription>
          Preview da propriedade
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {dadosValidos ? (
          <div className="rounded-md border p-4 space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="font-medium">{nome}</h3>
              {area > 0 && (
                <Badge className={tamanhoPropriedade.cor}>
                  {tamanhoPropriedade.texto}
                </Badge>
              )}
            </div>
            
            {(municipio || estado) && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {[municipio, estado].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
            
            {endereco && (
              <div className="flex items-start">
                <Building className="h-4 w-4 mr-1.5 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground break-words">{endereco}</span>
              </div>
            )}
            
            {area > 0 && (
              <div className="flex items-center">
                <Ruler className="h-4 w-4 mr-1.5 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {area.toLocaleString('pt-BR')} hectares
                </span>
              </div>
            )}

            {(coordenadas.latitude !== 0 || coordenadas.longitude !== 0) && (
              <div className="flex items-center">
                <LocateFixed className="h-4 w-4 mr-1.5 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Coordenadas registradas
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-md">
            <Home className="h-10 w-10 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              Preencha os dados para visualizar a propriedade
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 pb-4">
        <Button 
          type="submit"
          className="w-full" 
          disabled={enviando || !dadosValidos}
          onClick={(e) => onSubmit(e)}
        >
          {enviando ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
              Processando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Criar Propriedade
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
