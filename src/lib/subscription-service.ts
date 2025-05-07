import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from './aws-config';
import { SubscriptionData, SubscriptionPlan, SubscriptionStatus } from './types/subscription';
import { asaasApi, createCustomer, createSubscription, ASAAS_TRIAL_PERIOD_DAYS, ASAAS_SUBSCRIPTION_BASIC_VALUE, ASAAS_SUBSCRIPTION_PREMIUM_VALUE } from './asaas-config';

/**
 * Inicializa a assinatura para um novo usuário com período de teste
 */
export async function initializeTrialSubscription(tenantId: string, cognitoId: string) {
  console.log('[Assinatura] Inicializando período de teste para:', { tenantId, cognitoId });
  
  try {
    const now = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(now.getDate() + ASAAS_TRIAL_PERIOD_DAYS);
    
    const subscriptionData: SubscriptionData = {
      status: 'TRIAL',
      plan: 'TRIAL',
      createdAt: now.toISOString(),
      expiresAt: trialEndDate.toISOString(),
      trialEndsAt: trialEndDate.toISOString(),
    };
    
    await updateUserSubscription(tenantId, cognitoId, subscriptionData);
    console.log('[Assinatura] Período de teste inicializado com sucesso:', { 
      tenantId, 
      cognitoId, 
      trialEndDate: trialEndDate.toISOString() 
    });
    
    return subscriptionData;
  } catch (error) {
    console.error('[Assinatura] Erro ao inicializar período de teste:', error);
    
    // Tratamento seguro para o erro com verificação de tipo
    if (error instanceof Error) {
      throw new Error(`Erro ao inicializar período de teste: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao inicializar período de teste');
    }
  }
}

/**
 * Atualiza as informações de assinatura do usuário
 */
export async function updateUserSubscription(tenantId: string, cognitoId: string, subscriptionData: SubscriptionData) {
  console.log('[Assinatura] Atualizando dados de assinatura para:', { tenantId, cognitoId });
  
  try {
    const command = new UpdateCommand({
      TableName: 'Users',
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
    console.log('[Assinatura] Assinatura atualizada com sucesso:', {
      tenantId,
      cognitoId,
      subscription: result.Attributes?.subscription,
    });
    
    return result.Attributes;
  } catch (error) {
    console.error('[Assinatura] Erro ao atualizar assinatura:', error);
    
    // Tratamento seguro para o erro com verificação de tipo
    if (error instanceof Error) {
      throw new Error(`Erro ao atualizar assinatura: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao atualizar assinatura');
    }
  }
}

/**
 * Verifica se o usuário tem uma assinatura ativa
 */
export async function checkUserSubscription(tenantId: string, cognitoId: string): Promise<SubscriptionData | null> {
  console.log('[Assinatura] Verificando assinatura para:', { tenantId, cognitoId });
  
  try {
    const command = new GetCommand({
      TableName: 'Users',
      Key: {
        PK: `TENANT#${tenantId}`,
        SK: `USER#${cognitoId}`,
      },
    });
    
    const result = await dynamodb.send(command);
    
    if (!result.Item) {
      console.log('[Assinatura] Usuário não encontrado:', { tenantId, cognitoId });
      return null;
    }
    
    const subscriptionData = result.Item.subscription as SubscriptionData | undefined;
    
    if (!subscriptionData) {
      console.log('[Assinatura] Usuário sem dados de assinatura:', { tenantId, cognitoId });
      return null;
    }
    
    console.log('[Assinatura] Dados de assinatura encontrados:', {
      tenantId,
      cognitoId,
      status: subscriptionData.status,
      plan: subscriptionData.plan,
      expiresAt: subscriptionData.expiresAt,
    });
    
    // Verificar se é necessário atualizar o status da assinatura
    if (subscriptionData.status === 'TRIAL') {
      const trialEndDate = new Date(subscriptionData.trialEndsAt);
      const now = new Date();
      
      if (trialEndDate < now) {
        console.log('[Assinatura] Período de teste expirado, atualizando status:', {
          tenantId,
          cognitoId,
          trialEndsAt: subscriptionData.trialEndsAt,
        });
        
        // Atualizar status para TRIAL_ENDED
        subscriptionData.status = 'TRIAL_ENDED';
        await updateUserSubscription(tenantId, cognitoId, subscriptionData);
      }
    }
    
    return subscriptionData;
  } catch (error) {
    console.error('[Assinatura] Erro ao verificar assinatura:', error);
    
    // Tratamento seguro para o erro com verificação de tipo
    if (error instanceof Error) {
      throw new Error(`Erro ao verificar assinatura: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao verificar assinatura');
    }
  }
}

/**
 * Calcula o preço do plano com base no tipo
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
  console.log('[Assinatura] Criando nova assinatura:', { 
    tenantId, 
    cognitoId, 
    email: userData.email,
    plan: paymentData.plan 
  });
  
  try {
    // 1. Criar ou recuperar cliente na Asaas
    const customer = await createCustomer(
      userData.name,
      userData.cpfCnpj,
      userData.email
    );
    
    if (!customer || !customer.id) {
      throw new Error('Falha ao criar cliente na Asaas');
    }
    
    console.log('[Assinatura] Cliente criado/recuperado na Asaas:', { 
      customerId: customer.id,
      name: customer.name
    });
    
    // 2. Determinar a data do próximo pagamento (primeira cobrança imediata)
    const nextDueDate = new Date();
    // Não adiciona o período de teste, para que a cobrança seja imediata
    
    // 3. Criar assinatura na Asaas
    const planValue = getPlanPrice(paymentData.plan);
    
    const subscription = await createSubscription({
      customer: customer.id,
      billingType: 'CREDIT_CARD',
      value: planValue,
      nextDueDate: nextDueDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
      cycle: 'MONTHLY',
      description: `Plano ${paymentData.plan === 'BASIC' ? 'Básico' : 'Premium'} CREDITO RURAL`,
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
    
    console.log('[Assinatura] Assinatura criada na Asaas:', { 
      subscriptionId: subscription.id,
      status: subscription.status,
      value: subscription.value
    });
    
    // 4. Atualizar informações de assinatura do usuário
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // Expira em 1 mês
    
    const subscriptionData: SubscriptionData = {
      status: 'ACTIVE',
      plan: paymentData.plan,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      trialEndsAt: now.toISOString(), // Trial encerrado ao criar assinatura paga
      asaasCustomerId: customer.id,
      asaasSubscriptionId: subscription.id,
      lastPaymentDate: now.toISOString(),
      nextPaymentDate: subscription.nextDueDate,
    };
    
    await updateUserSubscription(tenantId, cognitoId, subscriptionData);
    
    console.log('[Assinatura] Assinatura atualizada com sucesso no DynamoDB:', { 
      tenantId, 
      cognitoId, 
      plan: paymentData.plan,
      status: 'ACTIVE'
    });
    
    return { 
      subscription: subscriptionData,
      asaasSubscription: subscription
    };
  } catch (error) {
    console.error('[Assinatura] Erro ao criar assinatura:', error);
    
    // Tratamento seguro para o erro com verificação de tipo
    if (error instanceof Error) {
      throw new Error(`Erro ao criar assinatura: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao criar assinatura');
    }
  }
}

/**
 * Atualiza o plano de assinatura do usuário
 */
export async function updateSubscriptionPlan(
  tenantId: string,
  cognitoId: string,
  newPlan: SubscriptionPlan
) {
  console.log('[Assinatura] Atualizando plano de assinatura:', { 
    tenantId, 
    cognitoId, 
    newPlan 
  });
  
  try {
    // 1. Obter dados atuais da assinatura
    const subscriptionData = await checkUserSubscription(tenantId, cognitoId);
    
    if (!subscriptionData) {
      throw new Error('Usuário não possui assinatura');
    }
    
    if (!subscriptionData.asaasSubscriptionId) {
      throw new Error('Assinatura não possui ID na Asaas');
    }
    
    // 2. Atualizar na Asaas
    const planValue = getPlanPrice(newPlan);
    
    await asaasApi.post(`/subscriptions/${subscriptionData.asaasSubscriptionId}`, {
      value: planValue,
      description: `Plano ${newPlan === 'BASIC' ? 'Básico' : 'Premium'} CREDITO RURAL`,
    });
    
    // 3. Atualizar no DynamoDB
    subscriptionData.plan = newPlan;
    await updateUserSubscription(tenantId, cognitoId, subscriptionData);
    
    console.log('[Assinatura] Plano atualizado com sucesso:', { 
      tenantId, 
      cognitoId, 
      newPlan,
      asaasSubscriptionId: subscriptionData.asaasSubscriptionId
    });
    
    return subscriptionData;
  } catch (error) {
    console.error('[Assinatura] Erro ao atualizar plano:', error);
    
    // Tratamento seguro para o erro com verificação de tipo
    if (error instanceof Error) {
      throw new Error(`Erro ao atualizar plano: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao atualizar plano');
    }
  }
}
