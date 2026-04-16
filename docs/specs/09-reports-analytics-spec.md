# Spec: Módulo de Relatórios e Analytics

## Contexto
Sistema ERP multi-tenant para gráficas. Módulo de relatórios fornece insights e análises para decisão.

## Estado Atual
- ❌ Não implementado
- Dashboard admin tem estatísticas básicas
- Dados disponíveis em todos os módulos

## Requisitos do Módulo

### 1. Relatórios de Vendas
**User Story**: Como gestor, quero analisar performance de vendas.

**Critérios de Aceitação**:
- Vendas por período
- Vendas por produto
- Vendas por cliente
- Vendas por vendedor
- Ticket médio
- Taxa de conversão

**Especificação Técnica**:
```
Rota: /relatorios/vendas (Server Component)

Server Actions:
  - getSalesReport(dateRange, filters)
  - getSalesByProduct(dateRange)
  - getSalesByCustomer(dateRange)
  - getSalesBySalesperson(dateRange)
  - getAverageTicket(dateRange)
  - getConversionRate(dateRange)
  - getSalesComparison(currentPeriod, previousPeriod)

Métricas:
  - Total vendido (R$)
  - Quantidade de pedidos
  - Ticket médio
  - Produto mais vendido
  - Cliente que mais comprou
  - Melhor vendedor
  - Comparativo com período anterior (% variação)

Visualizações:
  1. Resumo com cards de métricas
  2. Gráfico de vendas por dia/semana/mês
  3. Top 10 produtos (barras horizontais)
  4. Top 10 clientes (barras horizontais)
  5. Mapa de calor por dia da semana/hora
  6. Evolução de vendas (linha temporal)

Componentes:
  SalesReportDashboard:
    - Date range picker
    - Filtros (produto, cliente, vendedor)
    - Cards de métricas com variação %
    - Gráficos interativos
    - Botão de exportação
```

### 2. Relatórios Financeiros
**User Story**: Como gestor, quero analisar performance financeira.

**Especificação Técnica**:
```
Rota: /relatorios/financeiro

Server Actions:
  - getFinancialSummary(dateRange)
  - getReceivablesReport(dateRange)
  - getPayablesReport(dateRange)
  - getCashFlowAnalysis(dateRange)
  - getProfitabilityReport(dateRange)
  - getAgingReport()                    - Análise de inadimplência

Relatórios Disponíveis:

  1. DRE (Demonstrativo de Resultado)
     Receita Bruta
     (-) Impostos
     (-) Custos de Produção
     (=) Lucro Bruto
     (-) Despesas Operacionais
     (-) Despesas Administrativas
     (=) Lucro Líquido
  
  2. Fluxo de Caixa
     Entradas previstas vs realizadas
     Saídas previstas vs realizadas
     Saldo acumulado
     Projeção futura
  
  3. Inadimplência
     Total em atraso
     Por faixa de dias (1-30, 31-60, 61-90, 90+)
     Top clientes inadimplentes
     Taxa de inadimplência
  
  4. Rentabilidade por Produto
     Receita por produto
     Custo de produção
     Margem de lucro
     Ranking por rentabilidade

Visualizações:
  - Gráfico de pizza: despesas por categoria
  - Gráfico de barras: receitas vs despesas mensal
  - Linha: evolução de saldo
  - Tabela: top despesas
```

### 3. Relatórios de Produção
**User Story**: Como gestor, quero analisar eficiência produtiva.

**Especificação Técnica**:
```
Rota: /relatorios/producao

Server Actions:
  - getProductionSummary(dateRange)
  - getProductionByProduct(dateRange)
  - getOperatorEfficiency(dateRange)
  - getRejectionReport(dateRange)
  - getOnTimeDeliveryRate(dateRange)

Métricas:
  - Itens produzidos
  - Tempo médio de produção
  - Taxa de rejeição
  - Entregas no prazo (%)
  - Eficiência por operador
  - Produto mais produzido
  - Gargalos (colunas com mais itens)

Visualizações:
  - Gráfico de produção diária
  - Barras: produção por produto
  - Pizza: status atual dos itens
  - Tabela: eficiência por operador
  - Heatmap: produção por dia/hora
```

