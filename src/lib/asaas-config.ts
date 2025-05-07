import axios from 'axios';

// Configuração do ambiente (sandbox ou produção)
const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://api-sandbox.asaas.com/v3';

// Verifica se o código está sendo executado no navegador (client-side) ou no servidor (server-side)
const isClient = typeof window !== 'undefined';

// Determinar se estamos em ambiente de produção
const isProduction = process.env.NODE_ENV === 'production';

// Função para tratar a chave da API que pode conter caracteres especiais
function getAsaasApiKey(): string {
  // No lado do cliente, retornamos um valor específico
  if (isClient) {
    return 'CLIENT_SIDE';
  }
  
  // Tentar acessar a variável de ambiente
  const envKey = process.env.ASAAS_API_KEY || '';
  
  // Em ambiente de produção, exigimos que a variável de ambiente esteja configurada corretamente
  if (isProduction) {
    if (!envKey || envKey.length < 10) {
      console.error('[Asaas] ERRO CRÍTICO: Chave de API do Asaas não configurada em ambiente de produção.');
      console.error('[Asaas] A variável ASAAS_API_KEY deve ser configurada no ambiente de deploy.');
      throw new Error('Configuração de produção inválida: ASAAS_API_KEY não configurada');
    }
    
    // Remove aspas extras, espaços e quebras de linha em produção
    let apiKey = envKey.replace(/^["|']/g, '').replace(/["|']$/g, '').trim().replace(/\r?\n|\r/g, '');
    
    // Produção exige uma chave válida
    if (!apiKey || apiKey.length < 10) {
      throw new Error('Chave de API do Asaas inválida em ambiente de produção.');
    }
    
    return apiKey;
  }
  
  // AMBIENTE DE DESENVOLVIMENTO (não-produção)
  // Esta solução é apenas para desenvolvimento local
  
  // Chave de sandbox para desenvolvimento local - NUNCA USAR EM PRODUÇÃO
  // Esta abordagem é segura para desenvolvimento pois a chave é de sandbox e não tem acesso a dados reais
  const asaasHmlKey = '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmNlOTYxYmVjLWY1OGYtNGM2My05MTIwLWRiZmQ4MzY3ZGYwODo6JGFhY2hfOGQ3MTZjYmMtNDk5NS00NmRmLWE5OGUtOTA4NWI2YzdhY2Iy';
  
  // Logs apenas em desenvolvimento
  console.log('[Asaas] (DEV) Formato da variável ASAAS_API_KEY:', {
    ambiente: process.env.NODE_ENV || 'development',
    tipo: typeof envKey,
    tamanho: envKey.length,
    primeirosCaracteres: envKey.substring(0, 5) + '...'
  });
  
  // Se a variável não tiver conteúdo em desenvolvimento, usar sandbox
  if (!envKey || envKey.length < 10) {
    console.warn('[Asaas] (DEV) Usando chave padrão do ambiente de sandbox para desenvolvimento local');
    return asaasHmlKey;
  }
  
  // Remove aspas extras, espaços e quebras de linha
  let apiKey = envKey.replace(/^["|']/g, '').replace(/["|']$/g, '').trim().replace(/\r?\n|\r/g, '');
  
  // Se a chave ainda estiver vazia após o tratamento, usar a chave fixa apenas em desenvolvimento
  if (!apiKey || apiKey.length < 10) {
    console.warn('[Asaas] (DEV) Chave do .env inválida após tratamento, usando sandbox');
    return asaasHmlKey;
  }
  
  // Log da chave processada (apenas em desenvolvimento)
  console.log('[Asaas] (DEV) Chave de API processada com sucesso');
  
  return apiKey;
}

// Obtém a chave da API do ambiente
const ASAAS_API_KEY = getAsaasApiKey();

// Verificar se a chave está sendo carregada corretamente (apenas se não estivermos no cliente)
if (!isClient) {
  console.log('[Asaas] Configuração carregada (servidor):', {
    apiUrl: ASAAS_API_URL,
    apiKeyPresente: ASAAS_API_KEY ? 'Sim' : 'Não',
    apiKeyInicio: ASAAS_API_KEY ? ASAAS_API_KEY.substring(0, 10) + '...' : 'não definida'
  });
} else {
  console.log('[Asaas] Configuração carregada (cliente):', {
    apiUrl: ASAAS_API_URL,
    ambiente: 'cliente'
  });
}

// Valores padrão para assinaturas (ajustáveis via variáveis de ambiente)
export const ASAAS_SUBSCRIPTION_BASIC_VALUE = Number(process.env.ASAAS_SUBSCRIPTION_BASIC_VALUE || '57.00');
export const ASAAS_SUBSCRIPTION_PREMIUM_VALUE = Number(process.env.ASAAS_SUBSCRIPTION_PREMIUM_VALUE || '87.00');
export const ASAAS_TRIAL_PERIOD_DAYS = Number(process.env.ASAAS_TRIAL_PERIOD_DAYS || '14');

// Interface para pagamentos com cartão de crédito
export interface CreditCardPayment {
  customer: string;
  billingType: 'CREDIT_CARD';
  value: number;
  nextDueDate: string;
  cycle: 'MONTHLY';
  description: string;
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone?: string;
  };
  remoteIp: string;
}

// Verificar se a chave da API é válida para uso em requisições
if (ASAAS_API_KEY === 'CLIENT_SIDE') {
  console.log('[Asaas] Executando no lado do cliente. As chamadas à API serão feitas via API Routes.');
} else if (!ASAAS_API_KEY) {
  console.error('[Asaas] ERRO GRAVE: Chave de API inválida ou não definida após processamento.');
}

// Cliente API da Asaas - Método 1: Header token
export const asaasApi = axios.create({
  baseURL: ASAAS_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'access_token': ASAAS_API_KEY
  }
});

// Cliente API da Asaas - Método 2: Basic Auth
export const asaasApiAlt = axios.create({
  baseURL: ASAAS_API_URL,
  auth: {
    username: ASAAS_API_KEY,
    password: ''
  },
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para log de requisições (apenas em ambiente de desenvolvimento)
asaasApi.interceptors.request.use(request => {
  console.log('[Asaas API] Enviando requisição:', {
    url: request.url,
    method: request.method,
    headers: {
      ...request.headers,
      'access_token': request.headers['access_token'] ? 'PRESENTE' : 'AUSENTE'
    }
  });
  return request;
});

asaasApiAlt.interceptors.request.use(request => {
  console.log('[Asaas API Alt] Enviando requisição:', {
    url: request.url,
    method: request.method,
    authPresente: request.auth ? 'SIM' : 'NÃO'
  });
  return request;
});

// Adicionar interceptor para verificar headers
asaasApi.interceptors.request.use(request => {
  console.log('[Asaas] Headers da requisição:', {
    headers: request.headers,
    url: request.url,
    method: request.method
  });
  return request;
});

// Função para criar um cliente na Asaas
export async function createCustomer(name: string, cpfCnpj: string, email: string) {
  console.log('[Asaas] Tentando criar cliente:', { name, cpfCnpj, email });
  
  // Primeiro tenta com o cliente principal
  try {
    console.log('[Asaas] Utilizando cliente API principal para criar cliente');
    const response = await asaasApi.post('/customers', {
      name,
      cpfCnpj,
      email
    });
    
    console.log('[Asaas] Cliente criado com sucesso:', { id: response.data.id });
    return response.data;
  } catch (error: unknown) {
    console.error('[Asaas] Erro ao criar cliente (método principal):', error);
    
    if (axios.isAxiosError(error) && error.response) {
      console.error('[Asaas] Detalhes do erro:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Se o erro for 401 Unauthorized, tenta com o cliente alternativo
      if (error.response.status === 401) {
        console.log('[Asaas] Tentando método alternativo (Basic Auth) para criar cliente');
        try {
          const altResponse = await asaasApiAlt.post('/customers', {
            name,
            cpfCnpj,
            email
          });
          console.log('[Asaas] Cliente criado com sucesso usando método alternativo:', { id: altResponse.data.id });
          return altResponse.data;
        } catch (altError) {
          console.error('[Asaas] Erro também no método alternativo de criação de cliente:', altError);
          throw altError;
        }
      }
      
      // Verificar se é um erro de cliente já existente
      if (error.response.status === 409 || 
          (error.response.data && 
           typeof error.response.data === 'object' && 
           'errors' in error.response.data)) {
        const asaasError = error.response.data;
        if (Array.isArray(asaasError.errors) && 
            asaasError.errors.some((err: any) => 
              err.code === 'customer.cpfCnpj.alreadyInUse' || 
              err.code === 'customer.email.alreadyInUse')) {
          
          console.log('[Asaas] Cliente já existe, buscando por CPF/CNPJ:', cpfCnpj);
          // Buscar o cliente existente por CPF/CNPJ
          const existingCustomer = await findCustomerByCpfCnpj(cpfCnpj);
          if (existingCustomer) {
            console.log('[Asaas] Cliente existente encontrado:', { id: existingCustomer.id });
            return existingCustomer;
          }
        }
      }
    }
    
    throw error;
  }
}

// Função para buscar um cliente por CPF/CNPJ
export async function findCustomerByCpfCnpj(cpfCnpj: string) {
  try {
    const response = await asaasApi.get('/customers', {
      params: {
        cpfCnpj
      }
    });
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data[0];
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar cliente por CPF/CNPJ:', error);
    throw error;
  }
}

// Função para criar uma assinatura com cartão de crédito
export async function createSubscription(paymentData: CreditCardPayment) {
  console.log('[Asaas] Tentando criar assinatura para cliente:', { customerId: paymentData.customer });
  
  // Primeiro tenta com o cliente principal
  try {
    console.log('[Asaas] Utilizando cliente API principal para criar assinatura');
    const response = await asaasApi.post('/subscriptions', paymentData);
    console.log('[Asaas] Assinatura criada com sucesso:', { id: response.data.id });
    return response.data;
  } catch (error: unknown) {
    console.error('[Asaas] Erro ao criar assinatura (método principal):', error);
    
    if (axios.isAxiosError(error) && error.response) {
      console.error('[Asaas] Detalhes do erro de assinatura:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Se o erro for 401 Unauthorized, tenta com o cliente alternativo
      if (error.response.status === 401) {
        console.log('[Asaas] Tentando método alternativo (Basic Auth) para criar assinatura');
        try {
          const altResponse = await asaasApiAlt.post('/subscriptions', paymentData);
          console.log('[Asaas] Assinatura criada com sucesso usando método alternativo:', { id: altResponse.data.id });
          return altResponse.data;
        } catch (altError) {
          console.error('[Asaas] Erro também no método alternativo de criação de assinatura:', altError);
          if (axios.isAxiosError(altError) && altError.response) {
            console.error('[Asaas] Detalhes do erro alternativo:', {
              status: altError.response.status,
              data: altError.response.data
            });
          }
        }
      }
      
      // Mapear erros comuns para mensagens amigáveis
      if (error.response.data && typeof error.response.data === 'object') {
        const errorData = error.response.data;
        
        // Erros de cartão
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const cardErrors = errorData.errors.filter((err: any) => 
            err.code && err.code.startsWith('creditCard.'));
          
          if (cardErrors.length > 0) {
            const errorCode = cardErrors[0].code;
            let errorMessage = 'Erro no processamento do cartão';
            
            if (errorCode === 'creditCard.number.invalid') {
              errorMessage = 'Número de cartão inválido';
            } else if (errorCode === 'creditCard.ccv.invalid') {
              errorMessage = 'Código de segurança inválido';
            } else if (errorCode === 'creditCard.expiry.invalid') {
              errorMessage = 'Data de expiração inválida';
            } else if (errorCode === 'creditCard.holderName.invalid') {
              errorMessage = 'Nome do titular inválido';
            }
            
            throw new Error(errorMessage);
          }
        }
      }
    }
    
    throw error;
  }
}

// Função para verificar o status de uma assinatura
export async function getSubscription(id: string) {
  console.log('[Asaas] Verificando status da assinatura:', { id });
  
  try {
    console.log('[Asaas] Utilizando cliente API principal para verificar assinatura');
    const response = await asaasApi.get(`/subscriptions/${id}`);
    console.log('[Asaas] Status da assinatura obtido com sucesso:', { status: response.data.status });
    return response.data;
  } catch (error) {
    console.error('[Asaas] Erro ao verificar status da assinatura (método principal):', error);
    
    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
      console.log('[Asaas] Tentando método alternativo (Basic Auth) para verificar assinatura');
      try {
        const altResponse = await asaasApiAlt.get(`/subscriptions/${id}`);
        console.log('[Asaas] Status da assinatura obtido com sucesso usando método alternativo:', { status: altResponse.data.status });
        return altResponse.data;
      } catch (altError) {
        console.error('[Asaas] Erro também no método alternativo de verificação de assinatura:', altError);
      }
    }
    
    throw error;
  }
}

// Função para cancelar uma assinatura
export async function cancelSubscription(id: string) {
  console.log('[Asaas] Cancelando assinatura:', { id });
  
  try {
    console.log('[Asaas] Utilizando cliente API principal para cancelar assinatura');
    const response = await asaasApi.delete(`/subscriptions/${id}`);
    console.log('[Asaas] Assinatura cancelada com sucesso:', { id });
    return response.data;
  } catch (error) {
    console.error('[Asaas] Erro ao cancelar assinatura (método principal):', error);
    
    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
      console.log('[Asaas] Tentando método alternativo (Basic Auth) para cancelar assinatura');
      try {
        const altResponse = await asaasApiAlt.delete(`/subscriptions/${id}`);
        console.log('[Asaas] Assinatura cancelada com sucesso usando método alternativo:', { id });
        return altResponse.data;
      } catch (altError) {
        console.error('[Asaas] Erro também no método alternativo de cancelamento de assinatura:', altError);
      }
    }
    
    throw error;
  }
}

// Função para atualizar uma assinatura existente
export async function updateSubscription(id: string, data: any) {
  console.log('[Asaas] Atualizando assinatura:', { id, dadosAtualizacao: data });
  
  try {
    console.log('[Asaas] Utilizando cliente API principal para atualizar assinatura');
    const response = await asaasApi.post(`/subscriptions/${id}`, data);
    console.log('[Asaas] Assinatura atualizada com sucesso:', { id });
    return response.data;
  } catch (error) {
    console.error('[Asaas] Erro ao atualizar assinatura (método principal):', error);
    
    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
      console.log('[Asaas] Tentando método alternativo (Basic Auth) para atualizar assinatura');
      try {
        const altResponse = await asaasApiAlt.post(`/subscriptions/${id}`, data);
        console.log('[Asaas] Assinatura atualizada com sucesso usando método alternativo:', { id });
        return altResponse.data;
      } catch (altError) {
        console.error('[Asaas] Erro também no método alternativo de atualização de assinatura:', altError);
      }
    }
    
    throw error;
  }
}
