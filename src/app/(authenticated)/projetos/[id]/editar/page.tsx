import ProjetoEditarConteudo from './projeto-editar'

export default async function ProjetoEditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProjetoEditarConteudo projetoId={id} />
}