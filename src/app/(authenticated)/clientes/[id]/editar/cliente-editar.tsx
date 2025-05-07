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
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Save, User, Mail, Phone, CreditCard, MapPin, Building, Calendar, CheckCircle } from 'lucide-react'
import { Cliente } from '@/lib/crm-utils'
import { formatarData } from '@/lib/formatters'
import { clientesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { DatePicker } from '@/components/ui/date-picker'
import { cn } from '@/lib/utils'
import { format, parse } from 'date-fns'

// Componente cliente que implementa a lógica com hooks
export default function ClienteEditarConteudo({ clienteId }: { clienteId: string }) {
  const router = useRouter()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    cpfCnpj: '',
    telefone: '',
    email: '',
    perfil: '' as 'pequeno' | 'medio' | 'grande',
    dataNascimento: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    tipo: '' as 'PF' | 'PJ'
  })
  
  // Estado para o DatePicker
  const [dataNascimentoDate, setDataNascimentoDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    const carregarCliente = async () => {
      try {
        setCarregando(true)
        const dadosCliente = await clientesApi.buscarClientePorId(clienteId)
        
        if (!dadosCliente) {
          toast({
            title: 'Erro',
            description: 'Cliente não encontrado',
            variant: 'destructive',
          })
          router.push('/clientes')
          return
        }
        
        setCliente(dadosCliente)
        setFormData({
          nome: dadosCliente.nome,
          cpfCnpj: dadosCliente.cpfCnpj,
          telefone: dadosCliente.telefone,
          email: dadosCliente.email,
          perfil: dadosCliente.perfil as 'pequeno' | 'medio' | 'grande',
          dataNascimento: dadosCliente.dataNascimento || '',
          endereco: dadosCliente.endereco || '',
          cidade: dadosCliente.cidade || '',
          estado: dadosCliente.estado || '',
          cep: dadosCliente.cep || '',
          tipo: dadosCliente.tipo as 'PF' | 'PJ'
        })
        
        // Configurar a data para o DatePicker se existir
        if (dadosCliente.dataNascimento) {
          try {
            // Tenta converter a string de data para um objeto Date
            const dateParts = dadosCliente.dataNascimento.split('-');
            if (dateParts.length === 3) {
              // Se estiver no formato ISO (YYYY-MM-DD)
              const year = parseInt(dateParts[0], 10);
              const month = parseInt(dateParts[1], 10) - 1; // Mês em JS é 0-indexed
              const day = parseInt(dateParts[2], 10);
              const date = new Date(year, month, day);
              if (!isNaN(date.getTime())) {
                setDataNascimentoDate(date);
              }
            }
          } catch (error) {
            console.error('Erro ao converter data de nascimento:', error);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar cliente:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do cliente',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarCliente()
  }, [clienteId, router])
  
  // Função para formatar a data ISO para o formato DD/MM/AAAA
  const formatarDataParaInput = (dataISO: string): string => {
    try {
      const data = new Date(dataISO);
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      return '';
    }
  }

  // Função para converter o formato DD/MM/AAAA para ISO
  const converterDataParaISO = (dataFormatada: string): string | undefined => {
    if (!dataFormatada || dataFormatada.length !== 10) return undefined;
    
    const [dia, mes, ano] = dataFormatada.split('/').map(Number);
    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return undefined;
    
    // Validação básica de data
    if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || ano < 1900 || ano > 2100) return undefined;
    
    const data = new Date(ano, mes - 1, dia);
    return data.toISOString();
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Aplicar máscara de data para o campo dataNascimento
    if (name === 'dataNascimento') {
      const numerosFiltrados = value.replace(/\D/g, '')
      
      if (numerosFiltrados.length <= 2) {
        setFormData(prev => ({
          ...prev,
          dataNascimento: numerosFiltrados
        }))
      } else if (numerosFiltrados.length <= 4) {
        setFormData(prev => ({
          ...prev,
          dataNascimento: `${numerosFiltrados.slice(0, 2)}/${numerosFiltrados.slice(2)}`
        }))
      } else if (numerosFiltrados.length <= 8) {
        setFormData(prev => ({
          ...prev,
          dataNascimento: `${numerosFiltrados.slice(0, 2)}/${numerosFiltrados.slice(2, 4)}/${numerosFiltrados.slice(4)}`
        }))
      }
      return
    }
    
    // Para os outros campos, atualiza normalmente
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!cliente) return
    
    try {
      setSalvando(true)
      
      // Validação básica
      if (!formData.nome || !formData.cpfCnpj || !formData.telefone || !formData.email || !formData.perfil) {
        toast({
          title: 'Erro',
          description: 'Preencha todos os campos obrigatórios',
          variant: 'destructive',
        })
        return
      }
      
      // Atualizar cliente
      const clienteAtualizado = await clientesApi.atualizarCliente(cliente.id, {
        ...cliente,
        nome: formData.nome,
        cpfCnpj: formData.cpfCnpj,
        telefone: formData.telefone,
        email: formData.email,
        perfil: formData.perfil,
        dataNascimento: formData.dataNascimento, // Já está no formato correto (YYYY-MM-DD)
        endereco: formData.endereco,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep,
        tipo: formData.tipo
      })
      
      toast({
        title: 'Cliente atualizado',
        description: 'Os dados do cliente foram atualizados com sucesso',
      })
      
      // Redirecionar para a página de detalhes
      router.push(`/clientes/${cliente.id}`)
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar os dados do cliente',
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

  if (!cliente) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Cliente não encontrado</p>
            <Button asChild className="mt-4">
              <Link href="/clientes">Voltar para lista</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild className="h-8 w-8 rounded-full">
            <Link href={`/clientes/${cliente.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Cliente</h1>
            <p className="text-muted-foreground text-sm">Atualize as informações do cliente</p>
          </div>
        </div>
      </div>

      <Card className="shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Informações do Cliente</CardTitle>
            </div>
            <CardDescription>
              Atualize as informações cadastrais do cliente
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            {/* Seção 1: Informações Básicas */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2 text-primary" />
                  Informações Básicas
                </h3>
                <Separator className="mb-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="font-medium">
                      Nome <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                        className="pl-9"
                        placeholder="Nome completo"
                      />
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="pl-9"
                        placeholder="email@exemplo.com"
                      />
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="font-medium">
                      Telefone <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="telefone"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        required
                        className="pl-9"
                        placeholder="(00) 00000-0000"
                      />
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpfCnpj" className="font-medium">
                      CPF/CNPJ <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="cpfCnpj"
                        name="cpfCnpj"
                        value={formData.cpfCnpj}
                        onChange={handleChange}
                        required
                        className="pl-9"
                        placeholder="CPF ou CNPJ"
                      />
                      <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Seção 2: Tipo de Cliente e Perfil */}
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Building className="h-4 w-4 mr-2 text-primary" />
                  Classificação
                </h3>
                <Separator className="mb-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="font-medium">
                      Tipo de Cliente <span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup 
                      value={formData.tipo} 
                      onValueChange={(value) => handleSelectChange(value, 'tipo')}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem 
                          value="PF" 
                          id="pf" 
                          className="peer sr-only" 
                        />
                        <Label
                          htmlFor="pf"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <User className="mb-3 h-6 w-6" />
                          <span className="text-sm font-medium">Pessoa Física</span>
                        </Label>
                      </div>
                      
                      <div>
                        <RadioGroupItem 
                          value="PJ" 
                          id="pj" 
                          className="peer sr-only" 
                        />
                        <Label
                          htmlFor="pj"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <Building className="mb-3 h-6 w-6" />
                          <span className="text-sm font-medium">Pessoa Jurídica</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="perfil" className="font-medium">
                      Perfil <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.perfil}
                      onValueChange={(value) => handleSelectChange(value, 'perfil')}
                    >
                      <SelectTrigger id="perfil" className="w-full">
                        <SelectValue placeholder="Selecione o perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pequeno">
                          <div className="flex items-center">
                            <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                            Pequeno
                          </div>
                        </SelectItem>
                        <SelectItem value="medio">
                          <div className="flex items-center">
                            <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                            Médio
                          </div>
                        </SelectItem>
                        <SelectItem value="grande">
                          <div className="flex items-center">
                            <span className="h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
                            Grande
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dataNascimento" className="font-medium">Data de Nascimento</Label>
                    <DatePicker
                      date={dataNascimentoDate}
                      setDate={(date) => {
                        setDataNascimentoDate(date);
                        if (date) {
                          // Formato para armazenamento: YYYY-MM-DD
                          setFormData(prev => ({
                            ...prev,
                            dataNascimento: format(date, 'yyyy-MM-dd')
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            dataNascimento: ''
                          }));
                        }
                      }}
                      placeholder="Selecione a data de nascimento"
                    />
                  </div>
                </div>
              </div>
              
              {/* Seção 3: Endereço */}
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  Endereço
                </h3>
                <Separator className="mb-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="endereco" className="font-medium">Endereço</Label>
                    <div className="relative">
                      <Input
                        id="endereco"
                        name="endereco"
                        value={formData.endereco}
                        onChange={handleChange}
                        className="pl-9"
                        placeholder="Endereço completo"
                      />
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cidade" className="font-medium">Cidade</Label>
                    <Input
                      id="cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      placeholder="Cidade"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="estado" className="font-medium">Estado</Label>
                    <Input
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      placeholder="Estado"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cep" className="font-medium">CEP</Label>
                    <Input
                      id="cep"
                      name="cep"
                      value={formData.cep}
                      onChange={handleChange}
                      placeholder="CEP"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" asChild>
              <Link href={`/clientes/${cliente.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={salvando} className="gap-2">
              {salvando ? 'Salvando...' : <><Save className="h-4 w-4" /> Salvar Alterações</>}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
