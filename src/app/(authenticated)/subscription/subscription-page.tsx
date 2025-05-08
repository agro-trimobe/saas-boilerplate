'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon } from 'lucide-react';
import { ASAAS_SUBSCRIPTION_BASIC_VALUE, ASAAS_SUBSCRIPTION_PREMIUM_VALUE } from '@/lib/asaas-config';

import { 
  PlanCard, 
  SubscriptionHeader, 
  SubscriptionFooter, 
  SubscriptionLayout,
  BreadcrumbNav,
  PlanSummary,
  SimplifiedPaymentForm,
  planFeatures,
  planInfo,
  TransitionWrapper,
  UpgradeSuccessMessage
} from '@/components/subscription';

import { SubscriptionPlan } from '@/lib/types/subscription';

interface SubscriptionPageProps {
  userData?: { name: string; email: string } | null;
}

export function SubscriptionPage({ userData }: SubscriptionPageProps) {
  const router = useRouter();
  const [step, setStep] = useState<'select-plan' | 'payment' | 'success'>('select-plan');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentComplete, setPaymentComplete] = useState<boolean>(false);
  
  // Função para avançar para o passo de pagamento
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    // Reiniciar o estado de pagamento completo ao selecionar um plano
    setPaymentComplete(false);
    setSelectedPlan(plan);
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Função para voltar para o passo de seleção de plano
  const handleBackToPlans = () => {
    // Reiniciar o estado de pagamento ao voltar
    setPaymentComplete(false);
    setStep('select-plan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Função para lidar com a conclusão do pagamento
  const handlePaymentComplete = (success: boolean) => {
    if (success) {
      // Marcar que o pagamento foi realmente concluído com sucesso
      setPaymentComplete(true);
      setStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Registrar no console para debug
      console.log('[Assinatura] Pagamento concluído com sucesso, exibindo tela de sucesso');
    }
  };
  
  // Função para redirecionar após o sucesso
  const handleRedirectToDashboard = () => {
    // Só permite redirecionamento se o pagamento foi concluído
    if (paymentComplete) {
      console.log('[Assinatura] Redirecionando para dashboard após pagamento');
      router.push('/dashboard');
    } else {
      console.warn('[Assinatura] Tentativa de redirecionamento bloqueada - pagamento não concluído');
    }
  };
  
  return (
    <SubscriptionLayout>
      {/* 1. Selecionar Plano */}
      <TransitionWrapper isVisible={step === 'select-plan'}>
        <BreadcrumbNav showBackButton={false} planSelected={false} />
        <SubscriptionHeader step="select-plan" />
        
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* Plano Básico */}
          <PlanCard
            title={planInfo.BASIC.title}
            description={planInfo.BASIC.description}
            price={ASAAS_SUBSCRIPTION_BASIC_VALUE}
            features={planFeatures.BASIC}
            plan="BASIC"
            onSelect={handleSelectPlan}
            recommended={false}
          />
          
          {/* Plano Premium */}
          <PlanCard
            title={planInfo.PREMIUM.title}
            description={planInfo.PREMIUM.description}
            price={ASAAS_SUBSCRIPTION_PREMIUM_VALUE}
            features={planFeatures.PREMIUM}
            plan="PREMIUM"
            onSelect={handleSelectPlan}
            recommended={true}
          />
        </div>
        
        <SubscriptionFooter />
      </TransitionWrapper>
      
      {/* 2. Pagamento */}
      <TransitionWrapper isVisible={step === 'payment' && !!selectedPlan}>
        {selectedPlan && (
          <>
            <BreadcrumbNav showBackButton={true} planSelected={true} onBackClick={handleBackToPlans} />
            <SubscriptionHeader step="payment" />
            
            <PlanSummary plan={selectedPlan} />
            
            <SimplifiedPaymentForm 
              plan={selectedPlan}
              userData={userData}
              onComplete={handlePaymentComplete}
            />
            
            <SubscriptionFooter />
          </>
        )}
      </TransitionWrapper>
      
      {/* 3. Sucesso - Exibido apenas quando o pagamento foi realmente concluído */}
      <TransitionWrapper isVisible={step === 'success' && !!selectedPlan && paymentComplete}>
        {selectedPlan && paymentComplete && (
          <UpgradeSuccessMessage 
            plan={selectedPlan} 
            onContinue={handleRedirectToDashboard}
          />
        )}
      </TransitionWrapper>
    </SubscriptionLayout>
  );
}
