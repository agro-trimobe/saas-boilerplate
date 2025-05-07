'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, SearchIcon, LayoutGridIcon, LayoutListIcon } from 'lucide-react';
import { QuadroCard } from '@/components/tarefas/quadro-card';
import { CriarQuadroDialog } from '@/components/tarefas/criar-quadro-dialog';
import { EstadoVazio } from '@/components/tarefas/estado-vazio';
import { Quadro, Tarefa } from '@/lib/crm-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export default function TarefasPage() {
  const router = useRouter();
  const [quadros, setQuadros] = useState<Quadro[]>([]);
  const [tarefas, setTarefas] = useState<Record<string, Tarefa[]>>({});
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [quadroParaEditar, setQuadroParaEditar] = useState<Quadro | undefined>(undefined);
  const [busca, setBusca] = useState('');
  const [visualizacao, setVisualizacao] = useState<'grid' | 'lista'>('grid');

  // Carregar os quadros e tarefas ao montar o componente
  useEffect(() => {
    carregarQuadros();
  }, []);

  const carregarQuadros = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tarefas/quadros');
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar quadros: ${response.status}`);
      }
      
      const data = await response.json();
      const quadrosRecebidos = data.quadros || [];
      setQuadros(quadrosRecebidos);
      
      // Carregar tarefas para cada quadro
      const tarefasPorQuadro: Record<string, Tarefa[]> = {};
      
      for (const quadro of quadrosRecebidos) {
        try {
          const respTarefas = await fetch(`/api/tarefas/quadros/${quadro.id}/tarefas`);
          if (respTarefas.ok) {
            const dataTarefas = await respTarefas.json();
            tarefasPorQuadro[quadro.id] = dataTarefas.tarefas || [];
          }
        } catch (e) {
          console.error(`Erro ao carregar tarefas do quadro ${quadro.id}:`, e);
          tarefasPorQuadro[quadro.id] = [];
        }
      }
      
      setTarefas(tarefasPorQuadro);
    } catch (error) {
      console.error('Erro ao carregar quadros:', error);
      toast({
        title: 'Erro ao carregar quadros',
        description: 'Não foi possível carregar os quadros. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar quadros com base na busca
  const quadrosFiltrados = quadros.filter(quadro => 
    quadro.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    (quadro.descricao && quadro.descricao.toLowerCase().includes(busca.toLowerCase()))
  );

  const handleCriarQuadro = () => {
    setQuadroParaEditar(undefined);
    setOpenDialog(true);
  };

  const handleEditarQuadro = (quadro: Quadro) => {
    setQuadroParaEditar(quadro);
    setOpenDialog(true);
  };

  const handleExcluirQuadro = async (quadro: Quadro) => {
    if (!confirm(`Tem certeza que deseja excluir o quadro "${quadro.titulo}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tarefas/quadros/${quadro.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir quadro: ${response.status}`);
      }

      toast({
        title: 'Quadro excluído',
        description: 'O quadro foi excluído com sucesso.',
      });

      // Atualizar a lista de quadros
      carregarQuadros();
    } catch (error) {
      console.error('Erro ao excluir quadro:', error);
      toast({
        title: 'Erro ao excluir quadro',
        description: 'Não foi possível excluir o quadro. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const handleSalvarQuadro = async (quadroData: Partial<Quadro>) => {
    try {
      const isEdicao = !!quadroParaEditar;
      const url = isEdicao 
        ? `/api/tarefas/quadros/${quadroParaEditar.id}` 
        : '/api/tarefas/quadros';
      
      const method = isEdicao ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quadroData),
      });

      if (!response.ok) {
        throw new Error(`Erro ao ${isEdicao ? 'atualizar' : 'criar'} quadro: ${response.status}`);
      }

      toast({
        title: isEdicao ? 'Quadro atualizado' : 'Quadro criado',
        description: isEdicao 
          ? 'O quadro foi atualizado com sucesso.' 
          : 'O quadro foi criado com sucesso.',
      });

      // Atualizar a lista de quadros
      carregarQuadros();
    } catch (error) {
      console.error('Erro ao salvar quadro:', error);
      toast({
        title: 'Erro ao salvar quadro',
        description: 'Não foi possível salvar o quadro. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestão de Tarefas</h1>
          <Button onClick={handleCriarQuadro}>
            <PlusIcon className="mr-2 h-4 w-4" /> Novo Quadro
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar quadros..."
              className="pl-8"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          
          <ToggleGroup type="single" value={visualizacao} onValueChange={(value: string) => value && setVisualizacao(value as 'grid' | 'lista')}
            className="hidden sm:inline-flex"
          >
            <ToggleGroupItem value="grid" aria-label="Visualização em grid">
              <LayoutGridIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="lista" aria-label="Visualização em lista">
              <LayoutListIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {loading ? (
        <div className={`mt-6 ${visualizacao === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <Skeleton className="h-6 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="px-6 py-3 bg-muted">
                  <Skeleton className="h-8 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : quadrosFiltrados.length === 0 ? (
        busca ? (
          <div className="text-center p-8 mt-6">
            <p className="mb-4">Nenhum quadro encontrado para a busca "{busca}"</p>
            <Button variant="outline" onClick={() => setBusca('')}>Limpar busca</Button>
          </div>
        ) : (
          <EstadoVazio onCriarQuadro={handleCriarQuadro} />
        )
      ) : (
        <div className={`mt-6 ${visualizacao === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}`}>
          {quadrosFiltrados.map((quadro) => (
            <QuadroCard
              key={quadro.id}
              quadro={quadro}
              tarefas={tarefas[quadro.id]}
              onEdit={handleEditarQuadro}
              onDelete={handleExcluirQuadro}
            />
          ))}
        </div>
      )}

      <CriarQuadroDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        quadro={quadroParaEditar}
        onSave={handleSalvarQuadro}
      />
    </div>
  );
}
