'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { 
  MapPin, 
  Building, 
  Ruler, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Edit,
  Map
} from 'lucide-react'
import { Propriedade, Cliente } from '@/lib/crm-utils'
import { formatarData } from '@/lib/formatters'

interface PropriedadeInfoCardsProps {
  propriedade: Propriedade
  cliente: Cliente | null
}

export function PropriedadeInfoCards({ propriedade, cliente }: PropriedadeInfoCardsProps) {
  const classificarTamanhoPropriedade = (area: number) => {
    if (area < 20) return { classe: 'Pequena', cor: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80' };
    if (area < 100) return { classe: 'Média', cor: 'bg-amber-100 text-amber-800 hover:bg-amber-100/80' };
    return { classe: 'Grande', cor: 'bg-green-100 text-green-800 hover:bg-green-100/80' };
  };

  return (
    <>
      {/* Card de Informações Básicas */}
      <Card className="overflow-hidden border-t-4 border-t-primary shadow-sm hover:shadow transition-shadow">
        <CardHeader className="pb-3 bg-muted/20">
          <CardTitle className="text-lg flex items-center">
            <Building className="h-5 w-5 mr-2 text-primary" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <span className="text-xs text-muted-foreground">Endereço</span>
                <p className="text-sm font-medium">{propriedade.endereco || 'Não informado'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <Map className="h-5 w-5 text-primary" />
              <div>
                <span className="text-xs text-muted-foreground">Localização</span>
                <p className="text-sm font-medium">{propriedade.municipio}, {propriedade.estado}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <Ruler className="h-5 w-5 text-primary" />
              <div>
                <span className="text-xs text-muted-foreground">Área</span>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{propriedade.area} hectares</p>
                  <Badge variant="outline" className={classificarTamanhoPropriedade(propriedade.area).cor}>
                    {classificarTamanhoPropriedade(propriedade.area).classe}
                  </Badge>
                </div>
              </div>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <span className="text-xs text-muted-foreground">Data de cadastro</span>
                <p className="text-sm font-medium">{propriedade.dataCriacao ? formatarData(propriedade.dataCriacao) : 'N/A'}</p>
              </div>
            </div>
          </div>
          
          {/* Botão de editar removido por ser redundante com o botão no cabeçalho */}
        </CardContent>
      </Card>
      
      {/* Card de Proprietário */}
      <Card className="overflow-hidden border-t-4 border-t-blue-500 shadow-sm hover:shadow transition-shadow">
        <CardHeader className="pb-3 bg-muted/20">
          <CardTitle className="text-lg flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-500" />
            Proprietário
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          {cliente ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                <User className="h-5 w-5 text-blue-500" />
                <div>
                  <span className="text-xs text-muted-foreground">Nome</span>
                  <p>
                    <Link href={`/clientes/${cliente.id}`} className="text-sm font-medium hover:underline text-blue-600">
                      {cliente.nome}
                    </Link>
                  </p>
                </div>
              </div>
              
              {cliente.telefone && (
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <Phone className="h-5 w-5 text-blue-500" />
                  <div>
                    <span className="text-xs text-muted-foreground">Telefone</span>
                    <p className="text-sm font-medium">{cliente.telefone}</p>
                  </div>
                </div>
              )}
              
              {cliente.email && (
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <span className="text-xs text-muted-foreground">Email</span>
                    <p className="text-sm font-medium">{cliente.email}</p>
                  </div>
                </div>
              )}
              
              <div className="pt-3 mt-1">
                <Button variant="secondary" size="sm" className="w-full gap-2" asChild>
                  <Link href={`/clientes/${cliente.id}`}>
                    <User className="h-4 w-4" />
                    Ver cliente
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[180px] text-center">
              <User className="h-12 w-12 text-muted-foreground mb-2 opacity-30" />
              <p className="text-sm text-muted-foreground mb-3">Proprietário não encontrado</p>
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                Vincular Proprietário
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
