'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from 'react';
import { 
  ArrowRight, 
  BarChart3,
  BellRing,
  BookOpen,
  CheckCircle, 
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  FolderArchive,
  HelpCircle,
  Info,
  Instagram,
  LayoutDashboard,
  Linkedin,
  Mail,
  MoveUpRight,
  Orbit,
  Play,
  PlayCircle,
  Quote,
  ScrollText,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Users,
  Youtube,
  Zap
} from "lucide-react";

// Importação direta da imagem de destaque
import ImgHero from "../../public/img-hero.jpg";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Cabeçalho - Design refinado */}
      <header className="w-full py-4 md:py-5 px-4 md:px-6 flex justify-center border-b border-border/30 bg-background/90 backdrop-blur-md sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="container max-w-7xl flex justify-between items-center">
          <div className="flex items-center">
            <Orbit className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            <h2 className="text-lg md:text-xl font-bold ml-2.5 bg-gradient-to-r from-primary to-primary/90 bg-clip-text text-transparent">Trimobe</h2>
          </div>
          <Link href="/auth/login">
            <Button size="sm" className="font-medium bg-primary hover:bg-primary/90 text-xs md:text-sm px-3 md:px-5 py-2 rounded-md transition-all duration-200 shadow-sm hover:shadow">
              {isMobile ? 'Acessar' : 'Acessar Sistema'}
              <ArrowRight className="ml-1.5 md:ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section - Design Moderno e Minimalista */}
      <main className="flex-1 relative z-0">
        <section className="w-full pt-14 md:pt-20 lg:pt-24 pb-16 md:pb-24 relative overflow-hidden">
          {/* Fundo minimalista com gradiente */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.03),transparent_60%)]">
            <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/3 blur-[100px]"></div>
          </div>
          
          <div className="container max-w-7xl px-4 sm:px-6 mx-auto relative">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
              <div className="w-full lg:w-[48%] lg:pr-4">
                {/* Título com maior destaque */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-5 sm:mb-6">
                  <span className="bg-gradient-to-r from-primary to-primary/90 bg-clip-text text-transparent inline-block">Elabore e aprove projetos de crédito rural</span>
                  <span className="mt-1 block">em metade do tempo</span>
                </h1>
                
                {/* Subtítulo com melhor legibilidade */}
                <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-10 max-w-2xl leading-relaxed">
                  Plataforma completa para <strong>profissionais do agronegócio</strong> que elimina a complexidade do Manual de Crédito Rural, automatiza a análise de documentos e aumenta sua taxa de aprovação em bancos.
                </p>
                
                {/* CTA com design refinado */}
                <div className="flex flex-col sm:flex-row gap-5 mb-8 md:mb-10">
                  <Link href="/auth/login?mode=register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto rounded-md px-8 py-5 text-base font-medium bg-primary hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md hover:translate-y-[-1px]">
                      Começar Agora
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
                
                {/* Badge de IA com design mais simples e elegante */}
                <div className="inline-flex items-center bg-primary/5 border border-primary/10 rounded-full px-4 py-2">
                  <Sparkles className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm font-medium text-primary">Inteligência Artificial Especializada em Crédito Rural</span>
                </div>
              </div>
              
              {/* Vídeo de demonstração com design refinado */}
              <div className="w-full lg:w-[52%] mt-8 lg:mt-0">
                <div className="relative rounded-xl overflow-hidden shadow-lg border border-border/40 bg-card">
                  {/* Badge de tempo */}
                  <div className="absolute top-3 right-3 z-20 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full flex items-center backdrop-blur-sm">
                    <Clock className="h-3 w-3 mr-1.5" />
                    1:45 min
                  </div>
                  
                  {/* Thumbnail com efeito de hover */}
                  <div className="aspect-video relative group cursor-pointer">
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-all duration-300 z-10">
                      <div className="bg-primary p-4 md:p-5 rounded-full shadow-lg group-hover:scale-110 group-hover:bg-primary/90 transition-all duration-300">
                        <Play className="h-6 w-6 md:h-7 md:w-7 text-white" fill="currentColor" />
                      </div>
                    </div>
                    
                    {/* Background minimalista */}
                    <div className="w-full h-full bg-gradient-to-br from-background to-background/95 group-hover:scale-[1.01] transition-transform duration-500 flex items-center justify-center">
                      {/* Elementos decorativos sutis */}
                      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,transparent_25%,rgba(139,92,246,0.2)_25%,rgba(139,92,246,0.2)_50%,transparent_50%,transparent_75%,rgba(139,92,246,0.2)_75%,rgba(139,92,246,0.2)_100%)] bg-[length:16px_16px]"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1/2 h-1/2 flex items-center justify-center">  
                          <Orbit className="text-primary/10 h-16 w-16 md:h-24 md:w-24" strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Barra de progresso */}
                  <div className="h-1 w-full bg-gradient-to-r from-background via-primary/20 to-background"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de Desafios - Design Refinado */}
        <section id="dores" className="w-full py-16 md:py-20 bg-background/60 relative">
          {/* Elementos sutis de fundo */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(139,92,246,0.02)_100%)]">
            <div className="absolute right-0 top-0 h-2/3 w-1/3 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.02),transparent_70%)]" />
          </div>
          
          <div className="container max-w-7xl px-4 sm:px-6 mx-auto relative z-10">
            {/* Cabeçalho com design consistente */}
            <div className="text-center mb-12 md:mb-14 max-w-3xl mx-auto">
              <div className="inline-flex items-center bg-primary/5 border border-primary/10 rounded-full px-3 py-1 mb-4">
                <CheckCircle className="h-3.5 w-3.5 text-primary mr-1.5" />
                <span className="text-xs font-medium text-primary">Problemas que resolvemos</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-5 leading-tight">
                Os desafios que impedem seu <span className="text-primary">crescimento profissional</span>
              </h2>
              
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Identificamos e solucionamos os principais obstáculos enfrentados por profissionais do crédito rural
              </p>
            </div>
            
            {/* Grid com cards melhorados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-7">
              {/* Card 1 - Manual de Crédito Rural */}
              <div className="group bg-card hover:bg-card/95 border border-border/60 rounded-lg p-5 transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:translate-y-[-2px]">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/20">
                  <div className="bg-primary/10 rounded-full p-2 group-hover:bg-primary/15 transition-colors">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground">Manual de Crédito Rural complexo</h3>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="p-3.5 bg-background/70 rounded-md border border-border/10">
                    <h4 className="text-xs font-medium mb-1.5 flex items-center text-muted-foreground">
                      <span className="w-1 h-1 bg-red-400 rounded-full mr-1.5"></span>
                      Antes
                    </h4>
                    <p className="text-foreground/90">Horas consultando as 800+ páginas do MCR para encontrar normas aplicáveis.</p>
                  </div>
                  
                  <div className="p-3.5 bg-primary/5 rounded-md border border-primary/10">
                    <h4 className="text-xs font-medium mb-1.5 flex items-center text-primary">
                      <span className="w-1 h-1 bg-primary rounded-full mr-1.5"></span>
                      Com Trimobe
                    </h4>
                    <p className="text-foreground/90">Consulta instantânea ao assistente IA que domina todo o MCR e está sempre atualizado.</p>
                  </div>
                </div>
              </div>

              {/* Card 2 - Elaboração de projetos */}
              <div className="group bg-card hover:bg-card/95 border border-border/60 rounded-lg p-5 transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:translate-y-[-2px]">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/20">
                  <div className="bg-primary/10 rounded-full p-2 group-hover:bg-primary/15 transition-colors">
                    <FolderArchive className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground">Elaboração de projetos demorada</h3>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="p-3.5 bg-background/70 rounded-md border border-border/10">
                    <h4 className="text-xs font-medium mb-1.5 flex items-center text-muted-foreground">
                      <span className="w-1 h-1 bg-amber-400 rounded-full mr-1.5"></span>
                      Antes
                    </h4>
                    <p className="text-foreground/90">3-4 dias para elaborar um projeto completo, com risco de inconsistências nos cálculos.</p>
                  </div>
                  
                  <div className="p-3.5 bg-primary/5 rounded-md border border-primary/10">
                    <h4 className="text-xs font-medium mb-1.5 flex items-center text-primary">
                      <span className="w-1 h-1 bg-primary rounded-full mr-1.5"></span>
                      Com Trimobe
                    </h4>
                    <p className="text-foreground/90">Projetos elaborados em 1-2 dias com modelos pré-aprovados e cálculos validados automaticamente.</p>
                  </div>
                </div>
              </div>

              {/* Card 3 - Prospecção de produtores */}
              <div className="group bg-card hover:bg-card/95 border border-border/60 rounded-lg p-5 transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:translate-y-[-2px]">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/20">
                  <div className="bg-primary/10 rounded-full p-2 group-hover:bg-primary/15 transition-colors">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground">Prospecção de produtores ineficiente</h3>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="p-3.5 bg-background/70 rounded-md border border-border/10">
                    <h4 className="text-xs font-medium mb-1.5 flex items-center text-muted-foreground">
                      <span className="w-1 h-1 bg-blue-400 rounded-full mr-1.5"></span>
                      Antes
                    </h4>
                    <p className="text-foreground/90">Controle manual de contatos e oportunidades, sem visibilidade de conversão.</p>
                  </div>
                  
                  <div className="p-3.5 bg-primary/5 rounded-md border border-primary/10">
                    <h4 className="text-xs font-medium mb-1.5 flex items-center text-primary">
                      <span className="w-1 h-1 bg-primary rounded-full mr-1.5"></span>
                      Com Trimobe
                    </h4>
                    <p className="text-foreground/90">CRM específico para o fluxo de crédito rural, com lembretes automáticos e dashboards.</p>
                  </div>
                </div>
              </div>

              <div className="group bg-card hover:bg-card/95 border border-border/60 rounded-lg p-5 transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:translate-y-[-2px]">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/20">
                  <div className="bg-primary/10 rounded-full p-2 group-hover:bg-primary/15 transition-colors">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground">Dificuldade com documentação</h3>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="p-3.5 bg-background/70 rounded-md border border-border/10">
                    <h4 className="text-xs font-medium mb-1.5 flex items-center text-muted-foreground">
                      <span className="w-1 h-1 bg-green-400 rounded-full mr-1.5"></span>
                      Antes
                    </h4>
                    <p className="text-foreground/90">Horas digitalizando e organizando documentos, com dificuldade para encontrar informações rapidamente.</p>
                  </div>
                  
                  <div className="p-3.5 bg-primary/5 rounded-md border border-primary/10">
                    <h4 className="text-xs font-medium mb-1.5 flex items-center text-primary">
                      <span className="w-1 h-1 bg-primary rounded-full mr-1.5"></span>
                      Com Trimobe
                    </h4>
                    <p className="text-foreground/90">Upload simplificado, extração automática de dados e organização por cliente, propriedade e projeto.</p>
                  </div>
                </div>
              </div>

              <div className="group bg-card hover:bg-card/95 border border-border/60 rounded-lg p-5 transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:translate-y-[-2px]">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/20">
                  <div className="bg-primary/10 rounded-full p-2 group-hover:bg-primary/15 transition-colors">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground">Cálculos de viabilidade complicados</h3>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="p-3.5 bg-background/70 rounded-md border border-border/10">
                    <h4 className="text-xs font-medium mb-1.5 flex items-center text-muted-foreground">
                      <span className="w-1 h-1 bg-purple-400 rounded-full mr-1.5"></span>
                      Antes
                    </h4>
                    <p className="text-foreground/90">Planilhas complexas com risco de erros de fórmula e dificuldade para comparar cenários.</p>
                  </div>
                  
                  <div className="p-3.5 bg-primary/5 rounded-md border border-primary/10">
                    <h4 className="text-xs font-medium mb-1.5 flex items-center text-primary">
                      <span className="w-1 h-1 bg-primary rounded-full mr-1.5"></span>
                      Com Trimobe
                    </h4>
                    <p className="text-foreground/90">Simulações precisas com comparativos entre linhas de crédito e análise de sensibilidade automática.</p>
                  </div>
                </div>
              </div>

              <div className="group bg-card hover:bg-card/95 border border-border/60 rounded-lg p-5 transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:translate-y-[-2px]">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/20">
                  <div className="bg-primary/10 rounded-full p-2 group-hover:bg-primary/15 transition-colors">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground">Falta de acompanhamento após aprovação</h3>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="p-3.5 bg-background/70 rounded-md border border-border/10">
                    <h4 className="text-xs font-medium mb-1.5 flex items-center text-muted-foreground">
                      <span className="w-1 h-1 bg-indigo-400 rounded-full mr-1.5"></span>
                      Antes
                    </h4>
                    <p className="text-foreground/90">Perda de oportunidades de assistência técnica por falta de controle das datas de liberação.</p>
                  </div>
                  
                  <div className="p-3.5 bg-primary/5 rounded-md border border-primary/10">
                    <h4 className="text-xs font-medium mb-1.5 flex items-center text-primary">
                      <span className="w-1 h-1 bg-primary rounded-full mr-1.5"></span>
                      Com Trimobe
                    </h4>
                    <p className="text-foreground/90">Alertas automáticos para visitas técnicas e cronograma integrado de liberações de recursos.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de Depoimentos - Design Refinado */}
        <section id="depoimentos" className="w-full py-16 md:py-20 lg:py-24 bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
          {/* Elementos de design de fundo */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/5 rounded-full blur-3xl"></div>
          
          <div className="container max-w-7xl px-4 sm:px-6 mx-auto relative z-10">
            {/* Cabeçalho refinado */}
            <div className="text-center mb-14 md:mb-16">
              <div className="inline-flex items-center bg-primary/5 border border-primary/10 rounded-full px-3 py-1 mb-4">
                <Star className="h-3.5 w-3.5 text-primary mr-1.5" />
                <span className="text-xs font-medium text-primary">Experiências Reais</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-5 leading-tight">
                O que dizem os <span className="text-primary">profissionais</span> que já usam
              </h2>
              
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Depoimentos de engenheiros agrônomos e técnicos que transformaram sua prática profissional
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
              {/* Depoimento 1 - Design refinado */}
              <div className="group bg-card hover:bg-card/95 rounded-xl border border-border/40 hover:border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] overflow-hidden">
                <div className="p-6 md:p-7 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1 text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                    <div className="bg-primary/5 h-7 w-7 rounded-full flex items-center justify-center">
                      <Quote className="h-3.5 w-3.5 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <p className="text-foreground/80 text-sm leading-relaxed mb-6">
                      "Consegui aumentar minha produtividade em 70%. Estou elaborando mais projetos em menos tempo e com maior taxa de aprovação nos bancos. O assistente IA me ajuda a navegar pelo MCR sem dor de cabeça."
                    </p>
                  </div>
                  
                  <div className="flex items-center pt-3 border-t border-border/20">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-indigo-400/20 flex items-center justify-center text-primary/40 mr-3">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Carlos Oliveira</p>
                      <p className="text-xs text-muted-foreground">Engenheiro Agrônomo - MT</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Depoimento 2 - Design refinado */}
              <div className="group bg-card hover:bg-card/95 rounded-xl border border-border/40 hover:border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] overflow-hidden">
                <div className="p-6 md:p-7 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1 text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                    <div className="bg-primary/5 h-7 w-7 rounded-full flex items-center justify-center">
                      <Quote className="h-3.5 w-3.5 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <p className="text-foreground/80 text-sm leading-relaxed mb-6">
                      "As simulações financeiras automáticas me fizeram economizar horas de trabalho em planilhas. Agora consigo apresentar diferentes cenários para o produtor em minutos, com gráficos e comparativos profissionais."
                    </p>
                  </div>
                  
                  <div className="flex items-center pt-3 border-t border-border/20">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-400/20 flex items-center justify-center text-primary/40 mr-3">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Ana Souza</p>
                      <p className="text-xs text-muted-foreground">Técnica Agrícola - GO</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Depoimento 3 - Design refinado */}
              <div className="group bg-card hover:bg-card/95 rounded-xl border border-border/40 hover:border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] overflow-hidden">
                <div className="p-6 md:p-7 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1 text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                    <div className="bg-primary/5 h-7 w-7 rounded-full flex items-center justify-center">
                      <Quote className="h-3.5 w-3.5 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <p className="text-foreground/80 text-sm leading-relaxed mb-6">
                      "O que mais me impressionou foi a facilidade para gerenciar todos os documentos. As notificações automáticas para visitas técnicas me ajudaram a não perder oportunidades de assistência."
                    </p>
                  </div>
                  
                  <div className="flex items-center pt-3 border-t border-border/20">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-green-400/20 flex items-center justify-center text-primary/40 mr-3">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Marcos Silva</p>
                      <p className="text-xs text-muted-foreground">Eng. Agrônomo - PR</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Planos de Assinatura */}
        <section id="planos" className="w-full py-12 sm:py-16 lg:py-24 relative overflow-hidden z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-400/5 rounded-full blur-3xl"></div>
          
          <div className="container max-w-7xl px-4 mx-auto relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-3 py-1 mx-auto">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  Sem compromisso
                </Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  Teste todas as funcionalidades <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">por 14 dias gratuitamente</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
                  Sem necessidade de cartão de crédito. Upgrade apenas se o sistema realmente ajudar sua produtividade.
                </p>
              </div>
              
              {/* Começar com o trial mais destacado */}
              <div className="bg-gradient-to-r from-primary/10 to-purple-400/10 rounded-xl border border-primary/20 shadow-lg mb-8 sm:mb-10 overflow-hidden">
                <div className="p-5 sm:p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-2 flex items-center">
                        <Clock className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary" />
                        14 dias grátis, acesso total!
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 max-w-2xl">
                        Comece agora mesmo. Explore todas as funcionalidades sem restrições e sem precisar de cartão de crédito. Decida apenas após experimentar.
                      </p>
                      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
                        <Badge variant="outline" className="text-xs py-1 px-2 sm:px-3 bg-background">
                          <CheckCircle className="h-3 w-3 mr-1 text-primary" /> Sem cartão de crédito
                        </Badge>
                        <Badge variant="outline" className="text-xs py-1 px-2 sm:px-3 bg-background">
                          <CheckCircle className="h-3 w-3 mr-1 text-primary" /> Todas as funcionalidades
                        </Badge>
                        <Badge variant="outline" className="text-xs py-1 px-2 sm:px-3 bg-background">
                          <CheckCircle className="h-3 w-3 mr-1 text-primary" /> Dados exportáveis
                        </Badge>
                      </div>
                    </div>
                    <Link href="/auth/login?mode=register" className="shrink-0 w-full md:w-auto">
                      <Button size="lg" className="w-full md:w-auto px-4 sm:px-8 py-2 bg-primary hover:bg-primary/90 transition-colors text-sm sm:text-base">
                        Começar período gratuito
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold mb-2">Após o período de teste, escolha seu plano:</h3>
                <p className="text-sm sm:text-base text-muted-foreground px-2">Você será avisado antes do término do período gratuito para escolher um dos planos abaixo:</p>
              </div>
              
              {/* Cards de Planos lado a lado com melhor visualização de recursos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                {/* Plano CRM */}
                <div className="bg-card rounded-xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 flex flex-col h-full">
                    <h3 className="text-lg sm:text-xl font-bold">Plano Básico: CRM</h3>
                    <div className="flex items-end">
                      <span className="text-2xl sm:text-3xl font-bold">R$ 57</span>
                      <span className="text-muted-foreground ml-2 mb-1 text-sm">/ mês</span>
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm">Organize seu fluxo de trabalho e aumente sua produtividade.</p>
                    
                    <div className="mt-2 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <Users className="h-4 w-4 mr-2 text-primary" />
                          Gestão de Clientes e Propriedades
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 mr-2 shrink-0" />
                            <span className="text-xs">Cadastro completo com documentos e histórico</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 mr-2 shrink-0" />
                            <span className="text-xs">Mapeamento de propriedades com geolocalização</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-primary" />
                          Gestão de Projetos
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 mr-2 shrink-0" />
                            <span className="text-xs">Acompanhamento de status e documentos</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 mr-2 shrink-0" />
                            <span className="text-xs">Simulações financeiras com diferentes taxas</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                          Relatórios e Visibilidade
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 mr-2 shrink-0" />
                            <span className="text-xs">Dashboard com métricas de desempenho</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 mr-2 shrink-0" />
                            <span className="text-xs">Agenda de visitas técnicas</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <Link href="/auth/login?mode=register&plan=basic" className="w-full">
                        <Button variant="outline" size="lg" className="w-full">
                          Testar Gratuitamente
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
                
                {/* Plano CRM + IA */}
                <div className="bg-gradient-to-br from-background to-primary/5 rounded-xl border border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative h-full">
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs font-medium px-2 sm:px-3 py-1 rounded-bl-lg">
                    Recomendado
                  </div>
                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 flex flex-col h-full">
                    <h3 className="text-lg sm:text-xl font-bold">Plano Premium: CRM + IA</h3>
                    <div className="flex items-end">
                      <span className="text-2xl sm:text-3xl font-bold">R$ 87</span>
                      <span className="text-muted-foreground ml-2 mb-1 text-sm">/ mês</span>
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm">Elimine o trabalho manual e potencialize resultados com IA.</p>
                    
                    <div className="mt-2 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <Sparkles className="h-4 w-4 mr-2 text-primary" />
                          Assistente de IA Exclusivo
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 mr-2 shrink-0" />
                            <span className="text-xs">Consultoria em tempo real sobre o MCR</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 mr-2 shrink-0" />
                            <span className="text-xs">Sugestões de linhas de crédito adequadas</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-primary" />
                          Automação de Documentos
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 mr-2 shrink-0" />
                            <span className="text-xs">Extração automática de dados de documentos</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 mr-2 shrink-0" />
                            <span className="text-xs">Geração de projetos com base em modelos</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                          Análise Avançada
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 mr-2 shrink-0" />
                            <span className="text-xs">Análise preditiva de aprovação de projetos</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 mr-2 shrink-0" />
                            <span className="text-xs">Recomendações personalizadas por cliente</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <Link href="/auth/login?mode=register&plan=premium" className="w-full">
                        <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
                          Testar Gratuitamente
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border/50 text-sm">
                <p className="flex items-start">
                  <Info className="h-4 w-4 mr-2 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Ambos os planos incluem hospedagem segura, backup diário, suporte técnico por e-mail e atualizações regulares. Sem taxas de configuração ou custos ocultos.</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé simplificado */}
      <footer id="contato" className="w-full py-6 sm:py-8 bg-card border-t">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-muted-foreground text-sm">
            <div>
              &copy; {new Date().getFullYear()} Trimobe. contato@trimobe.com
            </div>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link href="#" className="hover:text-primary transition-colors">
                Termos
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Privacidade
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
