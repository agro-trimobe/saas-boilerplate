import ProjetoDocumentosConteudo from './projeto-documentos'

export default async function ProjetoDocumentosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProjetoDocumentosConteudo projetoId={id} />
}
