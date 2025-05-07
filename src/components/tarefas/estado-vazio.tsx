'use client';

import { Button } from '@/components/ui/button';
import { Plus, ClipboardList } from 'lucide-react';

interface EstadoVazioProps {
  onCriarQuadro: () => void;
}

export function EstadoVazio({ onCriarQuadro }: EstadoVazioProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 min-h-[50vh]">
      <div className="rounded-full bg-primary/10 p-6">
        <ClipboardList className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-xl font-semibold">Nenhum quadro encontrado</h3>
      <p className="text-muted-foreground max-w-md">
        Organize suas tarefas em quadros personalizados para acompanhar seu progresso e 
        aumentar sua produtividade.
      </p>
      <Button className="mt-2" onClick={onCriarQuadro}>
        <Plus className="mr-2 h-4 w-4" /> Criar Quadro
      </Button>
    </div>
  );
}
