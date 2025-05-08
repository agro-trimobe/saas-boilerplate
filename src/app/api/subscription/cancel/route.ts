import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/auth-options';
import { cancelUserSubscription } from '@/lib/subscription-service';

// Endpoint para cancelar assinatura
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

    // Cancelar assinatura
    const result = await cancelUserSubscription(tenantId, cognitoId);
    
    return NextResponse.json({
      success: true,
      message: 'Assinatura cancelada com sucesso',
      subscription: result
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro ao cancelar assinatura',
      },
      { status: 500 }
    );
  }
}
