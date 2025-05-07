import ProjetoDetalhesConteudo from './projeto-detalhes'

export default async function ProjetoDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProjetoDetalhesConteudo projetoId={id} />
}