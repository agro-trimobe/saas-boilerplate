import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export type UserSession = {
  userId: string;
  tenantId: string;
  email: string;
  name?: string;
  role?: string;
};

/**
 * Obtém as informações da sessão do usuário atual
 * @returns Informações da sessão do usuário
 * @throws Error se o usuário não estiver autenticado
 */
export async function getUserSession(): Promise<UserSession> {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new Error('Usuário não autenticado');
  }

  // Extrair o ID do tenant a partir do email do usuário
  // Nesta implementação simples, usamos o domínio do email como ID do tenant
  const email = session.user.email || '';
  const tenantId = email.split('@')[1]?.split('.')[0] || 'default';

  return {
    userId: session.user.id || session.user.email || '',
    tenantId,
    email: session.user.email || '',
    name: session.user.name,
    role: (session.user as any).role,
  };
}