### 4. Relatórios de Estoque
**User Story**: Como gestor, quero analisar movimentação de estoque.

**Especificação Técnica**:
```
Rota: /relatorios/estoque

Server Actions:
  - getInventorySummary()
  - getInventoryMovements(dateRange)
  - getLowStockReport()
  - getLossReport(dateRange)
  - getInventoryTurnover()

Métricas:
  - Valor total em estoque (custo)
  - Produtos com estoque baixo
  - Produtos sem estoque
  - Giro de estoque (turnover)
  - Total perdido (perdas, R$)
  - Entradas vs saídas
  - Produtos parados (sem movimentação > 30 dias)

Relatórios:
  1. Posição de Estoque
     Produto | Qtd Atual | Custo Unit | Valor Total
     Ordenado por valor total
  
  2. Movimentações
     Data | Produto | Tipo | Qtd | Usuário | Motivo
     Filtrável por tipo e período
  
  3. Perdas
     Data | Produto | Qtd | Motivo | Custo
     Total por motivo
```

### 5. Análise de Clientes (RFM)
**User Story**: Como gestor, quero entender comportamento dos clientes.

**Especificação Técnica**:
```
Rota: /relatorios/clientes

RFM Analysis:
  Recência (R): Dias desde última compra
  Frequência (F): Quantidade de compras
  Montante (M): Valor total gasto

  Pontuação 1-5 para cada dimensão:
    R5: Comprou nos últimos 7 dias
    R4: Comprou nos últimos 30 dias
    R3: Comprou nos últimos 90 dias
    R2: Comprou nos últimos 180 dias
    R1: Comprou há mais de 180 dias

    F5: Comprou > 20 vezes
    F4: Comprou 10-20 vezes
    F3: Comprou 5-10 vezes
    F2: Comprou 2-5 vezes
    F1: Comprou 1 vez

    M5: Gastou > R$ 10.000
    M4: Gastou R$ 5.000-10.000
    M3: Gastou R$ 2.000-5.000
    F2: Gastou R$ 500-2.000
    M1: Gastou < R$ 500

  Segmentação:
    - Campeões (R5, F5, M5): VIPs, tratar especial
    - Leais (R4-5, F4-5, M3-5): Base fiel
    - Potenciais (R4-5, F2-3, M2-3): Podem comprar mais
    - Em risco (R2-3, F3-5, M3-5): Compravam muito, pararam
    - Perdidos (R1, F1-2, M1-2): Churn provável

Server Actions:
  - getRFMAnalysis()
  - getCustomerSegments()
  - getCustomerLifetimeValue(customerId)
  - getChurnRate()
  - getRepeatPurchaseRate()

Visualizações:
  - Matriz RFM (heatmap 5x5x5 simplificado)
  - Distribuição por segmento (pizza)
  - Top clientes por LTV
  - Taxa de retenção ao longo do tempo
```

### 6. Dashboard Customizável
**User Story**: Como usuário, quero personalizar meu dashboard com widgets.

**Especificação Técnica**:
```
Rota: /relatorios/dashboard (Server Component)

Funcionalidades:
  - Adicionar/remover widgets
  - Redimensionar widgets (grid)
  - Reordenar (drag-and-drop)
  - Configurar período padrão
  - Salvar layout por usuário

Widget Types:
  - Métricas (cards com números)
  - Gráfico de barras
  - Gráfico de linha
  - Gráfico de pizza
  - Tabela
  - Lista (top produtos, clientes)
  - Texto livre (notas)

Model: DashboardWidget (futuro)
  - userId (dono do layout)
  - type (METRIC, BAR_CHART, LINE_CHART, etc)
  - title
  - config (JSON, configurações do widget)
  - position (JSON, x, y, w, h)
  - sortOrder
  - isVisible

Server Actions:
  - saveDashboardLayout(widgets[])
  - getDashboardLayout(userId)
  - getWidgetData(widgetId, dateRange)

Exemplo de Layout:
  ┌─────────────────────────────────────────┐
  │ [Receita: R$ 45K] [Pedidos: 123]       │
  │ [Ticket Médio: R$ 365] [Novos: 23]     │
  ├──────────────────┬──────────────────────┤
  │                  │                      │
  │  Vendas 30 dias  │  Top Produtos        │
  │  [gráfico linha] │  [barras horizontais]│
  │                  │                      │
  ├──────────────────┴──────────────────────┤
  │                                         │
  │  Últimos Pedidos                        │
  │  [tabela com 5 últimos]                 │
  │                                         │
  └─────────────────────────────────────────┘
```

