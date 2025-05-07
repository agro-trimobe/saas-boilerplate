'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  AlertCircleIcon,
  UserCircleIcon,
  FileTextIcon,
  HomeIcon,
  TagIcon,
  CalendarIcon,
  UserIcon
} from 'lucide-react';
import { Tarefa, Lista, Cliente, Projeto, Propriedade } from '@/lib/crm-utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface TarefaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listas: Lista[];
  tarefa?: Partial<Tarefa>;
  listaIdInicial?: string;
  onSave: (tarefa: Partial<Tarefa>) => void;
  // Novos props para relacionamentos
  clientes?: Cliente[];
  projetos?: Projeto[];
  propriedades?: Propriedade[];
  // Funções para carregar dados sob demanda
  onCarregarClientes?: () => Promise<Cliente[]>;
  onCarregarProjetos?: (clienteId?: string) => Promise<Projeto[]>;
  onCarregarPropriedades?: (clienteId?: string) => Promise<Propriedade[]>;
}

export function TarefaDialog({ 
  open, 
  onOpenChange, 
  listas,
  tarefa,
  listaIdInicial,
  onSave,
  clientes = [],
  projetos = [],
  propriedades = [],
  onCarregarClientes,
  onCarregarProjetos,
  onCarregarPropriedades
}: TarefaDialogProps) {
  // Estados básicos da tarefa
  const [titulo, setTitulo] = useState(tarefa?.titulo || '');
  const [descricao, setDescricao] = useState(tarefa?.descricao || '');
  const [listaId, setListaId] = useState(tarefa?.listaId || listaIdInicial || (listas[0]?.id || ''));
  const [prazo, setPrazo] = useState(tarefa?.prazo ? new Date(tarefa.prazo).toISOString().split('T')[0] : '');
  const [responsavel, setResponsavel] = useState(tarefa?.responsavel || '');
  const [prioridade, setPrioridade] = useState(tarefa?.prioridade || 'Média');
  const [etiquetas, setEtiquetas] = useState(tarefa?.etiquetas?.join(', ') || '');
  
  // Estados para abas e relacionamentos
  const [abaAtiva, setAbaAtiva] = useState('informacoes');
  const [clienteId, setClienteId] = useState<string | undefined>(tarefa?.clienteId);
  const [projetoId, setProjetoId] = useState<string | undefined>(tarefa?.projetoId);
  const [propriedadeId, setPropriedadeId] = useState<string | undefined>(tarefa?.propriedadeId);
  
  // Estados para dados relacionados
  const [clientesDisponiveis, setClientesDisponiveis] = useState<Cliente[]>(clientes);
  const [projetosDisponiveis, setProjetosDisponiveis] = useState<Projeto[]>(projetos);
  const [propriedadesDisponiveis, setPropriedadesDisponiveis] = useState<Propriedade[]>(propriedades);
  const [carregando, setCarregando] = useState(false);
  
  // Sempre que abrir o diálogo, resetar os campos e mudar para a aba Informações
  useEffect(() => {
    if (open) {
      // Resetar para a primeira aba quando abrir o diálogo
      setAbaAtiva('informacoes');
      
      if (tarefa?.id) {
        // Modo edição - carrega os dados existentes
        setTitulo(tarefa.titulo || '');
        setDescricao(tarefa.descricao || '');
        setListaId(tarefa.listaId || listaIdInicial || (listas[0]?.id || ''));
        setPrazo(tarefa.prazo ? new Date(tarefa.prazo).toISOString().split('T')[0] : '');
        setResponsavel(tarefa.responsavel || '');
        setPrioridade(tarefa.prioridade || 'Média');
        setEtiquetas(tarefa.etiquetas?.join(', ') || '');
        setClienteId(tarefa.clienteId);
        setProjetoId(tarefa.projetoId);
        setPropriedadeId(tarefa.propriedadeId);
      } else {
        // Modo criação - limpa os campos
        setTitulo('');
        setDescricao('');
        setListaId(listaIdInicial || (listas[0]?.id || ''));
        setPrazo('');
        setResponsavel('');
        setPrioridade('Média');
        setEtiquetas('');
        setClienteId(undefined);
        setProjetoId(undefined);
        setPropriedadeId(undefined);
      }
    }
  }, [open, tarefa, listaIdInicial, listas]);

  // Efeito para carregar clientes independente da aba ativa
  useEffect(() => {
    console.log('TarefaDialog - useEffect - open:', open);
    console.log('TarefaDialog - useEffect - onCarregarClientes existe:', !!onCarregarClientes);
    console.log('TarefaDialog - useEffect - clientesDisponiveis.length:', clientesDisponiveis.length);
    
    if (open && onCarregarClientes) {
      console.log('TarefaDialog - Iniciando carregamento de clientes');
      setCarregando(true);
      
      // Chamar a API imediatamente quando o diálogo abrir
      onCarregarClientes()
        .then(novosClientes => {
          console.log('TarefaDialog - Clientes recebidos:', novosClientes);
          console.log('TarefaDialog - Quantidade de clientes:', novosClientes.length);
          
          // Verificar se os clientes foram realmente retornados
          if (!novosClientes || novosClientes.length === 0) {
            console.warn('TarefaDialog - Array de clientes vazio!');
            // Criar alguns clientes fictícios para testar interface
            const clientesFicticios: Cliente[] = [
              { 
                id: 'dialog1', 
                nome: 'Cliente Dialog 1', 
                cpfCnpj: '111.111.111-11',
                email: 'cliente1@exemplo.com',
                telefone: '(11) 11111-1111',
                tipo: 'PF',
                perfil: 'pequeno',
                dataCadastro: new Date().toISOString()
              },
              { 
                id: 'dialog2', 
                nome: 'Cliente Dialog 2', 
                cpfCnpj: '222.222.222-22',
                email: 'cliente2@exemplo.com',
                telefone: '(22) 22222-2222',
                tipo: 'PJ',
                perfil: 'medio',
                dataCadastro: new Date().toISOString()
              }
            ];
            setClientesDisponiveis(clientesFicticios);
          } else {
            setClientesDisponiveis(novosClientes);
          }
        })
        .catch(erro => {
          console.error('TarefaDialog - Erro ao carregar clientes:', erro);
          
          // Em caso de erro, usar clientes fictícios
          const clientesErro: Cliente[] = [
            { 
              id: 'erro1', 
              nome: 'Cliente Erro 1', 
              cpfCnpj: '333.333.333-33',
              email: 'erro1@exemplo.com',
              telefone: '(33) 33333-3333',
              tipo: 'PF',
              perfil: 'pequeno',
              dataCadastro: new Date().toISOString()
            },
            { 
              id: 'erro2', 
              nome: 'Cliente Erro 2', 
              cpfCnpj: '444.444.444-44',
              email: 'erro2@exemplo.com',
              telefone: '(44) 44444-4444',
              tipo: 'PJ',
              perfil: 'grande',
              dataCadastro: new Date().toISOString()
            }
          ];
          setClientesDisponiveis(clientesErro);
        })
        .finally(() => {
          setCarregando(false);
          console.log('TarefaDialog - Carregamento finalizado');
        });
    }
  }, [open, onCarregarClientes]);
  
  // Efeito para carregar projetos quando um cliente é selecionado
  useEffect(() => {
    if (clienteId && onCarregarProjetos) {
      setCarregando(true);
      onCarregarProjetos(clienteId)
        .then(novosProjetos => {
          setProjetosDisponiveis(novosProjetos);
        })
        .catch(erro => {
          console.error('Erro ao carregar projetos:', erro);
        })
        .finally(() => {
          setCarregando(false);
        });
    } else if (!clienteId) {
      setProjetosDisponiveis([]);
      setProjetoId(undefined);
    }
  }, [clienteId, onCarregarProjetos]);
  
  // Efeito para carregar propriedades quando um cliente é selecionado
  useEffect(() => {
    if (clienteId && onCarregarPropriedades) {
      setCarregando(true);
      onCarregarPropriedades(clienteId)
        .then(novasPropriedades => {
          setPropriedadesDisponiveis(novasPropriedades);
        })
        .catch(erro => {
          console.error('Erro ao carregar propriedades:', erro);
        })
        .finally(() => {
          setCarregando(false);
        });
    } else if (!clienteId) {
      setPropriedadesDisponiveis([]);
      setPropriedadeId(undefined);
    }
  }, [clienteId, onCarregarPropriedades]);

  const handleSave = () => {
    if (!titulo.trim()) return;

    const novaTarefa: Partial<Tarefa> = {
      ...tarefa,
      titulo,
      descricao: descricao.trim() || undefined,
      listaId,
      prazo: prazo ? new Date(prazo).toISOString() : undefined,
      responsavel: responsavel.trim() || undefined,
      prioridade: prioridade as 'Baixa' | 'Média' | 'Alta',
      etiquetas: etiquetas.trim() ? etiquetas.split(',').map(tag => tag.trim()) : undefined,
      // Incluir relacionamentos
      clienteId,
      projetoId,
      propriedadeId
    };

    onSave(novaTarefa);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{tarefa?.id ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
          <DialogDescription>
            Preencha os dados da tarefa nos campos abaixo
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="informacoes" className="flex items-center">
              <AlertCircleIcon className="h-4 w-4 mr-2" />
              Informações
            </TabsTrigger>
            <TabsTrigger value="relacionamentos" className="flex items-center">
              <UserCircleIcon className="h-4 w-4 mr-2" />
              Relacionamentos
            </TabsTrigger>
            <TabsTrigger value="detalhes" className="flex items-center">
              <TagIcon className="h-4 w-4 mr-2" />
              Detalhes
            </TabsTrigger>
          </TabsList>
          
          {/* Aba de informações básicas */}
          <TabsContent value="informacoes" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título da tarefa"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição detalhada da tarefa"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="lista">Lista</Label>
              <select
                id="lista"
                value={listaId}
                onChange={(e) => setListaId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {listas.map((lista) => (
                  <option key={lista.id} value={lista.id}>
                    {lista.titulo}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <RadioGroup 
                value={prioridade} 
                onValueChange={(value) => setPrioridade(value as 'Baixa' | 'Média' | 'Alta')}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Baixa" id="baixa" />
                  <Label htmlFor="baixa" className="text-sm">Baixa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Média" id="media" />
                  <Label htmlFor="media" className="text-sm">Média</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Alta" id="alta" />
                  <Label htmlFor="alta" className="text-sm">Alta</Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
          
          {/* Aba de relacionamentos */}
          <TabsContent value="relacionamentos" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="cliente">Cliente</Label>
              {/* Logs movidos para fora do JSX */}
              
              <select
                id="cliente"
                value={clienteId || ''}
                onChange={(e) => {
                  console.log('TarefaDialog - Cliente selecionado:', e.target.value);
                  setClienteId(e.target.value || undefined);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Selecione um cliente</option>
                {clientesDisponiveis && clientesDisponiveis.length > 0 ? (
                  clientesDisponiveis.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome || 'Cliente sem nome'}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>{carregando ? 'Carregando clientes...' : 'Nenhum cliente disponível'}</option>
                )}
              </select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="projeto">Projeto</Label>
              <select
                id="projeto"
                value={projetoId || ''}
                onChange={(e) => setProjetoId(e.target.value || undefined)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                disabled={!clienteId || projetosDisponiveis.length === 0}
              >
                <option value="">Selecione um projeto</option>
                {projetosDisponiveis.map((projeto) => (
                  <option key={projeto.id} value={projeto.id}>
                    {projeto.titulo}
                  </option>
                ))}
              </select>
              {clienteId && projetosDisponiveis.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhum projeto disponível para este cliente</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="propriedade">Propriedade</Label>
              <select
                id="propriedade"
                value={propriedadeId || ''}
                onChange={(e) => setPropriedadeId(e.target.value || undefined)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                disabled={!clienteId || propriedadesDisponiveis.length === 0}
              >
                <option value="">Selecione uma propriedade</option>
                {propriedadesDisponiveis.map((propriedade) => (
                  <option key={propriedade.id} value={propriedade.id}>
                    {propriedade.nome}
                  </option>
                ))}
              </select>
              {clienteId && propriedadesDisponiveis.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhuma propriedade disponível para este cliente</p>
              )}
            </div>
            
            {!clienteId && (
              <div className="rounded-md bg-blue-50 dark:bg-blue-900/30 p-3 text-sm">
                <p className="text-blue-700 dark:text-blue-300">
                  Selecionar um cliente permitirá vincular esta tarefa a projetos e propriedades específicos.
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* Aba de detalhes */}
          <TabsContent value="detalhes" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="prazo">Prazo</Label>
                <Input
                  id="prazo"
                  type="date"
                  value={prazo}
                  onChange={(e) => setPrazo(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  placeholder="Nome do responsável"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="etiquetas">Etiquetas (separadas por vírgula)</Label>
              <Input
                id="etiquetas"
                value={etiquetas}
                onChange={(e) => setEtiquetas(e.target.value)}
                placeholder="Ex: urgente, cliente, pendente"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            {tarefa?.id ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
