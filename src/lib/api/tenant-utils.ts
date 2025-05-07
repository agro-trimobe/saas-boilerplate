import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { useSession } from 'next-auth/react';

/**
 * Função auxiliar para obter o tenant ID da sessão do usuário autenticado no lado do servidor
 * @returns Promise com o tenant ID do usuário
 * @throws Error se o tenant ID não for encontrado na sessão
 */
export async function getServerTenantId(): Promise<string> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      console.error('Tenant ID não encontrado na sessão');
      throw new Error('Tenant ID não encontrado na sessão');
    }
    return session.user.tenantId;
  } catch (error) {
    console.error('Erro ao obter tenant ID no servidor:', error);
    throw error;
  }
}

/**
 * Função auxiliar para obter o tenant ID da sessão do usuário autenticado
 * Esta função funciona tanto no lado do cliente quanto no lado do servidor
 * @returns Promise com o tenant ID do usuário
 * @throws Error se o tenant ID não for encontrado na sessão
 */
export async function getTenantId(): Promise<string> {
  // Verificar se estamos no lado do servidor
  if (typeof window === 'undefined') {
    return getServerTenantId();
  }
  
  // No lado do cliente, fazemos uma requisição à API
  try {
    const response = await fetch('/api/tenant');
    const data = await response.json();
    
    if (data.status === 'error') {
      console.error('Erro ao obter tenant ID do cliente:', data.message);
      throw new Error(data.message);
    }
    
    return data.tenantId;
  } catch (error) {
    console.error('Erro ao obter tenant ID do cliente:', error);
    throw error;
  }
}

/**
 * Hook para obter o tenant ID no lado do cliente usando o hook useSession
 * Útil para componentes React que precisam do tenant ID
 * @returns O tenant ID do usuário ou null se não estiver disponível
 */
export function useClientTenantId(): string | null {
  const { data: session } = useSession();
  return session?.user?.tenantId || null;
}
