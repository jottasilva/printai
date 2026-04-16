# 🔧 GUIA DE CORREÇÃO — ERROS 500 SUPABASE (SOLUÇÃO DEFINITIVA)

## 📋 RESUMO EXECUTIVO

**Problema:** Requisições para `/rest/v1/users?id=eq.<uuid>` e `/rest/v1/users?email=eq.<email>` retornando **Erro 500**.

**Causa Raiz:** Incompatibilidade de nomenclatura de colunas entre scripts SQL (snake_case) e o schema Prisma (camelCase).

**Solução:** Executar script SQL unificado que renomeia colunas, recria triggers e RLS policies.

---

## 🔍 DIAGNÓSTICO DETALHADO

### O Que Estava Acontecendo

O sistema usa **duas camadas de acesso ao banco**:

1. **Prisma ORM** (via Server Actions) — espera colunas em **camelCase**:
   - `"tenantId"`, `"emailVerifiedAt"`, `"createdAt"`, `"updatedAt"`, `"deletedAt"`

2. **Supabase REST API** (via client-side React) — acessa tabelas diretamente

**O Problema:** Scripts SQL anteriores criaram colunas em **snake_case**:
- `tenant_id`, `email_verified_at`, `created_at`, `updated_at`, `deleted_at`

Quando o `tenant-context.tsx` fazia queries via Supabase client:
```ts
supabase.from('users').select('*').eq('id', authUser.id)
```

O Supabase tentava acessar colunas que **não existiam** com os nomes esperados, causando:
- **Erro 42703** (PostgreSQL): `column "id" does not exist`
- **Erro 500** (Supabase REST API): Falha interna ao tentar mapear colunas inexistentes

### Tabela de Incompatibilidades

| Coluna no Prisma (Correto) | Coluna Criada por Scripts SQL (Errado) | Status |
|----------------------------|----------------------------------------|--------|
| `"tenantId"` | `tenant_id` | ❌ Renomear |
| `"emailVerifiedAt"` | `email_verified_at` | ❌ Renomear |
| `"createdAt"` | `created_at` | ❌ Renomear |
| `"updatedAt"` | `updated_at` | ❌ Renomear |
| `"deletedAt"` | `deleted_at` | ❌ Renomear |
| `"lastLoginAt"` | `last_login_at` | ❌ Renomear |
| `"twoFactorEnabled"` | `two_factor_enabled` | ❌ Renomear |
| `"refreshToken"` | `refresh_token` | ❌ Renomear |
| `"refreshTokenExpiresAt"` | `refresh_token_expires_at` | ❌ Renomear |
| `"avatarUrl"` | `avatar_url` | ❌ Renomear |
| `"maxUsers"` (tenants) | `max_users` | ❌ Renomear |
| `"maxStorage"` (tenants) | `max_storage` | ❌ Renomear |
| `"trialEndsAt"` (tenants) | `trial_ends_at` | ❌ Renomear |
| `"suspendedAt"` (tenants) | `suspended_at` | ❌ Renomear |

---

## 🛠️ SOLUÇÃO PASSO A PASSO

### PRÉ-REQUISITOS

- Acesso ao dashboard do Supabase: https://app.supabase.com
- Projeto: `wlxuevhxnxyvvjtocnrc` (PrintAI)
- Permissões de administrador do banco

### PASSO 1: Backup (Opcional mas Recomendado)

```sql
-- Exportar dados atuais (execute no dashboard ou via CLI)
-- Via Supabase Dashboard: Database → Backups → Create Backup
```

### PASSO 2: Executar Script de Correção

1. Acesse o **SQL Editor** do Supabase
2. Cole o conteúdo do arquivo: `supabase/FIX_SCHEMA_FINAL.sql`
3. Clique em **RUN**
4. Observe os logs de saída (NOTICE/WARNING)

