# Spec: Módulo Financeiro

## Contexto
Sistema ERP multi-tenant para gráficas. Módulo financeiro gerencia contas a receber, pagar, pagamentos e fluxo de caixa.

## Estado Atual
- ❌ Não implementado
- Modelos prontos: `Payment`, `Receivable`, `Payable`, `CashFlow`
- Enums: `PaymentMethod`, `PaymentStatus`, `ReceivableStatus`, `PayableStatus`, `CashFlowType`

## Requisitos do Módulo

### 1. Contas a Receber (Receivables)
**User Story**: Como financeiro, quero gerenciar valores que clientes devem pagar.

**Critérios de Aceitação**:
- Geração automática a partir de pedidos
- Parcelamento de valores
- Status de pagamento atualizado
- Notificações de vencimento
- Histórico de recebimentos

**Especificação Técnica**:
```
Rota: /financeiro/receber (Server Component)

Model: Receivable
  - orderId (FK, origem)
  - customerId (FK)
  - invoiceNumber (string, número da nota/fatura)
  - issueDate (date, data de emissão)
  - dueDate (date, data de vencimento)
  - value (Decimal, valor da parcela)
  - originalValue (Decimal, valor original com correção)
  - paidValue (Decimal, valor efetivamente pago)
  - status (PENDING, PARTIAL, PAID, OVERDUE, REFUNDED, CANCELED)
  - installmentNumber (Int, número da parcela)
  - totalInstallments (Int, total de parcelas)
  - paymentMethod (método usado no pagamento)
  - notes
  - metadata (JSON)

Server Actions:
  - createReceivable(formData)
  - createReceivablesFromOrder(orderId)
    → Gera automaticamente ao confirmar pedido
    → Se paymentTerms tem parcelas, cria múltiplas
    → Ex: "3x sem juros" → 3 Receivable com valores iguais
  
  - updateReceivable(id, formData)
  - cancelReceivable(id, reason)
  - getReceivables(params)
  - getReceivableById(id)
  - getOverdueReceivables()              - Atrasadas
  - getReceivablesByCustomer(customerId)
  - getReceivablesByOrder(orderId)

Fluxo de Geração Automática:
  Quando Order.status = CONFIRMED:
    → createReceivablesFromOrder(order.id)
    → Lê Order.paymentTerms
    → Se "à vista": 1 parcela, vencimento +30 dias
    → Se "2x": 2 parcelas, 30 e 60 dias
    → Se "3x": 3 parcelas, 30, 60, 90 dias
    → Atualiza Order.paymentStatus

Filtros da Listagem:
  - Status (PENDING, PAID, OVERDUE, etc)
  - Período de vencimento
  - Cliente
  - Pedido
  - Valor (range)
  - Método de pagamento
  - Atrasadas (toggle)

Componentes:
  ReceivableTable:
    - Fatura, Cliente, Pedido, Vencimento, Valor, Status
    - Badges coloridos por status
    - Indicador de atraso (vermelho se vencida)
    - Ações: Ver, Editar, Registrar Pgto, Cancelar
    - Totais no rodapé
```

### 2. Registro de Recebimento
**User Story**: Como financeiro, quero registrar pagamentos recebidos.

**Especificação Técnica**:
```
Rota: /financeiro/receber/[id]/pagamento

Server Actions:
  - recordPayment(receivableId, paymentData)
  - recordPartialPayment(receivableId, amount, paymentData)

PaymentData:
  - amount (Decimal, valor pago)
  - paymentMethod (PIX, CASH, CREDIT_CARD, etc)
  - paymentDate (Date, quando recebeu)
  - referenceNumber (nosso número, ID transação)
  - notes
  - attachment (URL de comprovante, opcional)

Fluxo:
  1. Seleciona conta a receber
  2. Clica "Registrar Pagamento"
  3. Formulário de recebimento:
     → Valor total sugerido
     → Permite valor diferente (parcial)
     → Método de pagamento
     → Data (default: hoje)
     → Comprovante (upload opcional)
  4. Confirma recebimento
  5. Sistema:
     → Cria Payment (type=IN)
     → Atualiza Receivable.status
       - Se paidValue >= value: status = PAID
       - Se paidValue > 0 e < value: status = PARTIAL
     → Atualiza Order.paymentStatus
     → Se Order todas parcelas pagas: status = PAID
     → Log de recebimento
     → Notifica cliente (email/SMS, futuro)

Validações:
  - amount > 0
  - amount <= receivable.value (não permitir superpagamento)
  - paymentDate <= hoje (não permitir datas futuras)
  - Se partial: reason obrigatório
```

