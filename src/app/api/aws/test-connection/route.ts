import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export async function GET() {
  try {
    // Obter a sessão do usuário
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({
        status: 'error',
        message: 'Usuário não autenticado'
      }, { status: 401 });
    }
    
    console.log('[AWS Test] Testando conexão com o DynamoDB');
    
    // Obter configuração AWS
    const awsConfig = {
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    };
    
    console.log('[AWS Test] Configuração AWS:', JSON.stringify({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.credentials?.accessKeyId ? '**presente**' : '**ausente**',
        secretAccessKey: awsConfig.credentials?.secretAccessKey ? '**presente**' : '**ausente**'
      }
    }));
    
    // Criar cliente DynamoDB
    const client = new DynamoDBClient(awsConfig);
    const docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: true,
      },
    });
    
    // Testar listagem de tabelas
    console.log('[AWS Test] Listando tabelas do DynamoDB');
    const command = new ListTablesCommand({});
    const response = await client.send(command);
    
    return NextResponse.json({
      status: 'success',
      message: 'Conexão com o DynamoDB estabelecida com sucesso',
      tables: response.TableNames || [],
      config: {
        region: awsConfig.region,
        hasCredentials: !!awsConfig.credentials?.accessKeyId && !!awsConfig.credentials?.secretAccessKey
      }
    });
  } catch (error: any) {
    console.error('[AWS Test] Erro ao testar conexão com o DynamoDB:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao testar conexão com o DynamoDB',
      error: error.message,
      stack: error.stack,
      name: error.name
    }, { status: 500 });
  }
}
