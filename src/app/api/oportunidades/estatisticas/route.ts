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
    console.log(`[API] Obtendo estatísticas de oportunidades para o tenant: ${tenantId}`);
    
    // Buscar oportunidades no DynamoDB
    const oportunidades = await oportunidadeRepository.listarOportunidades(tenantId);
    
    // Calcular estatísticas
    const estatisticas = {
      total: oportunidades.length,
      valorTotal: oportunidades.reduce((total, oportunidade) => total + (oportunidade.valor || 0), 0),
      porStatus: oportunidades.reduce((acc, oportunidade) => {
        if (!acc[oportunidade.status]) {
          acc[oportunidade.status] = 0;
        }
        acc[oportunidade.status]++;
        return acc;
      }, {} as Record<string, number>)
    };
    
    return NextResponse.json({
      status: 'success',
      data: estatisticas
    });
  } catch (error: any) {
    console.error('Erro ao obter estatísticas de oportunidades:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao obter estatísticas de oportunidades',
      error: error.message
    }, { status: 500 });
  }
}
