// Tipos para a camada de repositório do DynamoDB

// Tipo base para todos os itens do DynamoDB
export interface DynamoDBItem {
  PK: string;
  SK: string;
  GSI1PK?: string;
  GSI1SK?: string;
  GSI2PK?: string;
  GSI2SK?: string;
  GSI3PK?: string;
  GSI3SK?: string;
  GSI4PK?: string;
  GSI4SK?: string;
  tenantId: string;
}

// Adicione aqui tipos específicos para entidades no DynamoDB conforme necessário

// Funções auxiliares para conversão entre tipos de domínio e tipos do DynamoDB
// Adicione funções específicas conforme necessário
