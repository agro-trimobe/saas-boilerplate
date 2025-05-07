import { NextResponse } from "next/server";
import { CognitoIdentityProviderClient, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import crypto from 'crypto';
import { createTenantAndUser } from "@/lib/tenant-utils";
import { initializeTrialSubscription } from "@/lib/subscription-service";

function calculateSecretHash(username: string) {
  try {
    console.log('Calculando secret hash para registro de:', username);
    console.log('Client ID:', process.env.COGNITO_CLIENT_ID ? 'Configurado' : 'Não configurado');
    console.log('Client Secret:', process.env.COGNITO_CLIENT_SECRET ? 'Configurado' : 'Não configurado');
    
    if (!process.env.COGNITO_CLIENT_ID || !process.env.COGNITO_CLIENT_SECRET) {
      console.error('COGNITO_CLIENT_ID ou COGNITO_CLIENT_SECRET não estão configurados');
      throw new Error('Configurações do Cognito incompletas');
    }
    
    const message = username + process.env.COGNITO_CLIENT_ID;
    const hmac = crypto.createHmac('sha256', process.env.COGNITO_CLIENT_SECRET);
    hmac.update(message);
    const hash = hmac.digest('base64');
    console.log('Secret hash calculado com sucesso para registro');
    return hash;
  } catch (error: unknown) {
    console.error('Erro ao calcular secret hash para registro:', error);
    
    // Tratamento seguro para o erro com verificação de tipo
    if (error instanceof Error) {
      throw new Error('Erro ao calcular secret hash: ' + error.message);
    } else {
      throw new Error('Erro desconhecido ao calcular secret hash');
    }
  }
}

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS || "",
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS || "",
  },
});

// Verificar se as variáveis de ambiente necessárias estão configuradas
if (!process.env.COGNITO_REGION || !process.env.COGNITO_CLIENT_ID || !process.env.COGNITO_CLIENT_SECRET || 
    !process.env.COGNITO_USER_POOL_ID || !process.env.ACCESS_KEY_ID_AWS || !process.env.SECRET_ACCESS_KEY_AWS) {
  console.error('Variáveis de ambiente necessárias não estão configuradas:');
  console.error('COGNITO_REGION:', process.env.COGNITO_REGION ? 'Configurado' : 'Não configurado');
  console.error('COGNITO_CLIENT_ID:', process.env.COGNITO_CLIENT_ID ? 'Configurado' : 'Não configurado');
  console.error('COGNITO_CLIENT_SECRET:', process.env.COGNITO_CLIENT_SECRET ? 'Configurado' : 'Não configurado');
  console.error('COGNITO_USER_POOL_ID:', process.env.COGNITO_USER_POOL_ID ? 'Configurado' : 'Não configurado');
  console.error('ACCESS_KEY_ID_AWS:', process.env.ACCESS_KEY_ID_AWS ? 'Configurado' : 'Não configurado');
  console.error('SECRET_ACCESS_KEY_AWS:', process.env.SECRET_ACCESS_KEY_AWS ? 'Configurado' : 'Não configurado');
}

// Adicionar logs para depuração
console.log('Configuração do cliente Cognito para registro:');
console.log('Região:', process.env.COGNITO_REGION);
console.log('Client ID:', process.env.COGNITO_CLIENT_ID ? 'Configurado' : 'Não configurado');
console.log('Client Secret:', process.env.COGNITO_CLIENT_SECRET ? 'Configurado' : 'Não configurado');
console.log('User Pool ID:', process.env.COGNITO_USER_POOL_ID ? 'Configurado' : 'Não configurado');
console.log('Access Key:', process.env.ACCESS_KEY_ID_AWS ? 'Configurado' : 'Não configurado');
console.log('Secret Key:', process.env.SECRET_ACCESS_KEY_AWS ? 'Configurado' : 'Não configurado');

