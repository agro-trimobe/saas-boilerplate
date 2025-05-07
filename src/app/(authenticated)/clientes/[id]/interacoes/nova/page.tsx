import NovaInteracaoConteudo from './nova-interacao'

export default async function NovaInteracaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <NovaInteracaoConteudo clienteId={id} />
}