### 3. Contas a Pagar (Payables)
**User Story**: Como financeiro, quero gerenciar despesas e contas a pagar.

**Especificação Técnica**:
```
Rota: /financeiro/pagar (Server Component)

Model: Payable
  - supplierId (FK, fornecedor)
  - categoryId (FK, categoria de despesa)
  - invoiceNumber (número da nota fiscal)
  - issueDate
  - dueDate
  - value
  - paidValue (valor efetivamente pago)
  - status (PENDING, PARTIAL, PAID, OVERDUE, CANCELED)
  - paymentMethod
  - paidDate (quando foi pago)
  - recurring (boolean, é recorrente?)
  - recurringInterval (MONTHLY, QUARTERLY, YEARLY)
  - nextDueDate (próximo vencimento, se recorrente)
  - notes
  - attachment (URL da nota fiscal)
  - metadata (JSON)

Server Actions:
  - createPayable(formData)
  - updatePayable(id, formData)
  - cancelPayable(id, reason)
  - recordPayablePayment(id, paymentData)
  - getPayables(params)
  - getPayableById(id)
  - getOverduePayables()
  - getUpcomingPayables(daysAhead)  - Próximos X dias
  - generateRecurringPayables()     - Gera recorrências do mês

Categorias de Despesa (futuro - ExpenseCategory):
  - Matéria-prima
  - Serviços terceirizados
  - Aluguel
  - Energia/Água
  - Salários
  - Impostos
  - Marketing
  - Manutenção
  - Outros

Fluxo de Recorrência:
  Se Payable.recurring = true:
    → Ao vencer, gera próxima parcela automaticamente
    → nextDueDate = dueDate + interval
    → Cron job ou ação manual
```

### 4. Pagamentos (Payments)
**User Story**: Como sistema, quero registrar todos os pagamentos (entradas e saídas).

**Especificação Técnica**:
```
Model: Payment
  - type (IN - recebimento, OUT - pagamento)
  - receivableId (FK, se entrada)
  - payableId (FK, se saída)
  - orderId (FK, referência)
  - amount (Decimal)
  - paymentMethod
  - paymentDate
  - status (PENDING, PROCESSING, PAID, FAILED, CANCELED, REFUNDED, CHARGEBACK)
  - referenceNumber
  - gatewayResponse (JSON, resposta de gateway de pagamento)
  - notes
  - metadata (JSON)

Server Actions:
  - createPayment(paymentData)
  - refundPayment(id, reason, amount)
  - cancelPayment(id, reason)
  - getPayments(params)
  - getPaymentById(id)
  - getPaymentsByOrder(orderId)
  - getPaymentsByCustomer(customerId)
  - getPaymentsBySupplier(supplierId)

Métodos de Pagamento:
  CASH (Dinheiro)
  PIX (instantâneo, confirmação automática)
  CREDIT_CARD (cartão crédito, confirma gateway)
  DEBIT_CARD (cartão débito)
  BANK_TRANSFER (transferência bancária)
  BOLETO (boleto bancário, registra via API)
  CHECK (cheque, aguarda compensação)
  OTHER (outro)

Status do Pagamento:
  PENDING → Aguardando
  PROCESSING → Em processamento (cartão/boleto)
  PAID → Confirmado
  FAILED → Falhou
  CANCELED → Cancelado
  REFUNDED → Estornado
  CHARGEBACK → Contestado
```

### 5. Fluxo de Caixa (CashFlow)
**User Story**: Como gestor, quero visualizar entradas e saídas de dinheiro.

