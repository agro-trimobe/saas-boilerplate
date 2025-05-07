import ClienteDetalhesConteudo from './cliente-detalhes'

export default async function ClienteDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  // Como este é um componente servidor, podemos usar async/await
  const { id } = await params
  return <ClienteDetalhesConteudo clienteId={id} />
}