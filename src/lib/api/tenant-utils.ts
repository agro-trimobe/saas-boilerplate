import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { useSession } from 'next-auth/react';

/**
 * Sistema Multi-tenant Simplificado
 * 
 * Este módulo fornece funções para obter o ID do tenant (organização)
 * atual tanto no lado do servidor quanto no lado do cliente.
 * 
 * Casos de uso:
 * - Componentes de página para restringir acesso a dados de um tenant
 * - APIs para garantir que usuários só acessem dados do seu tenant
 * - Hooks de React para componentes que precisam do tenant ID
 */

/**
 * Obtém o tenant ID da sessão no lado do servidor
 * Uso típico: páginas e rotas de API no lado do servidor
 * @returns Promise com o tenant ID do usuário autenticado
 * @throws Error se o tenant ID não for encontrado ou houver erro na sessão
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
 * Obtém o tenant ID da sessão do usuário
 * Funciona tanto no lado do cliente quanto no servidor
 * @returns Promise com o tenant ID do usuário
 * @throws Error se o tenant ID não for encontrado
 */
export async function getTenantId(): Promise<string> {
  // No servidor, usa diretamente a sessão do servidor
  if (typeof window === 'undefined') {
    return getServerTenantId();
  }
  
  // No cliente, busca via API
  try {
    const response = await fetch('/api/tenant');
    const data = await response.json();
    
    if (data.status === 'error') {
      console.error('Erro ao obter tenant ID:', data.message);
      throw new Error(data.message);
    }
    
    return data.tenantId;
  } catch (error) {
    console.error('Erro ao obter tenant ID:', error);
    throw error;
  }
}

/**
 * Hook React para obter o tenant ID no cliente
 * Ideal para uso em componentes React
 * @returns O tenant ID do usuário ou null se não estiver autenticado
 */
export function useClientTenantId(): string | null {
  const { data: session } = useSession();
  return session?.user?.tenantId || null;
}
