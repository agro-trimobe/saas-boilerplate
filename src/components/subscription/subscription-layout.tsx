'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SubscriptionLayoutProps {
  children: ReactNode;
  className?: string;
}

export function SubscriptionLayout({ children, className }: SubscriptionLayoutProps) {
  return (
    <div className={cn(
      "container mx-auto py-6 px-4 max-w-6xl relative",
      className
    )}>
      {/* Gradiente de fundo sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background -z-10 rounded-xl opacity-70" />
      
      {children}
    </div>
  );
}
