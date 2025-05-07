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

// POST - Mover uma tarefa entre listas ou alterar sua ordem
export async function POST(req: NextRequest, context: RequestContext) {
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
    const { listaId, ordem } = await req.json();

    // Validar dados
    if (!listaId) {
      return NextResponse.json(
        { error: 'O ID da lista é obrigatório' },
        { status: 400 }
      );
    }

    if (ordem === undefined || ordem === null) {
      return NextResponse.json(
        { error: 'A ordem da tarefa é obrigatória' },
        { status: 400 }
      );
    }

    // Mover a tarefa para a nova lista e/ou posição
    const tarefaAtualizada = await tarefaRepository.atualizarTarefa(tenantId, id, {
      listaId,
      ordem,
    });

    // Se a tarefa foi movida para uma nova lista, reorganizar a ordem das tarefas na lista antiga
    if (listaId !== tarefaExistente.listaId) {
      // Obter todas as tarefas da lista antiga
      const tarefasListaAntiga = await tarefaRepository.listarTarefasPorLista(tenantId, tarefaExistente.listaId);
      
      // Reorganizar a ordem das tarefas na lista antiga
      const tarefasReordenadas = tarefasListaAntiga
        .filter(t => t.id !== id) // Excluir a tarefa movida
        .sort((a, b) => a.ordem - b.ordem); // Ordenar por ordem
      
      // Atualizar a ordem das tarefas na lista antiga
      for (let i = 0; i < tarefasReordenadas.length; i++) {
        if (tarefasReordenadas[i].ordem !== i) {
          await tarefaRepository.atualizarTarefa(tenantId, tarefasReordenadas[i].id, {
            ordem: i,
          });
        }
      }
    }

    // Reorganizar a ordem das tarefas na nova lista
    const tarefasNovaLista = await tarefaRepository.listarTarefasPorLista(tenantId, listaId);
    
    // Filtrar a tarefa movida para evitar duplicidade
    const tarefasSemMovida = tarefasNovaLista.filter(t => t.id !== id);
    
    // Inserir a tarefa movida na posição correta
    const tarefasReordenadas = [
      ...tarefasSemMovida.filter(t => t.ordem < ordem),
      tarefaAtualizada,
      ...tarefasSemMovida.filter(t => t.ordem >= ordem).map(t => ({ ...t, ordem: t.ordem + 1 })),
    ];
    
    // Atualizar a ordem das tarefas na nova lista
    for (let i = 0; i < tarefasReordenadas.length; i++) {
      if (tarefasReordenadas[i].id !== id && tarefasReordenadas[i].ordem !== i) {
        await tarefaRepository.atualizarTarefa(tenantId, tarefasReordenadas[i].id, {
          ordem: i,
        });
      }
    }

    return NextResponse.json({ tarefa: tarefaAtualizada });
  } catch (error) {
    console.error(`Erro ao mover tarefa ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
