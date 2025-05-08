import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from './aws-config';
import { SubscriptionData, SubscriptionPlan, SubscriptionStatus } from './types/subscription';
import { asaasApi, createCustomer, createSubscription, cancelSubscription, ASAAS_TRIAL_PERIOD_DAYS, ASAAS_SUBSCRIPTION_BASIC_VALUE, ASAAS_SUBSCRIPTION_PREMIUM_VALUE } from './asaas-config';

// Constantes para períodos de teste e valores de assinatura
const TRIAL_PERIOD_DAYS = 14; // Período de teste padrão de 14 dias

// Nome da tabela para armazenar usuários e assinaturas
const USERS_TABLE = 'Users';

/**
 * Inicializa a assinatura para um novo usuário com período de teste
 * @param tenantId ID do tenant (organização)
 * @param cognitoId ID do usuário no Cognito
 * @returns Dados da assinatura de teste criada
 */
export async function initializeTrialSubscription(tenantId: string, cognitoId: string): Promise<SubscriptionData> {
  try {
    const now = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(now.getDate() + TRIAL_PERIOD_DAYS);
    
    // Dados mínimos necessários para a assinatura de teste
    const subscriptionData: SubscriptionData = {
      status: 'TRIAL',
      plan: 'TRIAL',
      createdAt: now.toISOString(),
      expiresAt: trialEndDate.toISOString(),
      trialEndsAt: trialEndDate.toISOString(),
    };
    
    await updateUserSubscription(tenantId, cognitoId, subscriptionData);
    
    return subscriptionData;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao inicializar período de teste: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao inicializar período de teste');
    }
  }
}

/**
 * Atualiza as informações de assinatura do usuário
 * @param tenantId ID do tenant (organização)
 * @param cognitoId ID do usuário no Cognito
 * @param subscriptionData Dados da assinatura para atualizar
 * @returns Dados do usuário atualizados
 */
export async function updateUserSubscription(tenantId: string, cognitoId: string, subscriptionData: SubscriptionData) {
  try {
    const command = new UpdateCommand({
      TableName: USERS_TABLE,
      Key: {
        PK: `TENANT#${tenantId}`,
        SK: `USER#${cognitoId}`,
      },
      UpdateExpression: 'SET subscription = :subscription, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':subscription': subscriptionData,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    });
    
    const result = await dynamodb.send(command);
    return result.Attributes;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao atualizar assinatura: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao atualizar assinatura');
    }
  }
}

/**
 * Verifica se o usuário tem uma assinatura ativa
 * @param tenantId ID do tenant (organização)
 * @param cognitoId ID do usuário no Cognito
 * @returns Dados da assinatura ou null se não existir
 */
export async function checkUserSubscription(tenantId: string, cognitoId: string): Promise<SubscriptionData | null> {
  try {
    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: {
        PK: `TENANT#${tenantId}`,
        SK: `USER#${cognitoId}`,
      },
    });
    
    const result = await dynamodb.send(command);
    
    if (!result.Item) {
      return null;
    }
    
    const subscription = result.Item.subscription as SubscriptionData;
    if (!subscription) {
      return null;
    }

    // Verifica se a assinatura está válida
    const now = new Date();
    const expiresAt = subscription.expiresAt ? new Date(subscription.expiresAt) : null;
    
    // Se não houver data de expiração, consideramos válida
    if (!expiresAt) {
      subscription.status = 'ACTIVE';
      return subscription;
    }
    
    // Atualizar status se estiver expirado
    if (now > expiresAt) {
      if (subscription.status === 'TRIAL') {
        subscription.status = 'TRIAL_ENDED';
      } else if (subscription.status === 'ACTIVE') {
        subscription.status = 'INACTIVE';
      }
    }
    
    return subscription;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao verificar assinatura: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao verificar assinatura');
    }
  }
}

/**
 * Calcula o preço do plano com base no tipo
 * @param plan Tipo do plano
 * @returns Valor do plano em reais
 */
export function getPlanPrice(plan: SubscriptionPlan): number {
  switch (plan) {
    case 'BASIC':
      return ASAAS_SUBSCRIPTION_BASIC_VALUE;
    case 'PREMIUM':
      return ASAAS_SUBSCRIPTION_PREMIUM_VALUE;
    default:
      return 0;
  }
}

/**
 * Processa a criação de uma nova assinatura
 * @param tenantId ID do tenant (organização)
 * @param cognitoId ID do usuário no Cognito
 * @param userData Dados do usuário para criar cliente na Asaas
 * @param paymentData Dados de pagamento e plano escolhido
 * @returns Dados da assinatura criada
 */
