# PrintAI ERP - Guia de Início Rápido

## 🚀 Primeiros Passos

Este guia vai te ajudar a configurar e rodar o PrintAI ERP em menos de 5 minutos.

---

## Pré-requisitos

- ✅ **Node.js 18+** instalado
- ✅ **PostgreSQL 14+** instalado e rodando
- ✅ **npm** ou **yarn**

---

## Passo 1: Instalar Dependências

```bash
cd printai
npm install
```

---

## Passo 2: Configurar Banco de Dados

### Criar Banco no PostgreSQL

```sql
CREATE DATABASE printai_erp;
```

### Configurar .env

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# O .env já vem configurado para:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/printai_erp?schema=public"
#
# Se sua senha for diferente, edite o arquivo .env
```

---

## Passo 3: Rodar Migrations

```bash
# Validar schema
npx prisma validate

# Gerar cliente Prisma
npx prisma generate

# Rodar migrations (cria todas as tabelas)
npx prisma migrate dev --name init
```

**Saída esperada:**
```
Your database is now in sync with your schema.
✔ Generated Prisma Client (v5.22.0)
```

---

## Passo 4: (Opcional) Popular com Dados de Exemplo

```bash
npx tsx prisma/seed.ts
```

**Isso vai criar:**
- 1 Tenant de exemplo
- 1 Usuário admin
- 2 Categorias de produtos
- 2 Produtos
- 1 Cliente
- 1 Orçamento
- 2 Registros de estoque

---

## Passo 5: Rodar o Projeto

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🎯 Comandos Úteis

### Verificar Status do Banco

```bash
npx prisma migrate status
```

### Abrir Prisma Studio (GUI do Banco)

```bash
npx prisma studio
```

Abre interface web em **http://localhost:5555** para visualizar/editar dados.

### Criar Nova Migration

```bash
npx prisma migrate dev --name nome_da_migration
```

### Resetar Banco (DESENVOLVIMENTO)

```bash
npx prisma migrate reset
```

⚠️ **Isso apaga TODOS os dados!**

---

## 🔍 Verificando Instalação

### Validar Schema

```bash
npx prisma validate
```

Deve mostrar: `The schema at prisma/schema.prisma is valid 🚀`

### Testar Conexão

```bash
npx prisma db execute --stdin
```

Ou abra o Prisma Studio: `npx prisma studio`

---

## 📊 Estrutura Criada

Após rodar as migrations, você terá **30 tabelas**:

| Categoria | Tabelas |
|-----------|---------|
| **Core** | tenants, users, subscriptions |
| **CRM** | customers, addresses, suppliers |
| **Catálogo** | categories, products, product_variants, supplier_products |
| **Estoque** | inventories, inventory_movements |
| **Vendas** | quotes, quote_items, orders, order_items, order_item_logs |
| **Financeiro** | payments, receivables, payables, cash_flows |
| **IA/Chat** | conversations, messages |
| **Logs** | system_logs, audit_logs, number_sequences |

---

## 🔐 Credenciais de Exemplo (após seed)

### Admin do Tenant

- **Email**: `admin@graficaexemplo.com`
- **Senha**: (definir no sistema de auth)

### Tenant

- **Nome**: Gráfica Exemplo LTDA
- **Slug**: `grafica-exemplo`
- **Plano**: PROFESSIONAL (trial 30 dias)

---

## 🛠️ Próximos Passos

1. **Configurar Autenticação**
   - Implementar login com JWT ou Supabase Auth
   - Configurar Row Level Security (RLS)

2. **Criar API Routes**
   - CRUD de produtos
   - CRUD de clientes
   - Gestão de pedidos
   - Dashboard financeiro

3. **Implementar Frontend**
   - Dashboard principal
   - Kanban de produção
   - Chat com IA
   - Relatórios

4. **Configurar IA (Opcional)**
   - Integrar com OpenAI API
   - Configurar embeddings (pgvector)
   - Implementar RAG

---

## ❓ Problemas Comuns

### "DATABASE_URL not found"

```bash
# Verificar se .env existe
cat .env

# Verificar se PostgreSQL está rodando
pg_isready -h localhost -p 5432
```

### "Migration failed"

```bash
# Resetar banco (DESENVOLVIMENTO)
npx prisma migrate reset

# Ou dropar e recriar banco
DROP DATABASE printai_erp;
CREATE DATABASE printai_erp;
npx prisma migrate dev
```

### "Prisma Client not generated"

```bash
npx prisma generate
```

---

## 📚 Documentação

- [Schema README](./prisma/README.md)
- [Prisma Docs](https://www.prisma.io/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**Versão**: 1.0.0  
**Última Atualização**: 2026-04-09
