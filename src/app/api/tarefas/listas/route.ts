import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { listaRepository } from '@/lib/repositories/lista-repository';
import { getUserSession } from '@/lib/user-session';

// GET - Listar listas (com opção de filtrar por quadro)
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

    // Verificar se há parâmetro de filtro por quadro
    const url = new URL(req.url);
    const quadroId = url.searchParams.get('quadroId');

    let listas;
    if (quadroId) {
      // Listar listas de um quadro específico
      listas = await listaRepository.listarListasPorQuadro(tenantId, quadroId);
    } else {
      // Listar todas as listas
      listas = await listaRepository.listarListas(tenantId);
    }

    return NextResponse.json({ listas });
  } catch (error) {
    console.error('Erro ao listar listas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar uma nova lista
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
    const listaData = await req.json();

    // Validar dados
    if (!listaData.titulo) {
      return NextResponse.json(
        { error: 'O título da lista é obrigatório' },
        { status: 400 }
      );
    }

    if (!listaData.quadroId) {
      return NextResponse.json(
        { error: 'O ID do quadro é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar listas existentes para determinar a ordem
    const listasExistentes = await listaRepository.listarListasPorQuadro(tenantId, listaData.quadroId);
    const ordem = listaData.ordem !== undefined ? listaData.ordem : listasExistentes.length;

    // Criar nova lista
    const novaLista = await listaRepository.criarLista(tenantId, {
      titulo: listaData.titulo,
      quadroId: listaData.quadroId,
      ordem,
      cor: listaData.cor,
    });

    return NextResponse.json({ lista: novaLista }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar lista:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
