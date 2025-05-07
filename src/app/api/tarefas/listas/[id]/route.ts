import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { listaRepository } from '@/lib/repositories/lista-repository';
import { getUserSession } from '@/lib/user-session';

interface RequestContext {
  params: {
    id: string;
  };
}

// GET - Obter uma lista específica
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
    
    // Buscar lista pelo ID
    const lista = await listaRepository.buscarListaPorId(tenantId, id);
    
    if (!lista) {
      return NextResponse.json(
        { error: 'Lista não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ lista });
  } catch (error) {
    console.error(`Erro ao buscar lista ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar uma lista existente
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
    
    // Verificar se a lista existe
    const listaExistente = await listaRepository.buscarListaPorId(tenantId, id);
    if (!listaExistente) {
      return NextResponse.json(
        { error: 'Lista não encontrada' },
        { status: 404 }
      );
    }

    // Obter dados do corpo da requisição
    const listaData = await req.json();

    // Validar dados
    if (!listaData.titulo) {
      return NextResponse.json(
        { error: 'O título da lista é obrigatório' },
        { status: 400 }
      );
    }

    // Atualizar lista
    const listaAtualizada = await listaRepository.atualizarLista(tenantId, id, {
      titulo: listaData.titulo,
      ordem: listaData.ordem,
      cor: listaData.cor,
    });

    return NextResponse.json({ lista: listaAtualizada });
  } catch (error) {
    console.error(`Erro ao atualizar lista ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir uma lista
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
    
    // Verificar se a lista existe
    const listaExistente = await listaRepository.buscarListaPorId(tenantId, id);
    if (!listaExistente) {
      return NextResponse.json(
        { error: 'Lista não encontrada' },
        { status: 404 }
      );
    }

    // Excluir lista
    await listaRepository.excluirLista(tenantId, id);

    return NextResponse.json(
      { mensagem: 'Lista excluída com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Erro ao excluir lista ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
