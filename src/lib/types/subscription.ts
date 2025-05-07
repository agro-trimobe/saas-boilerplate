// Tipos relacionados a assinaturas

export type SubscriptionPlan = 'BASIC' | 'PREMIUM' | 'TRIAL';

export type SubscriptionStatus = 
  | 'ACTIVE'       // Assinatura ativa
  | 'INACTIVE'     // Assinatura inativa
  | 'TRIAL'        // Período de avaliação gratuito
  | 'TRIAL_ENDED'  // Período de avaliação encerrado
  | 'OVERDUE'      // Pagamento atrasado
  | 'CANCELLED';   // Assinatura cancelada

export interface SubscriptionData {
  // Status da assinatura
  status: SubscriptionStatus;
  
  // Tipo do plano
  plan: SubscriptionPlan;
  
  // Datas importantes
  createdAt: string;          // Data de criação da assinatura
  expiresAt: string;          // Data de expiração da assinatura
  trialEndsAt: string;        // Data de encerramento do período de avaliação
  
  // Integração com Asaas
  asaasCustomerId?: string;    // ID do cliente na Asaas
  asaasSubscriptionId?: string; // ID da assinatura na Asaas
  
  // Informações de pagamento
  lastPaymentDate?: string;    // Data do último pagamento
  nextPaymentDate?: string;    // Data do próximo pagamento
  
  // Histórico de pagamentos
  paymentHistory?: {
    date: string;
    status: string;
    value: number;
    id: string;
  }[];
}

// Funções de utilidade para assinaturas

/**
 * Verifica se o período de avaliação ainda está ativo
 */
export function isTrialActive(subscription: SubscriptionData): boolean {
  if (subscription.status !== 'TRIAL') return false;
  
  const trialEndDate = new Date(subscription.trialEndsAt);
  const now = new Date();
  
  return trialEndDate > now;
}

/**
 * Verifica se a assinatura está ativa (incluindo período de avaliação)
 */
export function isSubscriptionActive(subscription: SubscriptionData): boolean {
  if (subscription.status === 'ACTIVE') return true;
  
  if (subscription.status === 'TRIAL') {
    return isTrialActive(subscription);
  }
  
  return false;
}

/**
 * Verifica se o usuário tem acesso à função premium
 */
export function hasPremiumAccess(subscription: SubscriptionData): boolean {
  if (!isSubscriptionActive(subscription)) return false;
  
  // Durante o período de TRIAL, o usuário deve ter acesso a todas as funcionalidades premium
  if (subscription.status === 'TRIAL' && isTrialActive(subscription)) {
    return true;
  }
  
  return subscription.plan === 'PREMIUM';
}

/**
 * Calcula quantos dias restam no período de avaliação
 */
export function getRemainingTrialDays(subscription: SubscriptionData): number {
  if (subscription.status !== 'TRIAL') return 0;
  
  const trialEndDate = new Date(subscription.trialEndsAt);
  const now = new Date();
  
  // Se o período já terminou
  if (trialEndDate <= now) return 0;
  
  // Calcular diferença em dias
  const diffTime = trialEndDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}