**Output Esperado:**
```
✅ users.tenant_id → "tenantId"
✅ users.email_verified_at → "emailVerifiedAt"
✅ users.created_at → "createdAt"
...
✅ Perfil criado para usuário existente: user@email.com (role: OWNER)
✅ Total de perfis criados para usuários existentes: X
========================================
📊 RESUMO DA MIGRAÇÃO:
   Usuários na tabela public.users: X
   Tenants na tabela public.tenants: X
   Usuários sem tenant: 0
========================================
✅ Migração concluída com sucesso!
```

### PASSO 3: Validar Schema

Execute esta query para verificar que as colunas estão corretas:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;
```

**Resultado Esperado (colunas em camelCase):**
```
id              | text    | NO
tenantId        | text    | NO
email           | text    | NO
name            | text    | YES
emailVerifiedAt | timestamp | YES
createdAt       | timestamp | NO
updatedAt       | timestamp | NO
deletedAt       | timestamp | YES
...
```

### PASSO 4: Validar RLS Policies

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('users', 'tenants')
ORDER BY tablename, policyname;
```

**Policies Esperadas:**
- `users_select_policy` — FOR SELECT
- `users_insert_policy` — FOR INSERT (bloqueado)
- `users_update_policy` — FOR UPDATE (apenas próprio perfil)
- `users_delete_policy` — FOR DELETE (bloqueado)
- `tenants_select_policy` — FOR SELECT
- `tenants_insert_policy` — FOR INSERT (bloqueado)
- `tenants_update_policy` — FOR UPDATE
- `tenants_delete_policy` — FOR DELETE (bloqueado)

### PASSO 5: Reiniciar Servidor Next.js

```bash
# Pare o servidor atual (Ctrl+C)
# Reinicie
npm run dev
```

### PASSO 6: Testar no Browser

1. Abra o console do browser (F12)
2. Faça login no sistema
3. Verifique os logs:

**Logs Esperados (Sucesso):**
```
[TenantProvider] ✅ Perfil encontrado por ID: user@email.com
```

**Se ainda houver erro:**
```
[TenantProvider] 🚨 ERRO DE SCHEMA: Colunas não encontradas! Execute o script: supabase/FIX_SCHEMA_FINAL.sql
```
→ Volte ao PASSO 2 e verifique se o script foi executado completamente.

---

## 🧪 TESTES DE VALIDAÇÃO

### Teste 1: Buscar Usuário por ID (Supabase REST API)

```sql
-- Via SQL Editor
SELECT * FROM public.users WHERE id = '<USER_UUID>';
-- Deve retornar o usuário sem erros
```

### Teste 2: Buscar Usuário por Email (Supabase REST API)

```sql
-- Via SQL Editor
SELECT * FROM public.users WHERE email = 'user@email.com';
-- Deve retornar o usuário sem erros
```

### Teste 3: Verificar Trigger de Criação de Perfil

```sql
-- Criar usuário de teste no Auth (ou registrar via UI)
-- Verificar se perfil foi criado automaticamente:
SELECT au.email, u.id, u."tenantId", u.role
FROM auth.users au
LEFT JOIN public.users u ON au.id::text = u.id
WHERE au.email = 'teste@email.com';
-- Deve retornar linha com perfil criado
```

### Teste 4: Verificar RLS Funcionando

```sql
-- Setar role de usuário autenticado (simulação)
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "<USER_UUID>"}';

-- Tentar buscar usuários do mesmo tenant
SELECT id, email, role FROM public.users;
-- Deve retornar apenas usuários do mesmo tenant
```

---

## 🔧 TROUBLESHOOTING

### Problema: Script Falha com "column already exists"

**Causa:** Colunas já estão em camelCase (schema correto).

**Solução:** O script já detecta isso automaticamente e pula colunas que já estão corretas. Se ainda houver erros 500, execute apenas a parte de RLS policies:

```sql
-- Dropar e recriar apenas RLS policies
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "tenants_select_policy" ON public.tenants;

-- Recriar policies (copiar do FIX_SCHEMA_FINAL.sql)
```

### Problema: "relation 'users' does not exist"

