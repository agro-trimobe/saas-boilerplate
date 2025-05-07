'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Eye, 
  FileEdit, 
  MoreHorizontal, 
  Trash2,
  Building,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Users,
  LocateFixed,
  Table2,
  Clipboard
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatarCpfCnpj, formatarTelefone, formatarData } from '@/lib/formatters'
import { Cliente } from '@/lib/crm-utils'

interface ClienteTabelaProps {
  clientes: Cliente[]
  onExcluir: (cliente: Cliente) => void
  projetosPorCliente?: Record<string, number>
  propriedadesPorCliente?: Record<string, number>
}

export function ClienteTabela({ clientes, onExcluir, projetosPorCliente = {}, propriedadesPorCliente = {} }: ClienteTabelaProps) {
  // Função para obter a cor do badge com base no perfil
  const getCorBadge = (perfil: string) => {
    switch (perfil) {
      case 'pequeno':
        return 'bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'medio':
        return 'bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'grande':
        return 'bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      default:
        return 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  // Função para obter o ícone do tipo de cliente
  const getTipoIcon = (tipo: string) => {
    return tipo === 'PF' ? 
      <User className="h-3.5 w-3.5 text-blue-600" /> : 
      <Building className="h-3.5 w-3.5 text-purple-600" />
  }

  // Função para obter o nome formatado do perfil
  const getPerfilNome = (perfil: string) => {
    switch (perfil) {
      case 'pequeno':
        return 'Pequeno'
      case 'medio':
        return 'Médio'
      case 'grande':
        return 'Grande'
      default:
        return perfil
    }
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <ScrollArea className="h-[calc(100vh-350px)]">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[30%]">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span>Nome</span>
                </div>
              </TableHead>
              <TableHead className="w-[15%]">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>Telefone</span>
                </div>
              </TableHead>
              <TableHead className="w-[15%]">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Perfil</span>
                </div>
              </TableHead>
              <TableHead className="w-[12%]">
                <div className="flex items-center gap-2">
                  <LocateFixed className="h-4 w-4 text-primary" />
                  <span>Propriedades</span>
                </div>
              </TableHead>
              <TableHead className="w-[12%]">
                <div className="flex items-center gap-2">
                  <Clipboard className="h-4 w-4 text-primary" />
                  <span>Projetos</span>
                </div>
              </TableHead>
              <TableHead className="w-[16%] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              clientes.map((cliente) => (
                <TableRow 
                  key={cliente.id}
                  className="group hover:bg-muted/30"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0">
                        {getTipoIcon(cliente.tipo)}
                      </div>
                      <span className="text-primary truncate max-w-[250px]">
                        {cliente.nome}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{formatarTelefone(cliente.telefone)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCorBadge(cliente.perfil)}>
                      {getPerfilNome(cliente.perfil)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{propriedadesPorCliente[cliente.id] || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clipboard className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{projetosPorCliente[cliente.id] || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link 
                      href={`/clientes/${cliente.id}`} 
                      className="px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium transition-colors inline-flex items-center"
                    >
                      Ver Detalhes
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
