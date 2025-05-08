# Documentação de Componentes Reutilizáveis

Este documento apresenta os componentes reutilizáveis disponíveis no projeto SaaS Boilerplate, com exemplos de uso e instruções para implementação.

## Índice

1. [Componentes de UI](#componentes-de-ui)
   - [Button](#button)
   - [Card](#card)
   - [Input](#input)
   - [Dialog](#dialog)
   - [Alert](#alert)
   - [Outros Componentes de UI](#outros-componentes-de-ui)
2. [Componentes de Assinatura](#componentes-de-assinatura)
   - [PlanCard](#plancard)
   - [PaymentForm](#paymentform)
   - [SubscriptionLayout](#subscriptionlayout)

---

## Componentes de UI

Os componentes de UI são baseados na biblioteca [shadcn/ui](https://ui.shadcn.com/) com personalizações para o SaaS Boilerplate. Estes componentes estão localizados na pasta `src/components/ui/`.

### Button

Botão versátil com várias variantes e tamanhos.

#### Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `variant` | `"default" \| "destructive" \| "outline" \| "secondary" \| "ghost" \| "link"` | `"default"` | Estilo visual do botão |
| `size` | `"default" \| "sm" \| "lg" \| "icon"` | `"default"` | Tamanho do botão |
| `asChild` | `boolean` | `false` | Renderiza o componente como seu filho |

#### Exemplo de Uso

```tsx
import { Button } from "@/components/ui/button";

// Botão padrão
<Button>Clique Aqui</Button>

// Botão com variante
<Button variant="destructive">Excluir</Button>

// Botão de outro tamanho
<Button size="lg">Botão Grande</Button>

// Botão com ícone
<Button>
  <PlusIcon />
  Adicionar Item
</Button>
```

### Card

Componente de cartão para exibir conteúdo em um container visualmente delimitado.

#### Subcomponentes

- `Card` - Container principal
- `CardHeader` - Cabeçalho do cartão
- `CardTitle` - Título do cartão
- `CardDescription` - Descrição/subtítulo do cartão
- `CardContent` - Conteúdo principal do cartão
- `CardFooter` - Rodapé do cartão

#### Exemplo de Uso

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

<Card>
  <CardHeader>
    <CardTitle>Título do Cartão</CardTitle>
    <CardDescription>Descrição opcional do cartão</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Conteúdo principal vai aqui...</p>
  </CardContent>
  <CardFooter>
    <Button>Ação Principal</Button>
  </CardFooter>
</Card>
```

### Input

Campo de entrada de texto simples.

#### Propriedades

Todas as propriedades de um input HTML padrão são suportadas.

#### Exemplo de Uso

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="seu-email@exemplo.com"
  />
</div>
```

### Dialog

Modal de diálogo para confirmações ou formulários.

#### Subcomponentes

- `Dialog` - Container principal
- `DialogTrigger` - Elemento que ativa o diálogo
- `DialogContent` - Conteúdo do diálogo
- `DialogHeader` - Cabeçalho do diálogo
- `DialogTitle` - Título do diálogo
- `DialogDescription` - Descrição do diálogo
- `DialogFooter` - Rodapé com botões de ação
- `DialogClose` - Botão para fechar o diálogo

#### Exemplo de Uso

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Diálogo</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirmar Ação</DialogTitle>
      <DialogDescription>
        Esta ação não pode ser desfeita. Deseja continuar?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancelar</Button>
      </DialogClose>
      <Button onClick={() => console.log("Confirmado!")}>
        Confirmar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Alert

Componente para mostrar mensagens de alerta ou notificações.

#### Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `variant` | `"default" \| "destructive"` | `"default"` | Estilo visual do alerta |

#### Subcomponentes

- `Alert` - Container principal
- `AlertTitle` - Título do alerta
- `AlertDescription` - Conteúdo descritivo do alerta

#### Exemplo de Uso

```tsx
import {
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

<Alert>
  <InfoIcon className="h-4 w-4" />
  <AlertTitle>Informação</AlertTitle>
  <AlertDescription>
    Sua assinatura será renovada em 14 dias.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Erro</AlertTitle>
  <AlertDescription>
    Ocorreu um problema ao processar seu pagamento.
  </AlertDescription>
</Alert>
```

### Outros Componentes de UI

Outros componentes disponíveis incluem:

- `Accordion` - Lista expansível
- `Avatar` - Representação visual de usuário
- `Badge` - Rótulo/etiqueta pequena
- `Calendar` / `DatePicker` - Seletor de data 
- `Dropdown` - Menu suspenso
- `Tabs` - Navegação em abas
- `Toast` - Notificação temporária
- `Tooltip` - Dica de contexto flutuante

---

## Componentes de Assinatura

Componentes específicos para o fluxo de assinatura, localizados em `src/components/subscription/`.

### PlanCard

Cartão para exibir informações de um plano de assinatura.

#### Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `title` | `string` | - | Título do plano |
| `description` | `string` | - | Descrição curta do plano |
| `price` | `number` | - | Preço mensal do plano |
| `features` | `Array<{text: string, highlighted?: boolean, disabled?: boolean}>` | - | Lista de recursos do plano |
| `plan` | `"BASIC" \| "PREMIUM"` | - | Identificador do plano |
| `recommended` | `boolean` | `false` | Define se é o plano recomendado |
| `onSelect` | `(plan: "BASIC" \| "PREMIUM") => void` | - | Função chamada ao selecionar o plano |

#### Exemplo de Uso

```tsx
import { PlanCard } from "@/components/subscription/plan-card";

<PlanCard
  title="Plano Básico"
  description="Perfeito para iniciantes"
  price={57}
  plan="BASIC"
  features={[
    { text: "Até 5 usuários" },
    { text: "1GB de armazenamento", highlighted: true },
    { text: "Suporte básico por email" },
    { text: "Recursos avançados", disabled: true }
  ]}
  onSelect={(plan) => console.log(`Plano selecionado: ${plan}`)}
/>

<PlanCard
  title="Plano Premium"
  description="Para empresas em crescimento"
  price={87}
  plan="PREMIUM"
  recommended={true}
  features={[
    { text: "Até 20 usuários" },
    { text: "10GB de armazenamento", highlighted: true },
    { text: "Suporte prioritário 24/7" },
    { text: "Recursos avançados" }
  ]}
  onSelect={(plan) => console.log(`Plano selecionado: ${plan}`)}
/>
```

### PaymentForm

Formulário de pagamento para processar assinaturas via Asaas.

#### Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `plan` | `"BASIC" \| "PREMIUM"` | - | Plano selecionado |
| `price` | `number` | - | Preço do plano |
| `onSuccess` | `(data: any) => void` | - | Callback chamado após pagamento bem-sucedido |
| `onCancel` | `() => void` | - | Callback chamado quando o usuário cancela |

#### Exemplo de Uso

```tsx
import { PaymentForm } from "@/components/subscription/payment-form";
import { useState } from "react";

function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<"BASIC" | "PREMIUM" | null>(null);
  
  return (
    <div>
      {/* Seleção de plano aqui */}
      
      {selectedPlan && (
        <PaymentForm
          plan={selectedPlan}
          price={selectedPlan === "BASIC" ? 57 : 87}
          onSuccess={(data) => {
            console.log("Pagamento processado:", data);
            // Redirecionar para página de sucesso
          }}
          onCancel={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}
```

### SubscriptionLayout

Layout para páginas relacionadas a assinaturas, com cabeçalho e navegação consistentes.

#### Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `children` | `React.ReactNode` | - | Conteúdo da página |
| `title` | `string` | - | Título principal |
| `description` | `string` | - | Descrição/subtítulo |
| `showNavigation` | `boolean` | `true` | Exibe a navegação de passos |
| `currentStep` | `number` | `1` | Passo atual no fluxo |

#### Exemplo de Uso

```tsx
import { SubscriptionLayout } from "@/components/subscription/subscription-layout";

function PlansPage() {
  return (
    <SubscriptionLayout
      title="Escolha seu plano"
      description="Selecione o plano que melhor atende às suas necessidades"
      currentStep={1}
    >
      {/* Conteúdo da página aqui */}
    </SubscriptionLayout>
  );
}

function PaymentPage() {
  return (
    <SubscriptionLayout
      title="Informações de pagamento"
      description="Preencha os dados para completar sua assinatura"
      currentStep={2}
    >
      {/* Formulário de pagamento aqui */}
    </SubscriptionLayout>
  );
}
```

---

## Boas Práticas

1. **Consistência Visual**: Use componentes do mesmo sistema de design para manter a consistência visual.
   
2. **Acessibilidade**: Mantenha os atributos apropriados de acessibilidade, como `aria-label` para elementos interativos.

3. **Responsividade**: Teste os componentes em diferentes tamanhos de tela.

4. **Estado de Carregamento**: Adicione estados de carregamento (loading) para ações que fazem chamadas assíncronas.

```tsx
<Button disabled={isLoading}>
  {isLoading ? "Processando..." : "Enviar"}
</Button>
```

5. **Erros e Validação**: Forneça feedback visual claro para erros de validação.

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    className={hasError ? "border-red-500" : ""}
  />
  {hasError && (
    <p className="text-red-500 text-sm">Email inválido</p>
  )}
</div>
```

## Extensão e Personalização

Para personalizar temas e aparência dos componentes, modifique os arquivos de configuração Tailwind:

- `tailwind.config.js` - Configurações gerais do Tailwind
- `globals.css` - Definições CSS globais e variáveis de tema

Para criar novos componentes, siga o padrão estabelecido nos componentes existentes, mantendo a mesma estrutura e estilo de código.
