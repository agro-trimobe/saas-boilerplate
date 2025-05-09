# Fase 6: Implantação e Lançamento (1 semana)

Este documento detalha as tarefas relacionadas à fase final de implantação e lançamento do AgroCredit (Trimobe), incluindo a configuração do ambiente de produção, estratégias de lançamento e acompanhamento inicial.

## 6.1. Configuração do Ambiente de Produção (2 dias)

- [ ] **Configurar infraestrutura AWS para produção**
  - Criar recursos de produção usando Terraform:
    ```hcl
    # main.tf
    provider "aws" {
      region = var.aws_region
    }
    
    # DynamoDB
    resource "aws_dynamodb_table" "trimobe_table" {
      name           = "${var.environment}-trimobe-table"
      billing_mode   = "PAY_PER_REQUEST"
      hash_key       = "PK"
      range_key      = "SK"
    
      attribute {
        name = "PK"
        type = "S"
      }
    
      attribute {
        name = "SK"
        type = "S"
      }
    
      attribute {
        name = "GSI1PK"
        type = "S"
      }
    
      attribute {
        name = "GSI1SK"
        type = "S"
      }
    
      global_secondary_index {
        name               = "GSI1"
        hash_key           = "GSI1PK"
        range_key          = "GSI1SK"
        projection_type    = "ALL"
      }
    
      tags = {
        Environment = var.environment
        Project     = "Trimobe"
      }
    }
    
    # Bucket S3
    resource "aws_s3_bucket" "trimobe_bucket" {
      bucket = "${var.environment}-trimobe-bucket"
    
      tags = {
        Environment = var.environment
        Project     = "Trimobe"
      }
    }
    
    # Configuração de privacidade do bucket
    resource "aws_s3_bucket_public_access_block" "trimobe_bucket_privacy" {
      bucket = aws_s3_bucket.trimobe_bucket.id
    
      block_public_acls       = true
      block_public_policy     = true
      ignore_public_acls      = true
      restrict_public_buckets = true
    }
    
    # Configuração de CORS
    resource "aws_s3_bucket_cors_configuration" "trimobe_bucket_cors" {
      bucket = aws_s3_bucket.trimobe_bucket.id
    
      cors_rule {
        allowed_headers = ["*"]
        allowed_methods = ["GET", "PUT", "POST", "DELETE"]
        allowed_origins = [var.frontend_url]
        expose_headers  = ["ETag"]
        max_age_seconds = 3000
      }
    }
    
    # Cognito User Pool
    resource "aws_cognito_user_pool" "trimobe_users" {
      name = "${var.environment}-trimobe-users"
    
      username_attributes = ["email"]
      auto_verify_attributes = ["email"]
    
      password_policy {
        minimum_length    = 8
        require_lowercase = true
        require_numbers   = true
        require_symbols   = false
        require_uppercase = true
      }
    
      schema {
        name                = "custom:tenantId"
        attribute_data_type = "String"
        mutable             = true
        required            = false
      }
    
      schema {
        name                = "custom:role"
        attribute_data_type = "String"
        mutable             = true
        required            = false
      }
    
      email_configuration {
        email_sending_account = "COGNITO_DEFAULT"
      }
    
      tags = {
        Environment = var.environment
        Project     = "Trimobe"
      }
    }
    
    # Cognito App Client
    resource "aws_cognito_user_pool_client" "trimobe_client" {
      name = "${var.environment}-trimobe-client"
    
      user_pool_id = aws_cognito_user_pool.trimobe_users.id
    
      explicit_auth_flows = [
        "ALLOW_USER_PASSWORD_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH",
        "ALLOW_ADMIN_USER_PASSWORD_AUTH"
      ]
    
      prevent_user_existence_errors = "ENABLED"
      refresh_token_validity        = 30
      access_token_validity         = 1
      id_token_validity             = 1
    
      token_validity_units {
        access_token  = "days"
        id_token      = "days"
        refresh_token = "days"
      }
    
      callback_urls = [var.frontend_url]
      logout_urls   = [var.frontend_url]
    }
    ```

  - Implementar sistema de CI/CD com GitHub Actions:
    ```yaml
    # .github/workflows/deploy.yml
    name: Deploy Trimobe
    
    on:
      push:
        branches:
          - main
          - production
    
    jobs:
      deploy:
        runs-on: ubuntu-latest
        
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: ${{ secrets.AWS_REGION }}
    
        steps:
          - name: Checkout código
            uses: actions/checkout@v2
    
          - name: Setup Node.js
            uses: actions/setup-node@v2
            with:
              node-version: '18'
              cache: 'npm'
    
          - name: Instalar dependências
            run: npm ci
    
          - name: Rodar testes
            run: npm test
    
          - name: Determinar ambiente baseado na branch
            id: env
            run: |
              if [ "${{ github.ref }}" = "refs/heads/production" ]; then
                echo "environment=production" >> $GITHUB_OUTPUT
              else
                echo "environment=staging" >> $GITHUB_OUTPUT
              fi
    
          - name: Build do projeto
            run: |
              npm run build
            env:
              NEXT_PUBLIC_API_URL: ${{ steps.env.outputs.environment == 'production' 
                ? secrets.PROD_API_URL 
                : secrets.STAGING_API_URL }}
              NEXT_PUBLIC_ENV: ${{ steps.env.outputs.environment }}
    
          - name: Deploy to AWS Amplify
            uses: aws-amplify/amplify-cli-action@master
            with:
              amplify_command: publish
              amplify_env: ${{ steps.env.outputs.environment }}
    ```

