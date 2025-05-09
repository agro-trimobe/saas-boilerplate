# 2.4. Sistema de Visualização e Upload de Documentos (3 dias)

Este documento detalha as tarefas relacionadas à implementação do sistema de gestão de documentos do AgroCredit (Trimobe), incluindo visualização, upload e análise de documentos de crédito rural.

## Visão Geral

O sistema de documentos permitirá aos usuários:
- Fazer upload de documentos relacionados a crédito rural
- Visualizar e organizar documentos por categorias e tags
- Extrair informações relevantes através de análise com IA
- Compartilhar documentos com outros membros da equipe

## Componentes e Funcionalidades

### 1. Interface de Gerenciamento de Documentos

- [ ] **Implementar página de listagem de documentos**
  - Criar página em `src/app/dashboard/documentos/page.tsx`:
    ```typescript
    'use client';
    
    import React, { useState, useEffect } from 'react';
    import { useRouter } from 'next/navigation';
    import DashboardLayout from '@/components/layouts/DashboardLayout';
    import { Button, Input, Dropdown } from '@/components/ui';
    import DocumentCard from '@/components/documents/DocumentCard';
    import DocumentUploadModal from '@/components/documents/DocumentUploadModal';
    import { 
      MagnifyingGlassIcon, 
      PlusIcon, 
      ChevronDownIcon,
      TagIcon,
      CalendarIcon,
      DocumentTextIcon
    } from '@heroicons/react/24/outline';
    
    interface Document {
      id: string;
      title: string;
      description?: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
      thumbnailUrl?: string;
      category: string;
      tags: string[];
      createdAt: string;
      updatedAt: string;
    }
    
    export default function DocumentsPage() {
      const [documents, setDocuments] = useState<Document[]>([]);
      const [loading, setLoading] = useState(true);
      const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
      const [searchTerm, setSearchTerm] = useState('');
      const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
      const [selectedTags, setSelectedTags] = useState<string[]>([]);
      const router = useRouter();
      
      // Categorias disponíveis para filtragem
      const categories = [
        'Contratos de Crédito',
        'Projetos Técnicos',
        'Documentos do Produtor',
        'Garantias',
        'Laudos e Vistorias',
        'Outros'
      ];
      
      // Tags disponíveis para filtragem
      const availableTags = [
        'Pronaf', 'Pronamp', 'Custeio', 'Investimento', 
        'Aprovado', 'Em análise', 'Pendente', 'Rejeitado',
        'Alto valor', 'Urgente'
      ];
      
      useEffect(() => {
        async function fetchDocuments() {
          try {
            setLoading(true);
            const response = await fetch('/api/documents');
            const data = await response.json();
            setDocuments(data);
          } catch (error) {
            console.error('Erro ao buscar documentos:', error);
          } finally {
            setLoading(false);
          }
        }
        
        fetchDocuments();
      }, []);
      
      // Filtrar documentos com base nos critérios selecionados
      const filteredDocuments = documents.filter(doc => {
        // Filtro por termo de busca
        const matchesSearch = searchTerm === '' || 
          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (doc.description?.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Filtro por categorias
        const matchesCategory = selectedCategories.length === 0 || 
          selectedCategories.includes(doc.category);
        
        // Filtro por tags
        const matchesTags = selectedTags.length === 0 || 
          selectedTags.some(tag => doc.tags.includes(tag));
        
        return matchesSearch && matchesCategory && matchesTags;
      });
      
      // Manipular upload de novos documentos
      const handleDocumentUpload = async (newDocuments: Document[]) => {
        setDocuments(prev => [...newDocuments, ...prev]);
        setIsUploadModalOpen(false);
      };
      
      // Navegar para página de detalhes do documento
      const handleDocumentClick = (documentId: string) => {
        router.push(`/dashboard/documentos/${documentId}`);
      };
      
      return (
        <DashboardLayout>
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Meus Documentos</h1>
              
              <Button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2">
                <PlusIcon className="h-5 w-5" />
                Adicionar Documento
              </Button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Barra de pesquisa */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar documentos..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Dropdown de categorias */}
              <Dropdown
                trigger={
                  <Button variant="outline" className="flex items-center justify-between gap-2 min-w-[180px]">
                    <DocumentTextIcon className="h-5 w-5" />
                    <span>Categorias</span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                }
                items={categories.map(category => ({
                  label: category,
                  checked: selectedCategories.includes(category),
                  onClick: () => {
                    if (selectedCategories.includes(category)) {
                      setSelectedCategories(prev => prev.filter(c => c !== category));
                    } else {
                      setSelectedCategories(prev => [...prev, category]);
                    }
                  }
                }))}
              />
              
              {/* Dropdown de tags */}
              <Dropdown
                trigger={
                  <Button variant="outline" className="flex items-center justify-between gap-2 min-w-[180px]">
                    <TagIcon className="h-5 w-5" />
                    <span>Tags</span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                }
                items={availableTags.map(tag => ({
                  label: tag,
                  checked: selectedTags.includes(tag),
                  onClick: () => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(prev => prev.filter(t => t !== tag));
                    } else {
                      setSelectedTags(prev => [...prev, tag]);
                    }
                  }
                }))}
              />
            </div>
            
            {/* Chips para filtros selecionados */}
            {(selectedCategories.length > 0 || selectedTags.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategories.map(category => (
                  <div key={category} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                    <span>{category}</span>
                    <button
                      onClick={() => setSelectedCategories(prev => prev.filter(c => c !== category))}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {selectedTags.map(tag => (
                  <div key={tag} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center">
                    <span>{tag}</span>
                    <button
                      onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedTags([]);
                  }}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Limpar todos
                </button>
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="loader">Carregando documentos...</div>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="bg-white border rounded-lg p-8 text-center">
                <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Nenhum documento encontrado</h3>
                <p className="mt-2 text-gray-500">
                  {searchTerm || selectedCategories.length > 0 || selectedTags.length > 0
                    ? 'Tente ajustar os filtros de busca para encontrar seus documentos.'
                    : 'Comece adicionando um novo documento ao sistema.'}
                </p>
                <Button 
                  onClick={() => setIsUploadModalOpen(true)} 
                  className="mt-4"
                >
                  Adicionar Documento
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map(document => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    onClick={() => handleDocumentClick(document.id)}
                  />
                ))}
              </div>
            )}
            
            {/* Modal de upload de documentos */}
            <DocumentUploadModal
              isOpen={isUploadModalOpen}
              onClose={() => setIsUploadModalOpen(false)}
              onUploadComplete={handleDocumentUpload}
              categories={categories}
              availableTags={availableTags}
            />
          </div>
        </DashboardLayout>
      );
    }
    ```

