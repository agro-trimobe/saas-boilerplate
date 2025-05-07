'use client';

import Link from 'next/link';

export function SubscriptionFooter() {
  return (
    <div className="text-center text-xs text-muted-foreground space-y-1">
      <p>
        Ao assinar, você concorda com nossos{' '}
        <Link href="#" className="text-primary hover:underline">
          Termos de Serviço
        </Link>{' '}
        e{' '}
        <Link href="#" className="text-primary hover:underline">
          Política de Privacidade
        </Link>.
      </p>
      <p>
        Você pode cancelar sua assinatura a qualquer momento através do seu painel de controle.
      </p>
      <p className="mt-2">
        <Link href="#" className="text-primary text-xs hover:underline">
          Precisa de ajuda? Entre em contato com nosso suporte
        </Link>
      </p>
    </div>
  );
}