export async function POST(request: Request) {
  try {
    console.log('Iniciando processo de registro');
    const { name, email, password } = await request.json();
    console.log('Dados recebidos para registro:', { name, email, hasPassword: !!password });

    if (!email || !password || !name) {
      console.error('Dados incompletos para registro');
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se todas as variáveis de ambiente necessárias estão configuradas
    if (!process.env.COGNITO_REGION || !process.env.COGNITO_CLIENT_ID || !process.env.COGNITO_CLIENT_SECRET) {
      console.error('Variáveis de ambiente do Cognito não estão configuradas corretamente');
      return NextResponse.json(
        { error: "Erro de configuração do servidor. Contate o administrador." },
        { status: 500 }
      );
    }

    // 1. Registrar no Cognito
    const command = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
      SecretHash: calculateSecretHash(email),
      UserAttributes: [
        {
          Name: "given_name",
          Value: name,
        },
        {
          Name: "email",
          Value: email,
        },
      ],
    });

    console.log('Enviando comando de registro para Cognito para o email:', email);
    console.log('Configurações do comando:', {
      ClientId: process.env.COGNITO_CLIENT_ID ? 'Configurado' : 'Não configurado',
      SecretHash: calculateSecretHash(email) ? 'Calculado' : 'Não calculado',
      UserAttributes: 'Configurados'
    });
    
    try {
      console.log('Enviando comando para Cognito...');
      const cognitoResponse = await cognitoClient.send(command);
      console.log('Resposta do Cognito recebida:', cognitoResponse.UserSub ? 'Usuário criado com sucesso' : 'Falha na criação do usuário');
      const cognitoId = cognitoResponse.UserSub;

      if (!cognitoId) {
        throw new Error('Erro ao obter ID do usuário do Cognito');
      }

      // 2. Criar tenant e usuário no DynamoDB
      console.log('Criando tenant e usuário no DynamoDB para cognitoId:', cognitoId);
      try {
        // Criar tenant e usuário
        const tenantId = await createTenantAndUser(cognitoId, email, name);
        console.log('Tenant e usuário criados com sucesso no DynamoDB');
        
        // 3. Inicializar período de teste de 14 dias
        try {
          console.log('Inicializando período de teste para o usuário:', { tenantId, cognitoId });
          await initializeTrialSubscription(tenantId, cognitoId);
          console.log('Período de teste inicializado com sucesso');
        } catch (trialError) {
          console.error('Erro ao inicializar período de teste:', trialError);
          // Não interromper o fluxo se falhar apenas a inicialização do trial
        }
      } catch (dbError: unknown) {
        console.error('Erro ao criar tenant e usuário no DynamoDB:', dbError);
        
        // Tratamento seguro para o erro com verificação de tipo
        const errorDetails: Record<string, unknown> = {};
        
        if (dbError && typeof dbError === 'object') {
          if ('name' in dbError && dbError.name) {
            errorDetails.name = dbError.name;
          }
          
          if ('message' in dbError && dbError.message) {
            errorDetails.message = dbError.message;
          }
          
          // Verificar se é um erro específico do AWS SDK
          if ('$metadata' in dbError) {
            const metadata = dbError.$metadata as Record<string, unknown>;
            errorDetails.code = metadata.httpStatusCode;
            errorDetails.requestId = metadata.requestId;
          }
        }
        
        console.error('Detalhes do erro DynamoDB:', errorDetails);
        
        // Retornar erro específico para problemas com DynamoDB
        return NextResponse.json(
          { error: "Erro ao criar usuário no banco de dados. Por favor, tente novamente." },
          { status: 500 }
        );
      }

      console.log('Registro concluído com sucesso para:', email);
      return NextResponse.json({ 
        success: true,
        requiresConfirmation: true,
        email: email,
        message: 'Usuário registrado com sucesso. Por favor, confirme seu email.'
      });
    } catch (error: unknown) {
      console.error("Erro no registro:", error);
      
      // Tratamento seguro para o erro com verificação de tipo
      const errorDetails: Record<string, unknown> = {};
      
      if (error && typeof error === 'object') {
        if ('name' in error && error.name) {
          errorDetails.name = error.name;
        }
        
        if ('message' in error && error.message) {
          errorDetails.message = error.message;
        }
        
        // Verificar se é um erro específico do AWS SDK
        if ('$metadata' in error) {
          const metadata = error.$metadata as Record<string, unknown>;
          errorDetails.code = metadata.httpStatusCode;
          errorDetails.requestId = metadata.requestId;
        }
        
        // Verificar se é um erro do Cognito
        if ('__type' in error && error.__type) {
          errorDetails.type = error.__type;
        }
      }
      
      console.error("Detalhes do erro:", errorDetails);
      
      // Tratamento específico para usuário já existente
      if (error && typeof error === 'object' && '__type' in error && error.__type === 'UsernameExistsException') {
        return NextResponse.json(
          { error: "Este email já está cadastrado. Por favor, use outro email ou faça login." },
          { status: 409 }
        );
      }

      // Tratamento para outros erros do Cognito
      if (error && typeof error === 'object' && '__type' in error && error.__type) {
        let errorMessage = "Erro ao criar usuário";
        
        switch (error.__type) {
          case 'InvalidPasswordException':
            errorMessage = "A senha não atende aos requisitos mínimos de segurança";
            break;
          case 'InvalidParameterException':
            errorMessage = "Dados inválidos fornecidos";
            break;
          case 'CodeDeliveryFailureException':
            errorMessage = "Erro ao enviar código de verificação";
            break;
          default:
            errorMessage = "Erro ao criar usuário. Por favor, tente novamente.";
        }
        
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        );
      }

      // Erro genérico
      return NextResponse.json(
        { error: "Erro interno do servidor. Por favor, tente novamente mais tarde." },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Erro no registro:", error);
      
      // Tratamento seguro para o erro com verificação de tipo
      const errorDetails: Record<string, unknown> = {};
      
      if (error && typeof error === 'object') {
        if ('name' in error && error.name) {
          errorDetails.name = error.name;
        }
        
        if ('message' in error && error.message) {
          errorDetails.message = error.message;
        }
        
        // Verificar se é um erro específico do AWS SDK
        if ('$metadata' in error) {
          const metadata = error.$metadata as Record<string, unknown>;
          errorDetails.code = metadata.httpStatusCode;
          errorDetails.requestId = metadata.requestId;
        }
        
        // Verificar se é um erro do Cognito
        if ('__type' in error && error.__type) {
          errorDetails.type = error.__type;
        }
      }
      
      console.error("Detalhes do erro:", errorDetails);
      
      // Tratamento específico para usuário já existente
      if (error && typeof error === 'object' && '__type' in error && error.__type === 'UsernameExistsException') {
        return NextResponse.json(
          { error: "Este email já está cadastrado. Por favor, use outro email ou faça login." },
          { status: 409 }
        );
      }

      // Tratamento para outros erros do Cognito
      if (error && typeof error === 'object' && '__type' in error && error.__type) {
        let errorMessage = "Erro ao criar usuário";
        
        switch (error.__type) {
          case 'InvalidPasswordException':
            errorMessage = "A senha não atende aos requisitos mínimos de segurança";
            break;
          case 'InvalidParameterException':
            errorMessage = "Dados inválidos fornecidos";
            break;
          case 'CodeDeliveryFailureException':
            errorMessage = "Erro ao enviar código de verificação";
            break;
          default:
            errorMessage = "Erro ao criar usuário. Por favor, tente novamente.";
        }
        
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        );
      }

      // Erro genérico
      return NextResponse.json(
        { error: "Erro interno do servidor. Por favor, tente novamente mais tarde." },
        { status: 500 }
      );
  }
}
