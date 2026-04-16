# Spec: Módulo de Vendas - Orçamentos e Pedidos

## Contexto
Sistema ERP multi-tenant para gráficas. Módulo de vendas gerencia orçamentos e pedidos de clientes.

## Estado Atual
- ⚠️ Listagem de pedidos implementada (`/pedidos/page.tsx`)
- ❌ Orçamentos não implementado (placeholder)
- ❌ Detail page de pedido não implementada (`/pedidos/[id]/` vazio)
- ❌ Criação de pedidos não implementada
- Modelos prontos: `Quote`, `QuoteItem`, `Order`, `OrderItem`, `OrderItemLog`

## Requisitos do Módulo

### 1. Criação de Orçamentos (Quotes)
**User Story**: Como vendedor, quero criar orçamentos para clientes com múltiplos produtos.

**Critérios de Aceitação**:
- Formulário multi-etapas
- Seleção de cliente existente ou novo
- Adição de múltiplos produtos com quantidades
- Cálculo automático de subtotal, impostos, desconto, total
- Definição de validade do orçamento
- Observações e termos

**Especificação Técnica**:
```
Rota: /orcamentos/novo (Client Component)

Server Actions:
  - createQuote(formData)
  - addQuoteItem(quoteId, itemData)
  - removeQuoteItem(quoteId, itemId)
  - calculateQuoteTotal(quoteId)
  - applyDiscount(quoteId, discountData)

FormData (Quote):
  - customerId (FK, obrigatório)
  - validUntil (date, default: +15 dias)
  - salespersonId (FK para User)
  - notes (observações internas)
  - terms (termos e condições)
  - discountType (PERCENT ou FIXED)
  - discountValue (Decimal)
  - taxRate (Decimal, % de imposto)
  - metadata (JSON)

FormData (QuoteItem):
  - productId (FK)
  - variantId (FK, opcional)
  - quantity (Int)
  - unitPrice (Decimal)
  - discount (Decimal, opcional)
  - notes (especificações do item)

Cálculos:
  subtotal = Σ(unitPrice * quantity) para cada item
  discountAmount = subtotal * (discountValue / 100)  se PERCENT
                 = discountValue                      se FIXED
  taxBase = subtotal - discountAmount
  taxAmount = taxBase * (taxRate / 100)
  total = taxBase + taxAmount

Validações:
  - customerId existe e ativo
  - validUntil > hoje
  - Pelo menos 1 item
  - quantity > 0 para cada item
  - unitPrice > 0
  - discountValue >= 0
  - taxRate >= 0
```

### 2. Gestão de Orçamentos
**User Story**: Como vendedor, quero gerenciar orçamentos criados e acompanhar status.

**Especificação Técnica**:
```
Rota: /orcamentos (Server Component)

Server Actions:
  - getQuotes(params)               - Listagem com filtros
  - getQuoteById(id)                - Detalhe completo
  - updateQuote(id, formData)
  - deleteQuote(id)                 - Soft delete
  - sendQuoteToCustomer(id)         - Envio por email
  - markQuoteAsViewed(id)           - Tracking
  - acceptQuote(id)                 - Cliente aceita
  - rejectQuote(id, reason)         - Cliente rejeita
  - convertQuoteToOrder(id)         - Gera pedido

Status do Orçamento:
  DRAFT → Rascunho (editável)
  SENT → Enviado ao cliente
  VIEWED → Cliente visualizou
  ACCEPTED → Cliente aceitou
  REJECTED → Cliente rejeitou
  EXPIRED → Validade expirou
  CONVERTED → Convertido em pedido

Fluxo de Status:
  DRAFT → SENT → VIEWED → ACCEPTED → CONVERTED
              ↓         ↓
            REJECTED   EXPIRED

Filtros da Listagem:
  - Status
  - Período de criação
  - Cliente
  - Vendedor
  - Valor (range)
  - Validade (vence em breve, vencidos)

Componentes:
  QuoteListTable:
    - Número, Cliente, Data, Validade, Valor, Status
    - Badges coloridos por status
    - Ações: Ver, Editar, Enviar, Converter
    - Alerta de validade próxima
  
  QuoteDetail:
    - Dados do cliente
    - Tabela de itens
    - Resumo financeiro
    - Histórico de status
    - Ações disponíveis conforme status
```

