'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionPlan } from '@/lib/types/subscription';
import { formatCurrency } from '@/lib/formatters';
// Valores padrão para demonstração
const SUBSCRIPTION_BASIC_VALUE = 49.90;
const SUBSCRIPTION_PREMIUM_VALUE = 99.90;
import { useSubscription } from '@/hooks/use-subscription';

interface UpgradeSuccessMessageProps {
  plan: SubscriptionPlan;
  onContinue?: () => void;
}

function UpgradeSuccessMessage({ plan, onContinue }: UpgradeSuccessMessageProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [redirecting, setRedirecting] = useState(false);
  // Obter a função de atualização da assinatura
  const { refreshSubscription } = useSubscription();
  
  const planValue = plan === 'BASIC' 
    ? SUBSCRIPTION_BASIC_VALUE 
    : SUBSCRIPTION_PREMIUM_VALUE;
  
  // Função de redirecionamento
  const redirectToDashboard = () => {
    // Evitar chamadas durante a renderização definindo um flag
    setRedirecting(true);
    
    // Usar setTimeout para garantir que a execução ocorra após a renderização
    setTimeout(() => {
      if (onContinue) {
        onContinue();
      } else {
        router.push('/dashboard');
      }
    }, 10);
  };
  
  // Atualizar dados da assinatura imediatamente ao entrar na tela de sucesso
  useEffect(() => {
    // Usar setTimeout para garantir que a atualização não ocorra durante a renderização
    const timeoutId = setTimeout(() => {
      try {
        // Atualizar localmente os dados da assinatura
        refreshSubscription();
        console.log('[Assinatura] Dados de assinatura atualizados após concluir assinatura');
      } catch (err) {
        // Apenas registrar erros silenciosamente para não afetar a experiência do usuário
        console.warn('[Assinatura] Erro ao atualizar dados da assinatura:', err);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [refreshSubscription]); // Manter a dependência
  
  // Efeito para redirecionamento automático com contagem regressiva
  // Usar uma bandeira para garantir que a contagem só inicie uma vez
  const [countdownStarted, setCountdownStarted] = useState(false);

  // Efeito para iniciar a contagem apenas quando renderizado corretamente
  useEffect(() => {
    // Pequeno atraso para garantir que este é uma montagem real, não um render parcial
    const startupDelay = setTimeout(() => {
      setCountdownStarted(true);
    }, 1000);
    
    return () => clearTimeout(startupDelay);
  }, []);
  
  // Contagem regressiva real - executada apenas quando countdownStarted for true
  useEffect(() => {
    // Não iniciar a contagem até que o sinalizador seja ativado
    if (!countdownStarted || redirecting) return;
    
    console.log('[Assinatura] Iniciando contagem regressiva para redirecionamento');
    
    let timeoutId: NodeJS.Timeout | null = null;
    
    // Configurar intervalo para contagem regressiva
    const interval = setInterval(() => {
      setCountdown((prev) => {
        // Quando atingir 1, preparar para redirecionar no próximo ciclo
        if (prev <= 1) {
          clearInterval(interval);
          setRedirecting(true);
          
          // Usar setTimeout para evitar atualizações durante a renderização
          timeoutId = setTimeout(() => {
            if (onContinue) {
              onContinue();
            } else {
              router.push('/dashboard');
            }
          }, 500); // Aumentado para 500ms para maior segurança
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Limpar intervalo e timeout ao desmontar componente
    return () => {
      clearInterval(interval);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [countdownStarted, redirecting, onContinue, router]); // Dependências corretas
  
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="mx-auto max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Assinatura Concluída com Sucesso!</CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <p className="mb-4">
            Sua assinatura do <strong>Plano {plan === 'BASIC' ? 'Básico' : 'Premium'}</strong> foi processada com sucesso.
            Você será cobrado <strong>{formatCurrency(planValue)}</strong> mensalmente.
          </p>
          <p className="text-muted-foreground">
            Você será redirecionado automaticamente para o Dashboard em {countdown} segundos...
          </p>
        </CardContent>
        <CardFooter className="justify-center pb-6">
          <Button onClick={redirectToDashboard} className="w-full">
            Continuar para o Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Exportações
export { UpgradeSuccessMessage };
export default UpgradeSuccessMessage;