export async function createUserSubscription(
  tenantId: string,
  cognitoId: string,
  userData: { 
    name: string; 
    email: string; 
    cpfCnpj: string;
  },
  paymentData: {
    plan: SubscriptionPlan;
    creditCard: {
      holderName: string;
      number: string;
      expiryMonth: string;
      expiryYear: string;
      ccv: string;
    };
    address: {
      postalCode: string;
      number: string;
      phone?: string;
    };
    remoteIp: string;
  }
) {
  try {
    // 1. Criar cliente na Asaas
    const customer = await createCustomer(
      userData.name,
      userData.cpfCnpj,
      userData.email
    );
    
    if (!customer || !customer.id) {
      throw new Error('Falha ao criar cliente na Asaas');
    }
    
    // 2. Criar assinatura na Asaas
    const planValue = getPlanPrice(paymentData.plan);
    const nextDueDate = new Date();
    
    const subscription = await createSubscription({
      customer: customer.id,
      billingType: 'CREDIT_CARD',
      value: planValue,
      nextDueDate: nextDueDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
      cycle: 'MONTHLY',
      description: `Plano ${paymentData.plan === 'BASIC' ? 'Básico' : 'Premium'} SaaS`,
      creditCard: {
        holderName: paymentData.creditCard.holderName,
        number: paymentData.creditCard.number,
        expiryMonth: paymentData.creditCard.expiryMonth,
        expiryYear: paymentData.creditCard.expiryYear,
        ccv: paymentData.creditCard.ccv,
      },
      creditCardHolderInfo: {
        name: userData.name,
        email: userData.email,
        cpfCnpj: userData.cpfCnpj,
        postalCode: paymentData.address.postalCode,
        addressNumber: paymentData.address.number,
        phone: paymentData.address.phone,
      },
      remoteIp: paymentData.remoteIp,
    });
    
    if (!subscription || !subscription.id) {
      throw new Error('Falha ao criar assinatura na Asaas');
    }
    
    // 3. Salvar informações essenciais da assinatura
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // Expira em 1 mês
    
    const subscriptionData: SubscriptionData = {
      status: 'ACTIVE',
      plan: paymentData.plan,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      trialEndsAt: now.toISOString(),
      asaasCustomerId: customer.id,
      asaasSubscriptionId: subscription.id,
      lastPaymentDate: now.toISOString(),
      nextPaymentDate: subscription.nextDueDate,
    };
    
    await updateUserSubscription(tenantId, cognitoId, subscriptionData);
    
    return { 
      subscription: subscriptionData,
      asaasSubscription: subscription
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao criar assinatura: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao criar assinatura');
    }
  }
}

/**
 * Atualiza o plano de assinatura do usuário
 * @param tenantId ID do tenant (organização)
 * @param cognitoId ID do usuário no Cognito
 * @param newPlan Novo plano a ser ativado
 * @returns Dados da assinatura atualizada
 */
export async function updateSubscriptionPlan(
  tenantId: string,
  cognitoId: string,
  newPlan: SubscriptionPlan
): Promise<SubscriptionData> {
  try {
    // 1. Verificar assinatura atual
    const subscriptionData = await checkUserSubscription(tenantId, cognitoId);
    
    if (!subscriptionData) {
      throw new Error('Usuário não possui assinatura para atualizar');
    }
    
    if (!subscriptionData.asaasSubscriptionId) {
      throw new Error('Assinatura não possui ID no Asaas');
    }
    
    if (subscriptionData.plan === newPlan) {
      return subscriptionData; // Plano já é o mesmo
    }
    
    // 2. Atualizar assinatura no Asaas
    const newPlanValue = getPlanPrice(newPlan);
    
    try {
      await asaasApi.post(
        `/subscriptions/${subscriptionData.asaasSubscriptionId}`,
        {
          value: newPlanValue,
          description: `Plano ${newPlan === 'BASIC' ? 'Básico' : 'Premium'} SaaS`,
        }
      );
    } catch (asaasError) {
      // Se falhar no Asaas, continuamos para atualizar localmente
      // Isso permite que a assinatura seja sincronizada mais tarde
    }
    
    // 3. Atualizar no banco de dados local
    const updatedSubscription: SubscriptionData = {
      ...subscriptionData,
      plan: newPlan,
      updatedAt: new Date().toISOString(),
    };
    
    await updateUserSubscription(tenantId, cognitoId, updatedSubscription);
    
    return updatedSubscription;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao atualizar plano: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao atualizar plano');
    }
  }
}

/**
 * Cancela a assinatura de um usuário
 * @param tenantId ID do tenant (organização)
 * @param cognitoId ID do usuário no Cognito
 * @returns Dados da assinatura cancelada
 */
export async function cancelUserSubscription(tenantId: string, cognitoId: string): Promise<SubscriptionData> {
  try {
    // 1. Verificar assinatura atual
    const subscriptionData = await checkUserSubscription(tenantId, cognitoId);
    
    if (!subscriptionData) {
      throw new Error('Usuário não possui assinatura para cancelar');
    }
    
    if (!subscriptionData.asaasSubscriptionId) {
      throw new Error('Assinatura não possui ID no Asaas');
    }
    
    // 2. Cancelar assinatura no Asaas
    try {
      await cancelSubscription(subscriptionData.asaasSubscriptionId);
    } catch (asaasError) {
      // Se falhar no Asaas, continuamos para atualizar localmente
      // Isso permite que a assinatura seja sincronizada mais tarde
    }
    
    // 3. Atualizar status no banco de dados local
    const updatedSubscription: SubscriptionData = {
      ...subscriptionData,
      status: 'CANCELLED',
      updatedAt: new Date().toISOString(),
      cancelledAt: new Date().toISOString(),
    };
    
    await updateUserSubscription(tenantId, cognitoId, updatedSubscription);
    
    return updatedSubscription;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao cancelar assinatura: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao cancelar assinatura');
    }
  }
}