### 3. Envio de Orçamento
**User Story**: Como vendedor, quero enviar orçamentos por email/WhatsApp.

**Especificação Técnica**:
```
Canais:
  - Email (HTML template responsivo)
  - WhatsApp (link com resumo)
  - PDF para download
  - Link público (view-only)

Server Actions:
  - sendQuoteByEmail(quoteId, email)
    → Gera HTML do orçamento
    → Envia via Supabase Email (ou integração externa)
    → Atualiza status para SENT
    → Log de envio
  
  - generateQuotePDF(quoteId)
    → Gera PDF com dados completos
    → Armazena em Supabase Storage
    → Retorna URL de download
  
  - generateQuoteLink(quoteId)
    → Gera token único
    → URL: /orcamentos/view/{token}
    → Página pública view-only
    → Tracking de visualizações

Template de Email:
  - Logo da empresa (tenant)
  - Dados do cliente
  - Tabela de produtos
  - Valores detalhados
  - Validade destacada
  - Botão de aceitar/rejeitar
  - Termos e condições
```

### 4. Detail Page de Orçamento
**Layout Proposto**:
```
┌─────────────────────────────────────────────────┐
│  [Voltar]  Orçamento #QT-2026-0042              │
│  Status: [SENT]  Validade: 24/04/2026           │
│                                                 │
│  ┌─ Cliente ─────────────┬─ Ações ────────────┐ │
│  │ João Silva            │ [Editar]           │ │
│  │ joao@email.com        │ [Enviar]           │ │
│  │ (11) 98765-4321       │ [PDF] [Link]       │ │
│  └───────────────────────┴────────────────────┘ │
│                                                 │
│  ┌─ Itens do Orçamento ────────────────────────┐│
│  │ Produto        | Qtd | Unit.  | Total      ││
│  │ Cartão Visita  | 500 | R$0,18 | R$ 90,00   ││
│  │ Panfleto A4    | 1000| R$0,12 | R$ 120,00  ││
│  │ Camiseta M     | 50  | R$35,00| R$1750,00  ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│  ┌─ Resumo Financeiro ─────────────────────────┐│
│  │ Subtotal:              R$ 1.960,00          ││
│  │ Desconto (10%):       -R$   196,00          ││
│  │ Impostos (5%):        +R$    88,20          ││
│  │ ─────────────────────────────────────       ││
│  │ TOTAL:                 R$ 1.852,20          ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│  ┌─ Histórico ─────────────────────────────────┐│
│  │ 09/04 - Criado por Maria                   ││
│  │ 09/04 - Enviado para joao@email.com        ││
│  │ 10/04 - Visualizado pelo cliente           ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│  [Converter em Pedido]  [Rejeitar]             │
└─────────────────────────────────────────────────┘
```

### 5. Criação de Pedidos (Orders)
**User Story**: Como vendedor, quero criar pedidos a partir de orçamentos ou diretamente.

