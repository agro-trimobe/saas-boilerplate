'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Map, 
  MapPin, 
  Info, 
  FileText, 
  ChevronRight,
  Building,
  Ruler,
  Calendar,
  User,
  Phone,
  Mail
} from 'lucide-react'
import { formatarData } from '@/lib/formatters'

import { Propriedade, Cliente, Projeto } from '@/lib/crm-utils'
import { clientesApi, propriedadesApi, projetosApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

// Componentes modulares para cada seção da página
import {
  PropriedadeHeader,
  PropriedadeInfoCards,
  PropriedadeMapa,
  PropriedadeProjetos
} from '@/components/propriedades'
import ClienteMapa from '@/components/propriedades/cliente-mapa'

// Componente cliente que implementa a lógica com hooks
function PropriedadeDetalhesConteudo({ propriedadeId }: { propriedadeId: string }) {
  const router = useRouter()
  const [propriedade, setPropriedade] = useState<Propriedade | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [dialogAberto, setDialogAberto] = useState(false)

  const classificarTamanhoPropriedade = (area: number) => {
    if (area < 20) return { classe: 'Pequena', cor: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80' };
    if (area < 100) return { classe: 'Média', cor: 'bg-amber-100 text-amber-800 hover:bg-amber-100/80' };
    return { classe: 'Grande', cor: 'bg-green-100 text-green-800 hover:bg-green-100/80' };
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        
        // Carregar propriedade
        const dadosPropriedade = await propriedadesApi.buscarPropriedadePorId(propriedadeId)
        if (!dadosPropriedade) {
          toast({
            title: 'Erro',
            description: 'Propriedade não encontrada',
            variant: 'destructive',
          })
          router.push('/propriedades')
          return
        }
        
        setPropriedade(dadosPropriedade)
        
        // Carregar dados do cliente
        if (dadosPropriedade.clienteId) {
          const dadosCliente = await clientesApi.buscarClientePorId(dadosPropriedade.clienteId)
          setCliente(dadosCliente)
        }
        
        // Carregar projetos relacionados à propriedade
        const dadosProjetos = await projetosApi.listarProjetosPorPropriedade(propriedadeId)
        setProjetos(dadosProjetos)
        
      } catch (error) {
        console.error('Erro ao carregar dados da propriedade:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados da propriedade.',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarDados()
  }, [propriedadeId, router])

  const handleExcluir = async () => {
    if (!propriedade) return
    setDialogAberto(true)
  }
  
  const confirmarExclusao = async () => {
    if (!propriedade) return
    
    try {
      await propriedadesApi.excluirPropriedade(propriedade.id)
      toast({
        title: 'Propriedade excluída',
        description: 'A propriedade foi excluída com sucesso.',
      })
      router.push('/propriedades')
    } catch (error) {
      console.error('Erro ao excluir propriedade:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a propriedade.',
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

  if (!propriedade) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Propriedade não encontrada</p>
            <Button asChild className="mt-4">
              <Link href="/propriedades">Voltar para lista</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com breadcrumbs e banner principal */}
      <PropriedadeHeader 
        propriedade={propriedade}
        classificarTamanhoPropriedade={classificarTamanhoPropriedade}
        onExcluir={handleExcluir}
      />

      {/* Conteúdo principal com nova distribuição para visualização do mapa acima da dobra */}
      <div className="space-y-5 pt-4">
        {/* Layout em duas colunas: Informações à esquerda, Mapa à direita */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Coluna da esquerda (7/12) - Cards de informações */}
          <div className="md:col-span-7 space-y-5 flex flex-col">
            {/* Primeira linha: Informações Básicas */}
            <Card className="overflow-hidden shadow-sm hover:shadow transition-shadow border-t-4 border-t-indigo-500">
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center">
                  <Info className="h-5 w-5 mr-2 text-indigo-500" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Endereço</p>
                      <p className="font-medium">{propriedade.endereco}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Localização</p>
                      <p className="font-medium">{propriedade.municipio}, {propriedade.estado}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Ruler className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Área</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{propriedade.area} hectares</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Data de cadastro</p>
                      <p className="font-medium">{formatarData(propriedade.dataCriacao)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Segunda linha: Proprietário */}
            <Card className="overflow-hidden shadow-sm hover:shadow transition-shadow border-t-4 border-t-blue-500">
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  Proprietário
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 pt-0">
                {cliente ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Nome</p>
                        <p className="font-medium">{cliente.nome}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Telefone</p>
                        <p className="font-medium">{cliente.telefone || 'Não informado'}</p>
                      </div>
                    </div>
                    
                    <div className="md:text-right">
                      <Button variant="secondary" size="sm" className="gap-2" asChild>
                        <Link href={`/clientes/${cliente.id}`}>
                          <User className="h-4 w-4" />
                          Ver cliente
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <User className="h-10 w-10 mx-auto text-muted-foreground opacity-30 mb-2" />
                    <p className="text-muted-foreground">Proprietário não vinculado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Coluna da direita (5/12) - Mapa visível acima da dobra, alinhado com os cards da esquerda */}
          <div className="md:col-span-5 flex flex-col h-full">
            <Card className="shadow-sm hover:shadow transition-shadow overflow-hidden h-full flex flex-col">
              <CardHeader className="py-3 border-b flex-shrink-0">
                <CardTitle className="text-base flex items-center">
                  <Map className="h-5 w-5 mr-2 text-primary" />
                  Mapa da Propriedade
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-grow relative">
                {propriedade.coordenadas ? (
                  <div className="absolute inset-0 w-full h-full">
                    <iframe 
                      className="w-full h-full border-0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${propriedade.coordenadas.longitude - 0.01},${propriedade.coordenadas.latitude - 0.01},${propriedade.coordenadas.longitude + 0.01},${propriedade.coordenadas.latitude + 0.01}&layer=mapnik&marker=${propriedade.coordenadas.latitude},${propriedade.coordenadas.longitude}`}
                      title="Mapa da Propriedade"
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <MapPin className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-base text-muted-foreground mb-4">Coordenadas não disponíveis</p>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <MapPin className="h-4 w-4" />
                      Adicionar coordenadas
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Linha inferior exclusiva para Projetos */}
        <div className="w-full">
          <PropriedadeProjetos propriedadeId={propriedadeId} projetos={projetos} />
        </div>
      </div>

      {/* Dialog de confirmação para exclusão */}
      <AlertDialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja excluir esta propriedade?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A propriedade será permanentemente removida do sistema.
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
  );
}

export default PropriedadeDetalhesConteudo
