# 🚀 Correção do Loop de Redirecionamento - Instruções Rápidas

## ❌ Problema Atual

Você está preso em um **loop infinito** de redirecionamentos para `/login?error=profile_missing`.

## ✅ O Que Foi Corrigido

1. ✅ **Logout automático** quando não há perfil no banco
2. ✅ **Fallback por email** no tenant-context
3. ✅ **Limpeza de cookies** do Supabase no servidor
4. ✅ **Loop quebrado** na página de login

## 🔧 PRÓXIMO PASSO (OBRIGATÓRIO)

### Execute o SQL no Supabase

1. Acesse: https://app.supabase.com
2. Selecione seu projeto: `wlxuevhxnxyvvjtocnrc`
3. Vá para **SQL Editor**
4. Copie e cole o conteúdo do arquivo: `supabase/fix_user_profiles.sql`
5. Clique em **Run**

### O Que Este Script Faz

- ✅ Renomeia tabelas com nomes antigos (ex: `User` → `users`)
- ✅ Cria **trigger automático** para novos registros
- ✅ Cria perfis para usuários existentes **sem perfil**
- ✅ Cria tenant automático se não existir
- ✅ Habilita Row Level Security

## 🧪 Testar Após SQL

1. **Limpe cache do navegador**: `Ctrl+Shift+Delete` → Cookies
2. Acesse: `http://localhost:3000/login`
3. **Faça login** com seu usuário
4. Deve funcionar **sem loop**!

## 🆘 Se Ainda Houver Loop

### Opção 1: Logout Manual
```javascript
// No console do navegador (F12)
await fetch('/api/auth/signout', { method: 'POST' })
window.location.href = '/login'
```

### Opção 2: Criar Perfil Manualmente

Substitua `SEU_EMAIL` pelo email do usuário com problema:

```sql
-- 1. Verificar se tenant existe
SELECT id, name, slug FROM tenants WHERE deleted_at IS NULL LIMIT 1;

-- 2. Se não retornar, criar tenant:
INSERT INTO tenants (id, name, slug, plan, status, max_users, max_storage, trial_ends_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Minha Empresa',
  'minha-empresa',
  'PROFESSIONAL',
  'TRIAL',
  10,
  5368709120,
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW()
);

-- 3. Criar perfil do usuário:
INSERT INTO users (id, tenant_id, email, name, role, permissions, email_verified_at, created_at, updated_at)
SELECT 
  au.id,
  (SELECT id FROM tenants WHERE deleted_at IS NULL ORDER BY created_at ASC LIMIT 1),
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  'OWNER',
  ARRAY['*'],
  COALESCE(au.email_confirmed_at, NOW()),
  au.created_at,
  NOW()
FROM auth.users au
WHERE au.email = 'SEU_EMAIL'
  AND au.email_confirmed_at IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = au.id);
```

## 📊 Verificar Se Funcionou

### No Console do Navegador
Deve aparecer:
```
[TenantProvider] Perfil encontrado por email: seu@email.com
```

### No Supabase
```sql
SELECT id, email, name, role, tenant_id FROM users;
```

## 🎯 Resumo

| Etapa | Status | Ação |
|-------|--------|------|
| Código corrigido | ✅ Feito | Logout automático + fallback |
| SQL no Supabase | ⏳ Pendente | Execute o script |
| Teste | ⏳ Pendente | Faça login |

---

**Execute o SQL e teste novamente!** 🚀
