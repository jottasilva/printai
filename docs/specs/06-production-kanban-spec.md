# Spec: Módulo de Produção (Kanban)

## Contexto
Sistema ERP multi-tenant para gráficas. Módulo de produção gerencia fluxo de fabricação de pedidos.

## Estado Atual
- ✅ Kanban básico implementado (`/producao/page.tsx`)
- ✅ Server actions: `getProductionItems()`, `updateProductionStatus()`, `updateItemNote()`
- ✅ Drag-and-drop entre colunas
- ✅ Cards com prioridade visual
- ⚠️ Falta: atribuição de operadores, tempos, alertas de atraso

## Requisitos do Módulo

### 1. Kanban de Produção (Melhorias)
**User Story**: Como operador, quero visualizar e gerenciar todos os itens em produção.

**Critérios de Aceitação**:
- 5 colunas: PENDING, QUEUED, IN_PROGRESS, PAUSED, DONE
- Drag-and-drop funcional
- Atualização otimista
- Cards informativos
- Filtros por prioridade, operador, pedido

**Melhorias no Kanban Atual**:
```
Cards devem mostrar:
  - Número do pedido (link)
  - Nome do produto
  - Quantidade
  - Prioridade (barra lateral colorida)
  - Operador responsável (avatar)
  - Tempo decorrido (badge se atrasado)
  - Prazo de entrega

Colunas com:
  - Contador de itens
  - Capacidade atual (opcional)
  - Cor de cabeçalho por status

Filtros Globais:
  - Por prioridade (URGENT, HIGH, NORMAL, LOW)
  - Por operador
  - Por pedido
  - Por produto
  - Prazo (vence hoje, esta semana, atrasados)

Server Actions (expandir):
  - getProductionItems(filters)     - já existe, adicionar filtros
  - updateProductionStatus(id, status) - já existe
  - batchUpdateStatus(ids, status)  - Múltiplos itens
  - getProductionStats()            - já existe na página
```

### 2. Detail Page do Item de Produção
**User Story**: Como operador, quero ver detalhes de um item em produção.

**Especificação Técnica**:
```
Rota: /producao/[itemId] (Server Component)

Informações:
  - Produto e variante
  - Pedido vinculado
  - Cliente
  - Quantidade
  - Prioridade
  - Status atual
  - Operador responsável
  - Prazo de entrega
  - Notas de produção
  - Especificações técnicas
  - Histórico de status

Server Actions:
  - getOrderItemDetail(id)
  - updateProductionStatus(id, status)  - já existe
  - updateItemNote(id, note)            - já existe
  - assignOperator(itemId, userId)
  - removeOperator(itemId, userId)
  - getItemProductionHistory(id)

Layout:
  ┌─────────────────────────────────────────┐
  │ [Voltar]  Item #OI-2026-0456           │
  │ Pedido: #PED-2026-0123 | João Silva    │
  │                                         │
  │ ┌─ Produto ─────────┬─ Produção ──────┐│
  │ │ Cartão Visita     │ Status:         ││
  │ │ 500un - Couché    │ IN_PROGRESS     ││
  │ │ 300g              │                 ││
  │ │ Frente: Colorido  │ Operador:       ││
  │ │ Verso: P&B        │ Carlos S.       ││
  │ └───────────────────┴─────────────────┘│
  │                                         │
  │ ┌─ Prazos ─────────────────────────────┐│
  │ │ Início:    10/04/2026 09:00         ││
  │ │ Previsto:  12/04/2026                ││
  │ │ Entrega:   15/04/2026                ││
  │ │ Decorrido: 2 dias                    ││
  │ │ Status:    ✅ No prazo               ││
  │ └──────────────────────────────────────┘│
  │                                         │
  │ ┌─ Notas de Produção ──────────────────┐│
  │ │ [Editar Notas]                       ││
  │ │ - Acabamento fosco                   ││
  │ │ - Cantos arredondados                ││
  │ │ - Atenção à cor (Pantone 186C)       ││
  │ └──────────────────────────────────────┘│
  │                                         │
  │ ┌─ Especificações Técnicas ────────────┐│
  │ │ Papel: Couchê 300g                   ││
  │ │ Impressão: 4x0 (frente colorida)     ││
  │ │ Acabamento: Laminação fosca + canto  ││
  │ │ Formato: 9x5cm                       ││
  │ └──────────────────────────────────────┘│
  │                                         │
  │ ┌─ Histórico ──────────────────────────┐│
  │ │ 09/04 08:00 - PENDING → QUEUED      ││
  │ │ 10/04 09:00 - QUEUED → IN_PROGRESS  ││
  │ │         Por: Carlos S.               ││
  │ └──────────────────────────────────────┘│
  │                                         │
  │ [Iniciar Produção] [Pausar] [Concluir] │
  │ [Rejeitar]                             │
  └─────────────────────────────────────────┘
```

