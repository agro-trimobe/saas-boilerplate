import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { checkUserSubscription } from './lib/subscription-service';
import { isSubscriptionActive } from './lib/types/subscription';

// Páginas que não precisam de verificação de autenticação
const PUBLIC_PATHS = [
  '/api/auth',
  '/auth/login',
  '/auth/register',
  '/auth/confirm',
  '/auth/reset-password',
  '/_next',
  '/favicon.ico',
];

// Páginas que não precisam de verificação de assinatura
const SUBSCRIPTION_EXEMPT_PATHS = [
  '/api/auth',
  '/api/subscription',
  '/auth/login',
  '/auth/register',
  '/auth/confirm',
  '/auth/reset-password',
  '/subscription',
  '/_next',
  '/favicon.ico',
];

// Adiciona cabeçalhos para evitar cache
function addNoCacheHeaders(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

// Logs detalhados para ambiente de produção
function logDetalhe(mensagem: string, dados?: any) {
  console.log(`[MIDDLEWARE] ${mensagem}`);
  if (dados) {
    try {
      console.log(JSON.stringify(dados, null, 2));
    } catch (error) {
      console.log('Não foi possível serializar os dados:', error);
    }
  }
}

// Extrai informações relevantes dos cookies para debug
function logCookies(request: NextRequest) {
  try {
    // Usar Record<string, string> para definir o tipo do objeto cookies
    const cookies: Record<string, string> = {};
    request.cookies.getAll().forEach(cookie => {
      cookies[cookie.name] = cookie.value ? 'Presente' : 'Ausente';
    });
    
    logDetalhe('Cookies da requisição', cookies);
    
    // Log específico para cookies de autenticação
    const sessionToken = request.cookies.get('next-auth.session-token');
    const callbackUrl = request.cookies.get('next-auth.callback-url');
    
    logDetalhe('Cookie de sessão', {
      nome: 'next-auth.session-token',
      presente: !!sessionToken,
      valor: sessionToken ? 'Valor presente (não exibido por segurança)' : 'Ausente',
      // RequestCookie não tem a propriedade expires, então removemos essa informação
      expiracao: 'Informação não disponível no objeto RequestCookie'
    });
    
    logDetalhe('Cookie de callback', {
      nome: 'next-auth.callback-url',
      presente: !!callbackUrl,
      valor: callbackUrl?.value,
      // RequestCookie não tem a propriedade expires, então removemos essa informação
      expiracao: 'Informação não disponível no objeto RequestCookie'
    });
  } catch (error) {
    logDetalhe('Erro ao processar cookies', { erro: String(error) });
  }
}

// Middleware para verificar autenticação
export async function middleware(request: NextRequest) {
  try {
    const { pathname, search, origin, href } = request.nextUrl;
    logDetalhe('Middleware iniciando', {
      pathname,
      search,
      url_completa: href,
      metodo: request.method,
      host: request.headers.get('host'),
      userAgent: request.headers.get('user-agent'),
      referrer: request.headers.get('referer'),
      ambiente: process.env.NODE_ENV
    });
    
    // Log de cookies para debug
    logCookies(request);

    // Verificar se a rota é pública
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
      logDetalhe('Rota pública detectada, permitindo acesso', { pathname });
      return NextResponse.next();
    }

    // Verificar se é a página inicial
    if (pathname === '/') {
      logDetalhe('Página inicial detectada, permitindo acesso');
      return NextResponse.next();
    }

    // Verificar token de autenticação
    const host = request.headers.get('host') || '';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Configurar opções para o getToken
    const tokenConfig = {
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: protocol === 'https',
      cookieName: 'next-auth.session-token',
    };
    
    logDetalhe('Tentando obter token de autenticação', {
      secretDefinido: !!process.env.NEXTAUTH_SECRET,
      cookiesPresentesNaRequisicao: request.cookies.size > 0,
      baseUrl,
      protocol,
      host,
      ambiente: process.env.NODE_ENV
    });
    
    // Verificar o nome do cookie de acordo com o ambiente
    const cookieName = process.env.NODE_ENV === 'production' 
      ? `__Secure-next-auth.session-token`
      : `next-auth.session-token`;
      
    const sessionCookie = request.cookies.get(cookieName) || request.cookies.get('next-auth.session-token');
    logDetalhe('Verificando cookie de sessão', {
      cookieName,
      cookieEncontrado: !!sessionCookie,
      valorCookie: sessionCookie ? 'Presente (valor não exibido)' : 'Ausente'
    });
    
    let token;
    try {
      token = await getToken(tokenConfig);
      logDetalhe('Resultado da verificação do token', {
        tokenObtido: !!token,
        tokenTipo: token ? typeof token : 'undefined',
        tokenConteudo: token ? {
          nome: token.name,
          email: token.email,
          imagem: token.picture,
          expiracao: token.exp,
          tempoAtual: Math.floor(Date.now() / 1000)
        } : null
      });
    } catch (error) {
      logDetalhe('Erro ao obter token', { 
        erro: String(error),
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : null
      });
    }

    // Se não estiver autenticado, redirecionar para login
    if (!token) {
      logDetalhe('Usuário não autenticado, redirecionando para login', {
        de: pathname,
        para: '/auth/login'
      });
      
      // Já temos o baseUrl definido acima
      const urlLogin = new URL('/auth/login', baseUrl);
      // Adicionar parâmetro callbackUrl para retornar depois do login
      urlLogin.searchParams.set('callbackUrl', encodeURIComponent(href));
      
      logDetalhe('URL de redirecionamento para login', { 
        url: urlLogin.toString(),
        baseUrl,
        host,
        protocol 
      });
      
      const response = NextResponse.redirect(urlLogin);
      return addNoCacheHeaders(response);
    }

    // Se estiver autenticado, verificar se está acessando a página de login
    if (pathname.startsWith('/auth/login')) {
      logDetalhe('Usuário autenticado tentando acessar login, redirecionando para dashboard', {
        de: pathname,
        para: '/dashboard'
      });
      
      // Já temos o baseUrl definido acima
      const urlDashboard = new URL('/dashboard', baseUrl);
      
      logDetalhe('URL de redirecionamento para dashboard', { 
        url: urlDashboard.toString(),
        baseUrl,
        host,
        protocol
      });
      
      const response = NextResponse.redirect(urlDashboard);
      return addNoCacheHeaders(response);
    }

    // Verificar status da assinatura para páginas que exigem assinatura
    if (!SUBSCRIPTION_EXEMPT_PATHS.some(path => pathname.startsWith(path))) {
      logDetalhe('Verificando status da assinatura para página protegida', {
        pathname,
        email: token.email
      });
      
      // Verificar se o usuário já está na página de assinatura
      if (pathname === '/subscription') {
        return NextResponse.next();
      }
      
      try {
        // Garantir que temos o tenantId e o cognitoId
        const tenantId = token.tenantId as string;
        const cognitoId = token.sub as string;
        
        if (!tenantId || !cognitoId) {
          throw new Error('Dados do usuário incompletos');
        }
        
        // Obter dados da assinatura
        const subscription = await checkUserSubscription(tenantId, cognitoId);
        
        // Se não houver assinatura ou ela não estiver ativa, redirecionar para a página de assinatura
        if (!subscription || !isSubscriptionActive(subscription)) {
          logDetalhe('Assinatura inativa ou expirada, redirecionando para página de assinatura', {
            pathname,
            email: token.email,
            subscription: subscription ? {
              status: subscription.status,
              plan: subscription.plan,
              expiresAt: subscription.expiresAt
            } : 'Não encontrada'
          });
          
          const urlSubscription = new URL('/subscription', baseUrl);
          const response = NextResponse.redirect(urlSubscription);
          return addNoCacheHeaders(response);
        }
        
        // Se o usuário está tentando acessar o assistente inteligente, verificar se tem o plano premium
        if (pathname.startsWith('/assistant') && subscription.plan !== 'PREMIUM') {
          logDetalhe('Usuário sem acesso premium tentando acessar assistente inteligente', {
            pathname,
            email: token.email,
            plan: subscription.plan
          });
          
          // Redirecionar para o dashboard com parâmetro para mostrar modal de upgrade
          const urlDashboard = new URL('/dashboard', baseUrl);
          urlDashboard.searchParams.set('showUpgradeModal', 'true');
          
          const response = NextResponse.redirect(urlDashboard);
          return addNoCacheHeaders(response);
        }
      } catch (error) {
        console.error('[MIDDLEWARE] Erro ao verificar assinatura:', error);
        // Em caso de erro na verificação, permitir o acesso para evitar bloqueio total
      }
    }
    
    // Usuário autenticado com assinatura válida acessando uma página protegida, permitir acesso
    logDetalhe('Usuário autenticado acessando página protegida, permitindo acesso', {
      pathname,
      email: token.email
    });
    return NextResponse.next();
  } catch (error) {
    // Log detalhado do erro para facilitar o debug
    console.error('[MIDDLEWARE] Erro não tratado no middleware:', error);
    console.error('[MIDDLEWARE] Stack trace:', error instanceof Error ? error.stack : 'Stack não disponível');
    
    // Em caso de erro, permitir o acesso para evitar bloqueio total da aplicação
    // Em produção, pode ser melhor redirecionar para uma página de erro
    return NextResponse.next();
  }
}

// Atualizar o matcher para corresponder exatamente aos PUBLIC_PATHS
export const config = {
  matcher: [
    "/((?!api/auth|auth/login|auth/register|auth/confirm|auth/reset-password|_next|favicon.ico).*)",
  ],
};
