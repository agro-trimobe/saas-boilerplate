import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { propriedadeRepository } from '@/lib/repositories';

export async function GET() {
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
    console.log(`[API] Listando propriedades para o tenant: ${tenantId}`);
    
    // Buscar propriedades no DynamoDB
    const propriedades = await propriedadeRepository.listarPropriedades(tenantId);
    
    return NextResponse.json({
      status: 'success',
      data: propriedades
    });
  } catch (error: any) {
    console.error('Erro ao listar propriedades:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao listar propriedades',
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
    const dadosPropriedade = await request.json();
    
    console.log(`[API] Criando propriedade para o tenant: ${tenantId}`);
    
    // Criar propriedade no DynamoDB
    const propriedade = await propriedadeRepository.criarPropriedade(tenantId, dadosPropriedade);
    
    return NextResponse.json({
      status: 'success',
      data: propriedade
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar propriedade:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao criar propriedade',
      error: error.message
    }, { status: 500 });
  }
}