- [ ] **Implementar configurações de segurança e monitoramento**
  - Configurar AWS WAF para proteção contra ataques:
    ```hcl
    # waf.tf
    resource "aws_wafv2_web_acl" "trimobe_waf" {
      name        = "${var.environment}-trimobe-waf"
      description = "WAF for Trimobe API"
      scope       = "REGIONAL"
    
      default_action {
        allow {}
      }
    
      # Regra de limitação de taxa
      rule {
        name     = "RateLimitRule"
        priority = 1
    
        action {
          block {}
        }
    
        statement {
          rate_based_statement {
            limit              = 1000
            aggregate_key_type = "IP"
          }
        }
    
        visibility_config {
          cloudwatch_metrics_enabled = true
          metric_name                = "RateLimitRule"
          sampled_requests_enabled   = true
        }
      }
    
      # Regra de bloqueio contra SQL Injection
      rule {
        name     = "SQLiRule"
        priority = 2
    
        action {
          block {}
        }
    
        statement {
          managed_rule_group_statement {
            name        = "AWSManagedRulesSQLiRuleSet"
            vendor_name = "AWS"
          }
        }
    
        visibility_config {
          cloudwatch_metrics_enabled = true
          metric_name                = "SQLiRule"
          sampled_requests_enabled   = true
        }
      }
    
      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "${var.environment}-trimobe-waf"
        sampled_requests_enabled   = true
      }
    }
    ```

  - Configurar monitoramento com CloudWatch:
    ```hcl
    # monitoring.tf
    # Dashboard CloudWatch
    resource "aws_cloudwatch_dashboard" "trimobe_dashboard" {
      dashboard_name = "${var.environment}-trimobe-dashboard"
    
      dashboard_body = jsonencode({
        widgets = [
          {
            type   = "metric"
            x      = 0
            y      = 0
            width  = 12
            height = 6
    
            properties = {
              metrics = [
                ["AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", aws_dynamodb_table.trimobe_table.name],
                ["AWS/DynamoDB", "ConsumedWriteCapacityUnits", "TableName", aws_dynamodb_table.trimobe_table.name]
              ]
              period = 300
              stat   = "Sum"
              region = var.aws_region
              title  = "DynamoDB - Capacidade Consumida"
            }
          },
          {
            type   = "metric"
            x      = 12
            y      = 0
            width  = 12
            height = 6
    
            properties = {
              metrics = [
                ["AWS/Lambda", "Invocations", "FunctionName", "${var.environment}-trimobe-api"],
                ["AWS/Lambda", "Errors", "FunctionName", "${var.environment}-trimobe-api"],
              ]
              period = 300
              stat   = "Sum"
              region = var.aws_region
              title  = "Lambda - Invocações e Erros"
            }
          }
        ]
      })
    }
    
    # Alarme para erros de Lambda
    resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
      alarm_name          = "${var.environment}-trimobe-lambda-errors"
      comparison_operator = "GreaterThanThreshold"
      evaluation_periods  = 1
      metric_name         = "Errors"
      namespace           = "AWS/Lambda"
      period              = 60
      statistic           = "Sum"
      threshold           = 5
      alarm_description   = "Alarme para erros na função Lambda da API"
      alarm_actions       = [aws_sns_topic.alerts.arn]
      dimensions = {
        FunctionName = "${var.environment}-trimobe-api"
      }
    }
    
    # Tópico SNS para alertas
    resource "aws_sns_topic" "alerts" {
      name = "${var.environment}-trimobe-alerts"
    }
    ```

