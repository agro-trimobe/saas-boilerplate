'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Tarefa, Lista } from '@/lib/crm-utils';

// Interface para os dados de arrastar e soltar
interface DragDropState {
  isDragging: boolean;
  draggedItem: Tarefa | null;
  dragStartListId: string | null;
}

// Interface para as funções do contexto
interface DragDropContextProps {
  dragState: DragDropState;
  startDrag: (tarefa: Tarefa, listaId: string) => void;
  endDrag: () => void;
  moveTarefa: (tarefaId: string, novaListaId: string, novaOrdem: number) => Promise<void>;
  isOverDropZone: (listaId: string) => boolean;
  setOverDropZone: (listaId: string | null) => void;
}

// Propriedades para o provedor do contexto
interface DragDropProviderProps {
  children: ReactNode;
  onMoveTarefa: (tarefaId: string, novaListaId: string, novaOrdem: number) => Promise<void>;
}

// Criar contexto
const DragDropContext = createContext<DragDropContextProps | undefined>(undefined);

// Hook personalizado para usar o contexto
export function useDragDrop() {
  const context = useContext(DragDropContext);
  if (context === undefined) {
    throw new Error('useDragDrop deve ser usado dentro de um DragDropProvider');
  }
  return context;
}

// Provedor do contexto
export function DragDropProvider({ children, onMoveTarefa }: DragDropProviderProps) {
  // Estado para controlar o arraste
  const [dragState, setDragState] = useState<DragDropState>({
    isDragging: false,
    draggedItem: null,
    dragStartListId: null,
  });

  // Estado para controlar a lista sobre a qual o item está sendo arrastado
  const [overDropZoneId, setOverDropZoneId] = useState<string | null>(null);

  // Iniciar o arraste
  const startDrag = (tarefa: Tarefa, listaId: string) => {
    setDragState({
      isDragging: true,
      draggedItem: tarefa,
      dragStartListId: listaId,
    });
  };

  // Terminar o arraste
  const endDrag = () => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      dragStartListId: null,
    });
    setOverDropZoneId(null);
  };

  // Mover a tarefa
  const moveTarefa = async (tarefaId: string, novaListaId: string, novaOrdem: number) => {
    await onMoveTarefa(tarefaId, novaListaId, novaOrdem);
    endDrag();
  };

  // Verificar se o arraste está sobre uma determinada lista
  const isOverDropZone = (listaId: string) => {
    return overDropZoneId === listaId;
  };

  // Definir a lista sobre a qual o arraste está ocorrendo
  const setOverDropZone = (listaId: string | null) => {
    setOverDropZoneId(listaId);
  };

  // Valor do contexto
  const value = {
    dragState,
    startDrag,
    endDrag,
    moveTarefa,
    isOverDropZone,
    setOverDropZone,
  };

  return (
    <DragDropContext.Provider value={value}>
      {children}
    </DragDropContext.Provider>
  );
}

// Componente para a área de soltar
export function DroppableZone({ 
  listaId, 
  tarefas,
  index,
  children 
}: { 
  listaId: string;
  tarefas: Tarefa[];
  index?: number;
  children: ReactNode;
}) {
  const { dragState, setOverDropZone, moveTarefa } = useDragDrop();
  
  // Manipuladores de eventos
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setOverDropZone(listaId);
  };
  
  const handleDragLeave = () => {
    setOverDropZone(null);
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!dragState.draggedItem) return;
    
    // Calcular a posição de ordem para a tarefa
    let novaOrdem = 0;
    
    if (index !== undefined) {
      // Soltar em uma posição específica
      novaOrdem = index;
    } else if (tarefas.length > 0) {
      // Soltar no fim da lista
      novaOrdem = tarefas.length;
    }
    
    // Se a lista de destino é a mesma da origem, ajustar a ordem
    if (listaId === dragState.dragStartListId) {
      const tarefaIndex = tarefas.findIndex(t => t.id === dragState.draggedItem?.id);
      if (tarefaIndex !== -1 && tarefaIndex < index!) {
        novaOrdem--;
      }
    }
    
    await moveTarefa(dragState.draggedItem.id, listaId, novaOrdem);
  };
  
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="h-full"
    >
      {children}
    </div>
  );
}

// Componente para o item arrastável
export function DraggableItem({
  tarefa,
  listaId,
  children
}: {
  tarefa: Tarefa;
  listaId: string;
  children: ReactNode;
}) {
  const { startDrag, dragState } = useDragDrop();
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    startDrag(tarefa, listaId);
  };
  
  const isDragging = dragState.isDragging && dragState.draggedItem?.id === tarefa.id;
  
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      {children}
    </div>
  );
}
