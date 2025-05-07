import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { quadroRepository } from '@/lib/repositories/quadro-repository';
import { listaRepository } from '@/lib/repositories/lista-repository';
import { tarefaRepository } from '@/lib/repositories/tarefa-repository';
import { getUserSession } from '@/lib/user-session';

// GET - Gerar relatórios sobre tarefas
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

    // Verificar o tipo de relatório solicitado
    const url = new URL(req.url);
    const tipoRelatorio = url.searchParams.get('tipo') || 'resumo';
    const quadroId = url.searchParams.get('quadroId');

    let resultado;

    switch (tipoRelatorio) {
      case 'resumo':
        resultado = await gerarRelatorioResumo(tenantId, quadroId);
        break;
      case 'status':
        resultado = await gerarRelatorioStatus(tenantId, quadroId);
        break;
      case 'responsaveis':
        resultado = await gerarRelatorioResponsaveis(tenantId, quadroId);
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de relatório inválido' },
          { status: 400 }
        );
    }

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Gera um relatório resumido com estatísticas gerais
async function gerarRelatorioResumo(tenantId: string, quadroId?: string | null) {
  // Obter todos os quadros ou um específico
  const quadros = quadroId 
    ? [await quadroRepository.buscarQuadroPorId(tenantId, quadroId)]
    : await quadroRepository.listarQuadros(tenantId);

  // Filtrar quadro nulo (caso não exista)
  const quadrosFiltrados = quadros.filter(q => q !== null);
  
  let totalQuadros = quadrosFiltrados.length;
  let totalListas = 0;
  let totalTarefas = 0;
  let tarefasConcluidas = 0;
  let tarefasPendentes = 0;
  
  // Estatísticas por quadro
  const estatisticasPorQuadro = [];

  for (const quadro of quadrosFiltrados) {
    if (!quadro) continue;
    
    const listas = await listaRepository.listarListasPorQuadro(tenantId, quadro.id);
    totalListas += listas.length;
    
    let tarefasQuadro = 0;
    let concluidasQuadro = 0;
    let pendentesQuadro = 0;

    for (const lista of listas) {
      const tarefas = await tarefaRepository.listarTarefasPorLista(tenantId, lista.id);
      tarefasQuadro += tarefas.length;
      
      const tarefasConcluidasLista = tarefas.filter(t => t.concluida).length;
      concluidasQuadro += tarefasConcluidasLista;
      pendentesQuadro += tarefas.length - tarefasConcluidasLista;
    }

    totalTarefas += tarefasQuadro;
    tarefasConcluidas += concluidasQuadro;
    tarefasPendentes += pendentesQuadro;

    estatisticasPorQuadro.push({
      quadroId: quadro.id,
      titulo: quadro.titulo,
      quantidadeListas: listas.length,
      quantidadeTarefas: tarefasQuadro,
      tarefasConcluidas: concluidasQuadro,
      tarefasPendentes: pendentesQuadro,
      progresso: tarefasQuadro > 0 ? Math.round((concluidasQuadro / tarefasQuadro) * 100) : 0
    });
  }

  return {
    resumo: {
      totalQuadros,
      totalListas,
      totalTarefas,
      tarefasConcluidas,
      tarefasPendentes,
      progresso: totalTarefas > 0 ? Math.round((tarefasConcluidas / totalTarefas) * 100) : 0
    },
    detalhes: estatisticasPorQuadro
  };
}

// Gera um relatório com informações sobre o status das tarefas por lista
async function gerarRelatorioStatus(tenantId: string, quadroId?: string | null) {
  // Obter todas as listas do quadro ou de todos os quadros
  let listas = [];
  
  if (quadroId) {
    listas = await listaRepository.listarListasPorQuadro(tenantId, quadroId);
  } else {
    const quadros = await quadroRepository.listarQuadros(tenantId);
    for (const quadro of quadros) {
      const listasDoQuadro = await listaRepository.listarListasPorQuadro(tenantId, quadro.id);
      listas.push(...listasDoQuadro);
    }
  }

  // Estatísticas por lista
  const estatisticasPorLista = [];

  for (const lista of listas) {
    const tarefas = await tarefaRepository.listarTarefasPorLista(tenantId, lista.id);
    
    const porPrioridade = {
      alta: tarefas.filter(t => t.prioridade === 'Alta').length,
      media: tarefas.filter(t => t.prioridade === 'Média').length,
      baixa: tarefas.filter(t => t.prioridade === 'Baixa').length,
      semPrioridade: tarefas.filter(t => !t.prioridade).length,
    };
    
    const porStatus = {
      concluidas: tarefas.filter(t => t.concluida).length,
      pendentes: tarefas.filter(t => !t.concluida).length,
    };
    
    // Verificar tarefas com prazo vencido
    const hoje = new Date();
    const vencidas = tarefas.filter(t => {
      if (!t.concluida && t.dataVencimento) {
        const dataVencimento = new Date(t.dataVencimento);
        return dataVencimento < hoje;
      }
      return false;
    }).length;

    estatisticasPorLista.push({
      listaId: lista.id,
      quadroId: lista.quadroId,
      titulo: lista.titulo,
      quantidadeTarefas: tarefas.length,
      porPrioridade,
      porStatus,
      tarefasVencidas: vencidas
    });
  }

  return {
    estatisticasPorLista
  };
}

// Gera um relatório de tarefas agrupadas por responsáveis
async function gerarRelatorioResponsaveis(tenantId: string, quadroId?: string | null) {
  // Obter todas as tarefas do quadro ou de todos os quadros
  let tarefas = [];
  
  if (quadroId) {
    tarefas = await tarefaRepository.listarTarefasPorQuadro(tenantId, quadroId);
  } else {
    tarefas = await tarefaRepository.listarTarefas(tenantId);
  }

  // Agrupar tarefas por responsável
  const tarefasPorResponsavel: Record<string, {
    responsavel: string,
    total: number,
    concluidas: number,
    pendentes: number,
    vencidas: number,
    tarefas: Array<any>,
    progresso?: number
  }> = {};

  const hoje = new Date();

  for (const tarefa of tarefas) {
    const responsavel = tarefa.responsavel || 'Sem responsável';
    
    if (!tarefasPorResponsavel[responsavel]) {
      tarefasPorResponsavel[responsavel] = {
        responsavel,
        total: 0,
        concluidas: 0,
        pendentes: 0,
        vencidas: 0,
        tarefas: []
      };
    }
    
    tarefasPorResponsavel[responsavel].total++;
    
    if (tarefa.concluida) {
      tarefasPorResponsavel[responsavel].concluidas++;
    } else {
      tarefasPorResponsavel[responsavel].pendentes++;
      
      // Verificar se está vencida
      if (tarefa.dataVencimento) {
        const dataVencimento = new Date(tarefa.dataVencimento);
        if (dataVencimento < hoje) {
          tarefasPorResponsavel[responsavel].vencidas++;
        }
      }
    }
    
    tarefasPorResponsavel[responsavel].tarefas.push({
      id: tarefa.id,
      titulo: tarefa.titulo,
      concluida: tarefa.concluida,
      dataVencimento: tarefa.dataVencimento,
      prioridade: tarefa.prioridade,
      quadroId: tarefa.quadroId,
      listaId: tarefa.listaId
    });
  }

  // Converter para array
  const estatisticasPorResponsavel = Object.values(tarefasPorResponsavel);
  
  // Adicionar porcentagem de conclusão
  estatisticasPorResponsavel.forEach(item => {
    item.progresso = item.total > 0 ? Math.round((item.concluidas / item.total) * 100) : 0;
  });

  return {
    estatisticasPorResponsavel
  };
}
