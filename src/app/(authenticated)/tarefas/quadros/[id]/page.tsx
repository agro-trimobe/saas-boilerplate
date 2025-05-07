import { Suspense } from 'react';
import { use } from 'react';
import { Metadata } from 'next';
import QuadroContent from './quadro-content';

// Tipo para o objeto de parâmetros
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Gerar metadados dinâmicos para a página
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  
  return {
    title: `Quadro de Tarefas | ID: ${resolvedParams.id}`,
    description: 'Gerenciamento de tarefas em um quadro no estilo Kanban',
  };
}

// Componente principal da página
export default function QuadroPage({ params }: PageProps) {
  // Usar React.use para "desembrulhar" a promise do params
  const resolvedParams = use(params);
  const quadroId = resolvedParams.id;

  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <QuadroContent quadroId={quadroId} />
    </Suspense>
  );
}
