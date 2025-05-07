import { NextRequest, NextResponse } from 'next/server';
import { 
  S3Client, 
  ListBucketsCommand,
  HeadBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';

// Configurações do AWS S3
const REGION = process.env.COGNITO_REGION || 'us-east-1';
const ACCESS_KEY = process.env.ACCESS_KEY_ID_AWS || '';
const SECRET_KEY = process.env.SECRET_ACCESS_KEY_AWS || '';
const BUCKET_NAME = process.env.BUCKET_NAME || 'rural-credit-app-documents';

// Inicializar o cliente S3
const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

/**
 * Rota para diagnóstico do S3
 * Realiza uma série de testes para verificar a conexão com o S3 e as permissões do bucket
 */
export async function GET(request: NextRequest) {
  const resultados: any = {
    timestamp: new Date().toISOString(),
    configuracao: {
      region: REGION,
      bucketName: BUCKET_NAME,
      accessKeyConfigured: !!ACCESS_KEY,
      secretKeyConfigured: !!SECRET_KEY
    },
    testes: {}
  };

  try {
    // Teste 1: Listar buckets
    try {
      console.log('[S3 Diagnóstico] Listando buckets...');
      const listBucketsCommand = new ListBucketsCommand({});
      const listBucketsResponse = await s3.send(listBucketsCommand);
      
      resultados.testes.listarBuckets = {
        sucesso: true,
        buckets: listBucketsResponse.Buckets?.map(bucket => bucket.Name) || []
      };
      console.log(`[S3 Diagnóstico] Buckets encontrados: ${resultados.testes.listarBuckets.buckets.join(', ') || 'Nenhum'}`);
    } catch (error) {
      console.error('[S3 Diagnóstico] Erro ao listar buckets:', error);
      resultados.testes.listarBuckets = {
        sucesso: false,
        erro: error instanceof Error ? error.message : JSON.stringify(error)
      };
    }

    // Teste 2: Verificar se o bucket existe
    try {
      console.log(`[S3 Diagnóstico] Verificando se o bucket ${BUCKET_NAME} existe...`);
      const headBucketCommand = new HeadBucketCommand({
        Bucket: BUCKET_NAME
      });
      await s3.send(headBucketCommand);
      
      resultados.testes.verificarBucket = {
        sucesso: true,
        mensagem: `Bucket ${BUCKET_NAME} existe e está acessível`
      };
      console.log(`[S3 Diagnóstico] ${resultados.testes.verificarBucket.mensagem}`);
    } catch (error) {
      console.error(`[S3 Diagnóstico] Erro ao verificar bucket ${BUCKET_NAME}:`, error);
      resultados.testes.verificarBucket = {
        sucesso: false,
        erro: error instanceof Error ? error.message : JSON.stringify(error)
      };
    }

    // Teste 3: Fazer upload de um arquivo de teste
    const testKey = `diagnostico/teste-${Date.now()}.txt`;
    try {
      console.log(`[S3 Diagnóstico] Fazendo upload de arquivo de teste para ${testKey}...`);
      const putObjectCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: testKey,
        Body: 'Este é um arquivo de teste para diagnóstico do S3',
        ContentType: 'text/plain'
      });
      await s3.send(putObjectCommand);
      
      resultados.testes.uploadArquivo = {
        sucesso: true,
        mensagem: `Arquivo de teste enviado com sucesso para ${testKey}`,
        url: `https://${BUCKET_NAME}.s3.amazonaws.com/${testKey}`
      };
      console.log(`[S3 Diagnóstico] ${resultados.testes.uploadArquivo.mensagem}`);
    } catch (error) {
      console.error('[S3 Diagnóstico] Erro ao fazer upload de arquivo de teste:', error);
      resultados.testes.uploadArquivo = {
        sucesso: false,
        erro: error instanceof Error ? error.message : JSON.stringify(error)
      };
    }

    // Teste 4: Baixar o arquivo de teste (se o upload foi bem-sucedido)
    if (resultados.testes.uploadArquivo?.sucesso) {
      try {
        console.log(`[S3 Diagnóstico] Baixando arquivo de teste ${testKey}...`);
        const getObjectCommand = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: testKey
        });
        const getObjectResponse = await s3.send(getObjectCommand);
        
        // Converter o stream para texto
        const streamToString = async (stream: any): Promise<string> => {
          const chunks: Uint8Array[] = [];
          for await (const chunk of stream) {
            chunks.push(chunk);
          }
          return Buffer.concat(chunks).toString('utf-8');
        };
        
        const conteudo = await streamToString(getObjectResponse.Body);
        
        resultados.testes.baixarArquivo = {
          sucesso: true,
          mensagem: `Arquivo de teste baixado com sucesso`,
          conteudo: conteudo
        };
        console.log(`[S3 Diagnóstico] ${resultados.testes.baixarArquivo.mensagem}`);
      } catch (error) {
        console.error('[S3 Diagnóstico] Erro ao baixar arquivo de teste:', error);
        resultados.testes.baixarArquivo = {
          sucesso: false,
          erro: error instanceof Error ? error.message : JSON.stringify(error)
        };
      }
    }

    // Teste 5: Excluir o arquivo de teste (se o upload foi bem-sucedido)
    if (resultados.testes.uploadArquivo?.sucesso) {
      try {
        console.log(`[S3 Diagnóstico] Excluindo arquivo de teste ${testKey}...`);
        const deleteObjectCommand = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: testKey
        });
        await s3.send(deleteObjectCommand);
        
        resultados.testes.excluirArquivo = {
          sucesso: true,
          mensagem: `Arquivo de teste excluído com sucesso`
        };
        console.log(`[S3 Diagnóstico] ${resultados.testes.excluirArquivo.mensagem}`);
      } catch (error) {
        console.error('[S3 Diagnóstico] Erro ao excluir arquivo de teste:', error);
        resultados.testes.excluirArquivo = {
          sucesso: false,
          erro: error instanceof Error ? error.message : JSON.stringify(error)
        };
      }
    }

    // Adicionar recomendações com base nos resultados dos testes
    resultados.recomendacoes = [];
    
    if (!resultados.testes.listarBuckets?.sucesso) {
      resultados.recomendacoes.push('Verifique se as credenciais AWS estão configuradas corretamente e têm permissões para listar buckets.');
    }
    
    if (!resultados.testes.verificarBucket?.sucesso) {
      resultados.recomendacoes.push(`Verifique se o bucket ${BUCKET_NAME} existe e se as credenciais têm permissão para acessá-lo.`);
    }
    
    if (!resultados.testes.uploadArquivo?.sucesso) {
      resultados.recomendacoes.push(`Verifique se as credenciais têm permissão para fazer upload de arquivos para o bucket ${BUCKET_NAME}.`);
    }
    
    if (resultados.testes.uploadArquivo?.sucesso && !resultados.testes.baixarArquivo?.sucesso) {
      resultados.recomendacoes.push(`Verifique se as credenciais têm permissão para baixar arquivos do bucket ${BUCKET_NAME}.`);
    }
    
    if (resultados.testes.uploadArquivo?.sucesso && !resultados.testes.excluirArquivo?.sucesso) {
      resultados.recomendacoes.push(`Verifique se as credenciais têm permissão para excluir arquivos do bucket ${BUCKET_NAME}.`);
    }
    
    // Verificar se todos os testes foram bem-sucedidos
    const todosTestesSucesso = Object.values(resultados.testes).every((teste: any) => teste.sucesso);
    
    if (todosTestesSucesso) {
      resultados.status = 'sucesso';
      resultados.mensagem = 'Todos os testes foram concluídos com sucesso. O S3 está configurado corretamente.';
      
      // Adicionar instruções para configurar o acesso público
      resultados.recomendacoes.push(`
        Para garantir que os arquivos sejam acessíveis publicamente, configure o bucket no console da AWS:
        
        1. Acesse o console da AWS: https://console.aws.amazon.com/s3/
        2. Selecione o bucket "${BUCKET_NAME}"
        3. Vá para a aba "Permissions"
        4. Em "Block public access (bucket settings)", clique em "Edit"
        5. Desmarque a opção "Block all public access"
        6. Clique em "Save changes"
      `);
    } else {
      resultados.status = 'erro';
      resultados.mensagem = 'Alguns testes falharam. Verifique as recomendações para resolver os problemas.';
    }

    return NextResponse.json(resultados, { status: 200 });
  } catch (error) {
    console.error('[S3 Diagnóstico] Erro geral:', error);
    return NextResponse.json({
      status: 'erro',
      mensagem: 'Ocorreu um erro durante o diagnóstico do S3',
      erro: error instanceof Error ? error.message : JSON.stringify(error)
    }, { status: 500 });
  }
}
