'use client';

import Link from 'next/link';
import { CreditCard, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { useSubscription } from '@/hooks/use-subscription';

/**
 * Componente que exibe informações da assinatura do usuário
 * Extraído em um componente separado para facilitar o carregamento lazy
 */
export default function SubscriptionInfo() {
  const { subscription, isLoading } = useSubscription();
  
  if (isLoading) {
    return <Loading size="default" text="Carregando informações da assinatura..." />;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center">
          <CreditCard className="h-5 w-5 text-primary mr-2" />
          Sua Assinatura
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Plano:</span>
            <Badge variant="outline" className="font-medium">
              {subscription?.plan === 'PREMIUM' ? 'Premium' : subscription?.plan === 'BASIC' ? 'Básico' : 'Trial'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge className={`${subscription?.status === 'ACTIVE' || subscription?.status === 'TRIAL' ? 'bg-green-500' : 'bg-yellow-500'} hover:bg-none text-white`}>
              {subscription?.status === 'ACTIVE' ? 'Ativo' : 
               subscription?.status === 'TRIAL' ? 'Trial' : 
               subscription?.status === 'INACTIVE' ? 'Inativo' : 
               subscription?.status === 'CANCELLED' ? 'Cancelado' : 'Pendente'}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Link href="/subscription">
          <span className="text-xs text-primary hover:underline flex items-center">
            Ver detalhes
            <ExternalLink className="h-3 w-3 ml-1" />
          </span>
        </Link>
        {subscription && subscription.status !== 'CANCELLED' && (
          <Link href="/cancel-subscription" target="_blank" rel="noopener noreferrer">
            <span className="text-xs text-muted-foreground hover:text-destructive flex items-center">
              Cancelar
              <ExternalLink className="h-3 w-3 ml-1" />
            </span>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