### 7. Exportação de Relatórios
**User Story**: Como usuário, quero exportar relatórios em diversos formatos.

**Especificação Técnica**:
```
Formatos de Exportação:
  
  1. CSV
     - Dados brutos
     - Separador: vírgula ou ponto-e-vírgula
     - Encoding: UTF-8 BOM (compatível Excel)
     - Headers na primeira linha
  
  2. PDF
     - Relatório formatado
     - Logo da empresa
     - Filtros aplicados no cabeçalho
     - Tabelas estilizadas
     - Gráficos renderizados
     - Rodapé com paginação
  
  3. Excel (XLSX)
     - Múltiplas abas (resumo + detalhes)
     - Fórmulas para totais
     - Formatação condicional
     - Gráficos embedados (futuro)

Server Actions:
  - exportToCSV(data, filename, options)
    → Gera string CSV
    → Retorna como download
  
  - exportToPDF(reportData, template)
    → Usa biblioteca de geração de PDF
    → Puppeteer (serverless) ou @react-pdf/renderer
    → Retorna blob ou URL
  
  - exportToExcel(data, filename, sheets)
    → Usa biblioteca xlsx ou exceljs
    → Retorna como download

Componentes:
  ExportButton:
    - Dropdown com formatos
    - Loading durante geração
    - Feedback de sucesso/erro
    - Configurações de exportação (colunas)
```

### 8. Agendamento de Relatórios
**User Story**: Como gestor, quero receber relatórios automáticos por email.

**Especificação Técnica**:
```
Model: ScheduledReport (futuro)
  - name
  - type (SALES, FINANCIAL, PRODUCTION, etc)
  - frequency (DAILY, WEEKLY, MONTHLY)
  - dayOfWeek (se WEEKLY)
  - dayOfMonth (se MONTHLY)
  - time (HH:MM)
  - recipients (array de emails)
  - format (PDF, CSV, XLSX)
  - filters (JSON, período, segmentos)
  - isActive
  - lastRunAt
  - createdBy

Server Actions:
  - createScheduledReport(formData)
  - updateScheduledReport(id, formData)
  - deleteScheduledReport(id)
  - getScheduledReports()
  - runScheduledReport(id)
    → Gera relatório com filtros
    → Exporta no formato
    → Envia por email para recipients
    → Atualiza lastRunAt
    → Log de execução

Cron Jobs:
  - Verifica relatórios agendados a cada hora
  - Executa se current time >= scheduled time
  - Retry em caso de falha (3 tentativas)
  - Notifica admin se falhar

UI de Agendamento:
  ┌─ Agendar Relatório ──────────────────────┐
  │ Nome: [Relatório Semanal de Vendas]      │
  │ Tipo: [Vendas ▼]                          │
  │ Frequência: [Semanal ▼]                   │
  │ Dia: [Segunda ▼]                          │
  │ Hora: [08:00]                             │
  │ Formato: [PDF ▼]                          │
  │                                           │
  │ Destinatários:                            │
  │ [gestor@empresa.com] [x]                  │
  │ [financeiro@empresa.com] [x]              │
  │ [+ Adicionar]                             │
  │                                           │
  │ Filtros:                                  │
  │ Período: [Últimos 7 dias ▼]               │
  │                                           │
  │ [Salvar] [Testar Agora]                   │
  └───────────────────────────────────────────┘
```

### 9. Analytics Avançado (Futuro)
**User Story**: Como gestor, quero previsões e insights automáticos.

