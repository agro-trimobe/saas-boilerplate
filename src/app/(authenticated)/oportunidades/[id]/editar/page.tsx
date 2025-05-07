'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MaskedInput } from '@/components/ui/masked-input'
import { DatePicker } from '@/components/ui/date-picker'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ArrowLeft, 
  Save, 
  User, 
  DollarSign, 
  CalendarDays, 
  FileText, 
  MessageSquare, 
  Phone, 
  Info,
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { Oportunidade, Cliente } from '@/lib/crm-utils'
import { oportunidadesApi, clientesApi } from '@/lib/api'
import { format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Schema de validação
const oportunidadeSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  descricao: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  clienteId: z.string().min(1, 'Selecione um cliente'),
  valor: z.coerce.number().min(1, 'O valor deve ser maior que zero'),
  status: z.enum(['Contato Inicial', 'Proposta Enviada', 'Negociação', 'Ganho', 'Perdido']),
  proximoContato: z.string().optional(),
})

type FormValues = z.infer<typeof oportunidadeSchema>

export default function EditarOportunidadePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [oportunidade, setOportunidade] = useState<Oportunidade | null>(null)
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [dataProximoContato, setDataProximoContato] = useState<Date | undefined>(undefined)

  // Inicializar formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(oportunidadeSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      clienteId: '',
      valor: 0,
      status: 'Contato Inicial',
      proximoContato: '',
    },
  })

  // Função para lidar com a mudança de data no DatePicker
  const handleDataProximoContatoChange = (date: Date | undefined) => {
    setDataProximoContato(date);
    if (date) {
      // Formatar a data para o formato brasileiro DD/MM/AAAA HH:MM
      const dataFormatada = format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
      form.setValue('proximoContato', dataFormatada);
    } else {
      form.setValue('proximoContato', '');
    }
  };

  // Carregar dados da oportunidade e clientes
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        
        // Carregar em paralelo oportunidade e clientes
        const [dadosOportunidade, dadosClientes] = await Promise.all([
          oportunidadesApi.buscarOportunidadePorId(id),
          clientesApi.listarClientes()
        ])
        
        if (!dadosOportunidade) {
          setErro('Oportunidade não encontrada')
          return
        }
        
        setOportunidade(dadosOportunidade)
        setClientes(dadosClientes)
        
        // Formatar data do próximo contato para o formato brasileiro
        let proximoContatoFormatado = ''
        if (dadosOportunidade.proximoContato) {
          try {
            const data = new Date(dadosOportunidade.proximoContato)
            
            // Verificar se a data é válida
            if (isNaN(data.getTime())) {
              console.error('Data inválida ao carregar oportunidade:', dadosOportunidade.proximoContato)
            } else {
              // Formatar para o formato brasileiro DD/MM/AAAA HH:MM
              const dia = data.getDate().toString().padStart(2, '0')
              const mes = (data.getMonth() + 1).toString().padStart(2, '0')
              const ano = data.getFullYear()
              const hora = data.getHours().toString().padStart(2, '0')
              const minuto = data.getMinutes().toString().padStart(2, '0')
              
              proximoContatoFormatado = `${dia}/${mes}/${ano} ${hora}:${minuto}`
              
              // Configurar a data para o DatePicker
              setDataProximoContato(data);
            }
          } catch (error) {
            console.error('Erro ao formatar data do próximo contato:', error)
          }
        }
        
        // Preencher formulário com dados da oportunidade
        form.reset({
          titulo: dadosOportunidade.titulo,
          descricao: dadosOportunidade.descricao,
          clienteId: dadosOportunidade.clienteId,
          valor: dadosOportunidade.valor,
          status: dadosOportunidade.status,
          proximoContato: proximoContatoFormatado,
        })
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setErro('Erro ao carregar dados da oportunidade')
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [id, form])

  // Função para salvar alterações
  const onSubmit = async (data: FormValues) => {
    try {
      setSalvando(true)
      
      // Converter data do formato DD/MM/YYYY HH:MM para ISO
      let proximoContato;
      if (data.proximoContato) {
        try {
          // Verificar se a data está no formato brasileiro
          if (data.proximoContato.includes('/')) {
            const dataPartes = data.proximoContato.split(' ');
            const [dia, mes, ano] = dataPartes[0].split('/');
            
            // Validar os componentes da data
            const diaNum = parseInt(dia, 10);
            const mesNum = parseInt(mes, 10);
            const anoNum = parseInt(ano, 10);
            
            if (isNaN(diaNum) || isNaN(mesNum) || isNaN(anoNum) || 
                diaNum < 1 || diaNum > 31 || 
                mesNum < 1 || mesNum > 12 || 
                anoNum < 2000 || anoNum > 2100) {
              throw new Error('Data inválida');
            }
            
            const dataFormatada = `${anoNum}-${mesNum.toString().padStart(2, '0')}-${diaNum.toString().padStart(2, '0')}`;
            
            if (dataPartes.length > 1) {
              // Tem hora e minuto
              const [hora, minuto] = dataPartes[1].split(':');
              const horaNum = parseInt(hora, 10);
              const minutoNum = parseInt(minuto, 10);
              
              if (isNaN(horaNum) || isNaN(minutoNum) || 
                  horaNum < 0 || horaNum > 23 || 
                  minutoNum < 0 || minutoNum > 59) {
                throw new Error('Hora inválida');
              }
              
              proximoContato = `${dataFormatada}T${horaNum.toString().padStart(2, '0')}:${minutoNum.toString().padStart(2, '0')}:00`;
            } else {
              // Só tem data
              proximoContato = `${dataFormatada}T00:00:00`;
            }
          } else if (data.proximoContato.includes('-') && data.proximoContato.includes('T')) {
            // Já está no formato ISO
            proximoContato = data.proximoContato;
          } else {
            // Formato desconhecido
            throw new Error('Formato de data desconhecido');
          }
        } catch (error) {
          console.error('Erro ao processar data:', error);
          setErro('Data inválida. Use o formato DD/MM/AAAA HH:MM');
          setSalvando(false);
          return;
        }
      }
      
      const oportunidadeAtualizada = await oportunidadesApi.atualizarOportunidade(id, {
        ...data,
        proximoContato,
      })
      
      if (oportunidadeAtualizada) {
        router.push(`/oportunidades/${id}`)
      } else {
        setErro('Erro ao atualizar oportunidade')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setErro('Erro ao salvar alterações')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (erro && !oportunidade) {
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
            <p>{erro}</p>
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

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Cabeçalho com breadcrumb */}
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href={`/oportunidades/${id}`}>
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            <span className="text-sm">Voltar para Detalhes</span>
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Editar Oportunidade</h1>
        {oportunidade && (
          <Badge className="ml-2">{oportunidade.status}</Badge>
        )}
      </div>

      {/* Mensagem de erro */}
      {erro && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
          {erro}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Card de Informações Básicas */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <FileText className="mr-2 h-4 w-4 text-primary" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Informações essenciais da oportunidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <MessageSquare className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                        Título
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Título da oportunidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <User className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                        Cliente
                      </FormLabel>
                      <Select 
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
              </div>
            </CardContent>
          </Card>

          {/* Card de Detalhes Financeiros */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-primary" />
                Detalhes Financeiros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <DollarSign className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                      Valor (R$)
                    </FormLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="pl-8"
                          placeholder="0,00" 
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? '' : Number(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Valor estimado da oportunidade</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Card de Status e Contato */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                Status e Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Info className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                        Status
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Contato Inicial">
                            <div className="flex items-center">
                              <Phone className="mr-2 h-3.5 w-3.5 text-indigo-500" />
                              <span>Contato Inicial</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Proposta Enviada">
                            <div className="flex items-center">
                              <FileText className="mr-2 h-3.5 w-3.5 text-purple-500" />
                              <span>Proposta Enviada</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Negociação">
                            <div className="flex items-center">
                              <MessageSquare className="mr-2 h-3.5 w-3.5 text-amber-500" />
                              <span>Negociação</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Ganho">
                            <div className="flex items-center">
                              <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-green-500" />
                              <span>Ganho</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Perdido">
                            <div className="flex items-center">
                              <XCircle className="mr-2 h-3.5 w-3.5 text-red-500" />
                              <span>Perdido</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proximoContato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Clock className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                        Próximo Contato
                      </FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <DatePicker 
                            date={dataProximoContato}
                            setDate={handleDataProximoContatoChange}
                            placeholder="Selecione data e hora"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card de Descrição */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <FileText className="mr-2 h-4 w-4 text-primary" />
                Descrição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva os detalhes da oportunidade" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-xs flex justify-end">
                      {field.value.length} caracteres
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" type="button" asChild>
              <Link href={`/oportunidades/${id}`}>
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
