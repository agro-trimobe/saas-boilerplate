'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Upload, File, FileText } from 'lucide-react'
import { Projeto, Documento } from '@/lib/crm-utils'
import { projetosApi, documentosApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

const formSchema = z.object({
  nome: z.string().min(3, {
    message: 'O nome deve ter pelo menos 3 caracteres.',
  }),
  descricao: z.string().optional(),
  tipo: z.string().min(1, {
    message: 'Selecione um tipo de documento.',
  }),
  status: z.string().min(1, {
    message: 'Selecione um status.',
  }),
  arquivo: z.instanceof(FileList).refine(files => files.length > 0, {
    message: 'Selecione um arquivo.',
  }),
})

export default function NovoDocumentoProjetoConteudo({ projetoId }: { projetoId: string }) {
  const router = useRouter()
  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [nomeArquivo, setNomeArquivo] = useState('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      tipo: '',
      status: 'Pendente',
    },
  })

  useEffect(() => {
    const carregarProjeto = async () => {
      try {
        setCarregando(true)
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
      } catch (error) {
        console.error('Erro ao carregar projeto:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do projeto.',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarProjeto()
  }, [projetoId, router])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setEnviando(true)
      
      // Simulando o envio do arquivo
      const arquivo = values.arquivo[0]
      
      // Criar novo documento
      await documentosApi.criarDocumento({
        nome: values.nome,
        descricao: values.descricao || '',
        tipo: values.tipo,
        status: values.status,
        projetoId: projetoId,
        tamanho: arquivo.size,
        url: URL.createObjectURL(arquivo), // Simulação de URL
        formato: arquivo.name.split('.').pop() || 'desconhecido',
        clienteId: projeto?.clienteId || '',
      })
      
      toast({
        title: 'Documento adicionado',
        description: 'O documento foi adicionado com sucesso ao projeto.',
      })
      
      router.push(`/projetos/${projetoId}/documentos`)
    } catch (error) {
      console.error('Erro ao adicionar documento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o documento.',
        variant: 'destructive',
      })
    } finally {
      setEnviando(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setNomeArquivo(files[0].name)
      
      // Se o nome do documento estiver vazio, preenche com o nome do arquivo
      const { nome } = form.getValues()
      if (!nome) {
        form.setValue('nome', files[0].name)
      }
    } else {
      setNomeArquivo('')
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
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/projetos/${projetoId}/documentos`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Adicionar Documento</h1>
          <p className="text-muted-foreground">Projeto: {projeto.titulo}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo Documento</CardTitle>
          <CardDescription>
            Preencha as informações abaixo para adicionar um novo documento ao projeto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Documento</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome do documento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Documento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de documento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Contrato">Contrato</SelectItem>
                          <SelectItem value="Projeto Técnico">Projeto Técnico</SelectItem>
                          <SelectItem value="Licença Ambiental">Licença Ambiental</SelectItem>
                          <SelectItem value="Documentação Pessoal">Documentação Pessoal</SelectItem>
                          <SelectItem value="Documentação da Propriedade">Documentação da Propriedade</SelectItem>
                          <SelectItem value="Orçamento">Orçamento</SelectItem>
                          <SelectItem value="Laudo Técnico">Laudo Técnico</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva brevemente o conteúdo deste documento" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Em Análise">Em Análise</SelectItem>
                        <SelectItem value="Aprovado">Aprovado</SelectItem>
                        <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                        <SelectItem value="Expirado">Expirado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="arquivo"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Arquivo</FormLabel>
                    <FormControl>
                      <div className="grid w-full items-center gap-1.5">
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="dropzone-file"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/25 hover:bg-muted/50"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              {nomeArquivo ? (
                                <>
                                  <FileText className="w-8 h-8 mb-2 text-primary" />
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold">{nomeArquivo}</span>
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Clique para alterar o arquivo
                                  </p>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                  <p className="mb-1 text-sm text-muted-foreground">
                                    <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (MAX. 10MB)
                                  </p>
                                </>
                              )}
                            </div>
                            <Input
                              id="dropzone-file"
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                handleFileChange(e)
                                onChange(e.target.files)
                              }}
                              {...rest}
                            />
                          </label>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" asChild>
                  <Link href={`/projetos/${projetoId}/documentos`}>Cancelar</Link>
                </Button>
                <Button type="submit" disabled={enviando}>
                  {enviando ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Enviar Documento
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
