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
    { text: 'Acesso a todos os recursos básicos' },
    { text: 'Até 5 usuários por conta' },
    { text: 'Armazenamento de 10GB' },
    { text: 'Dashboards e relatórios básicos' },
    { text: 'Suporte por email' },
    { text: 'Recursos premium avançados', disabled: true }
  ],
  'PREMIUM': [
    { text: 'Todos os recursos do plano básico' },
    { text: 'Usuários ilimitados' },
    { text: 'Armazenamento de 100GB' },
    { text: 'Relatórios avançados e personalizados' },
    { text: 'API com acesso completo' },
    { text: 'Suporte prioritário 24/7', highlighted: true }
  ],
  'TRIAL': [
    { text: 'Acesso temporário a todas as funcionalidades' },
    { text: 'Avaliação completa do sistema por 14 dias' },
    { text: 'Suporte durante o período de testes' }
  ]
};

export const planInfo = {
  'BASIC': {
    title: 'Plano Inicial',
    description: 'Ideal para startups e pequenos times'
  },
  'PREMIUM': {
    title: 'Plano Profissional',
    description: 'Recursos completos para empresas em crescimento'
  },
  'TRIAL': {
    title: 'Avaliação Gratuita',
    description: 'Experimente todas as funcionalidades por 14 dias'
  }
};
