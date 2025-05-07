import PropriedadeEditarConteudo from './propriedade-editar'

export default async function PropriedadeEditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PropriedadeEditarConteudo propriedadeId={id} />
}
