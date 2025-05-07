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
import { ArrowLeft } from 'lucide-react'
import { Documento, Cliente, Projeto } from '@/lib/crm-utils'
import { formatarData } from '@/lib/formatters'
import { documentosApi, clientesApi, projetosApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

function DocumentoEditarConteudo({ documentoId }: { documentoId: string }) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [documento, setDocumento] = useState<Documento | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [projetos, setProjetos] = useState<Projeto[]>([])
  
  // Formulário
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState('')
  const [status, setStatus] = useState<'Ativo' | 'Arquivado'>('Ativo')
  const [clienteId, setClienteId] = useState('')
  const [projetoId, setProjetoId] = useState('')
  const [nomeArquivo, setNomeArquivo] = useState('')
  const [formato, setFormato] = useState('')
  const [caminho, setCaminho] = useState('')
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar documento
        const documento = await documentosApi.buscarDocumentoPorId(documentoId)
        if (!documento) {
          toast({
            title: 'Erro',
            description: 'Documento não encontrado',
            variant: 'destructive',
          })
          router.push('/documentos')
          return
        }
        
        setDocumento(documento)
        
        // Preencher formulário
        setNome(documento.nome)
        setDescricao(documento.descricao || '')
        setTipo(documento.tipo)
        setStatus(documento.status === 'Ativo' ? 'Ativo' : 'Arquivado')
        setClienteId(documento.clienteId || 'nenhum')
        setProjetoId(documento.projetoId || 'nenhum')
        setNomeArquivo(documento.nome)
        setFormato(documento.formato || '')
        setCaminho('')
        
        // Carregar clientes
        const listaClientes = await clientesApi.listarClientes()
        setClientes(listaClientes)
        
        // Carregar projetos
        const listaProjetos = await projetosApi.listarProjetos()
        setProjetos(listaProjetos)
        
        setCarregando(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do documento',
          variant: 'destructive',
        })
      }
    }

    carregarDados()
  }, [documentoId, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    switch (name) {
      case 'nome':
        setNome(value)
        break
      case 'descricao':
        setDescricao(value)
        break
      case 'nomeArquivo':
        setNomeArquivo(value)
        break
      case 'formato':
        setFormato(value)
        break
      case 'caminho':
        setCaminho(value)
        break
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!documento) return
    
    try {
      setSalvando(true)
      
      // Validação básica
      if (!nome || !tipo) {
        toast({
          title: 'Erro',
          description: 'Preencha todos os campos obrigatórios',
          variant: 'destructive',
        })
        setSalvando(false)
        return
      }
      
      // Atualizar documento
      const dadosAtualizados: Documento = {
        ...documento,
        nome,
        descricao,
        tipo,
        status,
        clienteId: clienteId === 'nenhum' ? '' : clienteId,
        projetoId: projetoId === 'nenhum' ? '' : projetoId,
        formato: formato || documento.formato,
        tamanho: documento.tamanho,
        url: documento.url,
        tags: documento.tags,
        dataCriacao: documento.dataCriacao,
        dataAtualizacao: new Date().toISOString()
      }
      
      await documentosApi.atualizarDocumento(documentoId, dadosAtualizados)
      toast({
        title: 'Documento atualizado',
        description: 'Os dados do documento foram atualizados com sucesso',
      })
      
      router.push(`/documentos/${documentoId}`)
    } catch (error) {
      console.error('Erro ao atualizar documento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o documento',
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
            <Link href={`/documentos/${documentoId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Editar Documento</h1>
        </div>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações do Documento</CardTitle>
            <CardDescription>
              Edite os detalhes do documento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                value={nome}
                onChange={handleChange}
                placeholder="Nome do documento"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={descricao}
                onChange={handleChange}
                placeholder="Descrição do documento"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contrato">Contrato</SelectItem>
                    <SelectItem value="Projeto Técnico">Projeto Técnico</SelectItem>
                    <SelectItem value="Licença Ambiental">Licença Ambiental</SelectItem>
                    <SelectItem value="Documentação Pessoal">Documentação Pessoal</SelectItem>
                    <SelectItem value="Documentação da Propriedade">Documentação da Propriedade</SelectItem>
                    <SelectItem value="Relatório">Relatório</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Arquivado">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Nenhum</SelectItem>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="projeto">Projeto</Label>
                <Select value={projetoId} onValueChange={setProjetoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Nenhum</SelectItem>
                    {projetos.map((projeto) => (
                      <SelectItem key={projeto.id} value={projeto.id}>
                        {projeto.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nomeArquivo">Nome do Arquivo</Label>
              <Input
                id="nomeArquivo"
                name="nomeArquivo"
                value={nomeArquivo}
                onChange={handleChange}
                placeholder="Nome do arquivo"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="formato">Formato</Label>
                <Input
                  id="formato"
                  name="formato"
                  value={formato}
                  onChange={handleChange}
                  placeholder="Formato do arquivo (ex: PDF, DOCX)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="caminho">Caminho</Label>
                <Input
                  id="caminho"
                  name="caminho"
                  value={caminho}
                  onChange={handleChange}
                  placeholder="Caminho do arquivo"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/documentos/${documentoId}`}>
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default DocumentoEditarConteudo
