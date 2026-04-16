# Spec: Módulo de Estoque e Inventário

## Contexto
Sistema ERP multi-tenant para gráficas. Módulo de estoque controla inventário de produtos e insumos.

## Estado Atual
- ❌ Não implementado
- Modelos prontos: `Inventory`, `InventoryMovement`
- Enum `MovementType`: IN, OUT, RESERVE, RELEASE, ADJUSTMENT, LOSS

## Requisitos do Módulo

### 1. Visualização de Estoque Atual
**User Story**: Como operador, quero ver o estoque atual de todos os produtos.

**Critérios de Aceitação**:
- Tabela com todos os produtos e quantidades
- Indicador visual de estoque baixo
- Filtro por categoria
- Busca por nome/SKU
- Agrupamento por produto e variante

**Especificação Técnica**:
```
Rota: /estoque (Server Component)

Server Actions:
  - getInventorySummary()         - Resumo geral
  - getInventoryByProduct(params) - Detalhe por produto
  - getLowStockAlerts()           - Produtos abaixo do mínimo

Query:
  SELECT 
    p.id, p.name, p.sku,
    COALESCE(SUM(CASE WHEN m.type = 'IN' THEN m.quantity ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN m.type IN ('OUT', 'LOSS') THEN m.quantity ELSE 0 END), 0) as currentStock
  FROM Product p
  LEFT JOIN Inventory i ON i.productId = p.id
  LEFT JOIN InventoryMovement m ON m.inventoryId = i.id
  WHERE p.tenantId = $1 AND p.deletedAt IS NULL
  GROUP BY p.id
  HAVING currentStock <= p.minimumStock OR currentStock = 0

Componentes:
  InventoryTable:
    - Colunas: Produto, SKU, Categoria, Estoque Atual, Mínimo, Status
    - Indicadores: ✅ OK, ⚠️ Baixo, ❌ Zerado
    - Ordenação por estoque crescente
    - Filtro por status
  
  InventoryGrid:
    - Cards visuais por produto
    - Barra de progresso (atual/máximo)
    - Cor conforme status
```

### 2. Registro de Entrada (MovementType.IN)
**User Story**: Como operador, quero registrar entrada de produtos no estoque.

**Critérios de Aceitação**:
- Formulário com produto, quantidade, motivo
- Seleção de pedido de compra vinculado (opcional)
- Upload de nota fiscal (futuro)
- Confirmação com resumo

**Especificação Técnica**:
```
Rota: /estoque/entrada (Client Component)

Server Actions:
  - recordInventoryIn(formData)
  
FormData:
  - productId (obrigatório)
  - variantId (opcional, se produto tem variantes)
  - quantity (Int, positivo)
  - reason (COMPRA, PRODUCAO, DEVOLUCAO, AJUSTE, OUTRO)
  - notes (observações)
  - orderId (FK opcional, vinculado a pedido)
  - supplierId (FK opcional, fornecedor)

Fluxo:
  1. Usuário seleciona produto
  2. Se VARIANT, seleciona variante
  3. Informa quantidade
  4. Seleciona motivo
  5. (Opcional) Vincula a pedido/fornecedor
  6. Confirma entrada
  7. Sistema:
     → Cria InventoryMovement (type=IN)
     → Atualiza Inventory.quantity
     → Se orderId, atualiza OrderItem.receivedQuantity
     → Log em tempo real

Validações:
  - quantity > 0
  - productId existe e ativo
  - Se variantId, pertence ao produto
```

### 3. Registro de Saída (MovementType.OUT)
**User Story**: Como operador, quero registrar saída de produtos (vendas, consumo).

**Especificação Técnica**:
```
Rota: /estoque/saida

Server Actions:
  - recordInventoryOut(formData)

FormData:
  - productId
  - variantId (opcional)
  - quantity
  - reason (VENDA, CONSUMO, DEVOLUCAO_FORNECEDOR, AJUSTE, OUTRO)
  - notes
  - orderId (FK opcional)

Validações Críticas:
  - quantity > 0
  - quantity <= currentStock (não permitir negativo)
  - Mensagem clara se estoque insuficiente

Fluxo:
  1. Seleciona produto
  2. Informa quantidade
  3. Sistema mostra estoque atual
  4. Seleciona motivo
  5. Confirma saída
  6. Sistema cria movimento e atualiza estoque
```

### 4. Reserva de Estoque (MovementType.RESERVE/RELEASE)
**User Story**: Como sistema, quero reservar estoque quando pedido é criado para evitar vendas sem estoque.