**Especificação Técnica**:
```
Rota: /pedidos/novo (Client Component)

Duas origens:
  1. A partir de orçamento (pré-preenchido)
  2. Pedido direto (manual)

Server Actions:
  - createOrder(formData)
  - createOrderFromQuote(quoteId)
  - addOrderItem(orderId, itemData)
  - removeOrderItem(orderId, itemId)
  - updateOrderItem(orderId, itemId, data)

FormData (Order):
  - customerId (FK, obrigatório)
  - quoteId (FK, opcional, se veio de orçamento)
  - expectedDeliveryDate (Date)
  - paymentTerms (condições de pagamento)
  - paymentStatus (PENDING, PARTIAL, PAID)
  - notes (observações gerais)
  - internalNotes (notas internas, não visíveis ao cliente)
  - shippingAddressId (FK para Address)
  - billingAddressId (FK para Address)

FormData (OrderItem):
  - productId (FK)
  - variantId (FK, opcional)
  - quantity (Int)
  - unitPrice (Decimal)
  - discount (Decimal)
  - taxRate (Decimal)
  - status (PENDING, QUEUED, IN_PROGRESS, PAUSED, DONE, CANCELED, REJECTED)
  - priority (LOW, NORMAL, HIGH, URGENT)
  - productionNotes (instruções de produção)
  - expectedStartDate
  - expectedFinishDate

Fluxo de Pedido:
  1. Selecionar cliente
  2. Adicionar produtos
  3. Configurar entregas e pagamentos
  4. Revisar pedido
  5. Confirmar
  6. Sistema:
     → Cria Order com status CONFIRMED
     → Cria OrderItems com status PENDING
     → Se trackInventory: reserva estoque
     → Gera número do pedido (sequencial)
     → Notifica produção
```

### 6. Detail Page de Pedido
**User Story**: Como usuário, quero ver todas as informações de um pedido.

**Layout Proposto**:
```
┌─────────────────────────────────────────────────┐
│  [Voltar]  Pedido #PED-2026-0123                │
│  Status: [IN_PRODUCTION]  Pagamento: [PARTIAL]  │
│                                                 │
│  ┌─ Cliente ─────────────┬─ Timeline ──────────┐│
│  │ João Silva            │ 09/04 - Criado      ││
│  │ joao@email.com        │ 09/04 - Confirmado  ││
│  │ (11) 98765-4321       │ 10/04 - Produção    ││
│  └───────────────────────┴─────────────────────┘│
│                                                 │
│  ┌─ Itens do Pedido ───────────────────────────┐│
│  │ Produto       | Qtd | Status       | Prod.  ││
│  │ Cartão Visita | 500 | IN_PROGRESS  | [Ver]  ││
│  │ Panfleto A4   | 1000| IN_QUEUE     | [Ver]  ││
│  │ Camiseta M    | 50  | PENDING      | [Ver]  ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│  ┌─ Financeiro ────────────────────────────────┐│
│  │ Total:            R$ 1.852,20               ││
│  │ Pago:             R$ 926,10 (50%)           ││
│  │ Restante:         R$ 926,10                 ││
│  │ Vencimento:       24/04/2026                ││
│  │ [Registrar Pgto] [Ver Parcelas]             ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│  ┌─ Entrega ───────────────────────────────────┐│
│  │ Endereço: Rua X, 123 - São Paulo/SP        ││
│  │ Previsão: 24/04/2026                        ││
│  │ [Rastrear] [Alterar Data]                   ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│  ┌─ Notas Internas ────────────────────────────┐│
│  │ [Adicionar Nota]                            ││
│  │ 09/04 - Cliente pediu prioridade no cartão  ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│  [Editar] [Cancelar] [Duplicar] [Imprimir]     │
└─────────────────────────────────────────────────┘
```

### 7. Gestão de Itens do Pedido (OrderItem)
**User Story**: Como operador, quero gerenciar status e produção de cada item.

**Especificação Técnica**:
```
Model: OrderItem
  - orderId (FK)
  - productId (FK)
  - variantId (FK, opcional)
  - quantity
  - unitPrice
  - total (calculado)
  - status (PENDING → QUEUED → IN_PROGRESS → PAUSED → DONE)
  - priority (LOW, NORMAL, HIGH, URGENT)
  - productionNotes
  - startedAt (timestamp)
  - finishedAt (timestamp)
  - rejectedReason (se REJECTED)

Model: OrderItemLog
  - orderItemId (FK)
  - oldStatus
  - newStatus
  - changedBy (userId)
  - notes
  - createdAt

Fluxos de Status:
  PENDING → QUEUED → IN_PROGRESS → DONE
                        ↓
                      PAUSED → IN_PROGRESS
                        ↓
                      REJECTED
  
  CANCELED pode vir de qualquer status

Server Actions (já existem, expandir):
  - updateProductionStatus(id, status)  - já existe
  - updateItemNote(id, note)            - já existe
  - updateItemPriority(id, priority)
  - rejectItem(id, reason)
  - cancelItem(id)
  - getOrderItemById(id)
  - getOrderItemLogs(id)              - Histórico
```

