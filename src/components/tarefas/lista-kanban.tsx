'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lista, Tarefa } from '@/lib/crm-utils';
import { 
  MoreHorizontalIcon, 
  PlusIcon,
  ChevronUpIcon, 
  ChevronDownIcon,
  SearchIcon,
  SlidersIcon,
  CheckIcon,
  FilterIcon,
  UserCircleIcon,
  FileTextIcon,
  HomeIcon
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { TarefaCard } from './tarefa-card';
import { useDragDrop, DroppableZone } from './drag-drop-context';

interface ListaKanbanProps {
  lista: Lista;
  tarefas: Tarefa[];
  onAddTarefa?: () => void;
  onEditLista?: () => void;
  onDeleteLista?: () => void;
  onEditTarefa?: (tarefa: Tarefa) => void;
  onDeleteTarefa?: (tarefa: Tarefa) => void;
  onViewTarefa?: (tarefa: Tarefa) => void;
  // Filtros adicionais
  clientesFiltrados?: string[];
  projetosFiltrados?: string[];
  propriedadesFiltradas?: string[];
  usandoFiltros?: boolean;
}

export function ListaKanban({
  lista,
  tarefas,
  onAddTarefa,
  onEditLista,
  onDeleteLista,
  onEditTarefa,
  onDeleteTarefa,
  onViewTarefa,
  clientesFiltrados = [],
  projetosFiltrados = [],
  propriedadesFiltradas = [],
  usandoFiltros = false
}: ListaKanbanProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [contraido, setContraido] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Usando o contexto de drag-and-drop
  const { dragState, isOverDropZone } = useDragDrop();
  
  // Verificando se esta lista está recebendo um item sendo arrastado
  const isOver = isOverDropZone(lista.id);
  
  // Métricas da lista
  const tarefasFiltradas = useMemo(() => {
    let resultado = [...tarefas];
    
    // Filtro de texto
    if (filtroTexto) {
      const textoBusca = filtroTexto.toLowerCase();
      resultado = resultado.filter(tarefa => 
        tarefa.titulo.toLowerCase().includes(textoBusca) || 
        (tarefa.descricao || '').toLowerCase().includes(textoBusca)
      );
    }
    
    // Filtros globais de relacionamentos
    if (usandoFiltros) {
      if (clientesFiltrados.length > 0) {
        resultado = resultado.filter(tarefa => 
          !tarefa.clienteId || clientesFiltrados.includes(tarefa.clienteId)
        );
      }
      
      if (projetosFiltrados.length > 0) {
        resultado = resultado.filter(tarefa => 
          !tarefa.projetoId || projetosFiltrados.includes(tarefa.projetoId)
        );
      }
      
      if (propriedadesFiltradas.length > 0) {
        resultado = resultado.filter(tarefa => 
          !tarefa.propriedadeId || propriedadesFiltradas.includes(tarefa.propriedadeId)
        );
      }
    }
    
    return resultado;
  }, [tarefas, filtroTexto, usandoFiltros, clientesFiltrados, projetosFiltrados, propriedadesFiltradas]);
  
  const totalTarefas = tarefasFiltradas.length;
  const tarefasConcluidas = tarefasFiltradas.filter(t => t.concluida).length;
  const percentConcluido = totalTarefas > 0 ? Math.round((tarefasConcluidas / totalTarefas) * 100) : 0;
  
  // Contadores de relacionamentos
  const contadorClientes = tarefasFiltradas.filter(t => t.clienteId).length;
  const contadorProjetos = tarefasFiltradas.filter(t => t.projetoId).length;
  const contadorPropriedades = tarefasFiltradas.filter(t => t.propriedadeId).length;

  return (
    <DroppableZone listaId={lista.id} tarefas={tarefas}>
      <Card 
        className={`h-full flex flex-col w-72 min-w-[18rem] ${isOver ? 'ring-2 ring-primary ring-opacity-50' : ''} transition-all`}
        style={{ 
          borderTop: lista.cor ? `4px solid ${lista.cor}` : '4px solid #0ea5e9',
          maxHeight: contraido ? '64px' : undefined
        }}
      >
        <CardHeader className="p-2 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center cursor-pointer" onClick={() => setContraido(!contraido)}>
              {contraido ? (
                <ChevronDownIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              ) : (
                <ChevronUpIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              )}
              <CardTitle className="text-md font-medium flex items-center">
                {lista.titulo}
                <Badge variant="outline" className="ml-2 text-xs">
                  {tarefasFiltradas.length}
                </Badge>
              </CardTitle>
            </div>
            
            <div className="flex items-center space-x-1">
              <Popover open={mostrarFiltros} onOpenChange={setMostrarFiltros}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <SearchIcon className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="end">
                  <div className="space-y-2">
                    <div className="relative">
                      <SearchIcon className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Filtrar tarefas..."
                        className="pl-8 h-9"
                        value={filtroTexto}
                        onChange={(e) => setFiltroTexto(e.target.value)}
                      />
                    </div>
                    <div className="text-xs font-medium">Relacionamentos</div>
                    <div className="flex space-x-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <UserCircleIcon className="h-3 w-3" />
                        <span>{contadorClientes}</span>
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <FileTextIcon className="h-3 w-3" />
                        <span>{contadorProjetos}</span>
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <HomeIcon className="h-3 w-3" />
                        <span>{contadorPropriedades}</span>
                      </Badge>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                  >
                    <MoreHorizontalIcon className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48" align="end">
                  <div className="space-y-1">
                    {onEditLista && (
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-sm" 
                        onClick={onEditLista}
                      >
                        Editar lista
                      </Button>
                    )}
                    {onDeleteLista && (
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-sm text-destructive" 
                        onClick={onDeleteLista}
                      >
                        Excluir lista
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {!contraido && (
            <div className="pt-1 pb-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{tarefasConcluidas} de {totalTarefas} concluídas</span>
                <span className="text-xs ml-auto">{percentConcluido}%</span>
              </div>
              <Progress value={percentConcluido} className="h-1" />
            </div>
          )}
        </CardHeader>
                {!contraido && (
          <>
            <CardContent className="p-2 flex-grow overflow-auto">
              {filtroTexto && tarefasFiltradas.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-4">
                  Nenhuma tarefa encontrada para &quot;{filtroTexto}&quot;
                </div>
              ) : (
                <div className="space-y-2">
                  {tarefasFiltradas.map((tarefa) => (
                    <TarefaCard
                      key={tarefa.id}
                      tarefa={tarefa}
                      onEdit={onEditTarefa}
                      onDelete={onDeleteTarefa}
                      onView={onViewTarefa}
                    />
                  ))}
                </div>
              )}
            </CardContent>
            
            <div className="p-2 border-t">
              {onAddTarefa && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full flex items-center justify-start text-muted-foreground h-8 text-xs"
                  onClick={onAddTarefa}
                >
                  <PlusIcon className="h-3.5 w-3.5 mr-1.5" />
                  Adicionar tarefa
                </Button>
              )}
            </div>
          </>
          )}
      </Card>
    </DroppableZone>
  );
}
