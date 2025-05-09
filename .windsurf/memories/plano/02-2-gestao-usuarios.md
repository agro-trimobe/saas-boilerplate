# 2.3. Adaptação da Área de Gestão de Usuários (2 dias)

Este documento detalha as tarefas relacionadas à adaptação e implementação do sistema de gestão de usuários do AgroCredit (Trimobe), incluindo autenticação, perfis e configurações personalizadas.

## Ajustes nas Páginas de Autenticação

- [ ] **Adaptar páginas de cadastro e login**
  - Modificar formulário de cadastro em `src/app/(auth)/signup/page.tsx` para incluir campos específicos:
    ```typescript
    'use client';
    
    import React from 'react';
    import { useForm } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import { z } from 'zod';
    import { Button, Input, Label, Alert } from '@/components/ui';
    import { signUp } from '@/services/authService';
    import Link from 'next/link';
    
    // Schema de validação
    const signupSchema = z.object({
      name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
      email: z.string().email('Email inválido'),
      password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
      company: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
      profession: z.string().min(2, 'Informe sua profissão'),
      termsAccepted: z.boolean().refine(val => val === true, {
        message: 'Você precisa aceitar os termos de uso'
      })
    });
    
    export default function SignupPage() {
      const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(signupSchema),
        defaultValues: {
          name: '',
          email: '',
          password: '',
          company: '',
          profession: '',
          termsAccepted: false
        }
      });
      
      const [error, setError] = React.useState<string | null>(null);
      const [success, setSuccess] = React.useState<boolean>(false);
      
      const onSubmit = async (data: z.infer<typeof signupSchema>) => {
        try {
          setError(null);
          
          // Chamar serviço de autenticação
          await signUp({
            name: data.name,
            email: data.email,
            password: data.password,
            tenantName: data.company,
            profession: data.profession
          });
          
          setSuccess(true);
        } catch (err: any) {
          setError(err.message || 'Erro ao criar conta. Tente novamente mais tarde.');
        }
      };
      
      if (success) {
        return (
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center mb-6">Cadastro Realizado</h1>
            <Alert type="success">
              Cadastro realizado com sucesso! Enviamos um email de confirmação.
              Por favor, verifique sua caixa de entrada e confirme seu cadastro.
            </Alert>
            <div className="mt-4 text-center">
              <Link href="/login" className="text-blue-600 hover:text-blue-800">
                Ir para página de login
              </Link>
            </div>
          </div>
        );
      }
      
      return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Criar uma Conta</h1>
          
          {error && <Alert type="error" className="mb-4">{error}</Alert>}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                {...register('name')}
                error={errors.name?.message}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>
            
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                {...register('password')}
                error={errors.password?.message}
              />
            </div>
            
            <div>
              <Label htmlFor="company">Empresa/Organização</Label>
              <Input
                id="company"
                type="text"
                placeholder="Nome da sua empresa"
                {...register('company')}
                error={errors.company?.message}
              />
            </div>
            
            <div>
              <Label htmlFor="profession">Profissão</Label>
              <select
                id="profession"
                {...register('profession')}
                className={`w-full p-2 border rounded-md ${errors.profession ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Selecione sua profissão</option>
                <option value="engenheiro_agronomo">Engenheiro Agrônomo</option>
                <option value="tecnico_agricola">Técnico Agrícola</option>
                <option value="consultor_credito">Consultor de Crédito Rural</option>
                <option value="agente_financeiro">Agente Financeiro</option>
                <option value="produtor_rural">Produtor Rural</option>
                <option value="outro">Outro</option>
              </select>
              {errors.profession && <p className="text-red-500 text-sm mt-1">{errors.profession.message}</p>}
            </div>
            
            <div className="flex items-start">
              <input
                id="termsAccepted"
                type="checkbox"
                className="mt-1"
                {...register('termsAccepted')}
              />
              <label htmlFor="termsAccepted" className="ml-2 text-sm">
                Eu concordo com os <Link href="/termos" className="text-blue-600 hover:underline">Termos de Uso</Link> e <Link href="/privacidade" className="text-blue-600 hover:underline">Política de Privacidade</Link>
              </label>
            </div>
            {errors.termsAccepted && <p className="text-red-500 text-sm">{errors.termsAccepted.message}</p>}
            
            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              disabled={isSubmitting}
              className="mt-2"
            >
              Criar Conta
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-800">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      );
    }
    ```

  - Adaptar página de login para branding do AgroCredit (tema agrícola/rural)
  - Implementar página de confirmação de cadastro

- [ ] **Adaptar página de perfil do usuário**
  - Criar página de perfil em `src/app/dashboard/perfil/page.tsx` com opções específicas:
    ```typescript
    'use client';
    
    import React, { useEffect, useState } from 'react';
    import { useForm } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import { z } from 'zod';
    import { useAuth } from '@/hooks/useAuth';
    import { Button, Input, Label, Alert, Separator } from '@/components/ui';
    import DashboardLayout from '@/components/layouts/DashboardLayout';
    
    // Schema de validação do perfil
    const profileSchema = z.object({
      name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
      company: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
      profession: z.string().min(2, 'Informe sua profissão'),
      phone: z.string().optional(),
      region: z.string().optional(),
      aiPreferences: z.object({
        detailLevel: z.enum(['Básico', 'Padrão', 'Detalhado']),
        includeMarketPrices: z.boolean(),
        preferredBanks: z.array(z.string()).optional()
      })
    });
    
    export default function ProfilePage() {
      const { user, updateUserProfile } = useAuth();
      const [isLoading, setIsLoading] = useState(true);
      
      const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
          name: '',
          company: '',
          profession: '',
          phone: '',
          region: '',
          aiPreferences: {
            detailLevel: 'Padrão',
            includeMarketPrices: true,
            preferredBanks: []
          }
        }
      });
      
      const [error, setError] = useState<string | null>(null);
      const [success, setSuccess] = useState<boolean>(false);
      
      // Carregar dados do perfil
      useEffect(() => {
        async function loadUserProfile() {
          try {
            if (user) {
              const response = await fetch(`/api/users/profile?userId=${user.id}`);
              const profileData = await response.json();
              
              // Preencher formulário com dados existentes
              reset({
                name: profileData.name,
                company: profileData.company,
                profession: profileData.profession,
                phone: profileData.phone || '',
                region: profileData.region || '',
                aiPreferences: {
                  detailLevel: profileData.aiPreferences?.detailLevel || 'Padrão',
                  includeMarketPrices: profileData.aiPreferences?.includeMarketPrices ?? true,
                  preferredBanks: profileData.aiPreferences?.preferredBanks || []
                }
              });
            }
          } catch (err) {
            console.error('Erro ao carregar perfil:', err);
            setError('Não foi possível carregar os dados do perfil');
          } finally {
            setIsLoading(false);
          }
        }
        
        loadUserProfile();
      }, [user, reset]);
      
      const onSubmit = async (data: z.infer<typeof profileSchema>) => {
        try {
          setError(null);
          setSuccess(false);
          
          await updateUserProfile(data);
          
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
          setError(err.message || 'Erro ao atualizar perfil');
        }
      };
      
      if (isLoading) {
        return (
          <DashboardLayout>
            <div className="flex justify-center items-center h-64">
              <div className="loader">Carregando perfil...</div>
            </div>
          </DashboardLayout>
        );
      }
      
      return (
        <DashboardLayout>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
            
            {error && <Alert type="error" className="mb-4">{error}</Alert>}
            {success && <Alert type="success" className="mb-4">Perfil atualizado com sucesso!</Alert>}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Informações Pessoais</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      error={errors.name?.message}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="company">Empresa/Organização</Label>
                    <Input
                      id="company"
                      {...register('company')}
                      error={errors.company?.message}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="profession">Profissão</Label>
                    <select
                      id="profession"
                      {...register('profession')}
                      className={`w-full p-2 border rounded-md ${errors.profession ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Selecione sua profissão</option>
                      <option value="engenheiro_agronomo">Engenheiro Agrônomo</option>
                      <option value="tecnico_agricola">Técnico Agrícola</option>
                      <option value="consultor_credito">Consultor de Crédito Rural</option>
                      <option value="agente_financeiro">Agente Financeiro</option>
                      <option value="produtor_rural">Produtor Rural</option>
                      <option value="outro">Outro</option>
                    </select>
                    {errors.profession && <p className="text-red-500 text-sm mt-1">{errors.profession.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Telefone (opcional)</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      error={errors.phone?.message}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="region">Região de atuação (opcional)</Label>
                    <Input
                      id="region"
                      placeholder="Ex: Sul de Minas Gerais"
                      {...register('region')}
                      error={errors.region?.message}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Preferências do Assistente</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="detailLevel">Nível de detalhamento nas respostas</Label>
                    <select
                      id="detailLevel"
                      {...register('aiPreferences.detailLevel')}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="Básico">Básico - Respostas diretas e concisas</option>
                      <option value="Padrão">Padrão - Equilíbrio entre detalhes e objetividade</option>
                      <option value="Detalhado">Detalhado - Respostas completas com exemplos e referências</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeMarketPrices"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      {...register('aiPreferences.includeMarketPrices')}
                    />
                    <Label htmlFor="includeMarketPrices" className="ml-2">
                      Incluir preços e tendências de mercado quando relevante
                    </Label>
                  </div>
                  
                  <div>
                    <Label>Bancos preferenciais para simulações</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['Banco do Brasil', 'BNDES', 'Sicredi', 'Bradesco', 'Caixa', 'Santander'].map((bank) => (
                        <div key={bank} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`bank-${bank}`}
                            value={bank}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            {...register('aiPreferences.preferredBanks')}
                          />
                          <label htmlFor={`bank-${bank}`} className="ml-2 text-sm text-gray-700">
                            {bank}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <Button type="submit" className="w-full md:w-auto">
                Salvar Alterações
              </Button>
            </form>
          </div>
        </DashboardLayout>
      );
    }
    ```

- [ ] **Configurar fluxo de recuperação de senha**
  - Implementar página de recuperação em `src/app/(auth)/recuperar-senha/page.tsx`:
    ```typescript
    'use client';
    
    import React, { useState } from 'react';
    import { useForm } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import { z } from 'zod';
    import { Button, Input, Label, Alert } from '@/components/ui';
    import { forgotPassword, confirmPassword } from '@/services/authService';
    import Link from 'next/link';
    
    // Schema para o formulário de solicitação
    const requestSchema = z.object({
      email: z.string().email('Email inválido')
    });
    
    // Schema para o formulário de redefinição
    const resetSchema = z.object({
      code: z.string().min(6, 'Código deve ter pelo menos 6 caracteres'),
      password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
      confirmPassword: z.string().min(8, 'Confirme sua senha')
    }).refine(data => data.password === data.confirmPassword, {
      message: 'Senhas não conferem',
      path: ['confirmPassword']
    });
    
    export default function PasswordResetPage() {
      const [step, setStep] = useState(1);
      const [email, setEmail] = useState('');
      
      // Step 1 form
      const { 
        register: registerStep1, 
        handleSubmit: handleSubmitStep1, 
        formState: { errors: errorsStep1, isSubmitting: isSubmittingStep1 } 
      } = useForm({
        resolver: zodResolver(requestSchema)
      });
      
      // Step 2 form
      const { 
        register: registerStep2, 
        handleSubmit: handleSubmitStep2, 
        formState: { errors: errorsStep2, isSubmitting: isSubmittingStep2 } 
      } = useForm({
        resolver: zodResolver(resetSchema)
      });
      
      const [error, setError] = useState<string | null>(null);
      const [success, setSuccess] = useState<boolean>(false);
      
      const onRequestReset = async (data: z.infer<typeof requestSchema>) => {
        try {
          setError(null);
          await forgotPassword(data.email);
          setEmail(data.email);
          setStep(2);
        } catch (err: any) {
          setError(err.message || 'Erro ao solicitar recuperação de senha');
        }
      };
      
      const onConfirmReset = async (data: z.infer<typeof resetSchema>) => {
        try {
          setError(null);
          await confirmPassword(email, data.code, data.password);
          setSuccess(true);
        } catch (err: any) {
          setError(err.message || 'Erro ao redefinir senha');
        }
      };
      
      return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          {step === 1 ? (
            <>
              <h1 className="text-2xl font-bold text-center mb-6">Recuperar Senha</h1>
              
              {error && <Alert type="error" className="mb-4">{error}</Alert>}
              
              <p className="text-gray-600 mb-4">
                Informe seu email de cadastro para receber um código de recuperação.
              </p>
              
              <form onSubmit={handleSubmitStep1(onRequestReset)} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...registerStep1('email')}
                    error={errorsStep1.email?.message}
                  />
                </div>
                
                <Button
                  type="submit"
                  fullWidth
                  loading={isSubmittingStep1}
                  disabled={isSubmittingStep1}
                >
                  Enviar Código
                </Button>
              </form>
            </>
          ) : success ? (
            <>
              <h1 className="text-2xl font-bold text-center mb-6">Senha Atualizada</h1>
              
              <Alert type="success" className="mb-4">
                Sua senha foi redefinida com sucesso!
              </Alert>
              
              <div className="text-center">
                <Link href="/login" className="text-blue-600 hover:text-blue-800">
                  Voltar para o login
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center mb-6">Redefinir Senha</h1>
              
              {error && <Alert type="error" className="mb-4">{error}</Alert>}
              
              <p className="text-gray-600 mb-4">
                Digite o código enviado para <strong>{email}</strong> e sua nova senha.
              </p>
              
              <form onSubmit={handleSubmitStep2(onConfirmReset)} className="space-y-4">
                <div>
                  <Label htmlFor="code">Código de verificação</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Código de 6 dígitos"
                    {...registerStep2('code')}
                    error={errorsStep2.code?.message}
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Nova senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    {...registerStep2('password')}
                    error={errorsStep2.password?.message}
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirme a nova senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="********"
                    {...registerStep2('confirmPassword')}
                    error={errorsStep2.confirmPassword?.message}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isSubmittingStep2}
                  >
                    Voltar
                  </Button>
                  
                  <Button
                    type="submit"
                    fullWidth
                    loading={isSubmittingStep2}
                    disabled={isSubmittingStep2}
                  >
                    Redefinir Senha
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      );
    }
    ```

  - Implementar endpoints de API em `src/app/api/auth/`:
    - `forgot-password/route.ts` - Enviar código por email
    - `reset-password/route.ts` - Validar código e atualizar senha
  
  - Integrar com Cognito para o fluxo completo de redefinição de senha
