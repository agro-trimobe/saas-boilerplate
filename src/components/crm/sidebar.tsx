'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useSubscription } from '@/hooks/use-subscription'
import {
  Users,
  FileText,
  LineChart,
  Calculator,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Orbit,
  Home as HomeIcon,
  User,
  FolderOpen,
  Bot,
  Lock,
  AlertCircle,
  ArrowUpCircle,
  Trello,
} from 'lucide-react'

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

// Modal de upgrade para usuários sem plano Premium
function UpgradeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Lock className="mr-2 h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold">Funcionalidade Premium</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <span className="sr-only">Fechar</span>
            <span aria-hidden>×</span>
          </Button>
        </div>
        
        <div className="mb-6">
          <p className="mb-4">
            O Assistente Inteligente é uma funcionalidade exclusiva do plano Premium.
            Atualize seu plano para acessar esta e outras funcionalidades avançadas.
          </p>
          <div className="rounded-md bg-amber-50 p-3 dark:bg-amber-950/50">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <div className="ml-3 text-sm text-amber-800 dark:text-amber-200">
                <p>Seu plano atual não inclui acesso ao Assistente Inteligente.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={() => {
              router.push('/subscription');
              onClose();
            }}
          >
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Fazer Upgrade
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPremium, isLoading } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Verificar se há um parâmetro para mostrar o modal de upgrade
  useEffect(() => {
    if (searchParams.get('showUpgradeModal') === 'true') {
      setShowUpgradeModal(true);
    }
  }, [searchParams]);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/' })
      toast({
        title: 'Logout realizado com sucesso',
        description: 'Você será redirecionado para a página inicial.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao realizar logout',
        description: 'Ocorreu um erro ao tentar sair do sistema.',
        variant: 'destructive',
      })
    }
  }

  // Assistente como item especial que pode estar desabilitado
  const assistantItem = {
    title: 'Assistente Inteligente',
    href: '/assistente',
    icon: Bot,
    isPremiumOnly: true,
  };
  
  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Clientes',
      href: '/clientes',
      icon: Users,
    },
    {
      title: 'Propriedades',
      href: '/propriedades',
      icon: HomeIcon,
    },
    {
      title: 'Projetos',
      href: '/projetos',
      icon: FileText,
    },
    {
      title: 'Tarefas',
      href: '/tarefas',
      icon: Trello,
    },
    {
      title: 'Oportunidades',
      href: '/oportunidades',
      icon: LineChart,
    },
    {
      title: 'Documentos',
      href: '/documentos',
      icon: FolderOpen,
    },
    {
      title: 'Simulações',
      href: '/simulacoes',
      icon: Calculator,
    },
  ]

  return (
    <>
      <div
        className={cn(
          'min-h-screen fixed top-0 left-0 z-20 flex flex-col border-r border-border bg-card transition-all duration-300',
          open ? 'w-64' : 'w-20'
        )}
        style={{ width: open ? '16rem' : '5rem' }}
      >
        <div className="flex items-center justify-between p-4">
          <div className={cn('flex items-center', !open && 'justify-center w-full')}>
            <Orbit className="h-8 w-8 text-primary" />
            {open && <span className="ml-2 text-xl font-bold text-primary truncate">Trimobe</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            className={cn('rounded-full', !open && 'hidden')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {!open && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            className="mx-auto mt-2 rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}

        <Separator className="my-4" />

        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {/* Links de navegação normais */}
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  pathname === item.href || pathname.startsWith(item.href + '/') 
                    ? 'bg-secondary text-primary' 
                    : 'hover:bg-secondary/50',
                  !open && 'justify-center py-3'
                )}
              >
                <item.icon className={cn(
                  'h-5 w-5', 
                  (pathname === item.href || pathname.startsWith(item.href + '/')) && 'text-primary'
                )} />
                {open && <span className="truncate">{item.title}</span>}
              </Link>
            ))}
            
            {/* Assistente Inteligente (pode estar desabilitado) */}
            {isPremium ? (
              <Link
                href={assistantItem.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  pathname === assistantItem.href || pathname.startsWith(assistantItem.href + '/') 
                    ? 'bg-secondary text-primary' 
                    : 'hover:bg-secondary/50',
                  !open && 'justify-center py-3'
                )}
              >
                <assistantItem.icon className={cn(
                  'h-5 w-5', 
                  (pathname === assistantItem.href || pathname.startsWith(assistantItem.href + '/')) && 'text-primary'
                )} />
                {open && <span className="truncate">{assistantItem.title}</span>}
              </Link>
            ) : (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground/50 hover:bg-secondary/30',
                  !open && 'justify-center py-3'
                )}
              >
                <assistantItem.icon className="h-5 w-5 opacity-50" />
                {open && (
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">{assistantItem.title}</span>
                    <Lock className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                )}
              </button>
            )}
          </nav>
        </div>

        <Separator className="my-4" />
        
        <div className="p-4">
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start gap-2 text-muted-foreground',
              !open && 'justify-center px-0'
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {open && <span className="truncate">Sair</span>}
          </Button>
        </div>
      </div>
      
      {/* Overlay para telas pequenas */}
      {open && (
        <div 
          className="md:hidden fixed inset-0 z-10 bg-background/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
      {/* Modal de upgrade */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </>
  )
}