- [ ] **Implementar página de detalhes do documento**
  - Criar página em `src/app/dashboard/documentos/[id]/page.tsx`:
    ```typescript
    'use client';
    
    import React, { useState, useEffect } from 'react';
    import { useParams, useRouter } from 'next/navigation';
    import DashboardLayout from '@/components/layouts/DashboardLayout';
    import { Button, Alert, Separator, Tabs, TabsContent } from '@/components/ui';
    import DocumentViewer from '@/components/documents/DocumentViewer';
    import DocumentMetadata from '@/components/documents/DocumentMetadata';
    import DocumentAnalysis from '@/components/documents/DocumentAnalysis';
    import {
      ArrowLeftIcon,
      PencilIcon,
      TrashIcon,
      ShareIcon,
      DocumentDuplicateIcon
    } from '@heroicons/react/24/outline';
    
    export default function DocumentDetailsPage() {
      const { id } = useParams<{ id: string }>();
      const [document, setDocument] = useState<any>(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [activeTab, setActiveTab] = useState('preview');
      const router = useRouter();
      
      useEffect(() => {
        async function fetchDocument() {
          try {
            setLoading(true);
            const response = await fetch(`/api/documents/${id}`);
            
            if (!response.ok) {
              throw new Error('Documento não encontrado');
            }
            
            const data = await response.json();
            setDocument(data);
          } catch (err: any) {
            setError(err.message || 'Erro ao carregar documento');
            console.error('Erro ao buscar documento:', err);
          } finally {
            setLoading(false);
          }
        }
        
        if (id) {
          fetchDocument();
        }
      }, [id]);
      
      const handleDeleteDocument = async () => {
        if (!window.confirm('Tem certeza que deseja excluir este documento?')) {
          return;
        }
        
        try {
          const response = await fetch(`/api/documents/${id}`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            router.push('/dashboard/documentos');
          } else {
            throw new Error('Erro ao excluir documento');
          }
        } catch (err: any) {
          setError(err.message || 'Erro ao excluir documento');
        }
      };
      
      if (loading) {
        return (
          <DashboardLayout>
            <div className="flex justify-center items-center h-64">
              <div className="loader">Carregando documento...</div>
            </div>
          </DashboardLayout>
        );
      }
      
      if (error || !document) {
        return (
          <DashboardLayout>
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center mb-4">
                <button 
                  onClick={() => router.push('/dashboard/documentos')}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-1" />
                  Voltar para documentos
                </button>
              </div>
              
              <Alert type="error">
                {error || 'Documento não encontrado'}
              </Alert>
            </div>
          </DashboardLayout>
        );
      }
      
      return (
        <DashboardLayout>
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center mb-4">
              <button 
                onClick={() => router.push('/dashboard/documentos')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                Voltar para documentos
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">{document.title}</h1>
                <p className="text-gray-500">{document.description}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/documentos/${id}/editar`)}
                  className="flex items-center gap-1"
                >
                  <PencilIcon className="h-4 w-4" />
                  Editar
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {/* Implementar compartilhamento */}}
                  className="flex items-center gap-1"
                >
                  <ShareIcon className="h-4 w-4" />
                  Compartilhar
                </Button>
                
                <Button
                  variant="outline" 
                  className="flex items-center gap-1"
                  onClick={() => {/* Implementar duplicação */}}
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                  Duplicar
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={handleDeleteDocument}
                  className="flex items-center gap-1"
                >
                  <TrashIcon className="h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <Tabs
              defaultValue="preview"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsContent value="preview" className="mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <DocumentViewer document={document} />
                  </div>
                  
                  <div className="space-y-6">
                    <DocumentMetadata document={document} />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="analysis" className="mt-4">
                <DocumentAnalysis documentId={document.id} />
              </TabsContent>
            </Tabs>
          </div>
        </DashboardLayout>
      );
    }
    ```

### 2. Componentes de Upload e Visualização

- [ ] **Implementar componente de upload de documentos**
  - Criar modal de upload em `src/components/documents/DocumentUploadModal.tsx`:
    ```typescript
    'use client';
    
    import React, { useState, useRef } from 'react';
    import { Modal, Button, Input, Label } from '@/components/ui';
    import { uploadMultipleFiles } from '@/lib/fileUpload';
    import { PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';
    import { useAuth } from '@/hooks/useAuth';
    
    interface DocumentUploadModalProps {
      isOpen: boolean;
      onClose: () => void;
      onUploadComplete: (documents: any[]) => void;
      categories: string[];
      availableTags: string[];
    }
    
    export default function DocumentUploadModal({
      isOpen,
      onClose,
      onUploadComplete,
      categories,
      availableTags
    }: DocumentUploadModalProps) {
      const [files, setFiles] = useState<File[]>([]);
      const [title, setTitle] = useState('');
      const [description, setDescription] = useState('');
      const [category, setCategory] = useState(categories[0] || '');
      const [selectedTags, setSelectedTags] = useState<string[]>([]);
      const [isUploading, setIsUploading] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const fileInputRef = useRef<HTMLInputElement>(null);
      const { user } = useAuth();
      
      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
          const selectedFiles = Array.from(e.target.files);
          setFiles(prev => [...prev, ...selectedFiles]);
          
          // Se não houver título, use o nome do primeiro arquivo
          if (!title && selectedFiles.length === 1) {
            setTitle(selectedFiles[0].name.split('.')[0]);
          }
        }
      };
      
      const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
      };
      
      const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
          setSelectedTags(prev => prev.filter(t => t !== tag));
        } else {
          setSelectedTags(prev => [...prev, tag]);
        }
      };
      
      const resetForm = () => {
        setFiles([]);
        setTitle('');
        setDescription('');
        setCategory(categories[0] || '');
        setSelectedTags([]);
        setError(null);
      };
      
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!files.length) {
          setError('Por favor, selecione pelo menos um arquivo');
          return;
        }
        
        if (!title) {
          setError('Por favor, informe um título para o documento');
          return;
        }
        
        try {
          setIsUploading(true);
          setError(null);
          
          // Upload dos arquivos para o S3
          const uploadedFiles = await uploadMultipleFiles(files, user?.tenantId || '');
          
          // Criar registros de documentos na API
          const documentsPromises = uploadedFiles.map(async (fileData) => {
            const response = await fetch('/api/documents', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                title: files.length === 1 ? title : `${title} - ${fileData.name}`,
                description,
                fileUrl: fileData.url,
                fileType: fileData.type,
                fileSize: fileData.size,
                fileName: fileData.name,
                category,
                tags: selectedTags
              })
            });
            
            return response.json();
          });
          
          const createdDocuments = await Promise.all(documentsPromises);
          
          onUploadComplete(createdDocuments);
          resetForm();
          onClose();
          
        } catch (err: any) {
          console.error('Erro ao fazer upload:', err);
          setError(err.message || 'Erro ao fazer upload dos documentos');
        } finally {
          setIsUploading(false);
        }
      };
      
      return (
        <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Documento">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-800 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="files">Arquivos</Label>
              
              {files.length > 0 ? (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2 bg-gray-50 border rounded"
                    >
                      <div className="flex items-center">
                        <PaperClipIcon className="h-5 w-5 text-gray-500 mr-2" />
                        <div>
                          <p className="font-medium truncate max-w-xs">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeFile(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                    disabled={isUploading}
                  >
                    Adicionar mais arquivos
                  </Button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PaperClipIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">
                    Clique para selecionar arquivos ou arraste e solte aqui
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PDF, Word, Excel, imagens (máx. 20MB por arquivo)
                  </p>
                </div>
              )}
              
              <input
                type="file"
                id="files"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                disabled={isUploading}
              />
            </div>
            
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do documento"
                required
                disabled={isUploading}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva brevemente o conteúdo deste documento"
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
                disabled={isUploading}
              />
            </div>
            
            <div>
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={isUploading}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    disabled={isUploading}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                disabled={files.length === 0 || !title || isUploading}
                loading={isUploading}
              >
                Fazer Upload
              </Button>
            </div>
          </form>
        </Modal>
      );
    }
    ```

- [ ] **Implementar componente de visualização de documentos**
  - Criar componente em `src/components/documents/DocumentViewer.tsx` com suporte a diferentes tipos de arquivos
  - Implementar visualizador de PDF com pré-visualização e zoom
  - Adicionar suporte para exibição de documentos Word via API de conversão
