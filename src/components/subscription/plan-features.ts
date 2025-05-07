import { SubscriptionPlan } from '@/lib/types/subscription';

interface PlanFeature {
  text: string;
  highlighted?: boolean;
  disabled?: boolean;
}

export type PlanFeaturesMap = {
  [key in SubscriptionPlan]: PlanFeature[];
};

export const planFeatures: PlanFeaturesMap = {
  'BASIC': [
    { text: 'Centralização de dados de clientes e propriedades' },
    { text: 'Organização completa de documentos e contratos' },
    { text: 'Simulações de financiamento com cálculos precisos' },
    { text: 'Dashboard com métricas de desempenho em tempo real' },
    { text: 'Gestão completa de tarefas e compromissos' },
    { text: 'Recursos de Inteligência Artificial', disabled: true }
  ],
  'PREMIUM': [
    { text: 'Todos os recursos do plano básico + IA exclusiva' },
    { text: 'Assistente virtual especialista no Manual de Crédito Rural' },
    { text: 'Extração automática de dados de documentos em segundos' },
    { text: 'Recomendações inteligentes de linhas de crédito personalizadas' },
    { text: 'Análise preditiva para aprovação de projetos' },
    { text: 'Redução de 50% no tempo de elaboração de projetos', highlighted: true }
  ],
  'TRIAL': [
    { text: 'Acesso temporário a todas as funcionalidades' },
    { text: 'Avaliação completa do sistema por tempo limitado' },
    { text: 'Suporte durante o período de testes' }
  ]
};

export const planInfo = {
  'BASIC': {
    title: 'Plano Básico: CRM',
    description: 'Organize, acompanhe e feche mais projetos com metade do esforço'
  },
  'PREMIUM': {
    title: 'Plano Premium: CRM + IA',
    description: 'Dobre sua produtividade com IA que potencializa seus resultados'
  },
  'TRIAL': {
    title: 'Plano Trial',
    description: 'Avalie todas as funcionalidades por tempo limitado'
  }
};
