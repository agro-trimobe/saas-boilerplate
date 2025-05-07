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
  Mail,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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

interface EnhancedPaymentFormProps {
  plan: SubscriptionPlan;
  userData?: { name: string; email: string } | null;
  onComplete: (success: boolean) => void;
}

export function EnhancedPaymentForm({ plan, userData, onComplete }: EnhancedPaymentFormProps) {
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
    // Remove todos os caracteres não numéricos
    const v = value.replace(/\D/g, '');
    
    // Não formata se estiver vazio
    if (!v) return '';
    
    if (v.length <= 10) {
      // Formatação para telefone fixo
      if (v.length === 10) {
        // Formato completo: (99) 9999-9999
        return `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6, 10)}`;
      } else if (v.length > 6) {
        // Parcialmente completo com hífen
        return `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`;
      } else if (v.length > 2) {
        // Apenas DDD e início do número
        return `(${v.substring(0, 2)}) ${v.substring(2)}`;
      } else {
        // Apenas DDD
        return `(${v})`;
      }
    } else {
      // Formatação para celular
      if (v.length === 11) {
        // Formato completo: (99) 99999-9999
        return `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7, 11)}`;
      } else if (v.length > 7) {
        // Parcialmente completo com hífen
        return `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
      } else if (v.length > 2) {
        // Apenas DDD e início do número
        return `(${v.substring(0, 2)}) ${v.substring(2)}`;
      } else {
        // Apenas DDD
        return `(${v})`;
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>Erro ao processar pagamento</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <User className="mr-2 h-5 w-5 text-primary" />
                Informações Pessoais
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
                      </FormLabel>
                      <FormControl>
                        <Input {...field} disabled={loading} className="bg-background" />
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
                        <Input {...field} type="email" disabled={loading} className="bg-background" />
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
            </CardContent>
          </Card>
          
          {/* Informações do Cartão */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="mr-2 h-5 w-5 text-primary" />
                Informações do Cartão
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
                        className="bg-background"
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
                      <FormLabel className="flex items-center">
                        Validade
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
                      <FormLabel className="flex items-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help flex items-center">
                                CVV
                                <AlertCircle className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Código de 3 ou 4 dígitos no verso do cartão</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={loading} 
                          maxLength={4}
                          className="bg-background"
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
            </CardContent>
          </Card>
          
          {/* Endereço de Cobrança */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                Endereço de Cobrança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                          className="bg-background"
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
                name="telefone"
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
            </CardContent>
          </Card>
          
          <Button 
            type="submit" 
            className="w-full py-6" 
            disabled={loading}
            size="lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Processando pagamento...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Lock className="mr-2 h-5 w-5" />
                <span>Pagar {formatarMoeda(planValue)}</span>
              </div>
            )}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p className="flex items-center justify-center">
              <Shield className="mr-2 h-4 w-4" />
              Pagamento processado com segurança via Asaas
            </p>
            <p>
              Ao assinar, você concorda com nossos <a href="#" className="text-primary hover:underline">Termos de Serviço</a> e <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
