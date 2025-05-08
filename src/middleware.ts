import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Páginas que não precisam de autenticação
const PUBLIC_PATHS = [
  '/api/auth',
  '/auth/login',
  '/auth/register',
  '/auth/confirm',
  '/auth/reset-password',
  '/auth/forgot-password',
  '/_next',
  '/favicon.ico',
  '/' // Página inicial
];

// Adiciona cabeçalhos para evitar cache
function addNoCacheHeaders(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

// Middleware para verificar autenticação
export async function middleware(request: NextRequest) {
  try {
    const { pathname, href } = request.nextUrl;
    
    // Verificar se a rota é pública
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // Verificar token de autenticação
    const host = request.headers.get('host') || '';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Configurar opções para o getToken
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: protocol === 'https'
    });

    // Se não estiver autenticado, redirecionar para login
    if (!token) {
      const urlLogin = new URL('/auth/login', baseUrl);
      urlLogin.searchParams.set('callbackUrl', encodeURIComponent(href));
      
      const response = NextResponse.redirect(urlLogin);
      return addNoCacheHeaders(response);
    }

    // Se estiver autenticado tentando acessar páginas de autenticação, redirecionar para dashboard
    if (pathname.startsWith('/auth/')) {
      const urlDashboard = new URL('/dashboard', baseUrl);
      const response = NextResponse.redirect(urlDashboard);
      return addNoCacheHeaders(response);
    }

    // Usuário autenticado acessando uma página protegida, permitir acesso
    return NextResponse.next();
  } catch (error) {
    console.error('[MIDDLEWARE] Erro:', error);
    return NextResponse.next();
  }
}

// Configuração do matcher para o middleware
export const config = {
  matcher: [
    "/((?!api/auth|auth/login|auth/register|auth/confirm|auth/reset-password|auth/forgot-password|_next|favicon.ico).*)",
  ],
};
