'use client';

import { CardSkeleton, TextSkeleton } from "@/components/ui/skeletons";
import { Separator } from "@/components/ui/separator";

/**
 * Componente de carregamento para a página de dashboard
 * Exibe uma versão esqueleto da interface enquanto os dados são carregados
 * Simula o layout exato da página para uma melhor experiência de usuário
 */
export default function DashboardLoading() {
  return (
    <div className="container py-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-2 mb-6">
        <TextSkeleton width="w-48" height="h-8" />
        <TextSkeleton width="w-72" height="h-4" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Esqueletos para os cards principais */}
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <Separator className="my-6" />
      
      <div className="mb-4">
        <TextSkeleton width="w-36" height="h-6" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Esqueletos para os recursos */}
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
