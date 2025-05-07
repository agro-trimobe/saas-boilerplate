import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { tarefaRepository } from '@/lib/repositories/tarefa-repository';
import { getUserSession } from '@/lib/user-session';

interface RequestContext {
  params: Promise<{
    id: string;
  }>;
}

// GET - Listar tarefas de um quadro específico
export async function GET(req: NextRequest, context: RequestContext) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Obter informações do usuário
    const { tenantId } = await getUserSession();
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Informações do usuário não encontradas' },
        { status: 401 }
      );
    }

    // Aguardar a resolução dos parâmetros antes de acessar suas propriedades
    const params = await context.params;
    const quadroId = params.id;
    
    console.log(`Buscando tarefas do quadro ${quadroId} para o tenant ${tenantId}`);
    
    // Buscar tarefas do quadro
    const tarefas = await tarefaRepository.listarTarefasPorQuadro(tenantId, quadroId);
    
    return NextResponse.json({ tarefas });
  } catch (error) {
    console.error('Erro ao listar tarefas do quadro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