**Especificação Técnica**:
```
Rota: /financeiro/fluxo-caixa (Server Component)

Model: CashFlow
  - date (Date, data do movimento)
  - type (IN ou OUT)
  - category (categoria)
  - description
  - amount (Decimal)
  - status (PENDING - previsto, CONFIRMED - realizado)
  - sourceType (RECEIVABLE, PAYABLE, MANUAL)
  - sourceId (UUID, referência ao documento origem)
  - notes

Server Actions:
  - getCashFlow(dateRange)
  - getCashFlowSummary(dateRange)
  - addCashFlowEntry(formData)
  - getProjectedCashFlow(daysAhead)
  - getCashFlowByCategory(dateRange)

Geração Automática:
  - Receivables geram entradas previstas (type=IN, status=PENDING)
  - Payables gerem saídas previstas (type=OUT, status=PENDING)
  - Quando pagos, status muda para CONFIRMED
  - Entradas manuais para ajustes

Relatório de Fluxo de Caixa:
  ┌─ Fluxo de Caixa - Abril 2026 ───────────────┐
  │            | Previsto   | Realizado | Saldo  │
  ├────────────┼────────────┼───────────┼────────┤
  │ Entradas   | R$ 45.000  | R$ 32.500 |        │
  │ Saídas     | R$ 28.000  | R$ 21.200 |        │
  │ ──────────────────────────────────────────── │
  │ Resultado  | R$ 17.000  | R$ 11.300 | +11.3K │
  └───────────────────────────────────────────────┘

  ┌─ Projeção Próximos 30 Dias ──────────────────┐
  │ Semana 1: +R$ 8.500  ▓▓▓▓▓▓▓▓▓              │
  │ Semana 2: +R$ 5.200  ▓▓▓▓▓▓                  │
  │ Semana 3: -R$ 2.100  ▓▓ (negativo)           │
  │ Semana 4: +R$ 9.800  ▓▓▓▓▓▓▓▓▓▓              │
  └───────────────────────────────────────────────┘

  ┌─ Entradas por Cliente ───────────────────────┐
  │ 1. João Silva      - R$ 12.500  ▓▓▓▓▓▓▓     │
  │ 2. Maria Santos    - R$ 8.900   ▓▓▓▓▓        │
  │ 3. Empresa X       - R$ 6.200   ▓▓▓▓          │
  └───────────────────────────────────────────────┘
```

### 6. Dashboard Financeiro
**User Story**: Como gestor, quero visão geral do financeiro.

**Especificação Técnica**:
```
Rota: /financeiro (Server Component, dashboard)

Server Actions:
  - getFinancialDashboard(dateRange)
    → Retorna:
      - totalReceivables (previsto)
      - paidReceivables (recebido)
      - overdueReceivables (atrasado)
      - totalPayables (previsto)
      - paidPayables (pago)
      - overduePayables (atrasado)
      - cashBalance (saldo atual)
      - projectedCashFlow (próximos 30 dias)
      - topCustomers (que mais pagam)
      - topExpenses (maiores despesas)
      - paymentMethodsDistribution

Componentes:
  FinancialDashboard:
    ┌─ Cards de Resumo ─────────────────────────┐
    │ 💰 Receber: R$ 45K  ✅ Recebido: R$ 32.5K │
    │ ⚠️  Atrasado: R$ 5K  📊 Saldo: R$ 11.3K   │
    └─────────────────────────────────────────────┘
    
    ┌─ Gráfico de Fluxo ────────────────────────┐
    │ [Entradas vs Saídas por mês]               │
    │ Bars animadas com Framer Motion            │
    └─────────────────────────────────────────────┘
    
    ┌─ Contas a Vencer (7 dias) ────────────────┐
    │ Data   | Cliente/Fornecedor | Valor       │
    │ 12/04  | João Silva         | R$ 1.200    │
    │ 14/04  | Gráfica X (forn)   | R$ 3.500    │
    └─────────────────────────────────────────────┘
    
    ┌─ Inadimplentes ───────────────────────────┐
    │ Cliente    | Valor    | Dias Atraso       │
    │ Empresa Y  | R$ 2.800 | 15 dias           │
    │ Pessoa X   | R$ 900   | 7 dias            │
    └─────────────────────────────────────────────┘
```

### 7. Notificações de Vencimento
**User Story**: Como sistema, quero alertar sobre contas próximas do vencimento.

