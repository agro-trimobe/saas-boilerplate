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
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CabecalhoPagina } from '@/components/ui/cabecalho-pagina'
import { CardEstatistica } from '@/components/ui/card-padrao'
import { 
  User, 
  FileText, 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Edit,
  Trash2,
  MessageCircle,
  MoreHorizontal,
  PlusCircle,
  Home,
  FileSpreadsheet,
  BarChart3,
  Clock,
  CalendarClock,
  CheckCircle2
} from 'lucide-react'
import { Cliente, Propriedade, Projeto, Interacao } from '@/lib/crm-utils'
import { formatarData, formatarCpfCnpj, formatarTelefone, formatarEndereco, formatarMoeda } from '@/lib/formatters'
import { clientesApi, propriedadesApi, projetosApi, interacoesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
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

// Componente cliente que implementa a lógica com hooks
function ClienteDetalhesConteudo({ clienteId }: { clienteId: string }) {
  const router = useRouter()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [propriedades, setPropriedades] = useState<Propriedade[]>([])
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [interacoes, setInteracoes] = useState<Interacao[]>([])
  const [abaAtiva, setAbaAtiva] = useState("propriedades")
  const [dialogAberto, setDialogAberto] = useState(false)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        
        // Carregar cliente
        const dadosCliente = await clientesApi.buscarClientePorId(clienteId)
        if (!dadosCliente) {
          toast({
            title: 'Erro',
            description: 'Cliente não encontrado',
            variant: 'destructive',
          })
          router.push('/clientes')
          return
        }
        
        setCliente(dadosCliente)
        
        // Carregar propriedades do cliente
        const dadosPropriedades = await propriedadesApi.listarPropriedadesPorCliente(clienteId)
        setPropriedades(dadosPropriedades)
        
        // Carregar projetos do cliente
        const dadosProjetos = await projetosApi.listarProjetosPorCliente(clienteId)
        setProjetos(dadosProjetos)
        
        // Carregar interações do cliente
        const interacoesCliente = await interacoesApi.listarInteracoesPorCliente(clienteId)
        setInteracoes(interacoesCliente)
      } catch (error) {
        console.error('Erro ao carregar dados do cliente:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do cliente.',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarDados()
  }, [clienteId, router])

  const handleExcluir = async () => {
    if (!cliente) return
    setDialogAberto(true)
  }
  
  const confirmarExclusao = async () => {
    if (!cliente) return
    
    try {
      await clientesApi.excluirCliente(cliente.id)
      toast({
        title: 'Cliente excluído',
        description: 'O cliente foi excluído com sucesso.',
      })
      router.push('/clientes')
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o cliente.',
        variant: 'destructive',
      })
    } finally {
      setDialogAberto(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Cliente não encontrado</p>
            <Button asChild className="mt-4">
              <Link href="/clientes">Voltar para lista</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Funções auxiliares
  const getCorBadge = (perfil: string) => {
    switch (perfil) {
      case 'Pequeno':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      case 'Médio':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      case 'Grande':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em andamento':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100'
      case 'Concluído':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      case 'Pendente':
        return 'bg-red-100 text-red-800 hover:bg-red-100'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  const getProjetoProgress = (status: string) => {
    switch (status) {
      case 'Em andamento': return 60;
      case 'Concluído': return 100;
      case 'Pendente': return 20;
      default: return 0;
    }
  }

  // Estatísticas resumidas
  const estatisticas = {
    totalProjetos: projetos.length,
    totalPropriedades: propriedades.length,
    totalInteracoes: interacoes.length,
    ultimaInteracao: interacoes.length > 0 
      ? interacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0]
      : null,
    valorTotalProjetos: projetos.reduce((acc, projeto) => acc + projeto.valorTotal, 0)
  }

  return (
    <div className="space-y-3">
      {/* Cabeçalho padronizado */}
      <CabecalhoPagina
        titulo={cliente.nome}
        descricao={`${cliente.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'} • ${formatarCpfCnpj(cliente.cpfCnpj)}`}
        breadcrumbs={[
          { titulo: 'Clientes', href: '/clientes' },
          { titulo: cliente.nome }
        ]}
        badges={(
          <Badge variant="outline" className={getCorBadge(cliente.perfil)}>
            {cliente.perfil === 'pequeno' ? 'Pequeno' : 
             cliente.perfil === 'medio' ? 'Médio' : 'Grande'}
          </Badge>
        )}
        acoes={
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" asChild className="h-8">
                    <Link href={`/clientes/${cliente.id}/interacoes/nova`}>
                      <Phone className="h-4 w-4 mr-1" />
                      Registrar Contato
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Registrar nova interação com este cliente</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="ml-2">Ações</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações do Cliente</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/clientes/${cliente.id}/editar`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Cliente
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/projetos/novo?clienteId=${cliente.id}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    Novo Projeto
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/propriedades/novo?clienteId=${cliente.id}`}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Nova Propriedade
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleExcluir}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Cliente
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {/* Card principal com informações do cliente */}
      <Card className="overflow-hidden">
        <CardHeader className="py-3 px-4 flex flex-row items-center space-y-0 gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {getInitials(cliente.nome)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{cliente.nome}</CardTitle>
                <CardDescription className="text-xs">
                  Cliente desde {cliente.dataCadastro ? formatarData(cliente.dataCadastro) : 'N/A'}
                </CardDescription>
              </div>
              <Badge className={getCorBadge(cliente.perfil)}>
                {cliente.perfil}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        {/* Cards de estatísticas */}
        <CardContent className="p-4 pt-0">
          {/* Cards de estatísticas padronizados */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <CardEstatistica
              titulo="Propriedades"
              valor={estatisticas.totalPropriedades.toString()}
              icone={<Home className="h-5 w-5" />}
              corIcone="text-blue-500"
              className="border-none shadow-sm bg-blue-50/30"
            />
            
            <CardEstatistica
              titulo="Projetos"
              valor={estatisticas.totalProjetos.toString()}
              icone={<FileSpreadsheet className="h-5 w-5" />}
              corIcone="text-green-500"
              className="border-none shadow-sm bg-green-50/30"
            />
            
            <CardEstatistica
              titulo="Interações"
              valor={estatisticas.totalInteracoes.toString()}
              icone={<MessageCircle className="h-5 w-5" />}
              corIcone="text-purple-500"
              className="border-none shadow-sm bg-purple-50/30"
            />
            
            <CardEstatistica
              titulo="Em Projetos"
              valor={formatarMoeda(estatisticas.valorTotalProjetos)}
              icone={<BarChart3 className="h-5 w-5" />}
              corIcone="text-amber-500"
              className="border-none shadow-sm bg-amber-50/30"
            />
          </div>
          
          {/* Informações de contato e última interação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Informações de Contato</h3>
              <div className="grid grid-cols-2 gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="justify-start h-8 px-3">
                        <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        <span className="text-xs truncate">{formatarTelefone(cliente.telefone)}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ligar para {formatarTelefone(cliente.telefone)}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="justify-start h-8 px-3">
                        <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        <span className="text-xs truncate">{cliente.email}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Enviar email para {cliente.email}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="justify-start h-8 px-3">
                        <User className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        <span className="text-xs truncate">{formatarCpfCnpj(cliente.cpfCnpj)}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>CPF/CNPJ: {formatarCpfCnpj(cliente.cpfCnpj)}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="justify-start h-8 px-3">
                        <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        <span className="text-xs truncate">{cliente.dataCadastro ? formatarData(cliente.dataCadastro) : 'N/A'}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Data de cadastro: {cliente.dataCadastro ? formatarData(cliente.dataCadastro) : 'N/A'}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Última Interação</h3>
              {estatisticas.ultimaInteracao ? (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatarData(estatisticas.ultimaInteracao.data)}
                      </Badge>
                      <span className="text-xs font-medium">{estatisticas.ultimaInteracao.tipo}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {estatisticas.ultimaInteracao.descricao}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center p-3 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground">Nenhuma interação registrada</p>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-3" />

          {/* Tabs para propriedades, projetos e interações */}
          <Tabs defaultValue="propriedades" value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
            <TabsList className="grid grid-cols-3 mb-2">
              <TabsTrigger value="propriedades" className="text-xs">
                Propriedades ({propriedades.length})
              </TabsTrigger>
              <TabsTrigger value="projetos" className="text-xs">
                Projetos ({projetos.length})
              </TabsTrigger>
              <TabsTrigger value="interacoes" className="text-xs">
                Interações ({interacoes.length})
              </TabsTrigger>
            </TabsList>

            {/* Conteúdo da aba Propriedades */}
            <TabsContent value="propriedades" className="space-y-3">
              {propriedades.length === 0 ? (
                <div className="text-center py-6 bg-muted/30 rounded-lg">
                  <Home className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Este cliente não possui propriedades cadastradas</p>
                  <Button size="sm" asChild>
                    <Link href={`/propriedades/nova?clienteId=${cliente.id}`}>
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Adicionar Propriedade
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {propriedades.map((propriedade) => (
                    <Card key={propriedade.id} className="overflow-hidden">
                      <CardHeader className="py-2 px-3 bg-muted/20">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{propriedade.nome}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {propriedade.area} ha
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2 px-3">
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="space-y-0.5 flex-1">
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {propriedade.endereco}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {propriedade.municipio}, {propriedade.estado}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="py-2 px-3 bg-muted/10 flex justify-end">
                        <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                          <Link href={`/propriedades/${propriedade.id}`}>
                            Ver Detalhes
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Conteúdo da aba Projetos */}
            <TabsContent value="projetos" className="space-y-3">
              {projetos.length === 0 ? (
                <div className="text-center py-6 bg-muted/30 rounded-lg">
                  <FileSpreadsheet className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Este cliente não possui projetos cadastrados</p>
                  <Button size="sm" asChild>
                    <Link href={`/projetos/novo?clienteId=${cliente.id}`}>
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Iniciar Novo Projeto
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {projetos.map((projeto) => (
                    <Card key={projeto.id} className="overflow-hidden">
                      <CardHeader className="py-2 px-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-sm">{projeto.titulo}</CardTitle>
                            <CardDescription className="text-xs">
                              {projeto.linhaCredito}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(projeto.status)}>
                            {projeto.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2 px-3">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Valor</p>
                            <p className="text-sm font-medium">{formatarMoeda(projeto.valorTotal)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Data</p>
                            <p className="text-sm">{formatarData(projeto.dataCriacao)}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Progresso</span>
                            <span>{getProjetoProgress(projeto.status)}%</span>
                          </div>
                          <Progress value={getProjetoProgress(projeto.status)} className="h-1.5" />
                        </div>
                      </CardContent>
                      <CardFooter className="py-2 px-3 bg-muted/10 flex justify-end">
                        <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                          <Link href={`/projetos/${projeto.id}`}>
                            Ver Detalhes
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Conteúdo da aba Interações */}
            <TabsContent value="interacoes" className="space-y-3">
              {interacoes.length === 0 ? (
                <div className="text-center py-6 bg-muted/30 rounded-lg">
                  <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Este cliente não possui interações registradas</p>
                  <Button size="sm" asChild>
                    <Link href={`/clientes/${cliente.id}/interacoes/nova`}>
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Registrar Interação
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Histórico de Interações</h3>
                    <Button size="sm" variant="outline" asChild className="h-7">
                      <Link href={`/clientes/${cliente.id}/interacoes/nova`}>
                        <PlusCircle className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">Nova Interação</span>
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {interacoes
                      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                      .map((interacao) => (
                        <Card key={interacao.id} className="overflow-hidden">
                          <CardHeader className="py-2 px-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="p-1.5 rounded-full bg-primary/10">
                                  <MessageCircle className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <div>
                                  <CardTitle className="text-sm">{interacao.tipo}</CardTitle>
                                  <CardDescription className="text-xs">
                                    Responsável: {interacao.responsavel}
                                  </CardDescription>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <Badge variant="outline" className="text-xs mb-1">
                                  <CalendarClock className="h-3 w-3 mr-1" />
                                  {formatarData(interacao.data)}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="py-2 px-3">
                            <p className="text-xs text-muted-foreground">
                              {interacao.descricao}
                            </p>
                          </CardContent>
                          <CardFooter className="py-2 px-3 bg-muted/10 flex justify-end">
                            <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                              <Link href={`/interacoes/${interacao.id}`}>
                                Ver Detalhes
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              {cliente && `Tem certeza que deseja excluir o cliente ${cliente.nome}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
  )
}

export default ClienteDetalhesConteudo