'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
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
import { Textarea } from '@/components/ui/textarea'
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
import { ArrowLeft, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react'
import { Oportunidade } from '@/lib/crm-utils'
import { oportunidadesApi } from '@/lib/api'
import { coresStatus } from '@/lib/formatters'
import { Badge } from '@/components/ui/badge'

// Schema de validação
const avancarStatusSchema = z.object({
  status: z.enum(['Prospecção', 'Contato Inicial', 'Proposta', 'Negociação', 'Ganho', 'Perdido']),
  observacao: z.string().min(10, 'A observação deve ter pelo menos 10 caracteres'),
})

type FormValues = z.infer<typeof avancarStatusSchema>

// Mapeamento de status para próximo status
const proximoStatus: { [key: string]: string[] } = {
  'Prospecção': ['Contato Inicial', 'Perdido'],
  'Contato Inicial': ['Proposta', 'Perdido'],
  'Proposta': ['Negociação', 'Perdido'],
  'Negociação': ['Ganho', 'Perdido'],
  'Ganho': [],
  'Perdido': [],
}

export default function AvancarStatusOportunidadePage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const resultadoParam = searchParams.get('resultado')

  const [oportunidade, setOportunidade] = useState<Oportunidade | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Inicializar formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(avancarStatusSchema),
    defaultValues: {
      status: 'Contato Inicial',
      observacao: '',
    },
  })

  // Carregar dados da oportunidade
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        const dadosOportunidade = await oportunidadesApi.buscarOportunidadePorId(id)
        
        if (!dadosOportunidade) {
          setErro('Oportunidade não encontrada')
          return
        }
        
        // Verificar se a oportunidade já está em um status final
        if (dadosOportunidade.status === 'Ganho' || dadosOportunidade.status === 'Perdido') {
          setErro('Esta oportunidade já está em um status final e não pode ser avançada')
          return
        }
        
        setOportunidade(dadosOportunidade)
        
        // Se tiver parâmetro de resultado, pré-selecionar o status
        if (resultadoParam === 'ganho') {
          form.setValue('status', 'Ganho')
        } else if (resultadoParam === 'perdido') {
          form.setValue('status', 'Perdido')
        } else {
          // Caso contrário, selecionar o próximo status padrão
          const opcoesStatus = proximoStatus[dadosOportunidade.status]
          if (opcoesStatus && opcoesStatus.length > 0) {
            form.setValue('status', opcoesStatus[0] as any)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setErro('Erro ao carregar dados da oportunidade')
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [id, form, resultadoParam])

  // Função para salvar alterações
  const onSubmit = async (data: FormValues) => {
    if (!oportunidade) return
    
    try {
      setSalvando(true)
      
      // Atualizar status da oportunidade
      const oportunidadeAtualizada = await oportunidadesApi.atualizarOportunidade(
        id, 
        { status: data.status as any }
      )
      
      if (oportunidadeAtualizada) {
        router.push(`/oportunidades/${id}`)
      } else {
        setErro('Erro ao atualizar status da oportunidade')
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

  if (erro || !oportunidade) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href={`/oportunidades/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Detalhes
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
              <Link href={`/oportunidades/${id}`}>
                Voltar para detalhes da oportunidade
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Obter opções de status disponíveis para avançar
  const opcoesStatus = proximoStatus[oportunidade.status]

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" asChild>
          <Link href={`/oportunidades/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Detalhes
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Avançar Status da Oportunidade</CardTitle>
          <CardDescription>
            Atualize o status da oportunidade "{oportunidade.titulo}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center space-x-2">
            <span className="text-muted-foreground">Status atual:</span>
            <Badge className={coresStatus.oportunidade[oportunidade.status]}>
              {oportunidade.status}
            </Badge>
            <ArrowRight />
            <span className="text-muted-foreground">Novo status:</span>
            <Badge className={coresStatus.oportunidade[form.watch('status') as keyof typeof coresStatus.oportunidade]}>
              {form.watch('status')}
            </Badge>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Novo Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o novo status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {opcoesStatus.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status === 'Ganho' ? (
                              <div className="flex items-center">
                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                {status}
                              </div>
                            ) : status === 'Perdido' ? (
                              <div className="flex items-center">
                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                {status}
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <ArrowUpRight className="mr-2 h-4 w-4" />
                                {status}
                              </div>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecione o novo status para esta oportunidade
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observação</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o motivo da mudança de status" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Adicione informações relevantes sobre esta mudança de status
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
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
                      <ArrowUpRight className="mr-2 h-4 w-4" /> Avançar Status
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente de seta para a direita
function ArrowRight() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="text-muted-foreground"
    >
      <path d="M5 12h14"></path>
      <path d="m12 5 7 7-7 7"></path>
    </svg>
  )
}
