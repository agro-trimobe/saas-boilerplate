'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, ArrowRight } from 'lucide-react'
import { Projeto } from '@/lib/crm-utils'
import { formatarData, formatarMoeda } from '@/lib/formatters'

interface PropriedadeProjetosProps {
  projetos: Projeto[]
  propriedadeId: string
}

export function PropriedadeProjetos({ projetos, propriedadeId }: PropriedadeProjetosProps) {
  return (
    <Card className="overflow-hidden h-full shadow-sm hover:shadow transition-shadow border-t-4 border-t-amber-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <FileText className="h-5 w-5 mr-2 text-amber-500" />
          Projetos
        </CardTitle>
        <CardDescription>
          {projetos.length === 0 ? 'Nenhum projeto cadastrado ainda' : `${projetos.length} projeto(s) cadastrado(s)`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {projetos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <FileText className="h-16 w-16 text-muted-foreground opacity-30" />
            <p className="mt-4 text-muted-foreground">Esta propriedade ainda não possui projetos cadastrados.</p>
            <Button className="mt-5 gap-1.5" asChild>
              <Link href={`/projetos/novo?propriedadeId=${propriedadeId}`}>
                <FileText className="h-4 w-4" />
                Adicionar Projeto
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {projetos.map((projeto) => (
              <div key={projeto.id} className="block p-4 hover:bg-muted/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-medium">{projeto.titulo || 'Projeto sem título'}</h4>
                    <p className="text-xs text-muted-foreground">
                      {projeto.linhaCredito || 'Linha de crédito não especificada'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      projeto.status === 'Contratado' ? 'default' : 
                      projeto.status === 'Em Elaboração' ? 'secondary' : 
                      projeto.status === 'Cancelado' ? 'destructive' : 'outline'
                    }>
                      {projeto.status}
                    </Badge>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground">Valor: </span>
                    <span className="font-medium">{formatarMoeda(projeto.valorTotal)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Data: </span>
                    <span>{formatarData(projeto.dataCriacao)}</span>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <Button variant="secondary" size="sm" className="gap-1.5" asChild>
                    <Link href={`/projetos/${projeto.id}`}>
                      <ArrowRight className="h-3.5 w-3.5" />
                      Ver projeto
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
