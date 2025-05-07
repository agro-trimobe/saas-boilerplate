import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { tarefaRepository } from '@/lib/repositories/tarefa-repository';
import { getUserSession } from '@/lib/user-session';

interface RequestContext {
  params: {
    id: string;
  };
}

// GET - Obter uma tarefa específica
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

    const { id } = context.params;
    
    // Buscar tarefa pelo ID
    const tarefa = await tarefaRepository.buscarTarefaPorId(tenantId, id);
    
    if (!tarefa) {
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tarefa });
  } catch (error) {
    console.error(`Erro ao buscar tarefa ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar uma tarefa existente
export async function PUT(req: NextRequest, context: RequestContext) {
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

    const { id } = context.params;
    
    // Verificar se a tarefa existe
    const tarefaExistente = await tarefaRepository.buscarTarefaPorId(tenantId, id);
    if (!tarefaExistente) {
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }

    // Obter dados do corpo da requisição
    const tarefaData = await req.json();

    // Validar dados
    if (!tarefaData.titulo) {
      return NextResponse.json(
        { error: 'O título da tarefa é obrigatório' },
        { status: 400 }
      );
    }

    // Atualizar tarefa
    const tarefaAtualizada = await tarefaRepository.atualizarTarefa(tenantId, id, {
      titulo: tarefaData.titulo,
      descricao: tarefaData.descricao,
      ordem: tarefaData.ordem,
      dataVencimento: tarefaData.dataVencimento,
      prioridade: tarefaData.prioridade,
      etiquetas: tarefaData.etiquetas,
      responsavel: tarefaData.responsavel,
    });

    return NextResponse.json({ tarefa: tarefaAtualizada });
  } catch (error) {
    console.error(`Erro ao atualizar tarefa ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir uma tarefa
export async function DELETE(req: NextRequest, context: RequestContext) {
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

    const { id } = context.params;
    
    // Verificar se a tarefa existe
    const tarefaExistente = await tarefaRepository.buscarTarefaPorId(tenantId, id);
    if (!tarefaExistente) {
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }

    // Excluir tarefa
    await tarefaRepository.excluirTarefa(tenantId, id);

    return NextResponse.json(
      { mensagem: 'Tarefa excluída com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Erro ao excluir tarefa ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
