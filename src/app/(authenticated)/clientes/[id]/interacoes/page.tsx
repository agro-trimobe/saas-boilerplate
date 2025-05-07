import InteracoesClienteConteudo from './interacoes-cliente'

export default async function InteracoesClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <InteracoesClienteConteudo clienteId={id} />
}