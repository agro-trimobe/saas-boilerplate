import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { oportunidadeRepository } from '@/lib/repositories';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ status: string }> }
) {
  try {
    // Obter a sessão do usuário
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
    
    const tenantId = session.user.tenantId;
    const { status } = await params;
    
    console.log(`[API] Listando oportunidades com status ${status} para o tenant: ${tenantId}`);
    
    // Buscar oportunidades no DynamoDB
    const oportunidades = await oportunidadeRepository.listarOportunidadesPorStatus(tenantId, status);
    
    return NextResponse.json({
      status: 'success',
      data: oportunidades
    });
  } catch (error: any) {
    console.error(`Erro ao listar oportunidades com status ${(await params).status}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao listar oportunidades por status',
      error: error.message
    }, { status: 500 });
  }
}