### 8. Listagem de Pedidos (Melhorias)
**User Story**: Como usuário, quero filtrar e buscar pedidos eficientemente.

**Melhorias na Listagem Atual**:
```
Adicionar à tabela atual:
  - Filtro por cliente
  - Filtro por período
  - Filtro por valor (range)
  - Ordenação por todas as colunas
  - Paginação (atualmente não tem)
  - Visualização de status de pagamento com badges
  - Ações em lote (mudar status, exportar)
  - Exportação CSV
  - Resumo de totais (valor total filtrado)

Componente: OrderDataTable (expandir atual)
  - Busca textual (número, cliente)
  - Filtros colapsáveis:
    → Status de produção
    → Status de pagamento
    → Cliente
    → Período
    → Valor
  - Toolbar com ações
  - Paginação
```

### 9. Templates de Orçamento
**User Story**: Como vendedor, quero usar templates para orçamentos recorrentes.

**Especificação Técnica**:
```
Funcionalidade:
  - Salvar orçamento como template
  - Templates predefinidos por categoria
  - Aplicar template a novo orçamento
  - Editar itens após aplicação

Server Actions:
  - saveQuoteAsTemplate(quoteId, templateName)
  - getTemplates()
  - applyTemplate(templateId, customerId)
  - deleteTemplate(id)

Model (futuro - QuoteTemplate):
  - name
  - description
  - items (JSON array)
  - defaultDiscount
  - defaultTaxRate
  - usageCount
```

### 10. Numeração Automática
**User Story**: Como sistema, quero gerar números sequenciais para orçamentos e pedidos.

**Especificação Técnica**:
```
Model: NumberSequence (já existe no schema)
  - tenantId
  - entityType (QUOTE, ORDER, INVOICE, etc)
  - prefix (QT, PED, NF)
  - currentNumber
  - format (YYYY, MM, sequencial)
  
Exemplo:
  prefix: "QT"
  format: "{prefix}-{YYYY}-{seq:04d}"
  currentNumber: 42
  → QT-2026-0042

Server Actions:
  - getNextNumber(entityType)
    → Incrementa currentNumber
    → Retorna número formatado
    → Transação atômica (evitar duplicação)
```

