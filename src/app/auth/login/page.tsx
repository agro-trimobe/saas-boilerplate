"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, AlertCircle, Orbit } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

// Componente de carregamento para o Suspense
function LoginPageLoading() {
  return (
    <div className="container px-4 sm:px-6 flex min-h-screen w-full flex-col items-center justify-center py-8 bg-background">
      <Card className="w-full max-w-[400px] shadow-lg border-border/50">
        <CardHeader className="space-y-1 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-xl sm:text-2xl text-center">Carregando...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center px-4 sm:px-6 py-12 sm:py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Componente principal de login
 * Gerenciamento de estado simplificado usando um único objeto de estado
 */
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Consolidar múltiplos estados relacionados em um único objeto de estado
  const [authState, setAuthState] = useState({
    isLogin: searchParams.get("mode") !== "register",
    showPassword: false,
    isLoading: false,
    isForgotPassword: false,
    errorMessage: searchParams.get("error") || null
  });
  
  // Função helper para atualizar apenas parte do estado
  const updateAuthState = (updates: Partial<typeof authState>) => {
    setAuthState(prevState => ({ ...prevState, ...updates }));
  };

  // Esquema de validação com Zod
  const formSchema = z.object({
    name: authState.isLogin ? z.string().optional() : z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    password: authState.isForgotPassword ? z.string().optional() : z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: authState.isLogin || authState.isForgotPassword
      ? z.string().optional() 
      : z.string().min(1, "Confirmação de senha é obrigatória"),
  }).refine(data => {
    if (!authState.isLogin && !authState.isForgotPassword && data.password !== data.confirmPassword) {
      return false;
    }
    return true;
  }, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Mapeamento de erros para mensagens amigáveis
  const errorMessages: Record<string, string> = {
    "CredentialsSignin": "Email ou senha incorretos",
    "UserNotConfirmedException": "Email não confirmado. Por favor, verifique seu email e confirme seu cadastro.",
    "NotAuthorizedException": "Email ou senha incorretos",
    "UserNotFoundException": "Usuário não encontrado",
    "TooManyRequestsException": "Muitas tentativas. Tente novamente mais tarde.",
    "default": "Ocorreu um erro na autenticação. Tente novamente."
  };

  // Função para traduzir códigos de erro em mensagens amigáveis
  const getErrorMessage = (errorCode: string): string => {
    return errorMessages[errorCode] || errorMessages.default;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    updateAuthState({ isLoading: true, errorMessage: null });
    
    try {
      if (authState.isForgotPassword) {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values.email,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast({
            title: "Email enviado",
            description: "Verifique seu email para redefinir sua senha",
          });
          router.push(`/auth/reset-password?email=${encodeURIComponent(values.email)}`);
        } else {
          updateAuthState({ errorMessage: data.message || "Erro ao solicitar redefinição de senha" });
          toast({
            title: "Erro",
            description: data.message || "Erro ao solicitar redefinição de senha",
            variant: "destructive",
          });
        }
      } else if (authState.isLogin) {
        const result = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
          callbackUrl: "/dashboard"
        });

        if (result?.error) {
          console.error("Erro na autenticação:", result.error);
          const friendlyErrorMessage = getErrorMessage(result.error);
          updateAuthState({ errorMessage: friendlyErrorMessage });
          
          toast({
            title: "Erro na autenticação",
            description: friendlyErrorMessage,
            variant: "destructive",
          });
          
          // Se o erro for de email não confirmado, redirecionar para a página de confirmação
          if (result.error === "UserNotConfirmedException") {
            router.push(`/auth/confirm?email=${encodeURIComponent(values.email)}`);
          }
        } else if (result?.ok) {
          toast({
            title: "Login bem-sucedido",
            description: "Redirecionando para o dashboard...",
          });
          
          // Limpar qualquer erro anterior
          updateAuthState({ errorMessage: null });
          // Forçar redirecionamento com replace para evitar problemas de histórico
          window.location.href = "/dashboard";
        }
      } else {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            password: values.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast({
            title: "Cadastro realizado",
            description: data.message || "Por favor, verifique seu email e insira o código de confirmação",
          });
          
          if (data.requiresConfirmation) {
            const confirmUrl = `/auth/confirm?email=${encodeURIComponent(values.email)}`;
            
            // Usando replace em vez de push para garantir que o histórico seja limpo
            router.replace(confirmUrl);
          }
        } else {
          const errorMsg = data.error || "Erro ao criar conta";
          updateAuthState({ errorMessage: errorMsg });
          
          toast({
            title: "Erro no cadastro",
            description: errorMsg,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      updateAuthState({ errorMessage: "Ocorreu um erro inesperado. Tente novamente mais tarde." });
      
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      updateAuthState({ isLoading: false });
    }
  };

  const passwordReset = async (email: string) => {
    updateAuthState({ isLoading: true, errorMessage: null });
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ocorreu um erro ao processar sua solicitação');
      }

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });

      // Voltar para o formulário de login após enviar o email
      updateAuthState({ isForgotPassword: false });
    } catch (error) {
      updateAuthState({ 
        errorMessage: error instanceof Error ? error.message : 'Erro ao solicitar redefinição de senha'
      });
    } finally {
      updateAuthState({ isLoading: false });
    }
  }

  return (
    <div className="container px-4 sm:px-6 flex min-h-screen w-full flex-col items-center justify-center py-8 bg-background">
      <div className="mx-auto w-full max-w-[400px]">
        <Card className="w-full shadow-lg border-border/50 mb-4 sm:mb-0">
          <CardHeader className="space-y-1 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xl sm:text-2xl text-center">
              {authState.isForgotPassword ? "Recuperar Senha" : authState.isLogin ? "Login" : "Criar Conta"}
            </CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              {authState.isForgotPassword
                ? "Digite seu email para receber as instruções de recuperação de senha"
                : authState.isLogin
                ? "Entre com seu email e senha"
                : "Preencha os dados para criar sua conta"}
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CardContent className="space-y-5 px-4 sm:px-6 py-4 sm:py-5">
                {authState.errorMessage && (
                  <Alert variant="destructive" className="mb-3 text-sm sm:text-base">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{authState.errorMessage}</AlertDescription>
                  </Alert>
                )}
                
                {!authState.isLogin && !authState.isForgotPassword && (
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Nome</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite seu nome"
                            className="h-10 sm:h-11 text-sm sm:text-base py-6 px-3"
                            {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Digite seu email"
                          className="h-10 sm:h-11 text-sm sm:text-base py-6 px-3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!authState.isForgotPassword && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={authState.showPassword ? "text" : "password"}
                              placeholder="Digite sua senha"
                              className="h-10 sm:h-11 text-sm sm:text-base py-6 px-3"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent touch-manipulation"
                              onClick={() => updateAuthState({ showPassword: !authState.showPassword })}
                            >
                              {authState.showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {!authState.isLogin && !authState.isForgotPassword && (
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Confirmar Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirme sua senha"
                            className="h-10 sm:h-11 text-sm sm:text-base py-6 px-3"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>

              <CardFooter className="flex flex-col px-4 sm:px-6 pb-5 sm:pb-6 pt-2">
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 py-2.5 sm:py-3 text-sm sm:text-base rounded-md"
                  disabled={authState.isLoading}
                >
                  {authState.isLoading ? "Carregando..." : authState.isForgotPassword ? "Enviar Email" : authState.isLogin ? "Entrar" : "Cadastrar"}
                </Button>

                <div className="mt-4 sm:mt-5 text-center space-y-2 sm:space-y-3">
                  {authState.isLogin && !authState.isForgotPassword && (
                    <Button
                      type="button"
                      variant="link"
                      className="text-xs sm:text-sm py-2 h-auto touch-manipulation"
                      onClick={() => {
                        updateAuthState({
                          isForgotPassword: true,
                          errorMessage: null
                        });
                        form.reset({ email: form.getValues("email") });
                      }}
                    >
                      Esqueci minha senha
                    </Button>
                  )}

                  {authState.isForgotPassword && (
                    <Button
                      type="button"
                      variant="link"
                      className="text-xs sm:text-sm py-2 h-auto touch-manipulation"
                      onClick={() => {
                        updateAuthState({
                          isForgotPassword: false,
                          errorMessage: null
                        });
                        form.reset({ email: form.getValues("email") });
                      }}
                    >
                      Voltar ao login
                    </Button>
                  )}

                  {!authState.isForgotPassword && (
                    <Button
                      type="button"
                      variant="link"
                      className="text-xs sm:text-sm py-2 h-auto touch-manipulation"
                      onClick={() => {
                        updateAuthState({
                          isLogin: !authState.isLogin,
                          errorMessage: null
                        });
                        form.reset();
                      }}
                    >
                      {authState.isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Entre"}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}

// Componente principal que envolve o conteúdo em um Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageLoading />}>
      <LoginPageContent />
    </Suspense>
  );
}
