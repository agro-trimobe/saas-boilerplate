import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/auth-options';
import { createUserSubscription, checkUserSubscription, updateSubscriptionPlan, cancelUserSubscription } from '@/lib/subscription-service';
import { SubscriptionPlan } from '@/lib/types/subscription';

// Endpoint para obter o status da assinatura do usuário
export async function GET(request: NextRequest) {
  try {
    console.log('Recebida solicitação para verificar assinatura');
    
    // Obter sessão do usuário
    const session = await getServerSession(authOptions);
    console.log('Status da sessão:', {
      temSessao: !!session,
      temUsuario: !!session?.user,
      dadosUsuario: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        // @ts-ignore - verificar se esses campos existem
        tenantId: session.user.tenantId,
        // @ts-ignore - verificar se esses campos existem
        cognitoId: session.user.cognitoId
      } : 'Não disponível'
    });

    if (!session || !session.user) {
      console.log('Usuário não autenticado ao acessar API de assinatura');
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // @ts-ignore - estamos usando a versão customizada que contém tenantId e cognitoId
    const tenantId = session.user.tenantId;
    // @ts-ignore - o ID do usuário no Cognito está no sub do token
    const cognitoId = session.user.cognitoId;

    if (!tenantId || !cognitoId) {      
      return NextResponse.json(
        { error: 'Dados do usuário incompletos' },
        { status: 400 }
      );
    }

    // Verificar status da assinatura
    const subscription = await checkUserSubscription(tenantId, cognitoId);

    return NextResponse.json({
      subscription,
      user: {
        name: session.user.name,
        email: session.user.email
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao verificar assinatura' },
      { status: 500 }
    );
  }
}

// Endpoint para criar ou atualizar assinatura
export async function POST(request: NextRequest) {
  try {
    // Obter sessão do usuário
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // @ts-ignore - estamos usando a versão customizada que contém tenantId e cognitoId
    const tenantId = session.user.tenantId;
    // @ts-ignore - o ID do usuário no Cognito está no sub do token
    const cognitoId = session.user.cognitoId;

    if (!tenantId || !cognitoId) {      
      return NextResponse.json(
        { error: 'Dados do usuário incompletos' },
        { status: 400 }
      );
    }

    // Obter dados do corpo da requisição
    const body = await request.json();

    // Validação básica
    if (!body.plan || !['BASIC', 'PREMIUM'].includes(body.plan)) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      );
    }

    if (!body.paymentData) {
      return NextResponse.json(
        { error: 'Dados de pagamento ausentes' },
        { status: 400 }
      );
    }
    
    // Obter IP do cliente para registro na Asaas
    const forwardedFor = request.headers.get('x-forwarded-for');
    const remoteIp = forwardedFor ? forwardedFor.split(',')[0].trim() : request.headers.get('x-real-ip') || '127.0.0.1';
    
    try {
      const result = await createUserSubscription(
        tenantId,
        cognitoId,
        {
          name: session.user.name || '',
          email: session.user.email || '',
          cpfCnpj: body.cpfCnpj,
        },
        {
          plan: body.plan as SubscriptionPlan,
          creditCard: body.paymentData.creditCard,
          address: body.paymentData.address,
          remoteIp: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
        }
      );
      
      return NextResponse.json({
        success: true,
        message: 'Assinatura criada com sucesso',
        subscription: result.subscription
      });
    } catch (error) {
      return NextResponse.json(
        { 
          error: error instanceof Error ? error.message : 'Erro ao processar assinatura',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro inesperado ao processar requisição' },
      { status: 500 }
    );
  }
}

// Endpoint para atualizar plano de assinatura
export async function PUT(request: NextRequest) {
  try {
    // Obter sessão do usuário
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // @ts-ignore - estamos usando a versão customizada que contém tenantId e cognitoId
    const tenantId = session.user.tenantId;
    // @ts-ignore - o ID do usuário no Cognito está no sub do token
    const cognitoId = session.user.cognitoId;

    if (!tenantId || !cognitoId) {
      return NextResponse.json(
        { error: 'Dados do usuário incompletos' },
        { status: 400 }
      );
    }

    // Obter dados do corpo da requisição
    const body = await request.json();

    // Validação básica
    if (!body.plan || !['BASIC', 'PREMIUM'].includes(body.plan)) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      );
    }

    try {
      // Atualizar plano
      const result = await updateSubscriptionPlan(
        tenantId,
        cognitoId,
        body.plan as SubscriptionPlan
      );
      
      return NextResponse.json({
        success: true,
        message: 'Plano atualizado com sucesso',
        subscription: result
      });
    } catch (error) {
      return NextResponse.json(
        { 
          error: error instanceof Error ? error.message : 'Erro ao atualizar plano',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro inesperado ao processar requisição' },
      { status: 500 }
    );
  }
}
