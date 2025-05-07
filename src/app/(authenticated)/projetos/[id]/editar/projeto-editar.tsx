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
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
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
import { Projeto, Cliente, Propriedade } from '@/lib/crm-utils'
import { formatarData, formatarMoeda, coresStatus } from '@/lib/formatters'
import { projetosApi, clientesApi, propriedadesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

// Interface estendida para incluir campos adicionais que não existem no tipo Projeto
interface ProjetoExtendido extends Projeto {
  taxaJuros?: string;
  prazo?: string;
  carencia?: string;
}

function ProjetoEditarConteudo({ projetoId }: { projetoId: string }) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [projeto, setProjeto] = useState<ProjetoExtendido | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [propriedades, setPropriedades] = useState<Propriedade[]>([])
  
  // Formulário
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [clienteId, setClienteId] = useState<string | undefined>(undefined)
  const [propriedadeId, setPropriedadeId] = useState<string | undefined>(undefined)
  const [linhaCredito, setLinhaCredito] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [status, setStatus] = useState<'Em Elaboração' | 'Em Análise' | 'Aprovado' | 'Contratado' | 'Cancelado'>('Em Análise')
  const [taxaJuros, setTaxaJuros] = useState('')
  const [prazo, setPrazo] = useState('')
  const [carencia, setCarencia] = useState('')
  const [dataPrevisaoTermino, setDataPrevisaoTermino] = useState('')
  const [dataPrevisaoTerminoDate, setDataPrevisaoTerminoDate] = useState<Date | undefined>(undefined)
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        
        // Carregar projeto
        const projetoCarregado = await projetosApi.buscarProjetoPorId(projetoId)
        if (!projetoCarregado) {
          toast({
            title: 'Erro',
            description: 'Projeto não encontrado',
            variant: 'destructive',
          })
          router.push('/projetos')
          return
        }
        
        // Tratar como ProjetoExtendido para adicionar campos adicionais
        const projetoExtendido: ProjetoExtendido = {
          ...projetoCarregado,
          taxaJuros: '0',
          prazo: '0',
          carencia: '0'
        }
        
        setProjeto(projetoExtendido)
        
        // Preencher formulário com dados do projeto
        setTitulo(projetoExtendido.titulo)
        setDescricao(projetoExtendido.descricao || '')
        
        // Garantir que os IDs nunca sejam strings vazias
        setClienteId(projetoExtendido.clienteId || undefined)
        setPropriedadeId(projetoExtendido.propriedadeId || undefined)
        setLinhaCredito(projetoExtendido.linhaCredito)
        
        // Formatar o valor como moeda brasileira
        const valorFormatado = projetoExtendido.valorTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
        setValorTotal(valorFormatado)
        
        setStatus(projetoExtendido.status)
        
        // Definir valores padrão para campos adicionais
        setTaxaJuros(projetoExtendido.taxaJuros || '0')
        setPrazo(projetoExtendido.prazo || '0')
        setCarencia(projetoExtendido.carencia || '0')
        
        // Formatar a data de previsão de término se existir
        if (projetoExtendido.dataPrevisaoTermino) {
          const data = new Date(projetoExtendido.dataPrevisaoTermino)
          setDataPrevisaoTerminoDate(data)
          
          // Formato para exibição: DD/MM/YYYY
          const dia = String(data.getDate()).padStart(2, '0')
          const mes = String(data.getMonth() + 1).padStart(2, '0')
          const ano = data.getFullYear()
          setDataPrevisaoTermino(`${dia}/${mes}/${ano}`)
        }
        
        // Carregar clientes
        const listaClientes = await clientesApi.listarClientes()
        setClientes(listaClientes)
        
        // Carregar propriedades
        const listaPropriedades = await propriedadesApi.listarPropriedades()
        setPropriedades(listaPropriedades)
        
        setCarregando(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do projeto',
          variant: 'destructive',
        })
      }
    }

    carregarDados()
  }, [projetoId, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    switch (name) {
      case 'titulo':
        setTitulo(value)
        break
      case 'descricao':
        setDescricao(value)
        break
      case 'taxaJuros':
        setTaxaJuros(value)
        break
      case 'prazo':
        setPrazo(value)
        break
      case 'carencia':
        setCarencia(value)
        break
    }
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
    
    // Atualiza o estado
    setValorTotal(valorFormatado)
  }
  
  // Função para converter valor formatado (R$ 0,00) para número ao enviar
  const converterValorParaNumero = (valorFormatado: string) => {
    // Remove o símbolo da moeda e outros caracteres não numéricos, mantendo o ponto decimal
    const valorLimpo = valorFormatado.replace(/[^\d,]/g, '').replace(',', '.')
    
    // Converte para número
    return parseFloat(valorLimpo) || 0
  }
  
  // Função para lidar com a mudança de data no DatePicker
  const handleDataPrevisaoTerminoChange = (date: Date | undefined) => {
    setDataPrevisaoTerminoDate(date)
    
    if (date) {
      // Formato para exibição: DD/MM/YYYY
      const dataFormatada = format(date, 'dd/MM/yyyy')
      // Formato para armazenamento: YYYY-MM-DD
      const dataISO = format(date, 'yyyy-MM-dd')
      
      setDataPrevisaoTermino(dataISO)
    } else {
      setDataPrevisaoTermino('')
    }
  }
  
  // A função converterDataParaISO não é mais necessária, pois o DatePicker já fornece a data no formato correto
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!projeto) return
    
    // Validação básica
    if (!titulo || !linhaCredito || !valorTotal || !status || !taxaJuros || !prazo || !clienteId || !dataPrevisaoTermino) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios',
        variant: 'destructive',
      })
      return
    }
    
    // Verificar se a data foi selecionada
    if (!dataPrevisaoTerminoDate) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione uma data de previsão de término',
        variant: 'destructive',
      })
      return
    }
    
    setSalvando(true)
    
    try {
      // Converter o valor formatado para número
      const valorNumerico = converterValorParaNumero(valorTotal)
      
      // Garantir que os IDs nunca sejam undefined
      const clienteIdFinal = clienteId || projeto.clienteId
      const propriedadeIdFinal = propriedadeId || projeto.propriedadeId
      
      // Criar objeto com os dados básicos do projeto (sem campos adicionais)
      const projetoAtualizado: Projeto = {
        id: projeto.id,
        titulo,
        descricao,
        clienteId: clienteIdFinal,
        propriedadeId: propriedadeIdFinal,
        linhaCredito,
        valorTotal: valorNumerico,
        status,
        documentos: projeto.documentos,
        dataCriacao: projeto.dataCriacao,
        dataAtualizacao: new Date().toISOString(),
        dataPrevisaoTermino: dataPrevisaoTermino
      }
      
      await projetosApi.atualizarProjeto(projetoId, projetoAtualizado)
      toast({
        title: 'Projeto atualizado',
        description: 'Os dados do projeto foram atualizados com sucesso',
      })
      
      router.push(`/projetos/${projetoId}`)
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o projeto',
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/projetos/${projetoId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Editar Projeto</h1>
        </div>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações do Projeto</CardTitle>
            <CardDescription>
              Edite os detalhes do projeto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Seção 1: Informações Básicas */}
            <div>
              <h3 className="text-base font-medium mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                Informações Básicas
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo" className="flex items-center">
                    Título <span className="text-destructive ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <FileText className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="titulo"
                      name="titulo"
                      value={titulo}
                      onChange={handleChange}
                      placeholder="Título do projeto"
                      className="pl-8 focus-visible:ring-primary"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={descricao}
                    onChange={handleChange}
                    placeholder="Descrição do projeto"
                    rows={3}
                    className="focus-visible:ring-primary"
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
                  <Label htmlFor="cliente" className="flex items-center">
                    Cliente <span className="text-destructive ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <Select 
                      value={clienteId} 
                      onValueChange={setClienteId}
                      defaultValue={clientes.length > 0 ? clientes[0].id : undefined}
                    >
                      <SelectTrigger id="cliente" className="pl-8 focus-visible:ring-primary">
                        <User className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <SelectValue placeholder="Selecione um cliente" />
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
                  <Label htmlFor="propriedade" className="flex items-center">
                    Propriedade
                  </Label>
                  <div className="relative">
                    <Select 
                      value={propriedadeId} 
                      onValueChange={setPropriedadeId}
                      defaultValue={propriedades.length > 0 ? propriedades[0].id : undefined}
                    >
                      <SelectTrigger id="propriedade" className="pl-8 focus-visible:ring-primary">
                        <Building2 className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <SelectValue placeholder="Selecione uma propriedade" />
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
                      value={valorTotal}
                      onChange={handleValorChange}
                      placeholder="R$ 0,00"
                      className="pl-8 focus-visible:ring-primary"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linhaCredito" className="flex items-center">
                    Linha de Crédito <span className="text-destructive ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <CreditCard className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Select 
                      value={linhaCredito || undefined} 
                      onValueChange={setLinhaCredito}
                      defaultValue="PRONAF"
                    >
                      <SelectTrigger id="linhaCredito" className="pl-8 focus-visible:ring-primary">
                        <SelectValue placeholder="Selecione a linha de crédito" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRONAF">PRONAF</SelectItem>
                        <SelectItem value="PRONAMP">PRONAMP</SelectItem>
                        <SelectItem value="INOVAGRO">INOVAGRO</SelectItem>
                        <SelectItem value="ABC+">ABC+</SelectItem>
                        <SelectItem value="MODERFROTA">MODERFROTA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="taxaJuros" className="flex items-center">
                    Taxa de Juros (% ao ano)
                  </Label>
                  <div className="relative">
                    <DollarSign className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="taxaJuros"
                      name="taxaJuros"
                      value={taxaJuros}
                      onChange={handleChange}
                      placeholder="Taxa de juros"
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-8 focus-visible:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prazo" className="flex items-center">
                      Prazo (anos)
                    </Label>
                    <Input
                      id="prazo"
                      name="prazo"
                      value={prazo}
                      onChange={handleChange}
                      placeholder="Prazo em anos"
                      type="number"
                      min="1"
                      className="focus-visible:ring-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="carencia" className="flex items-center">
                      Carência (meses)
                    </Label>
                    <Input
                      id="carencia"
                      name="carencia"
                      value={carencia}
                      onChange={handleChange}
                      placeholder="Carência em meses"
                      type="number"
                      min="0"
                      className="focus-visible:ring-primary"
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
                  <Label htmlFor="status" className="flex items-center">
                    Status
                  </Label>
                  <div className="space-y-3">
                    <Select 
                      value={status} 
                      onValueChange={(value) => setStatus(value as any)}
                      defaultValue="Em Elaboração"
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
                        <span>{status === 'Em Elaboração' ? '20%' : 
                               status === 'Em Análise' ? '40%' : 
                               status === 'Aprovado' ? '60%' : 
                               status === 'Contratado' ? '100%' : 
                               status === 'Cancelado' ? '0%' : '0%'}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: status === 'Em Elaboração' ? '20%' : 
                                         status === 'Em Análise' ? '40%' : 
                                         status === 'Aprovado' ? '60%' : 
                                         status === 'Contratado' ? '100%' : 
                                         status === 'Cancelado' ? '0%' : '0%' }}
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
              <Link href={`/projetos/${projetoId}`}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={salvando} className="flex items-center">
              {salvando ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default ProjetoEditarConteudo
