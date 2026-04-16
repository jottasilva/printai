# Spec: Módulo Dashboard Admin

## Contexto
Sistema ERP multi-tenant para gráficas. Dashboard é a página principal de administração.

## Estado Atual
- ✅ Implementado (`/admin/page.tsx`)
- ✅ Dados reais do banco via Prisma
- ✅ Cards de estatísticas (StatCard)
- ✅ ActivityChart com Framer Motion
- ✅ Tabela de pedidos recentes
- ⚠️ Faltam: filtros de período, métricas customizáveis, widgets

## Requisitos do Módulo

### 1. Dashboard Principal (Melhorias)
**User Story**: Como administrador, quero visão geral do negócio ao acessar o sistema.

**Critérios de Aceitação**:
- Métricas chave do dia/período
- Comparativo com período anterior
- Alertas e notificações
- Atividade recente
- Top produtos e clientes

**Melhorias no Dashboard Atual**:
```
Server Actions:
  - getDashboardData(dateRange)     - melhorar, adicionar período
  - getComparisonData(previousRange) - dados comparativos
  - getAlerts()                     - alertas ativos
  - getNotifications(userId)        - notificações do usuário

Métricas Atuais (manter):
  ✅ Produtos ativos
  ✅ Pedidos pendentes
  ✅ Em produção
  ✅ Pedidos hoje
  ✅ Completados na semana

Métricas a Adicionar:
  - Receita do período
  - Ticket médio
  - Novos clientes (período)
  - Taxa de conversão
  - Contas a receber (previsto)
  - Contas a pagar (previsto)
  - Saldo do dia
  - Estoque baixo (alertas)
  - Pedidos atrasados

Comparativos:
  - vs período anterior (ex: ontem, semana passada, mês passado)
  - Indicador visual: ↑ verde (crescimento), ↓ vermelho (queda)
  - Percentual de variação

Exemplo:
  ┌──────────────────────────────────────┐
  │ Receita Hoje                         │
  │ R$ 3.450,00     ↑ +12.5% vs ontem   │
  └──────────────────────────────────────┘
```

### 2. Filtro de Período Global
**User Story**: Como usuário, quero filtrar dashboard por período.

**Especificação Técnica**:
```
Componente: DateRangePicker
  - Presets: Hoje, Ontem, Últimos 7 dias, Últimos 30 dias, Este mês, Mês passado
  - Custom: Date range picker
  - Aplica a todos os widgets
  - Persiste em localStorage
  - URL params para compartilhamento

Server Actions:
  - getDashboardData(dateRange)
    → Todas as métricas respeitam dateRange
    → Comparativo com período de mesmo tamanho anterior

Fluxo:
  1. Usuário seleciona período
  2. Sistema recarrega dados
  3. Todos os widgets atualizam
  4. URL atualizada com params
  5. Período salvo em localStorage
```

### 3. Widget de Alertas
**User Story**: Como gestor, quero ver alertas importantes no dashboard.

**Especificação Técnica**:
```
Tipos de Alertas:
  - Estoque baixo (módulo estoque)
  - Pedidos atrasados (módulo produção)
  - Contas a vencer hoje (módulo financeiro)
  - Contas em atraso (módulo financeiro)
  - Orçamentos prestes a expirar (módulo vendas)
  - Conversas aguardando (módulo conversas)
  - Produção com itens rejeitados (módulo produção)

Server Actions:
  - getActiveAlerts()
    → Consulta todos os módulos
    → Retorna alertas ativos ordenados por prioridade
    → Limita a 10 alertas

Componente: AlertWidget
  ┌─ Alertas ──────────────────────────────┐
  │ 🔴 3 pedidos atrasados        [Ver]    │
  │ 🟡 5 produtos estoque baixo   [Ver]    │
  │ 🟠 2 contas vencem hoje       [Ver]    │
  │ 🔵 8 orçamentos expiram amanhã [Ver]   │
  │                                        │
  │ [Ver Todos]                            │
  └────────────────────────────────────────┘

  Badges de prioridade:
    🔴 Crítico (urgente)
    🟠 Alto (hoje)
    🟡 Médio (esta semana)
    🔵 Baixo (informação)
```

### 4. Widget de Atividade Recente
**User Story**: Como usuário, quero ver atividades recentes do sistema.

**Especificação Técnica**:
```
Server Actions:
  - getRecentActivity(limit)
    → Consulta AuditLog
    → Retorna últimas N atividades
    → Inclui: tipo, usuário, entidade, timestamp

Componente: RecentActivityWidget
  ┌─ Atividade Recente ────────────────────┐
  │ 10:45 - Carlos criou pedido #123       │
  │ 10:30 - Maria concluiu item #456       │
  │ 10:15 - Sistema gerou 3 contas receber │
  │ 09:50 - Ana registrou pagamento R$ 500 │
  │ 09:30 - João adicionou produto X       │
  │                                        │
  │ [Ver Histórico Completo]               │
  └────────────────────────────────────────┘
```

