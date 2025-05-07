'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { MaskedInput } from '@/components/ui/masked-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Users, 
  MapPin, 
  Calendar, 
  FileText, 
  Info, 
  CheckCircle, 
  MessageSquare, 
  Save, 
  RefreshCw, 
  ChevronRight, 
  User, 
  Clock, 
  Loader2, 
  Eye
} from 'lucide-react'
import { Cliente, Interacao } from '@/lib/crm-utils'
import { clientesApi, interacoesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

function NovaInteracaoConteudo({ clienteId }: { clienteId: string }) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  
  // Formulário
  const [tipo, setTipo] = useState<'Ligação' | 'Email' | 'Reunião' | 'Visita' | 'Outro'>('Ligação')
  const [assunto, setAssunto] = useState('')
  const [descricao, setDescricao] = useState('')
  
  // Inicializar a data no formato brasileiro (DD/MM/AAAA)
  const dataAtual = new Date()
  const dia = dataAtual.getDate().toString().padStart(2, '0')
  const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0')
  const ano = dataAtual.getFullYear()
  const [data, setData] = useState(`${dia}/${mes}/${ano}`)
  
  const [status, setStatus] = useState<'Pendente' | 'Em andamento' | 'Concluída'>('Pendente')
  const [observacoes, setObservacoes] = useState('')
  const [responsavel, setResponsavel] = useState('Usuário Atual')
  
  // Calcular progresso do formulário
  const calcularProgresso = () => {
    let campos = 0
    let preenchidos = 0
    
    // Campos obrigatórios
    if (tipo) preenchidos++
    campos++
    
    if (data) preenchidos++
    campos++
    
    if (assunto) preenchidos++
    campos++
    
    if (descricao) preenchidos++
    campos++
    
    if (status) preenchidos++
    campos++
    
    if (responsavel) preenchidos++
    campos++
    
    return Math.round((preenchidos / campos) * 100)
  }
  
  const progressoFormulario = calcularProgresso()
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar cliente
        const cliente = await clientesApi.buscarClientePorId(clienteId)
        if (!cliente) {
          toast({
            title: 'Erro',
            description: 'Cliente não encontrado',
            variant: 'destructive',
          })
          router.push('/clientes')
          return
        }
        
        setCliente(cliente)
        setCarregando(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do cliente',
          variant: 'destructive',
        })
      }
    }

    carregarDados()
  }, [clienteId, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    switch (name) {
      case 'assunto':
        setAssunto(value)
        break
      case 'descricao':
        setDescricao(value)
        break
      case 'data':
        setData(value)
        break
      case 'observacoes':
        setObservacoes(value)
        break
      case 'responsavel':
        setResponsavel(value)
        break
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!cliente) return
    
    try {
      setSalvando(true)
      
      // Validação básica
      if (!assunto || !descricao || !data || !responsavel) {
        toast({
          title: 'Erro',
          description: 'Preencha todos os campos obrigatórios',
          variant: 'destructive',
        })
        setSalvando(false)
        return
      }
      
      // Converter a data para ISO
      const dataISO = converterDataParaISO(data);
      
      // Log para debug
      console.log('Data original:', data);
      console.log('Data convertida para ISO:', dataISO);
      
      // Criar nova interação
      const novaInteracao: Omit<Interacao, 'id'> = {
        clienteId,
        tipo,
        assunto,
        descricao,
        data: dataISO,
        responsavel,
        status,
        observacoes: observacoes || undefined,
        dataCriacao: dataISO, // Usar a data informada pelo usuário
        dataAtualizacao: dataISO // Usar a data informada pelo usuário
      }
      
      console.log('Nova interação a ser criada:', novaInteracao);
      
      const interacaoCriada = await interacoesApi.criarInteracao(novaInteracao)
      toast({
        title: 'Interação registrada',
        description: 'A interação foi registrada com sucesso',
      })
      
      router.push(`/clientes/${clienteId}/interacoes`)
    } catch (error) {
      console.error('Erro ao salvar interação:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a interação',
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }

  // Função para converter data no formato DD/MM/AAAA para ISO
  function converterDataParaISO(data: string) {
    // Verificar se a data está no formato brasileiro (DD/MM/AAAA)
    if (!data || !data.includes('/')) {
      console.error('Formato de data inválido:', data);
      return new Date().toISOString(); // Retorna a data atual como fallback
    }

    try {
      const partes = data.split('/');
      if (partes.length !== 3) {
        console.error('Formato de data inválido:', data);
        return new Date().toISOString();
      }

      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1; // Mês em JavaScript é 0-indexed
      const ano = parseInt(partes[2], 10);
      
      // Verificar se algum dos valores é NaN antes de fazer as comparações
      if (isNaN(dia) || isNaN(mes) || isNaN(ano)) {
        console.error('Componentes de data inválidos (NaN):', { dia, mes, ano });
        return new Date().toISOString();
      }
      
      // Validar se os componentes da data estão dentro dos limites válidos
      if (dia < 1 || dia > 31 || mes < 0 || mes > 11 || ano < 1000) {
        console.error('Componentes de data fora dos limites válidos:', { dia, mes, ano });
        return new Date().toISOString();
      }
      
      // Criar uma data no fuso horário local
      const dataObj = new Date(ano, mes, dia);
      
      // Verificar se a data é válida
      if (isNaN(dataObj.getTime())) {
        console.error('Data inválida após conversão:', dataObj);
        return new Date().toISOString();
      }
      
      // Retornar no formato ISO
      return dataObj.toISOString();
    } catch (error) {
      console.error('Erro ao converter data para ISO:', error);
      return new Date().toISOString();
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-xl font-medium">Cliente não encontrado</h2>
        <Button asChild>
          <Link href="/clientes">Voltar para clientes</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho e breadcrumbs */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/clientes" className="hover:text-primary">Clientes</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href={`/clientes/${clienteId}`} className="hover:text-primary">{cliente.nome}</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href={`/clientes/${clienteId}/interacoes`} className="hover:text-primary">Interações</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="font-medium text-foreground">Nova</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Registrar Interação</h1>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/clientes/${clienteId}/interacoes`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Informações do cliente */}
      <Card className="border-primary/20">
        <CardContent className="p-3 flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
            {cliente.nome.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-sm">{cliente.nome}</h3>
            <div className="flex items-center text-xs text-muted-foreground">
              {cliente.telefone && (
                <div className="flex items-center mr-3">
                  <Phone className="h-3 w-3 mr-1" />
                  <span>{cliente.telefone}</span>
                </div>
              )}
              {cliente.email && (
                <div className="flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  <span>{cliente.email}</span>
                </div>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="h-8">
            <Link href={`/clientes/${clienteId}`}>
              <Eye className="h-3.5 w-3.5 mr-1" />
              Ver Cliente
            </Link>
          </Button>
        </CardContent>
      </Card>
      
      {/* Barra de progresso */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium">Progresso do formulário</span>
          <span className="text-xs font-medium">{progressoFormulario}%</span>
        </div>
        <Progress value={progressoFormulario} className="h-1.5" />
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Informações básicas */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center">
              <Info className="h-4 w-4 mr-2 text-primary" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tipo" className="text-xs">Tipo de Interação</Label>
                <Select 
                  value={tipo} 
                  onValueChange={(value) => setTipo(value as any)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ligação">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        Ligação
                      </div>
                    </SelectItem>
                    <SelectItem value="Email">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </div>
                    </SelectItem>
                    <SelectItem value="Reunião">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Reunião
                      </div>
                    </SelectItem>
                    <SelectItem value="Visita">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Visita
                      </div>
                    </SelectItem>
                    <SelectItem value="Outro">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Outro
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="data" className="text-xs">Data</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <MaskedInput 
                    id="data"
                    name="data"
                    mask="data"
                    value={data}
                    onChange={handleChange}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="assunto" className="text-xs">Assunto</Label>
              <Input 
                id="assunto"
                name="assunto"
                value={assunto}
                onChange={handleChange}
                placeholder="Assunto da interação"
                className="h-9"
              />
            </div>
            
            {/* Sugestões de assuntos comuns */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Sugestões de assunto:</p>
              <div className="flex flex-wrap gap-1">
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="h-6 text-xs" 
                  onClick={() => setAssunto("Apresentação de proposta")}
                >
                  Apresentação de proposta
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="h-6 text-xs" 
                  onClick={() => setAssunto("Esclarecimento de dúvidas")}
                >
                  Esclarecimento de dúvidas
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="h-6 text-xs" 
                  onClick={() => setAssunto("Negociação de contrato")}
                >
                  Negociação de contrato
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="h-6 text-xs" 
                  onClick={() => setAssunto("Acompanhamento de projeto")}
                >
                  Acompanhamento de projeto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Detalhes */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center">
              <FileText className="h-4 w-4 mr-2 text-primary" />
              Detalhes da Interação
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="flex justify-end mb-2">
              <Select 
                onValueChange={(value) => {
                  if (value === "contato-inicial") {
                    setDescricao("Realizei contato telefônico para apresentação dos serviços de crédito rural. O cliente demonstrou interesse em...")
                  } else if (value === "proposta") {
                    setDescricao("Reunião para apresentação da proposta de financiamento. Foram discutidos os seguintes pontos:\n1. Valor do financiamento\n2. Prazo de pagamento\n3. Taxa de juros\n4. Garantias necessárias")
                  } else if (value === "visita") {
                    setDescricao("Visita técnica à propriedade para avaliação e coleta de dados para elaboração do projeto. Foram verificados os seguintes aspectos:\n1. Área total\n2. Infraestrutura existente\n3. Recursos hídricos\n4. Condições do solo")
                  }
                }}
              >
                <SelectTrigger className="w-[180px] h-7 text-xs">
                  <SelectValue placeholder="Usar modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contato-inicial">Contato inicial</SelectItem>
                  <SelectItem value="proposta">Apresentação de proposta</SelectItem>
                  <SelectItem value="visita">Visita técnica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="descricao" className="text-xs">Descrição</Label>
              <Textarea 
                id="descricao"
                name="descricao"
                value={descricao}
                onChange={handleChange}
                placeholder="Descreva os detalhes da interação"
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Status e Responsável */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-primary" />
              Status e Responsável
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs">Status</Label>
                <Select 
                  value={status} 
                  onValueChange={(value) => setStatus(value as any)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                        Pendente
                      </div>
                    </SelectItem>
                    <SelectItem value="Em andamento">
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 text-blue-500" />
                        Em andamento
                      </div>
                    </SelectItem>
                    <SelectItem value="Concluída">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Concluída
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="responsavel" className="text-xs">Responsável</Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="responsavel"
                    name="responsavel"
                    value={responsavel}
                    onChange={handleChange}
                    placeholder="Nome do responsável"
                    className="pl-8 h-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Observações */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 text-primary" />
              Observações (opcional)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <Textarea 
              id="observacoes"
              name="observacoes"
              value={observacoes}
              onChange={handleChange}
              placeholder="Observações adicionais"
              className="min-h-[80px]"
            />
          </CardContent>
        </Card>
        
        {/* Botões de ação */}
        <div className="flex justify-between mt-6">
          <Button 
            type="button"
            variant="outline" 
            asChild
            className="gap-2"
          >
            <Link href={`/clientes/${clienteId}/interacoes`}>
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </Link>
          </Button>
          
          <div className="flex gap-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => {
                setTipo('Ligação')
                setAssunto('')
                setDescricao('')
                setStatus('Pendente')
                setObservacoes('')
              }}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Limpar
            </Button>
            
            <Button 
              type="submit" 
              disabled={salvando || progressoFormulario < 50}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {salvando ? 'Salvando...' : 'Salvar Interação'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default NovaInteracaoConteudo
