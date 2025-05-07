import DocumentoTagsConteudo from './documento-tags'

export default async function DocumentoTagsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <DocumentoTagsConteudo documentoId={id} />
}