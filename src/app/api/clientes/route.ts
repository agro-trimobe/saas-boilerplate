import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { clienteRepository } from '@/lib/repositories';

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
    
    console.log(`[API] Listando clientes para o tenant: ${tenantId}`);
    
    // Buscar clientes no DynamoDB
    const clientes = await clienteRepository.listarClientes(tenantId);
    
    return NextResponse.json({
      status: 'success',
      data: clientes
    });
  } catch (error: any) {
    console.error('Erro ao listar clientes:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao listar clientes',
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
    const dadosCliente = await request.json();
    
    console.log(`[API] Criando cliente para o tenant: ${tenantId}`);
    
    // Criar cliente no DynamoDB
    const novoCliente = await clienteRepository.criarCliente(tenantId, dadosCliente);
    
    return NextResponse.json({
      status: 'success',
      data: novoCliente
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar cliente:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao criar cliente',
      error: error.message
    }, { status: 500 });
  }
}
