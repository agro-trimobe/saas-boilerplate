import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { clienteRepository } from '@/lib/repositories';

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
    
    console.log(`[API] Buscando cliente ${id} para o tenant: ${tenantId}`);
    
    // Buscar cliente no DynamoDB
    const cliente = await clienteRepository.buscarClientePorId(tenantId, id);
    
    if (!cliente) {
      return NextResponse.json({
        status: 'error',
        message: 'Cliente não encontrado'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      data: cliente
    });
  } catch (error: any) {
    console.error(`Erro ao buscar cliente ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao buscar cliente',
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
    const dadosCliente = await request.json();
    
    console.log(`[API] Atualizando cliente ${id} para o tenant: ${tenantId}`);
    
    // Atualizar cliente no DynamoDB
    const clienteAtualizado = await clienteRepository.atualizarCliente(tenantId, id, dadosCliente);
    
    if (!clienteAtualizado) {
      return NextResponse.json({
        status: 'error',
        message: 'Cliente não encontrado ou não pôde ser atualizado'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      data: clienteAtualizado
    });
  } catch (error: any) {
    console.error(`Erro ao atualizar cliente ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao atualizar cliente',
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
    
    console.log(`[API] Excluindo cliente ${id} para o tenant: ${tenantId}`);
    
    // Excluir cliente no DynamoDB
    const resultado = await clienteRepository.excluirCliente(tenantId, id);
    
    if (!resultado) {
      return NextResponse.json({
        status: 'error',
        message: 'Cliente não encontrado ou não pôde ser excluído'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Cliente excluído com sucesso'
    });
  } catch (error: any) {
    console.error(`Erro ao excluir cliente ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao excluir cliente',
      error: error.message
    }, { status: 500 });
  }
}
