'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/ui/sidebar'

/**
 * Layout para as páginas autenticadas do boilerplate
 * Este layout é aplicado a todas as páginas dentro do grupo (authenticated)
 * e fornece a barra lateral de navegação comum
 */
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Estado para controlar se a barra lateral está expandida ou recolhida
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Barra lateral de navegação principal */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Conteúdo principal que se ajusta conforme a largura da barra lateral */}
      <div 
        className="flex-1 transition-all duration-300 overflow-auto"
        style={{ 
          marginLeft: sidebarOpen ? '16rem' : '5rem',
          width: 'auto'
        }}
      >
        <header className="sticky top-0 z-10 w-full border-b border-border bg-background/95 backdrop-blur">
          <div className="flex h-10 items-center justify-end px-4">
            {/* Área para ações rápidas, notificações, etc. */}
          </div>
        </header>
        
        {/* Conteúdo da página */}
        <main className="p-3 md:p-4 pb-16 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
