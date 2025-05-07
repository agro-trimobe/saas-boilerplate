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
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  ArrowLeft, 
  FileText, 
  Tag, 
  Pencil, 
  Download, 
  Calendar, 
  User, 
  Folder, 
  Link as LinkIcon
} from 'lucide-react'
import { Documento, Cliente, Projeto } from '@/lib/crm-utils'
import { formatarData, formatarDataHora, formatarTamanhoArquivo, coresStatus } from '@/lib/formatters'
import { documentosApi, clientesApi, projetosApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

function DocumentoDetalhesConteudo({ documentoId }: { documentoId: string }) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [documento, setDocumento] = useState<Documento | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [abaAtiva, setAbaAtiva] = useState('detalhes')
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar documento
        const documento = await documentosApi.buscarDocumentoPorId(documentoId)
        if (!documento) {
          toast({
            title: 'Erro',
            description: 'Documento não encontrado',
            variant: 'destructive',
          })
          router.push('/documentos')
          return
        }
        
        setDocumento(documento)
        
        // Carregar cliente relacionado (se houver)
        if (documento.clienteId) {
          const cliente = await clientesApi.buscarClientePorId(documento.clienteId)
          setCliente(cliente)
        }
        
        // Carregar projeto relacionado (se houver)
        if (documento.projetoId) {
          const projeto = await projetosApi.buscarProjetoPorId(documento.projetoId)
          setProjeto(projeto)
        }
        
        setCarregando(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do documento',
          variant: 'destructive',
        })
      }
    }

    carregarDados()
  }, [documentoId, router])

  const handleDownload = () => {
    toast({
      title: 'Download iniciado',
      description: 'O download do documento foi iniciado',
    })
  }
  
  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!documento) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-medium">Documento não encontrado</h2>
        <Button asChild>
          <Link href="/documentos">Voltar para documentos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/documentos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{documento.nome}</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/documentos/${documentoId}/tags`}>
              <Tag className="mr-2 h-4 w-4" />
              Gerenciar Tags
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/documentos/${documentoId}/editar`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList>
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="relacionamentos">Relacionamentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="detalhes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Documento</CardTitle>
              <CardDescription>
                Detalhes e metadados do documento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Tipo</p>
                  <p className="text-sm text-muted-foreground">{documento.tipo}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Status</p>
                  <div>
                    <Badge variant={documento.status === 'Ativo' ? 'default' : 'secondary'}>
                      {documento.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Data de Criação</p>
                  <p className="text-sm text-muted-foreground">
                    <Calendar className="inline-block mr-1 h-3 w-3" />
                    {formatarData(documento.dataCriacao)}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Última Atualização</p>
                  <p className="text-sm text-muted-foreground">
                    <Calendar className="inline-block mr-1 h-3 w-3" />
                    {formatarData(documento.dataAtualizacao)}
                  </p>
                </div>
                
                <div className="space-y-1 col-span-2">
                  <p className="text-sm font-medium">Descrição</p>
                  <p className="text-sm text-muted-foreground">
                    {documento.descricao || 'Sem descrição'}
                  </p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {documento.tags && documento.tags.length > 0 ? (
                    documento.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma tag adicionada</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Arquivo</CardTitle>
              <CardDescription>
                Informações sobre o arquivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Nome do Arquivo</p>
                  <p className="text-sm text-muted-foreground">
                    <FileText className="inline-block mr-1 h-3 w-3" />
                    {documento.nome}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Tamanho</p>
                  <p className="text-sm text-muted-foreground">
                    {documento.tamanho ? `${(documento.tamanho / 1024).toFixed(2)} KB` : 'Desconhecido'}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Formato</p>
                  <p className="text-sm text-muted-foreground">
                    {documento.formato || 'Desconhecido'}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Caminho</p>
                  <p className="text-sm text-muted-foreground">
                    <Folder className="inline-block mr-1 h-3 w-3" />
                    {'Não especificado'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="relacionamentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relacionamentos</CardTitle>
              <CardDescription>
                Entidades relacionadas a este documento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Cliente</h3>
                {cliente ? (
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{cliente.nome}</h4>
                        <p className="text-sm text-muted-foreground">
                          <User className="inline-block mr-1 h-3 w-3" />
                          {cliente.cpfCnpj}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/clientes/${cliente.id}`}>
                          <LinkIcon className="mr-2 h-3 w-3" />
                          Ver Cliente
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum cliente relacionado</p>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Projeto</h3>
                {projeto ? (
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{projeto.titulo}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-muted-foreground">
                            {projeto.linhaCredito}
                          </p>
                          <Badge variant="outline">{projeto.status}</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/projetos/${projeto.id}`}>
                          <LinkIcon className="mr-2 h-3 w-3" />
                          Ver Projeto
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum projeto relacionado</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DocumentoDetalhesConteudo
