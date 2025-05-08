/**
 * Tipos relacionados a assinaturas
 * Este arquivo contém todas as definições de tipos e funções utilitárias
 * para gerenciar assinaturas no sistema SaaS
 */

/**
 * Tipos de planos disponíveis no sistema
 * @BASIC - Plano básico com recursos limitados
 * @PREMIUM - Plano premium com todos os recursos
 * @TRIAL - Período de avaliação gratuito
 */
export type SubscriptionPlan = 'BASIC' | 'PREMIUM' | 'TRIAL';

/**
 * Status possíveis para uma assinatura
 * 
 * @ACTIVE - Assinatura ativa e em dia
 * @INACTIVE - Assinatura inativa (nunca ativada ou desativada manualmente)
 * @TRIAL - Período de avaliação gratuito em andamento
 * @TRIAL_ENDED - Período de avaliação encerrado sem conversão
 * @OVERDUE - Pagamento atrasado, mas assinatura ainda não cancelada
 * @CANCELLED - Assinatura cancelada pelo usuário ou sistema
 */
export type SubscriptionStatus = 
  | 'ACTIVE'
  | 'INACTIVE'
  | 'TRIAL'
  | 'TRIAL_ENDED'
  | 'OVERDUE'
  | 'CANCELLED';

/**
 * Estrutura de dados de uma assinatura
 * Contém todas as informações necessárias para gerenciar o estado
 * da assinatura de um usuário
 */
export interface SubscriptionData {
  /** Status atual da assinatura */
  status: SubscriptionStatus;
  
  /** Tipo do plano atual */
  plan: SubscriptionPlan;
  
  // Datas importantes (formato ISO 8601)
  /** Data de criação da assinatura */
  createdAt: string;
  /** Data da última atualização da assinatura */
  updatedAt?: string;
  /** Data de expiração da assinatura */
  expiresAt: string;
  /** Data de encerramento do período de avaliação */
  trialEndsAt: string;
  /** Data de cancelamento, se aplicável */
  cancelledAt?: string;
  
  // Integração com gateway de pagamento (Asaas)
  /** ID do cliente no Asaas */
  asaasCustomerId?: string;
  /** ID da assinatura no Asaas */
  asaasSubscriptionId?: string;
  
  // Informações de pagamento
  /** Data do último pagamento processado */
  lastPaymentDate?: string;
  /** Data prevista para o próximo pagamento */
  nextPaymentDate?: string;
  
  /** Histórico de pagamentos da assinatura */
  paymentHistory?: PaymentRecord[];
}

/**
 * Registro de pagamento para histórico
 */
export interface PaymentRecord {
  /** Data do pagamento */
  date: string;
  /** Status do pagamento (CONFIRMED, OVERDUE, etc) */
  status: string;
  /** Valor do pagamento */
  value: number;
  /** ID do pagamento no gateway */
  id: string;
}

// Funções de utilidade para assinaturas

/**
 * Verifica se o período de avaliação ainda está ativo
 * @param subscription Dados da assinatura a ser verificada
 * @returns true se o período de avaliação estiver ativo, false caso contrário
 */
export function isTrialActive(subscription: SubscriptionData): boolean {
  if (subscription.status !== 'TRIAL') return false;
  
  const trialEndDate = new Date(subscription.trialEndsAt);
  const now = new Date();
  
  return trialEndDate > now;
}

/**
 * Verifica se a assinatura está ativa (incluindo período de avaliação)
 * @param subscription Dados da assinatura a ser verificada
 * @returns true se a assinatura estiver ativa ou em período de trial válido,
 * false caso contrário
 */
export function isSubscriptionActive(subscription: SubscriptionData): boolean {
  if (subscription.status === 'ACTIVE') return true;
  
  if (subscription.status === 'TRIAL') {
    return isTrialActive(subscription);
  }
  
  return false;
}

/**
 * Verifica se o usuário tem acesso às funcionalidades premium
 * @param subscription Dados da assinatura a ser verificada
 * @returns true se o usuário tiver acesso premium (plano premium ou trial ativo),
 * false caso contrário
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
 * @param subscription Dados da assinatura a ser verificada
 * @returns Número de dias restantes no período de avaliação ou 0 se não estiver em trial
 * ou se o período já tiver terminado
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
