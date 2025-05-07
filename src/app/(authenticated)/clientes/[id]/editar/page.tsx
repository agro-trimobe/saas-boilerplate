import ClienteEditarConteudo from './cliente-editar'

export default async function ClienteEditarPage({ params }: { params: Promise<{ id: string }> }) {
  // Como este é um componente servidor, podemos usar async/await
  const { id } = await params
  return <ClienteEditarConteudo clienteId={id} />
}
