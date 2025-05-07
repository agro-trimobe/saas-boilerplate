'use client';

import { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lista, Tarefa } from '@/lib/crm-utils';
import { TarefaCard } from './tarefa-card';
import { PlusIcon, MoreHorizontalIcon } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface ListaTarefasProps {
  lista: Lista;
  tarefas: Tarefa[];
  cor?: string;
  onAdicionarTarefa: (listaId: string, titulo: string) => void;
  onEditarLista: (lista: Lista) => void;
  onExcluirLista: (lista: Lista) => void;
  onTarefaClick: (tarefa: Tarefa) => void;
  onTarefaUpdate: (tarefa: Tarefa) => void;
}

export function ListaTarefas({ 
  lista, 
  tarefas, 
  cor,
  onAdicionarTarefa, 
  onEditarLista, 
  onExcluirLista,
  onTarefaClick,
  onTarefaUpdate
}: ListaTarefasProps) {
  const [novaTarefaTitulo, setNovaTarefaTitulo] = useState('');
  const [adicionandoTarefa, setAdicionandoTarefa] = useState(false);

  const handleAdicionarTarefa = () => {
    if (novaTarefaTitulo.trim()) {
      onAdicionarTarefa(lista.id, novaTarefaTitulo.trim());
      setNovaTarefaTitulo('');
      setAdicionandoTarefa(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdicionarTarefa();
    } else if (e.key === 'Escape') {
      setAdicionandoTarefa(false);
      setNovaTarefaTitulo('');
    }
  };

  const tarefasOrdenadas = [...tarefas].sort((a, b) => a.ordem - b.ordem);

  const toggleTarefaConcluida = (tarefa: Tarefa) => {
    onTarefaUpdate({
      ...tarefa,
      concluida: !tarefa.concluida,
      dataConclusao: !tarefa.concluida ? new Date().toISOString() : undefined
    });
  };

  return (
    <Card className="min-w-[280px] max-w-[280px] flex flex-col">
      <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0" 
        style={{ borderTop: `3px solid ${cor || lista.cor || '#e2e8f0'}` }}
      >
        <CardTitle className="text-md font-medium">
          <span>{lista.titulo}</span>
          <span className="text-muted-foreground ml-2 text-xs">
            ({tarefas.length})
          </span>
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações da lista</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEditarLista(lista)}>
              Editar lista
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => {
                if (window.confirm(`Excluir a lista "${lista.titulo}"? Todas as tarefas desta lista também serão excluídas.`)) {
                  onExcluirLista(lista);
                }
              }}
            >
              Excluir lista
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pt-0 pb-2">
        <div className="space-y-2">
          {tarefasOrdenadas.map((tarefa) => (
            <TarefaCard 
              key={tarefa.id} 
              tarefa={tarefa} 
              onClick={() => onTarefaClick(tarefa)}
              onToggleComplete={() => toggleTarefaConcluida(tarefa)}
            />
          ))}
          
          {adicionandoTarefa ? (
            <div className="mt-2 p-1">
              <Input
                className="text-sm"
                placeholder="Título da tarefa..."
                value={novaTarefaTitulo}
                onChange={(e) => setNovaTarefaTitulo(e.target.value)}
                onBlur={() => {
                  if (!novaTarefaTitulo.trim()) {
                    setAdicionandoTarefa(false);
                  }
                }}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <div className="flex gap-1 mt-2">
                <Button 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={handleAdicionarTarefa}
                  disabled={!novaTarefaTitulo.trim()}
                >
                  Adicionar
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => setAdicionandoTarefa(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        {!adicionandoTarefa && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-muted-foreground"
            onClick={() => setAdicionandoTarefa(true)}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Adicionar tarefa
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
