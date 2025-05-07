import DocumentoDetalhesConteudo from './documento-detalhes'

export default async function DocumentoDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <DocumentoDetalhesConteudo documentoId={id} />
}