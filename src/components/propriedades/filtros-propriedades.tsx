'use client';

import { FiltroSelect } from "@/components/ui/filtros-padrao";

interface FiltrosPropriedadesProps {
  termoBusca: string;
  onChangeBusca: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tipoPropriedade: string;
  onChangeTipoPropriedade: (valor: string) => void;
}

export function FiltrosPropriedades({
  tipoPropriedade,
  onChangeTipoPropriedade
}: FiltrosPropriedadesProps) {
  // Opções para o filtro de tipo de propriedade
  const opcoesTipoPropriedade = [
    { valor: '', label: 'Todos os Tipos' },
    { valor: 'pequena', label: 'Pequena (até 20 ha)' },
    { valor: 'media', label: 'Média (20 a 100 ha)' },
    { valor: 'grande', label: 'Grande (mais de 100 ha)' }
  ];

  return (
    <FiltroSelect
      label="Tipo de Propriedade"
      valor={tipoPropriedade}
      onChange={onChangeTipoPropriedade}
      opcoes={opcoesTipoPropriedade}
    />
  );
}
