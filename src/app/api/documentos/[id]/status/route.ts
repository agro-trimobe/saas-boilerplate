import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { documentoRepository } from '@/lib/repositories';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;
    
    // Obter dados do corpo da requisição
    const { status } = await request.json();
    
    if (!status) {
      return NextResponse.json({
        status: 'error',
        message: 'Status não fornecido'
      }, { status: 400 });
    }
    
    console.log(`[API] Atualizando status do documento ${id} para ${status} (tenant: ${tenantId})`);
    
    // Atualizar status do documento no DynamoDB
    const documentoAtualizado = await documentoRepository.atualizarStatusDocumento(tenantId, id, status);
    
    if (!documentoAtualizado) {
      return NextResponse.json({
        status: 'error',
        message: 'Documento não encontrado ou não pôde ser atualizado'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      data: documentoAtualizado
    });
  } catch (error: any) {
    console.error(`Erro ao atualizar status do documento ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao atualizar status do documento',
      error: error.message
    }, { status: 500 });
  }
}
