import PropriedadeDetalhesConteudo from './propriedade-detalhes'

export default async function PropriedadeDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PropriedadeDetalhesConteudo propriedadeId={id} />
}
