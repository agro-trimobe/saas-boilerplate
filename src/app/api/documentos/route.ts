import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { documentoRepository } from '@/lib/repositories';

export async function GET(request: NextRequest) {
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
    
    console.log(`[API] Listando documentos para o tenant: ${tenantId}`);
    
    // Buscar documentos no DynamoDB
    const documentos = await documentoRepository.listarDocumentos(tenantId);
    
    return NextResponse.json({
      status: 'success',
      data: documentos
    });
  } catch (error: any) {
    console.error('Erro ao listar documentos:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao listar documentos',
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    
    // Obter dados do corpo da requisição
    const dadosDocumento = await request.json();
    
    console.log(`[API] Criando documento para o tenant: ${tenantId}`);
    
    // Criar documento no DynamoDB
    const novoDocumento = await documentoRepository.criarDocumento(tenantId, dadosDocumento);
    
    return NextResponse.json({
      status: 'success',
      data: novoDocumento
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar documento:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao criar documento',
      error: error.message
    }, { status: 500 });
  }
}
