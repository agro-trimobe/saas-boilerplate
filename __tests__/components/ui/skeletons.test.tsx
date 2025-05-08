import React from 'react';
import { render, screen } from '@testing-library/react';
import { CardSkeleton, TextSkeleton, AvatarSkeleton, TableRowSkeleton } from '@/components/ui/skeletons';
import { describe, expect, it } from 'vitest';

describe('Componentes de Skeleton', () => {
  it('CardSkeleton deve renderizar corretamente', () => {
    const { container } = render(<CardSkeleton />);
    
    // Verifica se o Card foi renderizado
    expect(container.querySelector('.card')).toBeInTheDocument();
    
    // Verifica elementos de animação
    const animatedElements = container.querySelectorAll('.animate-pulse');
    expect(animatedElements.length).toBeGreaterThan(0);
  });

  it('TextSkeleton deve renderizar com propriedades padrão', () => {
    const { container } = render(<TextSkeleton />);
    
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('w-full');
    expect(skeleton).toHaveClass('h-4');
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('TextSkeleton deve aceitar propriedades personalizadas', () => {
    const { container } = render(
      <TextSkeleton width="w-1/2" height="h-8" />
    );
    
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('w-1/2');
    expect(skeleton).toHaveClass('h-8');
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('AvatarSkeleton deve renderizar com propriedades padrão', () => {
    const { container } = render(<AvatarSkeleton />);
    
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('h-10');
    expect(skeleton).toHaveClass('w-10');
    expect(skeleton).toHaveClass('rounded-full');
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('AvatarSkeleton deve aceitar tamanho personalizado', () => {
    const { container } = render(<AvatarSkeleton size="h-20 w-20" />);
    
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('h-20');
    expect(skeleton).toHaveClass('w-20');
  });

  it('TableRowSkeleton deve renderizar com número padrão de colunas', () => {
    const { container } = render(<TableRowSkeleton />);
    
    // Por padrão deve ter 4 colunas
    const columns = container.querySelectorAll('.animate-pulse');
    expect(columns.length).toBe(4);
  });

  it('TableRowSkeleton deve renderizar com número personalizado de colunas', () => {
    const { container } = render(<TableRowSkeleton columns={6} />);
    
    const columns = container.querySelectorAll('.animate-pulse');
    expect(columns.length).toBe(6);
  });
});
