'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import { Cliente, Documento } from '@/lib/crm-utils'
import { formatarData } from '@/lib/formatters'
import { documentosApi, clientesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

// Componente cliente que implementa toda a lógica com hooks
export default function NovoDocumentoCliente() {
  // Hooks do Next.js
  const router = useRouter()
  const searchParams = useSearchParams()
  const clienteIdParam = searchParams?.get('clienteId')

  // Estados do componente - TODOS os hooks devem ser declarados antes de qualquer condicional
  const [isMounted, setIsMounted] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([])

  const [carregando, setCarregando] = useState(true)
  const [formData, setFormData] = useState<Partial<Documento>>({
    nome: '',
    tipo: '',
    formato: 'pdf',
    clienteId: clienteIdParam || '',

    status: 'Pendente',
    tamanho: 0,
    url: '',
    descricao: '', 
  })
  const [arquivo, setArquivo] = useState<File | null>(null)

  // Efeito para verificar montagem do componente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Efeito para carregar dados
  useEffect(() => {
    // Verificar se estamos no navegador
    if (typeof window === 'undefined' || !isMounted) return;

    const carregarDados = async () => {
      try {
        const clientesData = await clientesApi.listarClientes()
        setClientes(clientesData.map(c => ({ id: c.id, nome: c.nome })))
        
        // Preencher dados iniciais se fornecidos via query params
        if (clienteIdParam) {
          setFormData(prev => ({ ...prev, clienteId: clienteIdParam }))
        }
        
        setCarregando(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setCarregando(false)
      }
    }
    
    carregarDados()
  }, [isMounted, clienteIdParam])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setArquivo(file)
      
      // Extrair formato do arquivo
      const extensao = file.name.split('.').pop()?.toLowerCase() || ''
      
      setFormData((prev) => ({
        ...prev,
        // Manter o nome atual se já existir, caso contrário usar o nome do arquivo
        nome: prev.nome && prev.nome.trim() !== '' ? prev.nome : file.name.split('.')[0],
        formato: extensao,
        tamanho: file.size,
        url: URL.createObjectURL(file) // URL temporária para o arquivo
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)

    if (!arquivo) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo para upload.',
        variant: 'destructive',
      })
      setSalvando(false)
      return
    }

    try {
      const novoDocumento: Omit<Documento, 'id' | 'dataCriacao' | 'dataAtualizacao'> = {
        nome: formData.nome || '',
        tipo: formData.tipo || '',
        formato: formData.formato || 'pdf',
        tamanho: Number(formData.tamanho) || 0,
        url: formData.url || '',
        clienteId: formData.clienteId || '',
        status: formData.status || 'Pendente',
        tags: [],
        descricao: formData.descricao || '' 
      }
      
      console.log('Enviando documento:', novoDocumento); 
      
      await documentosApi.criarDocumento(novoDocumento)
      toast({
        title: 'Documento adicionado',
        description: 'O documento foi adicionado com sucesso.',
      })
      
      // Redirecionar com base no contexto
      if (novoDocumento.clienteId) {
        router.push('/documentos')
      }
    } catch (error) {
      console.error('Erro ao adicionar documento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o documento.',
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }

  const ArquivoUpload = () => (
    <div className="space-y-2">
      <Label htmlFor="arquivo">Arquivo</Label>
      <div className="border rounded-md p-4 bg-muted/5">
        <div className="flex flex-col gap-3">
          {!arquivo ? (
            <label 
              htmlFor="arquivo" 
              className="flex flex-col items-center justify-center w-full h-24 border border-dashed rounded-md cursor-pointer bg-background hover:bg-muted/10 transition-colors"
            >
              <div className="flex flex-col items-center justify-center py-3">
                <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Clique para selecionar um arquivo
                </p>
              </div>
              <Input
                id="arquivo"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                required
              />
            </label>
          ) : (
            <div className="flex items-center justify-between p-3 border rounded-md bg-background">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex-shrink-0 w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">{arquivo.name.split('.').pop()?.toUpperCase()}</span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{arquivo.name}</p>
                  <p className="text-xs text-muted-foreground">{Math.round(arquivo.size / 1024)} KB</p>
                </div>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setArquivo(null);
                  // Reset do input file
                  const fileInput = document.getElementById('arquivo') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
                className="h-8 w-8 p-0"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Renderização condicional após declarar todos os hooks
  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/documentos">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Novo Documento</h1>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/documentos">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Novo Documento</h1>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Botão de voltar
  const botaoVoltar = (
    <Button variant="outline" size="icon" asChild>
      <Link href="/documentos">
        <ArrowLeft className="h-4 w-4" />
      </Link>
    </Button>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {botaoVoltar}
          <h1 className="text-2xl font-bold tracking-tight">Novo Documento</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Documento</CardTitle>
            <CardDescription>
              Adicione um novo documento ao sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Documento</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Nome do documento"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Documento</Label>
                <Select
                  value={formData.tipo || ''}
                  onValueChange={(value) => handleSelectChange('tipo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contrato">Contrato</SelectItem>
                    <SelectItem value="Relatório">Relatório</SelectItem>
                    <SelectItem value="Proposta">Proposta</SelectItem>
                    <SelectItem value="Análise">Análise</SelectItem>
                    <SelectItem value="Laudo">Laudo</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clienteId">Cliente</Label>
                <Select
                  value={formData.clienteId || ''}
                  onValueChange={(value) => handleSelectChange('clienteId', value)}
                  disabled={!!clienteIdParam}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ArquivoUpload />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/documentos">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-b-2 rounded-full border-background"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Documento
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
