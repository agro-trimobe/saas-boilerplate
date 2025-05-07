'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { formatarMoeda } from '@/lib/formatters';
import { ASAAS_SUBSCRIPTION_BASIC_VALUE, ASAAS_SUBSCRIPTION_PREMIUM_VALUE } from '@/lib/asaas-config';
import { SubscriptionPlan } from '@/lib/types/subscription';

// Esquema de validação do formulário
const formSchema = z.object({
  nome: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'E-mail inválido' }),
  cpfCnpj: z.string().min(11, { message: 'CPF/CNPJ inválido' }),
  cardNumber: z.string().min(13, { message: 'Número do cartão inválido' }).max(19),
  cardName: z.string().min(3, { message: 'Nome no cartão inválido' }),
  cardExpiry: z.string().min(5, { message: 'Data de validade inválida' }),
  cardCVV: z.string().min(3, { message: 'CVV inválido' }),
  cep: z.string().min(8, { message: 'CEP inválido' }),
  numero: z.string().min(1, { message: 'Número obrigatório' }),
  telefone: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PaymentFormProps {
  plan: SubscriptionPlan;
  userData?: { name: string; email: string } | null;
  onComplete: (success: boolean) => void;
}

const PaymentForm = ({ plan, userData, onComplete }: PaymentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Valor do plano selecionado
  const planValue = plan === 'BASIC' ? ASAAS_SUBSCRIPTION_BASIC_VALUE : ASAAS_SUBSCRIPTION_PREMIUM_VALUE;
  
  // Inicializar o formulário
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: userData?.name || '',
      email: userData?.email || '',
      cpfCnpj: '',
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCVV: '',
      cep: '',
      numero: '',
      telefone: '',
    },
  });

  // Função para processar o formulário
  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);

      // Processar data de expiração do cartão
      const [month, year] = data.cardExpiry.split('/');
      
      // Ano com 2 ou 4 dígitos
      let expiryYear = year.trim();
      if (expiryYear.length === 2) {
        expiryYear = `20${expiryYear}`;
      }
      
      // Enviar para a API
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          userData: {
            cpfCnpj: data.cpfCnpj.replace(/[^0-9]/g, ''),
          },
          paymentData: {
            creditCard: {
              holderName: data.cardName,
              number: data.cardNumber.replace(/\s/g, ''),
              expiryMonth: month.trim(),
              expiryYear,
              ccv: data.cardCVV,
            },
            address: {
              postalCode: data.cep.replace(/[^0-9]/g, ''),
              number: data.numero,
              phone: data.telefone?.replace(/[^0-9]/g, '') || undefined,
            },
          },
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar pagamento');
      }
      
      // Informar ao componente pai que o pagamento foi concluído com sucesso
      onComplete(true);
    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
      onComplete(false);
    } finally {
      setLoading(false);
    }
  };

  // Função para formatar o número do cartão
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Função para formatar a data de validade
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 6)}`;
    }
    
    return v;
  };
  
  // Função para formatar CPF/CNPJ
  const formatCpfCnpj = (value: string) => {
    const v = value.replace(/\D/g, '');
    
    if (v.length <= 11) {
      // CPF: 123.456.789-01
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        .replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
        .replace(/(\d{3})(\d{1,3})/, '$1.$2')
        .replace(/^(\d{1,3})$/, '$1');
    } else {
      // CNPJ: 12.345.678/0001-90
      return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
        .replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4')
        .replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3')
        .replace(/(\d{2})(\d{1,3})/, '$1.$2')
        .replace(/^(\d{1,2})$/, '$1');
    }
  };
  
  // Função para formatar CEP
  const formatCep = (value: string) => {
    const v = value.replace(/\D/g, '');
    return v.replace(/^(\d{5})(\d{3})$/, '$1-$2').replace(/^(\d{1,5})$/, '$1');
  };
  
  // Função para formatar telefone
  const formatTelefone = (value: string) => {
    const v = value.replace(/\D/g, '');
    
    if (v.length <= 10) {
      // Telefone fixo: (99) 9999-9999
      return v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
        .replace(/(\d{2})(\d{1,4})/, '($1) $2')
        .replace(/^(\d{1,2})$/, '($1');
    } else {
      // Celular: (99) 99999-9999
      return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        .replace(/(\d{2})(\d{1,5})/, '($1) $2')
        .replace(/^(\d{1,2})$/, '($1');
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Informações de Pagamento</CardTitle>
        <CardDescription>
          Você escolheu o plano {plan === 'BASIC' ? 'Básico' : 'Premium'} por {formatarMoeda(planValue)}/mês
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Erro ao processar pagamento</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informações Pessoais</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="cpfCnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/CNPJ</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={loading} 
                        maxLength={18}
                        onChange={(e) => {
                          field.onChange(formatCpfCnpj(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Apenas números, sem pontos ou traços
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informações do Cartão</h3>
              
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Cartão</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={loading} 
                        maxLength={19}
                        onChange={(e) => {
                          field.onChange(formatCardNumber(e.target.value));
                        }}
                        placeholder="1234 5678 9012 3456"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cardName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome no Cartão</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={loading} 
                        placeholder="NOME COMO IMPRESSO NO CARTÃO"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="cardExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Validade</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={loading} 
                          maxLength={7}
                          placeholder="MM/AAAA"
                          onChange={(e) => {
                            field.onChange(formatExpiryDate(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cardCVV"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={loading} 
                          maxLength={4}
                          placeholder="123"
                          onChange={(e) => {
                            field.onChange(e.target.value.replace(/\D/g, ''));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Endereço de Cobrança</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={loading} 
                          maxLength={9}
                          placeholder="12345-678"
                          onChange={(e) => {
                            field.onChange(formatCep(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={loading} placeholder="123" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={loading} 
                        maxLength={15}
                        placeholder="(99) 99999-9999"
                        onChange={(e) => {
                          field.onChange(formatTelefone(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando pagamento...
                </>
              ) : (
                `Pagar ${formatarMoeda(planValue)}`
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        <p>
          Pagamento processado com segurança via Asaas
        </p>
      </CardFooter>
    </Card>
  );
}
