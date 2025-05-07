import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { simulacaoRepository } from '@/lib/repositories';

export async function GET(
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
    
    console.log(`[API] Buscando simulação ${id} para o tenant: ${tenantId}`);
    
    // Buscar simulação no DynamoDB
    const simulacao = await simulacaoRepository.buscarSimulacaoPorId(tenantId, id);
    
    if (!simulacao) {
      return NextResponse.json({
        status: 'error',
        message: 'Simulação não encontrada'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      data: simulacao
    });
  } catch (error: any) {
    console.error(`Erro ao buscar simulação ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao buscar simulação',
      error: error.message
    }, { status: 500 });
  }
}

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
    const simulacaoData = await request.json();
    
    console.log(`[API] Atualizando simulação ${id} para o tenant: ${tenantId}`);
    
    // Atualizar simulação no DynamoDB
    const simulacaoAtualizada = await simulacaoRepository.atualizarSimulacao(tenantId, id, simulacaoData);
    
    if (!simulacaoAtualizada) {
      return NextResponse.json({
        status: 'error',
        message: 'Simulação não encontrada ou não pôde ser atualizada'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      data: simulacaoAtualizada
    });
  } catch (error: any) {
    console.error(`Erro ao atualizar simulação ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao atualizar simulação',
      error: error.message
    }, { status: 500 });
  }
}

export async function DELETE(
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
    
    console.log(`[API] Excluindo simulação ${id} para o tenant: ${tenantId}`);
    
    // Excluir simulação no DynamoDB
    const resultado = await simulacaoRepository.excluirSimulacao(tenantId, id);
    
    if (!resultado) {
      return NextResponse.json({
        status: 'error',
        message: 'Simulação não encontrada ou não pôde ser excluída'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Simulação excluída com sucesso'
    });
  } catch (error: any) {
    console.error(`Erro ao excluir simulação ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao excluir simulação',
      error: error.message
    }, { status: 500 });
  }
}
