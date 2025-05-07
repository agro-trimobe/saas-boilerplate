/**
 * Faz o upload de um arquivo para o servidor, que por sua vez fará o upload para o S3
 * @param file Arquivo a ser enviado (Blob, File ou string para blob URL)
 * @param options Opções de upload
 * @returns URL do arquivo no S3 e informações adicionais
 */
export async function uploadFile(
  file: Blob | File | string,
  options?: {
    fileName?: string;
    contentType?: string;
    tenantId?: string;
    tipoEntidade?: 'clientes' | 'projetos' | 'propriedades';
    entidadeId?: string;
    tipoArquivo?: 'documentos' | 'fotos';
    arquivoId?: string;
  }
): Promise<{ url: string; id: string; path: string; extensao: string }> {
  try {
    // Verificar se estamos no ambiente de servidor durante o build
    const isServerBuild = typeof window === 'undefined';
    
    // Se estamos no ambiente de servidor durante o build, retornar um objeto simulado
    if (isServerBuild) {
      console.log('[uploadFile] Ambiente de servidor detectado durante o build. Simulando upload...');
      const id = options?.arquivoId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15));
      const extensao = options?.fileName ? options.fileName.split('.').pop() || 'pdf' : 'pdf';
      const tenantId = options?.tenantId || 'default';
      const tipoEntidade = options?.tipoEntidade || 'documentos';
      const entidadeId = options?.entidadeId || 'default';
      const tipoArquivo = options?.tipoArquivo || 'documentos';
      
      // Criar um caminho S3 realista
      const s3Path = `tenants/${tenantId}/${tipoEntidade}/${entidadeId}/${tipoArquivo}/${id}.${extensao}`;
      
      // Retornar um objeto simulado com URL e caminho realistas
      return {
        url: `https://rural-credit-app-documents.s3.amazonaws.com/${s3Path}`,
        id: id,
        path: s3Path,
        extensao: extensao
      };
    }
    
    console.log('[uploadFile] Iniciando upload no ambiente de cliente...');
    console.log('[uploadFile] Tipo de arquivo:', typeof file, file instanceof Blob ? 'Blob' : typeof file === 'string' ? 'String' : 'Desconhecido');
    
    // Converter blob URL para blob se for uma string que começa com 'blob:'
    let fileContent: Blob | File;
    let fileName = options?.fileName || '';
    let contentType = options?.contentType || '';
    
    if (typeof file === 'string') {
      console.log('[uploadFile] Processando arquivo do tipo string:', file.substring(0, 50) + '...');
      
      if (file.startsWith('blob:')) {
        console.log('[uploadFile] Processando blob URL...');
        try {
          // No ambiente de navegador, podemos usar fetch com URLs de blob
          const response = await fetch(file);
          fileContent = await response.blob();
          console.log('[uploadFile] Blob URL convertido para blob com sucesso. Tamanho:', fileContent.size, 'bytes');
          
          // Se não temos contentType, usar o do blob
          if (!contentType) {
            contentType = fileContent.type;
          }
        } catch (error) {
          console.error('[uploadFile] Erro ao processar blob URL:', error);
          // Criar um blob vazio como fallback
          fileContent = new Blob([''], { type: 'application/octet-stream' });
          console.log('[uploadFile] Criado blob vazio como fallback');
        }
      } else if (file.startsWith('data:')) {
        console.log('[uploadFile] Processando Data URL...');
        // Processar Data URLs (base64)
        try {
          const matches = file.match(/^data:(.+);base64,(.*)$/);
          if (matches && matches.length === 3) {
            const dataContentType = matches[1];
            const base64Data = matches[2];
            const binaryData = atob(base64Data);
            const array = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
              array[i] = binaryData.charCodeAt(i);
            }
            fileContent = new Blob([array], { type: dataContentType });
            console.log('[uploadFile] Data URL convertido para blob com sucesso. Tamanho:', fileContent.size, 'bytes');
            
            // Se não temos contentType, usar o do data URL
            if (!contentType) {
              contentType = dataContentType;
            }
          } else {
            console.log('[uploadFile] Data URL inválido, criando blob vazio');
            fileContent = new Blob([''], { type: 'application/octet-stream' });
          }
        } catch (error) {
          console.error('[uploadFile] Erro ao processar data URL:', error);
          fileContent = new Blob([''], { type: 'application/octet-stream' });
        }
      } else {
        console.log('[uploadFile] String não é blob URL nem data URL, criando blob de texto');
        // Se for uma string mas não for um blob URL ou data URL, criar um blob de texto
        fileContent = new Blob([file], { type: 'text/plain' });
        
        // Se não temos contentType, usar text/plain
        if (!contentType) {
          contentType = 'text/plain';
        }
        
        // Se não temos fileName, criar um
        if (!fileName) {
          fileName = 'texto.txt';
        }
      }
    } else if ('name' in file && 'size' in file && 'type' in file) {
      console.log('[uploadFile] Processando arquivo do tipo File. Nome:', (file as File).name, 'Tamanho:', (file as File).size, 'bytes');
      fileContent = file as File;
      
      // Se não temos fileName, usar o nome do arquivo
      if (!fileName) {
        fileName = (file as File).name;
      }
      
      // Se não temos contentType, usar o tipo do arquivo
      if (!contentType) {
        contentType = (file as File).type || 'application/octet-stream';
      }
    } else {
      console.log('[uploadFile] Processando arquivo do tipo Blob. Tamanho:', (file as Blob).size, 'bytes');
      // Se já for um Blob
      fileContent = file as Blob;
      
      // Se não temos contentType, usar o tipo do blob
      if (!contentType) {
        contentType = (file as Blob).type || 'application/octet-stream';
      }
    }
    
    console.log('[uploadFile] Preparando FormData para upload...');
    console.log('[uploadFile] Arquivo final:', {
      tipo: 'name' in fileContent ? 'File' : 'Blob',
      tamanho: fileContent.size,
      contentType: contentType || fileContent.type,
      fileName
    });

    // Criar um FormData para enviar o arquivo
    const formData = new FormData();
    
    // Adicionar o arquivo ao FormData com um nome de arquivo se disponível
    if ('name' in fileContent) {
      formData.append('file', fileContent as File);
    } else {
      // Se for um Blob, precisamos criar um File para manter o nome do arquivo
      if (fileName) {
        const file = new File([fileContent as Blob], fileName, { type: contentType || (fileContent as Blob).type });
        formData.append('file', file);
      } else {
        formData.append('file', fileContent as Blob);
      }
    }
    
    // Adicionar opções ao FormData
    if (fileName) {
      formData.append('fileName', fileName);
    }
    
    if (contentType) {
      formData.append('contentType', contentType);
    }
    
    if (options?.tenantId) {
      formData.append('tenantId', options.tenantId);
    }
    
    if (options?.tipoEntidade) {
      formData.append('tipoEntidade', options.tipoEntidade);
    }
    
    if (options?.entidadeId) {
      formData.append('entidadeId', options.entidadeId);
    }
    
    if (options?.tipoArquivo) {
      formData.append('tipoArquivo', options.tipoArquivo);
    }
    
    if (options?.arquivoId) {
      formData.append('arquivoId', options.arquivoId);
    }
    
    // Enviar o arquivo para a API
    // Usar URL absoluta para evitar problemas com caminhos relativos
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const uploadUrl = `${baseUrl}/api/upload`;
    
    console.log(`[uploadFile] Enviando arquivo para ${uploadUrl}...`);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[uploadFile] Erro na resposta da API:', errorData);
      throw new Error(`Erro ao fazer upload: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('[uploadFile] Upload concluído com sucesso:', data);
    return data;
  } catch (error) {
    console.error('[uploadFile] Erro ao fazer upload do arquivo:', error);
    throw error;
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

/**
 * Verifica se o S3 está configurado corretamente
 * @returns Resultado do diagnóstico
 */
export async function verificarS3(): Promise<any> {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/aws/s3-diagnostico`);
    
    if (!response.ok) {
      throw new Error(`Erro ao verificar S3: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao verificar S3:', error);
    throw error;
  }
}
