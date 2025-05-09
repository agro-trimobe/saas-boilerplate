# Estratégia de Armazenamento S3 para o Trimobe

Este documento detalha a arquitetura de armazenamento no Amazon S3 para o Trimobe, projetada para complementar a modelagem de dados do DynamoDB e atender aos requisitos de um sistema multi-tenant para gestão de crédito rural.

## 1. Visão Geral da Estrutura

### Estratégia de Bucket Único

O Trimobe utilizará um único bucket S3 com organização lógica por prefixos, garantindo:

- **Isolamento de dados por tenant**
- **Classificação clara por tipo de conteúdo**
- **Facilidade de gerenciamento**
- **Otimização de custos**

**Nome do Bucket**: `rural-credit-ai-app-files`

## 2. Estrutura Hierárquica de Diretórios

```
rural-credit-ai-app-files/
│
├── tenants/
│   ├── {tenant-id-1}/
│   │   ├── uploads/               # Arquivos enviados pelos usuários
│   │   │   ├── conversations/     # Arquivos vinculados a conversas
│   │   │   │   ├── {conversation-id}/
│   │   │   │   │   ├── {message-id}/
│   │   │   │   │   │   └── {arquivo-original}
│   │   │   ├── documents/         # Documentos de clientes enviados para análise
│   │   │   │   ├── {YYYY-MM-DD}/
│   │   │   │   │   └── {documento-original}
│   │   │
│   │   ├── generated/             # Documentos gerados pelo sistema
│   │   │   ├── contracts/         # Contratos gerados
│   │   │   │   ├── {YYYY-MM-DD}/
│   │   │   │   │   └── contrato-{id}.pdf
│   │   │   ├── simulations/       # Planilhas e relatórios de simulação financeira
│   │   │   │   ├── {YYYY-MM-DD}/
│   │   │   │   │   └── simulacao-{id}.xlsx
│   │   │   ├── reports/           # Relatórios de análise
│   │   │   │   ├── {YYYY-MM-DD}/
│   │   │   │   │   └── relatorio-{id}.pdf
│   │   │
│   │   ├── embeddings/            # Arquivos de embeddings específicos do tenant
│   │   │   └── {tipo-embedding}/
│   │   │       └── embedding-{id}.json
│   │   │
│   │   └── temp/                  # Arquivos temporários em processamento (com TTL)
│   │       └── {processo-id}/
│   │           └── {arquivo-temp}
│   │
│   ├── {tenant-id-2}/
│   │   └── ...
│
├── shared/                         # Recursos compartilhados entre todos os tenants
│   ├── templates/                  # Templates de documentos
│   │   ├── contracts/             # Templates de contratos
│   │   │   ├── banco-do-brasil/
│   │   │   ├── bndes/
│   │   │   └── ...
│   │   └── reports/               # Templates de relatórios
│   │       └── ...
│   │
│   ├── knowledge-base/            # Base de conhecimento comum
│   │   ├── legislation/           # Documentação legal
│   │   │   └── mcr/               # Manual de Crédito Rural
│   │   ├── banks/                 # Documentação de bancos
│   │   └── tutorials/             # Tutoriais
│   │
│   └── embeddings/                # Embeddings compartilhados
│       ├── legislation/           # Embeddings de legislações
│       └── banks/                 # Embeddings de documentos bancários
│
└── system/                        # Arquivos do sistema
    ├── backups/                   # Backups periódicos
    ├── logs/                      # Logs de operações
    └── configs/                   # Arquivos de configuração
```

## 3. Convenções de Nomenclatura

### 3.1 Padrões de Nomeação

#### Arquivos Enviados por Usuários
**Formato**: `{timestamp}-{uuid}-{nome-original}`
**Exemplo**: `20250508181522-f47ac10b-58cc-4372-a567-0e02b2c3d479-laudo-tecnico.pdf`

#### Arquivos Gerados pelo Sistema
**Formato**: `{tipo-documento}-{tenant-id}-{id}-{timestamp}.{extensão}`
**Exemplo**: `contrato-pronaf-t123-a567b890-20250508.pdf`

#### Arquivos Temporários
**Formato**: `temp-{processo-id}-{timestamp}.{extensão}`
**Exemplo**: `temp-doc-processing-f47ac10b-20250508181522.tmp`

### 3.2 Justificativa das Convenções

- **Inclusão de timestamp**: Facilita ordenação cronológica e diagnóstico
- **UUID**: Garante unicidade dos nomes de arquivo
- **Prefixos por tipo**: Facilita identificação visual e filtragem
- **Informações de contexto**: Permite rastreabilidade sem consulta ao banco de dados

