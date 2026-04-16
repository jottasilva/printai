# PrintAI ERP - Especificação Técnica Completa (SPEC)

## Visão Geral do Projeto

**PrintAI ERP** é um sistema SaaS B2B multi-tenant para gestão de gráficas e empresas de impressão.

### Stack Tecnológica
- **Framework**: Next.js 14.2.1 (App Router)
- **Linguagem**: TypeScript 5 (strict mode)
- **UI**: React 18 + Framer Motion
- **Estilização**: Tailwind CSS 3.4 + CSS Variables
- **Banco de Dados**: PostgreSQL + Prisma ORM 5
- **Autenticação**: Supabase Auth (SSR)
- **Icons**: Lucide React
- **Componentes UI**: Radix UI + CVA (class-variance-authority)

### Arquitetura
- **Multi-tenant**: Todos os dados isolados por `tenantId` (UUID)
- **Server Components**: Dados buscados via Prisma em Server Components
- **Client Components**: Estado global via Context Providers (Auth, Tenant, Theme)
- **Middleware**: Proteção de rotas via Supabase SSR no edge
- **Design System**: Componentes reutilizáveis com variants e composições

---

## Estrutura de Módulos

### 1. Módulo de Autenticação e Usuários
**Status**: ✅ Implementado (Parcial - requer registro e recuperação de senha)

**Componentes**:
- `/login/page.tsx` - Formulário de login com Supabase Auth
- `src/contexts/auth-context.tsx` - Gerencia estado de autenticação
- `src/middleware.ts` - Proteção de rotas e redirecionamentos

**Funcionalidades Implementadas**:
- Login com email e senha via Supabase
- Persistência de sessão com cookies SSR
- Proteção de rotas protegidas
- Redirecionamento automático pós-login

**Funcionalidades Pendentes**:
- Registro de novos usuários
- Recuperação de senha (forgot/reset password)
- Verificação de email
- Autenticação em dois fatores (2FA)
- Gestão de perfis e permissões

**Models do Schema**:
- `Tenant` - Empresas/organizações
- `User` - Usuários do sistema

---

### 2. Módulo de CRM (Clientes e Fornecedores)
**Status**: ❌ Não Implementado

**Models do Schema**:
- `Customer` - Clientes com dados fiscais e de contato
- `Address` - Endereços múltiplos por cliente
- `Supplier` - Fornecedores

**Funcionalidades a Implementar**:
- CRUD completo de clientes
- Gestão de endereços (billing, shipping)
- Cadastro de fornecedores
- Busca e filtros por documento (CPF/CNPJ)
- Histórico de compras por cliente
- Importação/exportação de contatos

---

### 3. Módulo de Catálogo e Produtos
**Status**: ⚠️ Parcialmente Implementado (Listagem básica)

**Componentes**:
- `/produtos/page.tsx` - Listagem de produtos

**Models do Schema**:
- `Category` - Categorias de produtos
- `Product` - Produtos com tipos (SIMPLE, VARIABLE, SERVICE, BUNDLE)
- `ProductVariant` - Variações de produtos (cor, tamanho, etc)
- `SupplierProduct` - Produtos de fornecedores vinculados

**Funcionalidades Implementadas**:
- Listagem de produtos com busca
- Exibição de tipo e categoria
- Soft delete de produtos

**Funcionalidades Pendentes**:
- Criação de produtos com variants
- Upload de imagens de produtos
- Gestão de categorias
- Vinculação com fornecedores
- Importação em lote
- Pricing por variante

---

### 4. Módulo de Estoque e Inventário
**Status**: ❌ Não Implementado

**Models do Schema**:
- `Inventory` - Estoque atual por produto/variante
- `InventoryMovement` - Movimentações (IN, OUT, RESERVE, ADJUSTMENT, LOSS)

**Funcionalidades a Implementar**:
- Visualização de estoque atual
- Registro de entrada/saída
- Ajustes de inventário
- Registro de perdas
- Alertas de estoque baixo
- Histórico de movimentações
- Relatórios de inventário

---

### 5. Módulo de Vendas (Orçamentos e Pedidos)
**Status**: ⚠️ Parcialmente Implementado

**Componentes**:
- `/pedidos/page.tsx` - Listagem de pedidos com filtros
- `/orcamentos/page.tsx` - Placeholder

**Models do Schema**:
- `Quote` - Orçamentos com validade e status
- `QuoteItem` - Itens do orçamento
- `Order` - Pedidos com múltiplos status
- `OrderItem` - Itens do pedido com produção
- `OrderItemLog` - Histórico de alterações de itens

