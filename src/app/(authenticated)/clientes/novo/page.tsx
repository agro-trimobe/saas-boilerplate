'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { CabecalhoPagina } from '@/components/ui/cabecalho-pagina'
import { ClienteNovoForm } from '@/components/clientes/cliente-novo-form'

export default function NovoClientePage() {



  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <CabecalhoPagina
        titulo="Novo Cliente"
        descricao="Cadastre um novo cliente no sistema"
        breadcrumbs={[
          { titulo: 'Clientes', href: '/clientes' },
          { titulo: 'Novo Cliente', href: '/clientes/novo' }
        ]}
        acoes={
          <Button variant="outline" size="sm" asChild>
            <Link href="/clientes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        }
      />
      
      <ClienteNovoForm />
    </div>
  )
}
