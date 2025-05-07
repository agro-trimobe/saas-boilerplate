'use client';

import { MapPin, FileText, TrendingUp } from "lucide-react";
import { CardEstatistica } from "@/components/ui/card-padrao";
import { Projeto } from "@/lib/crm-utils";

interface EstatisticasPropriedadesProps {
  totalPropriedades: number;
  projetosVinculados: number;
  oportunidades: number;
}

export function EstatisticasPropriedades({
  totalPropriedades,
  projetosVinculados,
  oportunidades
}: EstatisticasPropriedadesProps) {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
      <CardEstatistica
        titulo="Propriedades Cadastradas"
        valor={totalPropriedades}
        icone={<MapPin />}
        corIcone="text-blue-600"
        className="overflow-hidden border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow"
      />
      
      <CardEstatistica
        titulo="Projetos Vinculados"
        valor={projetosVinculados}
        icone={<FileText />}
        corIcone="text-green-600"
        className="overflow-hidden border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow"
      />
      
      <CardEstatistica
        titulo="Oportunidades"
        valor={oportunidades}
        icone={<TrendingUp />}
        corIcone="text-purple-600"
        className="overflow-hidden border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow"
      />
    </div>
  );
}
