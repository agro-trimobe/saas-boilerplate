'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calculator, 
  Calendar, 
  DollarSign, 
  Percent, 
  Clock,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Simulacao, Cliente } from '@/lib/crm-utils'
import { formatarData, formatarMoeda, formatarValor } from '@/lib/formatters'
import { simulacoesApi, clientesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

export default function SimulacaoDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const simulacaoId = params.id as string
  
  const [simulacao, setSimulacao] = useState<Simulacao | null>(null)
  const [nomeCliente, setNomeCliente] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [excluindo, setExcluindo] = useState(false)
  const [erro, setErro] = useState('')
  const [cliente, setCliente] = useState<Cliente | null>(null)
  
  useEffect(() => {
    const carregarSimulacao = async () => {
      try {
        setCarregando(true)
        const simulacao = await simulacoesApi.buscarSimulacaoPorId(simulacaoId)
        
        if (simulacao) {
          setSimulacao(simulacao)
          
          // Carregar dados do cliente
          if (simulacao.clienteId) {
            const cliente = await clientesApi.buscarClientePorId(simulacao.clienteId)
            if (cliente) {
              setNomeCliente(cliente.nome)
            }
          }
        } else {
          setErro('Simulação não encontrada')
        }
      } catch (error) {
        console.error('Erro ao carregar simulação:', error)
        setErro('Erro ao carregar dados da simulação')
      } finally {
        setCarregando(false)
      }
    }
    
    carregarSimulacao()
  }, [simulacaoId])

  const handleExcluir = async () => {
    try {
      setExcluindo(true)
      const sucesso = await simulacoesApi.excluirSimulacao(simulacaoId)
      
      if (sucesso) {
        toast({
          title: 'Simulação excluída',
          description: 'A simulação foi excluída com sucesso',
        })
        router.push('/simulacoes')
      } else {
        setErro('Não foi possível excluir a simulação')
      }
    } catch (error) {
      console.error('Erro ao excluir simulação:', error)
      setErro('Erro ao excluir a simulação')
    } finally {
      setExcluindo(false)
    }
  }
  
  // Calcular amortização
  const calcularAmortizacao = () => {
    if (!simulacao) return []
    
    const { valorFinanciamento, taxaJuros, prazoTotal, carencia } = simulacao
    const taxaMensal = taxaJuros / 12 / 100
    const prazoAmortizacao = prazoTotal - carencia
    
    // Usar o sistema de amortização constante (SAC)
    const amortizacaoConstante = valorFinanciamento / prazoAmortizacao
    
    const parcelas = []
    let saldoDevedor = valorFinanciamento
    
    // Período de carência (só juros)
    for (let i = 1; i <= carencia; i++) {
      const juros = saldoDevedor * taxaMensal
      parcelas.push({
        numero: i,
        amortizacao: 0,
        juros: juros,
        total: juros,
        saldoDevedor: saldoDevedor
      })
    }
    
    // Período de amortização
    for (let i = carencia + 1; i <= prazoTotal; i++) {
      const juros = saldoDevedor * taxaMensal
      saldoDevedor -= amortizacaoConstante
      
      parcelas.push({
        numero: i,
        amortizacao: amortizacaoConstante,
        juros: juros,
        total: amortizacaoConstante + juros,
        saldoDevedor: saldoDevedor > 0 ? saldoDevedor : 0
      })
    }
    
    return parcelas
  }
  
  const parcelas = calcularAmortizacao()
  
  if (carregando) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <p className="text-muted-foreground">Carregando detalhes da simulação...</p>
      </div>
    )
  }
  
  if (!simulacao) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
        <Calculator className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Simulação não encontrada</h2>
        <p className="text-muted-foreground">A simulação solicitada não existe ou foi removida.</p>
        <Button asChild>
          <Link href="/simulacoes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Simulações
          </Link>
        </Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Detalhes da Simulação</h2>
          <p className="text-muted-foreground">
            Visualize os detalhes completos da simulação de crédito rural
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/simulacoes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleExcluir}
            disabled={excluindo}
          >
            {excluindo ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </>
            )}
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Linha de Crédito</p>
              <p className="text-lg font-semibold">{simulacao.linhaCredito}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cliente</p>
              <p className="text-lg font-semibold">{nomeCliente || 'Cliente não encontrado'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data da Simulação</p>
              <p className="text-lg font-semibold">{formatarData(simulacao.dataCriacao)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Valores e Taxas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor do Financiamento</p>
                <p className="text-lg font-semibold">{formatarMoeda(simulacao.valorFinanciamento)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Percent className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Juros</p>
                <p className="text-lg font-semibold">{simulacao.taxaJuros}% ao ano</p>
              </div>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor da Parcela</p>
                <p className="text-lg font-semibold">{formatarMoeda(simulacao.valorParcela)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Prazos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prazo Total</p>
                <p className="text-lg font-semibold">{simulacao.prazoTotal} meses</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Carência</p>
                <p className="text-lg font-semibold">{simulacao.carencia} meses</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prazo de Amortização</p>
                <p className="text-lg font-semibold">{simulacao.prazoTotal - simulacao.carencia} meses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Plano de Pagamento</CardTitle>
          <CardDescription>
            Simulação do plano de pagamento utilizando o Sistema de Amortização Constante (SAC)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parcela</TableHead>
                <TableHead>Amortização</TableHead>
                <TableHead>Juros</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Saldo Devedor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parcelas.slice(0, 12).map((parcela) => (
                <TableRow key={parcela.numero}>
                  <TableCell>{parcela.numero}</TableCell>
                  <TableCell>{formatarMoeda(parcela.amortizacao)}</TableCell>
                  <TableCell>{formatarMoeda(parcela.juros)}</TableCell>
                  <TableCell>{formatarMoeda(parcela.total)}</TableCell>
                  <TableCell>{formatarMoeda(parcela.saldoDevedor)}</TableCell>
                </TableRow>
              ))}
              {parcelas.length > 12 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Exibindo as primeiras 12 parcelas de um total de {parcelas.length}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            <p className="text-sm font-medium">Total de Juros: {formatarMoeda(parcelas.reduce((sum, p) => sum + p.juros, 0))}</p>
            <p className="text-sm text-muted-foreground">Valor estimado considerando pagamentos em dia</p>
          </div>
          <div>
            <p className="text-sm font-medium">Total a Pagar: {formatarMoeda(simulacao.valorFinanciamento + parcelas.reduce((sum, p) => sum + p.juros, 0))}</p>
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
          <CardDescription>
            Resumo dos valores e condições da simulação de crédito rural
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor do Financiamento</p>
                <p className="text-xl font-semibold">{formatarMoeda(simulacao.valorFinanciamento)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Juros</p>
                <p className="text-xl font-semibold">{formatarMoeda(parcelas.reduce((sum, p) => sum + p.juros, 0))}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total a Pagar</p>
                <p className="text-xl font-semibold">{formatarMoeda(simulacao.valorFinanciamento + parcelas.reduce((sum, p) => sum + p.juros, 0))}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prazo Total</p>
                <p className="text-xl font-semibold">{simulacao.prazoTotal} meses ({Math.floor(simulacao.prazoTotal / 12)} anos e {simulacao.prazoTotal % 12} meses)</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Período de Carência</p>
                <p className="text-xl font-semibold">{simulacao.carencia} meses</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Juros Efetiva</p>
                <p className="text-xl font-semibold">{simulacao.taxaJuros}% ao ano ({formatarValor(simulacao.taxaJuros / 12, 2)}% ao mês)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
