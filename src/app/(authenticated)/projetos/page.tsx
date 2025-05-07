'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ChevronDown, 
  Plus, 
  Search, 
  MoreHorizontal, 
  FileEdit, 
  Trash2, 
  Eye,
  FileText,
  Filter,
  LayoutGrid,
  List,
  DollarSign,
  ClipboardCheck,
  Calendar,
  Copy,
  Edit
} from 'lucide-react'
import { Projeto } from '@/lib/crm-utils'
import { formatarMoeda, formatarData, coresStatus } from '@/lib/formatters'
import { projetosApi, clientesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { CabecalhoPagina } from '@/components/ui/cabecalho-pagina'
import { CardEstatistica } from '@/components/ui/card-padrao'
import { FiltrosPadrao, FiltroSelect } from '@/components/ui/filtros-padrao'
import { TabelaPadrao } from '@/components/ui/tabela-padrao'

// Função auxiliar para calcular o progresso com base no status
function getProgressoStatus(status: string): number {
  switch(status) {
    case 'Em Elaboração': return 25;
    case 'Em Análise': return 50;
    case 'Aprovado': return 75;
    case 'Contratado': return 100;
    case 'Cancelado': return 0;
    default: return 0;
  }
}

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [clientesMap, setClientesMap] = useState<{[key: string]: string}>({})
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<'Todos' | 'Em Elaboração' | 'Em Análise' | 'Aprovado' | 'Contratado' | 'Cancelado' | 'Liberado' | 'Negado'>('Todos')
  const [excluindo, setExcluindo] = useState(false)
  const [projetoParaExcluir, setProjetoParaExcluir] = useState<string | null>(null)
  const [dialogoExclusaoAberto, setDialogoExclusaoAberto] = useState(false)
  const [visualizacao, setVisualizacao] = useState<'tabela' | 'cards'>('tabela')

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar projetos e clientes em paralelo
        const [dadosProjetos, dadosClientes] = await Promise.all([
          projetosApi.listarProjetos(),
          clientesApi.listarClientes()
        ])
        
        setProjetos(dadosProjetos)
        
        // Criar mapa de ID do cliente para nome do cliente
        const mapaClientes: {[key: string]: string} = {}
        dadosClientes.forEach(cliente => {
          mapaClientes[cliente.id] = cliente.nome
        })
        setClientesMap(mapaClientes)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])

  // Estatísticas calculadas com base nos projetos
  const estatisticas = useMemo(() => {
    if (!projetos.length) return { total: 0, valorTotal: 0, emAnalise: 0, emElaboracao: 0, contratados: 0 };
    
    return {
      total: projetos.length,
      valorTotal: projetos.reduce((acc, projeto) => acc + projeto.valorTotal, 0),
      emAnalise: projetos.filter(p => p.status === 'Em Análise').length,
      emElaboracao: projetos.filter(p => p.status === 'Em Elaboração').length,
      contratados: projetos.filter(p => p.status === 'Contratado').length
    };
  }, [projetos]);

  // Filtrar projetos com base na busca e no filtro
  const projetosFiltrados = projetos.filter(projeto => {
    const correspondeAoBusca = 
      projeto.titulo.toLowerCase().includes(busca.toLowerCase()) || 
      (clientesMap[projeto.clienteId] && clientesMap[projeto.clienteId].toLowerCase().includes(busca.toLowerCase())) ||
      projeto.linhaCredito.toLowerCase().includes(busca.toLowerCase())
    
    const correspondeAoFiltro = filtro === 'Todos' || projeto.status === filtro
    
    return correspondeAoBusca && correspondeAoFiltro
  })

  const handleExcluirProjeto = (id: string) => {
    setProjetoParaExcluir(id)
    setDialogoExclusaoAberto(true)
  }

  const confirmarExclusao = async () => {
    if (!projetoParaExcluir) return
    
    try {
      setExcluindo(true)
      const sucesso = await projetosApi.excluirProjeto(projetoParaExcluir)
      
      if (sucesso) {
        // Atualizar a lista de projetos removendo o projeto excluído
        setProjetos(projetos.filter(p => p.id !== projetoParaExcluir))
        
        toast({
          title: 'Projeto excluído',
          description: 'O projeto foi excluído com sucesso.',
        })
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir o projeto.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao excluir projeto:', error)
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir o projeto.',
        variant: 'destructive',
      })
    } finally {
      setExcluindo(false)
      setProjetoParaExcluir(null)
      setDialogoExclusaoAberto(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-4">
      <CabecalhoPagina
        titulo="Projetos"
        descricao="Gerencie todos os projetos de crédito rural"
        acoes={
          <Button asChild>
            <Link href="/projetos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Projeto
            </Link>
          </Button>
        }
      />

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardEstatistica
          titulo="Total de Projetos"
          valor={estatisticas.total}
          icone={<FileText className="h-5 w-5" />}
        />
        
        <CardEstatistica
          titulo="Valor em Carteira"
          valor={formatarMoeda(estatisticas.valorTotal)}
          icone={<DollarSign className="h-5 w-5" />}
        />
        
        <CardEstatistica
          titulo="Em Elaboração"
          valor={estatisticas.emElaboracao}
          icone={<FileEdit className="h-5 w-5" />}
          corIcone="text-blue-600"
        />
        
        <CardEstatistica
          titulo="Em Análise"
          valor={estatisticas.emAnalise}
          icone={<ClipboardCheck className="h-5 w-5" />}
          corIcone="text-purple-600"
        />
      </div>

      {/* Barra de filtros */}
      <div className="bg-card rounded-lg border shadow-sm p-4">
        <FiltrosPadrao
          titulo="Lista de Projetos"
          subtitulo={`Total de ${projetosFiltrados.length} projetos encontrados`}
          termoBusca={busca}
          onChangeBusca={(e) => setBusca(e.target.value)}  
          placeholderBusca="Buscar projetos..."
        >
          <FiltroSelect
            label="Status"
            valor={filtro}
            onChange={(valor: string) => setFiltro(valor as any)}
            opcoes={[
              { valor: 'Todos', label: 'Todos os Status' },
              { valor: 'Em Elaboração', label: 'Em Elaboração' },
              { valor: 'Em Análise', label: 'Em Análise' },
              { valor: 'Aprovado', label: 'Aprovado' },
              { valor: 'Contratado', label: 'Contratado' },
              { valor: 'Liberado', label: 'Liberado' },
              { valor: 'Negado', label: 'Negado' },
            ]}
          />
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setVisualizacao(visualizacao === 'tabela' ? 'cards' : 'tabela')}
            className="ml-2"
          >
            {visualizacao === 'tabela' ? (
              <>
                <LayoutGrid className="h-4 w-4 mr-2" />
                Cards
              </>
            ) : (
              <>
                <List className="h-4 w-4 mr-2" />
                Tabela
              </>
            )}
          </Button>
        </FiltrosPadrao>
      </div>
      
      {/* Conteúdo principal - Alternância entre visualização em cards e tabela */}
      {/* Conteúdo principal - Alternância entre visualização em cards e tabela */}
      {visualizacao === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projetosFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-8 border rounded-md bg-muted/10">
              <p className="text-muted-foreground">Nenhum projeto encontrado.</p>
            </div>
          ) : (
            projetosFiltrados.map((projeto) => (
              <Card key={projeto.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{projeto.titulo}</CardTitle>
                      <CardDescription>
                        {projeto.linhaCredito}
                      </CardDescription>
                    </div>
                    <Badge className={coresStatus.projeto[projeto.status]}>
                      {projeto.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Cliente:</span>
                      <span className="text-sm font-medium">{clientesMap[projeto.clienteId] || 'Cliente não encontrado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Valor:</span>
                      <span className="text-sm font-medium">{formatarMoeda(projeto.valorTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Data:</span>
                      <span className="text-sm">{formatarData(projeto.dataCriacao)}</span>
                    </div>
                    
                    {/* Barra de progresso */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progresso</span>
                        <span>{getProgressoStatus(projeto.status)}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${getProgressoStatus(projeto.status)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/projetos/${projeto.id}`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/projetos/${projeto.id}/editar`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/projetos/${projeto.id}/documentos`}>
                          <FileText className="h-4 w-4 mr-2" />
                          Documentos
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleExcluirProjeto(projeto.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Título</TableHead>
                <TableHead className="w-[15%]">Cliente</TableHead>
                <TableHead className="w-[15%]">Linha de Crédito</TableHead>
                <TableHead className="w-[10%]">Valor</TableHead>
                <TableHead className="w-[10%]">Status</TableHead>
                <TableHead className="w-[15%]">Data de Criação</TableHead>
                <TableHead className="text-right w-[10%]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projetosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Nenhum projeto encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                projetosFiltrados.map((projeto) => (
                  <TableRow key={projeto.id}>
                    <TableCell className="font-medium">{projeto.titulo}</TableCell>
                    <TableCell>{clientesMap[projeto.clienteId] || 'Cliente não encontrado'}</TableCell>
                    <TableCell>{projeto.linhaCredito}</TableCell>
                    <TableCell>{formatarMoeda(projeto.valorTotal)}</TableCell>
                    <TableCell>
                      <Badge className={coresStatus.projeto[projeto.status]}>
                        {projeto.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatarData(projeto.dataCriacao)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/projetos/${projeto.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/projetos/${projeto.id}/editar`}>
                              <FileEdit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/projetos/${projeto.id}/documentos`}>
                              <FileText className="mr-2 h-4 w-4" />
                              Documentos
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleExcluirProjeto(projeto.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={dialogoExclusaoAberto} onOpenChange={setDialogoExclusaoAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Projeto</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Você tem certeza que deseja excluir o projeto?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
