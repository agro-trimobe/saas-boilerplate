'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { 
  ArrowLeft, 
  Calculator, 
  Calendar, 
  DollarSign, 
  Percent, 
  Clock,
  Save
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Simulacao, Cliente } from '@/lib/crm-utils'
import { formatarData, formatarMoeda } from '@/lib/formatters'
import { simulacoesApi, clientesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

// Esquema de validação para o formulário
const formSchema = z.object({
  clienteId: z.string({
    required_error: "Selecione um cliente",
  }),
  linhaCredito: z.string({
    required_error: "Selecione uma linha de crédito",
  }),
  valorFinanciamento: z.coerce.number().min(1000, {
    message: "O valor deve ser de pelo menos R$ 1.000,00",
  }).max(10000000, {
    message: "O valor não pode exceder R$ 10.000.000,00",
  }),
  taxaJuros: z.coerce.number().min(0.1, {
    message: "A taxa de juros deve ser maior que 0,1%",
  }).max(20, {
    message: "A taxa de juros não pode exceder 20%",
  }),
  prazoTotal: z.coerce.number().min(12, {
    message: "O prazo deve ser de pelo menos 12 meses",
  }).max(240, {
    message: "O prazo não pode exceder 240 meses",
  }),
  carencia: z.coerce.number().min(0, {
    message: "A carência deve ser de pelo menos 0 meses",
  }).max(60, {
    message: "A carência não pode exceder 60 meses",
  }),
});

type FormValues = z.infer<typeof formSchema>;

// Componente principal
export default function NovaSimulacaoPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/simulacoes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Nova Simulação de Crédito</h1>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <NovaSimulacaoForm />
      </Suspense>
    </div>
  )
}

// Componente de formulário que usa useSearchParams
function NovaSimulacaoForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const linhaId = searchParams?.get('linha')
  
  // Verificação de ambiente cliente
  const [isMounted, setIsMounted] = useState(false)
  const [clientes, setClientes] = useState<Array<{ id: string, nome: string }>>([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [valorParcela, setValorParcela] = useState<number | null>(null)
  
  // Inicializar formulário com valores padrão
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clienteId: '',
      linhaCredito: linhaId ? 'Linha de Crédito' : '',
      valorFinanciamento: 100000,
      taxaJuros: 5.0,
      prazoTotal: 60,
      carencia: 12,
    },
  });
  
  // Observar alterações nos campos para recalcular parcela
  const watchValorFinanciamento = form.watch('valorFinanciamento')
  const watchTaxaJuros = form.watch('taxaJuros')
  const watchPrazoTotal = form.watch('prazoTotal')
  const watchCarencia = form.watch('carencia')
  
  // Carregar clientes ao inicializar
  useEffect(() => {
    setIsMounted(true)
    
    // Verificar se estamos no navegador
    if (typeof window === 'undefined') return;
    
    const carregarClientes = async () => {
      try {
        setCarregando(true)
        const listaClientes = await clientesApi.listarClientes()
        setClientes(listaClientes.map((cliente: Cliente) => ({
          id: cliente.id,
          nome: cliente.nome
        })))
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de clientes.',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarClientes()
  }, [])
  
  // Recalcular parcela quando os valores mudarem
  useEffect(() => {
    // Verificar se estamos no navegador
    if (typeof window === 'undefined' || !isMounted) return;
    
    const calcularParcela = async () => {
      if (
        watchValorFinanciamento && 
        watchTaxaJuros && 
        watchPrazoTotal !== undefined && 
        watchCarencia !== undefined
      ) {
        try {
          const valor = await simulacoesApi.calcularParcela(
            watchValorFinanciamento,
            watchTaxaJuros,
            watchPrazoTotal,
            watchCarencia
          )
          setValorParcela(valor)
        } catch (error) {
          console.error('Erro ao calcular parcela:', error)
          setValorParcela(null)
        }
      }
    }
    
    calcularParcela()
  }, [watchValorFinanciamento, watchTaxaJuros, watchPrazoTotal, watchCarencia, isMounted])
  
  // Função para lidar com o envio do formulário
  async function onSubmit(values: FormValues) {
    // Verificar se estamos no navegador
    if (typeof window === 'undefined') return;
    
    try {
      setSalvando(true)
      
      // Verificar se a parcela foi calculada
      if (valorParcela === null) {
        toast({
          title: 'Erro',
          description: 'Não foi possível calcular o valor da parcela.',
          variant: 'destructive',
        })
        return
      }
      
      // Criar nova simulação
      const novaSimulacao = await simulacoesApi.criarSimulacao({
        ...values,
        valorParcela,
      })
      
      toast({
        title: 'Sucesso',
        description: 'Simulação criada com sucesso!',
      })
      
      // Redirecionar para a página de detalhes da simulação
      router.push(`/simulacoes/${novaSimulacao.id}`)
      
    } catch (error) {
      console.error('Erro ao salvar simulação:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a simulação.',
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }
  
  // Se não estiver montado (ambiente servidor), renderiza um placeholder
  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Dados da Simulação</CardTitle>
            <CardDescription>
              Preencha as informações para simular o financiamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="clienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select 
                        disabled={carregando} 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="linhaCredito"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Linha de Crédito</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma linha de crédito" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Linha de Crédito">Linha de Crédito</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="valorFinanciamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do Financiamento</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number" 
                            {...field} 
                            step={1000}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        {formatarMoeda(field.value)}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="taxaJuros"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa de Juros (% a.a.)</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Percent className="h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number" 
                            {...field} 
                            step={0.1}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        {field.value}% ao ano
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="prazoTotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo Total (meses)</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number" 
                            {...field} 
                            step={12}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        {field.value} meses ({Math.floor(field.value / 12)} anos e {field.value % 12} meses)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="carencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carência (meses)</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number" 
                            {...field} 
                            step={6}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        {field.value} meses de carência
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Resultado da Simulação</CardTitle>
            <CardDescription>
              Valores estimados com base nos parâmetros informados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 space-y-2">
                <p className="text-sm text-muted-foreground">Valor do Financiamento</p>
                <p className="text-2xl font-bold">{formatarMoeda(watchValorFinanciamento || 0)}</p>
              </div>
              <div className="border rounded-lg p-4 space-y-2">
                <p className="text-sm text-muted-foreground">Valor da Parcela (após carência)</p>
                <p className="text-2xl font-bold">{valorParcela ? formatarMoeda(valorParcela) : 'Calculando...'}</p>
              </div>
              <div className="border rounded-lg p-4 space-y-2">
                <p className="text-sm text-muted-foreground">Prazo de Amortização</p>
                <p className="text-2xl font-bold">{(watchPrazoTotal || 0) - (watchCarencia || 0)} meses</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" asChild>
              <Link href="/simulacoes">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? (
                <>Salvando...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Simulação
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
