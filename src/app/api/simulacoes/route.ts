import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { simulacaoRepository } from '@/lib/repositories';

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
    
    console.log(`[API] Listando simulações para o tenant: ${tenantId}`);
    
    // Buscar simulações no DynamoDB
    const simulacoes = await simulacaoRepository.listarSimulacoes(tenantId);
    
    return NextResponse.json({
      status: 'success',
      data: simulacoes
    });
  } catch (error: any) {
    console.error('Erro ao listar simulações:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao listar simulações',
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
    const dadosSimulacao = await request.json();
    
    console.log(`[API] Criando simulação para o tenant: ${tenantId}`);
    
    // Criar simulação no DynamoDB
    const novaSimulacao = await simulacaoRepository.criarSimulacao(tenantId, dadosSimulacao);
    
    return NextResponse.json({
      status: 'success',
      data: novaSimulacao
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar simulação:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao criar simulação',
      error: error.message
    }, { status: 500 });
  }
}
