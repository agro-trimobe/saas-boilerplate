'use client';

interface SubscriptionHeaderProps {
  trialEnded?: boolean;
  step?: 'select-plan' | 'payment';
}

export function SubscriptionHeader({ trialEnded = true, step = 'select-plan' }: SubscriptionHeaderProps) {
  return (
    <div className="mb-4 text-center space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">
        {step === 'select-plan' ? 'Escolha seu Plano' : 'Finalize sua Assinatura'}
      </h1>
      
      {step === 'select-plan' ? (
        trialEnded ? (
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl mx-auto">
            Seu período de avaliação gratuito terminou. Escolha um dos planos abaixo para continuar utilizando o sistema.
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl mx-auto">
            Assine um plano para ter acesso a todas as funcionalidades do sistema.
          </p>
        )
      ) : (
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl mx-auto">
          Complete seus dados de pagamento para finalizar sua assinatura.
        </p>
      )}
    </div>
  );
}
