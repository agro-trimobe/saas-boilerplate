import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { tarefaRepository } from '@/lib/repositories/tarefa-repository';
import { getUserSession } from '@/lib/user-session';

// GET - Listar tarefas (com opção de filtrar por quadro ou lista)
export async function GET(req: NextRequest) {
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

    // Verificar se há parâmetros de filtro
    const url = new URL(req.url);
    const quadroId = url.searchParams.get('quadroId');
    const listaId = url.searchParams.get('listaId');

    let tarefas;
    if (listaId) {
      // Listar tarefas de uma lista específica
      tarefas = await tarefaRepository.listarTarefasPorLista(tenantId, listaId);
    } else if (quadroId) {
      // Listar tarefas de um quadro específico
      tarefas = await tarefaRepository.listarTarefasPorQuadro(tenantId, quadroId);
    } else {
      // Listar todas as tarefas
      tarefas = await tarefaRepository.listarTarefas(tenantId);
    }

    return NextResponse.json({ tarefas });
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar uma nova tarefa
export async function POST(req: NextRequest) {
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

    // Obter dados do corpo da requisição
    const tarefaData = await req.json();

    // Validar dados
    if (!tarefaData.titulo) {
      return NextResponse.json(
        { error: 'O título da tarefa é obrigatório' },
        { status: 400 }
      );
    }

    if (!tarefaData.listaId) {
      return NextResponse.json(
        { error: 'O ID da lista é obrigatório' },
        { status: 400 }
      );
    }

    if (!tarefaData.quadroId) {
      return NextResponse.json(
        { error: 'O ID do quadro é obrigatório' },
        { status: 400 }
      );
    }

    // Criar nova tarefa
    const novaTarefa = await tarefaRepository.criarTarefa(tenantId, {
      titulo: tarefaData.titulo,
      descricao: tarefaData.descricao,
      listaId: tarefaData.listaId,
      quadroId: tarefaData.quadroId,
      ordem: tarefaData.ordem,
      dataVencimento: tarefaData.dataVencimento,
      prioridade: tarefaData.prioridade,
      etiquetas: tarefaData.etiquetas,
      responsavel: tarefaData.responsavel,
    });

    return NextResponse.json({ tarefa: novaTarefa }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
