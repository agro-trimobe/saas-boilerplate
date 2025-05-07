'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronRight, Home } from 'lucide-react'
import { Propriedade, Cliente } from '@/lib/crm-utils'
import { propriedadesApi, clientesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

// Componentes modulares
import { PropriedadeInfoBasica } from '@/components/propriedades/propriedade-info-basica'
import { PropriedadeEnderecoUnificado } from '@/components/propriedades/propriedade-endereco-unificado'
import { PropriedadeMapaVisualizacao } from '@/components/propriedades/propriedade-mapa-visualizacao'
import { PropriedadeActionsFooter } from '@/components/propriedades/propriedade-actions-footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function NovaPropriedadeConteudo() {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({})

  // Estado do formulário com valores iniciais
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
    const carregarClientes = async () => {
      try {
        setCarregando(true)
        const listaClientes = await clientesApi.listarClientes()
        setClientes(listaClientes)
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de clientes.',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }

    carregarClientes()
  }, [])

  // Lista de estados brasileiros válidos
  const estadosBrasileiros = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  // Validar um campo específico do formulário
  const validarCampo = (nome: string, valor: any): string => {
    if (['nome', 'endereco', 'municipio'].includes(nome) && (!valor || valor.trim() === '')) {
      return 'Este campo é obrigatório';
    }
    if (nome === 'clienteId' && (!valor || valor === '')) {
      return 'Selecione um proprietário';
    }
    if (nome === 'estado') {
      if (!valor || valor.trim() === '') {
        return 'Informe o estado';
      }
      if (valor.trim().length !== 2) {
        return 'Use a sigla do estado (2 letras)';
      }
      if (!estadosBrasileiros.includes(valor.trim().toUpperCase())) {
        return 'Estado inválido';
      }
    }
    if (nome === 'area') {
      if (!valor || valor <= 0) {
        return 'Informe uma área válida';
      }
    }
    return '';
  };

  // Atualizar campo e validar
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === 'area') {
      const areaValue = parseFloat(value) || 0;
      setFormData({
        ...formData,
        [name]: areaValue
      });

      // Validar após a atualização
      const erro = validarCampo(name, areaValue);
      setErrosValidacao(prev => ({ ...prev, [name]: erro }));
    } else {
      setFormData({
        ...formData,
        [name]: value
      });

      // Validar após a atualização
      const erro = validarCampo(name, value);
      setErrosValidacao(prev => ({ ...prev, [name]: erro }));
    }
  }

  // Atualizar campo de select e validar
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });

    // Validar após a atualização
    const erro = validarCampo(name, value);
    setErrosValidacao(prev => ({ ...prev, [name]: erro }));
  }

  // Atualizar coordenadas a partir do mapa
  const handleMapPositionChange = (position: { latitude: number; longitude: number }) => {
    setFormData({
      ...formData,
      coordenadas: position
    });
  }

  // Validar todo o formulário
  const validarFormulario = (): boolean => {
    const campos = ['nome', 'clienteId', 'endereco', 'municipio', 'estado', 'area'];
    const novosErros: Record<string, string> = {};

    campos.forEach(campo => {
      let valor;
      if (campo === 'area') {
        valor = formData[campo as keyof typeof formData] as number;
      } else {
        valor = formData[campo as keyof typeof formData] as string;
      }

      novosErros[campo] = validarCampo(campo, valor);
    });

    setErrosValidacao(novosErros);

    // Retorna true se não houver erros
    return !Object.values(novosErros).some(erro => erro !== '');
  }

  // Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar todos os campos antes de enviar
    if (!validarFormulario()) {
      toast({
        title: 'Campos inválidos',
        description: 'Por favor, corrija os campos destacados antes de continuar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setEnviando(true);

      const novaPropriedade = await propriedadesApi.criarPropriedade(formData as Omit<Propriedade, 'id' | 'dataCriacao'>);

      toast({
        title: 'Propriedade criada',
        description: 'A propriedade foi criada com sucesso.',
      });

      router.push(`/propriedades/${novaPropriedade.id}`);
    } catch (error) {
      console.error('Erro ao criar propriedade:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a propriedade.',
        variant: 'destructive',
      });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="container mx-auto pb-24 pt-4 space-y-5">
      {/* Cabeçalho com breadcrumbs */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
          <Home className="h-3.5 w-3.5" />
          <Link href="/dashboard" className="hover:underline">Início</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/propriedades" className="hover:underline">Propriedades</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-primary font-medium">Nova Propriedade</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nova Propriedade</h1>
            <p className="text-sm text-muted-foreground mt-1">Cadastre uma nova propriedade rural no sistema</p>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <Link href="/propriedades">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>
      <Separator />

      {/* Estado de carregamento */}
      {carregando ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Carregando formulário...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Layout em duas colunas balanceadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Coluna esquerda - Informações básicas e campos de endereço */}
            <div className="space-y-5">
              <PropriedadeInfoBasica 
                nome={formData.nome || ''}
                clienteId={formData.clienteId || ''}
                area={formData.area || 0}
                clientes={clientes}
                errosValidacao={errosValidacao}
                onNomeChange={(valor: string) => {
                  setFormData({...formData, nome: valor});
                  const erro = validarCampo('nome', valor);
                  setErrosValidacao(prev => ({ ...prev, nome: erro }));
                }}
                onClienteIdChange={(valor: string) => {
                  setFormData({...formData, clienteId: valor});
                  const erro = validarCampo('clienteId', valor);
                  setErrosValidacao(prev => ({ ...prev, clienteId: erro }));
                }}
                onAreaChange={(valor: number) => {
                  setFormData({...formData, area: valor});
                  const erro = validarCampo('area', valor);
                  setErrosValidacao(prev => ({ ...prev, area: erro }));
                }}
              />
              
              {/* Componente de endereço unificado (sem mapa) */}
              <PropriedadeEnderecoUnificado
                endereco={formData.endereco || ''}
                municipio={formData.municipio || ''}
                estado={formData.estado || ''}
                coordenadas={formData.coordenadas || { latitude: 0, longitude: 0 }}
                errosValidacao={errosValidacao}
                onEnderecoChange={(valor: string) => {
                  setFormData({...formData, endereco: valor});
                  const erro = validarCampo('endereco', valor);
                  setErrosValidacao(prev => ({ ...prev, endereco: erro }));
                }}
                onMunicipioChange={(valor: string) => {
                  setFormData({...formData, municipio: valor});
                  const erro = validarCampo('municipio', valor);
                  setErrosValidacao(prev => ({ ...prev, municipio: erro }));
                }}
                onEstadoChange={(valor: string) => {
                  setFormData({...formData, estado: valor});
                  const erro = validarCampo('estado', valor);
                  setErrosValidacao(prev => ({ ...prev, estado: erro }));
                }}
                onCoordenadasChange={(coordenadas) => {
                  setFormData({...formData, coordenadas});
                }}
              />
            </div>
            
            {/* Coluna direita - Mapa em tamanho grande */}
            <div className="h-full">
              <PropriedadeMapaVisualizacao
                coordenadas={formData.coordenadas || { latitude: 0, longitude: 0 }}
                onCoordenadasChange={(coordenadas) => {
                  setFormData({...formData, coordenadas});
                }}
              />
            </div>
          </div>

          {/* Barra de ações fixa na parte inferior */}
          <PropriedadeActionsFooter
            isSubmitting={enviando}
            returnUrl="/propriedades"
            actionLabel="Criar Propriedade"
          />
        </form>
      )}
    </div>
  );
}