### 5. Widget de Top Produtos
**User Story**: Como gestor, quero ver produtos mais vendidos.

**Especificação Técnica**:
```
Server Actions:
  - getTopProducts(dateRange, limit)
    → Agrupa OrderItems por produto
    → Soma quantity e revenue
    → Ordena por revenue ou quantity

Componente: TopProductsWidget
  ┌─ Top Produtos - Últimos 30 Dias ───────┐
  │ 1. Cartão Visita 500un   156 R$ 14.024 │
  │ 2. Panfleto A4 1000un     89 R$ 10.680 │
  │ 3. Camiseta M             67 R$  3.350 │
  │ 4. Banner 1x3m            45 R$  6.750 │
  │ 5. Adesivo A3            234 R$  4.680 │
  │                                         │
  │ [Ver Relatório Completo]                │
  └─────────────────────────────────────────┘
```

### 6. Widget de Pedidos Recentes
**User Story**: Como operador, quero ver últimos pedidos rapidamente.

**Especificação Técnica**:
```
Server Actions:
  - getRecentOrders(limit)
    → Últimos N pedidos com cliente e status
    → Inclui status de produção e pagamento

Componente: RecentOrdersWidget (já existe, melhorar)
  ┌─ Pedidos Recentes ─────────────────────┐
  │ Nº      | Cliente    | Valor  | Status │
  │ #123    | João Silva | R$ 850 | 🟡 Prod│
  │ #122    | Maria S.   | R$1.200| 🟢 Ent │
  │ #121    | Empresa X  | R$2.500| 🔵 Pend│
  │ #120    | Ana Costa  | R$ 450 | 🟡 Prod│
  │                                         │
  │ [Ver Todos os Pedidos]                  │
  └─────────────────────────────────────────┘
```

### 7. Gráficos do Dashboard
**User Story**: Como gestor, quero gráficos visuais de performance.

**Especificação Técnica**:
```
Gráficos Atuais:
  ✅ ActivityChart (barras, Framer Motion)

Gráficos a Adicionar:

  1. Receita ao Longo do Tempo
     - Tipo: Linha
     - Período: últimos 30 dias
     - Comparativo com período anterior
     - Tooltip com valores
  
  2. Vendas por Produto
     - Tipo: Pizza ou Donut
     - Top 5 produtos + outros
     - Porcentagem e valor
  
  3. Pedidos por Status
     - Tipo: Barras horizontais
     - Contagem por status
     - Cores por status
  
  4. Faturamento Mensal
     - Tipo: Barras
     - Últimos 12 meses
     - Receitas vs Despesas
  
  5. Clientes Novos vs Ativos
     - Tipo: Linha dupla
     - Novos clientes por mês
     - Clientes ativos (compraram)

Biblioteca de Gráficos:
  Opção 1: Recharts (recomendado)
    - Leve, flexível
    - Baseado em SVG
    - Server component compatible
  
  Opção 2: Chart.js + react-chartjs-2
    - Mais popular
    - Bom para gráficos complexos
  
  Opção 3: Manter Framer Motion
    - Animações customizadas
    - Mais trabalho manual
    - Bom para gráficos simples
```

### 8. Dashboard Customizável
**User Story**: Como usuário, quero personalizar quais widgets vejo.

**Especificação Técnica**:
```
Funcionalidades:
  - Toggle para mostrar/esconder widgets
  - Reordenar widgets (drag-and-drop)
  - Redimensionar (sm, md, lg, xl)
  - Salvar preferências por usuário
  - Presets de layout (padrão, vendas, produção, financeiro)

Model: UserDashboardPreference (futuro)
  - userId
  - layout (JSON, estrutura dos widgets)
  - preset (string, nome do preset)
  - updatedAt

Server Actions:
  - saveDashboardLayout(layout)
  - getDashboardLayout(userId)
  - resetDashboardLayout()

Componentes:
  DashboardCustomizer:
    - Modal de configuração
    - Lista de widgets disponíveis
    - Drag para reordenar
    - Toggle visibilidade
    - Seletor de tamanho
    - Preview em tempo real
    - Botão de reset

Layout Grid:
  - Grid responsivo (1-4 colunas)
  - Widgets com span variável
  - Breakpoints: sm (1), md (2), lg (3), xl (4)
```

### 9. Notificações
**User Story**: Como usuário, quero ser notificado de eventos importantes.

