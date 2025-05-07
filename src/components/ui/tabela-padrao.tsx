'use client'

import React from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface ColunaTabelaProps {
  chave: string
  titulo: string
  largura?: string
  alinhamento?: 'left' | 'center' | 'right'
  renderizador?: (valor: any, item: any) => React.ReactNode
}

interface TabelaPadraoProps {
  dados: any[]
  colunas: ColunaTabelaProps[]
  className?: string
  mensagemVazia?: string
  carregando?: boolean
  idChave?: string
  acaoRenderizador?: (item: any) => React.ReactNode
}

export function TabelaPadrao({
  dados,
  colunas,
  className,
  mensagemVazia = "Nenhum registro encontrado.",
  carregando = false,
  idChave = 'id',
  acaoRenderizador
}: TabelaPadraoProps) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-md border", className)}>
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {colunas.map((coluna) => (
              <TableHead 
                key={coluna.chave}
                className={cn(
                  coluna.largura ? `w-[${coluna.largura}]` : '',
                  coluna.alinhamento === 'center' ? 'text-center' : 
                  coluna.alinhamento === 'right' ? 'text-right' : 'text-left'
                )}
              >
                {coluna.titulo}
              </TableHead>
            ))}
            {acaoRenderizador && (
              <TableHead className="w-[15%] text-right">Ações</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {carregando ? (
            <TableRow>
              <TableCell colSpan={colunas.length + (acaoRenderizador ? 1 : 0)} className="h-24 text-center">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2">Carregando...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : dados.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colunas.length + (acaoRenderizador ? 1 : 0)} className="h-24 text-center">
                {mensagemVazia}
              </TableCell>
            </TableRow>
          ) : (
            dados.map((item) => (
              <TableRow key={item[idChave]}>
                {colunas.map((coluna) => (
                  <TableCell 
                    key={`${item[idChave]}-${coluna.chave}`}
                    className={cn(
                      coluna.alinhamento === 'center' ? 'text-center' : 
                      coluna.alinhamento === 'right' ? 'text-right' : '',
                      coluna.chave === 'nome' || coluna.chave === 'titulo' ? 'font-medium' : ''
                    )}
                  >
                    {coluna.renderizador 
                      ? coluna.renderizador(item[coluna.chave], item)
                      : item[coluna.chave]}
                  </TableCell>
                ))}
                {acaoRenderizador && (
                  <TableCell className="text-right">
                    {acaoRenderizador(item)}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
