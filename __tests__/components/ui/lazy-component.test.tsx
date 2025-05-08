import { render, screen } from '@testing-library/react';
import { createLazyComponent } from '@/components/ui/lazy-component';
import { describe, expect, it, vi } from 'vitest';
import React from 'react';

// Componente de teste para simular importação lazy
const TestComponent = ({ text = 'Componente Lazy' }: { text?: string }) => {
  return <div data-testid="lazy-test-component">{text}</div>;
};

describe('Componente Lazy', () => {
  it('deve criar e renderizar um componente lazy corretamente', async () => {
    // Simula um módulo lazy-loaded
    const mockImport = vi.fn().mockResolvedValue({
      default: TestComponent
    });
    
    // Cria o componente lazy
    const LazyTestComponent = createLazyComponent(mockImport);
    
    // Renderiza o componente
    render(<LazyTestComponent text="Teste Lazy" />);
    
    // Inicialmente deve mostrar o loading
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Espera o componente carregar
    const lazyElement = await screen.findByTestId('lazy-test-component');
    expect(lazyElement).toBeInTheDocument();
    expect(lazyElement).toHaveTextContent('Teste Lazy');
  });

  it('deve aceitar fallback personalizado', async () => {
    const mockImport = vi.fn().mockResolvedValue({
      default: TestComponent
    });
    
    const customFallback = <div data-testid="custom-fallback">Carregando personalizado...</div>;
    
    // Cria o componente lazy com fallback personalizado
    const LazyTestComponent = createLazyComponent(mockImport, customFallback);
    
    // Renderiza o componente
    render(<LazyTestComponent />);
    
    // Deve mostrar o fallback personalizado
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    
    // Espera o componente carregar
    const lazyElement = await screen.findByTestId('lazy-test-component');
    expect(lazyElement).toBeInTheDocument();
  });

  it('deve passar propriedades corretamente para o componente carregado', async () => {
    const mockImport = vi.fn().mockResolvedValue({
      default: TestComponent
    });
    
    // Cria o componente lazy
    const LazyTestComponent = createLazyComponent(mockImport);
    
    // Renderiza o componente com propriedades
    render(<LazyTestComponent text="Propriedade passada" />);
    
    // Espera o componente carregar
    const lazyElement = await screen.findByTestId('lazy-test-component');
    
    // Verifica se as propriedades foram passadas corretamente
    expect(lazyElement).toHaveTextContent('Propriedade passada');
  });
});
