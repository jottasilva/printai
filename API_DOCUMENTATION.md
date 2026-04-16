# PrintAI ERP - Documentao Completa da API e do Sistema

## Viso Geral

O PrintAI ERP um sistema SaaS B2B multi-tenant para grficas e empresas de impresso, construdo com:

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: Supabase Auth (SSR)
- **Estilo**: Tailwind CSS com tema dark/light
- **Validao**: Zod

---

## ndice

1. [Autenticao](#autenticao)
2. [Server Actions (API)](#server-actions-api)
3. [Modelos do Banco de Dados](#modelos-do-banco-de-dados)
4. [Rotas da Aplicao](#rotas-da-aplicao)
5. [Middleware e Segurana](#middleware-e-segurana)
6. [Configurao e Deploy](#configurao-e-deploy)

---

## Autenticao

### Fluxo de Autenticao

O sistema usa **Supabase Auth** com integrao ao banco de dados via Prisma.

```
Usuario -> Supabase Auth (email/senha) -> JWT Token -> Cookie -> Middleware -> Server Action -> Prisma -> Database
```

### Registro de Usuario

**Rota**: `POST /register`  
**Server Action**: Integrada na pgina de registro

```typescript
// Exemplo de uso
const { data, error } = await supabase.auth.signUp({
  email: 'usuario@empresa.com',
  password: 'senha-segura-123',
  options: {
    data: {
      name: 'Nome do Usuario',
      company_name: 'Nome da Empresa',
    }
  }
})
```

**Validaes**:
- Nome obrigatrio
- Email vlido e nico
- Senha mnimo 8 caracteres
- Nome da empresa obrigatrio

### Login

**Rota**: `POST /login`

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@empresa.com',
  password: 'senha-segura-123',
})
```

### Logout

```typescript
await supabase.auth.signOut()
```

---

## Server Actions (API)

### Dashboard

Arquivo: `src/app/actions/dashboard.ts`

#### `getDashboardData()`

Retorna dados completos do dashboard.

**Retorno**:
```typescript
{
  userEmail: string,
  userRole: string,
  stats: {
    activeProducts: number,
    pendingOrders: number,
    inProduction: number,
    ordersThisMonth: number,
    completedWeek: number,
    totalCustomers: number,
    totalRevenue: number,
    pendingReceivables: number,
    pendingPayables: number,
  },
  ordersByStatus: Record<string, number>,
  productionByStatus: Record<string, number>,
  topProducts: Array<{ product: string, sku: string, quantity: number }>,
  recentOrders: Array<Order>,
  recentActivity: Array<{ description: string, createdAt: Date }>,
}
```

**Erro**: Lanca erro se usurio no autenticado ou sem perfil.

---

### Produtos

Arquivo: `src/app/actions/products.ts`

#### `getProducts(search?: string, category?: string)`

Lista produtos do tenant com filtros opcionais.

**Parmetros**:
- `search`: Busca por nome, SKU ou descrio (case insensitive)
- `category`: Filtra por categoria

**Retorno**: `Array<Product>` com variants, category e inventory includos.

#### `createProduct(formData: ProductFormData)`

Cria novo produto com validao completa.

**Dados de entrada**:
```typescript
{
  name: string,           // Min 3 chars
  sku: string,            // Obrigatrio
  description?: string,
  type: 'SIMPLE' | 'VARIABLE' | 'SERVICE' | 'BUNDLE',
  categoryId?: string,
  basePrice: number,      // Min 0
  costPrice?: number,     // Min 0
  minStock?: number,      // Opcional
  variants?: Array<{
    name: string,
    sku: string,
    attributes?: Record<string, string>,
    price: number,
  }>
}
```

**Retorno**: `Product` criado com variantes e categoria.

#### `updateProduct(id: string, formData: ProductFormData)`

Atualiza produto existente.

**Retorno**: `Product` atualizado.  
**Erro**: "Product not found" se no existir ou no pertencer ao tenant.

#### `deleteProduct(id: string)`

Soft delete de produto (seta `deletedAt`).

**Retorno**: `void`

#### `getProductById(id: string)`

Busca produto especfico com todos os relacionamentos.

**Retorno**: `Product | null`

---

### Produo

Arquivo: `src/app/actions/production.ts`

#### `getProductionItems(statusFilter?: string)`

Lista itens de produo do tenant.

**Parmetros**:
- `statusFilter`: Filtra por status especfico (ex: 'PENDING', 'IN_PROGRESS')

**Retorno**: `Array<OrderItem>` com product, variant, order+customer, assignedUser.

#### `updateProductionStatus(id: string, status: OrderItemStatus)`

Atualiza status do item de produo.

**Status Vlidos**:
- `PENDING` - Aguardando
- `QUEUED` - Na fila
- `IN_PROGRESS` - Em progresso
- `PAUSED` - Pausado
- `DONE` - Concludo
- `CANCELED` - Cancelado
- `REJECTED` - Rejeitado

**Efeitos colaterais**:
- IN_PROGRESS: seta `startedAt`
- PAUSED: seta `pausedAt`  
- DONE: seta `finishedAt`
- Cria log de auditoria automaticamente

**Retorno**: `void`

#### `updateItemNote(id: string, note: string)`

Atualiza nota de produo.

**Retorno**: `void`

#### `assignUserToItem(id: string, assignedUserId: string | null)`

Atribui/desatribui usurio ao item.

**Retorno**: `void`

#### `updateItemPriority(id: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')`

Atualiza prioridade do item.

**Retorno**: `void`

---

## Modelos do Banco de Dados

### Principais Modelos

O sistema possui 30 modelos no total. Abaixo esto os principais:

#### Tenant
```prisma
id              UUID @default(uuid()) @id
slug            String @unique
name            String
plan            Plan @default(PROFESSIONAL)
status          TenantStatus @default(ACTIVE)
maxUsers        Int @default(10)
maxStorage      Int @default(5368709120) // 5GB
trialEndsAt     DateTime?
subscriptionId  String? @unique
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt
deletedAt       DateTime?
```

#### User
```prisma
id                  UUID @id // Vem do Supabase Auth
tenantId            UUID
email               String
name                String
role                UserRole @default(OPERATOR)
permissions         String[]
avatarUrl           String?
twoFactorEnabled    Boolean @default(false)
refreshToken        String?
emailVerified       DateTime?
```

#### Product
```prisma
id          UUID @default(uuid()) @id
tenantId    UUID
sku         String
name        String
description String?
type        ProductType @default(SIMPLE)
basePrice   Decimal @default(0)
costPrice   Decimal @default(0)
isActive    Boolean @default(true)
deletedAt   DateTime?
categoryId  UUID?
searchVector String? @db.Text
```

#### Order
```prisma
id                  UUID @default(uuid()) @id
tenantId            UUID
customerId          UUID
userId              UUID
quoteId             UUID?
number              String @unique
status              OrderStatus @default(DRAFT)
paymentStatus       PaymentStatus @default(PENDING)
productionStatus    ProductionStatus @default(WAITING)
subtotal            Decimal @default(0)
discountAmount      Decimal @default(0)
taxAmount           Decimal @default(0)
shippingAmount      Decimal @default(0)
total               Decimal @default(0)
paidAmount          Decimal @default(0)
remainingAmount     Decimal @default(0)
notes               String?
expectedDeliveryAt  DateTime?
```

#### OrderItem
```prisma
id                  UUID @default(uuid()) @id
tenantId            UUID
orderId             UUID
productId           UUID
variantId           UUID?
quantity            Int
unitPrice           Decimal
total               Decimal
status              OrderItemStatus @default(PENDING)
priority            Priority @default(MEDIUM)
assignedUserId      UUID?
dueDate             DateTime?
startedAt           DateTime?
finishedAt          DateTime?
pausedAt            DateTime?
productionNotes     String?
slaBreached         Boolean @default(false)
```

---

## Rotas da Aplicao

### Rotas Pblicas

| Rota | Descrio |
|------|---------|
| `/` | Landing page |
| `/login` | Pgina de login |
| `/register` | Pgina de registro |

### Rotas Protegidas

| Rota | Descrio |
|------|---------|
| `/admin` | Dashboard principal |
| `/pedidos` | Lista de pedidos |
| `/pedidos/[id]` | Detalhes do pedido |
| `/producao` | Kanban de produo |
| `/produtos` | Catlogo de produtos |
| `/clientes` | Gesto de clientes |
| `/orcamentos` | Gesto de oramentos |
| `/estoque` | Controle de estoque |
| `/financeiro` | Gesto financeira |
| `/conversas` | Conversas com IA |
| `/relatorios` | Relatrios e BI |

---

## Middleware e Segurana

### Configurao do Middleware

Arquivo: `src/middleware.ts`

**Rotas Pblicas**:
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

**Rotas Protegidas**:
- `/admin`
- `/pedidos`
- `/producao`
- `/produtos`
- `/clientes`
- `/estoque`
- `/financeiro`
- `/conversas`
- `/relatorios`
- `/orcamentos`
- `/dashboard`

### Comportamento

1. Se usurio logado tenta acessar `/login` -> redireciona para `/admin`
2. Se usurio no logado tenta acessar rota protegida -> redireciona para `/login?redirect=<path>`
3. Rotas no listadas so pblicas por padro
4. Static assets so ignorados (`/_next`, `/favicon.ico`, imagens)

---

## Configurao e Deploy

### Variveis de Ambiente Necessrias

Crie um arquivo `.env.local` baseado em `.env.example`:

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/printai_erp?schema=public"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anon-aqui"

# URL do site
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### Setup do Banco de Dados

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migraes
npx prisma migrate dev

# Popular dados de exemplo (opcional)
npx prisma db seed
```

### Desenvolvimento

```bash
npm run dev
```

### Build para Produo

```bash
npm run build
npm start
```

---

## Status Codes e Tratamento de Erros

### Server Actions

Todas as server actions usam o padro:

```typescript
// Sucesso
return data

// Erro
throw new Error('Mensagem do erro')
```

### Erros Comuns

| Erro | Causa |
|------|-------|
| `Unauthorized: User not authenticated` | Sesso expirada ou no logado |
| `Profile not found` | Usurio existe no Supabase mas no no banco |
| `Tenant not found` | Usurio no tem tenant associado |
| `Product not found` | Produto no existe ou no pertence ao tenant |

---

## Exemplos de Uso

### Criando um Produto

```typescript
'use client'

import { createProduct } from '@/app/actions/products'

async function handleSubmit(formData: FormData) {
  try {
    const product = await createProduct({
      name: 'Carto de Visita',
      sku: 'CV-001',
      basePrice: 89.90,
      costPrice: 45.00,
      type: 'SIMPLE',
      minStock: 100,
    })
    console.log('Produto criado:', product)
  } catch (error) {
    console.error('Erro:', error.message)
  }
}
```

### Atualizando Status de Produo

```typescript
import { updateProductionStatus } from '@/app/actions/production'

async function moveToNext(itemId: string) {
  await updateProductionStatus(itemId, 'IN_PROGRESS')
  // UI atualizada automaticamente via revalidatePath
}
```

### Obtendo Dados do Dashboard

```typescript
import { getDashboardData } from '@/app/actions/dashboard'

// Em Server Component
export default async function DashboardPage() {
  const data = await getDashboardData()
  return <div>Receita total: {data.stats.totalRevenue}</div>
}
```

---

*ltima atualizao: Abril 2026*