### 3. Atribuição de Operadores
**User Story**: Como gestor, quero atribuir operadores a itens de produção.

**Especificação Técnica**:
```
Model: OrderItem (novos campos via migration ou metadata)
  - assignedTo (userId, opcional)
  - assignedAt (timestamp)
  
Ou usar metadata JSON:
  metadata: {
    "assignedTo": "user-uuid",
    "assignedAt": "2026-04-10T09:00:00Z"
  }

Server Actions:
  - assignOperator(itemId, userId)
    → Verifica se usuário tem role OPERATOR ou superior
    → Atualiza OrderItem.assignedTo
    → Log de atribuição
  
  - removeOperator(itemId)
    → Remove atribuição
    → Log

UI:
  - Dropdown no card do Kanban
  - Avatar do operador visível
  - Filtro por operador no Kanban
  - Dashboard de carga por operador

Dashboard de Carga:
  ┌─ Carga por Operador ────────────────┐
  │ Operador    | Ativos | Concluídos   │
  │ Carlos S.   |   5    |    23        │
  │ Ana M.      |   3    |    18        │
  │ Roberto L.  |   7    |    31        │
  │ Sem atribuir|   4    |     -        │
  └─────────────────────────────────────┘
```

### 4. Controle de Tempo e Prazos
**User Story**: Como gestor, quero monitorar tempos de produção e alertar atrasos.

**Especificação Técnica**:
```
Model: OrderItem (novos campos)
  - estimatedHours (Int, horas estimadas)
  - startedAt (timestamp, já existe?)
  - finishedAt (timestamp, já existe?)
  - pausedAt (timestamp)
  - totalPausedTime (Int, minutos em pausa)

Cálculos:
  elapsedHours = (now - startedAt) - totalPausedTime
  remainingHours = estimatedHours - elapsedHours
  isOverdue = elapsedHours > estimatedHours
  efficiency = estimatedHours / actualHours * 100

Alertas:
  - Badge vermelho se isOverdue = true
  - Alerta quando elapsedHours > estimatedHours * 0.8 (80%)
  - Notificação ao gestor se item próximo do prazo

Server Actions:
  - startProduction(id)
    → status = IN_PROGRESS
    → startedAt = now
    → Log
  
  - pauseProduction(id, reason)
    → status = PAUSED
    → pausedAt = now
    → reason em notes
  
  - resumeProduction(id)
    → status = IN_PROGRESS
    → totalPausedTime += (now - pausedAt)
    → pausedAt = null
  
  - finishProduction(id)
    → status = DONE
    → finishedAt = now
    → Calcula eficiência
    → Se trackInventory: adiciona ao estoque
    → Se order completo: verifica se pode mudar status do pedido
```

### 5. Rejeição de Itens
**User Story**: Como operador, quero rejeitar itens com problemas de qualidade.

