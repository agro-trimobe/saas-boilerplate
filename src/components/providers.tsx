"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { useNotificationStore } from "@/hooks/use-notification-store";
import { useEffect } from "react";
import { LoadingBoundary } from "@/components/ui/loading-boundary";

/**
 * Componente de notificações que exibe todas as notificações ativas do sistema
 */
function NotificationRenderer() {
  const notifications = useNotificationStore((state: any) => state.notifications);
  const removeNotification = useNotificationStore((state: any) => state.removeNotification);
  
  // Implementação minimalista para compatibilidade com o Toaster existente
  // As notificações do novo sistema serão convertidas para o formato do Toaster
  useEffect(() => {
    // Para cada notificação no store, podemos acionar o toast (futuro)
    // Mantém compatibilidade com o sistema de notificações existente
  }, [notifications]);
  
  return null;
}

/**
 * Componente de providers que encapsula todos os contextos globais da aplicação
 * Otimizado para minimizar re-renderizações desnecessárias
 */
/**
 * Componente de providers que encapsula todos os contextos globais da aplicação
 * Otimizado para minimizar re-renderizações desnecessárias
 * Inclui LoadingBoundary para melhorar a experiência durante carregamento
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div suppressHydrationWarning>
        <LoadingBoundary delay={300} minDuration={500}>
          {children}
        </LoadingBoundary>
        <NotificationRenderer />
        <Toaster />
      </div>
    </SessionProvider>
  );
}
