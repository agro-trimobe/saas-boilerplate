'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
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
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { 
  ArrowLeft, 
  Save, 
  X, 
  FileText, 
  Building2, 
  CalendarIcon, 
  DollarSign,
  CreditCard,
  BarChart2,
  User
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Cliente, Propriedade, Projeto } from '@/lib/crm-utils'
import { formatarData, coresStatus } from '@/lib/formatters'
import { projetosApi, clientesApi, propriedadesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

export default function ProjetoNovoPage() {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([])
  const [propriedades, setPropriedades] = useState<{ id: string; nome: string }[]>([])
  const [dataPrevisaoTerminoDate, setDataPrevisaoTerminoDate] = useState<Date | undefined>(undefined)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    clienteId: '',
    propriedadeId: '',
    status: 'Em Elaboração' as 'Em Elaboração' | 'Em Análise' | 'Aprovado' | 'Contratado' | 'Cancelado',
    valorTotal: '',
    linhaCredito: '',
    dataPrevisaoTermino: ''
  })

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const dadosClientes = await clientesApi.listarClientes()
        setClientes(dadosClientes.map(c => ({ id: c.id, nome: c.nome })))
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de clientes',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Função para aplicar máscara de valor monetário (R$)
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    
    // Remove todos os caracteres não numéricos
    const numeros = value.replace(/\D/g, '')
    
    // Converte para número e formata como moeda brasileira
    const valorNumerico = parseInt(numeros, 10) / 100
    
    // Formata o valor como string no formato R$ 0,00
    const valorFormatado = valorNumerico.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
    
    // Atualiza o estado com o valor formatado
    setFormData(prev => ({ ...prev, valorTotal: valorFormatado }))
  }

  // Função para converter valor formatado (R$ 0,00) para número ao enviar
  const converterValorParaNumero = (valorFormatado: string) => {
    // Remove o símbolo da moeda e outros caracteres não numéricos, mantendo o ponto decimal
    const valorLimpo = valorFormatado.replace(/[^\d,]/g, '').replace(',', '.')
    
    // Converte para número
    return parseFloat(valorLimpo) || 0
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Se o cliente for alterado, resetar a propriedade selecionada
    if (name === 'clienteId') {
      setFormData(prev => ({ ...prev, propriedadeId: '' }))
      carregarPropriedades(value)
    }
  }

  // Função para carregar propriedades de um cliente
  const carregarPropriedades = async (clienteId: string) => {
    try {
      const propriedadesDoCliente = await propriedadesApi.listarPropriedadesPorCliente(clienteId)
      setPropriedades(propriedadesDoCliente.map(p => ({ id: p.id, nome: p.nome })))
    } catch (error) {
      console.error('Erro ao carregar propriedades:', error)
      setPropriedades([])
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as propriedades do cliente.',
        variant: 'destructive',
      })
    }
  }

  // Função para lidar com a mudança de data no DatePicker
  const handleDataPrevisaoTerminoChange = (date: Date | undefined) => {
    setDataPrevisaoTerminoDate(date)
    
    if (date) {
      // Formato para exibição: DD/MM/YYYY
      const dataFormatada = format(date, 'dd/MM/yyyy')
      // Formato para armazenamento: YYYY-MM-DD
      const dataISO = format(date, 'yyyy-MM-dd')
      
      setFormData(prev => ({ ...prev, dataPrevisaoTermino: dataISO }))
    } else {
      setFormData(prev => ({ ...prev, dataPrevisaoTermino: '' }))
    }
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação básica
    if (!formData.titulo || !formData.clienteId || !formData.propriedadeId || !dataPrevisaoTerminoDate) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }
    
    setSalvando(true)
    
    try {
      // Verificar se a data foi selecionada
      if (!formData.dataPrevisaoTermino) {
        toast({
          title: 'Erro',
          description: 'Por favor, selecione uma data de previsão de término.',
          variant: 'destructive',
        })
        setSalvando(false)
        return
      }
      
      // Converter o valor formatado para número
      const valorNumerico = converterValorParaNumero(formData.valorTotal)
      
      // Criar objeto com os dados do projeto
      const novoProjeto = {
        ...formData,
        dataPrevisaoTermino: formData.dataPrevisaoTermino,
        valorTotal: valorNumerico,
        documentos: [] // Adicionar array vazio de documentos
      }
      
      await projetosApi.criarProjeto(novoProjeto)
      
      toast({
        title: 'Projeto criado',
        description: 'O projeto foi criado com sucesso.',
      })
      
      router.push('/projetos')
    } catch (error) {
      console.error('Erro ao criar projeto:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o projeto.',
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl mx-auto py-4">
      {/* Breadcrumbs e título */}
      <div className="flex items-center mb-4 text-sm">
        <Link href="/projetos" className="text-muted-foreground hover:text-primary flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para Projetos
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-xl font-medium flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Novo Projeto
            </CardTitle>
            <CardDescription>
              Preencha os dados para criar um novo projeto
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Seção 1: Informações Básicas */}
            <div>
              <h3 className="text-base font-medium mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="titulo" className="flex items-center">
                    Título <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                    className="focus-visible:ring-primary"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    rows={3}
                    className="resize-none focus-visible:ring-primary"
                    placeholder="Descreva o projeto em detalhes"
                  />
                </div>
              </div>
            </div>
            
            {/* Seção 2: Cliente e Propriedade */}
            <div className="pt-2 border-t">
              <h3 className="text-base font-medium mb-3 flex items-center">
                <User className="h-4 w-4 mr-2 text-primary" />
                Cliente e Propriedade
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clienteId" className="flex items-center">
                    Cliente <span className="text-destructive ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <Select
                      value={formData.clienteId}
                      onValueChange={(value) => handleSelectChange('clienteId', value)}
                    >
                      <SelectTrigger id="clienteId" className="pl-8 focus-visible:ring-primary">
                        <User className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
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

                <div className="space-y-2">
                  <Label htmlFor="propriedadeId" className="flex items-center">
                    Propriedade <span className="text-destructive ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <Select
                      value={formData.propriedadeId}
                      onValueChange={(value) => handleSelectChange('propriedadeId', value)}
                      disabled={!formData.clienteId || propriedades.length === 0}
                    >
                      <SelectTrigger id="propriedadeId" className="pl-8 focus-visible:ring-primary">
                        <Building2 className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <SelectValue placeholder={
                          !formData.clienteId 
                            ? "Selecione um cliente primeiro" 
                            : propriedades.length === 0 
                              ? "Nenhuma propriedade disponível" 
                              : "Selecione a propriedade"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {propriedades.map((propriedade) => (
                          <SelectItem key={propriedade.id} value={propriedade.id}>
                            {propriedade.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Seção 3: Dados Financeiros */}
            <div className="pt-2 border-t">
              <h3 className="text-base font-medium mb-3 flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-primary" />
                Dados Financeiros
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valorTotal" className="flex items-center">
                    Valor Total <span className="text-destructive ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="valorTotal"
                      name="valorTotal"
                      placeholder="R$ 0,00"
                      value={formData.valorTotal}
                      onChange={handleValorChange}
                      required
                      className="pl-8 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linhaCredito" className="flex items-center">
                    Linha de Crédito <span className="text-destructive ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <CreditCard className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="linhaCredito"
                      name="linhaCredito"
                      value={formData.linhaCredito}
                      onChange={handleChange}
                      required
                      className="pl-8 focus-visible:ring-primary"
                      placeholder="Ex: PRONAF Mais Alimentos"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Seção 4: Status e Prazos */}
            <div className="pt-2 border-t">
              <h3 className="text-base font-medium mb-3 flex items-center">
                <BarChart2 className="h-4 w-4 mr-2 text-primary" />
                Status e Prazos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <div className="space-y-3">
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange('status', value)}
                    >
                      <SelectTrigger id="status" className="focus-visible:ring-primary">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Em Elaboração">
                          <div className="flex items-center">
                            <Badge className={coresStatus.projeto['Em Elaboração']}>
                              Em Elaboração
                            </Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="Em Análise">
                          <div className="flex items-center">
                            <Badge className={coresStatus.projeto['Em Análise']}>
                              Em Análise
                            </Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="Aprovado">
                          <div className="flex items-center">
                            <Badge className={coresStatus.projeto['Aprovado']}>
                              Aprovado
                            </Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="Contratado">
                          <div className="flex items-center">
                            <Badge className={coresStatus.projeto['Contratado']}>
                              Contratado
                            </Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="Cancelado">
                          <div className="flex items-center">
                            <Badge className={coresStatus.projeto['Cancelado']}>
                              Cancelado
                            </Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Barra de progresso baseada no status */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progresso</span>
                        <span>{formData.status === 'Em Elaboração' ? '20%' : 
                               formData.status === 'Em Análise' ? '40%' : 
                               formData.status === 'Aprovado' ? '60%' : 
                               formData.status === 'Contratado' ? '100%' : 
                               formData.status === 'Cancelado' ? '0%' : '0%'}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: formData.status === 'Em Elaboração' ? '20%' : 
                                         formData.status === 'Em Análise' ? '40%' : 
                                         formData.status === 'Aprovado' ? '60%' : 
                                         formData.status === 'Contratado' ? '100%' : 
                                         formData.status === 'Cancelado' ? '0%' : '0%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataPrevisaoTermino" className="flex items-center">
                    Previsão de Término <span className="text-destructive ml-1">*</span>
                  </Label>
                  <DatePicker
                    date={dataPrevisaoTerminoDate}
                    setDate={handleDataPrevisaoTerminoChange}
                    placeholder="Selecione a data de previsão"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="border-t px-6 py-4 flex justify-between bg-muted/20">
            <Button variant="outline" asChild className="flex items-center">
              <Link href="/projetos">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={salvando} className="flex items-center">
              {salvando ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Projeto
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