## 4. Alinhamento com DynamoDB

### 4.1 Mapeamento entre Entidades DynamoDB e Caminhos S3

#### Entidade `Files` (Arquivos enviados por usuários)
```javascript
// DynamoDB
{
  PK: "TENANT#t123",
  SK: "FILE#f456",
  tenantId: "t123",
  conversationId: "c789",
  messageId: "m101",
  name: "laudo-tecnico.pdf",
  type: "application/pdf",
  size: 1024567,
  s3Key: "tenants/t123/uploads/conversations/c789/m101/20250508-uuid-laudo-tecnico.pdf",
  status: "READY",
  createdAt: "2025-05-08T18:15:22Z"
}

// Caminho S3 correspondente
rural-credit-ai-app-files/tenants/t123/uploads/conversations/c789/m101/20250508-uuid-laudo-tecnico.pdf
```

#### Entidade `Documents` (Documentos gerados pelo sistema)
```javascript
// DynamoDB
{
  PK: "TENANT#t123",
  SK: "DOCUMENT#d202",
  tenantId: "t123",
  conversationId: "c789",
  type: "CONTRACT",
  title: "Contrato PRONAF",
  s3Key: "tenants/t123/generated/contracts/2025-05-08/contrato-pronaf-t123-d202-20250508.pdf",
  createdAt: "2025-05-08T18:30:45Z"
}

// Caminho S3 correspondente
rural-credit-ai-app-files/tenants/t123/generated/contracts/2025-05-08/contrato-pronaf-t123-d202-20250508.pdf
```

### 4.2 Benefícios do Alinhamento

1. **Consistência de acesso**: Os caminhos S3 derivam diretamente dos atributos armazenados no DynamoDB
2. **Operações atômicas**: Registro no DynamoDB e armazenamento no S3 podem ser tratados como uma unidade lógica
3. **Rastreabilidade bidirecional**: Fácil navegação entre registros de banco de dados e arquivos
4. **Isolamento por tenant**: Mesma estratégia aplicada a ambos os sistemas

## 5. Políticas de Armazenamento e Lifecycle

### 5.1 Classes de Armazenamento

| Tipo de Conteúdo | Classe de Armazenamento | Período de Transição |
|------------------|-------------------------|----------------------|
| Arquivos recentes | S3 Standard | 0-30 dias |
| Arquivos intermediários | S3 Standard-IA | 31-90 dias |
| Arquivos arquivados | S3 Glacier | >90 dias |
| Templates e conhecimento | S3 Standard-IA | Permanente |
| Arquivos temporários | S3 Standard | 7 dias (depois, exclusão) |

### 5.2 Regras de Lifecycle

```json
{
  "Rules": [
    {
      "ID": "MoveToStandardIA",
      "Status": "Enabled",
      "Prefix": "tenants/",
      "Transition": {
        "Days": 30,
        "StorageClass": "STANDARD_IA"
      }
    },
    {
      "ID": "MoveToGlacier",
      "Status": "Enabled",
      "Prefix": "tenants/",
      "Transition": {
        "Days": 90,
        "StorageClass": "GLACIER"
      }
    },
    {
      "ID": "DeleteTempFiles",
      "Status": "Enabled",
      "Prefix": "tenants/*/temp/",
      "Expiration": {
        "Days": 7
      }
    }
  ]
}
```

## 6. Segurança e Controle de Acesso

### 6.1 Estratégia de Criptografia

- **Criptografia em repouso**: SSE-S3 (padrão) ou SSE-KMS (para dados sensíveis)
- **Criptografia em trânsito**: TLS 1.2 ou superior

### 6.2 Políticas de Acesso

