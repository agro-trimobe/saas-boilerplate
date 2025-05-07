import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/auth-options';
import { createUserSubscription, checkUserSubscription, updateSubscriptionPlan } from '@/lib/subscription-service';
import { SubscriptionPlan } from '@/lib/types/subscription';

// Endpoint para obter o status da assinatura do usuário
export async function GET(request: NextRequest) {
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
      console.error('[API/subscription] Dados do usuário incompletos:', {
        temTenantId: !!tenantId,
        temCognitoId: !!cognitoId
      });
      
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
    console.error('[API/subscription] Erro ao obter status da assinatura:', error);
    
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
      console.error('[API/subscription] Dados do usuário incompletos:', {
        temTenantId: !!tenantId,
        temCognitoId: !!cognitoId
      });
      
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
    
    // Criar ou atualizar assinatura
    const result = await createUserSubscription(
      tenantId,
      cognitoId,
      {
        name: session.user.name || '',
        email: session.user.email || '',
        cpfCnpj: body.userData.cpfCnpj,
      },
      {
        plan: body.plan as SubscriptionPlan,
        creditCard: body.paymentData.creditCard,
        address: body.paymentData.address,
        remoteIp
      }
    );

    return NextResponse.json({
      success: true,
      subscription: result.subscription
    });
  } catch (error) {
    console.error('[API/subscription] Erro ao processar assinatura:', error);
    
    // Mapear erros de pagamento
    let status = 500;
    let message = 'Erro interno ao processar assinatura';
    
    if (error instanceof Error) {
      message = error.message;
      
      // Erros de pagamento
      if (message.includes('cartão') || message.includes('pagamento')) {
        status = 402; // Payment Required
      }
      // Erros de dados inválidos
      else if (message.includes('inválid') || message.includes('ausente')) {
        status = 400; // Bad Request
      }
      // Erros de recurso já existente
      else if (message.includes('já existe')) {
        status = 409; // Conflict
      }
    }
    
    return NextResponse.json(
      { error: message },
      { status }
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
      console.error('[API/subscription] Dados do usuário incompletos:', {
        temTenantId: !!tenantId,
        temCognitoId: !!cognitoId
      });
      
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

    // Atualizar plano
    const updatedSubscription = await updateSubscriptionPlan(
      tenantId,
      cognitoId,
      body.plan as SubscriptionPlan
    );

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription
    });
  } catch (error) {
    console.error('[API/subscription] Erro ao atualizar plano:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao atualizar plano' },
      { status: 500 }
    );
  }
}