**Especificação Técnica**:
```
Server Actions:
  - rejectItem(id, reason, quantity)
    → status = REJECTED
    → rejectedReason = reason
    → rejectedQuantity = quantity
    → finishedAt = now
    → Log de rejeição
    → Notifica gestor
    → Se quantidade parcial: permite refazer

Reasons Comuns:
  - Erro de impressão (cores, registro)
  - Material defeituoso
  - Dimensões incorretas
  - Acabamento defeituoso
  - Faltando itens
  - Outro (com nota)

UI:
  - Dialog de confirmação de rejeição
  - Seleção de motivo
  - Input de quantidade afetada
  - Upload de foto do defeito (futuro)
  - Notas detalhadas

Fluxo Pós-Rejeição:
  1. Item rejeitado
  2. Gestor notificado
  3. Opções:
     → Refazer (novo OrderItem vinculado)
     → Entregar parcial (reduzir quantity)
     → Cancelar item (refund parcial)
```

### 6. Fila de Produção (Queue Management)
**User Story**: Como gestor, quero organizar a fila de produção por prioridade.

**Especificação Técnica**:
```
Fila (QUEUED) deve ser ordenada por:
  1. Prioridade (URGENT > HIGH > NORMAL > LOW)
  2. Prazo de entrega (mais urgente primeiro)
  3. Data de criação (mais antigo primeiro)

Server Actions:
  - reprioritizeItem(itemId, newPriority)
    → Atualiza prioridade
    → Log
  
  - reorderQueue(orderItemIds[])
    → Define ordem explícita na fila
    → Salva em metadata.sortOrder

Reordenação Drag-and-Drop:
  - Dentro da coluna QUEUED, permitir reordenar
  - Salva ordem em metadata.sortOrder
  - Kanban respeita ordem ao renderizar

Visualização de Fila:
  - Número de ordem visível (1º, 2º, 3º)
  - Indicador de espera estimada
  - Prazo de início previsto
```

### 7. Relatórios de Produção
**User Story**: Como gestor, quero analisar eficiência da produção.

**Especificação Técnica**:
```
Métricas:
  - Itens produzidos por período
  - Tempo médio por produto
  - Eficiência por operador
  - Taxa de rejeição
  - Itens no prazo vs atrasados
  - Produção por dia da semana
  - Produção por turno

Server Actions:
  - getProductionReport(dateRange)
  - getOperatorEfficiency(operatorId, dateRange)
  - getProductivityByProduct(dateRange)
  - getRejectionReport(dateRange)

Dashboard de Produção:
  ┌─ Produção do Dia ────────────────────┐
  │ Concluídos: 12                       │
  │ Em Produção: 5                       │
  │ Atrasados: 2                         │
  │ Rejeitados: 1                        │
  │ Eficiência: 87%                      │
  └──────────────────────────────────────┘

  ┌─ Últimos 7 Dias ─────────────────────┐
  │ [Gráfico de barras por dia]          │
  │ Seg: 15  Ter: 18  Qua: 12  Qui: 20   │
  └──────────────────────────────────────┘

  ┌─ Top Produtos (30 dias) ─────────────┐
  │ 1. Cartão Visita    - 156 unidades   │
  │ 2. Panfleto A4      - 89 unidades    │
  │ 3. Camiseta         - 67 unidades    │
  └──────────────────────────────────────┘
```

### 8. Vinculação com Estoque
**User Story**: Como sistema, quero atualizar estoque ao concluir produção.

**Especificação Técnica**:
```
Fluxo Automático:
  Quando OrderItem.status = DONE:
    → Se Product.trackInventory = true:
      → recordInventoryIn({
          productId,
          variantId,
          quantity: OrderItem.quantity,
          reason: "PRODUCAO",
          orderId: OrderItem.orderId
        })
      → Atualiza Inventory.quantity
      → Log de entrada

Se Rejeição Parcial:
  → Entra apenas quantity - rejectedQuantity
  → Log detalhado

Integração:
  - Chama módulo de Estoque
  - Não duplica lógica
  - Transação atômica
```

### 9. Produção em Lote
**User Story**: Como operador, quero iniciar/pausar/concluir múltiplos itens.

