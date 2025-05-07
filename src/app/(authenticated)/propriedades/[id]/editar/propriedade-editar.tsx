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
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  Ruler, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Home,
  Map,
  Building,
  FileText
} from 'lucide-react'
import { Cliente, Propriedade } from '@/lib/crm-utils'
import { propriedadesApi, clientesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

// Lista de estados brasileiros em ordem alfabética
const estadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

// Função para classificar o tamanho da propriedade
const classificarTamanho = (area: number) => {
  if (area < 20) return { texto: 'Pequena', cor: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80' }
  if (area < 100) return { texto: 'Média', cor: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80' }
  return { texto: 'Grande', cor: 'bg-green-100 text-green-800 hover:bg-green-100/80' }
}

export default function PropriedadeEditarConteudo({ propriedadeId }: { propriedadeId: string }) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [mostrarAvancado, setMostrarAvancado] = useState(false)
  const [formData, setFormData] = useState<Partial<Propriedade>>({
    nome: '',
    clienteId: '',
    endereco: '',
    area: 0,
    municipio: '',
    estado: '',
    coordenadas: {
      latitude: 0,
      longitude: 0
    }
  })

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        
        // Carregar propriedade
        const propriedade = await propriedadesApi.buscarPropriedadePorId(propriedadeId)
        if (!propriedade) {
          toast({
            title: 'Erro',
            description: 'Propriedade não encontrada',
            variant: 'destructive',
          })
          router.push('/propriedades')
          return
        }
        
        // Carregar lista de clientes para o select
        const listaClientes = await clientesApi.listarClientes()
        setClientes(listaClientes)
        
        // Preencher o formulário com os dados da propriedade
        setFormData({
          nome: propriedade.nome,
          clienteId: propriedade.clienteId,
          endereco: propriedade.endereco,
          area: propriedade.area,
          municipio: propriedade.municipio,
          estado: propriedade.estado,
          coordenadas: propriedade.coordenadas || {
            latitude: 0,
            longitude: 0
          }
        })
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados da propriedade.',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarDados()
  }, [propriedadeId, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'area') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      })
    } else if (name === 'latitude' || name === 'longitude') {
      // Permitir valores vazios ou negativos para coordenadas
      const numeroProcessado = value === '' ? 0 : parseFloat(value)
      
      setFormData({
        ...formData,
        coordenadas: {
          latitude: name === 'latitude' ? numeroProcessado : formData.coordenadas?.latitude || 0,
          longitude: name === 'longitude' ? numeroProcessado : formData.coordenadas?.longitude || 0
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome || !formData.clienteId || !formData.endereco || !formData.municipio || !formData.estado) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }
    
    try {
      setEnviando(true)
      
      await propriedadesApi.atualizarPropriedade(propriedadeId, formData)
      
      toast({
        title: 'Propriedade atualizada',
        description: 'A propriedade foi atualizada com sucesso.',
      })
      
      router.push(`/propriedades/${propriedadeId}`)
    } catch (error) {
      console.error('Erro ao atualizar propriedade:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a propriedade.',
        variant: 'destructive',
      })
    } finally {
      setEnviando(false)
    }
  }

  // Obter a classificação de tamanho para o preview
  const tamanhoPropriedade = classificarTamanho(formData.area || 0)
  
  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/propriedades/${propriedadeId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight">Editar Propriedade</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card de Informações Básicas */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                <CardTitle className="text-lg">Informações Básicas</CardTitle>
              </div>
              <CardDescription>
                Dados principais da propriedade rural
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="nome" className="flex items-center">
                      <Home className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      Nome da Propriedade *
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p className="w-[200px]">Nome pelo qual a propriedade é conhecida</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Nome da propriedade"
                    required
                    className="border-input"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="clienteId" className="flex items-center">
                      <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      Proprietário *
                    </Label>
                  </div>
                  <Select
                    value={formData.clienteId}
                    onValueChange={(value) => handleSelectChange('clienteId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o proprietário" />
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
                <div className="flex items-center">
                  <Label htmlFor="endereco" className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    Endereço *
                  </Label>
                </div>
                <Input
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Endereço completo"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="municipio" className="flex items-center">
                    <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    Município *
                  </Label>
                  <Input
                    id="municipio"
                    name="municipio"
                    value={formData.municipio}
                    onChange={handleChange}
                    placeholder="Município"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">
                    Estado *
                  </Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => handleSelectChange('estado', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosBrasileiros.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="area" className="flex items-center">
                      <Ruler className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      Área (hectares) *
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p className="w-[200px]">
                            Pequena: até 20 ha<br />
                            Média: 20 a 100 ha<br />
                            Grande: mais de 100 ha
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="relative">
                    <Input
                      id="area"
                      name="area"
                      type="number"
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="Área em hectares"
                      className="pr-8"
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">ha</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Preview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <Map className="h-5 w-5 mr-2 text-primary" />
                <CardTitle className="text-lg">Preview</CardTitle>
              </div>
              <CardDescription>
                Visualização da propriedade
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {formData.nome ? (
                  <div className="rounded-md border p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{formData.nome || 'Nome da Propriedade'}</h3>
                      {formData.area !== undefined && formData.area > 0 && (
                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tamanhoPropriedade.cor}`}>
                          {tamanhoPropriedade.texto}
                        </div>
                      )}
                    </div>
                    
                    {formData.endereco && (
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{formData.endereco}</span>
                      </div>
                    )}
                    
                    {(formData.municipio || formData.estado) && (
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {[formData.municipio, formData.estado].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {formData.area !== undefined && formData.area > 0 && (
                      <div className="flex items-center">
                        <Ruler className="h-4 w-4 mr-1.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {formData.area !== undefined ? formData.area.toLocaleString('pt-BR') : '0'} hectares
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-6">
                    <div className="text-center">
                      <Home className="h-8 w-8 mx-auto text-muted-foreground/60" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Preencha os dados para visualizar a propriedade
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção Avançada Colapsável */}
        <Collapsible
          open={mostrarAvancado}
          onOpenChange={setMostrarAvancado}
          className="border rounded-md"
        >
          <div className="flex items-center justify-between p-4">
            <h3 className="text-sm font-medium flex items-center">
              <Map className="h-4 w-4 mr-2 text-muted-foreground" />
              Informações Geográficas (opcional)
            </h3>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {mostrarAvancado ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="p-4 pt-0 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="latitude">
                      Latitude
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Coordenada geográfica norte-sul</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="text"
                    inputMode="decimal"
                    pattern="-?\d*\.?\d*"
                    value={formData.coordenadas?.latitude === 0 ? '' : formData.coordenadas?.latitude}
                    onChange={handleChange}
                    placeholder="Ex: -15.7801"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="longitude">
                      Longitude
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Coordenada geográfica leste-oeste</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="text"
                    inputMode="decimal"
                    pattern="-?\d*\.?\d*"
                    value={formData.coordenadas?.longitude === 0 ? '' : formData.coordenadas?.longitude}
                    onChange={handleChange}
                    placeholder="Ex: -47.9292"
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Botões de Ação Fixos */}
        <div className="sticky bottom-0 bg-background border-t p-4 flex justify-between items-center mt-6 -mx-4 rounded-b-md">
          <Button variant="outline" asChild>
            <Link href={`/propriedades/${propriedadeId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
          </Button>
          <Button type="submit" disabled={enviando}>
            {enviando ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