**Especificação Técnica**:
```
Alertas Automáticos:
  - 3 dias antes do vencimento (cliente, lembrete amigável)
  - No dia do vencimento (cliente, urgência)
  - 1 dia após vencimento (cliente, notificação de atraso)
  - 7 dias após vencimento (gestor interno, alerta)
  - 30 dias após vencimento (gestor, possível calote)

Canais:
  - Email (template profissional)
  - WhatsApp (mensagem curta com link)
  - Notificação in-app (quando cliente loga)
  - SMS (urgências, futuro)

Server Actions:
  - sendPaymentReminder(receivableId)
  - sendOverdueNotification(receivableId)
  - checkDueToday()                 - Cron job diário
  - checkOverdue()                  - Cron job diário

Template de Email (Lembrete):
  Assunto: Lembrete: Fatura vence em 3 dias
  Corpo:
    - Saudação personalizada
    - Dados da fatura (número, valor)
    - Data de vencimento
    - Link para pagamento (segundo via)
    - Canais de contato
    - Tom profissional e prestativo
```

### 8. Relatórios Financeiros
**User Story**: Como gestor, quero relatórios detalhados para tomada de decisão.

**Especificação Técnica**:
```
Relatórios Disponíveis:

1. DRE (Demonstrativo de Resultado do Exercício)
   - Receita bruta
   - (-) Impostos
   - (-) Custos
   - (=) Lucro bruto
   - (-) Despesas operacionais
   - (=) Lucro líquido
   - Período selecionável

2. Contas a Receber em Aberto
   - Todas as contas pendentes
   - Ordenadas por vencimento
   - Com status de atraso
   - Totais por período

3. Contas a Pagar em Aberto
   - Todas as despesas pendentes
   - Ordenadas por vencimento
   - Totais por categoria

4. Fluxo de Caixa Detalhado
   - Todas as entradas e saídas
   - Filtrável por período, tipo, categoria
   - Exportável CSV/Excel

5. Inadimplência
   - Clientes em atraso
   - Valores totais
   - Tempo médio de atraso
   - Taxa de inadimplência

6. Análise por Cliente
   - Total gasto por cliente
   - Ticket médio
   - Frequência de compras
   - RFM (Recência, Frequência, Montante)

7. Análise por Fornecedor
   - Total gasto por fornecedor
   - Principais categorias
   - Evolução de custos

Server Actions:
  - generateDRE(dateRange)
  - getOpenReceivablesReport()
  - getOpenPayablesReport()
  - getCashFlowDetailed(dateRange)
  - getDefaultersReport()
  - getCustomerAnalysis(dateRange)
  - getSupplierAnalysis(dateRange)

Exportação:
  - PDF (relatórios formatados)
  - CSV (dados brutos)
  - Excel (com fórmulas, futuro)
```

### 9. Conciliação Bancária (Futuro)
**User Story**: Como financeiro, quero conciliar movimentos bancários com registros.

**Especificação Técnica**:
```
Integração:
  - API bancária (Open Banking, futuro)
  - Importação de OFX (formato bancário)
  - Importação de CSV (manual)

Funcionalidades:
  - Importar extrato bancário
  - Matching automático com Payments
  - Sugestões de conciliação
  - Ajustes manuais
  - Relatório de divergências

Fluxo:
  1. Importa extrato (OFX/CSV)
  2. Sistema tenta conciliar automaticamente:
     → Busca Payment com mesmo valor e data próxima
     → Sugere conciliação
  3. Usuário revisa sugestões
  4. Confirma conciliações
  5. Relatório de conciliados vs pendentes
```

