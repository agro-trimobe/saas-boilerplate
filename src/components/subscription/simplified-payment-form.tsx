'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  CreditCard, 
  User, 
  MapPin, 
  Calendar, 
  Hash, 
  Shield, 
  AlertCircle,
  Phone,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrency } from '@/lib/formatters';
import { SubscriptionPlan } from '@/lib/types/subscription';

// Esquema de validação do formulário
const formSchema = z.object({
  nome: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'E-mail inválido' }),
  documento: z.string().min(5, { message: 'Documento inválido' }),
  cardNumber: z.string().min(13, { message: 'Número do cartão inválido' }).max(19),
  cardName: z.string().min(3, { message: 'Nome no cartão inválido' }),
  cardExpiry: z.string().min(5, { message: 'Data de validade inválida' }),
  cardCVV: z.string().min(3, { message: 'CVV inválido' }),
  zipCode: z.string().min(5, { message: 'CEP/Código postal inválido' }),
  addressNumber: z.string().min(1, { message: 'Número obrigatório' }),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PaymentFormProps {
  plan: SubscriptionPlan;
  userData?: { name: string; email: string } | null;
  onComplete: (success: boolean) => void;
}

export function SimplifiedPaymentForm({ plan, userData, onComplete }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Valor do plano selecionado
  const planValue = plan === 'BASIC' ? 49.90 : 99.90;
  
  // Inicializar o formulário
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: userData?.name || '',
      email: userData?.email || '',
      documento: '',
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCVV: '',
      zipCode: '',
      addressNumber: '',
      phone: '',
    },
  });

  // Flag para evitar múltiplos envios ou redirecionamentos inesperados
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função para processar o formulário
  const onSubmit = async (data: FormData) => {
    // Evitar envio múltiplo do formulário
    if (isSubmitting) {
      console.warn('Formulário já está sendo processado, evitando envio duplicado');
      return;
    }

    try {
      setIsSubmitting(true); // Marcar que estamos processando o envio
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
            name: data.nome,
            email: data.email,
            cpfCnpj: data.documento.replace(/[^0-9]/g, ''),
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
              postalCode: data.zipCode.replace(/[^0-9]/g, ''),
              number: data.addressNumber,
              phone: data.phone?.replace(/[^0-9]/g, '') || undefined,
            },
            remoteIp: '127.0.0.1' // Valor padrão para desenvolvimento
          },
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar pagamento');
      }
      
      console.log('[Pagamento] Processamento bem-sucedido, notificando conclusão');
      
      // Informar ao componente pai que o pagamento foi concluído com sucesso
      onComplete(true);
    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
      onComplete(false);
    } finally {
      setLoading(false);
      // Resetar o flag de envio após 1 segundo (permitirá nova tentativa após algum tempo)
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
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
  const formatDocument = (value: string) => {
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
  const formatZipCode = (value: string) => {
    const v = value.replace(/\D/g, '');
    return v.replace(/^(\d{5})(\d{3})$/, '$1-$2').replace(/^(\d{1,5})$/, '$1');
  };
  
  // Função para formatar telefone
  const formatPhone = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (!v) return '';
    
    if (v.length <= 10) {
      // Telefone fixo: (11) 1234-5678
      return v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
        .replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3')
        .replace(/(\d{2})(\d{1,4})/, '($1) $2')
        .replace(/^(\d{1,2})$/, '($1');
    } else {
      // Celular: (11) 91234-5678
      return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        .replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3')
        .replace(/(\d{2})(\d{1,5})/, '($1) $2')
        .replace(/^(\d{1,2})$/, '($1');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro no processamento</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Resumo do plano */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                Resumo do Plano
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Plano {plan === 'BASIC' ? 'Básico' : 'Premium'}</h3>
                  <p className="text-sm text-muted-foreground">Assinatura mensal</p>
                </div>
                <div className="text-xl font-bold">{formatCurrency(planValue)}</div>
              </div>
            </CardContent>
          </Card>
          
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <User className="mr-2 h-5 w-5 text-primary" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        Nome Completo
                        <User className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={loading} 
                          className="bg-background"
                          placeholder="Seu nome completo" 
                        />
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
                      <FormLabel className="flex items-center">
                        E-mail
                        <Mail className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          disabled={loading} 
                          className="bg-background"
                          placeholder="seu.email@exemplo.com" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      CPF/CNPJ
                      <Hash className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={loading} 
                        maxLength={18}
                        className="bg-background"
                        placeholder="123.456.789-00"
                        onChange={(e) => {
                          field.onChange(formatDocument(e.target.value));
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
            </CardContent>
          </Card>
          
          {/* Cartão de Crédito */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <CreditCard className="mr-2 h-5 w-5 text-primary" />
                Dados do Cartão de Crédito
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        className="bg-background"
                        placeholder="0000 0000 0000 0000"
                        onChange={(e) => {
                          field.onChange(formatCardNumber(e.target.value));
                        }}
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
                        className="bg-background"
                        placeholder="NOME COMO ESTÁ NO CARTÃO"
                        onChange={(e) => {
                          field.onChange(e.target.value.toUpperCase());
                        }}
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
                      <FormLabel className="flex items-center">
                        Data de Validade
                        <Calendar className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={loading} 
                          maxLength={7}
                          className="bg-background"
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
                      <FormLabel>Código de Segurança (CVV)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password"
                          disabled={loading} 
                          maxLength={4}
                          className="bg-background"
                          placeholder="123"
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, '');
                            field.onChange(v);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Endereço de Cobrança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                Endereço de Cobrança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={loading} 
                          maxLength={9}
                          className="bg-background"
                          placeholder="00000-000"
                          onChange={(e) => {
                            field.onChange(formatZipCode(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="addressNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={loading} 
                          className="bg-background"
                          placeholder="123"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Telefone (opcional)
                      <Phone className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={loading} 
                        maxLength={15}
                        className="bg-background"
                        placeholder="(00) 00000-0000"
                        onChange={(e) => {
                          field.onChange(formatPhone(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Telefone para contato
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Botão de Submissão */}
          <div className="flex flex-col gap-4">
            <Separator />
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Total a pagar</h3>
                <p className="text-sm text-muted-foreground">Assinatura mensal</p>
              </div>
              <div className="text-2xl font-bold">{formatCurrency(planValue)}</div>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full mt-4"
              size="lg"
            >
              {loading ? 'Processando...' : 'Confirmar Assinatura'}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground mt-2">
              Ao confirmar, você concorda com os Termos de Serviço e Política de Privacidade
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
