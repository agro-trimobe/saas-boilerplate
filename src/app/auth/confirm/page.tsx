"use client";

import { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function ConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const email = searchParams.get("email");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast({
        title: "Erro",
        description: "Email não fornecido. Por favor, faça o registro novamente.",
        variant: "destructive",
      });
      router.replace('/auth/login');
      return;
    }
  }, [email, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Email confirmado!",
          description: "Por favor, faça login para continuar.",
          duration: 5000,
        });
        router.replace("/auth/login");
      } else {
        setError(data.error || "Erro ao confirmar código");
        toast({
          title: "Erro",
          description: data.error || "Erro ao confirmar código",
          variant: "destructive",
        });
      }
    } catch (error) {
      setError("Erro ao confirmar código");
      toast({
        title: "Erro",
        description: "Erro ao confirmar código",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Se não houver email, não renderiza o conteúdo
  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 py-8">
      <Card className="w-full max-w-[400px] shadow-lg border-border/50">
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-xl sm:text-2xl text-center">Confirmar Email</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Digite o código de confirmação enviado para <span className="break-all">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 py-3 sm:py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="code"
                placeholder="Digite o código de confirmação"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isLoading}
                className="text-base sm:text-base py-5 px-3"
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 py-2 sm:py-2.5 text-sm sm:text-base mt-2" 
              disabled={isLoading}
            >
              {isLoading ? "Confirmando..." : "Confirmar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de carregamento para o Suspense
function ConfirmPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 py-8">
      <Card className="w-full max-w-[400px] shadow-lg border-border/50">
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-xl sm:text-2xl text-center">Carregando...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center px-4 sm:px-6 py-6 sm:py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<ConfirmPageLoading />}>
      <ConfirmForm />
    </Suspense>
  );
}