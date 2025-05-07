import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { projetoRepository } from '@/lib/repositories';

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
    
    console.log(`[API] Buscando projeto ${id} para o tenant: ${tenantId}`);
    
    // Buscar projeto no DynamoDB
    const projeto = await projetoRepository.buscarProjetoPorId(tenantId, id);
    
    if (!projeto) {
      return NextResponse.json({
        status: 'error',
        message: 'Projeto não encontrado'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      data: projeto
    });
  } catch (error: any) {
    console.error(`Erro ao buscar projeto ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao buscar projeto',
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
    const dadosProjeto = await request.json();
    
    console.log(`[API] Atualizando projeto ${id} para o tenant: ${tenantId}`);
    
    // Atualizar projeto no DynamoDB
    const projetoAtualizado = await projetoRepository.atualizarProjeto(tenantId, id, dadosProjeto);
    
    if (!projetoAtualizado) {
      return NextResponse.json({
        status: 'error',
        message: 'Projeto não encontrado ou não pôde ser atualizado'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      data: projetoAtualizado
    });
  } catch (error: any) {
    console.error(`Erro ao atualizar projeto ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao atualizar projeto',
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
    
    console.log(`[API] Excluindo projeto ${id} para o tenant: ${tenantId}`);
    
    // Excluir projeto no DynamoDB
    const resultado = await projetoRepository.excluirProjeto(tenantId, id);
    
    if (!resultado) {
      return NextResponse.json({
        status: 'error',
        message: 'Projeto não encontrado ou não pôde ser excluído'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Projeto excluído com sucesso'
    });
  } catch (error: any) {
    console.error(`Erro ao excluir projeto ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao excluir projeto',
      error: error.message
    }, { status: 500 });
  }
}
