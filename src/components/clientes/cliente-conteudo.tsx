'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { CabecalhoPagina } from '@/components/ui/cabecalho-pagina'
import { ClienteCard } from './cliente-card'
import { ClienteFiltros } from './cliente-filtros'
import { ClienteTabela } from './cliente-tabela'
import { formatarMoeda } from '@/lib/formatters'
import { clientesApi, projetosApi, propriedadesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { Cliente, Projeto, Propriedade } from '@/lib/crm-utils'
import { Users, FileText, Home, ArrowUpRight, Plus } from 'lucide-react'

export function ClienteConteudo() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [propriedades, setPropriedades] = useState<Propriedade[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<'Todos' | 'Pequeno' | 'Médio' | 'Grande'>('Todos')
  const [clienteParaExcluir, setClienteParaExcluir] = useState<Cliente | null>(null)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<'Todos' | 'PF' | 'PJ'>('Todos')
  const [ultimaInteracao, setUltimaInteracao] = useState<'Todos' | '7dias' | '30dias' | '90dias'>('Todos')

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [dadosClientes, dadosProjetos, dadosPropriedades] = await Promise.all([
          clientesApi.listarClientes(),
          projetosApi.listarProjetos(),
          propriedadesApi.listarPropriedades()
        ])
        setClientes(dadosClientes)
        setProjetos(dadosProjetos)
        setPropriedades(dadosPropriedades)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])

  // Estatísticas para os cards
  const estatisticas = {
    totalClientes: clientes.length,
    clientesPF: clientes.filter(c => c.tipo === 'PF').length,
    clientesPJ: clientes.filter(c => c.tipo === 'PJ').length,
    pequenos: clientes.filter(c => c.perfil === 'pequeno').length,
    medios: clientes.filter(c => c.perfil === 'medio').length,
    grandes: clientes.filter(c => c.perfil === 'grande').length,
    totalProjetos: projetos.length,
    projetosAtivos: projetos.filter(p => p.status === 'Em Elaboração' || p.status === 'Em Análise').length,
    projetosAprovados: projetos.filter(p => p.status === 'Aprovado' || p.status === 'Contratado').length,
    valorTotalProjetos: projetos.reduce((total, projeto) => total + projeto.valorTotal, 0)
  }

  // Filtrar clientes com base na busca e nos filtros
  const clientesFiltrados = clientes.filter(cliente => {
    const correspondeAoBusca = 
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) || 
      cliente.cpfCnpj.includes(busca) ||
      cliente.email.toLowerCase().includes(busca.toLowerCase())
    
    const correspondeAoPerfil = filtro === 'Todos' || 
      (filtro === 'Pequeno' && cliente.perfil === 'pequeno') ||
      (filtro === 'Médio' && cliente.perfil === 'medio') ||
      (filtro === 'Grande' && cliente.perfil === 'grande')
    
    const correspondeAoTipo = filtroTipo === 'Todos' ||
      (filtroTipo === 'PF' && cliente.tipo === 'PF') ||
      (filtroTipo === 'PJ' && cliente.tipo === 'PJ')
    
    // Filtro de última interação seria implementado com dados reais
    // Por enquanto, retornamos true para todos
    const correspondeAInteracao = true
    
    return correspondeAoBusca && correspondeAoPerfil && correspondeAoTipo && correspondeAInteracao
  })

  // Função para abrir o diálogo de confirmação
  const confirmarExclusao = (cliente: Cliente) => {
    setClienteParaExcluir(cliente)
    setDialogAberto(true)
  }

  // Função para calcular o número de projetos por cliente
  const calcularProjetosPorCliente = () => {
    const projetosPorCliente: Record<string, number> = {}
    
    // Para cada projeto, incrementar o contador do cliente associado
    projetos.forEach(projeto => {
      if (projeto.clienteId) {
        if (!projetosPorCliente[projeto.clienteId]) {
          projetosPorCliente[projeto.clienteId] = 0
        }
        projetosPorCliente[projeto.clienteId]++
      }
    })
    
    return projetosPorCliente
  }
  
  // Função para calcular o número de propriedades por cliente
  const calcularPropriedadesPorCliente = () => {
    const propriedadesPorCliente: Record<string, number> = {}
    
    // Para cada propriedade, incrementar o contador do cliente associado
    propriedades.forEach(propriedade => {
      if (propriedade.clienteId) {
        if (!propriedadesPorCliente[propriedade.clienteId]) {
          propriedadesPorCliente[propriedade.clienteId] = 0
        }
        propriedadesPorCliente[propriedade.clienteId]++
      }
    })
    
    return propriedadesPorCliente
  }

  // Função para excluir cliente
  const handleExcluirCliente = async () => {
    if (!clienteParaExcluir) return
    
    try {
      await clientesApi.excluirCliente(clienteParaExcluir.id)
      
      // Atualiza a lista de clientes após a exclusão
      setClientes(clientes.filter(c => c.id !== clienteParaExcluir.id))
      
      toast({
        title: 'Cliente excluído',
        description: 'O cliente foi excluído com sucesso.',
      })
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o cliente.',
        variant: 'destructive',
      })
    } finally {
      setDialogAberto(false)
      setClienteParaExcluir(null)
    }
  }

  // Função para resetar filtros
  const resetarFiltros = () => {
    setBusca('')
    setFiltro('Todos')
    setFiltroTipo('Todos')
    setUltimaInteracao('Todos')
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Clientes"
        descricao="Gerencie seus clientes e acompanhe suas informações"
        acoes={
          <Button asChild>
            <Link href="/clientes/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Link>
          </Button>
        }
      />

      {/* Cards de estatísticas */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <ClienteCard
          titulo="Total de Clientes"
          valor={`${estatisticas.totalClientes}`}
          icone={<Users className="h-4 w-4" />}
          corBorda="border-l-blue-500"
          corIcone="text-blue-500"
          indicador={{
            valor: 3,
            tendencia: 'up',
            texto: 'Comparado ao mês anterior'
          }}
          link={{
            texto: 'Ver todos os clientes',
            href: '/clientes'
          }}
        />
        
        <ClienteCard
          titulo="Projetos Ativos"
          valor={`${estatisticas.projetosAtivos} de ${estatisticas.totalProjetos}`}
          icone={<FileText className="h-4 w-4" />}
          corBorda="border-l-green-500"
          corIcone="text-green-500"
          indicador={{
            valor: 12,
            tendencia: 'up',
            texto: 'Comparado ao mês anterior'
          }}
          link={{
            texto: 'Ver todos os projetos',
            href: '/projetos'
          }}
        />
        
        <ClienteCard
          titulo="Perfil dos Clientes"
          valor={`P:${estatisticas.pequenos} | M:${estatisticas.medios} | G:${estatisticas.grandes}`}
          icone={<Home className="h-4 w-4" />}
          corBorda="border-l-purple-500"
          corIcone="text-purple-500"
          link={{
            texto: 'Ver detalhes',
            href: '/clientes'
          }}
        />
        
        <ClienteCard
          titulo="Valor em Projetos"
          valor={formatarMoeda(estatisticas.valorTotalProjetos)}
          icone={<ArrowUpRight className="h-4 w-4" />}
          corBorda="border-l-amber-500"
          corIcone="text-amber-500"
          indicador={{
            valor: 2,
            tendencia: 'down',
            texto: 'Comparado ao mês anterior'
          }}
          link={{
            texto: 'Ver detalhes financeiros',
            href: '/projetos'
          }}
        />
      </div>

      {/* Filtros de busca */}
      <ClienteFiltros 
        busca={busca}
        setBusca={setBusca}
        filtro={filtro}
        setFiltro={setFiltro}
        filtroTipo={filtroTipo}
        setFiltroTipo={setFiltroTipo}
        ultimaInteracao={ultimaInteracao}
        setUltimaInteracao={setUltimaInteracao}
        resetarFiltros={resetarFiltros}
      />

      {/* Tabela de clientes */}
      <Card className="shadow-sm">
        <CardHeader className="py-3">
          <CardTitle className="text-lg">Lista de Clientes</CardTitle>
          <CardDescription>
            Total de {clientesFiltrados.length} clientes encontrados
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          {!carregando && clientesFiltrados.length > 0 && (
            <ClienteTabela 
              clientes={clientesFiltrados} 
              onExcluir={confirmarExclusao}
              projetosPorCliente={calcularProjetosPorCliente()}
              propriedadesPorCliente={calcularPropriedadesPorCliente()}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              {clienteParaExcluir && `Tem certeza que deseja excluir o cliente ${clienteParaExcluir.nome}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluirCliente} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