**Causa:** A tabela foi renomeada ou deletada.

**Solução:** Verifique se a tabela existe:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

Se a tabela `users` não existir, mas `User` existir:
```sql
ALTER TABLE "User" RENAME TO users;
```

### Problema: "type \"UserRole\" does not exist"

**Causa:** Enum não foi criado ou foi deletado.

**Solução:** Recriar o enum:
```sql
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
    CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER');
  END IF;
END $$;
```

### Problema: Perfis Não São Criados no Registro

**Causa:** Trigger não está ativo.

**Verificação:**
```sql
SELECT trigger_name, event_object_table, action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

Se não retornar nada, recriar o trigger (executar PASSO 2 do script novamente).

### Problema: Erro 403 (Forbidden) Após Correção

**Causa:** RLS policies estão bloqueando acesso.

**Solução:** Verificar se o usuário está autenticado e tem tenantId válido:
```sql
SELECT id, "tenantId", email, role FROM public.users WHERE id = '<UUID>';
-- Se tenantId for NULL, atribuir:
UPDATE public.users SET "tenantId" = '<TENANT_UUID>' WHERE id = '<UUID>';
```

---

## 📁 ARQUIVOS MODIFICADOS

| Arquivo | Modificação | Motivo |
|---------|-------------|--------|
| `supabase/FIX_SCHEMA_FINAL.sql` | **CRIADO** | Script unificado de correção de schema |
| `src/contexts/tenant-context.tsx` | **MODIFICADO** | Melhor logging de erros e select explícito de colunas |

---

## 🎯 PREVENÇÃO FUTURA

### Regra de Ouro

> **NUNCA** criar scripts SQL com nomenclatura snake_case para tabelas gerenciadas pelo Prisma.
> O Prisma usa **camelCase** por padrão para colunas (mapeado via `@@map` para tabelas em minúsculas).

### Convenção de Nomes

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Tabelas | snake_case (minúsculas) | `users`, `tenants`, `order_items` |
| Colunas | camelCase | `"tenantId"`, `"createdAt"` |
| Enums | PascalCase | `"UserRole"`, `"OrderStatus"` |
| Índices | snake_case | `idx_users_tenantId` |

### Checklist Antes de Executar Scripts SQL

- [ ] Verificar se colunas mencionadas existem no schema Prisma
- [ ] Testar script em ambiente de staging primeiro
- [ ] Fazer backup do banco antes de executar
- [ ] Validar output do script (NOTICE/WARNING)
- [ ] Testar queries via Supabase REST API após execução

---

## 📞 SUPORTE

Se após executar todos os passos os erros persistirem:

1. **Coletar logs do servidor:**
   ```bash
   npm run dev 2>&1 | tee server.log
   ```

2. **Coletar logs do browser:** Console (F12) → Copiar todos os logs `[TenantProvider]`

3. **Verificar estado do banco:**
   ```sql
   SELECT column_name, data_type FROM information_schema.columns
   WHERE table_name = 'users' AND table_schema = 'public'
   ORDER BY ordinal_position;
   ```

4. **Abrir issue** com:
   - Output do script SQL
   - Logs do servidor
   - Logs do browser
   - Resultado da query de validação do schema

---

## ✅ CHECKLIST DE CONCLUSÃO

Marque cada item conforme for completado:

- [ ] Script `FIX_SCHEMA_FINAL.sql` executado com sucesso
- [ ] Colunas validadas como camelCase
- [ ] RLS policies verificadas
- [ ] Servidor Next.js reiniciado
- [ ] Login testado sem erros 500
- [ ] Logs do browser mostram `✅ Perfil encontrado`
- [ ] Registro de novo usuário testado (trigger cria perfil)
- [ ] Tenant buscado corretamente

---

**Data da Correção:** 10 de abril de 2026  
**Responsável:** Engenharia PrintAI  
**Status:** ✅ SOLUÇÃO PRONTA PARA EXECUÇÃO
