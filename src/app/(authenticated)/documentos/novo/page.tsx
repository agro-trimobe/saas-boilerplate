import { Suspense } from 'react'
import NovoDocumentoCliente from './novo-documento-cliente'

export const metadata = {
  title: 'Novo Documento',
  description: 'Adicione um novo documento ao sistema',
}

// Componente servidor (assíncrono)
export default function NovoDocumentoPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>}>
      <NovoDocumentoCliente />
    </Suspense>
  )
}
