import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { oportunidadeRepository } from '@/lib/repositories';

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
    
    console.log(`[API] Buscando oportunidade ${id} para o tenant: ${tenantId}`);
    
    // Buscar oportunidade no DynamoDB
    const oportunidade = await oportunidadeRepository.buscarOportunidadePorId(tenantId, id);
    
    if (!oportunidade) {
      return NextResponse.json({
        status: 'error',
        message: 'Oportunidade não encontrada'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      data: oportunidade
    });
  } catch (error: any) {
    console.error(`Erro ao buscar oportunidade ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao buscar oportunidade',
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
    const dadosOportunidade = await request.json();
    
    console.log(`[API] Atualizando oportunidade ${id} para o tenant: ${tenantId}`);
    
    // Atualizar oportunidade no DynamoDB
    const oportunidadeAtualizada = await oportunidadeRepository.atualizarOportunidade(tenantId, id, dadosOportunidade);
    
    if (!oportunidadeAtualizada) {
      return NextResponse.json({
        status: 'error',
        message: 'Oportunidade não encontrada ou não pôde ser atualizada'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      data: oportunidadeAtualizada
    });
  } catch (error: any) {
    console.error(`Erro ao atualizar oportunidade ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao atualizar oportunidade',
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
    
    console.log(`[API] Excluindo oportunidade ${id} para o tenant: ${tenantId}`);
    
    // Excluir oportunidade no DynamoDB
    const resultado = await oportunidadeRepository.excluirOportunidade(tenantId, id);
    
    if (!resultado) {
      return NextResponse.json({
        status: 'error',
        message: 'Oportunidade não encontrada ou não pôde ser excluída'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Oportunidade excluída com sucesso'
    });
  } catch (error: any) {
    console.error(`Erro ao excluir oportunidade ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao excluir oportunidade',
      error: error.message
    }, { status: 500 });
  }
}
