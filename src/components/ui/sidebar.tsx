'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  ChevronLeft,
  Home
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Apenas mostrar o componente quando estiver montado no cliente
  if (!mounted) {
    return null
  }

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-20 flex h-full flex-col border-r border-border bg-background transition-all duration-300",
        open ? "w-64" : "w-20"
      )}
    >
      <div className="flex h-14 items-center border-b border-border px-4">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => setOpen(!open)}
        >
          {open ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        
        {open && (
          <span className="text-lg font-semibold">
            SaaS Boilerplate
          </span>
        )}
      </div>
      
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="flex flex-col gap-1 px-2">
          <NavItem
            href="/dashboard"
            label="Dashboard"
            icon={LayoutDashboard}
            active={pathname === '/dashboard'}
            open={open}
          />
          <NavItem
            href="/profile"
            label="Perfil"
            icon={User}
            active={pathname === '/profile'}
            open={open}
          />
          <NavItem
            href="/subscription"
            label="Assinatura"
            icon={CreditCard}
            active={pathname === '/subscription'}
            open={open}
          />
        </nav>
      </ScrollArea>
      
      <div className="mt-auto border-t border-border p-4">
        {open && session?.user?.name && (
          <div className="mb-4 flex flex-col">
            <span className="text-sm font-medium">
              {session.user.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {session.user.email}
            </span>
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size={open ? "default" : "icon"}
            className="justify-start"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {open && "Sair"}
          </Button>
          <Button
            variant="ghost"
            size={open ? "default" : "icon"}
            asChild
            className="justify-start"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              {open && "Página Inicial"}
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  )
}

interface NavItemProps {
  href: string
  label: string
  icon: React.ElementType
  active: boolean
  open: boolean
}

function NavItem({ href, label, icon: Icon, active, open }: NavItemProps) {
  return (
    <Button
      asChild
      variant={active ? "secondary" : "ghost"}
      size={open ? "default" : "icon"}
      className={cn(
        "justify-start",
        !open && "justify-center"
      )}
    >
      <Link href={href}>
        <Icon className={cn("h-4 w-4", open && "mr-2")} />
        {open && label}
      </Link>
    </Button>
  )
}