**Especificação Técnica**:
```
Fluxo Automático:
  Quando Order.status = CONFIRMED:
    → Para cada OrderItem com trackInventory = true:
      → Cria InventoryMovement (type=RESERVE)
      → Reduz Inventory.availableStock (não quantity)
      → OrderItem.reservedQuantity += quantity

  Quando OrderItem é cancelado ou editado:
    → Cria InventoryMovement (type=RELEASE)
    → Inventory.availableStock += quantity
    → OrderItem.reservedQuantity -= quantity

Campos em Inventory:
  - quantity (total físico)
  - reservedQuantity (reservado para pedidos)
  - availableStock = quantity - reservedQuantity (calculado)

Server Actions:
  - reserveStock(orderItemId, productId, quantity)
  - releaseStock(orderItemId, productId, quantity)
  - getAvailableStock(productId)   - Retorna availableStock
```

### 5. Ajuste de Inventário (MovementType.ADJUSTMENT)
**User Story**: Como gestor, quero ajustar estoque após inventário físico.

**Especificação Técnica**:
```
Rota: /estoque/ajuste

Server Actions:
  - recordInventoryAdjustment(formData)

FormData:
  - productId
  - variantId (opcional)
  - currentQuantity (estoque físico contado)
  - notes (motivo do ajuste)
  
Fluxo:
  1. Sistema mostra estoque atual no sistema
  2. Usuário informa quantidade física
  3. Sistema calcula diferença
  4. Se diferença != 0:
     → Cria InventoryMovement (type=ADJUSTMENT)
     → Ajusta quantity para currentQuantity
     → Registra diferença em notes
```

### 6. Registro de Perdas (MovementType.LOSS)
**User Story**: Como operador, quero registrar perdas (danos, validade, roubo).

**Especificação Técnica**:
```
Rota: /estoque/perda

Server Actions:
  - recordInventoryLoss(formData)

FormData:
  - productId
  - variantId (opcional)
  - quantity
  - lossReason (DEFEITO, VALIDADE, ROUBO, MANUSEIO, OUTRO)
  - notes
  - costImpact (Decimal, opcional, custo da perda)

Relatório de Perdas:
  - Total perdido por período
  - Top motivos
  - Top produtos com perdas
  - Custo total das perdas
```

### 7. Histórico de Movimentações
**User Story**: Como gestor, quero ver todo o histórico de movimentações do estoque.

**Especificação Técnica**:
```
Rota: /estoque/historico

Server Actions:
  - getInventoryMovements(params)
  
Query:
  SELECT 
    m.*,
    p.name as productName,
    pv.name as variantName,
    u.name as userName
  FROM InventoryMovement m
  JOIN Inventory i ON m.inventoryId = i.id
  JOIN Product p ON i.productId = p.id
  LEFT JOIN ProductVariant pv ON m.variantId = pv.id
  LEFT JOIN User u ON m.userId = u.id
  WHERE p.tenantId = $1
    AND m.createdAt BETWEEN $2 AND $3
  ORDER BY m.createdAt DESC
  LIMIT 50 OFFSET page * 50

Filtros:
  - Período (date range picker)
  - Tipo de movimentação (IN, OUT, RESERVE, etc)
  - Produto (search)
  - Usuário que realizou
  - Motivo

Componente:
  MovementHistoryTable:
    - Colunas: Data/Hora, Produto, Tipo, Qtd, Usuário, Motivo
    - Badges coloridos por tipo:
      → IN: verde
      → OUT: laranja
      → RESERVE: azul
      → RELEASE: cinza
      → ADJUSTMENT: amarelo
      → LOSS: vermelho
    - Exportação CSV/Excel
```

### 8. Alertas de Estoque Baixo
**User Story**: Como gestor, quero ser alertado quando produtos estão com estoque baixo.

**Especificação Técnica**:
```
Model: Inventory (campo mínimo)
  - minimumStock (Int, threshold para alerta)
  - reorderPoint (Int, ponto de reposição)
  - reorderQuantity (Int, quanto comprar quando atingir ponto)

Server Actions:
  - getLowStockAlerts()
    → Retorna produtos com availableStock <= minimumStock
  
  - getReorderSuggestions()
    → Retorna produtos com availableStock <= reorderPoint
    → Sugere quantidade: reorderQuantity

UI:
  Dashboard Widget no /estoque:
    ┌─ Alertas de Estoque ───────────────┐
    │ ⚠️ 5 produtos com estoque baixo    │
    │                                    │
    │ Produto        | Atual | Mínimo   │
    │ Cartão Visita  | 12    | 50       │
    │ Panfleto A4    | 0     | 100      │
    │ Camiseta P     | 3     | 20       │
    │                                    │
    │ [Ver Todos] [Gerar Lista Compra]  │
    └────────────────────────────────────┘

Notificações (futuro):
  - Email diário se há produtos abaixo do mínimo
  - Notificação in-app em tempo real
```

