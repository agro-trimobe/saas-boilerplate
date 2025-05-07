'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Separator } from "@/components/ui/separator"
import { DatePicker } from '@/components/ui/date-picker'
import { InputMask } from '@/components/ui/input-mask'
import { CardFormulario } from '@/components/ui/card-padrao'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { Cliente } from '@/lib/crm-utils'
import { clientesApi } from '@/lib/api'
import { 
  User, Mail, Phone, CreditCard, MapPin, Building, 
  BadgeCheck, Save, CalendarDays, Home, Map
} from 'lucide-react'

export function ClienteNovoForm() {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  
  // Formulário
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [tipoCliente, setTipoCliente] = useState<'PF' | 'PJ'>('PF')
  const [perfil, setPerfil] = useState<'pequeno' | 'medio' | 'grande'>('pequeno')
  const [dataNascimento, setDataNascimento] = useState('')
  const [dataNascimentoDate, setDataNascimentoDate] = useState<Date | undefined>(undefined)
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [cep, setCep] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // O campo dataNascimento agora é gerenciado pelo componente DatePicker
    if (name === 'dataNascimento') {
      return
    }
    
    // Para os outros campos, atualiza normalmente
    switch (name) {
      case 'nome':
        setNome(value)
        break
      case 'email':
        setEmail(value)
        break
      case 'telefone':
        setTelefone(value)
        break
      case 'cpfCnpj':
        setCpfCnpj(value)
        break
      case 'endereco':
        setEndereco(value)
        break
      case 'cidade':
        setCidade(value)
        break
      case 'estado':
        setEstado(value)
        break
      case 'cep':
        setCep(value)
        break
      default:
        break
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    switch (name) {
      case 'tipoCliente':
        setTipoCliente(value as 'PF' | 'PJ')
        break
      case 'perfil':
        setPerfil(value as 'pequeno' | 'medio' | 'grande')
        break
      default:
        break
    }
  }

  // Função para converter o formato DD/MM/AAAA para ISO
  const converterDataParaISO = (dataFormatada: string): string => {
    if (!dataFormatada || dataFormatada.length !== 10) return '';
    
    const [dia, mes, ano] = dataFormatada.split('/').map(Number);
    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return '';
    
    // Validação básica de data
    if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || ano < 1900 || ano > 2100) return '';
    
    const data = new Date(ano, mes - 1, dia);
    return data.toISOString();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)

    try {
      // Validação básica
      if (!nome || !email || !telefone || !cpfCnpj || !tipoCliente || !perfil) {
        toast({
          title: 'Erro',
          description: 'Preencha todos os campos obrigatórios',
          variant: 'destructive',
        })
        setSalvando(false)
        return
      }
      
      const novoCliente: Omit<Cliente, 'id'> = {
        nome,
        email,
        telefone,
        cpfCnpj,
        tipo: tipoCliente,
        perfil,
        dataNascimento: dataNascimento ? converterDataParaISO(dataNascimento) : '',
        endereco,
        cidade,
        estado,
        cep,
        dataCadastro: new Date().toISOString(),
      }
      
      await clientesApi.criarCliente(novoCliente)
      toast({
        title: 'Sucesso',
        description: 'Cliente cadastrado com sucesso',
      })
      router.push('/clientes')
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível cadastrar o cliente',
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardFormulario
        titulo="Informações do Cliente"
        descricao="Preencha as informações para cadastrar um novo cliente"
        icone={<User className="h-5 w-5" />}
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => router.push('/clientes')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando} className="bg-primary">
              {salvando ? (
                <span className="flex items-center space-x-2">
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  <span>Salvando...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Salvar</span>
                </span>
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Seção 1: Informações Básicas */}
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <BadgeCheck className="h-5 w-5 mr-2 text-primary" />
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
                    value={nome}
                    onChange={handleChange}
                    required
                    className="pl-9"
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
                    value={email}
                    onChange={handleChange}
                    required
                    className="pl-9"
                  />
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="font-medium">
                  Telefone <span className="text-destructive">*</span>
                </Label>
                <InputMask
                  id="telefone"
                  name="telefone"
                  mask="telefone"
                  value={telefone}
                  onChange={handleChange}
                  required
                  icon={<Phone className="h-4 w-4" />}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpfCnpj" className="font-medium">
                  CPF/CNPJ <span className="text-destructive">*</span>
                </Label>
                <InputMask
                  id="cpfCnpj"
                  name="cpfCnpj"
                  mask="cpfcnpj"
                  value={cpfCnpj}
                  onChange={handleChange}
                  required
                  icon={<CreditCard className="h-4 w-4" />}
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Tipo de Cliente e Perfil */}
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Building className="h-5 w-5 mr-2 text-primary" />
              Classificação
            </h3>
            <Separator className="mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="font-medium">
                  Tipo de Cliente <span className="text-destructive">*</span>
                </Label>
                <RadioGroup
                  value={tipoCliente}
                  onValueChange={(value) => handleSelectChange("tipoCliente", value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="PF" id="pf" className="peer sr-only" />
                    <Label
                      htmlFor="pf"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <User className="mb-3 h-6 w-6" />
                      <span className="text-sm font-medium">Pessoa Física</span>
                    </Label>
                  </div>

                  <div>
                    <RadioGroupItem value="PJ" id="pj" className="peer sr-only" />
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
                  value={perfil}
                  onValueChange={(value) => handleSelectChange("perfil", value)}
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
                <Label htmlFor="dataNascimento" className="font-medium">
                  Data de Nascimento
                </Label>
                <div className="relative">
                  <DatePicker
                    date={dataNascimentoDate}
                    setDate={(date) => {
                      setDataNascimentoDate(date);
                      if (date) {
                        // Formato para armazenamento: YYYY-MM-DD
                        setDataNascimento(format(date, "yyyy-MM-dd"));
                      } else {
                        setDataNascimento("");
                      }
                    }}
                    placeholder="Selecione a data de nascimento"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção 3: Endereço */}
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              Endereço
            </h3>
            <Separator className="mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco" className="font-medium">
                  Endereço
                </Label>
                <div className="relative">
                  <Input
                    id="endereco"
                    name="endereco"
                    value={endereco}
                    onChange={handleChange}
                    className="pl-9"
                  />
                  <Home className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade" className="font-medium">
                  Cidade
                </Label>
                <div className="relative">
                  <Input
                    id="cidade"
                    name="cidade"
                    value={cidade}
                    onChange={handleChange}
                    className="pl-9"
                  />
                  <Map className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado" className="font-medium">
                  Estado
                </Label>
                <Input
                  id="estado"
                  name="estado"
                  value={estado}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep" className="font-medium">
                  CEP
                </Label>
                <InputMask
                  id="cep"
                  name="cep"
                  mask="cep"
                  value={cep}
                  onChange={handleChange}
                  icon={<MapPin className="h-4 w-4" />}
                />
              </div>
            </div>
          </div>
        </div>
      </CardFormulario>
    </form>
  )
}
