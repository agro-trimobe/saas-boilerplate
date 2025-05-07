'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Calendar, MessageSquare, Eye } from 'lucide-react'
import { Cliente, Interacao } from '@/lib/crm-utils'
import { formatarData } from '@/lib/formatters'
import { clientesApi, interacoesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

function InteracoesClienteConteudo({ clienteId }: { clienteId: string }) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [interacoes, setInteracoes] = useState<Interacao[]>([])
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar cliente
        const cliente = await clientesApi.buscarClientePorId(clienteId)
        if (!cliente) {
          toast({
            title: 'Erro',
            description: 'Cliente não encontrado',
            variant: 'destructive',
          })
          router.push('/clientes')
          return
        }
        
        setCliente(cliente)
        
        // Carregar interações do cliente
        const interacoesCliente = await interacoesApi.listarInteracoesPorCliente(clienteId)
        setInteracoes(interacoesCliente)
        
        setCarregando(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do cliente',
          variant: 'destructive',
        })
      }
    }

    carregarDados()
  }, [clienteId, router])
  
  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-xl font-medium">Cliente não encontrado</h2>
        <Button asChild>
          <Link href="/clientes">Voltar para clientes</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/clientes/${clienteId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Interações - {cliente.nome}</h1>
        </div>
        <Button asChild>
          <Link href={`/clientes/${clienteId}/interacoes/nova`}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Interação
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Interações</CardTitle>
          <CardDescription>
            Registro de todas as interações com o cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {interacoes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interacoes.map((interacao) => (
                  <TableRow key={interacao.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {formatarData(interacao.data)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {interacao.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{interacao.assunto}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {interacao.descricao}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          interacao.status === 'Concluída' ? 'default' : 
                          interacao.status === 'Em andamento' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {interacao.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/interacoes/${interacao.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhuma interação registrada</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Registre a primeira interação com este cliente
              </p>
              <Button asChild>
                <Link href={`/clientes/${clienteId}/interacoes/nova`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Interação
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default InteracoesClienteConteudo
