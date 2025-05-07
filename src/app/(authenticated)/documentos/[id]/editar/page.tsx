import DocumentoEditarConteudo from './documento-editar'

export default async function DocumentoEditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <DocumentoEditarConteudo documentoId={id} />
}