**Especificação Técnica**:
```
UI:
  - Checkboxes nos cards do Kanban
  - Toolbar com ações em lote
  - Selecionar todos da coluna

Ações em Lote:
  - Iniciar produção (PENDING → IN_PROGRESS)
  - Pausar (IN_PROGRESS → PAUSED)
  - Retomar (PAUSED → IN_PROGRESS)
  - Concluir (IN_PROGRESS → DONE)
  - Mudar prioridade
  - Atribuir operador

Server Actions:
  - batchUpdateStatus(ids, status, metadata)
  - batchAssignOperator(ids, userId)
  - batchUpdatePriority(ids, priority)

Validações:
  - Todos os itens devem estar em status compatível
  - Confirmação em lote com resumo
  - Rollback se algum item falhar
```

## Estrutura de Arquivos Proposta
```
src/app/
└── producao/
    ├── page.tsx                    - Kanban (melhorar)
    ├── [itemId]/
    │   └── page.tsx                - Detail page do item
    ├── relatorios/
    │   └── page.tsx                - Dashboard de produção
    └── fila/
        └── page.tsx                - Gestão de fila

src/app/actions/
└── production.ts (expandir)
    ├── getProductionItems(filters)         - melhorar
    ├── getProductionStats()                - já existe
    ├── updateProductionStatus(id, status)  - já existe
    ├── updateItemNote(id, note)            - já existe
    ├── getOrderItemDetail(id)
    ├── assignOperator(itemId, userId)
    ├── removeOperator(itemId)
    ├── startProduction(id)
    ├── pauseProduction(id, reason)
    ├── resumeProduction(id)
    ├── finishProduction(id)
    ├── rejectItem(id, reason, quantity)
    ├── reprioritizeItem(itemId, priority)
    ├── reorderQueue(orderItemIds[])
    ├── batchUpdateStatus(ids, status, data)
    ├── batchAssignOperator(ids, userId)
    ├── getProductionReport(dateRange)
    ├── getOperatorEfficiency(operatorId, range)
    └── getProductivityByProduct(range)

src/components/
└── production/
    ├── kanban-board.tsx            - melhorar
    ├── kanban-card.tsx             - melhorar
    ├── kanban-column.tsx
    ├── item-detail.tsx
    ├── operator-assigner.tsx
    ├── production-timeline.tsx
    ├── rejection-dialog.tsx
    ├── production-stats.tsx
    ├── production-dashboard.tsx
    └── batch-actions-toolbar.tsx
```

## Melhorias no Schema (Migration)
```prisma
// Adicionar ao modelo OrderItem:
model OrderItem {
  // ... campos existentes
  
  // Novos campos:
  assignedTo          String?         // userId
  assignedAt          DateTime?
  estimatedHours      Int?
  pausedAt            DateTime?
  totalPausedTime     Int?            @default(0)  // minutos
  rejectedReason      String?         @db.Text
  rejectedQuantity    Int?            @default(0)
  
  // Relacionamento:
  assignedUser        User?           @relation(fields: [assignedTo], references: [id])
}
```

## Testes Necessários
- [ ] Teste de drag-and-drop entre colunas
- [ ] Teste de atualização de status
- [ ] Teste de atribuição de operador
- [ ] Teste de início/pausa/retomada/conclusão
- [ ] Teste de cálculo de tempo decorrido
- [ ] Teste de alerta de atraso
- [ ] Teste de rejeição de item
- [ ] Teste de rejeição parcial
- [ ] Teste de ações em lote
- [ ] Teste de reordenação da fila
- [ ] Teste de vinculação com estoque
- [ ] Teste de relatórios de produção
- [ ] Teste de isolamento por tenant

## Métricas de Sucesso
- Tempo médio de produção dentro do estimado
- Taxa de rejeição < 5%
- Taxa de entrega no prazo > 90%
- Eficiência média > 80%

## Dependências
- Módulo de Vendas (OrderItems)
- Módulo de Autenticação (operadores)
- Módulo de Estoque (entrada de produzidos)