- [ ] **Configurar variáveis de ambiente seguras**
  - Implementar sistema de gerenciamento de segredos com AWS Secrets Manager:
    ```typescript
    // src/lib/secrets/index.ts
    import {
      SecretsManagerClient,
      GetSecretValueCommand,
    } from '@aws-sdk/client-secrets-manager';
    import config from '@/config';
    
    const client = new SecretsManagerClient({
      region: config.aws.region,
    });
    
    interface SecretData {
      [key: string]: string;
    }
    
    /**
     * Obtém segredos do AWS Secrets Manager
     */
    export async function getSecret(secretName: string): Promise<SecretData> {
      try {
        const command = new GetSecretValueCommand({
          SecretId: secretName,
        });
        
        const response = await client.send(command);
        
        if (response.SecretString) {
          return JSON.parse(response.SecretString);
        }
        
        throw new Error('Segredo sem valor de string');
      } catch (error) {
        console.error('Erro ao obter segredo:', error);
        throw error;
      }
    }
    
    /**
     * Carrega segredos e atualiza variáveis de ambiente
     */
    export async function loadSecrets(): Promise<void> {
      try {
        const env = process.env.NODE_ENV || 'development';
        const secretName = `${env}/trimobe/api`;
        
        const secrets = await getSecret(secretName);
        
        // Atualizar variáveis de ambiente com os segredos
        Object.entries(secrets).forEach(([key, value]) => {
          process.env[key] = value;
        });
        
        console.log('Segredos carregados com sucesso');
      } catch (error) {
        console.error('Erro ao carregar segredos:', error);
        // Em produção, talvez seja melhor encerrar o processo aqui
        if (process.env.NODE_ENV === 'production') {
          process.exit(1);
        }
      }
    }
    ```

## 6.2. Estratégia de Lançamento Controlado (2 dias)

