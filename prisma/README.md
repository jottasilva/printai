# PrintAI ERP - Schema do Banco de Dados

## 📊 Visão Geral

Schema Prisma **production-ready** para o sistema PrintAI ERP — um SaaS B2B multi-tenant para gráficas e empresas de impressão.

### Estatísticas do Schema

| Métrica | Valor |
|---------|-------|
| **Models** | 30 |
| **Enums** | 27 |
| **Relacionamentos** | 80+ |
| **Índices** | 100+ |

---

## 🏗️ Arquitetura

### Multi-Tenancy
- **Todas as tabelas** possuem `tenantId`
- **Índices compostos** `[tenantId, id]` em toda tabela
- **Row Level Security (RLS)** recomendado para isolamento total entre tenants

### Domínios do Schema

| Domínio | Models | Descrição |
|---------|--------|-----------|
| **Tenant & Users** | Tenant, User | Gestão de empresas e usuários |
| **Clientes** | Customer, Address | CRM básico com endereços polimórficos |
| **Produtos** | Product, ProductVariant, Category | Catálogo com variações e categorias hierárquicas |
| **Estoque** | Inventory, InventoryMovement, Supplier, SupplierProduct | Controle de estoque com rastreabilidade |
| **Orçamentos** | Quote, QuoteItem | Fluxo de vendas com statuses |
| **Pedidos** | Order, OrderItem, OrderItemLog | Pedidos com controle de produção e kanban |
| **Financeiro** | Payment, Receivable, Payable, CashFlow | Contas a pagar/receber e fluxo de caixa |
| **Conversas & IA** | Conversation, Message | Atendimento multi-canal com suporte a IA/RAG |
| **Assinaturas** | Subscription | Gestão de planos e billing |
| **Logs & Auditoria** | SystemLog, AuditLog | Logs imutáveis para compliance |
| **Sequências** | NumberSequence | Gerador de números sequenciais |

---

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Banco de Dados

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas credenciais
# DATABASE_URL="postgresql://user:password@localhost:5432/printai_erp?schema=public"
```

### 3. Validar Schema

```bash
npm run prisma:generate
# ou
npx prisma validate
```

### 4. Rodar Migrations

```bash
npm run prisma:migrate
# ou
npx prisma migrate dev --name init
```

### 5. Gerar Cliente Prisma

```bash
npx prisma generate
```

### 6. (Opcional) Seed do Banco

```bash
npx tsx prisma/seed.ts
```

---

## 📋 Enums Principais

### Planos do Tenant
- `FREE` - Plano gratuito
- `STARTER` - Básico
- `PROFESSIONAL` - Profissional
- `ENTERPRISE` - Enterprise

### Status do Tenant
- `ACTIVE` - Ativo
- `SUSPENDED` - Suspenso
- `TRIAL` - Período de teste
- `CANCELED` - Cancelado

### Roles de Usuário
- `OWNER` - Dono do tenant
- `ADMIN` - Administrador
- `MANAGER` - Gerente
- `OPERATOR` - Operador
- `VIEWER` - Apenas leitura

### Status de Pedido
- `DRAFT` - Rascunho
- `CONFIRMED` - Confirmado
- `IN_PRODUCTION` - Em produção
- `READY` - Pronto
- `SHIPPED` - Enviado
- `DELIVERED` - Entregue
- `CANCELED` - Cancelado
- `REFUNDED` - Reembolsado

### Status de Produção (por item)
- `PENDING` - Pendente
- `QUEUED` - Na fila
- `IN_PROGRESS` - Em produção
- `PAUSED` - Pausado
- `DONE` - Concluído
- `CANCELED` - Cancelado
- `REJECTED` - Rejeitado

---

## 🔐 Segurança

### Row Level Security (RLS)

Recomenda-se ativar RLS em **TODAS as tabelas** com tenantId:

```sql
-- Ativar RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ... repetir para todas as tabelas

-- Criar policy
CREATE POLICY tenant_isolation ON tenants
  USING (id = current_setting('app.current_tenant')::uuid);

-- Função para setar tenant
SELECT set_config('app.current_tenant', '<tenant_uuid>', true);
```

### Soft Delete

Todas as models principais possuem `deletedAt DateTime?` para soft delete.

---

## 🎯 Extensões PostgreSQL

### pgvector (Embeddings para IA/RAG)

O campo `Message.embedding` está preparado para vetores de 1536 dimensões:

```sql
-- Instalar extensão
CREATE EXTENSION IF NOT EXISTS vector;

-- Adicionar coluna
ALTER TABLE messages ADD COLUMN embedding vector(1536);

-- Criar índice
CREATE INDEX ON messages USING ivfflat (embedding vector_cosine_ops);
```

### CITEXT (Case-Insensitive Text)

Usado para campos como `email` e `slug` para comparações case-insensitive.

---

## 📈 Recomendações de Produção

### 1. Particionamento

| Tabela | Estratégia |
|--------|-----------|
| SystemLog | Por mês (createdAt) |
| AuditLog | Por mês (createdAt) |
| InventoryMovement | Por trimestre |
| Message | Por tenant + mês |

### 2. Triggers Sugeridos

- **Inventory**: Calcular `availableQuantity` automaticamente
- **NumberSequence**: Gerar números sequenciais automaticamente
- **Product**: Atualizar `searchVector` via tsvector
- **Order**: Calcular `remainingAmount` quando Payment mudar

### 3. Retenção de Dados

| Tabela | Retenção |
|--------|----------|
| SystemLog | 90 dias (arquivar em S3) |
| AuditLog | 1 ano (conformidade fiscal) |
| InventoryMovement | Permanente (auditoria) |
| Message | 180 dias (LGPD) |

### 4. Performance

- **Connection Pooler**: PgBouncer com `pool mode = transaction`
- **max_connections**: 50-100 no app, 200+ no DB
- **shared_buffers**: 25% da RAM do servidor
- **work_mem**: 64MB para queries complexas

---

## 📁 Estrutura de Arquivos

```
printai/
├── prisma/
│   ├── schema.prisma      # Schema completo
│   ├── migrations/        # Migrations geradas
│   └── seed.ts           # (opcional) Seed do banco
├── .env                   # Variáveis de ambiente
├── .env.example          # Exemplo de .env
└── package.json          # Dependências
```

---

## 🛠️ Comandos Úteis

```bash
# Validar schema
npx prisma validate

# Gerar cliente
npx prisma generate

# Criar migration
npx prisma migrate dev --name <nome>

# Aplicar migrations em produção
npx prisma migrate deploy

# Ver status das migrations
npx prisma migrate status

# Resetar banco (desenvolvimento)
npx prisma migrate reset

# Abrir Prisma Studio
npx prisma studio
```

---

## 📝 Notas Importantes

1. **Todos os IDs são UUID** - nunca usar autoincrement
2. **Valores monetários** - sempre `Decimal`, nunca `Float`
3. **Datas** - sempre UTC com timezone
4. **Metadata Json?** - presente em entities principais para extensibilidade
5. **Logs são imutáveis** - sem soft delete, sem updatedAt
6. **Financeiro é imutável** - Payments, CashFlow sem soft delete

---

## 📞 Suporte

Para dúvidas sobre o schema, consultar:
- [Documentação Prisma](https://www.prisma.io/docs/)
- [Documentação PostgreSQL](https://www.postgresql.org/docs/)

---

**Versão**: 1.0.0  
**Última Atualização**: 2026-04-09  
**Prisma**: 5.22.0  
**PostgreSQL**: 14+ (recomendado 15+)
