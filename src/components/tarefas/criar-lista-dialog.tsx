'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lista } from '@/lib/crm-utils';

interface CriarListaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quadroId: string;
  lista?: Lista;
  onSave: (lista: Partial<Lista>) => void;
}

export function CriarListaDialog({ 
  open, 
  onOpenChange, 
  quadroId,
  lista,
  onSave 
}: CriarListaDialogProps) {
  const [titulo, setTitulo] = useState('');
  const [cor, setCor] = useState('#0ea5e9');

  // Efeito para limpar os campos ao abrir o diálogo ou carregar dados para edição
  useEffect(() => {
    if (open) {
      if (lista?.id) {
        // Modo edição - carrega os dados existentes
        setTitulo(lista.titulo || '');
        setCor(lista.cor || '#0ea5e9');
      } else {
        // Modo criação - limpa os campos
        setTitulo('');
        setCor('#0ea5e9');
      }
    }
  }, [open, lista]);

  const handleSave = () => {
    if (!titulo.trim()) return;

    const novaLista: Partial<Lista> = {
      ...lista,
      titulo,
      quadroId,
      cor,
      ordem: lista?.ordem !== undefined ? lista.ordem : 999 // Valor alto para adicionar ao final
    };

    onSave(novaLista);
    onOpenChange(false);
  };

  const coresPredefinidas = [
    '#0ea5e9', // Azul
    '#10b981', // Verde
    '#ef4444', // Vermelho
    '#f59e0b', // Âmbar
    '#8b5cf6', // Violeta
    '#ec4899', // Rosa
    '#6b7280', // Cinza
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{lista?.id ? 'Editar Lista' : 'Nova Lista'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título da lista"
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {coresPredefinidas.map((corPredefinida) => (
                <button
                  key={corPredefinida}
                  type="button"
                  className={`w-8 h-8 rounded-full cursor-pointer ${cor === corPredefinida ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                  style={{ backgroundColor: corPredefinida }}
                  onClick={() => setCor(corPredefinida)}
                  aria-label={`Cor ${corPredefinida}`}
                />
              ))}
              <div className="flex items-center">
                <Input
                  type="color"
                  value={cor}
                  onChange={(e) => setCor(e.target.value)}
                  className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden"
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            {lista?.id ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