- [ ] **Implementar sistema de acesso antecipado**
  - Criar mecanismo de convites e lista de espera:
    ```typescript
    // src/app/api/early-access/request/route.ts
    import { NextRequest, NextResponse } from 'next/server';
    import { z } from 'zod';
    import { baseRepo } from '@/repositories/baseRepo';
    import { v4 as uuidv4 } from 'uuid';
    import { sendEmail } from '@/lib/email';
    
    // Schema de validação
    const requestSchema = z.object({
      email: z.string().email('Email inválido'),
      name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
      company: z.string().optional(),
      profession: z.string().optional(),
      reason: z.string().optional(),
    });
    
    export async function POST(request: NextRequest) {
      try {
        const body = await request.json();
        
        // Validar dados
        const data = requestSchema.parse(body);
        
        // Verificar se o email já está na lista
        const existingRequests = await baseRepo.query({
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :gsi1pk AND GSI1SK = :gsi1sk',
          ExpressionAttributeValues: {
            ':gsi1pk': 'EARLY_ACCESS',
            ':gsi1sk': `EMAIL#${data.email}`,
          },
        });
        
        if (existingRequests.length > 0) {
          return NextResponse.json(
            { message: 'Este email já está na lista de espera' },
            { status: 200 }
          );
        }
        
        // Criar ID único
        const id = uuidv4();
        const now = new Date().toISOString();
        
        // Salvar solicitação
        await baseRepo.create({
          PK: 'EARLY_ACCESS',
          SK: `REQUEST#${id}`,
          id,
          email: data.email,
          name: data.name,
          company: data.company || '',
          profession: data.profession || '',
          reason: data.reason || '',
          status: 'pending',
          createdAt: now,
          updatedAt: now,
          GSI1PK: 'EARLY_ACCESS',
          GSI1SK: `EMAIL#${data.email}`,
        });
        
        // Enviar email de confirmação
        await sendEmail({
          to: data.email,
          subject: 'Agradecemos seu interesse no AgroCredit AI',
          template: 'early-access-confirmation',
          variables: {
            name: data.name,
            position: data.position || 1000, // Posição estimada
          },
        });
        
        return NextResponse.json(
          { message: 'Solicitação de acesso antecipado recebida com sucesso' },
          { status: 201 }
        );
      } catch (error: any) {
        console.error('Erro ao processar solicitação de acesso antecipado:', error);
        
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { error: 'Dados inválidos', details: error.errors },
            { status: 400 }
          );
        }
        
        return NextResponse.json(
          { error: error.message || 'Erro ao processar solicitação' },
          { status: 500 }
        );
      }
    }
    ```

  - Implementar sistema de convites:
    ```typescript
    // src/app/api/invites/send/route.ts
    import { NextRequest, NextResponse } from 'next/server';
    import { z } from 'zod';
    import { baseRepo } from '@/repositories/baseRepo';
    import { v4 as uuidv4 } from 'uuid';
    import { sendEmail } from '@/lib/email';
    import { getServerSession } from 'next-auth';
    import { authOptions } from '@/lib/auth';
    
    // Schema de validação
    const inviteSchema = z.object({
      email: z.string().email('Email inválido'),
      name: z.string().optional(),
    });
    
    export async function POST(request: NextRequest) {
      try {
        const session = await getServerSession(authOptions);
        
        // Verificar permissões de administrador
        if (!session?.user || session.user.role !== 'admin') {
          return NextResponse.json(
            { error: 'Não autorizado' },
            { status: 401 }
          );
        }
        
        const body = await request.json();
        
        // Validar dados
        const data = inviteSchema.parse(body);
        
        // Gerar código de convite
        const inviteCode = uuidv4();
        const now = new Date().toISOString();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 dias
        
        // Salvar convite
        await baseRepo.create({
          PK: 'INVITE',
          SK: `CODE#${inviteCode}`,
          id: inviteCode,
          email: data.email,
          name: data.name || '',
          status: 'pending',
          createdAt: now,
          updatedAt: now,
          expiresAt,
          createdBy: session.user.id,
          GSI1PK: 'INVITE',
          GSI1SK: `EMAIL#${data.email}`,
        });
        
        // Enviar email com o convite
        await sendEmail({
          to: data.email,
          subject: 'Seu convite exclusivo para o AgroCredit AI',
          template: 'invite',
          variables: {
            name: data.name || 'Profissional',
            inviteCode,
            inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/signup?invite=${inviteCode}`,
            expiresAt: new Date(expiresAt).toLocaleDateString('pt-BR'),
          },
        });
        
        return NextResponse.json(
          { message: 'Convite enviado com sucesso' },
          { status: 200 }
        );
      } catch (error: any) {
        console.error('Erro ao enviar convite:', error);
        
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { error: 'Dados inválidos', details: error.errors },
            { status: 400 }
          );
        }
        
        return NextResponse.json(
          { error: error.message || 'Erro ao enviar convite' },
          { status: 500 }
        );
      }
    }
    ```

- [ ] **Configurar sistema de feedback e suporte**
  - Implementar componente de feedback in-app:
    ```typescript
    // src/components/feedback/FeedbackButton.tsx
    'use client';
    
    import React, { useState } from 'react';
    import { FeedbackModal } from './FeedbackModal';
    import { MessageSquareIcon } from 'lucide-react';
    
    export function FeedbackButton() {
      const [isOpen, setIsOpen] = useState(false);
      
      return (
        <>
          <button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
            aria-label="Enviar feedback"
          >
            <MessageSquareIcon className="h-6 w-6" />
          </button>
          
          <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
      );
    }
    ```

  - Implementar sistema de suporte via chat:
    ```typescript
    // src/app/api/support/route.ts
    import { NextRequest, NextResponse } from 'next/server';
    import { z } from 'zod';
    import { baseRepo } from '@/repositories/baseRepo';
    import { v4 as uuidv4 } from 'uuid';
    import { sendEmail } from '@/lib/email';
    import { getServerSession } from 'next-auth';
    import { authOptions } from '@/lib/auth';
    
    // Schema de validação
    const supportSchema = z.object({
      subject: z.string().min(3, 'Assunto deve ter pelo menos 3 caracteres'),
      message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
      priority: z.enum(['low', 'medium', 'high']).default('medium'),
      category: z.enum(['technical', 'billing', 'feature', 'other']).default('technical'),
    });
    
    export async function POST(request: NextRequest) {
      try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
          return NextResponse.json(
            { error: 'Não autorizado' },
            { status: 401 }
          );
        }
        
        const body = await request.json();
        
        // Validar dados
        const data = supportSchema.parse(body);
        
        // Criar ticket de suporte
        const ticketId = uuidv4();
        const ticketNumber = Math.floor(100000 + Math.random() * 900000); // 6 dígitos
        const now = new Date().toISOString();
        
        await baseRepo.create({
          PK: `TENANT#${session.user.tenantId}`,
          SK: `TICKET#${ticketId}`,
          id: ticketId,
          ticketNumber,
          tenantId: session.user.tenantId,
          userId: session.user.id,
          userEmail: session.user.email,
          userName: session.user.name,
          subject: data.subject,
          message: data.message,
          priority: data.priority,
          category: data.category,
          status: 'open',
          createdAt: now,
          updatedAt: now,
          GSI1PK: 'TICKET',
          GSI1SK: `STATUS#open#${now}`,
        });
        
        // Enviar email para suporte
        await sendEmail({
          to: 'suporte@agrocredit.ai',
          subject: `Novo ticket #${ticketNumber}: ${data.subject}`,
          template: 'new-support-ticket',
          variables: {
            ticketNumber,
            name: session.user.name,
            email: session.user.email,
            subject: data.subject,
            message: data.message,
            priority: data.priority,
            category: data.category,
          },
        });
        
        // Enviar confirmação para o usuário
        await sendEmail({
          to: session.user.email,
          subject: `Seu ticket #${ticketNumber} foi recebido`,
          template: 'support-ticket-confirmation',
          variables: {
            ticketNumber,
            name: session.user.name,
            subject: data.subject,
          },
        });
        
        return NextResponse.json({
          message: 'Ticket de suporte criado com sucesso',
          ticketNumber,
        });
      } catch (error: any) {
        console.error('Erro ao criar ticket de suporte:', error);
        
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { error: 'Dados inválidos', details: error.errors },
            { status: 400 }
          );
        }
        
        return NextResponse.json(
          { error: error.message || 'Erro ao criar ticket de suporte' },
          { status: 500 }
        );
      }
    }
    ```

- [ ] **Implementar sistema de pagamentos**
  - Integrar com Asaas para gestão de assinaturas:
    ```typescript
    // src/lib/asaas/index.ts
    import axios from 'axios';
    import config from '@/config';
    
    const asaasClient = axios.create({
      baseURL: config.asaas.apiUrl,
      headers: {
        'access_token': config.asaas.apiKey,
        'Content-Type': 'application/json',
      },
    });
    
    /**
     * Cria um novo cliente no Asaas
     */
    export async function createCustomer(data: {
      name: string;
      email: string;
      cpfCnpj?: string;
      phone?: string;
    }) {
      try {
        const response = await asaasClient.post('/customers', data);
        return response.data;
      } catch (error: any) {
        console.error('Erro ao criar cliente no Asaas:', error.response?.data || error);
        throw error;
      }
    }
    
    /**
     * Cria uma nova assinatura
     */
    export async function createSubscription(data: {
      customer: string;
      billingType: 'CREDIT_CARD' | 'BOLETO' | 'PIX';
      value: number;
      nextDueDate: string;
      cycle: 'MONTHLY' | 'YEARLY';
      description: string;
      creditCard?: {
        holderName: string;
        number: string;
        expiryMonth: string;
        expiryYear: string;
        ccv: string;
      };
      creditCardHolderInfo?: {
        name: string;
        email: string;
        cpfCnpj: string;
        postalCode: string;
        addressNumber: string;
        phone?: string;
      };
    }) {
      try {
        const response = await asaasClient.post('/subscriptions', data);
        return response.data;
      } catch (error: any) {
        console.error('Erro ao criar assinatura no Asaas:', error.response?.data || error);
        throw error;
      }
    }
    
    /**
     * Cancela uma assinatura
     */
    export async function cancelSubscription(id: string) {
      try {
        const response = await asaasClient.delete(`/subscriptions/${id}`);
        return response.data;
      } catch (error: any) {
        console.error('Erro ao cancelar assinatura no Asaas:', error.response?.data || error);
        throw error;
      }
    }
    ```

## 6.3. Acompanhamento Pós-Lançamento (3 dias)

- [ ] **Implementar sistema de métricas e analytics**
  - Criar dashboard para acompanhamento de métricas-chave:
    - Número de usuários ativos
    - Tempo médio de sessão
    - Número de conversas por usuário
    - Taxa de conversão de trial para assinatura
    - Receita mensal recorrente (MRR)

- [ ] **Configurar sistema de alertas e monitoramento**
  - Implementar alertas para problemas críticos:
    - Erros na aplicação
    - Alta latência nas respostas
    - Falhas nas integrações
    - Problemas com pagamentos

- [ ] **Preparar documentação e materiais de apoio**
  - Criar centro de ajuda e documentação:
    - Guias de uso básico
    - Tutoriais em vídeo
    - FAQ e soluções para problemas comuns
    - Documentação técnica para APIs (se aplicável)

- [ ] **Planejar ciclo de melhorias pós-lançamento**
  - Elaborar roadmap para próximas iterações:
    - Priorização de melhorias com base em feedback
    - Correções e otimizações identificadas
    - Novas funcionalidades planejadas
    - Calendário de atualizações
