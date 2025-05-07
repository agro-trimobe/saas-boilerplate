import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { documentoRepository } from '@/lib/repositories';

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
    
    console.log(`[API] Buscando documento ${id} para o tenant: ${tenantId}`);
    
    // Buscar documento no DynamoDB
    const documento = await documentoRepository.buscarDocumentoPorId(tenantId, id);
    
    if (!documento) {
      return NextResponse.json({
        status: 'error',
        message: 'Documento não encontrado'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      data: documento
    });
  } catch (error: any) {
    console.error(`Erro ao buscar documento ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao buscar documento',
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
    const dadosDocumento = await request.json();
    
    console.log(`[API] Atualizando documento ${id} para o tenant: ${tenantId}`);
    
    // Atualizar documento no DynamoDB
    const documentoAtualizado = await documentoRepository.atualizarDocumento(tenantId, id, dadosDocumento);
    
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
    console.error(`Erro ao atualizar documento ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao atualizar documento',
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
    
    console.log(`[API] Excluindo documento ${id} para o tenant: ${tenantId}`);
    
    // Excluir documento no DynamoDB
    const resultado = await documentoRepository.excluirDocumento(tenantId, id);
    
    if (!resultado) {
      return NextResponse.json({
        status: 'error',
        message: 'Documento não encontrado ou não pôde ser excluído'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Documento excluído com sucesso'
    });
  } catch (error: any) {
    console.error(`Erro ao excluir documento ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao excluir documento',
      error: error.message
    }, { status: 500 });
  }
}
