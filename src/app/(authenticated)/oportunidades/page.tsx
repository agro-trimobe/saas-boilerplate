'use client'

import { useState, useEffect } from 'react'
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
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ChevronDown, 
  Plus, 
  Search, 
  MoreHorizontal, 
  FileEdit, 
  Trash2, 
  Eye,
  ArrowUpRight,
  BarChart,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarIcon,
  Download,
  Phone,
  FileText,
  MessageSquare,
  User
} from 'lucide-react'
import { Oportunidade } from '@/lib/crm-utils'
import { formatarMoeda, formatarData, formatarDataHora, coresStatus } from '@/lib/formatters'
import { oportunidadesApi, clientesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { CabecalhoPagina } from '@/components/ui/cabecalho-pagina'
import { FiltrosPadrao } from '@/components/ui/filtros-padrao'
import { CardEstatistica } from '@/components/ui/card-padrao'
import { TabelaPadrao } from '@/components/ui/tabela-padrao'

export default function OportunidadesPage() {
  // Estados principais
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([])
  const [clientesMap, setClientesMap] = useState<{[key: string]: string}>({})
  const [carregando, setCarregando] = useState(true)
  
  // Estados de filtros e visualização
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | 'Prospecção' | 'Contato Inicial' | 'Proposta' | 'Negociação' | 'Fechado' | 'Perdido'>('Todos')
  const [filtroValor, setFiltroValor] = useState<'todos' | 'ate50k' | 'de50ka100k' | 'de100ka200k' | 'acima200k'>('todos')
  const [modoVisualizacao, setModoVisualizacao] = useState<'tabela' | 'funil'>('tabela')
  
  // Estados para exclusão
  const [excluindo, setExcluindo] = useState(false)
  const [dialogoExclusaoAberto, setDialogoExclusaoAberto] = useState(false)
  const [idOportunidadeExclusao, setIdOportunidadeExclusao] = useState<string>('')

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar oportunidades e clientes em paralelo
        const [dadosOportunidades, dadosClientes] = await Promise.all([
          oportunidadesApi.listarOportunidades(),
          clientesApi.listarClientes()
        ])
        
        setOportunidades(dadosOportunidades)
        
        // Criar mapa de ID do cliente para nome do cliente
        const mapaClientes: {[key: string]: string} = {}
        dadosClientes.forEach(cliente => {
          mapaClientes[cliente.id] = cliente.nome
        })
        setClientesMap(mapaClientes)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as oportunidades. Tente novamente mais tarde.",
          variant: "destructive"
        })
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])

  // Funções auxiliares para estatísticas
  const getOportunidadesPorStatus = (status: string) => {
    return oportunidades.filter(oportunidade => oportunidade.status === status).length
  }
  
  const getValorTotalOportunidades = () => {
    return oportunidades.reduce((total, oportunidade) => total + oportunidade.valor, 0)
  }
  
  const getValorOportunidadesPorStatus = (status: string) => {
    return oportunidades
      .filter(oportunidade => oportunidade.status === status)
      .reduce((total, oportunidade) => total + oportunidade.valor, 0)
  }
  
  const getProximosContatos = () => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    return oportunidades
      .filter(oportunidade => oportunidade.proximoContato && new Date(oportunidade.proximoContato) >= hoje)
      .sort((a, b) => new Date(a.proximoContato!).getTime() - new Date(b.proximoContato!).getTime())
      .slice(0, 3)
      .map(oportunidade => ({
        id: oportunidade.id,
        titulo: oportunidade.titulo,
        cliente: clientesMap[oportunidade.clienteId] || 'Cliente não encontrado',
        data: oportunidade.proximoContato!
      }))
  }

  // Cores e ícones para o funil de vendas
  const coresFunil: Record<string, string> = {
    'Prospecção': 'bg-blue-50 dark:bg-blue-900',
    'Contato Inicial': 'bg-indigo-50 dark:bg-indigo-900',
    'Proposta': 'bg-purple-50 dark:bg-purple-900',
    'Negociação': 'bg-amber-50 dark:bg-amber-900',
    'Fechado': 'bg-green-50 dark:bg-green-900',
    'Perdido': 'bg-red-50 dark:bg-red-900'
  }
  
  const iconesFunil: Record<string, React.ReactNode> = {
    'Prospecção': <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
    'Contato Inicial': <Phone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />,
    'Proposta': <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
    'Negociação': <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    'Fechado': <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />,
    'Perdido': <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
  }

  // Função para abrir o diálogo de confirmação de exclusão
  const confirmarExclusao = (id: string) => {
    setIdOportunidadeExclusao(id)
    setDialogoExclusaoAberto(true)
  }

  // Função para excluir uma oportunidade
  const excluirOportunidade = async () => {
    if (!idOportunidadeExclusao) return
    
    try {
      setExcluindo(true)
      await oportunidadesApi.excluirOportunidade(idOportunidadeExclusao)
      
      // Atualizar a lista após exclusão
      setOportunidades(oportunidades.filter(o => o.id !== idOportunidadeExclusao))
      
      toast({
        title: "Oportunidade excluída",
        description: "A oportunidade foi excluída com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao excluir oportunidade:', error)
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a oportunidade.",
        variant: "destructive"
      })
    } finally {
      setExcluindo(false)
      setDialogoExclusaoAberto(false)
      setIdOportunidadeExclusao('')
    }
  };

  // Filtrar oportunidades com base na busca e nos filtros
  const oportunidadesFiltradas = oportunidades.filter(oportunidade => {
    // Filtro por texto (busca)
    const correspondeAoBusca = 
      oportunidade.titulo.toLowerCase().includes(busca.toLowerCase()) || 
      oportunidade.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      (clientesMap[oportunidade.clienteId] && clientesMap[oportunidade.clienteId].toLowerCase().includes(busca.toLowerCase()))
    
    // Filtro por status
    const correspondeAoFiltroStatus = filtroStatus === 'Todos' || oportunidade.status === filtroStatus
    
    // Filtro por valor
    let correspondeAoFiltroValor = true
    if (filtroValor === 'ate50k') {
      correspondeAoFiltroValor = oportunidade.valor <= 50000
    } else if (filtroValor === 'de50ka100k') {
      correspondeAoFiltroValor = oportunidade.valor > 50000 && oportunidade.valor <= 100000
    } else if (filtroValor === 'de100ka200k') {
      correspondeAoFiltroValor = oportunidade.valor > 100000 && oportunidade.valor <= 200000
    } else if (filtroValor === 'acima200k') {
      correspondeAoFiltroValor = oportunidade.valor > 200000
    }
    
    return correspondeAoBusca && correspondeAoFiltroStatus && correspondeAoFiltroValor
  })

  // Ordenar oportunidades: primeiro por status (Negociação, Proposta, Contato Inicial, Prospecção, Fechado, Perdido)
  // e depois por data de próximo contato (se existir) ou data de atualização
  const oportunidadesOrdenadas = [...oportunidadesFiltradas].sort((a, b) => {
    // Definir prioridade de status
    const prioridade: {[key: string]: number} = {
      'Negociação': 1,
      'Proposta': 2,
      'Contato Inicial': 3,
      'Prospecção': 4,
      'Fechado': 5,
      'Perdido': 6
    }
    
    // Primeiro ordenar por status
    if (prioridade[a.status] !== prioridade[b.status]) {
      return prioridade[a.status] - prioridade[b.status]
    }
    
    // Depois ordenar por próximo contato (se existir)
    if (a.proximoContato && b.proximoContato) {
      return new Date(a.proximoContato).getTime() - new Date(b.proximoContato).getTime()
    }
    
    // Se um tem próximo contato e outro não, priorizar o que tem
    if (a.proximoContato && !b.proximoContato) return -1
    if (!a.proximoContato && b.proximoContato) return 1
    
    // Por fim, ordenar por data de atualização (mais recente primeiro)
    const dataA = a.dataAtualizacao || a.dataCriacao
    const dataB = b.dataAtualizacao || b.dataCriacao
    return new Date(dataB).getTime() - new Date(dataA).getTime()
  })

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Cabeçalho padronizado */}
      <CabecalhoPagina
        titulo="Oportunidades"
        descricao="Gerencie seu funil de vendas e oportunidades de negócio"
        acoes={
          <Button asChild>
            <Link href="/oportunidades/nova">
              <Plus className="mr-2 h-4 w-4" /> Nova Oportunidade
            </Link>
          </Button>
        }
      />
      
      {/* Cards de estatísticas padronizados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <CardEstatistica
              titulo="Valor Total em Negociação"
              valor={formatarMoeda(getValorTotalOportunidades())}
              icone={<BarChart className="h-5 w-5" />}
            />
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              <span>Oportunidades ativas: {oportunidades.filter(o => !['Fechado', 'Perdido'].includes(o.status)).length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <CardEstatistica
              titulo="Próximos Contatos"
              valor={getProximosContatos().length.toString()}
              icone={<Clock className="h-5 w-5" />}
            />
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              {getProximosContatos()[0] ? (
                <>
                  <CalendarIcon className="mr-1 h-4 w-4" />
                  <span>Próximo: {formatarData(getProximosContatos()[0].data)} - {getProximosContatos()[0].cliente}</span>
                </>
              ) : (
                <span>Nenhum contato agendado</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <CardEstatistica
              titulo="Taxa de Conversão"
              valor={
                oportunidades.length > 0 
                  ? `${Math.round((getOportunidadesPorStatus('Fechado') / oportunidades.length) * 100)}%`
                  : '0%'
              }
              icone={<CheckCircle2 className="h-5 w-5" />}
            />
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <span>Ganhos: {getOportunidadesPorStatus('Fechado')} | Perdidos: {getOportunidadesPorStatus('Perdido')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Área de busca e filtros padronizados */}
      <FiltrosPadrao
        valorBusca={busca}
        onBusca={(valor) => setBusca(valor)}
        placeholderBusca="Buscar por título, descrição ou cliente..."
        onResetarFiltros={() => {
          setBusca('');
          setFiltroStatus('Todos');
          setFiltroValor('todos');
        }}
        filtrosAvancados={
          <div className="flex flex-wrap gap-4">
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select 
                value={filtroStatus} 
                onValueChange={(value: 'Todos' | 'Prospecção' | 'Contato Inicial' | 'Proposta' | 'Negociação' | 'Fechado' | 'Perdido') => setFiltroStatus(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos os status</SelectItem>
                  <SelectItem value="Prospecção">Prospecção</SelectItem>
                  <SelectItem value="Contato Inicial">Contato Inicial</SelectItem>
                  <SelectItem value="Proposta">Proposta</SelectItem>
                  <SelectItem value="Negociação">Negociação</SelectItem>
                  <SelectItem value="Fechado">Fechado</SelectItem>
                  <SelectItem value="Perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-1 block">Valor</label>
              <Select 
                value={filtroValor} 
                onValueChange={(value: 'todos' | 'ate50k' | 'de50ka100k' | 'de100ka200k' | 'acima200k') => setFiltroValor(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos os valores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os valores</SelectItem>
                  <SelectItem value="ate50k">Até R$ 50 mil</SelectItem>
                  <SelectItem value="de50ka100k">R$ 50 mil a R$ 100 mil</SelectItem>
                  <SelectItem value="de100ka200k">R$ 100 mil a R$ 200 mil</SelectItem>
                  <SelectItem value="acima200k">Acima de R$ 200 mil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        }
      >
        <Button variant="outline" size="icon" title="Exportar">
          <Download className="h-4 w-4" />
        </Button>
      </FiltrosPadrao>

      {/* Visualização em abas (tabela/funil) */}
      <Tabs defaultValue="tabela" className="w-full">
        <TabsList className="grid w-[200px] grid-cols-2 mb-4">
          <TabsTrigger value="tabela">Tabela</TabsTrigger>
          <TabsTrigger value="funil">Funil</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tabela" className="space-y-4">
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              <TabelaPadrao
                dados={oportunidadesOrdenadas}
                mensagemVazia="Nenhuma oportunidade encontrada."
                idChave="id"
                colunas={[
                  {
                    chave: 'titulo',
                    titulo: 'Título',
                    renderizador: (valor, item) => (
                      <span className="font-medium">{valor}</span>
                    )
                  },
                  {
                    chave: 'clienteId',
                    titulo: 'Cliente',
                    renderizador: (valor: string, item) => (
                      clientesMap[valor] || 'Cliente não encontrado'
                    )
                  },
                  {
                    chave: 'valor',
                    titulo: 'Valor',
                    renderizador: (valor: number) => formatarMoeda(valor)
                  },
                  {
                    chave: 'status',
                    titulo: 'Status',
                    renderizador: (valor: string) => (
                      <Badge className={coresStatus.oportunidade[valor as keyof typeof coresStatus.oportunidade] || 'bg-gray-100 text-gray-800'}>
                        {valor}
                      </Badge>
                    )
                  },
                  {
                    chave: 'proximoContato',
                    titulo: 'Próximo Contato',
                    renderizador: (valor: string | null, item: any) => (
                      valor ? (
                        <div className="flex items-center">
                          {formatarData(valor)}
                          {new Date(valor) <= new Date() && (
                            <Badge variant="outline" className="ml-2 bg-red-50 text-red-800 border-red-200">
                              Atrasado
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Não agendado</span>
                      )
                    )
                  },
                  {
                    chave: 'dataAtualizacao',
                    titulo: 'Atualização',
                    renderizador: (valor: string) => formatarData(valor)
                  },
                ]}
                acaoRenderizador={(oportunidade: Oportunidade) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/oportunidades/${oportunidade.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/oportunidades/${oportunidade.id}/editar`}>
                          <FileEdit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      {oportunidade.status !== 'Ganho' && oportunidade.status !== 'Perdido' && (
                        <DropdownMenuItem asChild>
                          <Link href={`/oportunidades/${oportunidade.id}/avancar`}>
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Avançar Status
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href={`/oportunidades/${oportunidade.id}/registrar-interacao`}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Registrar Interação
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => confirmarExclusao(oportunidade.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="funil" className="space-y-4">
          {/* Funil de vendas com layout simplificado */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Prospecção', 'Contato Inicial', 'Proposta', 'Negociação', 'Fechado', 'Perdido'].map((status, index) => {
              const oportunidadesDoStatus = oportunidadesOrdenadas.filter(o => o.status === status)
              
              return (
                <Card key={status} className="h-[calc(100vh-320px)] overflow-hidden">
                  {/* Cabeçalho da coluna */}
                  <CardHeader className={`${coresFunil[status]} py-3 px-4 flex flex-row items-center justify-between space-y-0`}>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-white dark:bg-gray-800">
                        {iconesFunil[status]}
                      </div>
                      <div>
                        <CardTitle className="text-sm">{status}</CardTitle>
                        <CardDescription>
                          {oportunidadesDoStatus.length} oportunidade{oportunidadesDoStatus.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {/* Conteúdo da coluna */}
                  <CardContent className="p-3 overflow-y-auto h-full space-y-3">
                    {/* Estado vazio */}
                    {oportunidadesDoStatus.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground text-sm p-4">
                        <p>Nenhuma oportunidade</p>
                        {status === 'Prospecção' && (
                          <Button variant="outline" size="sm" className="mt-2" asChild>
                            <Link href="/oportunidades/nova">
                              <Plus className="mr-1 h-3 w-3" /> Nova
                            </Link>
                          </Button>
                        )}
                      </div>
                    ) : (
                      /* Lista de oportunidades */
                      oportunidadesDoStatus.map((oportunidade) => (
                        <Card key={oportunidade.id} className="shadow-none border">
                          <CardContent className="p-3">
                            {/* Título e valor */}
                            <div className="flex justify-between items-center mb-1">
                              <div className="font-medium truncate text-sm mr-2">
                                {oportunidade.titulo}
                              </div>
                              <div className="text-sm font-medium whitespace-nowrap">
                                {formatarMoeda(oportunidade.valor)}
                              </div>
                            </div>
                            
                            {/* Cliente */}
                            <div className="text-xs text-muted-foreground truncate mb-2">
                              {clientesMap[oportunidade.clienteId] || 'Cliente não encontrado'}
                            </div>
                            
                            {/* Ações e data */}
                            <div className="flex justify-between items-center">
                              {oportunidade.proximoContato ? (
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {formatarData(oportunidade.proximoContato)}
                                  </span>
                                </div>
                              ) : (
                                <div></div>
                              )}
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/oportunidades/${oportunidade.id}`}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Visualizar
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/oportunidades/${oportunidade.id}/editar`}>
                                      <FileEdit className="mr-2 h-4 w-4" />
                                      Editar
                                    </Link>
                                  </DropdownMenuItem>
                                  {status !== 'Fechado' && status !== 'Perdido' && (
                                    <DropdownMenuItem asChild>
                                      <Link href={`/oportunidades/${oportunidade.id}/avancar`}>
                                        <ArrowUpRight className="mr-2 h-4 w-4" />
                                        Avançar Status
                                      </Link>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => confirmarExclusao(oportunidade.id)}
                                    disabled={excluindo}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                    
                    {/* Botão de adicionar */}
                    {status === 'Prospecção' && (
                      <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                        <Link href="/oportunidades/nova">
                          <Plus className="mr-1 h-3 w-3" /> Nova Oportunidade
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={dialogoExclusaoAberto} onOpenChange={setDialogoExclusaoAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta oportunidade?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={excluirOportunidade}
              disabled={excluindo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {excluindo ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