**Funcionalidades Implementadas**:
- Listagem de pedidos com busca e filtro por status
- Exibição de status de produção e pagamento

**Funcionalidades Pendentes**:
- **Orçamentos**:
  - Criação de orçamentos com múltiplos itens
  - Cálculo automático de preços
  - Envio por email/WhatsApp
  - Tracking de visualizações
  - Conversão de orçamento em pedido
  - Templates de orçamento

- **Pedidos**:
  - Criação de pedidos completos
  - Detail page de pedido (`/pedidos/[id]`)
  - Gestão de itens do pedido
  - Status de pagamento (PENDING, PARTIAL, PAID)
  - Vinculação com cliente
  - Cálculo de impostos e descontos

---

### 6. Módulo de Produção (Kanban)
**Status**: ✅ Implementado (Funcional)

**Componentes**:
- `/producao/page.tsx` - Dashboard de produção com Kanban
- `src/components/production/kanban-board.tsx` - Board com drag-and-drop

**Actions**:
- `getProductionItems()` - Busca itens em produção
- `updateProductionStatus(id, status)` - Atualiza status
- `updateItemNote(id, note)` - Adiciona notas

**Models do Schema**:
- `OrderItem` - Itens de pedido em produção
- Enums: `ProductionStatus`, `ItemPriority`

**Funcionalidades Implementadas**:
- Kanban com 5 colunas (PENDING, QUEUED, IN_PROGRESS, PAUSED, DONE)
- Atualização de status via botões
- Cards com prioridade visual (URGENT, HIGH, NORMAL, LOW)
- Estatísticas de produção
- Drag-and-drop entre colunas
- Notas de produção

**Funcionalidades Pendentes**:
- Atribuição de operadores
- Tempo estimado por etapa
- Alertas de atraso
- Relatórios de produtividade
- Vinculação com estoque (consumo de materiais)

---

### 7. Módulo Financeiro
**Status**: ❌ Não Implementado

**Models do Schema**:
- `Payment` - Pagamentos recebidos/pagos
- `Receivable` - Contas a receber
- `Payable` - Contas a pagar
- `CashFlow` - Fluxo de caixa

**Funcionalidades a Implementar**:
- **Contas a Receber**:
  - Geração automática a partir de pedidos
  - Parcelamento
  - Status de pagamento
  - Notificações de vencimento

- **Contas a Pagar**:
  - Cadastro de despesas
  - Categorização
  - Vencimentos e alertas
  - Pagamentos recorrentes

- **Pagamentos**:
  - Registro de recebimentos
  - Múltiplos métodos (PIX, boleto, cartão, etc)
  - Conciliação bancária
  - Estornos e cancelamentos

- **Fluxo de Caixa**:
  - Projeções futuras
  - Entradas vs saídas
  - Relatórios por período
  - Análise por categoria

---

### 8. Módulo de IA e Conversas
**Status**: ❌ Não Implementado

**Models do Schema**:
- `Conversation` - Sessões de conversa
- `Message` - Mensagens com embeddings (preparado para RAG)
- Enums: `ConversationChannel`, `ConversationStatus`, `MessageRole`, `MessageContentType`

**Funcionalidades a Implementar**:
- Chat integrado (WhatsApp, email, web)
- Respostas automáticas via IA
- Roteamento para agentes humanos
- Histórico de conversas
- Busca semântica via embeddings (pgvector)
- Templates de mensagens
- Métricas de atendimento
- Integração com pedidos (status, rastreio)

---

### 9. Módulo de Dashboard Admin
**Status**: ✅ Implementado (Funcional)

**Componentes**:
- `/admin/page.tsx` - Dashboard principal
- `src/components/dashboard/activity-chart.tsx` - Gráfico de atividade

**Actions**:
- `getDashboardData()` - Dados consolidados

**Funcionalidades Implementadas**:
- Cards de estatísticas (receita, pedidos, clientes, produção)
- Gráfico de atividade com Framer Motion
- Top produtos mais vendidos
- Pedidos recentes com status
- Dados reais do banco via Prisma

**Funcionalidades Pendentes**:
- Filtros por período
- Comparativos (MoM, YoY)
- Métricas personalizadas
- Exportação de relatórios
- Widgets customizáveis
- Alertas e notificações

---

### 10. Módulo de Relatórios e Analytics
**Status**: ❌ Não Implementado

**Funcionalidades a Implementar**:
- Relatórios de vendas
- Análise de clientes (RFM, churn)
- Relatórios de produção (eficiência, atrasos)
- Análise financeira (DRE, fluxo de caixa)
- Relatórios de estoque (giro, rupturas)
- Exportação (PDF, Excel, CSV)
- Agendamento de relatórios
- Dashboards customizáveis

