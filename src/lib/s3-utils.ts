import { PutObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { s3 } from './aws-config';
import { v4 as uuidv4 } from 'uuid';

// Nome do bucket S3
const BUCKET_NAME = 'rural-credit-app-documents';

/**
 * Verifica se o bucket S3 existe e cria se não existir
 */
export async function ensureBucketExists(): Promise<void> {
  try {
    // Verificar se o bucket existe
    const headBucketCommand = new HeadBucketCommand({
      Bucket: BUCKET_NAME
    });

    try {
      await s3.send(headBucketCommand);
      console.log(`Bucket ${BUCKET_NAME} já existe.`);
      return;
    } catch (error: any) {
      // Se o erro for diferente de "NoSuchBucket", propagar o erro
      if (error.name !== 'NotFound' && error.$metadata?.httpStatusCode !== 404) {
        throw error;
      }
      
      console.log(`Bucket ${BUCKET_NAME} não existe. Criando...`);
      
      // Criar o bucket
      const createBucketCommand = new CreateBucketCommand({
        Bucket: BUCKET_NAME,
        ACL: 'public-read' // Tornar o bucket público
      });
      
      await s3.send(createBucketCommand);
      console.log(`Bucket ${BUCKET_NAME} criado com sucesso.`);
    }
  } catch (error) {
    console.error('Erro ao verificar/criar bucket S3:', error);
    throw new Error(`Falha ao verificar/criar bucket S3: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Faz o upload de um arquivo para o S3
 * @param file Arquivo a ser enviado (pode ser um Blob, File, Buffer ou string)
 * @param fileName Nome do arquivo (opcional, será gerado um nome único se não informado)
 * @param contentType Tipo de conteúdo do arquivo (opcional)
 * @returns URL do arquivo no S3
 */
export async function uploadToS3(
  file: Blob | File | Buffer | string,
  fileName?: string,
  contentType?: string
): Promise<string> {
  try {
    // Garantir que o bucket exista
    await ensureBucketExists();
    
    // Gerar um nome único para o arquivo se não for informado
    const uniqueFileName = fileName || `${uuidv4()}-${new Date().getTime()}`;
    
    // Determinar o tipo de conteúdo
    let fileContentType = contentType;
    if (!fileContentType && file instanceof File) {
      fileContentType = file.type;
    } else if (!fileContentType && file instanceof Blob) {
      fileContentType = file.type;
    } else if (!fileContentType) {
      fileContentType = 'application/octet-stream';
    }
    
    // Converter blob URL para blob se for uma string que começa com 'blob:'
    let fileContent = file;
    if (typeof file === 'string' && file.startsWith('blob:')) {
      try {
        const response = await fetch(file);
        fileContent = await response.blob();
      } catch (error) {
        console.error('Erro ao converter blob URL para blob:', error);
        throw new Error('Falha ao processar o arquivo do blob URL');
      }
    }
    
    // Configurar o comando de upload
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      Body: fileContent,
      ContentType: fileContentType,
      ACL: 'public-read', // Tornar o arquivo público
    });
    
    // Enviar o comando para o S3
    await s3.send(command);
    
    // Retornar a URL do arquivo no S3
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${uniqueFileName}`;
  } catch (error) {
    console.error('Erro ao fazer upload para o S3:', error);
    throw new Error(`Falha ao fazer upload para o S3: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Converte um blob URL para um blob
 * @param blobUrl URL do blob
 * @returns Blob
 */
export async function blobUrlToBlob(blobUrl: string): Promise<Blob> {
  try {
    const response = await fetch(blobUrl);
    return await response.blob();
  } catch (error) {
    console.error('Erro ao converter blob URL para blob:', error);
    throw new Error('Falha ao processar o arquivo do blob URL');
  }
}
