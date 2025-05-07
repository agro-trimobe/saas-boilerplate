import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { DynamoDBClient, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export async function GET(request: NextRequest) {
  try {
    // Obter a sessão do usuário
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({
        status: 'error',
        message: 'Usuário não autenticado'
      }, { status: 401 });
    }
    
    console.log('[AWS Status] Verificando status do DynamoDB');
    
    // Obter configuração AWS
    const awsConfig = {
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    };
    
    // Criar cliente DynamoDB
    const client = new DynamoDBClient(awsConfig);
    const docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: true,
      },
    });
    
    // Verificar tabela principal
    const tableName = process.env.DYNAMODB_TABLE_NAME || 'rural-credit-app';
    console.log(`[AWS Status] Verificando tabela ${tableName}`);
    
    const command = new DescribeTableCommand({
      TableName: tableName
    });
    
    const response = await client.send(command);
    
    // Verificar variáveis de ambiente
    const envStatus = {
      AWS_REGION: process.env.AWS_REGION ? 'configurado' : 'não configurado',
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'configurado' : 'não configurado',
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'configurado' : 'não configurado',
      DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME ? 'configurado' : 'não configurado',
    };
    
    return NextResponse.json({
      status: 'success',
      message: 'Status do DynamoDB verificado com sucesso',
      tableStatus: response.Table?.TableStatus || 'Desconhecido',
      tableInfo: {
        name: response.Table?.TableName,
        itemCount: response.Table?.ItemCount,
        creationDate: response.Table?.CreationDateTime,
        sizeBytes: response.Table?.TableSizeBytes
      },
      environmentVariables: envStatus,
      awsConfig: {
        region: awsConfig.region,
        hasCredentials: !!awsConfig.credentials?.accessKeyId && !!awsConfig.credentials?.secretAccessKey
      }
    });
  } catch (error: any) {
    console.error('[AWS Status] Erro ao verificar status do DynamoDB:', error);
    
    // Verificar variáveis de ambiente mesmo em caso de erro
    const envStatus = {
      AWS_REGION: process.env.AWS_REGION ? 'configurado' : 'não configurado',
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'configurado' : 'não configurado',
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'configurado' : 'não configurado',
      DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME ? 'configurado' : 'não configurado',
    };
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao verificar status do DynamoDB',
      error: error.message,
      errorName: error.name,
      environmentVariables: envStatus,
      awsConfig: {
        region: process.env.AWS_REGION || 'não configurado',
        hasCredentials: !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY
      }
    }, { status: 500 });
  }
}
