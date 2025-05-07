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
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  FileText, 
  Search, 
  ArrowLeft, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  File,
  Calendar,
  User,
  MoreVertical,
  Upload,
  Grid,
  List,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileImage,
  X
} from 'lucide-react'
import { Projeto, Documento } from '@/lib/crm-utils'
import { formatarData, formatarTamanhoArquivo, coresStatus } from '@/lib/formatters'
import { documentosApi, projetosApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function ProjetoDocumentosConteudo({ projetoId }: { projetoId: string }) {
  const router = useRouter()
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [documentoParaExcluir, setDocumentoParaExcluir] = useState<string | null>(null)
  const [dialogoExclusaoAberto, setDialogoExclusaoAberto] = useState(false)
  const [modoVisualizacao, setModoVisualizacao] = useState<'lista' | 'grade'>('lista')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  
  // Estados para o dialog de upload
  const [dialogoUploadAberto, setDialogoUploadAberto] = useState(false)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [nomeDocumento, setNomeDocumento] = useState('')
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [descricaoDocumento, setDescricaoDocumento] = useState('')
  const [statusDocumento, setStatusDocumento] = useState('Pendente')
  const [enviandoDocumento, setEnviandoDocumento] = useState(false)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        
        // Carregar projeto
        const dadosProjeto = await projetosApi.buscarProjetoPorId(projetoId)
        if (!dadosProjeto) {
          toast({
            title: 'Erro',
            description: 'Projeto não encontrado',
            variant: 'destructive',
          })
          router.push('/projetos')
          return
        }
        
        setProjeto(dadosProjeto)
        
        // Carregar documentos do projeto
        const docs = await documentosApi.listarDocumentosPorProjeto(projetoId)
        setDocumentos(docs)
      } catch (error) {
        console.error('Erro ao carregar documentos:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os documentos do projeto.',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarDados()
  }, [projetoId, router])

  const documentosFiltrados = documentos.filter(doc => {
    // Filtro de busca
    const matchBusca = 
      doc.nome.toLowerCase().includes(busca.toLowerCase()) ||
      doc.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      doc.tipo.toLowerCase().includes(busca.toLowerCase()) ||
      doc.status.toLowerCase().includes(busca.toLowerCase());
    
    // Filtro de tipo
    const matchTipo = filtroTipo === 'todos' || doc.tipo === filtroTipo;
    
    // Filtro de status
    const matchStatus = filtroStatus === 'todos' || doc.status === filtroStatus;
    
    return matchBusca && matchTipo && matchStatus;
  })

  const handleExcluirDocumento = async (documentoId: string) => {
    setDocumentoParaExcluir(documentoId)
    setDialogoExclusaoAberto(true)
  }

  const confirmarExclusao = async () => {
    if (!documentoParaExcluir) return
    
    try {
      await documentosApi.excluirDocumento(documentoParaExcluir)
      setDocumentos(documentos.filter(doc => doc.id !== documentoParaExcluir))
      toast({
        title: 'Documento excluído',
        description: 'O documento foi excluído com sucesso.',
      })
    } catch (error) {
      console.error('Erro ao excluir documento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o documento.',
        variant: 'destructive',
      })
    } finally {
      setDialogoExclusaoAberto(false)
    }
  }
  
  // Função para obter contagem de documentos por status
  const getDocumentosPorStatus = (status: string) => {
    return documentos.filter(doc => doc.status === status).length
  }
  
  // Função para obter todos os tipos de documentos únicos
  const getTiposDocumentos = () => {
    const tipos = new Set(documentos.map(doc => doc.tipo))
    return ['todos', ...Array.from(tipos)]
  }
  
  // Função para obter a cor do badge de acordo com o status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return 'success'
      case 'Pendente':
        return 'warning'
      case 'Em Análise':
        return 'info'
      case 'Rejeitado':
        return 'destructive'
      case 'Expirado':
        return 'outline'
      default:
        return 'secondary'
    }
  }
  
  // Função para obter o ícone de acordo com o status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return <CheckCircle2 className="h-4 w-4" />
      case 'Pendente':
        return <Clock className="h-4 w-4" />
      case 'Em Análise':
        return <Search className="h-4 w-4" />
      case 'Rejeitado':
        return <XCircle className="h-4 w-4" />
      case 'Expirado':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }
  
  // Funções para manipulação de arquivos e upload de documentos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setArquivo(file);
      // Preencher o nome do documento com o nome do arquivo (sem a extensão)
      if (!nomeDocumento) {
        const fileName = file.name.split('.');
        fileName.pop(); // Remove a extensão
        setNomeDocumento(fileName.join('.'));
      }
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setArquivo(file);
      // Preencher o nome do documento com o nome do arquivo (sem a extensão)
      if (!nomeDocumento) {
        const fileName = file.name.split('.');
        fileName.pop(); // Remove a extensão
        setNomeDocumento(fileName.join('.'));
      }
    }
  };
  
  const resetUploadForm = () => {
    setArquivo(null);
    setNomeDocumento('');
    setTipoDocumento('');
    setDescricaoDocumento('');
    setStatusDocumento('Pendente');
    setEnviandoDocumento(false);
  };
  
  const handleUploadDocumento = async () => {
    if (!arquivo || !nomeDocumento || !tipoDocumento) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setEnviandoDocumento(true);
      
      // Aqui você usaria a API para fazer o upload do documento
      // Simulando o upload para fins de demonstração
      // await documentosApi.uploadDocumento(projetoId, {
      //   nome: nomeDocumento,
      //   tipo: tipoDocumento,
      //   descricao: descricaoDocumento,
      //   status: statusDocumento,
      //   arquivo: arquivo
      // });
      
      // Simulando um novo documento para adicionar à lista
      const novoDocumento: Documento = {
        id: `temp-${Date.now()}`,
        nome: nomeDocumento,
        tipo: tipoDocumento,
        descricao: descricaoDocumento,
        status: statusDocumento,
        dataCriacao: new Date().toISOString(),
        tamanho: arquivo.size,
        projetoId: projetoId,
        url: URL.createObjectURL(arquivo),
        formato: arquivo.type.split('/')[1] || 'desconhecido',
        clienteId: projeto?.clienteId || '',
        extensao: arquivo.name.split('.').pop() || ''
      };
      
      setDocumentos([novoDocumento, ...documentos]);
      
      toast({
        title: 'Documento enviado',
        description: 'O documento foi enviado com sucesso.',
      });
      
      resetUploadForm();
      setDialogoUploadAberto(false);
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o documento.',
        variant: 'destructive',
      });
    } finally {
      setEnviandoDocumento(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!projeto) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Projeto não encontrado</p>
            <Button asChild className="mt-4">
              <Link href="/projetos">Voltar para lista</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho compacto com botão de voltar, título e botão de ação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href={`/projetos/${projetoId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Documentos do Projeto</h1>
            <p className="text-sm text-muted-foreground">{projeto.titulo}</p>
          </div>
        </div>
        <Button onClick={() => setDialogoUploadAberto(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Documento
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <Card className="mb-4">
        <CardContent className="p-3">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-muted">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{documentos.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-lg font-bold">{getDocumentosPorStatus('Pendente')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900">
                <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Em Análise</p>
                <p className="text-lg font-bold">{getDocumentosPorStatus('Em Análise')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Aprovados</p>
                <p className="text-lg font-bold">{getDocumentosPorStatus('Aprovado')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rejeitados</p>
                <p className="text-lg font-bold">{getDocumentosPorStatus('Rejeitado')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Área de busca e filtros compacta */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar documentos..." 
            className="pl-9"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              {getTiposDocumentos().filter(tipo => tipo !== 'todos').map((tipo) => (
                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Em Análise">Em Análise</SelectItem>
              <SelectItem value="Aprovado">Aprovado</SelectItem>
              <SelectItem value="Rejeitado">Rejeitado</SelectItem>
              <SelectItem value="Expirado">Expirado</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="border rounded-md p-1">
            <Button 
              variant={modoVisualizacao === 'grade' ? 'default' : 'ghost'} 
              size="sm" 
              className="px-2"
              onClick={() => setModoVisualizacao('grade')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant={modoVisualizacao === 'lista' ? 'default' : 'ghost'} 
              size="sm" 
              className="px-2"
              onClick={() => setModoVisualizacao('lista')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Filtros visuais (badges) - mais compactos e responsivos */}
      <div className="flex flex-wrap gap-1 mb-3">
        <Badge 
          variant={filtroStatus === 'todos' ? 'default' : 'outline'} 
          className="cursor-pointer"
          onClick={() => setFiltroStatus('todos')}
        >
          Todos ({documentos.length})
        </Badge>
        <Badge 
          variant={filtroStatus === 'Pendente' ? 'default' : 'outline'} 
          className="cursor-pointer"
          onClick={() => setFiltroStatus('Pendente')}
        >
          Pendentes ({getDocumentosPorStatus('Pendente')})
        </Badge>
        <Badge 
          variant={filtroStatus === 'Em Análise' ? 'default' : 'outline'} 
          className="cursor-pointer"
          onClick={() => setFiltroStatus('Em Análise')}
        >
          Em Análise ({getDocumentosPorStatus('Em Análise')})
        </Badge>
        <Badge 
          variant={filtroStatus === 'Aprovado' ? 'default' : 'outline'} 
          className="cursor-pointer"
          onClick={() => setFiltroStatus('Aprovado')}
        >
          Aprovados ({getDocumentosPorStatus('Aprovado')})
        </Badge>
        <Badge 
          variant={filtroStatus === 'Rejeitado' ? 'default' : 'outline'} 
          className="cursor-pointer"
          onClick={() => setFiltroStatus('Rejeitado')}
        >
          Rejeitados ({getDocumentosPorStatus('Rejeitado')})
        </Badge>
        <Badge 
          variant={filtroStatus === 'Expirado' ? 'default' : 'outline'} 
          className="cursor-pointer"
          onClick={() => setFiltroStatus('Expirado')}
        >
          Expirados ({getDocumentosPorStatus('Expirado')})
        </Badge>
      </div>

      {/* Área de visualização de documentos */}
      {documentosFiltrados.length === 0 ? (
            <Card>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="bg-muted/30 rounded-full p-3 mb-4">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    {busca || filtroTipo !== 'todos' || filtroStatus !== 'todos'
                      ? 'Nenhum documento corresponde aos filtros selecionados. Tente ajustar os filtros para encontrar o que procura.' 
                      : 'Este projeto ainda não possui documentos cadastrados. Adicione documentos para organizar melhor seu projeto.'}
                  </p>
                  <Button asChild>
                    <Link href={`/projetos/${projetoId}/documentos/novo`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Documento
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : modoVisualizacao === 'lista' ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Documentos</CardTitle>
                    <CardDescription>
                      {documentosFiltrados.length} documento{documentosFiltrados.length !== 1 ? 's' : ''} encontrado{documentosFiltrados.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentosFiltrados.map((documento) => (
                      <TableRow key={documento.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="p-1.5 rounded-full bg-muted">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{documento.nome}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{documento.descricao || 'Sem descrição'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">{documento.tipo}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(documento.status)}
                            <Badge variant={getStatusBadgeVariant(documento.status) as any}>
                              {documento.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{formatarData(documento.dataCriacao)}</TableCell>
                        <TableCell>{formatarTamanhoArquivo(documento.tamanho)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Ações</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/documentos/${documento.id}`} className="cursor-pointer">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Visualizar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/documentos/${documento.id}/editar`} className="cursor-pointer">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleExcluirDocumento(documento.id)}
                                className="text-destructive focus:text-destructive cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentosFiltrados.map((documento) => (
                <Card key={documento.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded-full bg-muted">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium truncate">{documento.nome}</h3>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/documentos/${documento.id}`} className="cursor-pointer">
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/documentos/${documento.id}/editar`} className="cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleExcluirDocumento(documento.id)}
                              className="text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-3">
                        <Badge variant="outline" className="font-normal">{documento.tipo}</Badge>
                        <span>•</span>
                        <span>{formatarTamanhoArquivo(documento.tamanho)}</span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
                        {documento.descricao || 'Sem descrição'}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Badge variant={getStatusBadgeVariant(documento.status) as any}>
                          {getStatusIcon(documento.status)}
                          <span className="ml-1">{documento.status}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatarData(documento.dataCriacao)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

      {/* Dialog de exclusão de documento */}
      <AlertDialog open={dialogoExclusaoAberto} onOpenChange={setDialogoExclusaoAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Documento</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este documento?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancelar</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={confirmarExclusao}>Excluir</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Dialog de upload de documento */}
      <Dialog open={dialogoUploadAberto} onOpenChange={setDialogoUploadAberto}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Documento</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para adicionar um novo documento ao projeto.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Área de upload com drag-and-drop */}
            <div className="grid gap-2">
              <Label htmlFor="arquivo">Arquivo</Label>
              <div 
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer text-center",
                  arquivo ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25 hover:border-primary/25"
                )}
                onClick={() => document.getElementById('arquivo-input')?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                {arquivo ? (
                  <div className="flex flex-col items-center">
                    <div className="p-2 rounded-full bg-primary/10 mb-2">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-medium">{arquivo.name}</p>
                    <p className="text-xs text-muted-foreground">{formatarTamanhoArquivo(arquivo.size)}</p>
                    <Button variant="ghost" size="sm" className="mt-2" onClick={(e) => { e.stopPropagation(); setArquivo(null); }}>
                      <X className="h-4 w-4 mr-1" /> Remover
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Arraste e solte ou clique para selecionar</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (MAX. 10MB)
                    </p>
                  </div>
                )}
                <input 
                  id="arquivo-input" 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
              </div>
            </div>
            
            {/* Campos do formulário em duas colunas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome do Documento</Label>
                <Input 
                  id="nome" 
                  value={nomeDocumento} 
                  onChange={(e) => setNomeDocumento(e.target.value)} 
                  placeholder="Digite o nome do documento" 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo do Documento</Label>
                <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {getTiposDocumentos().filter(tipo => tipo !== 'todos').map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea 
                  id="descricao" 
                  value={descricaoDocumento} 
                  onChange={(e) => setDescricaoDocumento(e.target.value)} 
                  placeholder="Descreva brevemente o conteúdo deste documento"
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusDocumento} onValueChange={setStatusDocumento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em Análise">Em Análise</SelectItem>
                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                    <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoUploadAberto(false)}>Cancelar</Button>
            <Button 
              type="submit" 
              disabled={!arquivo || !nomeDocumento || !tipoDocumento || enviandoDocumento} 
              onClick={handleUploadDocumento}
            >
              {enviandoDocumento ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground"></div>
                  Enviando...
                </>
              ) : (
                'Salvar Documento'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
