'use client';

import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';
import { SubscriptionPlan } from '@/lib/types/subscription';
// Valores padrão para demonstração
const SUBSCRIPTION_BASIC_VALUE = 49.90;
const SUBSCRIPTION_PREMIUM_VALUE = 99.90;

interface PlanSummaryProps {
  plan: SubscriptionPlan;
}

export function PlanSummary({ plan }: PlanSummaryProps) {
  const planValue = plan === 'BASIC' ? SUBSCRIPTION_BASIC_VALUE : SUBSCRIPTION_PREMIUM_VALUE;
  const planName = plan === 'BASIC' ? 'Básico' : 'Premium';
  
  return (
    <Card className="border-primary/20 mb-6">
      <CardHeader className="bg-primary/5 pb-3">
        <CardTitle className="flex items-center text-lg">
          <CheckCircle className="text-primary mr-2 h-5 w-5" />
          Plano {planName} Selecionado
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">Plano {planName}</p>
            <p className="text-sm text-muted-foreground">Cobrança mensal</p>
          </div>
          <Badge variant="outline" className="text-lg font-semibold">
            {formatCurrency(planValue)}<span className="text-xs font-normal">/mês</span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
