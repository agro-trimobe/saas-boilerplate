'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionPlan } from '@/lib/types/subscription';
import { formatarMoeda } from '@/lib/formatters';
import { ASAAS_SUBSCRIPTION_BASIC_VALUE, ASAAS_SUBSCRIPTION_PREMIUM_VALUE } from '@/lib/asaas-config';
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
    ? ASAAS_SUBSCRIPTION_BASIC_VALUE 
    : ASAAS_SUBSCRIPTION_PREMIUM_VALUE;
  
  // Função de redirecionamento
  const redirectToDashboard = () => {
    if (onContinue) {
      onContinue();
    } else {
      router.push('/dashboard');
    }
  };
  
  // Atualizar dados da assinatura imediatamente ao entrar na tela de sucesso
  useEffect(() => {
    // Atualizar localmente
    refreshSubscription();
    
    // Disparar evento global para atualizar assinatura em todos os componentes
    const refreshEvent = new CustomEvent('subscription:refresh', {
      detail: { source: 'UpgradeSuccessMessage' }
    });
    window.dispatchEvent(refreshEvent);
    
    console.log('[Assinatura] Evento de atualização disparado após concluir assinatura');
  }, [refreshSubscription]);
  
  // Efeito para redirecionamento automático com contagem regressiva
  useEffect(() => {
    // Se já estiver redirecionando, não fazer nada
    if (redirecting) return;
    
    // Configurar intervalo para contagem regressiva
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRedirecting(true);
          redirectToDashboard();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Limpar intervalo ao desmontar componente
    return () => clearInterval(interval);
  }, [redirecting, redirectToDashboard]);  // Executar apenas uma vez na montagem do componente
  
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
            Você será cobrado <strong>{formatarMoeda(planValue)}</strong> mensalmente.
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
