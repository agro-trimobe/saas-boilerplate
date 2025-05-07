import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { projetoRepository } from '@/lib/repositories';

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
    
    console.log(`[API] Listando projetos para o tenant: ${tenantId}`);
    
    // Buscar projetos no DynamoDB
    const projetos = await projetoRepository.listarProjetos(tenantId);
    
    return NextResponse.json({
      status: 'success',
      data: projetos
    });
  } catch (error: any) {
    console.error('Erro ao listar projetos:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao listar projetos',
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
    const dadosProjeto = await request.json();
    
    console.log(`[API] Criando projeto para o tenant: ${tenantId}`);
    
    // Criar projeto no DynamoDB
    const novoProjeto = await projetoRepository.criarProjeto(tenantId, dadosProjeto);
    
    return NextResponse.json({
      status: 'success',
      data: novoProjeto
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar projeto:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao criar projeto',
      error: error.message
    }, { status: 500 });
  }
}
