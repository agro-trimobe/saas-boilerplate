'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tarefa } from '@/lib/crm-utils';
import { formatarData } from '@/lib/formatters';
import { 
  AlarmClockIcon, 
  CheckSquareIcon,
  MoreHorizontalIcon, 
  PenIcon, 
  SquareIcon,
  TagIcon, 
  TrashIcon,
  UserIcon,
  CalendarIcon,
  HomeIcon,
  FileTextIcon,
  UserCircleIcon,
  EyeIcon
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDragDrop, DraggableItem } from './drag-drop-context';

interface TarefaCardProps {
  tarefa: Tarefa;
  onClick?: () => void;
  onEdit?: (tarefa: Tarefa) => void;
  onDelete?: (tarefa: Tarefa) => void;
  onView?: (tarefa: Tarefa) => void;
  onToggleComplete?: () => void;
}

export function TarefaCard({ 
  tarefa, 
  onClick, 
  onEdit, 
  onDelete, 
  onView,
  onToggleComplete
}: TarefaCardProps) {

  // Usando o contexto de drag-and-drop
  const { dragState } = useDragDrop();
  
  // Verificando se este item está sendo arrastado
  const isDragging = dragState.isDragging && dragState.draggedItem?.id === tarefa.id;

  // Função para determinar a cor de fundo baseada na prioridade
  const getPrioridadeBgColor = (prioridade?: string) => {
    switch (prioridade) {
      case 'Alta':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Média':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Baixa':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <DraggableItem tarefa={tarefa} listaId={tarefa.listaId}>
      <Card 
        className={`cursor-pointer hover:shadow-sm transition-shadow border-t-2 ${
          tarefa.concluida ? 'bg-muted/50' : ''
        } cursor-grab active:cursor-grabbing ${
          isDragging ? 'opacity-50 shadow-md' : ''
        } ${
          tarefa.prioridade === 'Alta' ? 'border-t-red-500' :
          tarefa.prioridade === 'Média' ? 'border-t-amber-500' :
          tarefa.prioridade === 'Baixa' ? 'border-t-green-500' :
          'border-t-transparent'
        }`}
        onClick={handleClick}
      >
      <CardContent className="p-3">
        <div className="flex gap-2">
          {onToggleComplete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete();
              }}
            >
              {tarefa.concluida ? (
                <CheckSquareIcon className="h-4 w-4 text-primary" />
              ) : (
                <SquareIcon className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className={`font-medium text-sm line-clamp-2 ${tarefa.concluida ? 'line-through text-muted-foreground' : ''}`}>
                {tarefa.titulo}
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-1 rounded-full"
                  >
                    <MoreHorizontalIcon className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {onToggleComplete && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onToggleComplete();
                    }}>
                      {tarefa.concluida ? (
                        <>
                          <SquareIcon className="h-3.5 w-3.5 mr-2" />
                          Marcar como pendente
                        </>
                      ) : (
                        <>
                          <CheckSquareIcon className="h-3.5 w-3.5 mr-2" />
                          Marcar como concluída
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  {onView && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onView(tarefa);
                    }}>
                      <EyeIcon className="h-3.5 w-3.5 mr-2" />
                      Ver detalhes
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onEdit(tarefa);
                    }}>
                      <PenIcon className="h-3.5 w-3.5 mr-2" />
                      Editar tarefa
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(tarefa);
                      }}
                    >
                      <TrashIcon className="h-3.5 w-3.5 mr-2" />
                      Excluir tarefa
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {tarefa.descricao && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5">
            {tarefa.descricao}
          </p>
        )}

        <div className="flex flex-wrap gap-1 mt-2">
          {tarefa.prioridade && (
            <Badge variant="outline" className={`text-xs px-1.5 ${getPrioridadeBgColor(tarefa.prioridade)}`}>
              {tarefa.prioridade}
            </Badge>
          )}

          {tarefa.dataVencimento && (
            <Badge variant="outline" className="text-xs px-1.5 flex items-center gap-1">
              <AlarmClockIcon className="h-3 w-3" />
              <span>{formatarData(tarefa.dataVencimento)}</span>
            </Badge>
          )}

          {tarefa.etiquetas && tarefa.etiquetas.length > 0 && (
            <Badge variant="outline" className="text-xs px-1.5 flex items-center gap-1">
              <TagIcon className="h-3 w-3" />
              <span>{tarefa.etiquetas.length}</span>
            </Badge>
          )}
          
          {/* Badges de relacionamento com entidades */}
          <TooltipProvider>
            {tarefa.clienteId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className="text-xs px-1.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                  >
                    <UserCircleIcon className="h-3 w-3 mr-1" />
                    Cliente
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Vinculado a um cliente</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            {tarefa.projetoId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className="text-xs px-1.5 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
                  >
                    <FileTextIcon className="h-3 w-3 mr-1" />
                    Projeto
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Vinculado a um projeto</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            {tarefa.propriedadeId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className="text-xs px-1.5 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                  >
                    <HomeIcon className="h-3 w-3 mr-1" />
                    Propriedade
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Vinculado a uma propriedade</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
          {tarefa.responsavel && (
            <span className="flex items-center">
              <UserIcon className="h-3 w-3 mr-1" />
              {tarefa.responsavel}
            </span>
          )}
          <span className="flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {formatarData(tarefa.dataCriacao)}
          </span>
        </div>
      </CardContent>
    </Card>
    </DraggableItem>
  );
}
