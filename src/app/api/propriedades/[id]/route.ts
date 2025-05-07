import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { propriedadeRepository } from '@/lib/repositories';

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
    
    console.log(`[API] Buscando propriedade ${id} para o tenant: ${tenantId}`);
    
    // Buscar propriedade no DynamoDB
    const propriedade = await propriedadeRepository.buscarPropriedadePorId(tenantId, id);
    
    if (!propriedade) {
      return NextResponse.json({
        status: 'error',
        message: 'Propriedade não encontrada'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      data: propriedade
    });
  } catch (error: any) {
    console.error(`Erro ao buscar propriedade ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao buscar propriedade',
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
    const dadosPropriedade = await request.json();
    
    console.log(`[API] Atualizando propriedade ${id} para o tenant: ${tenantId}`);
    
    // Atualizar propriedade no DynamoDB
    const propriedadeAtualizada = await propriedadeRepository.atualizarPropriedade(tenantId, id, dadosPropriedade);
    
    if (!propriedadeAtualizada) {
      return NextResponse.json({
        status: 'error',
        message: 'Propriedade não encontrada ou não pôde ser atualizada'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      data: propriedadeAtualizada
    });
  } catch (error: any) {
    console.error(`Erro ao atualizar propriedade ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao atualizar propriedade',
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
    
    console.log(`[API] Excluindo propriedade ${id} para o tenant: ${tenantId}`);
    
    // Excluir propriedade no DynamoDB
    const resultado = await propriedadeRepository.excluirPropriedade(tenantId, id);
    
    if (!resultado) {
      return NextResponse.json({
        status: 'error',
        message: 'Propriedade não encontrada ou não pôde ser excluída'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Propriedade excluída com sucesso'
    });
  } catch (error: any) {
    console.error(`Erro ao excluir propriedade ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao excluir propriedade',
      error: error.message
    }, { status: 500 });
  }
}
