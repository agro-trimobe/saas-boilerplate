import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { quadroRepository } from '@/lib/repositories/quadro-repository';
import { Quadro } from '@/lib/crm-utils';
import { getUserSession } from '@/lib/user-session';

// GET - Listar todos os quadros
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

    // Obter quadros do repositório
    const quadros = await quadroRepository.listarQuadros(tenantId);

    return NextResponse.json({ quadros });
  } catch (error) {
    console.error('Erro ao listar quadros:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar um novo quadro
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
    const quadroData = await req.json();

    // Validar dados
    if (!quadroData.titulo) {
      return NextResponse.json(
        { error: 'O título do quadro é obrigatório' },
        { status: 400 }
      );
    }

    // Criar novo quadro
    const novoQuadro = await quadroRepository.criarQuadro(tenantId, {
      titulo: quadroData.titulo,
      descricao: quadroData.descricao,
      cor: quadroData.cor,
    });

    return NextResponse.json({ quadro: novoQuadro }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar quadro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
