'use client'

import { CabecalhoPagina } from '@/components/ui/cabecalho-pagina'

export default function AssistentePage() {
  return (
    <div className="space-y-4">
      <CabecalhoPagina
        titulo="Assistente Inteligente"
        descricao="Seu assistente virtual para projetos de crédito rural"
      />
      
      <div className="bg-card border rounded-lg shadow-sm p-6 flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <p className="text-muted-foreground text-center">
          Assistente Inteligente em desenvolvimento.
          <br />
          Esta funcionalidade estará disponível em breve.
        </p>
      </div>
    </div>
  )
}