#### Política de Isolamento por Tenant
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::rural-credit-ai-app-files/tenants/${tenant-id}/*",
      "Condition": {
        "StringEquals": {
          "aws:userid": "${aws:userid}"
        }
      }
    }
  ]
}
```

### 6.3 Acesso Temporário via URLs Pré-assinados

```javascript
// Exemplo de geração de URL de upload
const params = {
  Bucket: 'agrocredit-files',
  Key: `tenants/${tenantId}/uploads/conversations/${conversationId}/${messageId}/${filename}`,
  Expires: 900, // 15 minutos
  ContentType: mimeType,
  Metadata: {
    'tenant-id': tenantId,
    'user-id': userId,
    'conversation-id': conversationId
  }
};

const url = s3.getSignedUrl('putObject', params);
```

```javascript
// Exemplo de geração de URL de download
const params = {
  Bucket: 'agrocredit-files',
  Key: s3Key, // Obtido do registro do DynamoDB
  Expires: 3600, // 1 hora
  ResponseContentDisposition: `attachment; filename="${originalFilename}"`
};

const url = s3.getSignedUrl('getObject', params);
```

## 7. Metadados e Categorização

### 7.1 Metadados Padrão

Cada arquivo terá metadados estruturados:

```javascript
const metadata = {
  'x-amz-meta-tenant-id': tenantId,
  'x-amz-meta-user-id': userId,
  'x-amz-meta-conversation-id': conversationId || 'none',
  'x-amz-meta-content-type': mimeType,
  'x-amz-meta-original-name': originalFilename,
  'x-amz-meta-creation-date': new Date().toISOString()
};
```

### 7.2 Sistema de Tags

```javascript
const tags = {
  TenantId: tenantId,
  Environment: process.env.NODE_ENV,
  Classification: classificationType, // public, confidential, restricted
  RetentionPolicy: retentionType // standard, extended, permanent
};
```

## 8. Monitoramento e Otimização

### 8.1 Métricas de Armazenamento

- **Por tenant**: Monitoramento de espaço usado por cada tenant
- **Por categoria**: Tracking de volume por tipo de arquivo
- **Tendências de crescimento**: Previsão de necessidades futuras

### 8.2 Configuração de Alertas

```javascript
// Exemplo de configuração de alerta CloudWatch
{
  "AlarmName": "TenantStorageExceeded",
  "AlarmDescription": "Alert when tenant exceeds storage quota",
  "MetricName": "BucketSizeBytes",
  "Namespace": "AWS/S3",
  "Dimensions": [
    {
      "Name": "BucketName",
      "Value": "agrocredit-files"
    },
    {
      "Name": "StorageType",
      "Value": "StandardStorage"
    }
  ],
  "Period": 86400,
  "Threshold": tenantQuotaInBytes,
  "ComparisonOperator": "GreaterThanThreshold"
}
```

## 9. Implementação de Upload e Download

### 9.1 Fluxo de Upload de Arquivos

1. **Preparação**:
   - Gerar UUID para o arquivo
   - Definir caminho S3 conforme convenções
   - Criar registro no DynamoDB com status "UPLOADING"

2. **Upload**:
   - Gerar URL pré-assinado com metadados e tags
   - Cliente faz upload direto para S3
   - Sistema confirma upload bem-sucedido

3. **Pós-processamento**:
   - Atualizar status no DynamoDB para "PROCESSING"
   - Executar análises necessárias
   - Atualizar status para "READY" quando concluído

### 9.2 Fluxo de Download de Arquivos

1. **Verificação de permissões**:
   - Confirmar acesso do usuário ao tenant
   - Verificar permissão para o arquivo específico

2. **Geração de acesso**:
   - Recuperar s3Key do registro no DynamoDB
   - Gerar URL pré-assinado para download
   - Configurar cabeçalhos para download apropriado

3. **Registro de atividade**:
   - Registrar download para fins de auditoria

## 10. Evolução e Escalabilidade

### 10.1 Considerações para Crescimento

- **Particionamento de bucket**: Se necessário, considerar múltiplos buckets por região
- **Replicação cross-region**: Para melhorar velocidade de acesso e redundância
- **Otimização de custos**: Análise periódica de padrões de acesso para ajuste de classes de armazenamento

### 10.2 Adaptação para Regulamentações

- Estrutura flexível para acomodar requisitos específicos por país ou setor
- Capacidade de implementar políticas de retenção conforme normativos do setor financeiro
- Separação lógica possibilita isolamento para atender a requisitos específicos

## Conclusão

A estratégia de armazenamento S3 para o AgroCredit AI foi projetada para complementar a modelagem de dados no DynamoDB, formando uma arquitetura coesa, escalável e segura. O alinhamento entre as estruturas de armazenamento e banco de dados facilita o desenvolvimento, manutenção e evolução do sistema, garantindo uma experiência fluida para os usuários e eficiência operacional.

Esta arquitetura suporta plenamente os requisitos do PRD, com foco especial em:
- Interface conversacional com upload e download de arquivos
- Geração e compartilhamento de documentos
- Análise inteligente de arquivos
- Armazenamento organizado por conversas

A implementação seguindo estas diretrizes garantirá integridade dos dados, isolamento entre tenants e otimização de custos desde o início do projeto.