### 9. Inventário Físico (Contagem Cíclica)
**User Story**: Como operador, quero realizar contagem física periódica do estoque.

**Especificação Técnica**:
```
Rota: /estoque/inventario

Funcionalidades:
  - Iniciar sessão de contagem
  - Lista de produtos para contar
  - Input de quantidade contada
  - Comparação sistema vs físico
  - Aprovação de ajustes
  - Relatório de divergências

Fluxo:
  1. Gestor inicia inventário
  2. Sistema gera lista de produtos
  3. Operador conta cada produto físico
  4. Sistema mostra divergência
  5. Gestor aprova/rejeita ajustes
  6. Sistema registra movimentos de ajuste
  7. Fecha inventário com relatório

Server Actions:
  - startInventoryCount()
  - submitCount(productId, countedQuantity)
  - approveAdjustments()
  - closeInventoryCount()
  - getInventoryCountReport()
```

## Estrutura de Arquivos Proposta
```
src/app/
└── estoque/
    ├── page.tsx                    - Dashboard de estoque
    ├── entrada/page.tsx            - Registrar entrada
    ├── saida/page.tsx              - Registrar saída
    ├── ajuste/page.tsx             - Ajuste de inventário
    ├── perda/page.tsx              - Registrar perdas
    ├── historico/page.tsx          - Histórico de movimentações
    ├── inventario/page.tsx         - Contagem física
    └── [id]/
        └── page.tsx                - Detalhe de movimentação

src/app/actions/
└── inventory.ts
    ├── getInventorySummary()
    ├── getInventoryByProduct(params)
    ├── getLowStockAlerts()
    ├── getAvailableStock(productId)
    ├── recordInventoryIn(formData)
    ├── recordInventoryOut(formData)
    ├── recordInventoryAdjustment(formData)
    ├── recordInventoryLoss(formData)
    ├── reserveStock(orderItemId, productId, quantity)
    ├── releaseStock(orderItemId, productId, quantity)
    ├── getInventoryMovements(params)
    ├── startInventoryCount()
    ├── submitCount(productId, countedQuantity)
    └── approveAdjustments()

src/components/
└── inventory/
    ├── inventory-table.tsx
    ├── inventory-grid.tsx
    ├── movement-form.tsx
    ├── movement-history.tsx
    ├── low-stock-alerts.tsx
    ├── stock-indicator.tsx
    └── count-session.tsx
```

## Validações (Zod)
```typescript
movementSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().positive("Quantidade deve ser positiva"),
  reason: z.enum(["COMPRA", "PRODUCAO", "VENDA", "DEVOLUCAO", "AJUSTE", "OUTRO"]),
  notes: z.string().max(500).optional(),
  orderId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional()
})

lossSchema = movementSchema.extend({
  lossReason: z.enum(["DEFEITO", "VALIDADE", "ROUBO", "MANUSEIO", "OUTRO"]),
  costImpact: z.number().positive().optional()
})

adjustmentSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  currentQuantity: z.number().int().nonnegative(),
  notes: z.string().max(500)
})
```

## Testes Necessários
- [ ] Teste de entrada de estoque
- [ ] Teste de saída de estoque
- [ ] Teste de bloqueio de saída sem estoque suficiente
- [ ] Teste de reserva de estoque
- [ ] Teste de liberação de reserva
- [ ] Teste de ajuste de inventário
- [ ] Teste de registro de perda
- [ ] Teste de cálculo de estoque disponível
- [ ] Teste de alertas de estoque baixo
- [ ] Teste de histórico de movimentações
- [ ] Teste de isolamento por tenant
- [ ] Teste de concorrência (dois usuários ajustando mesmo produto)

## Métricas de Sucesso
- Precisão de estoque > 98%
- Alertas de estoque baixo acionados antes de ruptura
- Tempo de registro de movimentação < 15 segundos
- Divergência inventário físico vs sistema < 2%

## Dependências
- Módulo de Catálogo (produtos e variantes)
- Módulo de Vendas (pedidos para reserva de estoque)
- Módulo de CRM (fornecedores para entradas)
