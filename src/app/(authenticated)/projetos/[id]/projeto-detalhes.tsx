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
  ArrowLeft, 
  FileEdit, 
  Trash2, 
  Calendar,
  User,
  MapPin,
  FileText,
  Landmark,
  DollarSign,
  Timer,
  Clock,
  BarChart2,
  Tag,
  Plus
} from 'lucide-react'
import { Projeto, Cliente, Propriedade, Documento } from '@/lib/crm-utils'
import { formatarData, formatarMoeda, formatarDataHora, coresStatus } from '@/lib/formatters'
import { projetosApi, clientesApi, propriedadesApi, documentosApi } from '@/lib/api'
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
function ProjetoDetalhesConteudo({ projetoId }: { projetoId: string }) {
  const router = useRouter()
  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [propriedade, setPropriedade] = useState<Propriedade | null>(null)
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [dialogAberto, setDialogAberto] = useState(false)

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
        
        // Carregar cliente
        if (dadosProjeto.clienteId) {
          const dadosCliente = await clientesApi.buscarClientePorId(dadosProjeto.clienteId)
          setCliente(dadosCliente)
        }
        
        // Carregar propriedade
        if (dadosProjeto.propriedadeId) {
          const dadosPropriedade = await propriedadesApi.buscarPropriedadePorId(dadosProjeto.propriedadeId)
          setPropriedade(dadosPropriedade)
        }
        
        // Carregar documentos usando a API de documentos para garantir consistência
        const listaDocumentos = await documentosApi.listarDocumentosPorProjeto(projetoId)
        setDocumentos(listaDocumentos)
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do projeto',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarDados()
  }, [projetoId, router])

  const handleExcluir = async () => {
    if (!projeto) return
    
    setDialogAberto(true)
  }
  
  const confirmarExclusao = async () => {
    if (!projeto) return
    
    try {
      await projetosApi.excluirProjeto(projeto.id)
      
      toast({
        title: 'Projeto excluído',
        description: 'O projeto foi excluído com sucesso',
      })
      
      router.push('/projetos')
    } catch (error) {
      console.error('Erro ao excluir projeto:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o projeto',
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

  if (!projeto) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Projeto não encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/projetos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{projeto.titulo}</h1>
        </div>
        <Button asChild>
          <Link href={`/projetos/${projetoId}/editar`}>
            <FileEdit className="mr-2 h-4 w-4" />
            Editar Projeto
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Projeto</CardTitle>
              <CardDescription>
                <Badge className={
                  projeto.status === 'Em Análise' ? 'bg-blue-100 text-blue-800' :
                  projeto.status === 'Aprovado' ? 'bg-green-100 text-green-800' :
                  projeto.status === 'Contratado' ? 'bg-green-100 text-green-800' :
                  projeto.status === 'Em Elaboração' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }>
                  {projeto.status}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h3>
                <p className="text-sm">{projeto.descricao || 'Sem descrição'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Data de Criação</h3>
                  <p className="text-sm">{formatarData(projeto.dataCriacao)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Data de Atualização</h3>
                  <p className="text-sm">{formatarData(projeto.dataAtualizacao)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Linha de Crédito</h3>
                  <p className="text-sm">{projeto.linhaCredito}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Valor Total</h3>
                  <p className="text-sm">{formatarMoeda(projeto.valorTotal)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                  <p className="text-sm">{projeto.status}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Documentos</h3>
                  <p className="text-sm">{documentos.length} documentos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {cliente && (
            <Card>
              <CardHeader>
                <CardTitle>Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{cliente.nome}</h3>
                    <p className="text-sm text-muted-foreground">{cliente.cpfCnpj}</p>
                    <p className="text-sm text-muted-foreground">{cliente.email}</p>
                    <p className="text-sm text-muted-foreground">{cliente.telefone}</p>
                    <div className="mt-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/clientes/${cliente.id}`}>
                          Ver Detalhes
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {propriedade && (
            <Card>
              <CardHeader>
                <CardTitle>Propriedade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{propriedade.nome}</h3>
                    <p className="text-sm text-muted-foreground">{propriedade.endereco}</p>
                    <p className="text-sm text-muted-foreground">{propriedade.municipio}, {propriedade.estado}</p>
                    <p className="text-sm text-muted-foreground">{propriedade.area} hectares</p>
                    <div className="mt-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/propriedades/${propriedade.id}`}>
                          Ver Detalhes
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Documentos</h3>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/projetos/${projetoId}/documentos`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Ver Todos
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              {documentos.length === 0 ? (
                <div className="text-center py-6">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum documento cadastrado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documentos.slice(0, 3).map((documento) => (
                    <div key={documento.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{documento.nome}</p>
                          <p className="text-xs text-muted-foreground">{formatarData(documento.dataCriacao)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/documentos/${documento.id}`}>
                          <ArrowLeft className="h-4 w-4 rotate-180" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                  
                  {documentos.length > 3 && (
                    <div className="text-center pt-2">
                      <Button variant="link" size="sm" asChild>
                        <Link href={`/projetos/${projetoId}/documentos`}>
                          Ver todos os {documentos.length} documentos
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex flex-col gap-2">
            <Button variant="destructive" onClick={handleExcluir}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Projeto
            </Button>
            <Button asChild>
              <Link href={`/projetos/${projetoId}/documentos/novo`}>
                <FileText className="mr-2 h-4 w-4" />
                Adicionar Documento
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ProjetoDetalhesConteudo
