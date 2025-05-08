import NextAuth from 'next-auth';
import { authOptions } from '../auth-options';

// Exporta a configuração do NextAuth para ser usada como manipulador de rota API
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
