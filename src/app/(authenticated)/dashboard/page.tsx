'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { BarChart, LineChart } from '@/components/ui/charts'
import { DoughnutChart } from '@/components/ui/doughnut-chart'
import { formatarData, formatarMoeda, coresStatus } from '@/lib/formatters'
import { clientesApi, projetosApi, oportunidadesApi } from '@/lib/api'
import { 
  CalendarIcon, 
  ClipboardList, 
  CreditCard, 
  TrendingUp,
  BarChart3,
  Users,
  ArrowUp,
  ArrowDown,
  ExternalLink
} from 'lucide-react'
import { CabecalhoPagina } from '@/components/ui/cabecalho-pagina'
import { CardEstatistica } from '@/components/ui/card-padrao'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Projeto {
  status: string
  valorTotal: number
}



interface OportunidadeStatus {
  quantidade: number
  valor: number
}

export default function Dashboard() {
  const [estatisticas, setEstatisticas] = useState({
    totalClientes: 0,
    totalProjetos: 0,
    valorProjetos: 0,
    valorOportunidades: 0,
    projetosStatus: {} as Record<string, number>,
    oportunidadesStatus: {} as Record<string, OportunidadeStatus>
  })
  
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar dados em paralelo
        const [clientes, projetos, estatisticasOportunidades] = await Promise.all([
          clientesApi.listarClientes(),
          projetosApi.listarProjetos(),

          oportunidadesApi.obterEstatisticas()
        ])
        
        // Calcular estatísticas de projetos por status
        const projetosStatus: Record<string, number> = {}
        projetos.forEach((projeto: Projeto) => {
          if (!projetosStatus[projeto.status]) {
            projetosStatus[projeto.status] = 0
          }
          projetosStatus[projeto.status]++
        })
        

        
        // Calcular valor total de projetos
        const valorProjetos = projetos.reduce((total: number, projeto: Projeto) => {
          if (projeto.status !== 'Cancelado') {
            return total + projeto.valorTotal
          }
          return total
        }, 0)
        
        setEstatisticas({
          totalClientes: clientes.length,
          totalProjetos: projetos.length,

          valorProjetos,
          valorOportunidades: estatisticasOportunidades?.valorTotal || 0,
          projetosStatus,

          oportunidadesStatus: estatisticasOportunidades?.porStatus 
            ? Object.entries(estatisticasOportunidades.porStatus).reduce((acc, [status, quantidade]) => {
                acc[status] = { 
                  quantidade: quantidade as number, 
                  valor: 0 // Valor padrão, poderia ser calculado se tivéssemos essa informação
                };
                return acc;
              }, {} as Record<string, OportunidadeStatus>)
            : {}
        })
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
      } finally {
        setCarregando(false)
      }
    }
    
    carregarDados()
  }, [])
  
  // Dados para o gráfico de projetos
  const dadosGraficoProjetos = {
    labels: Object.keys(estatisticas.projetosStatus),
    datasets: [
      {
        label: 'Projetos',
        data: Object.values(estatisticas.projetosStatus),
        total: estatisticas.totalProjetos
      }
    ]
  }
  
  const dadosGraficoOportunidades = {
    labels: Object.keys(estatisticas.oportunidadesStatus),
    datasets: [
      {
        label: 'Valor (R$)',
        data: Object.values(estatisticas.oportunidadesStatus).map(item => item.valor),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
      {
        label: 'Quantidade',
        data: Object.values(estatisticas.oportunidadesStatus).map(item => item.quantidade),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
  }
  

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <CabecalhoPagina
        titulo="Dashboard"
        descricao="Visão geral das suas atividades e desempenho"
      />

      {/* Cards de Resumo Padronizados */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="overflow-hidden border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <CardHeader className="p-3 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Projetos Ativos</CardTitle>
              <ClipboardList className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-2 flex-grow">
            <div className="flex items-baseline gap-1">
              <div className="text-2xl font-bold">{estatisticas.totalProjetos}</div>
              <Badge variant="outline" className="text-[10px] h-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                <span className="flex items-center gap-px">
                  <ArrowUp className="h-3 w-3" />
                  <span>5%</span>
                </span>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Comparado ao mês anterior</p>
          </CardContent>
          <CardFooter className="p-0 mt-auto">
            <Link 
              href="/projetos" 
              className="w-full text-center text-xs py-1.5 border-t hover:bg-muted/50 transition-colors font-medium text-primary flex items-center justify-center gap-1"
            >
              <span>Ver todos os projetos</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="overflow-hidden border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <CardHeader className="p-3 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valor em Projetos</CardTitle>
              <CreditCard className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-2 flex-grow">
            <div className="flex items-baseline gap-1">
              <div className="text-2xl font-bold">{formatarMoeda(estatisticas.valorProjetos)}</div>
              <Badge variant="outline" className="text-[10px] h-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                <span className="flex items-center gap-px">
                  <ArrowUp className="h-3 w-3" />
                  <span>12%</span>
                </span>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Comparado ao mês anterior</p>
          </CardContent>
          <CardFooter className="p-0 mt-auto">
            <Link 
              href="/projetos" 
              className="w-full text-center text-xs py-1.5 border-t hover:bg-muted/50 transition-colors font-medium text-primary flex items-center justify-center gap-1"
            >
              <span>Ver detalhes financeiros</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="overflow-hidden border-l-4 border-l-violet-500 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <CardHeader className="p-3 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-violet-500" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-2 flex-grow">
            <div className="flex items-baseline gap-1">
              <div className="text-2xl font-bold">{estatisticas.totalClientes}</div>
              <Badge variant="outline" className="text-[10px] h-4 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800">
                <span className="flex items-center gap-px">
                  <ArrowUp className="h-3 w-3" />
                  <span>3%</span>
                </span>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Comparado ao mês anterior</p>
          </CardContent>
          <CardFooter className="p-0 mt-auto">
            <Link 
              href="/clientes" 
              className="w-full text-center text-xs py-1.5 border-t hover:bg-muted/50 transition-colors font-medium text-primary flex items-center justify-center gap-1"
            >
              <span>Ver todos os clientes</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="overflow-hidden border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <CardHeader className="p-3 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valor em Oportunidades</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-2 flex-grow">
            <div className="flex items-baseline gap-1">
              <div className="text-2xl font-bold">{formatarMoeda(estatisticas.valorOportunidades)}</div>
              <Badge variant="outline" className="text-[10px] h-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                <span className="flex items-center gap-px">
                  <ArrowDown className="h-3 w-3" />
                  <span>2%</span>
                </span>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Comparado ao mês anterior</p>
          </CardContent>
          <CardFooter className="p-0 mt-auto">
            <Link 
              href="/oportunidades" 
              className="w-full text-center text-xs py-1.5 border-t hover:bg-muted/50 transition-colors font-medium text-primary flex items-center justify-center gap-1"
            >
              <span>Ver todas as oportunidades</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Seção de Gráficos - Com título da seção */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Indicadores de Performance</h3>
        <Separator className="mb-4" />
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {/* Gráfico de Projetos */}
          <Card className="shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-700 border-none p-1.5">
                      <ClipboardList className="h-3.5 w-3.5" />
                    </Badge>
                    Projetos por Status
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Distribuição por fase atual
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow flex flex-col justify-center">
              <div className="flex justify-center items-center h-[280px]">
                <div className="w-full h-full" style={{ maxWidth: '280px' }}>
                  <DoughnutChart data={dadosGraficoProjetos} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-0 mt-auto">
              <Link 
                href="/projetos" 
                className="w-full text-center text-xs py-1.5 border-t hover:bg-muted/50 transition-colors font-medium text-primary flex items-center justify-center gap-1"
              >
                <span>Ver detalhes</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </CardFooter>
          </Card>

          {/* Gráfico de Oportunidades */}
          <Card className="shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-700 border-none p-1.5">
                      <TrendingUp className="h-3.5 w-3.5" />
                    </Badge>
                    Funil de Vendas
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Oportunidades por estágio
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow flex flex-col justify-center">
              <div className="h-[280px] mt-2">
                <BarChart data={dadosGraficoOportunidades} />
              </div>
              <div className="text-center mt-2">
                <span className="text-xs font-medium text-muted-foreground">Taxa de conversão:</span>
                <span className="text-sm font-semibold ml-1">24%</span>
              </div>
            </CardContent>
            <CardFooter className="p-0 mt-auto">
              <Link 
                href="/oportunidades" 
                className="w-full text-center text-xs py-1.5 border-t hover:bg-muted/50 transition-colors font-medium text-primary flex items-center justify-center gap-1"
              >
                <span>Ver detalhes</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </CardFooter>
          </Card>


        </div>
      </div>
    </div>
  )
}
