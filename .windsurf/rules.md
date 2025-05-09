# Regras de Desenvolvimento para o Trimobe

## Padrões Gerais
- Todo desenvolvimento deve seguir as especificações dos documentos de referência
- Manter consistência com o boilerplate SaaS existente
- Implementar cada fase respeitando os prazos definidos no Plano de Trabalho

## Padrões de Código
- Utilizar TypeScript para toda a implementação
- Seguir o design de tabela única para DynamoDB conforme ModelagemDynamoDB-AgroCredit.md
- Respeitar a estrutura de pastas no S3 conforme ArmazenamentoS3-AgroCredit.md
- Garantir tipagem estrita em todas as interfaces

## Padrões de Interface
- Manter interface conversacional minimalista como foco central
- Todo conteúdo e funcionalidade deve ser acessível via chat
- Upload e download de documentos integrados diretamente no chat
- Design responsivo para acesso em diferentes dispositivos

## Integração com IA
- Utilizar AWS Bedrock conforme descrito na arquitetura
- Implementar sistema RAG com Pinecone como base de conhecimento
- Criar prompt de sistema especializado em crédito rural
- Garantir persistência das conversas no DynamoDB

## Segurança e Privacidade
- Implementar isolamento de dados por tenant
- Seguir práticas de segurança para armazenamento de credenciais
- Garantir conformidade com LGPD
- Assegurar criptografia dos dados sensíveis

## Performance
- Otimizar tempos de resposta da IA (máximo 5 segundos)
- Implementar estratégias de cache quando apropriado
- Monitorar e otimizar consultas ao DynamoDB
- Utilizar classes de armazenamento S3 adequadas ao padrão de acesso

## Idioma
- Todas as respostas e interações devem ser em português brasileiro (pt-BR)
- Interface do usuário completamente em português
- Documentação do código preferencialmente em português

## Análise Prévia
- SEMPRE analisar TODA a estrutura de diretórios, arquivos e dependências do projeto ANTES de executar qualquer proposta de solução
- Preservar funcionalidades existentes e evitar impactos negativos no código já estabelecido
- Manter a integridade do sistema como um todo
