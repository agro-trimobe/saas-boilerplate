# Estratégia de Armazenamento S3 para o Trimobe

## Visão Geral
O Trimobe utiliza um único bucket S3 com organização lógica por prefixos para armazenamento de arquivos.

**Nome do Bucket**: `rural-credit-ai-app-files`

## Estrutura Hierárquica

```
rural-credit-ai-app-files/
│
├── tenants/
│   ├── {tenant-id}/
│   │   ├── uploads/           # Arquivos enviados pelos usuários
│   │   ├── generated/         # Documentos gerados pelo sistema
│   │   ├── embeddings/        # Embeddings específicos do tenant
│   │   └── temp/              # Arquivos temporários
│
├── shared/                     # Recursos compartilhados
│   ├── templates/              # Templates de documentos
│   ├── knowledge-base/         # Base de conhecimento
│   └── embeddings/             # Embeddings compartilhados
│
└── system/                     # Arquivos do sistema
    ├── backups/                # Backups periódicos
    ├── logs/                   # Logs de operações
    └── configs/                # Arquivos de configuração
```

## Convenções de Nomenclatura

### Arquivos Enviados por Usuários
**Formato**: `{timestamp}-{uuid}-{nome-original}`

### Arquivos Gerados pelo Sistema
**Formato**: `{tipo-documento}-{tenant-id}-{id}-{timestamp}.{extensão}`

### Arquivos Temporários
**Formato**: `temp-{processo-id}-{timestamp}.{extensão}`

## Políticas de Lifecycle

- Arquivos recentes: S3 Standard (0-30 dias)
- Arquivos intermediários: S3 Standard-IA (31-90 dias)
- Arquivos arquivados: S3 Glacier (>90 dias)
- Arquivos temporários: Exclusão após 7 dias
