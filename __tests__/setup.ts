/**
 * Configuração global para testes
 * Importado automaticamente pelo vitest antes da execução dos testes
 */
import '@testing-library/jest-dom';

// Criar mocks globais para APIs do navegador que podem não estar disponíveis durante os testes
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock da API de fetch para os testes
if (typeof window.fetch === 'undefined') {
  global.fetch = vi.fn();
}

// Mock da API Web Crypto que pode ser necessária para autenticação
if (typeof window.crypto === 'undefined') {
  global.crypto = {
    subtle: {},
    getRandomValues: () => new Uint32Array(10),
  } as any;
}

// Silenciar avisos de console durante os testes
global.console = {
  ...console,
  // Comentar as linhas abaixo para depurar problemas nos testes
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};
