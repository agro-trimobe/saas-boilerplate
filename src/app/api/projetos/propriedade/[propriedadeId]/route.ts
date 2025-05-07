import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { projetoRepository } from '@/lib/repositories';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propriedadeId: string }> }
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
    const { propriedadeId } = await params;
    
    console.log(`[API] Listando projetos da propriedade ${propriedadeId} para o tenant: ${tenantId}`);
    
    // Buscar projetos no DynamoDB
    const projetos = await projetoRepository.listarProjetosPorPropriedade(tenantId, propriedadeId);
    
    return NextResponse.json({
      status: 'success',
      data: projetos
    });
  } catch (error: any) {
    console.error(`Erro ao listar projetos da propriedade ${(await params).propriedadeId}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao listar projetos por propriedade',
      error: error.message
    }, { status: 500 });
  }
}
