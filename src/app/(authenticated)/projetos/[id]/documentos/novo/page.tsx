import NovoDocumentoProjetoConteudo from './novo-documento-projeto'

export default async function NovoDocumentoProjetoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <NovoDocumentoProjetoConteudo projetoId={id} />
}
