import { NextRequest, NextResponse } from 'next/server';
import { 
  S3Client, 
  PutObjectCommand, 
  CreateBucketCommand, 
  HeadBucketCommand,
  PutBucketCorsCommand,
  ListBucketsCommand
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Configurações do AWS S3
const REGION = process.env.COGNITO_REGION || 'us-east-1';
const ACCESS_KEY = process.env.ACCESS_KEY_ID_AWS || '';
const SECRET_KEY = process.env.SECRET_ACCESS_KEY_AWS || '';
const TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'default-tenant';
// Criar um nome de bucket único baseado no tenant ID e na região
const BUCKET_NAME = process.env.BUCKET_NAME || `rural-credit-app-documents`;

// Inicializar o cliente S3
const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

/**
 * Configura o CORS para o bucket
 */
async function configureBucketCors(bucketName: string): Promise<void> {
  try {
    // Configurar CORS para o bucket
    const putBucketCorsCommand = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: ['*'],
            ExposeHeaders: ['ETag', 'x-amz-meta-custom-header']
          }
        ]
      }
    });

    await s3.send(putBucketCorsCommand);
    console.log(`Configuração CORS aplicada ao bucket ${bucketName}`);
  } catch (error) {
    console.error('Erro ao configurar CORS do bucket:', error);
    // Não lançar erro para não interromper o fluxo principal
  }
}

/**
 * Verifica se o bucket S3 existe e cria se não existir
 */