---

## Padrões Arquiteturais

### Banco de Dados
- **IDs**: UUID em todas as tabelas
- **Multi-tenancy**: `tenantId` com índices compostos `[tenantId, id]`
- **Soft Delete**: `deletedAt` em entidades críticas
- **Valores Monetários**: `Decimal(15, 2)`
- **Extensibilidade**: Campo `metadata Json?` para dados customizados
- **Índices**: Todas as foreign keys indexadas
- **Preparado para IA**: Campo `embedding Float[]` em Message (pgvector)

### Server Actions
- Localizadas em `/src/app/actions/`
- Chamadas diretamente de Server Components
- Retornam dados tipados
- Isolamento por tenant via contexto

### Componentes UI
- **Design System**: CVA (class-variance-authority) para variants
- **Composição**: `cn()` com clsx + tailwind-merge
- **Acessibilidade**: Radix UI para primitives
- **Animações**: Framer Motion para transições

### Autenticação
- **Server-side**: Middleware com Supabase SSR
- **Client-side**: Context Provider com estado global
- **Proteção**: Rotas protegidas via middleware matcher
- **Multi-tenant**: Tenant obtido do perfil do usuário

---

## Rotas do Sistema

### Públicas
- `/` - Landing page
- `/login` - Autenticação

### Protegidas
- `/admin` - Dashboard administrativo
- `/pedidos` - Listagem de pedidos
- `/pedidos/[id]` - Detalhe de pedido (NÃO IMPLEMENTADO)
- `/producao` - Kanban de produção
- `/produtos` - Catálogo de produtos
- `/clientes` - Gestão de clientes (NÃO IMPLEMENTADO)
- `/estoque` - Inventário (NÃO IMPLEMENTADO)
- `/financeiro` - Módulo financeiro (NÃO IMPLEMENTADO)
- `/orcamentos` - Orçamentos (NÃO IMPLEMENTADO)
- `/conversas` - Chat e IA (NÃO IMPLEMENTADO)
- `/relatorios` - Relatórios (NÃO IMPLEMENTADO)

---

## Próximos Passos (Roadmap)

### Fase 1 - Completar Vendas
1. Implementar detail page de pedidos (`/pedidos/[id]`)
2. Criar módulo de orçamentos completo
3. Implementar criação de pedidos com múltiplos itens

### Fase 2 - CRM e Produtos
1. CRUD completo de clientes e fornecedores
2. Criação de produtos com variants e imagens
3. Gestão de categorias

### Fase 3 - Estoque
1. Visualização e controle de estoque
2. Movimentações (entrada/saída)
3. Alertas e relatórios

### Fase 4 - Financeiro
1. Contas a receber/pagar
2. Pagamentos e conciliação
3. Fluxo de caixa

### Fase 5 - IA e Automação
1. Chat multi-canal
2. Respostas automáticas via IA
3. Integração com pgvector para busca semântica

### Fase 6 - Relatórios
1. Relatórios de vendas e produção
2. Análise financeira
3. Exportação e agendamento

---

## Convenções de Código

### Nomenclatura
- **Arquivos**: kebab-case (`kanban-board.tsx`)
- **Componentes**: PascalCase (`KanbanBoard`)
- **Funções**: camelCase (`getProductionItems`)
- **Variáveis**: camelCase (`productionItems`)

### Estrutura de Pastas
```
src/
├── app/              # Next.js App Router (rotas)
│   ├── actions/      # Server Actions
│   └── [modulo]/     # Módulos do sistema
├── components/       # Componentes reutilizáveis
│   ├── ui/          # Primitivos de UI
│   ├── layout/      # Componentes de layout
│   └── [modulo]/    # Componentes específicos
├── contexts/         # Context Providers
└── lib/             # Utilitários e configurações
```

### Server vs Client Components
- **Server Components** (padrão): Busca de dados, renderização inicial
- **Client Components** (`"use client"`): Estado, efeitos, interatividade

### Tipagem
- **Strict TypeScript**: Sempre tipar retornos de funções
- **Interfaces**: Para objetos de domínio
- **Types**: Para uniões e utilitários
- **Enums**: Para valores fixos do schema

---

## Configurações de Ambiente

### Variáveis Necessárias
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# App
NEXT_PUBLIC_SITE_URL=
```

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm run start

# Lint
npm run lint

# Prisma
npm run prisma:generate   # Gerar cliente
npm run prisma:migrate    # Aplicar migrações
```

---

**Data de Criação**: 2026-04-09
**Versão**: 0.1.0
**Última Atualização**: 2026-04-09