## Estrutura de Arquivos Proposta
```
src/app/
└── orcamentos/
    ├── page.tsx                    - Listagem
    ├── novo/page.tsx               - Criação
    ├── [id]/
    │   ├── page.tsx                - Detail page
    │   └── editar/page.tsx
    └── templates/
        └── page.tsx                - Gestão de templates

src/app/
└── pedidos/
    ├── page.tsx                    - Listagem (melhorar)
    ├── novo/page.tsx               - Criação
    └── [id]/
        ├── page.tsx                - Detail page (criar)
        ├── editar/page.tsx
        └── itens/[itemId]/
            └── page.tsx            - Detalhe do item

src/app/actions/
├── quotes.ts
│   ├── createQuote(formData)
│   ├── updateQuote(id, formData)
│   ├── deleteQuote(id)
│   ├── getQuotes(params)
│   ├── getQuoteById(id)
│   ├── addQuoteItem(quoteId, itemData)
│   ├── removeQuoteItem(quoteId, itemId)
│   ├── calculateQuoteTotal(quoteId)
│   ├── sendQuoteByEmail(quoteId, email)
│   ├── generateQuotePDF(quoteId)
│   ├── generateQuoteLink(quoteId)
│   ├── acceptQuote(id)
│   ├── rejectQuote(id, reason)
│   ├── convertQuoteToOrder(id)
│   └── template functions
└── orders.ts
    ├── createOrder(formData)
    ├── createOrderFromQuote(quoteId)
    ├── updateOrder(id, formData)
    ├── cancelOrder(id)
    ├── duplicateOrder(id)
    ├── getOrders(params)
    ├── getOrderById(id)
    ├── addOrderItem(orderId, itemData)
    ├── updateOrderItem(id, data)
    ├── removeOrderItem(id)
    ├── updateItemPriority(id, priority)
    ├── rejectItem(id, reason)
    ├── getOrderItemLogs(id)
    └── getNextNumber(entityType)

src/components/
├── quotes/
│   ├── quote-form.tsx
│   ├── quote-list.tsx
│   ├── quote-detail.tsx
│   ├── quote-items-table.tsx
│   ├── quote-status-badge.tsx
│   ├── quote-send-dialog.tsx
│   └── template-selector.tsx
└── orders/
    ├── order-form.tsx
    ├── order-detail.tsx
    ├── order-items-table.tsx
    ├── order-timeline.tsx
    ├── order-financial-summary.tsx
    └── order-item-detail.tsx
```

## Validações (Zod)
```typescript
quoteSchema = z.object({
  customerId: z.string().uuid(),
  validUntil: z.date().min(new Date(), "Validade deve ser futura"),
  salespersonId: z.string().uuid().optional(),
  notes: z.string().max(1000).optional(),
  terms: z.string().max(5000).optional(),
  discountType: z.enum(["PERCENT", "FIXED"]).default("PERCENT"),
  discountValue: z.number().min(0).optional(),
  taxRate: z.number().min(0).default(0),
  items: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    discount: z.number().min(0).default(0),
    notes: z.string().max(500).optional()
  })).min(1, "Orçamento deve ter pelo menos 1 item")
})

orderSchema = z.object({
  customerId: z.string().uuid(),
  quoteId: z.string().uuid().optional(),
  expectedDeliveryDate: z.date().min(new Date()),
  paymentTerms: z.string().max(500).optional(),
  paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID"]).default("PENDING"),
  notes: z.string().max(1000).optional(),
  internalNotes: z.string().max(1000).optional(),
  shippingAddressId: z.string().uuid().optional(),
  billingAddressId: z.string().uuid().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    discount: z.number().min(0).default(0),
    taxRate: z.number().min(0).default(0),
    priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
    productionNotes: z.string().max(1000).optional()
  })).min(1, "Pedido deve ter pelo menos 1 item")
})
```

## Testes Necessários
- [ ] Teste de criação de orçamento com 1 item
- [ ] Teste de criação de orçamento com múltiplos itens
- [ ] Teste de cálculo de desconto e impostos
- [ ] Teste de envio por email
- [ ] Teste de geração de PDF
- [ ] Teste de link público
- [ ] Teste de aceitação/rejeição
- [ ] Teste de conversão em pedido
- [ ] Teste de expiração de orçamento
- [ ] Teste de criação de pedido direto
- [ ] Teste de criação de pedido a partir de orçamento
- [ ] Teste de atualização de status de item
- [ ] Teste de log de alterações
- [ ] Teste de numeração sequencial
- [ ] Teste de reserva de estoque
- [ ] Teste de isolamento por tenant

## Métricas de Sucesso
- Tempo de criação de orçamento < 2 minutos
- Taxa de conversão orçamento → pedido > 30%
- Taxa de visualização de orçamentos enviados > 60%
- Zero erros de numeração duplicada

## Dependências
- Módulo de Autenticação (tenantId, usuário)
- Módulo de CRM (clientes, endereços)
- Módulo de Catálogo (produtos, variantes)
- Módulo de Estoque (reserva de estoque)
- Módulo Financeiro (pagamentos)
