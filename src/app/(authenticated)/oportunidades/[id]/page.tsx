'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CabecalhoPagina } from "@/components/ui/cabecalho-pagina"
import { CardEstatistica } from "@/components/ui/card-padrao"
import { 
  ArrowLeft,
  FileEdit,
  ArrowUpRight,
  Trash2,
  Calendar as CalendarIcon,
  User,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
  CalendarDays,
  BarChart3,
  History,
  FileText,
  ArrowRight,
  Phone,
  Mail,
  MessageSquare,
  Search,
  FileCheck2
} from 'lucide-react'
import { Oportunidade, Cliente } from '@/lib/crm-utils'
import { formatarData, formatarMoeda, formatarDataHora, coresStatus } from '@/lib/formatters'
import { oportunidadesApi, clientesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

export default function OportunidadeDetalhesPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [oportunidade, setOportunidade] = useState<Oportunidade | null>(null)
  const [nomeCliente, setNomeCliente] = useState<string>('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [dialogoExclusaoAberto, setDialogoExclusaoAberto] = useState(false)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        const dadosOportunidade = await oportunidadesApi.buscarOportunidadePorId(id)
        
        if (!dadosOportunidade) {
          setErro('Oportunidade não encontrada')
          return
        }
        
        setOportunidade(dadosOportunidade)
        
        // Carregar dados do cliente
        if (dadosOportunidade.clienteId) {
          const cliente = await clientesApi.buscarClientePorId(dadosOportunidade.clienteId)
          if (cliente) {
            setNomeCliente(cliente.nome)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setErro('Erro ao carregar dados da oportunidade')
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [id])

  const handleExcluir = async () => {
    setDialogoExclusaoAberto(true)
  }

  const confirmarExclusao = async () => {
    try {
      const sucesso = await oportunidadesApi.excluirOportunidade(id)
      
      if (sucesso) {
        router.push('/oportunidades')
      } else {
        throw new Error('Não foi possível excluir a oportunidade.')
      }
    } catch (error) {
      console.error('Erro ao excluir oportunidade:', error)
    } finally {
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

  if (erro || !oportunidade) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/oportunidades">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Oportunidades
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{erro || 'Oportunidade não encontrada'}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/oportunidades">
                Voltar para lista de oportunidades
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const isOportunidadeAtiva = oportunidade.status !== 'Ganho' && oportunidade.status !== 'Perdido'
  const isProximoContatoAtrasado = oportunidade.proximoContato && new Date(oportunidade.proximoContato) <= new Date()

  // Mapear os status da API para os status do funil
  const mapearStatusParaFunil = (status: string) => {
    const mapeamento: Record<string, string> = {
      'Prospecção': 'Prospecção',
      'Contato Inicial': 'Contato Inicial',
      'Proposta Enviada': 'Proposta',
      'Proposta': 'Proposta',
      'Negociação': 'Negociação',
      'Ganho': 'Fechado',
      'Fechado': 'Fechado',
      'Perdido': 'Perdido'
    };
    return mapeamento[status] || status;
  };
  
  // Definir o status atual e o progresso no funil de vendas
  const statusesOrdenados = ['Prospecção', 'Contato Inicial', 'Proposta', 'Negociação', 'Fechado', 'Perdido'];
  const statusMapeado = mapearStatusParaFunil(oportunidade.status);
  const statusIndex = statusesOrdenados.indexOf(statusMapeado);
  const progressoFunil = statusIndex >= 0 ? Math.min(((statusIndex + 1) / (statusesOrdenados.length - 1)) * 100, 100) : 0;
  
  // Ícones para cada status
  const iconeStatus: Record<string, React.ReactNode> = {
    'Prospecção': <Search className="h-4 w-4" />,
    'Contato Inicial': <Phone className="h-4 w-4" />,
    'Proposta': <FileText className="h-4 w-4" />,
    'Negociação': <MessageSquare className="h-4 w-4" />,
    'Fechado': <CheckCircle2 className="h-4 w-4" />,
    'Perdido': <XCircle className="h-4 w-4" />
  };

  return (
    <div className="container mx-auto py-6 space-y-4">
      <CabecalhoPagina
        titulo={oportunidade.titulo}
        descricao={`Oportunidade com ${nomeCliente}`}
        breadcrumbs={[
          { titulo: 'Oportunidades', href: '/oportunidades' },
          { titulo: oportunidade.titulo, href: `/oportunidades/${id}` }
        ]}
        acoes={
          <div className="flex space-x-2">
            {isOportunidadeAtiva && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/oportunidades/${id}/avancar`}>
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Avançar Status
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/oportunidades/${id}/editar`}>
                <FileEdit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDialogoExclusaoAberto(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        }
        badges={
          <Badge className={coresStatus.oportunidade[oportunidade.status]}>
            {iconeStatus[statusMapeado]}
            <span className="ml-1">{oportunidade.status}</span>
          </Badge>
        }
      />
      
      {/* Barra de progresso do funil */}
      {oportunidade.status !== 'Perdido' && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Prospecção</span>
            <span>Fechado</span>
          </div>
          <Progress value={progressoFunil} className="h-2" />
        </div>
      )}
      
      {/* Conteúdo principal em abas */}
      <Tabs defaultValue="detalhes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="contato">Contato</TabsTrigger>
          <TabsTrigger value="info">Informações</TabsTrigger>
        </TabsList>
        
        {/* Aba de Detalhes */}
        <TabsContent value="detalhes" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Detalhes da Oportunidade</CardTitle>
                <div className="text-xl font-bold">{formatarMoeda(oportunidade.valor)}</div>
              </div>
              <CardDescription>
                <Link href={`/clientes/${oportunidade.clienteId}`} className="flex items-center hover:underline">
                  <User className="mr-1 h-3.5 w-3.5" />
                  {nomeCliente || 'Cliente não encontrado'}
                </Link>
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1 flex items-center">
                    <FileText className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                    Descrição
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line border-l-2 pl-3 py-1 border-muted">
                    {oportunidade.descricao || 'Sem descrição'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium flex items-center">
                      <DollarSign className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                      Valor
                    </h3>
                    <p className="text-lg font-semibold">{formatarMoeda(oportunidade.valor)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium flex items-center">
                      <CalendarDays className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                      Próximo Contato
                    </h3>
                    {oportunidade.proximoContato ? (
                      <div className="flex items-center">
                        <span className={`text-sm ${isProximoContatoAtrasado ? 'text-destructive font-medium' : ''}`}>
                          {formatarData(oportunidade.proximoContato)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatarDataHora(oportunidade.proximoContato).split(' ')[1]}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Não agendado</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            
            {isOportunidadeAtiva && (
              <CardFooter className="pt-0 flex justify-between">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/oportunidades/${id}/editar`}>
                    <FileEdit className="mr-1 h-3.5 w-3.5" /> Editar Detalhes
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
          
          {/* Ações rápidas */}
          {isOportunidadeAtiva && (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/oportunidades/${id}/avancar?resultado=ganho`}>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                  Marcar como Ganho
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/oportunidades/${id}/avancar?resultado=perdido`}>
                  <XCircle className="mr-2 h-4 w-4 text-red-600" />
                  Marcar como Perdido
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Aba de Contato */}
        <TabsContent value="contato" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Próximo Contato</CardTitle>
              <CardDescription>
                Gerencie o agendamento de contato com o cliente
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {oportunidade.proximoContato ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-primary/10 mr-3">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{formatarData(oportunidade.proximoContato)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatarDataHora(oportunidade.proximoContato).split(' ')[1]}
                        </p>
                      </div>
                    </div>
                    
                    {isProximoContatoAtrasado && (
                      <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
                        Contato atrasado
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`tel:${nomeCliente}`}>
                        <Phone className="mr-1 h-3.5 w-3.5" /> Ligar
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`mailto:${nomeCliente}`}>
                        <Mail className="mr-1 h-3.5 w-3.5" /> Email
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="p-3 rounded-full bg-muted mb-3">
                    <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-3">Nenhum contato agendado</p>
                </div>
              )}
            </CardContent>
            
            {isOportunidadeAtiva && (
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/oportunidades/${id}/editar`}>
                    <CalendarDays className="mr-1 h-3.5 w-3.5" /> {oportunidade.proximoContato ? 'Reagendar Contato' : 'Agendar Contato'}
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Cliente</CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-muted mr-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{nomeCliente || 'Cliente não encontrado'}</p>
                  <Link href={`/clientes/${oportunidade.clienteId}`} className="text-sm text-primary hover:underline flex items-center">
                    Ver detalhes do cliente <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Informações */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Informações da Oportunidade</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <div className="flex items-center">
                    <Badge className={coresStatus.oportunidade[oportunidade.status]}>
                      {iconeStatus[statusMapeado]}
                      <span className="ml-1">{oportunidade.status}</span>
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Valor</p>
                  <p className="font-medium">{formatarMoeda(oportunidade.valor)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Criado em</p>
                  <p className="text-sm">{formatarData(oportunidade.dataCriacao)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Atualizado em</p>
                  <p className="text-sm">{formatarData(oportunidade.dataAtualizacao)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Progresso no Funil</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">{statusIndex + 1} de {statusesOrdenados.length - 1} etapas</span>
                    <span className="text-xs font-medium">
                      {statusMapeado === 'Perdido' ? 'Oportunidade perdida' : 
                       statusMapeado === 'Fechado' ? 'Oportunidade ganha' : 
                       'Em progresso'}
                    </span>
                  </div>
                  <Progress value={progressoFunil} className="h-2" />
                </div>
              </div>
            </CardContent>
            
            {isOportunidadeAtiva && (
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/oportunidades/${id}/avancar`}>
                    <ArrowUpRight className="mr-1 h-3.5 w-3.5" /> Avançar para Próxima Etapa
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={dialogoExclusaoAberto} onOpenChange={setDialogoExclusaoAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Oportunidade</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Tem certeza que deseja excluir esta oportunidade?
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