async function ensureBucketExists(): Promise<void> {
  try {
    console.log('[S3] Verificando buckets disponíveis...');
    
    // Listar todos os buckets para diagnóstico
    const listBucketsCommand = new ListBucketsCommand({});
    const listBucketsResponse = await s3.send(listBucketsCommand);
    
    console.log('[S3] Buckets disponíveis:', 
      listBucketsResponse.Buckets?.map(bucket => bucket.Name).join(', ') || 'Nenhum bucket encontrado');
    
    // Verificar se o bucket existe
    const headBucketCommand = new HeadBucketCommand({
      Bucket: BUCKET_NAME
    });

    try {
      await s3.send(headBucketCommand);
      console.log(`[S3] Bucket ${BUCKET_NAME} já existe.`);
      return;
    } catch (error: any) {
      // Se o erro for diferente de "NoSuchBucket", propagar o erro
      if (error.name !== 'NoSuchBucket' && error.$metadata?.httpStatusCode !== 404 && error.Code !== 'NotFound' && error.Code !== 'NoSuchBucket') {
        console.error('[S3] Erro ao verificar bucket:', error);
        throw error;
      }
      
      console.log(`[S3] Bucket ${BUCKET_NAME} não existe. Criando...`);
      
      // Criar o bucket
      const createBucketCommand = new CreateBucketCommand({
        Bucket: BUCKET_NAME,
        // Configuração específica para regiões diferentes de us-east-1
        ...(REGION !== 'us-east-1' ? {
          CreateBucketConfiguration: {
            LocationConstraint: REGION as any
          }
        } : {})
      });
      
      await s3.send(createBucketCommand);
      console.log(`[S3] Bucket ${BUCKET_NAME} criado com sucesso.`);
      
      // Configurar o CORS para o bucket
      await configureBucketCors(BUCKET_NAME);
    }
  } catch (error) {
    console.error('[S3] Erro ao verificar/criar bucket S3:', error);
    throw new Error(`Falha ao verificar/criar bucket S3: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
  }
}

/**
 * Gera o caminho do arquivo no S3 seguindo a estrutura hierárquica
 */
function generateS3Path(
  tenantId: string,
  tipoEntidade: 'clientes' | 'projetos' | 'propriedades',
  entidadeId: string,
  tipoArquivo: 'documentos' | 'fotos',
  arquivoId: string,
  extensao: string
): string {
  return `tenants/${tenantId}/${tipoEntidade}/${entidadeId}/${tipoArquivo}/${arquivoId}.${extensao}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API Upload] Iniciando processo de upload...');
    
    // Verificar configurações do AWS S3
    console.log('[API Upload] Configurações S3:', {
      region: REGION,
      bucketName: BUCKET_NAME,
      accessKeyConfigured: !!ACCESS_KEY,
      secretKeyConfigured: !!SECRET_KEY
    });
    
    // Verificar credenciais AWS
    if (!ACCESS_KEY || !SECRET_KEY) {
      console.error('[API Upload] Erro: Credenciais AWS não configuradas');
      return NextResponse.json(
        { error: 'Credenciais AWS não configuradas. Verifique as variáveis de ambiente ACCESS_KEY_ID_AWS e SECRET_ACCESS_KEY_AWS.' },
        { status: 500 }
      );
    }
    
    // Garantir que o bucket exista
    try {
      await ensureBucketExists();
    } catch (bucketError) {
      console.error('[API Upload] Erro ao verificar/criar bucket:', bucketError);
      return NextResponse.json(
        { error: `Erro ao verificar/criar bucket: ${bucketError instanceof Error ? bucketError.message : JSON.stringify(bucketError)}` },
        { status: 500 }
      );
    }
    
    // Verificar se a requisição é multipart/form-data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const fileName = formData.get('fileName') as string || '';
    const contentType = formData.get('contentType') as string || '';
    const tenantId = formData.get('tenantId') as string || TENANT_ID;
    const tipoEntidade = formData.get('tipoEntidade') as 'clientes' | 'projetos' | 'propriedades' || 'clientes';
    const entidadeId = formData.get('entidadeId') as string || '';
    const tipoArquivo = formData.get('tipoArquivo') as 'documentos' | 'fotos' || 'documentos';
    const arquivoId = formData.get('arquivoId') as string || uuidv4();
    
    console.log('[API Upload] Dados recebidos:', {
      fileName,
      contentType,
      tenantId,
      tipoEntidade,
      entidadeId,
      tipoArquivo,
      arquivoId,
      fileReceived: !!file,
      fileSize: file ? file.size : 0
    });
    
    if (!file) {
      console.error('[API Upload] Erro: Nenhum arquivo enviado');
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Determinar a extensão do arquivo
    let extensao = '';
    if (fileName) {
      const partes = fileName.split('.');
      if (partes.length > 1) {
        extensao = partes[partes.length - 1].toLowerCase();
      }
    } else if (file.name) {
      const partes = file.name.split('.');
      if (partes.length > 1) {
        extensao = partes[partes.length - 1].toLowerCase();
      }
    } else if (contentType) {
      // Tentar obter a extensão a partir do tipo de conteúdo
      const mimeToExt: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
      };
      extensao = mimeToExt[contentType] || 'bin';
    } else {
      extensao = 'bin'; // Extensão genérica se não for possível determinar
    }
    
    // Gerar o caminho do arquivo no S3
    const s3Key = generateS3Path(
      tenantId,
      tipoEntidade,
      entidadeId,
      tipoArquivo,
      arquivoId,
      extensao
    );
    
    console.log(`[API Upload] Fazendo upload para o caminho: ${s3Key}`);
    
    // Converter o arquivo para buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log(`[API Upload] Arquivo convertido para buffer. Tamanho: ${buffer.length} bytes`);
    
    // Configurar o comando de upload
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType || file.type || 'application/octet-stream',
      // Não usar ACL, pois não é suportado pelo bucket
    });
    
    // Enviar o comando para o S3
    try {
      const result = await s3.send(command);
      console.log(`[API Upload] Upload concluído com sucesso:`, result);
    } catch (uploadError) {
      console.error('[API Upload] Erro ao enviar arquivo para o S3:', uploadError);
      return NextResponse.json(
        { error: `Falha ao enviar arquivo para o S3: ${uploadError instanceof Error ? uploadError.message : JSON.stringify(uploadError)}` },
        { status: 500 }
      );
    }
    
    // Retornar a URL do arquivo no S3
    const fileUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
    console.log(`[API Upload] URL do arquivo: ${fileUrl}`);
    
    // Adicionar instruções para o usuário sobre como configurar o acesso público
    console.log(`
      ------------------------------------------------
      IMPORTANTE: Para garantir que os arquivos sejam acessíveis publicamente,
      você precisa configurar o bucket no console da AWS:
      
      1. Acesse o console da AWS: https://console.aws.amazon.com/s3/
      2. Selecione o bucket "${BUCKET_NAME}"
      3. Vá para a aba "Permissions"
      4. Em "Block public access (bucket settings)", clique em "Edit"
      5. Desmarque a opção "Block all public access"
      6. Clique em "Save changes"
      
      Isso permitirá que os arquivos sejam acessados publicamente.
      ------------------------------------------------
    `);
    
    return NextResponse.json({ 
      url: fileUrl,
      id: arquivoId,
      path: s3Key,
      extensao: extensao
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao fazer upload para o S3:', error);
    return NextResponse.json(
      { error: `Falha ao fazer upload para o S3: ${error instanceof Error ? error.message : JSON.stringify(error)}` },
      { status: 500 }
    );
  }
}
