"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
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
import { Suspense } from "react";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
});

function ForgotPasswordForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
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
          description: data.message || "Verifique seu email para redefinir sua senha",
        });
        
        // Redirecionar para a página de login com uma mensagem de sucesso
        router.push(`/auth/reset-password?email=${encodeURIComponent(values.email)}`);
      } else {
        toast({
          title: "Erro",
          description: data.message || "Não foi possível processar sua solicitação",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container px-4 sm:px-6 flex min-h-screen w-full flex-col items-center justify-center py-8 bg-background">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-1 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-xl sm:text-2xl text-center">Recuperar Senha</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Digite seu email para receber as instruções de recuperação de senha
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 py-3 sm:py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Digite seu email" 
                        className="text-base sm:text-base py-5 px-3" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 py-2 sm:py-2.5 text-sm sm:text-base mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar Instruções"}
              </Button>
              
              <div className="flex justify-center mt-4">
                <Link 
                  href="/auth/login" 
                  className="text-sm text-primary hover:underline"
                >
                  Voltar para login
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de carregamento para o Suspense
function ForgotPasswordLoading() {
  return (
    <div className="container px-4 sm:px-6 flex min-h-screen w-full flex-col items-center justify-center py-8 bg-background">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-1 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-xl sm:text-2xl text-center">Carregando...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center px-4 sm:px-6 py-6 sm:py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordLoading />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
