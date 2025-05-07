'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { documentosApi } from '@/lib/api/documentos'
import { clientesApi } from '@/lib/api/clientes'
import { Documento } from '@/lib/crm-utils'
import { formatarData, formatarTamanhoArquivo, coresStatus } from '@/lib/formatters'
import { CabecalhoPagina } from '@/components/ui/cabecalho-pagina'
import { CardEstatistica } from '@/components/ui/card-padrao'
import { FiltrosPadrao, FiltroSelect } from '@/components/ui/filtros-padrao'

// Componentes UI
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuSub, 
  DropdownMenuSubTrigger, DropdownMenuSubContent 
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Ícones
import { 
  Search, MoreHorizontal, FileEdit, Plus, PlusCircle,
  Trash2, Download, Tag, File, Eye, Grid, List,
  CheckCircle2, CheckCircle, Clock, FileText, Calendar,
  Filter, SlidersHorizontal, FileX, RefreshCw
} from 'lucide-react'

export default function DocumentosPageNew() {
  const { toast } = useToast()
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [clientesMap, setClientesMap] = useState<{[key: string]: string}>({})
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos')
  const [filtroTag, setFiltroTag] = useState<string>('')
  const [statusAtivo, setStatusAtivo] = useState<string>('todos')
  const [excluindo, setExcluindo] = useState<string | null>(null)
  const [documentoParaExcluir, setDocumentoParaExcluir] = useState<string | null>(null)
  const [dialogoExclusaoAberto, setDialogoExclusaoAberto] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  // Estatísticas
  const [totalDocumentos, setTotalDocumentos] = useState(0)
  const [documentosPendentes, setDocumentosPendentes] = useState(0)
  const [documentosAprovados, setDocumentosAprovados] = useState(0)
  const [documentosEmAnalise, setDocumentosEmAnalise] = useState(0)
  const [documentosRejeitados, setDocumentosRejeitados] = useState(0)
  const [documentosExpirados, setDocumentosExpirados] = useState(0)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar documentos e clientes em paralelo
        const [dadosDocumentos, dadosClientes] = await Promise.all([
          documentosApi.listarDocumentos(),
          clientesApi.listarClientes()
        ])
        
        setDocumentos(dadosDocumentos)
        
        // Criar mapa de ID do cliente para nome do cliente
        const mapaClientes: {[key: string]: string} = {}
        dadosClientes.forEach(cliente => {
          mapaClientes[cliente.id] = cliente.nome
        })
        setClientesMap(mapaClientes)

        // Calcular estatísticas
        setTotalDocumentos(dadosDocumentos.length)
        setDocumentosPendentes(dadosDocumentos.filter(doc => doc.status === 'Pendente').length)
        setDocumentosAprovados(dadosDocumentos.filter(doc => doc.status === 'Aprovado').length)
        setDocumentosEmAnalise(dadosDocumentos.filter(doc => doc.status === 'Em análise' || doc.status === 'Enviado').length)
        setDocumentosRejeitados(dadosDocumentos.filter(doc => doc.status === 'Rejeitado').length)
        setDocumentosExpirados(dadosDocumentos.filter(doc => doc.status === 'Expirado').length)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])

  // Obter lista de tipos de documentos únicos
  const tiposDocumentos = ['todos', ...Array.from(new Set(documentos.map(doc => doc.tipo.toLowerCase())))]
  
  // Obter lista de tags únicas
  const todasTags = Array.from(new Set(documentos.flatMap(doc => doc.tags || [])))

  // Filtrar documentos com base na busca, tipo, tag e status
  const documentosFiltrados = documentos.filter(documento => {
    const correspondeAoBusca = 
      documento.nome.toLowerCase().includes(busca.toLowerCase()) || 
      (clientesMap[documento.clienteId] && clientesMap[documento.clienteId].toLowerCase().includes(busca.toLowerCase()))
    
    const correspondeAoFiltro = tipoFiltro === 'todos' || documento.tipo.toLowerCase() === tipoFiltro.toLowerCase()
    
    const correspondeATag = !filtroTag || (documento.tags && documento.tags.includes(filtroTag))
    
    const correspondeAoStatus = statusAtivo === 'todos' || documento.status === statusAtivo
    
    return correspondeAoBusca && correspondeAoFiltro && correspondeATag && correspondeAoStatus
  })

  // Obter ícone para o tipo de arquivo
  const getIconePorFormato = (formato: string) => {
    switch (formato.toLowerCase()) {
      case 'pdf':
        return <File className="h-4 w-4 text-red-500" />
      case 'doc':
      case 'docx':
        return <File className="h-4 w-4 text-blue-500" />
      case 'xls':
      case 'xlsx':
        return <File className="h-4 w-4 text-green-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <File className="h-4 w-4 text-purple-500" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  // Função para obter a variante de badge com base no status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'outline'
      case 'Aprovado':
        return 'default'
      case 'Rejeitado':
        return 'destructive'
      case 'Em análise':
      case 'Enviado':
        return 'secondary'
      case 'Expirado':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const handleChangeStatus = async (id: string, status: string) => {
    try {
      await documentosApi.atualizarStatusDocumento(id, status)
      const documentoIndex = documentos.findIndex(doc => doc.id === id)
      if (documentoIndex !== -1) {
        const documento = documentos[documentoIndex]
        documento.status = status
        setDocumentos([...documentos.slice(0, documentoIndex), documento, ...documentos.slice(documentoIndex + 1)])
        
        // Atualizar estatísticas
        setDocumentosPendentes(documentos.filter(doc => doc.status === 'Pendente').length)
        setDocumentosAprovados(documentos.filter(doc => doc.status === 'Aprovado').length)
        setDocumentosEmAnalise(documentos.filter(doc => doc.status === 'Em análise' || doc.status === 'Enviado').length)
        setDocumentosRejeitados(documentos.filter(doc => doc.status === 'Rejeitado').length)
        setDocumentosExpirados(documentos.filter(doc => doc.status === 'Expirado').length)
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  // Função para abrir o diálogo de confirmação de exclusão
  const abrirDialogoExclusao = (id: string) => {
    setDocumentoParaExcluir(id)
    setDialogoExclusaoAberto(true)
  }

  // Função para excluir documento após confirmação
  const handleExcluirDocumento = async () => {
    if (!documentoParaExcluir) return

    try {
      setExcluindo(documentoParaExcluir)
      const sucesso = await documentosApi.excluirDocumento(documentoParaExcluir)
      
      if (sucesso) {
        // Atualiza a lista removendo o documento excluído
        setDocumentos(documentos.filter(doc => doc.id !== documentoParaExcluir))
        
        toast({
          title: 'Documento excluído',
          description: 'O documento foi excluído com sucesso.',
        })
        
        // Atualizar estatísticas
        setTotalDocumentos(documentos.length - 1)
        setDocumentosPendentes(documentos.filter(doc => doc.status === 'Pendente' && doc.id !== documentoParaExcluir).length)
        setDocumentosAprovados(documentos.filter(doc => doc.status === 'Aprovado' && doc.id !== documentoParaExcluir).length)
        setDocumentosEmAnalise(documentos.filter(doc => (doc.status === 'Em análise' || doc.status === 'Enviado') && doc.id !== documentoParaExcluir).length)
        setDocumentosRejeitados(documentos.filter(doc => doc.status === 'Rejeitado' && doc.id !== documentoParaExcluir).length)
        setDocumentosExpirados(documentos.filter(doc => doc.status === 'Expirado' && doc.id !== documentoParaExcluir).length)
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir o documento.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao excluir documento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o documento.',
        variant: 'destructive',
      })
    } finally {
      setExcluindo(null)
      setDocumentoParaExcluir(null)
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
        titulo="Documentos do Projeto"
        descricao={`Projeto do Cliente: ${documentos[0]?.clienteId ? clientesMap[documentos[0].clienteId] : 'Todos os clientes'}`}
        acoes={
          <Button asChild>
            <Link href="/documentos/novo" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Adicionar Documento
            </Link>
          </Button>
        }
      />

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        <CardEstatistica
          titulo="Total"
          valor={totalDocumentos}
          icone={<FileText className="h-5 w-5" />}
        />
        
        <CardEstatistica
          titulo="Pendentes"
          valor={documentosPendentes}
          icone={<Clock className="h-5 w-5" />}
          corIcone="text-amber-600"
        />
        
        <CardEstatistica
          titulo="Em Análise"
          valor={documentosEmAnalise}
          icone={<FileText className="h-5 w-5" />}
          corIcone="text-blue-600"
        />
        
        <CardEstatistica
          titulo="Aprovados"
          valor={documentosAprovados}
          icone={<CheckCircle className="h-5 w-5" />}
          corIcone="text-green-600"
        />
        
        <CardEstatistica
          titulo="Rejeitados"
          valor={documentosRejeitados}
          icone={<FileX className="h-5 w-5" />}
          corIcone="text-red-600"
        />
      </div>

      {/* Filtros visuais (badges) */}
      <div className="flex overflow-x-auto pb-2 mb-3">
        <Badge 
          variant={statusAtivo === 'todos' ? 'default' : 'outline'} 
          className="mr-2 cursor-pointer"
          onClick={() => setStatusAtivo('todos')}
        >
          Todos ({totalDocumentos})
        </Badge>
        <Badge 
          variant={statusAtivo === 'Pendente' ? 'default' : 'outline'} 
          className="mr-2 cursor-pointer"
          onClick={() => setStatusAtivo('Pendente')}
        >
          Pendentes ({documentosPendentes})
        </Badge>
        <Badge 
          variant={statusAtivo === 'Em análise' ? 'default' : 'outline'} 
          className="mr-2 cursor-pointer"
          onClick={() => setStatusAtivo('Em análise')}
        >
          Em Análise ({documentosEmAnalise})
        </Badge>
        <Badge 
          variant={statusAtivo === 'Aprovado' ? 'default' : 'outline'} 
          className="mr-2 cursor-pointer"
          onClick={() => setStatusAtivo('Aprovado')}
        >
          Aprovados ({documentosAprovados})
        </Badge>
        <Badge 
          variant={statusAtivo === 'Rejeitado' ? 'default' : 'outline'} 
          className="mr-2 cursor-pointer"
          onClick={() => setStatusAtivo('Rejeitado')}
        >
          Rejeitados ({documentosRejeitados})
        </Badge>
        <Badge 
          variant={statusAtivo === 'Expirado' ? 'default' : 'outline'} 
          className="mr-2 cursor-pointer"
          onClick={() => setStatusAtivo('Expirado')}
        >
          Expirados ({documentosExpirados})
        </Badge>
      </div>

      {/* Barra de busca e filtros */}
      <div className="bg-card rounded-lg border shadow-sm p-4">
        <FiltrosPadrao
          titulo="Lista de Documentos"
          subtitulo={`Mostrando ${documentosFiltrados.length} de ${totalDocumentos} documentos`}
          termoBusca={busca}
          onChangeBusca={(e) => setBusca(e.target.value)}  
          placeholderBusca="Buscar documentos..."
        >
          <FiltroSelect
            label="Tipo"
            valor={tipoFiltro}
            onChange={(valor: string) => setTipoFiltro(valor)}
            opcoes={[
              { valor: 'todos', label: 'Todos os tipos' },
              ...tiposDocumentos.filter(tipo => tipo !== 'todos')
                .map(tipo => ({ valor: tipo, label: tipo }))
            ]}
          />
          
          {todasTags.length > 0 && (
            <FiltroSelect
              label="Tag"
              valor={filtroTag}
              onChange={(valor: string) => setFiltroTag(valor)}
              opcoes={[
                { valor: '', label: 'Todas as tags' },
                ...todasTags.map(tag => ({ valor: tag, label: tag }))
              ]}
            />
          )}
          
          <div className="border rounded-md p-1 ml-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="px-2"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="px-2"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </FiltrosPadrao>
      </div>

      {/* Área de conteúdo principal */}
      {documentosFiltrados.length === 0 ? (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <FileX className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {statusAtivo === 'todos' 
                ? 'Este projeto ainda não possui documentos cadastrados.' 
                : `Não há documentos com status "${statusAtivo}" neste projeto.`}
            </p>
            <Button asChild className="gap-2">
              <Link href="/documentos/novo">
                <PlusCircle size={16} />
                Adicionar Documento
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Visualização em Grid */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentosFiltrados.map((doc) => (
                <Card key={doc.id} className="overflow-hidden">
                  <div className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 truncate">
                        <h3 className="text-base font-medium truncate">{doc.nome}</h3>
                        <p className="text-sm text-muted-foreground">{doc.tipo}</p>
                      </div>
                      <Badge variant={getStatusVariant(doc.status)}>{doc.status}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center text-xs text-muted-foreground mb-1.5">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>Adicionado em {formatarData(doc.dataCriacao)}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <FileText className="h-3.5 w-3.5 mr-1" />
                      <span>{formatarTamanhoArquivo(doc.tamanho)}</span>
                    </div>
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <div className="p-2 bg-muted/30 flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/documentos/${doc.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/documentos/${doc.id}/editar`}>
                            <FileEdit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/documentos/${doc.id}/tags`}>
                            <Tag className="mr-2 h-4 w-4" />
                            Gerenciar Tags
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Alterar Status
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handleChangeStatus(doc.id, 'Pendente')}>
                              <Badge className={coresStatus.documento['Pendente']} variant="outline">
                                Pendente
                              </Badge>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeStatus(doc.id, 'Enviado')}>
                              <Badge className={coresStatus.documento['Enviado']} variant="outline">
                                Enviado
                              </Badge>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeStatus(doc.id, 'Aprovado')}>
                              <Badge className={coresStatus.documento['Aprovado']} variant="outline">
                                Aprovado
                              </Badge>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeStatus(doc.id, 'Rejeitado')}>
                              <Badge className={coresStatus.documento['Rejeitado']} variant="outline">
                                Rejeitado
                              </Badge>
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => abrirDialogoExclusao(doc.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Visualização em Lista */}
          {viewMode === 'list' && (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentosFiltrados.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {getIconePorFormato(doc.formato)}
                            <span className="ml-2 font-medium">{doc.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell>{doc.tipo}</TableCell>
                        <TableCell>
                          <Link href={`/clientes/${doc.clienteId}`} className="text-primary hover:underline">
                            {clientesMap[doc.clienteId] || 'Cliente não encontrado'}
                          </Link>
                        </TableCell>
                        <TableCell>{formatarTamanhoArquivo(doc.tamanho)}</TableCell>
                        <TableCell>
                          {doc.status && (
                            <Badge className={
                              doc.status === 'Pendente' ? coresStatus.documento['Pendente'] :
                              doc.status === 'Aprovado' ? coresStatus.documento['Aprovado'] :
                              doc.status === 'Rejeitado' ? coresStatus.documento['Rejeitado'] :
                              doc.status === 'Em análise' ? coresStatus.documento['Em análise'] :
                              'bg-gray-100 text-gray-800'
                            }>
                              {doc.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatarData(doc.dataCriacao)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/documentos/${doc.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/documentos/${doc.id}/editar`}>
                                    <FileEdit className="mr-2 h-4 w-4" />
                                    Editar
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/documentos/${doc.id}/tags`}>
                                    <Tag className="mr-2 h-4 w-4" />
                                    Gerenciar Tags
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Alterar Status
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => handleChangeStatus(doc.id, 'Pendente')}>
                                      <Badge className={coresStatus.documento['Pendente']} variant="outline">
                                        Pendente
                                      </Badge>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangeStatus(doc.id, 'Enviado')}>
                                      <Badge className={coresStatus.documento['Enviado']} variant="outline">
                                        Enviado
                                      </Badge>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangeStatus(doc.id, 'Aprovado')}>
                                      <Badge className={coresStatus.documento['Aprovado']} variant="outline">
                                        Aprovado
                                      </Badge>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangeStatus(doc.id, 'Rejeitado')}>
                                      <Badge className={coresStatus.documento['Rejeitado']} variant="outline">
                                        Rejeitado
                                      </Badge>
                                    </DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => abrirDialogoExclusao(doc.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog
        open={dialogoExclusaoAberto}
        onOpenChange={setDialogoExclusaoAberto}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleExcluirDocumento}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!!excluindo}
            >
              {excluindo ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-b-2 rounded-full border-destructive-foreground"></div>
                  Excluindo...
                </>
              ) : (
                'Confirmar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
