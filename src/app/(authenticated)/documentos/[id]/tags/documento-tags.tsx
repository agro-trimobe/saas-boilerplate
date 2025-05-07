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
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, X, Plus } from 'lucide-react'
import { Documento } from '@/lib/crm-utils'
import { formatarData } from '@/lib/formatters'
import { documentosApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

function DocumentoTagsConteudo({ documentoId }: { documentoId: string }) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [documento, setDocumento] = useState<Documento | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [novaTag, setNovaTag] = useState('')
  
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
        setTags(documento.tags || [])
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

  const adicionarTag = () => {
    if (!novaTag.trim()) return
    
    // Verificar se a tag já existe
    if (tags.includes(novaTag.trim())) {
      toast({
        title: 'Tag duplicada',
        description: 'Esta tag já foi adicionada',
        variant: 'destructive',
      })
      return
    }
    
    setTags([...tags, novaTag.trim()])
    setNovaTag('')
  }
  
  const removerTag = (index: number) => {
    const novasTags = [...tags]
    novasTags.splice(index, 1)
    setTags(novasTags)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      adicionarTag()
    }
  }
  
  const salvarTags = async () => {
    if (!documento) return
    
    try {
      setSalvando(true)
      
      // Atualizar documento com as novas tags
      const dadosAtualizados: Documento = {
        ...documento,
        tags,
        dataAtualizacao: new Date().toISOString()
      }
      
      await documentosApi.atualizarDocumento(documentoId, dadosAtualizados)
      toast({
        title: 'Tags atualizadas',
        description: 'As tags do documento foram atualizadas com sucesso',
      })
      
      router.push(`/documentos/${documentoId}`)
    } catch (error) {
      console.error('Erro ao atualizar tags:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as tags do documento',
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

  if (!documento) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-xl font-medium">Documento não encontrado</h2>
        <Button asChild>
          <Link href="/documentos">Voltar para documentos</Link>
        </Button>
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
          <h1 className="text-2xl font-bold tracking-tight">Gerenciar Tags</h1>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tags do Documento</CardTitle>
          <CardDescription>
            Adicione, remova ou edite as tags associadas ao documento "{documento.nome}"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Adicionar nova tag"
                value={novaTag}
                onChange={(e) => setNovaTag(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button type="button" onClick={adicionarTag}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Tags Atuais</h3>
            <div className="flex flex-wrap gap-2">
              {tags.length > 0 ? (
                tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removerTag(index)}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma tag adicionada</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/documentos/${documentoId}`}>
              Cancelar
            </Link>
          </Button>
          <Button onClick={salvarTags} disabled={salvando}>
            {salvando ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Salvando...
              </>
            ) : (
              'Salvar Tags'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default DocumentoTagsConteudo