## Estrutura de Arquivos Proposta
```
src/app/
└── financeiro/
    ├── page.tsx                    - Dashboard financeiro
    ├── receber/
    │   ├── page.tsx                - Listagem de contas a receber
    │   ├── novo/page.tsx           - Criação manual
    │   └── [id]/
    │       ├── page.tsx            - Detalhe
    │       └── pagamento/page.tsx  - Registrar recebimento
    ├── pagar/
    │   ├── page.tsx                - Listagem de contas a pagar
    │   ├── novo/page.tsx           - Criação manual
    │   └── [id]/
    │       ├── page.tsx            - Detalhe
    │       └── pagamento/page.tsx  - Registrar pagamento
    ├── pagamentos/
    │   └── page.tsx                - Histórico de pagamentos
    ├── fluxo-caixa/
    │   └── page.tsx                - Fluxo de caixa
    └── relatorios/
        └── page.tsx                - Relatórios financeiros

src/app/actions/
└── financial.ts
    ├── Receivables
    │   ├── createReceivable(formData)
    │   ├── createReceivablesFromOrder(orderId)
    │   ├── updateReceivable(id, formData)
    │   ├── cancelReceivable(id, reason)
    │   ├── getReceivables(params)
    │   ├── getReceivableById(id)
    │   ├── getOverdueReceivables()
    │   └── recordPayment(receivableId, paymentData)
    ├── Payables
    │   ├── createPayable(formData)
    │   ├── updatePayable(id, formData)
    │   ├── cancelPayable(id, reason)
    │   ├── recordPayablePayment(id, paymentData)
    │   ├── getPayables(params)
    │   ├── getOverduePayables()
    │   └── generateRecurringPayables()
    ├── Payments
    │   ├── createPayment(paymentData)
    │   ├── refundPayment(id, reason)
    │   ├── getPayments(params)
    │   └── getPaymentsByOrder(orderId)
    ├── CashFlow
    │   ├── getCashFlow(dateRange)
    │   ├── getCashFlowSummary(dateRange)
    │   ├── addCashFlowEntry(formData)
    │   └── getProjectedCashFlow(daysAhead)
    ├── Dashboard
    │   ├── getFinancialDashboard(dateRange)
    │   └── checkDueToday()
    └── Reports
        ├── generateDRE(dateRange)
        ├── getOpenReceivablesReport()
        ├── getOpenPayablesReport()
        ├── getCashFlowDetailed(dateRange)
        ├── getDefaultersReport()
        └── exportToCSV(data, filename)

src/components/
└── financial/
    ├── receivable-table.tsx
    ├── payable-table.tsx
    ├── payment-form.tsx
    ├── financial-dashboard.tsx
    ├── cashflow-chart.tsx
    ├── financial-summary-cards.tsx
    ├── due-date-indicator.tsx
    ├── status-badge.tsx
    ├── financial-report-generator.tsx
    └── notification-settings.tsx
```

## Validações (Zod)
```typescript
receivableSchema = z.object({
  orderId: z.string().uuid().optional(),
  customerId: z.string().uuid(),
  invoiceNumber: z.string().max(50).optional(),
  issueDate: z.date(),
  dueDate: z.date().min(new Date(), "Vencimento deve ser futuro"),
  value: z.number().positive("Valor deve ser positivo"),
  installmentNumber: z.number().int().min(1).optional(),
  totalInstallments: z.number().int().min(1).default(1),
  notes: z.string().max(500).optional()
})

payableSchema = z.object({
  supplierId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  invoiceNumber: z.string().max(50).optional(),
  issueDate: z.date(),
  dueDate: z.date(),
  value: z.number().positive(),
  recurring: z.boolean().default(false),
  recurringInterval: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]).optional(),
  notes: z.string().max(500).optional()
})

paymentSchema = z.object({
  type: z.enum(["IN", "OUT"]),
  amount: z.number().positive(),
  paymentMethod: z.enum(["CASH", "PIX", "CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "BOLETO", "CHECK", "OTHER"]),
  paymentDate: z.date().max(new Date(), "Data não pode ser futura"),
  referenceNumber: z.string().max(100).optional(),
  notes: z.string().max(500).optional()
})
```

## Testes Necessários
- [ ] Teste de geração automática de contas a receber a partir de pedido
- [ ] Teste de parcelamento
- [ ] Teste de registro de recebimento total
- [ ] Teste de registro de recebimento parcial
- [ ] Teste de atualização de status
- [ ] Teste de criação de conta a pagar
- [ ] Teste de recorrência
- [ ] Teste de registro de pagamento
- [ ] Teste de cálculo de fluxo de caixa
- [ ] Teste de projeção financeira
- [ ] Teste de alertas de vencimento
- [ ] Teste de relatórios financeiros
- [ ] Teste de isolamento por tenant

## Métricas de Sucesso
- Taxa de recebimento > 90%
- Taxa de inadimplência < 5%
- Tempo médio de recebimento < 30 dias
- Precisão de fluxo de caixa projetado > 85%

## Dependências
- Módulo de Vendas (pedidos geram contas a receber)
- Módulo de CRM (clientes e fornecedores)
- Módulo de Autenticação (usuários)
