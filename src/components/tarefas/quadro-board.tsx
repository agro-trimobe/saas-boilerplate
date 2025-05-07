'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Quadro, Lista, Tarefa } from '@/lib/crm-utils';
import { ListaKanban } from './lista-kanban';
import { PlusIcon, ArrowLeftIcon } from 'lucide-react';
import { useDragDrop } from './drag-drop-context';

interface QuadroBoardProps {
  quadro: Quadro;
  listas: Lista[];
  tarefas: Record<string, Tarefa[]>;
  onAddLista?: () => void;
  onEditLista?: (lista: Lista) => void;
  onDeleteLista?: (lista: Lista) => void;
  onAddTarefa?: (listaId: string) => void;
  onEditTarefa?: (tarefa: Tarefa) => void;
  onDeleteTarefa?: (tarefa: Tarefa) => void;
  onViewTarefa?: (tarefa: Tarefa) => void;
  onMoveTarefa?: (tarefaId: string, novaListaId: string, novaOrdem: number) => void;
}

export function QuadroBoard({
  quadro,
  listas,
  tarefas,
  onAddLista,
  onEditLista,
  onDeleteLista,
  onAddTarefa,
  onEditTarefa,
  onDeleteTarefa,
  onViewTarefa,
  onMoveTarefa,
}: QuadroBoardProps) {
  const router = useRouter();
  // Usando o contexto de drag-and-drop
  const { dragState } = useDragDrop();

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/tarefas')}
            className="mr-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">{quadro.titulo}</h1>
          {quadro.descricao && (
            <p className="ml-4 text-sm text-muted-foreground">{quadro.descricao}</p>
          )}
        </div>
        
        <div className="flex space-x-2">
          {onAddLista && (
            <Button
              onClick={onAddLista}
              variant="outline"
              size="sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Nova Lista
            </Button>
          )}
        </div>
      </div>
      
      <div 
        className="flex-grow overflow-x-auto p-4 flex space-x-4"
        onDragOver={(e) => e.preventDefault()}
      >
        {listas.map((lista) => (
          <ListaKanban
            key={lista.id}
            lista={lista}
            tarefas={tarefas[lista.id] || []}
            onAddTarefa={onAddTarefa ? () => onAddTarefa(lista.id) : undefined}
            onEditLista={onEditLista ? () => onEditLista(lista) : undefined}
            onDeleteLista={onDeleteLista ? () => onDeleteLista(lista) : undefined}
            onEditTarefa={onEditTarefa}
            onDeleteTarefa={onDeleteTarefa}
            onViewTarefa={onViewTarefa}
          />
        ))}
        
        {onAddLista && (
          <div className="w-72 min-w-[18rem] h-full flex items-start">
            <Button
              variant="outline"
              className="w-full"
              onClick={onAddLista}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Adicionar Lista
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