**Especificação Técnica**:
```
Previsões:
  - Previsão de vendas (próximo mês)
  - Tendência de crescimento
  - Previsão de estoque (quando acaba)
  - Previsão de fluxo de caixa
  - Alertas proativos

Insights Automáticos:
  - "Vendas de cartões cresceram 23% este mês"
  - "Cliente X não compra há 45 dias"
  - "Produto Y tem margem abaixo da média"
  - "Produção atrasada aumentou 15% vs semana passada"
  - "Estoque de papel acaba em 5 dias no ritmo atual"

Implementação:
  - Análise estatística simples (médias móveis)
  - Regras de alerta configuráveis
  - Geração de texto natural (LLM)
  - Notificações proativas

Server Actions:
  - generateInsights(dateRange)
  - getPredictiveAnalytics()
  - getAlerts()
```

## Estrutura de Arquivos Proposta
```
src/app/
└── relatorios/
    ├── page.tsx                    - Dashboard de relatórios
    ├── vendas/
    │   └── page.tsx                - Relatório de vendas
    ├── financeiro/
    │   └── page.tsx                - Relatório financeiro
    ├── producao/
    │   └── page.tsx                - Relatório de produção
    ├── estoque/
    │   └── page.tsx                - Relatório de estoque
    ├── clientes/
    │   └── page.tsx                - Análise de clientes (RFM)
    ├── dashboard/
    │   └── page.tsx                - Dashboard customizável
    └── agendamentos/
        └── page.tsx                - Relatórios agendados

src/app/actions/
├── reports/
│   ├── sales.ts
│   │   ├── getSalesReport(params)
│   │   ├── getSalesByProduct(params)
│   │   ├── getSalesByCustomer(params)
│   │   └── getSalesComparison(params)
│   ├── financial.ts
│   │   ├── getFinancialSummary(params)
│   │   ├── getReceivablesReport(params)
│   │   ├── getPayablesReport(params)
│   │   └── getProfitabilityReport(params)
│   ├── production.ts
│   │   ├── getProductionSummary(params)
│   │   ├── getOperatorEfficiency(params)
│   │   └── getRejectionReport(params)
│   ├── inventory.ts
│   │   ├── getInventorySummary()
│   │   ├── getInventoryMovements(params)
│   │   └── getLossReport(params)
│   └── customers.ts
│       ├── getRFMAnalysis()
│       ├── getCustomerSegments()
│       ├── getCustomerLifetimeValue(id)
│       └── getChurnRate()
├── export.ts
│   ├── exportToCSV(data, filename, options)
│   ├── exportToPDF(reportData, template)
│   └── exportToExcel(data, filename, sheets)
└── scheduled-reports.ts
    ├── createScheduledReport(formData)
    ├── updateScheduledReport(id, formData)
    ├── deleteScheduledReport(id)
    ├── getScheduledReports()
    └── runScheduledReport(id)

src/components/
└── reports/
    ├── report-header.tsx
    ├── date-range-picker.tsx
    ├── metric-cards.tsx
    ├── bar-chart.tsx
    ├── line-chart.tsx
    ├── pie-chart.tsx
    ├── data-table.tsx
    ├── export-button.tsx
    ├── dashboard-widget.tsx
    ├── dashboard-grid.tsx
    ├── widget-configurator.tsx
    ├── scheduled-report-form.tsx
    └── rfm-matrix.tsx
```

## Testes Necessários
- [ ] Teste de relatório de vendas com filtros
- [ ] Teste de relatório financeiro (DRE)
- [ ] Teste de análise RFM
- [ ] Teste de exportação CSV
- [ ] Teste de exportação PDF
- [ ] Teste de agendamento de relatório
- [ ] Teste de execução de relatório agendado
- [ ] Teste de dashboard customizável
- [ ] Teste de carregamento com grande volume de dados
- [ ] Teste de isolamento por tenant

## Métricas de Sucesso
- Tempo de geração de relatório < 5 segundos
- Exportação de 10.000 registros < 10 segundos
- Relatórios agendados entregues em 100% dos casos
- Uso do dashboard customizável > 50% dos usuários

## Dependências
- Todos os módulos (dados para relatórios)
- Biblioteca de gráficos (Framer Motion ou Recharts)
- Biblioteca de exportação (xlsx, @react-pdf/renderer)
- Email (para relatórios agendados)
