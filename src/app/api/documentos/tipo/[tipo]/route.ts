import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { documentoRepository } from '@/lib/repositories';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tipo: string }> }
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
    const { tipo } = await params;
    
    console.log(`[API] Listando documentos do tipo ${tipo} para o tenant: ${tenantId}`);
    
    // Buscar documentos no DynamoDB
    const documentos = await documentoRepository.listarDocumentosPorTipo(tenantId, tipo);
    
    return NextResponse.json({
      status: 'success',
      data: documentos
    });
  } catch (error: any) {
    console.error(`Erro ao listar documentos do tipo ${(await params).tipo}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao listar documentos por tipo',
      error: error.message
    }, { status: 500 });
  }
}
