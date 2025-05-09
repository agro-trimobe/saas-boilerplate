# 2.2. Desenvolvimento da Interface de Chat (Continuação)

## Componentes da Interface de Mensagens

- [ ] **Implementar área de entrada de mensagens**
  - Criar componente `src/components/chat/MessageInput.tsx` com recursos avançados:
    ```typescript
    import React, { useState, useRef, useEffect } from 'react';
    import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/outline';
    
    interface MessageInputProps {
      onSendMessage: (content: string, attachments?: File[]) => void;
      disabled?: boolean;
    }
    
    export default function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
      const [message, setMessage] = useState('');
      const [files, setFiles] = useState<File[]>([]);
      const [isUploading, setIsUploading] = useState(false);
      const textareaRef = useRef<HTMLTextAreaElement>(null);
      const fileInputRef = useRef<HTMLInputElement>(null);
      
      // Auto-redimensionar textarea
      useEffect(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(
            textareaRef.current.scrollHeight,
            200 // Altura máxima
          )}px`;
        }
      }, [message]);
      
      const handleSend = () => {
        if (disabled || (!message.trim() && files.length === 0)) return;
        
        onSendMessage(message, files.length > 0 ? files : undefined);
        setMessage('');
        setFiles([]);
        
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      };
      
      const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      };
      
      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
          setFiles(Array.from(e.target.files));
        }
      };
      
      const handleFileClick = () => {
        fileInputRef.current?.click();
      };
      
      const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
      };
      
      return (
        <div className="relative">
          {files.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                  <span className="truncate max-w-xs">{file.name}</span>
                  <button 
                    onClick={() => removeFile(index)}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-end border rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem sobre crédito rural..."
              className="flex-1 resize-none p-3 max-h-32 focus:outline-none"
              rows={1}
              disabled={disabled}
            />
            
            <div className="flex items-center px-2">
              <button
                type="button"
                onClick={handleFileClick}
                className="p-1 rounded-full text-gray-500 hover:text-blue-500 hover:bg-blue-50"
                disabled={disabled}
              >
                <PaperClipIcon className="h-5 w-5" />
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                disabled={disabled}
              />
              
              <button
                type="button"
                onClick={handleSend}
                className="ml-1 p-1 rounded-full text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:bg-gray-400"
                disabled={disabled || (!message.trim() && files.length === 0)}
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      );
    }
    ```

- [ ] **Implementar componente de upload de arquivos**
  - Criar serviço de upload em `src/lib/fileUpload.ts`:
    ```typescript
    import { v4 as uuidv4 } from 'uuid';
    
    export async function uploadFile(file: File, tenantId: string, conversationId?: string): Promise<{
      id: string;
      name: string;
      url: string;
      size: number;
      type: string;
    }> {
      try {
        // Gerar ID único para o arquivo
        const fileId = uuidv4();
        
        // Determinar o caminho no S3 com base no contexto
        let s3Path = `tenants/${tenantId}/uploads/`;
        if (conversationId) {
          s3Path += `conversations/${conversationId}/`;
        } else {
          s3Path += 'documents/';
        }
        s3Path += `${fileId}/${file.name}`;
        
        // Obter URL pré-assinada para upload direto ao S3
        const response = await fetch('/api/files/presigned-upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            s3Path
          }),
        });
        
        if (!response.ok) {
          throw new Error('Falha ao obter URL para upload');
        }
        
        const { uploadUrl, fileUrl } = await response.json();
        
        // Fazer upload do arquivo para URL pré-assinada
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        });
        
        // Retornar metadados do arquivo
        return {
          id: fileId,
          name: file.name,
          url: fileUrl,
          size: file.size,
          type: file.type,
        };
      } catch (error) {
        console.error('Erro ao fazer upload do arquivo:', error);
        throw error;
      }
    }
    
    export async function uploadMultipleFiles(files: File[], tenantId: string, conversationId?: string) {
      const uploadPromises = files.map(file => uploadFile(file, tenantId, conversationId));
      return Promise.all(uploadPromises);
    }
    ```

- [ ] **Desenvolver visualização de mensagens**
  - Criar componente `src/components/chat/MessageList.tsx`:
    ```typescript
    import React from 'react';
    import { Message, MessageRole } from '@/types/chat';
    import { format } from 'date-fns';
    import { ptBR } from 'date-fns/locale';
    import ReactMarkdown from 'react-markdown';
    import AttachmentList from './AttachmentList';
    
    interface MessageListProps {
      messages: Message[];
      loading?: boolean;
    }
    
    export default function MessageList({ messages, loading = false }: MessageListProps) {
      const formatMessageDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
      };
      
      return (
        <div className="space-y-4">
          {messages.length === 0 && !loading ? (
            <div className="text-center text-gray-500 py-10">
              <p className="text-xl font-semibold">Bem-vindo ao AgroCredit AI</p>
              <p className="mt-2">
                Seu assistente especializado em crédito rural. Como posso te ajudar hoje?
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-100 text-blue-900'
                      : message.role === 'system'
                      ? 'bg-yellow-100 text-yellow-900'
                      : 'bg-white border shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold">
                      {message.role === 'user'
                        ? 'Você'
                        : message.role === 'system'
                        ? 'Sistema'
                        : 'Assistente AgroCredit'}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatMessageDate(message.createdAt)}
                    </span>
                  </div>
                  
                  {message.content ? (
                    <div className="prose prose-sm max-w-full">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : message.status === 'generating' ? (
                    <div className="flex items-center">
                      <span className="text-gray-500">Gerando resposta</span>
                      <span className="ml-2 flex space-x-1">
                        <span className="animate-bounce h-2 w-2 bg-gray-500 rounded-full" style={{ animationDelay: '0s' }}></span>
                        <span className="animate-bounce h-2 w-2 bg-gray-500 rounded-full" style={{ animationDelay: '0.2s' }}></span>
                        <span className="animate-bounce h-2 w-2 bg-gray-500 rounded-full" style={{ animationDelay: '0.4s' }}></span>
                      </span>
                    </div>
                  ) : null}
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2">
                      <AttachmentList attachments={message.attachments} />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex justify-center py-4">
              <div className="loader">Carregando...</div>
            </div>
          )}
        </div>
      );
    }
    ```

  - Implementar componente `src/components/chat/AttachmentList.tsx` para exibir anexos:
    ```typescript
    import React from 'react';
    import { Attachment } from '@/types/chat';
    import { 
      DocumentIcon, 
      PhotoIcon, 
      TableCellsIcon,
      DocumentTextIcon
    } from '@heroicons/react/24/outline';
    
    interface AttachmentListProps {
      attachments: Attachment[];
    }
    
    export default function AttachmentList({ attachments }: AttachmentListProps) {
      const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      };
      
      const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) {
          return <PhotoIcon className="h-5 w-5 text-gray-500" />;
        } else if (type.includes('spreadsheet') || type.includes('excel')) {
          return <TableCellsIcon className="h-5 w-5 text-green-500" />;
        } else if (type.includes('document') || type.includes('word')) {
          return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
        } else if (type.includes('pdf')) {
          return <DocumentIcon className="h-5 w-5 text-red-500" />;
        }
        return <DocumentIcon className="h-5 w-5 text-gray-500" />;
      };
      
      if (!attachments || attachments.length === 0) return null;
      
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Anexos:</p>
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded border text-sm transition-colors"
              >
                {getFileIcon(attachment.type)}
                <div className="overflow-hidden">
                  <p className="truncate max-w-xs">{attachment.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      );
    }
    ```

## Histórico de Conversas

- [ ] **Criar interface de listagem de conversas**
  - Implementar página para listagem em `src/app/dashboard/conversas/page.tsx`:
    ```typescript
    'use client';
    
    import React, { useState, useEffect } from 'react';
    import { Conversation } from '@/types/chat';
    import ConversationList from '@/components/conversations/ConversationList';
    import { PlusIcon } from '@heroicons/react/24/outline';
    import { useRouter } from 'next/navigation';
    import DashboardLayout from '@/components/layouts/DashboardLayout';
    
    export default function ConversationsPage() {
      const [conversations, setConversations] = useState<Conversation[]>([]);
      const [loading, setLoading] = useState(true);
      const router = useRouter();
      
      useEffect(() => {
        async function fetchConversations() {
          try {
            const response = await fetch('/api/conversations');
            const data = await response.json();
            setConversations(data);
          } catch (error) {
            console.error('Erro ao buscar conversas:', error);
          } finally {
            setLoading(false);
          }
        }
        
        fetchConversations();
      }, []);
      
      const createNewConversation = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title: 'Nova Conversa'
            })
          });
          
          const newConversation = await response.json();
          
          // Navegar para a nova conversa
          router.push(`/dashboard/conversas/${newConversation.id}`);
        } catch (error) {
          console.error('Erro ao criar nova conversa:', error);
          setLoading(false);
        }
      };
      
      return (
        <DashboardLayout>
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Minhas Conversas</h1>
              
              <button
                onClick={createNewConversation}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                disabled={loading}
              >
                <PlusIcon className="h-5 w-5" />
                Nova Conversa
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="loader">Carregando conversas...</div>
              </div>
            ) : (
              <ConversationList conversations={conversations} />
            )}
          </div>
        </DashboardLayout>
      );
    }
    ```

  - Implementar componente `src/components/conversations/ConversationList.tsx`:
    ```typescript
    import React, { useState } from 'react';
    import { Conversation } from '@/types/chat';
    import ConversationItem from './ConversationItem';
    import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
    
    interface ConversationListProps {
      conversations: Conversation[];
    }
    
    export default function ConversationList({ conversations }: ConversationListProps) {
      const [searchTerm, setSearchTerm] = useState('');
      const [showFilters, setShowFilters] = useState(false);
      
      // Filtrar conversas com base no termo de busca
      const filteredConversations = conversations.filter(
        conversation => 
          conversation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (conversation.lastMessagePreview?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      return (
        <div>
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar nas conversas..."
                className="block w-full rounded-lg border border-gray-300 pl-10 pr-12 py-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <FunnelIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {showFilters && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Filtros</h3>
                <div className="space-y-2">
                  {/* Adicionar filtros como data, status, etc. */}
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="this-month" className="rounded" />
                    <label htmlFor="this-month" className="text-sm">Apenas este mês</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="with-attachments" className="rounded" />
                    <label htmlFor="with-attachments" className="text-sm">Com anexos</label>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {filteredConversations.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                {searchTerm ? 'Nenhuma conversa corresponde à sua busca.' : 'Você ainda não tem conversas.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Limpar busca
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <ConversationItem key={conversation.id} conversation={conversation} />
              ))}
            </div>
          )}
        </div>
      );
    }
    ```
