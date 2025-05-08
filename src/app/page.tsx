'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  CheckCircle, 
  ChevronRight,
  LayoutDashboard,
  Orbit,
  Sparkles,
  Users,
  CreditCard,
  Shield,
  HelpCircle
} from "lucide-react";

/**
 * Página inicial do SaaS Boilerplate
 * 
 * Em vez de usar estados para detectar se é mobile, usamos classes responsivas do Tailwind
 * para adaptar o layout conforme o tamanho da tela, simplificando o gerenciamento de estado
 */
export default function Home() {

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Cabeçalho com navegação */}
      <header className="w-full py-4 md:py-5 px-4 md:px-6 flex justify-center border-b border-border/30 bg-background/90 backdrop-blur-md sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="container max-w-7xl flex justify-between items-center">
          <div className="flex items-center">
            <Orbit className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            <h2 className="text-lg md:text-xl font-bold ml-2.5 bg-gradient-to-r from-primary to-primary/90 bg-clip-text text-transparent">SaaS Boilerplate</h2>
          </div>
          
          {/* Links de navegação */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#recursos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </Link>
            <Link href="#planos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Planos
            </Link>
            <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
          </nav>
          
          <Link href="/auth/login">
            <Button size="sm" className="font-medium bg-primary hover:bg-primary/90 text-xs md:text-sm px-3 md:px-5 py-2 rounded-md transition-all duration-200 shadow-sm hover:shadow">
              <span className="block md:hidden">Acessar</span>
              <span className="hidden md:block">Acessar Sistema</span>
              <ArrowRight className="ml-1.5 md:ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-0">
        <section className="w-full pt-14 md:pt-20 lg:pt-24 pb-16 md:pb-24 relative overflow-hidden">
          {/* Fundo com gradiente */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.03),transparent_60%)]">
            <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/3 blur-[100px]"></div>
          </div>
          
          <div className="container max-w-7xl px-4 sm:px-6 mx-auto relative">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
              <div className="w-full lg:w-[55%] lg:pr-4">
                {/* Título */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-5 sm:mb-6">
                  <span className="bg-gradient-to-r from-primary to-primary/90 bg-clip-text text-transparent inline-block">Estrutura completa para seu SaaS</span>
                  <span className="mt-1 block">com tudo que você precisa</span>
                </h1>
                
                {/* Subtítulo */}
                <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-10 max-w-2xl leading-relaxed">
                  Plataforma com <strong>autenticação, assinaturas e multi-tenant</strong> pronta para você personalizar e construir seu próximo produto SaaS rapidamente.
                </p>
                
                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-5 mb-8 md:mb-10">
                  <Link href="/auth/login?mode=register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto rounded-md px-8 py-5 text-base font-medium bg-primary hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md hover:translate-y-[-1px]">
                      Começar Agora
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
                
                {/* Badge */}
                <div className="inline-flex items-center bg-primary/5 border border-primary/10 rounded-full px-4 py-2">
                  <Sparkles className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm font-medium text-primary">Next.js + Typescript + Tailwind</span>
                </div>
              </div>
              
              {/* Cards Features */}
              <div className="w-full lg:w-[45%] mt-8 lg:mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20">
                    <CardContent className="p-6 flex flex-col">
                      <Users className="h-8 w-8 text-primary mb-4" />
                      <CardTitle className="mb-2 text-lg">Autenticação</CardTitle>
                      <CardDescription>Sistema completo de login, cadastro e recuperação de senha.</CardDescription>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20">
                    <CardContent className="p-6 flex flex-col">
                      <CreditCard className="h-8 w-8 text-primary mb-4" />
                      <CardTitle className="mb-2 text-lg">Assinaturas</CardTitle>
                      <CardDescription>Integração com gateway de pagamento para assinaturas recorrentes.</CardDescription>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20">
                    <CardContent className="p-6 flex flex-col">
                      <LayoutDashboard className="h-8 w-8 text-primary mb-4" />
                      <CardTitle className="mb-2 text-lg">Dashboard</CardTitle>
                      <CardDescription>Painel administrativo com estatísticas e gerenciamento.</CardDescription>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20">
                    <CardContent className="p-6 flex flex-col">
                      <Shield className="h-8 w-8 text-primary mb-4" />
                      <CardTitle className="mb-2 text-lg">Multi-tenant</CardTitle>
                      <CardDescription>Arquitetura multi-tenant segura para vários clientes.</CardDescription>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recursos - Features Section */}
        <section id="recursos" className="w-full py-16 md:py-20 bg-background/60 relative">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(139,92,246,0.02)_100%)]">
            <div className="absolute right-0 top-0 h-2/3 w-1/3 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.02),transparent_70%)]" />
          </div>
          
          <div className="container max-w-7xl px-4 sm:px-6 mx-auto relative z-10">
            <div className="text-center mb-12 md:mb-14 max-w-3xl mx-auto">
              <div className="inline-flex items-center bg-primary/5 border border-primary/10 rounded-full px-3 py-1 mb-4">
                <CheckCircle className="h-3.5 w-3.5 text-primary mr-1.5" />
                <span className="text-xs font-medium text-primary">Recursos Principais</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-5 leading-tight">
                Tudo que você precisa para <span className="text-primary">lançar seu SaaS</span>
              </h2>
              
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Economize tempo e dinheiro com nosso boilerplate completo para aplicações SaaS
              </p>
            </div>
            
            {/* Lista de recursos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  title: "Autenticação Completa",
                  description: "Sistema de login, cadastro e recuperação de senha integrado com Next.js Auth"
                },
                {
                  title: "Integração de Pagamentos",
                  description: "Processamento de assinaturas e pagamentos recorrentes com Asaas"
                },
                {
                  title: "Dashboard Administrativo",
                  description: "Painel de controle para gerenciar usuários, assinaturas e configurações"
                },
                {
                  title: "Multi-tenant Seguro",
                  description: "Isolamento de dados entre organizações com controle de acesso"
                },
                {
                  title: "Design Responsivo",
                  description: "Interface moderna com Tailwind CSS e componentes do Shadcn/UI"
                },
                {
                  title: "Armazenamento AWS",
                  description: "Integração pronta com AWS S3 para upload e gerenciamento de arquivos"
                }
              ].map((feature, index) => (
                <Card key={index} className="bg-card border border-border/60 hover:border-primary/20 transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 rounded-full p-2.5 mt-1">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-medium mb-2">{feature.title}</CardTitle>
                        <CardDescription className="text-sm">{feature.description}</CardDescription>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Seção de Planos e Preços */}
        <section id="planos" className="w-full py-16 md:py-24 bg-background/90 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.03),transparent_70%)]">
            <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
          </div>
          
          <div className="container max-w-7xl px-4 sm:px-6 mx-auto relative z-10">
            <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
              <div className="inline-flex items-center bg-primary/5 border border-primary/10 rounded-full px-3 py-1 mb-4">
                <CreditCard className="h-3.5 w-3.5 text-primary mr-1.5" />
                <span className="text-xs font-medium text-primary">Planos Flexíveis</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-5 leading-tight">
                Escolha o plano ideal para o <span className="text-primary">seu negócio</span>
              </h2>
              
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Oferecemos opções para empresas de todos os tamanhos, desde startups até grandes corporações
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 max-w-5xl mx-auto">
              {/* Plano Inicial */}
              <Card className="bg-card border-border hover:border-primary/20 transition-all duration-200 hover:shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">Inicial</h3>
                    <p className="text-sm text-muted-foreground mb-4">Perfeito para começar seu negócio.</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">R$ 49</span>
                      <span className="text-muted-foreground text-sm">/mês</span>
                    </div>
                    
                    <Link href="/auth/register?plan=starter">
                      <Button variant="outline" className="w-full">Começar Grátis</Button>
                    </Link>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Inclui:</p>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">Até 2 usuários</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">2GB de armazenamento</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">Recursos básicos</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">Suporte por email</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Plano Profissional */}
              <Card className="bg-gradient-to-br from-background to-primary/5 border-primary/30 relative transform md:scale-105 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                  Popular
                </div>
                <CardContent className="p-6 md:p-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">Profissional</h3>
                    <p className="text-sm text-muted-foreground mb-4">Ideal para equipes em crescimento.</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">R$ 99</span>
                      <span className="text-muted-foreground text-sm">/mês</span>
                    </div>
                    
                    <Link href="/auth/register?plan=professional">
                      <Button className="w-full bg-primary hover:bg-primary/90">Experimentar 14 dias</Button>
                    </Link>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Tudo do plano Inicial, mais:</p>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">Até 10 usuários</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">10GB de armazenamento</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">Recursos avançados</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">Suporte prioritário</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Plano Empresarial */}
              <Card className="bg-card border-border hover:border-primary/20 transition-all duration-200 hover:shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">Empresarial</h3>
                    <p className="text-sm text-muted-foreground mb-4">Para empresas de médio e grande porte.</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">R$ 249</span>
                      <span className="text-muted-foreground text-sm">/mês</span>
                    </div>
                    
                    <Link href="/auth/register?plan=enterprise">
                      <Button variant="outline" className="w-full">Começar Grátis</Button>
                    </Link>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Tudo do plano Profissional, mais:</p>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">Usuários ilimitados</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">50GB de armazenamento</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">API dedicada</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">Gerente de conta</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Seção de FAQ */}
        <section id="faq" className="w-full py-16 md:py-20 bg-background relative">
          <div className="container max-w-7xl px-4 sm:px-6 mx-auto">
            <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
              <div className="inline-flex items-center bg-primary/5 border border-primary/10 rounded-full px-3 py-1 mb-4">
                <HelpCircle className="h-3.5 w-3.5 text-primary mr-1.5" />
                <span className="text-xs font-medium text-primary">Perguntas Frequentes</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-5 leading-tight">
                Respondemos às suas <span className="text-primary">dúvidas</span>
              </h2>
              
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Aqui estão algumas perguntas frequentes sobre nossa plataforma
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  question: "Como funciona o período de teste gratuito?",
                  answer: "Oferecemos um período de teste gratuito de 14 dias em todos os planos, sem necessidade de cartão de crédito. Você pode experimentar todos os recursos da plataforma e decidir se deseja continuar usando nosso serviço."
                },
                {
                  question: "Posso mudar de plano a qualquer momento?",
                  answer: "Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As alterações entram em vigor imediatamente, e o valor será ajustado proporcionalmente ao tempo restante da assinatura atual."
                },
                {
                  question: "Como funciona o sistema multi-tenant?",
                  answer: "Nossa plataforma utiliza um sistema multi-tenant seguro que isola completamente os dados de cada cliente. Isso garante segurança, privacidade e a capacidade de personalizar a experiência para cada organização separadamente."
                },
                {
                  question: "Quais métodos de pagamento são aceitos?",
                  answer: "Aceitamos pagamentos via cartão de crédito, boleto bancário e PIX através da integração com o gateway de pagamento Asaas, garantindo transações seguras e confiáveis."
                },
                {
                  question: "Como funciona o suporte técnico?",
                  answer: "Oferecemos suporte por email para todos os planos. Os planos Profissional e Empresarial têm acesso a suporte prioritário, e o plano Empresarial inclui um gerente de conta dedicado para ajudar com implementação e otimização."
                },
                {
                  question: "É possível personalizar a plataforma para minha empresa?",
                  answer: "Sim, nossa plataforma foi projetada para ser altamente personalizável. O código-fonte está bem organizado e documentado, permitindo adaptações específicas para seu negócio com facilidade."
                }
              ].map((faq, index) => (
                <Card key={index} className="bg-card border-border hover:border-primary/20 transition-all duration-200">
                  <CardContent className="p-6">
                    <h3 className="text-base font-medium mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Rodapé simplificado */}
        <footer className="w-full py-10 md:py-12 border-t border-border/30 bg-background">
          <div className="container max-w-7xl px-4 sm:px-6 mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-6 md:mb-0">
                <Orbit className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium ml-2">SaaS Boilerplate</span>
              </div>
              
              <div className="flex gap-6 mb-6 md:mb-0">
                <Link href="#recursos" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Recursos
                </Link>
                <Link href="#planos" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Planos
                </Link>
                <Link href="#faq" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </div>
              
              <div className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} SaaS Boilerplate. Todos os direitos reservados.
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
