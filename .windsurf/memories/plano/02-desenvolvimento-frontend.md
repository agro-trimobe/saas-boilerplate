# Fase 2: Desenvolvimento do Frontend (2 semanas)

Este documento detalha as tarefas relacionadas ao desenvolvimento da interface do usuário do AgroCredit (Trimobe), seguindo as especificações definidas no PRD e nos documentos de arquitetura.

## Visão Geral

O frontend do AgroCredit será construído utilizando o framework Next.js com React, aproveitando os componentes do boilerplate e implementando novas funcionalidades específicas do sistema. O desenvolvimento será focado em quatro áreas principais:

1. Layout e páginas de marketing
2. Interface de chat e sistema de conversas
3. Gestão de usuários e perfis
4. Sistema de visualização e upload de documentos

## 2.1. Implementação do Layout e Páginas de Marketing (3 dias)

- [ ] **Personalizar páginas públicas para o contexto de crédito rural**
  - Customizar landing page em `/src/app/page.tsx` (ou página equivalente):
    - Atualizar textos, imagens e exemplos para o contexto de crédito rural
    - Focar nos benefícios específicos para profissionais agrícolas
    - Incluir depoimentos contextualizados

- [ ] **Criar páginas institucionais complementares**
  - Implementar página "Sobre Nós" em `/src/app/sobre/page.tsx`
  - Implementar página "Contato" em `/src/app/contato/page.tsx`
  - Implementar política de privacidade e termos de uso

- [ ] **Customizar página de preços e planos**
  - Criar página em `/src/app/precos/page.tsx` com:
    - Plano gratuito (trial de 7 dias)
    - Plano básico (com limitações)
    - Plano profissional (completo)
  - Implementar comparativo de funcionalidades entre planos
  - Integrar com sistema de pagamento Asaas

- [ ] **Revisar SEO e metadados**
  - Atualizar arquivo de metadados em `/src/app/layout.tsx`:
    ```typescript
    export const metadata = {
      title: 'AgroCredit AI | Assistente Inteligente para Crédito Rural',
      description: 'Otimize processos de crédito rural com nossa plataforma de IA especializada para o agronegócio brasileiro. Analise contratos, simule financiamentos e gere documentos automaticamente.',
      keywords: 'crédito rural, financiamento agrícola, assistente IA, agronegócio, análise de contratos, SNCR, Pronaf, Pronamp',
      openGraph: {
        title: 'AgroCredit AI | Assistente Inteligente para Crédito Rural',
        description: 'Otimize processos de crédito rural com nossa plataforma de IA especializada',
        images: [
          {
            url: '/images/agro/og-image.jpg',
            width: 1200,
            height: 630,
            alt: 'AgroCredit AI',
          },
        ],
      },
    };
    ```
  - Criar arquivos `sitemap.xml` e `robots.txt`

- [ ] **Implementar componentes UI customizados**
  - Criar tema personalizado em `src/styles/theme.js` com cores e tipografia adequadas
  - Desenvolver componentes de UI específicos:
    - Ícones relacionados a agricultura e finanças
    - Cards de produtos/serviços
    - Indicadores financeiros (taxas de juros, valores de financiamento)
    - Badges para diferentes programas de crédito rural

## 2.2. Desenvolvimento da Interface de Chat (5 dias)

- [ ] **Criar componente de interface de chat principal**
  - Implementar container principal do chat em `src/components/chat/ChatContainer.tsx`:
    ```typescript
    import React, { useState, useEffect, useRef } from 'react';
    import { Message, Conversation } from '@/types/chat';
    import MessageList from './MessageList';
    import MessageInput from './MessageInput';
    
    interface ChatContainerProps {
      conversationId: string;
    }
    
    export default function ChatContainer({ conversationId }: ChatContainerProps) {
      const [conversation, setConversation] = useState<Conversation | null>(null);
      const [messages, setMessages] = useState<Message[]>([]);
      const [loading, setLoading] = useState(false);
      const messagesEndRef = useRef<HTMLDivElement>(null);
      
      // Buscar detalhes da conversa
      useEffect(() => {
        async function fetchConversation() {
          try {
            setLoading(true);
            const response = await fetch(`/api/conversations/${conversationId}`);
            const data = await response.json();
            setConversation(data);
          } catch (error) {
            console.error('Erro ao buscar conversa:', error);
          } finally {
            setLoading(false);
          }
        }
        
        fetchConversation();
      }, [conversationId]);
      
      // Buscar mensagens da conversa
      useEffect(() => {
        async function fetchMessages() {
          try {
            setLoading(true);
            const response = await fetch(`/api/conversations/${conversationId}/messages`);
            const data = await response.json();
            setMessages(data);
          } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
          } finally {
            setLoading(false);
          }
        }
        
        fetchMessages();
      }, [conversationId]);
      
      // Rolar para a última mensagem
      useEffect(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, [messages]);
      
      // Enviar nova mensagem
      const sendMessage = async (content: string, attachments?: File[]) => {
        try {
          setLoading(true);
          
          // Preparar dados de upload se houver anexos
          let uploadedAttachments = [];
          
          if (attachments && attachments.length > 0) {
            // Upload dos arquivos primeiro
            const formData = new FormData();
            attachments.forEach(file => {
              formData.append('files', file);
            });
            
            const uploadResponse = await fetch(`/api/files?conversationId=${conversationId}`, {
              method: 'POST',
              body: formData
            });
            
            uploadedAttachments = await uploadResponse.json();
          }
          
          // Enviar mensagem com possíveis anexos
          const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              conversationId,
              content,
              attachments: uploadedAttachments
            })
          });
          
          const data = await response.json();
          
          // Adicionar novas mensagens (do usuário e placeholder da resposta)
          setMessages(prev => [...prev, data.userMessage, data.assistantMessage]);
          
          // Iniciar escuta do streaming da resposta
          listenToMessageStream(data.assistantMessage.id);
          
        } catch (error) {
          console.error('Erro ao enviar mensagem:', error);
        } finally {
          setLoading(false);
        }
      };
      
      // Escutar streaming da resposta
      const listenToMessageStream = (messageId: string) => {
        const eventSource = new EventSource(`/api/messages/${messageId}/stream`);
        
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if (data.content) {
            // Atualizar mensagem do assistente incremental
            setMessages(prev => 
              prev.map(msg => 
                msg.id === messageId 
                  ? { ...msg, content: data.content, status: data.status } 
                  : msg
              )
            );
          }
          
          if (data.status === 'completed' || data.status === 'error') {
            eventSource.close();
          }
        };
        
        eventSource.onerror = () => {
          eventSource.close();
        };
      };
      
      return (
        <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow-sm">
          <div className="flex-1 overflow-y-auto p-4">
            <MessageList messages={messages} loading={loading} />
            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t border-gray-200 p-4">
            <MessageInput onSendMessage={sendMessage} />
          </div>
        </div>
      );
    }
    ```
