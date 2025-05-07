import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { calculadoraFinanceira } from '@/lib/calculadora-financeira';

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
    
    // Obter dados do corpo da requisição
    const { valorFinanciamento, taxaJurosAnual, prazoMeses, carenciaMeses } = await request.json();
    
    if (!valorFinanciamento || !taxaJurosAnual || !prazoMeses) {
      return NextResponse.json({
        status: 'error',
        message: 'Parâmetros insuficientes para cálculo'
      }, { status: 400 });
    }
    
    console.log(`[API] Calculando parcela para financiamento: R$ ${valorFinanciamento}, taxa: ${taxaJurosAnual}%, prazo: ${prazoMeses} meses, carência: ${carenciaMeses || 0} meses`);
    
    // Calcular parcela
    const resultado = calculadoraFinanceira.calcularParcela(
      valorFinanciamento,
      taxaJurosAnual,
      prazoMeses,
      carenciaMeses || 0
    );
    
    return NextResponse.json({
      status: 'success',
      data: resultado
    });
  } catch (error: any) {
    console.error('Erro ao calcular parcela:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao calcular parcela',
      error: error.message
    }, { status: 500 });
  }
}
