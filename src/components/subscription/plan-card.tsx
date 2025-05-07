'use client';

import { CheckIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatarMoeda } from '@/lib/formatters';
import { SubscriptionPlan } from '@/lib/types/subscription';
import { cn } from '@/lib/utils';

interface PlanFeature {
  text: string;
  highlighted?: boolean;
  disabled?: boolean;
}

interface PlanCardProps {
  title: string;
  description: string;
  price: number;
  features: PlanFeature[];
  plan: 'BASIC' | 'PREMIUM';
  recommended?: boolean;
  onSelect: (plan: 'BASIC' | 'PREMIUM') => void;
}

export function PlanCard({
  title,
  description,
  price,
  features,
  plan,
  recommended = false,
  onSelect,
}: PlanCardProps) {
  return (
    <Card className={cn(
      "flex flex-col transition-all duration-200 hover:shadow-md hover:scale-[1.01]",
      recommended ? "border-primary relative" : ""
    )}>
      {recommended && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
          Recomendado
        </div>
      )}
      
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-base mt-1.5">{description}</CardDescription>
        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-bold">{formatarMoeda(price)}</span>
          <span className="text-muted-foreground ml-1.5">/mês</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow space-y-4">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li 
              key={index} 
              className={cn(
                "flex items-start",
                feature.disabled ? "line-through opacity-50" : "",
                feature.highlighted ? "font-semibold" : ""
              )}
            >
              <CheckIcon 
                className={cn(
                  "mr-2 h-5 w-5 shrink-0",
                  feature.disabled ? "text-muted-foreground" : "text-green-500"
                )} 
              />
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter className="pt-4">
        <Button 
          className="w-full" 
          variant={recommended ? "default" : "outline"}
          onClick={() => onSelect(plan)}
        >
          Assinar {title.split(':')[0]}
        </Button>
      </CardFooter>
    </Card>
  );
}
