import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { documentoRepository } from '@/lib/repositories';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ visitaId: string }> }
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
    const { visitaId } = await params;
    
    console.log(`[API] Listando documentos da visita ${visitaId} para o tenant: ${tenantId}`);
    
    // Buscar documentos no DynamoDB
    const documentos = await documentoRepository.listarDocumentosPorVisita(tenantId, visitaId);
    
    return NextResponse.json({
      status: 'success',
      data: documentos
    });
  } catch (error: any) {
    console.error(`Erro ao listar documentos da visita ${(await params).visitaId}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao listar documentos por visita',
      error: error.message
    }, { status: 500 });
  }
}
