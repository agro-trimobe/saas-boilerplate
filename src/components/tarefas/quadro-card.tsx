'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CalendarIcon, 
  PenIcon, 
  TrashIcon, 
  ArrowRightIcon, 
  CheckCircleIcon,
  CircleIcon,
  MoreVerticalIcon,
  CheckSquareIcon,
  SquareIcon
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Quadro, Tarefa } from '@/lib/crm-utils';
import { formatarData } from '@/lib/formatters';

interface QuadroCardProps {
  quadro: Quadro;
  tarefas?: Tarefa[];
  onEdit?: (quadro: Quadro) => void;
  onDelete?: (quadro: Quadro) => void;
}

export function QuadroCard({ quadro, tarefas = [], onEdit, onDelete }: QuadroCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/tarefas/quadros/${quadro.id}`);
  };
  
  // Calcular estatísticas de tarefas
  const totalTarefas = tarefas.length;
  const tarefasConcluidas = tarefas.filter(t => t.concluida).length;
  const percentConcluido = totalTarefas > 0 ? (tarefasConcluidas / totalTarefas) * 100 : 0;
  
  // Obter tarefas recentes (limitado a 2)
  const tarefasRecentes = tarefas.slice(0, 2);

  return (
    <Card 
      className="relative overflow-hidden transition-all hover:shadow-md"
    >
      <div 
        className="absolute left-0 top-0 bottom-0 w-1" 
        style={{ backgroundColor: quadro.cor || '#0ea5e9' }}
      />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            <span className="truncate">{quadro.titulo}</span>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(quadro)}>
                  <PenIcon className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={() => onDelete(quadro)}>
                  <TrashIcon className="mr-2 h-4 w-4" /> Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {quadro.descricao && (
          <CardDescription className="line-clamp-2">
            {quadro.descricao}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center">
              <CalendarIcon className="mr-1 h-3 w-3" /> Criado em {formatarData(quadro.dataCriacao)}
            </span>
            <Badge variant="outline" className="font-normal">
              {totalTarefas} {totalTarefas === 1 ? 'tarefa' : 'tarefas'}
            </Badge>
          </div>
          
          <Progress value={percentConcluido} className="h-2" />
          
          <div className="text-xs text-muted-foreground text-right">
            {tarefasConcluidas}/{totalTarefas} concluídas
          </div>
          
          {/* Tarefas recentes */}
          {tarefasRecentes.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {tarefasRecentes.map(tarefa => (
                <div key={tarefa.id} className="flex items-start gap-2 text-sm">
                  {tarefa.concluida ? (
                    <CheckSquareIcon className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                  ) : (
                    <SquareIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  )}
                  <span className={`line-clamp-1 text-xs ${tarefa.concluida ? 'line-through text-muted-foreground' : ''}`}>
                    {tarefa.titulo}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-1 pb-3">
        <Button 
          variant="secondary" 
          size="sm"
          className="w-full" 
          onClick={handleClick}
        >
          <ArrowRightIcon className="mr-2 h-4 w-4" /> Acessar Quadro
        </Button>
      </CardFooter>
    </Card>
  );
}
