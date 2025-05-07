'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tarefa, Cliente, Projeto, Propriedade } from '@/lib/crm-utils';
import { formatarData } from '@/lib/formatters';
import { 
  AlarmClockIcon, 
  CheckSquareIcon,
  TagIcon, 
  UserIcon,
  CalendarIcon,
  HomeIcon,
  FileTextIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  ClockIcon,
  PlusIcon,
  InfoIcon
} from 'lucide-react';

interface TarefaDetalhesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tarefa: Tarefa | null;
  cliente?: Cliente | null;
  projeto?: Projeto | null;
  propriedade?: Propriedade | null;
  onEdit?: (tarefa: Tarefa) => void;
}

export function TarefaDetalhesDialog({ 
  open, 
  onOpenChange, 
  tarefa,
  cliente,
  projeto,
  propriedade,
  onEdit
}: TarefaDetalhesDialogProps) {
  if (!tarefa) return null;

  const handleEdit = () => {
    if (onEdit && tarefa) {
      onEdit(tarefa);
      onOpenChange(false);
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {tarefa.concluida ? (
              <CheckSquareIcon className="h-5 w-5 text-primary" />
            ) : (
              <InfoIcon className="h-5 w-5" />
            )}
            {tarefa.titulo}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* Status e Prioridade */}
          <div className="flex flex-wrap gap-2">
            {tarefa.concluida && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Concluída
              </Badge>
            )}
            {tarefa.prioridade && (
              <Badge variant="outline" className={`${getPrioridadeBgColor(tarefa.prioridade)}`}>
                Prioridade: {tarefa.prioridade}
              </Badge>
            )}
          </div>
          
          {/* Descrição */}
          {tarefa.descricao && (
            <div className="bg-muted/40 rounded-md p-3 text-sm">
              {tarefa.descricao}
            </div>
          )}
          
          <Separator />
          
          {/* Detalhes */}
          <div className="grid gap-4">
            <h3 className="text-sm font-medium">Detalhes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {/* Prazo */}
              {tarefa.prazo && (
                <div className="flex items-start gap-2">
                  <CalendarDaysIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Prazo</div>
                    <div className="text-muted-foreground">{formatarData(tarefa.prazo)}</div>
                  </div>
                </div>
              )}
              
              {/* Responsável */}
              {tarefa.responsavel && (
                <div className="flex items-start gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Responsável</div>
                    <div className="text-muted-foreground">{tarefa.responsavel}</div>
                  </div>
                </div>
              )}
              
              {/* Data de Criação */}
              {tarefa.dataCriacao && (
                <div className="flex items-start gap-2">
                  <ClockIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Criada em</div>
                    <div className="text-muted-foreground">{formatarData(tarefa.dataCriacao)}</div>
                  </div>
                </div>
              )}
              
              {/* Data de Última Atualização */}
              {tarefa.dataAtualizacao && (
                <div className="flex items-start gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Última atualização</div>
                    <div className="text-muted-foreground">{formatarData(tarefa.dataAtualizacao)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Etiquetas */}
          {tarefa.etiquetas && tarefa.etiquetas.length > 0 && (
            <>
              <Separator />
              <div className="grid gap-2">
                <h3 className="text-sm font-medium flex items-center gap-1">
                  <TagIcon className="h-4 w-4" />
                  Etiquetas
                </h3>
                <div className="flex flex-wrap gap-1">
                  {tarefa.etiquetas.map((etiqueta, index) => (
                    <Badge key={index} variant="outline" className="bg-muted/50">
                      {etiqueta}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {/* Relacionamentos */}
          {(cliente || projeto || propriedade) && (
            <>
              <Separator />
              <div className="grid gap-3">
                <h3 className="text-sm font-medium">Relacionamentos</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {/* Cliente */}
                  {cliente && (
                    <div className="flex items-start gap-2">
                      <UserCircleIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-medium">Cliente</div>
                        <div className="text-muted-foreground">{cliente.nome}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Projeto */}
                  {projeto && (
                    <div className="flex items-start gap-2">
                      <FileTextIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-medium">Projeto</div>
                        <div className="text-muted-foreground">{projeto.titulo}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Propriedade */}
                  {propriedade && (
                    <div className="flex items-start gap-2">
                      <HomeIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-medium">Propriedade</div>
                        <div className="text-muted-foreground">{propriedade.nome}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
          
          {onEdit && (
            <Button onClick={handleEdit}>
              Editar Tarefa
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
