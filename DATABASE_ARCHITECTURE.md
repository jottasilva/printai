# PrintAI ERP - Arquitetura do Banco de Dados

## 📊 Resumo Executivo

O schema do PrintAI ERP foi projetado para ser **production-ready** com foco em:

1. **Multi-tenancy seguro** - Isolamento total entre tenants
2. **Escalabilidade** - Índices otimizados e preparação para particionamento
3. **Rastreabilidade** - Logs imutáveis de todas as ações
4. **Extensibilidade** - Campos JSON para dados dinâmicos
5. **IA-Ready** - Suporte a embeddings para RAG

---

## 🏛️ Diagrama de Entidades (Resumo)

```
┌─────────────────────────────────────────────────────────────┐
│                        TENANT (Empresa)                      │
│  id, name, slug, plan, status, settings, metadata           │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┬──────────┐
        │          │          │          │          │
   ┌────▼───┐ ┌───▼────┐ ┌──▼────┐ ┌──▼─────┐ ┌─▼────────┐
   │ USERS  │ │CUSTO-  │ │PROD-  │ │ ORDERS │ │CONVERSA- │
   │        │ │  MERS  │ │ UCTS  │ │        │ │  TIONS   │
   └────────┘ └────────┘ └───────┘ └────────┘ └──────────┘
                                                    │
                                               ┌────▼────┐
                                               │MESSAGES │
                                               │(IA/RAG) │
                                               └─────────┘
```

---

## 🔑 Decisões de Design

### 1. Por que UUID ao invés de Auto-increment?

| UUID | Auto-increment |
|------|----------------|
| ✅ Distribuído (sem bottleneck) | ❌ Sequencial (concorrência) |
| ✅ Seguro (não sequencial) | ❌ Previsível |
| ✅ Merge-safe (sem conflitos) | ❌ Conflitos em merges |
| ❌ Maior (16 bytes vs 4 bytes) | ✅ Menor |

**Conclusão**: UUID é melhor para sistemas distribuídos e SaaS.

### 2. Por que Decimal ao invés de Float para dinheiro?

```sql
-- Float (RUIM para dinheiro)
SELECT 0.1 + 0.2;  -- Resultado: 0.30000000000000004 ❌

-- Decimal (BOM para dinheiro)
SELECT 0.1::decimal + 0.2::decimal;  -- Resultado: 0.3 ✅
```

**Regra**: Sempre usar `Decimal(15, 2)` para valores monetários.

### 3. Por que Soft Delete?

```typescript
// Deletar logicamente (preserva histórico)
await prisma.customer.update({
  where: { id },
  data: { deletedAt: new Date() },
});

// Query sempre filtra deletados
const customers = await prisma.customer.findMany({
  where: { deletedAt: null },
});
```

**Vantagens:**
- ✅ Recuperação de dados deletados
- ✅ Compliance com LGPD (auditoria)
- ✅ Histórico preservado

---

## 🔐 Row Level Security (RLS)

### O que é RLS?

RLS garante que **cada tenant vê apenas seus dados** no banco, mesmo com compartilhamento de tabelas.

### Como Implementar

```sql
-- 1. Ativar RLS em todas as tabelas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ... repetir para todas as tabelas

-- 2. Criar policy genérica
CREATE POLICY tenant_isolation_policy ON users
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- 3. Setar tenant no app (middleware)
SELECT set_config('app.current_tenant', '<UUID_DO_TENANT>', true);
```

### No Código (Prisma)

```typescript
// Middleware para setar tenant
prisma.$use(async (params, next) => {
  // Setar tenant antes de cada query
  await prisma.$executeRaw`
    SELECT set_config('app.current_tenant', ${tenantId}, true)
  `;
  
  return next(params);
});
```

---

## 📈 Estratégia de Índices

### Índices Compostos (Multi-tenant)

```sql
-- Toda tabela tem:
CREATE INDEX idx_tenant_id ON orders(tenant_id, id);
CREATE INDEX idx_tenant_status ON orders(tenant_id, status);
CREATE INDEX idx_tenant_customer ON orders(tenant_id, customer_id);
```

### Índices de Busca Full-Text

```sql
-- Products.searchVector usa GIN index
CREATE INDEX idx_products_search ON products 
  USING GIN(to_tsvector('english', search_vector));
```

### Índices para Paginação

```sql
-- Conversas ordenadas por última mensagem
CREATE INDEX idx_conversations_last_msg 
  ON conversations(tenant_id, last_message_at DESC);
```