**Especificação Técnica**:
```
Tipos de Notificação:
  - Novo pedido recebido
  - Pedido concluído
  - Pagamento confirmado
  - Orçamento aceito/recusado
  - Estoque baixo
  - Conta a vencer
  - Conversa atribuída
  - Item rejeitado em produção

Server Actions:
  - getNotifications(userId, limit)
  - markNotificationAsRead(id)
  - markAllAsRead(userId)
  - deleteNotification(id)
  - getUnreadCount(userId)

Model: Notification (futuro)
  - userId (destinatário)
  - type (ORDER, PAYMENT, INVENTORY, etc)
  - title
  - message
  - link (URL para detalhe)
  - isRead
  - createdAt
  - metadata (JSON)

UI:
  - Sino na navbar
  - Badge com contador de não lidas
  - Dropdown com últimas notificações
  - Click abre detalhe e marca como lida
  - "Marcar todas como lidas"
  - Link para página de notificações

Componente: NotificationBell
  ┌─ Notificações (3) ─────────────────────┐
  │ 🔔 Novo pedido #123             10:45  │
  │    João Silva - R$ 850,00              │
  │    [Ver]                                │
  │                                         │
  │ ✅ Pagamento confirmado          09:30  │
  │    Pedido #120 - R$ 450,00             │
  │    [Ver]                                │
  │                                         │
  │ ⚠️  Estoque baixo                08:00  │
  │    Cartão de Visita: 12un restantes    │
  │    [Ver]                                │
  │                                         │
  │ [Ver Todas] [Marcar Todas como Lidas]  │
  └────────────────────────────────────────┘
```

### 10. Performance e Otimização
**User Story**: Como usuário, quero dashboard rápido mesmo com muitos dados.

**Especificação Técnica**:
```
Otimizações:
  
  1. Cache de Dados
     - React Query ou SWR para cache client-side
     - Revalidação periódica (30s, 1min, 5min)
     - Cache por usuário (dados isolados)
  
  2. Query Optimization
     - Índices em colunas de filtro
     - Queries otimizadas com Prisma
     - Evitar N+1 queries
     - Uso de select para campos específicos
  
  3. Streaming/SSR
     - Server Components com streaming
     - Loading states granulares
     - Skeleton screens por widget
  
  4. Lazy Loading
     - Widgets carregados sob demanda
     - Gráficos carregados após paint inicial
     - Intersection Observer para widgets abaixo da dobra

Implementação:
  // Server Component com streaming
  export default async function AdminDashboard() {
    const metrics = getMetrics();          // Fast
    const alerts = getAlerts();            // Fast
    const charts = getChartData();         // Slow
    const activity = getActivity();        // Medium

    return (
      <>
        <Suspense fallback={<MetricsSkeleton />}>
          <Metrics data={await metrics} />
        </Suspense>
        
        <Suspense fallback={<AlertsSkeleton />}>
          <Alerts data={await alerts} />
        </Suspense>
        
        <Suspense fallback={<ChartsSkeleton />}>
          <Charts data={await charts} />
        </Suspense>
        
        <Suspense fallback={<ActivitySkeleton />}>
          <Activity data={await activity} />
        </Suspense>
      </>
    );
  }
```

## Estrutura de Arquivos Proposta
```
src/app/
└── admin/
    ├── page.tsx                    - Dashboard principal (melhorar)
    ├── notificacoes/
    │   └── page.tsx                - Página de notificações
    └── layout-customizar/
        └── page.tsx                - Customização de layout

src/app/actions/
└── dashboard.ts (expandir)
    ├── getDashboardData(dateRange)         - melhorar
    ├── getComparisonData(previousRange)
    ├── getActiveAlerts()
    ├── getNotifications(userId, limit)
    ├── markNotificationAsRead(id)
    ├── markAllNotificationsAsRead(userId)
    ├── getRecentActivity(limit)
    ├── getTopProducts(dateRange, limit)
    ├── getRecentOrders(limit)
    ├── getRevenueOverTime(dateRange)
    ├── getOrdersByStatus()
    ├── getMonthlyRevenue()
    ├── saveDashboardLayout(layout)
    └── getDashboardLayout(userId)

src/components/
└── dashboard/
    ├── metrics-summary.tsx         - Cards de métricas
    ├── alerts-widget.tsx           - Widget de alertas
    ├── recent-activity.tsx         - Atividade recente
    ├── top-products.tsx            - Top produtos
    ├── recent-orders.tsx           - Pedidos recentes
    ├── revenue-chart.tsx           - Gráfico de receita
    ├── products-chart.tsx          - Gráfico de produtos
    ├── status-chart.tsx            - Pedidos por status
    ├── dashboard-grid.tsx          - Grid de widgets
    ├── widget-wrapper.tsx          - Wrapper de widget
    ├── date-range-picker.tsx       - Seletor de período
    ├── notification-bell.tsx       - Sino de notificações
    └── layout-customizer.tsx       - Customizador de layout
```

## Testes Necessários
- [ ] Teste de carregamento de métricas
- [ ] Teste de filtro de período
- [ ] Teste de comparativo de períodos
- [ ] Teste de alertas
- [ ] Teste de notificações
- [ ] Teste de marcação como lida
- [ ] Teste de customização de layout
- [ ] Teste de salvamento de preferências
- [ ] Teste de gráficos com dados
- [ ] Teste de performance (carga)
- [ ] Teste de isolamento por tenant

## Métricas de Sucesso
- Dashboard carrega em < 2 segundos
- Zero N+1 queries
- Uso de customização > 30% dos usuários
- Notificações entregues em < 5 segundos

## Dependências
- Todos os módulos (dados agregados)
