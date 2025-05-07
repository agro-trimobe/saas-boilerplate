'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
// Removendo importação não utilizada
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  MapPin,
  Ruler,
  FileText,
  List,
  Map as MapIcon,
  BarChart2,
  Plus,
  Search,
} from 'lucide-react';
import { CabecalhoPagina } from '@/components/ui/cabecalho-pagina';
import { Propriedade, Projeto } from '@/lib/crm-utils';
import { propriedadesApi, projetosApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

// Importar os novos componentes
import { FiltrosPropriedades } from './filtros-propriedades';
import dynamic from 'next/dynamic';

// Importação dinâmica sem SSR para evitar problemas de inicialização
const MapaListaPropriedades = dynamic(
  () => import('./mapa-lista-propriedades'),
  { ssr: false }
);

export default function PropriedadesConteudo() {
  const router = useRouter();
  const [propriedades, setPropriedades] = useState<Propriedade[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoProjetos, setCarregandoProjetos] = useState(true);
  const [busca, setBusca] = useState('');
  // Definindo 'mapa' como visualização padrão
  const [visualizacao, setVisualizacao] = useState<'grid' | 'tabela' | 'mapa'>('mapa');
  const [filtroTipoPropriedade, setFiltroTipoPropriedade] = useState<string>('');

  // Contadores
  const totalPropriedades = propriedades.length;
  
  // Mapeamento de propriedade para projetos
  const projetosPorPropriedade = propriedades.reduce((acc, prop) => {
    acc[prop.id] = projetos.filter(p => p.propriedadeId === prop.id).length;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        setCarregandoProjetos(true);
        
        // Carregar propriedades
        const dadosPropriedades = await propriedadesApi.listarPropriedades();
        setPropriedades(dadosPropriedades);
        setCarregando(false);
        
        // Carregar projetos para estatísticas
        const dadosProjetos = await projetosApi.listarProjetos();
        setProjetos(dadosProjetos);
        setCarregandoProjetos(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados.',
          variant: 'destructive',
        });
        setCarregando(false);
        setCarregandoProjetos(false);
      }
    };

    carregarDados();
  }, []);

  // Função para classificar o tamanho da propriedade
  const classificarTamanho = (area: number) => {
    if (area < 20) {
      return { texto: 'Pequena', cor: 'bg-[hsl(12,76%,61%)] text-white' }; // --chart-1
    } else if (area >= 20 && area < 100) {
      return { texto: 'Média', cor: 'bg-[hsl(173,58%,39%)] text-white' }; // --chart-2
    } else {
      return { texto: 'Grande', cor: 'bg-[hsl(197,37%,24%)] text-white' }; // --chart-3
    }
  };

  // Filtrar propriedades
  const propriedadesFiltradas = propriedades
    .filter(propriedade => 
      (propriedade.nome.toLowerCase().includes(busca.toLowerCase()) ||
      propriedade.municipio.toLowerCase().includes(busca.toLowerCase()) ||
      propriedade.estado.toLowerCase().includes(busca.toLowerCase())) &&
      (filtroTipoPropriedade === '' || 
        (filtroTipoPropriedade === 'pequena' && propriedade.area < 20) ||
        (filtroTipoPropriedade === 'media' && propriedade.area >= 20 && propriedade.area < 100) ||
        (filtroTipoPropriedade === 'grande' && propriedade.area >= 100)
      )
    );

  // Componente de carregamento
  if (carregando) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        
        <Skeleton className="h-10 w-full" />
        
        <div className="grid grid-cols-1 gap-4">
          <Skeleton className="h-[580px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <CabecalhoPagina
          titulo="Propriedades"
          descricao="Visualize e gerencie propriedades rurais"
        />
        <Button className="bg-primary hover:bg-primary/90 shadow-sm" asChild>
          <Link href="/propriedades/nova">
            <Plus className="mr-2 h-4 w-4" /> Nova Propriedade
          </Link>
        </Button>
      </div>

      {/* Barra com filtros e seletor de visualização */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 justify-between items-start md:items-center gap-4 bg-muted/20 p-4 rounded-lg border">
        <div className="relative w-full md:w-[280px] flex-shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar propriedades..."
            className="pl-8 w-full"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        
        <div className="flex items-center justify-between w-full space-x-4">
          <div className="w-full md:w-[280px]">
            <FiltrosPropriedades
              termoBusca={""}
              onChangeBusca={() => {}}
              tipoPropriedade={filtroTipoPropriedade}
              onChangeTipoPropriedade={setFiltroTipoPropriedade}
            />
          </div>
          
          <p className="text-sm text-muted-foreground hidden md:block flex-1 text-center">
            Mostrando {propriedadesFiltradas.length} de {totalPropriedades} propriedades
          </p>
          
          <div className="flex items-center ml-auto space-x-4">
            <div className="bg-muted/80 p-1 rounded-md flex drop-shadow-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={visualizacao === 'mapa' ? 'default' : 'ghost'}
                      size="icon"
                      className={`h-8 w-8 ${visualizacao === 'mapa' ? '' : 'hover:bg-muted-foreground/10'}`}
                      onClick={() => setVisualizacao('mapa')}
                    >
                      <MapIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Visualização no mapa</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={visualizacao === 'grid' ? 'default' : 'ghost'}
                      size="icon"
                      className={`h-8 w-8 ${visualizacao === 'grid' ? '' : 'hover:bg-muted-foreground/10'}`}
                      onClick={() => setVisualizacao('grid')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Visualização em cards</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={visualizacao === 'tabela' ? 'default' : 'ghost'}
                      size="icon"
                      className={`h-8 w-8 ${visualizacao === 'tabela' ? '' : 'hover:bg-muted-foreground/10'}`}
                      onClick={() => setVisualizacao('tabela')}
                    >
                      <BarChart2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Visualização em tabela</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground md:hidden">
        Mostrando {propriedadesFiltradas.length} de {totalPropriedades} propriedades
      </p>

      {/* Conteúdo baseado na visualização selecionada */}
      {propriedadesFiltradas.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">Nenhuma propriedade encontrada</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          
          {visualizacao === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {propriedadesFiltradas.length === 0 ? (
                <div className="col-span-full">
                  <Card className="shadow-sm">
                    <CardContent className="py-10">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                        <p className="text-lg text-muted-foreground mt-4">Nenhuma propriedade encontrada</p>
                        <p className="text-sm text-muted-foreground">Ajuste os filtros ou adicione novas propriedades</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                propriedadesFiltradas.map((propriedade) => {
                  const tamanho = classificarTamanho(propriedade.area);
                  return (
                    <Card key={propriedade.id} className="overflow-hidden shadow-sm border-border hover:shadow-md transition-all duration-200 hover:border-primary/30">
                      <CardHeader className="pb-3 border-b border-border/50">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{propriedade.nome}</CardTitle>
                          <Badge className={tamanho.cor}>{tamanho.texto}</Badge>
                        </div>
                        <CardDescription className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1 inline-block text-muted-foreground" />
                          {propriedade.municipio}, {propriedade.estado}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-3">
                        <div className="space-y-3">
                          {propriedade.endereco && (
                            <div className="flex items-start">
                              <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                              <span className="text-sm text-muted-foreground">{propriedade.endereco}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Ruler className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{propriedade.area.toLocaleString('pt-BR')} hectares</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-sm text-muted-foreground">
                                    {projetosPorPropriedade[propriedade.id] || 0} projeto(s) vinculado(s)
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Projetos vinculados a esta propriedade</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 pb-3 border-t border-border/50">
                        <Button variant="outline" size="sm" className="w-full text-primary hover:bg-primary/5" asChild>
                          <Link href={`/propriedades/${propriedade.id}`}>
                            Ver Detalhes
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })
              )}
            </div>
          )}
          
          {visualizacao === 'tabela' && (
            <Card className="shadow-sm border-border">
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[25%]">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-primary" />
                          Nome
                        </div>
                      </TableHead>
                      <TableHead className="w-[25%]">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          Localização
                        </div>
                      </TableHead>
                      <TableHead className="w-[20%]">
                        <div className="flex items-center">
                          <Ruler className="h-4 w-4 mr-2 text-primary" />
                          Área
                        </div>
                      </TableHead>
                      <TableHead className="w-[15%]">
                        <div className="flex items-center">
                          <BarChart2 className="h-4 w-4 mr-2 text-primary" />
                          Projetos
                        </div>
                      </TableHead>
                      <TableHead className="w-[15%] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {propriedadesFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          Nenhuma propriedade encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      propriedadesFiltradas.map((propriedade) => {
                        const tamanho = classificarTamanho(propriedade.area);
                        return (
                          <TableRow key={propriedade.id} className="hover:bg-muted/20 transition-colors">
                            <TableCell className="font-medium">{propriedade.nome}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span>{propriedade.municipio}, {propriedade.estado}</span>
                              </div>
                              {propriedade.endereco && (
                                <span className="text-xs text-muted-foreground mt-1 block">{propriedade.endereco}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>{propriedade.area.toLocaleString('pt-BR')} ha</span>
                                <Badge className={tamanho.cor}>{tamanho.texto}</Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span>{projetosPorPropriedade[propriedade.id] || 0}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" className="text-primary" asChild>
                                <Link href={`/propriedades/${propriedade.id}`}>
                                  Ver Detalhes
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {visualizacao === 'mapa' && (
            <div className="mt-0">
              {propriedadesFiltradas.some(p => p.coordenadas) ? (
                // Chave única baseada nas propriedades para forçar recriação
                <div key={`mapa-${propriedadesFiltradas.filter(p => p.coordenadas).length}`}>
                  <MapaListaPropriedades 
                    propriedades={propriedadesFiltradas.filter(p => p.coordenadas)}
                    classificarTamanho={classificarTamanho}
                    projetosPorPropriedade={projetosPorPropriedade}
                  />
                </div>
              ) : (
                <Card>
                  <CardContent className="py-10">
                    <div className="text-center">
                      <MapIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                      <p className="text-lg text-muted-foreground mt-4">Nenhuma propriedade com coordenadas encontrada</p>
                      <p className="text-sm text-muted-foreground">Adicione coordenadas às propriedades para visualizá-las no mapa</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
