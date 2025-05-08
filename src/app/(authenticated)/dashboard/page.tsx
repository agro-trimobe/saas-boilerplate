'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { 
  ClipboardList, 
  BarChart3,
  Users,
  UserCircle
} from 'lucide-react'

// Componentes UI
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Loading } from '@/components/ui/loading'

// Componente de informações de assinatura
import SubscriptionInfo from '@/components/dashboard/subscription-info'

/**
 * Página principal do dashboard
 * Utiliza Suspense para melhorar a experiência de carregamento
 */
export default function Dashboard() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Dashboard</h1>
      <p className="text-muted-foreground mb-6">Bem-vindo ao seu painel de controle.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Componente de assinatura com Suspense para melhorar carregamento */}
        <Suspense fallback={<Card className="min-h-[180px]"><Loading size="default" /></Card>}>
          <SubscriptionInfo />
        </Suspense>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center">
              <BarChart3 className="h-5 w-5 text-primary mr-2" />
              Resumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Atividades</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Notificações</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center">
              <UserCircle className="h-5 w-5 text-primary mr-2" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/profile" className="text-sm text-muted-foreground hover:text-primary flex items-center transition-colors">
                <UserCircle className="h-4 w-4 mr-2" />
                Meu Perfil
              </Link>
              <Link href="/settings" className="text-sm text-muted-foreground hover:text-primary flex items-center transition-colors">
                <Users className="h-4 w-4 mr-2" />
                Configurações da Conta
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />
      
      <h2 className="text-xl font-semibold tracking-tight">Recursos</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center">
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Gerencie sua equipe</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Acesse a documentação e tutoriais</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
