import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({
        status: 'error',
        message: 'Usuário não autenticado'
      }, { status: 401 });
    }
    
    if (!session.user.tenantId) {
      return NextResponse.json({
        status: 'error',
        message: 'Tenant ID não encontrado na sessão'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      tenantId: session.user.tenantId
    });
  } catch (error: any) {
    console.error('Erro ao obter tenant ID:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao obter tenant ID',
      error: error.message
    }, { status: 500 });
  }
}
