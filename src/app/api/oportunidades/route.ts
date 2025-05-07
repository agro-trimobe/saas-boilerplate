import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { oportunidadeRepository } from '@/lib/repositories';

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
    
    console.log(`[API] Listando oportunidades para o tenant: ${tenantId}`);
    
    // Buscar oportunidades no DynamoDB
    const oportunidades = await oportunidadeRepository.listarOportunidades(tenantId);
    
    return NextResponse.json({
      status: 'success',
      data: oportunidades
    });
  } catch (error: any) {
    console.error('Erro ao listar oportunidades:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao listar oportunidades',
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
    const dadosOportunidade = await request.json();
    
    console.log(`[API] Criando oportunidade para o tenant: ${tenantId}`);
    
    // Criar oportunidade no DynamoDB
    const novaOportunidade = await oportunidadeRepository.criarOportunidade(tenantId, dadosOportunidade);
    
    return NextResponse.json({
      status: 'success',
      data: novaOportunidade
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar oportunidade:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao criar oportunidade',
      error: error.message
    }, { status: 500 });
  }
}