---

## 🤖 Preparação para IA (RAG)

### Campo de Embedding

```prisma
model Message {
  embedding Float[]  // @db.Vector(1536) após instalar pgvector
}
```

### Como Usar com OpenAI

```typescript
import { openai } from '@ai-sdk/openai';

// 1. Gerar embedding da mensagem
const embedding = await openai.embedding({
  model: 'text-embedding-ada-002',
  input: 'Qual o status do meu pedido?',
});

// 2. Salvar no banco
await prisma.message.create({
  data: {
    embedding: embedding,
    // ...
  },
});

// 3. Buscar similaridade (cosine similarity)
const similar = await prisma.$queryRaw`
  SELECT * FROM messages
  ORDER BY embedding <-> ${embedding}::vector
  LIMIT 5
`;
```

---

## 🎯 Fluxos Principais

### 1. Criação de Pedido

```
Quote (Orçamento)
  ↓ (convertToOrderId)
Order (Pedido)
  ↓
OrderItem[] (Itens)
  ↓
InventoryMovement (Reserva estoque)
  ↓
Production (Kanban: WAITING → IN_PROGRESS → DONE)
  ↓
Payment (Pagamento)
  ↓
Receivable (Conta a receber)
```

### 2. Controle de Estoque

```
Product criado
  ↓
Inventory criado (quantity = 0)
  ↓
SupplierProduct (compra de fornecedor)
  ↓
InventoryMovement (type = IN, quantity +100)
  ↓
Inventory atualizado (availableQuantity = 100)
  ↓
OrderItem reserva (reservedQuantity +10)
  ↓
InventoryMovement (type = RESERVE)
  ↓
Inventory atualizado (availableQuantity = 90)
```

### 3. Conversa com IA

```
Customer envia mensagem (WhatsApp)
  ↓
Conversation criada (status = AI_HANDLING)
  ↓
Message criada (role = USER)
  ↓
IA processa (OpenAI API)
  ↓
Message criada (role = ASSISTANT, isAiGenerated = true)
  ↓
Conversation.totalTokensUsed atualizado
  ↓
Se humano assumir: status = WAITING_HUMAN
```

---

## 🛡️ Segurança

### Níveis de Segurança

| Camada | Mecanismo |
|--------|-----------|
| **Database** | RLS (Row Level Security) |
| **Application** | Middleware de tenant |
| **Authentication** | JWT + refresh tokens |
| **Authorization** | Roles + permissões granulares |
| **Audit** | AuditLog imutável |

### Permissões Granulares

```typescript
// User.permissions (String[])
permissions: [
  'orders.create',
  'orders.read',
  'orders.update',
  'orders.delete',
  'customers.*',
  'reports.read',
  // ...
]
```

---

## 📦 Migrações em Produção

### Checklist de Deploy

```bash
# 1. Backup do banco
pg_dump printai_erp > backup_$(date +%Y%m%d).sql

# 2. Aplicar migrations
npx prisma migrate deploy

# 3. Gerar cliente
npx prisma generate

# 4. Verificar status
npx prisma migrate status

# 5. Testar conexão
curl http://localhost:3000/api/health
```

### Rollback (se necessário)

```bash
# Restaurar backup
psql printai_erp < backup_20260409.sql

# Ou reverter última migration
npx prisma migrate resolve --rolled-back <migration_name>
```

---

## 🚀 Otimizações Futuras

### 1. Particionamento de Tabelas

```sql
-- SystemLog particionado por mês
CREATE TABLE system_logs (
  ...
) PARTITION BY RANGE (created_at);

CREATE TABLE system_logs_2026_04 PARTITION OF system_logs
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
```

### 2. Materialized Views para Relatórios

```sql
CREATE MATERIALIZED VIEW monthly_revenue AS
SELECT 
  tenant_id,
  DATE_TRUNC('month', created_at) as month,
  SUM(amount) as total_revenue
FROM payments
WHERE status = 'PAID'
GROUP BY 1, 2;
```

### 3. Redis para Cache

- Cache de queries frequentes (produtos, clientes)
- Sessão de usuários
- Rate limiting

---

## 📚 Referências

- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [PostgreSQL Performance](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Multi-tenant SaaS Architecture](https://www.prisma.io/blog/multi-tenant-saas-applications-with-prisma)

---

**Documento criado em**: 2026-04-09  
**Versão**: 1.0.0  
**Autor**: Arquiteto de Banco de Dados Senior
