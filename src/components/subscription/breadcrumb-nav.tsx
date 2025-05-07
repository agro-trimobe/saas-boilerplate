'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbNavProps {
  showBackButton?: boolean;
  planSelected?: boolean;
  onBackClick?: () => void;
}

export function BreadcrumbNav({ showBackButton = true, planSelected = true, onBackClick }: BreadcrumbNavProps) {
  return (
    <nav className="flex items-center mb-6 text-sm" aria-label="Navegação">
      <ol className="flex items-center space-x-1">
        <li className="flex items-center">
          <Link 
            href="/dashboard" 
            className="text-muted-foreground hover:text-primary flex items-center"
          >
            <Home className="h-4 w-4 mr-1" />
            <span>Início</span>
          </Link>
        </li>
        <li className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
          <span className={planSelected ? 'text-muted-foreground' : 'text-primary font-medium'}>
            Planos
          </span>
        </li>
        {planSelected && (
          <>
            <li className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
              <span className="text-primary font-medium">Pagamento</span>
            </li>
          </>
        )}
      </ol>
      
      {showBackButton && planSelected && (
        <button 
          onClick={onBackClick} 
          className="ml-auto text-sm text-primary hover:underline flex items-center border-none bg-transparent cursor-pointer p-0"
        >
          ← Voltar para os planos
        </button>
      )}
    </nav>
  );
}
