import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { simulacaoRepository } from '@/lib/repositories';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clienteId: string }> }
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
    const { clienteId } = await params;
    
    console.log(`[API] Listando simulações do cliente ${clienteId} para o tenant: ${tenantId}`);
    
    // Buscar simulações no DynamoDB
    const simulacoes = await simulacaoRepository.listarSimulacoesPorCliente(tenantId, clienteId);
    
    return NextResponse.json({
      status: 'success',
      data: simulacoes
    });
  } catch (error: any) {
    console.error(`Erro ao listar simulações do cliente ${(await params).clienteId}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao listar simulações do cliente',
      error: error.message
    }, { status: 500 });
  }
}
