'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { 
  Home, 
  ChevronRight, 
  MapPin, 
  Building, 
  Ruler, 
  Edit, 
  MoreHorizontal,
  FileText,
  Trash2,
  User,
  Printer
} from 'lucide-react'
import { Propriedade } from '@/lib/crm-utils'

interface PropriedadeHeaderProps {
  propriedade: Propriedade
  onExcluir: () => void
  classificarTamanhoPropriedade?: (area: number) => { classe: string; cor: string }
}

export function PropriedadeHeader({ propriedade, onExcluir, classificarTamanhoPropriedade }: PropriedadeHeaderProps) {
  // Definição interna para caso não receba a função como parâmetro
  const getClassificacao = (area: number) => {
    if (!classificarTamanhoPropriedade) {
      // Fallback padrão
      if (area < 20) return { classe: 'Pequena', cor: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80' };
      if (area < 100) return { classe: 'Média', cor: 'bg-amber-100 text-amber-800 hover:bg-amber-100/80' };
      return { classe: 'Grande', cor: 'bg-green-100 text-green-800 hover:bg-green-100/80' };
    }
    return classificarTamanhoPropriedade(area);
  };

  return (
    <>
      {/* Cabeçalho com breadcrumbs melhorado */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
          <Home className="h-3.5 w-3.5" />
          <Link href="/dashboard" className="hover:underline">Início</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/propriedades" className="hover:underline">Propriedades</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-primary font-medium truncate">{propriedade.nome}</span>
        </div>
      </div>
  
      {/* Banner principal aprimorado com gradiente */}
      <div className="rounded-lg border bg-gradient-to-r from-primary/10 via-card to-background p-6 shadow-md mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold">{propriedade.nome}</h1>
            </div>
            <p className="text-muted-foreground flex items-center gap-1">
              <Building className="h-4 w-4" />
              {propriedade.municipio}, {propriedade.estado}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {propriedade.area && (
              <Badge variant="outline" className={getClassificacao(propriedade.area).cor}>
                {getClassificacao(propriedade.area).classe}
              </Badge>
            )}
            <Badge variant="secondary" className="flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" />
              {propriedade.area} hectares
            </Badge>
            <div className="flex items-center gap-2">
              {/* Botão de Editar */}
              <Button asChild variant="outline" size="sm" className="gap-1">
                <Link href={`/propriedades/${propriedade.id}/editar`}>
                  <Edit className="h-4 w-4" />
                  Editar
                </Link>
              </Button>
              
              {/* Botão de Excluir */}
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive focus:ring-destructive" 
                onClick={onExcluir}
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
