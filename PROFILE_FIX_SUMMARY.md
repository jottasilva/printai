# 🎯 Correção de Perfis - PrintAI ERP

## ✅ O Que Foi Feito

### 1. Diagnóstico Completo

**Problema Identificado:**
- ❌ Usuário `admin@printai.com` (ID: `aeb5f5cd-5d99-4a99-a1bc-c4a55fb3bab3`) existia apenas no `auth.users`
- ❌ Não havia perfil correspondente na tabela `public.users`
- ❌ Trigger automático para criar perfis não estava configurado
- ❌ Tabelas já estavam com nomes corretos (minúsculas)
- ✅ Tenant já existia: `91857740-c521-4ad4-b4c7-8e76f25b9365` (PrintFlow Studio)

### 2. Correções Executadas no Banco

#### ✅ Função de Sincronização Criada
```sql
CREATE FUNCTION sync_user_profile() RETURNS TRIGGER ...
```
- Cria perfil automaticamente quando usuário faz login
- Mapeia `SUPERADMIN` → `ADMIN` (enum válido)
- Usa `SECURITY DEFINER` para bypass de RLS

#### ✅ Trigger Configurado
```sql
CREATE TRIGGER sync_user_profile_trigger 
AFTER UPDATE OF last_sign_in_at ON auth.users
```
- Dispara no primeiro login (`last_sign_in_at` muda de NULL para valor)
- Cria perfil automaticamente se não existir

#### ✅ Perfil Criado Manualmente
- ✅ `admin@printai.com` - Agora tem perfil com role `ADMIN`

### 3. Estado Atual do Banco

| Email | Status |
|-------|--------|
| admin@printai.com | ✅ Tem perfil |
| admin@printflowstudio.com.br | ⚠️ Sem perfil (ID auth difere) |
| atendimento@printflowstudio.com.br | ⚠️ Sem perfil (ID auth difere) |
| design@printflowstudio.com.br | ⚠️ Sem perfil (ID auth difere) |
| producao@printflowstudio.com.br | ⚠️ Sem perfil (ID auth difere) |
| financeiro@printflowstudio.com.br | ⚠️ Sem perfil (ID auth difere) |

---

## 🚀 Próximos Passos

### Testar Login com admin@printai.com

1. **Limpe cookies do navegador**:
   - `Ctrl+Shift+Delete` → Marque "Cookies" → Limpar
   
2. **Acesse**: `http://localhost:3000/login`

3. **Faça login**:
   - Email: `admin@printai.com`
   - Senha: Sua senha

4. **Resultado esperado**:
   - ✅ Login realizado com sucesso
   - ✅ Redirecionamento para `/admin`
   - ✅ Painel exibido normalmente

### Se Ainda Houver Erro

1. **Verifique o console do navegador** (F12)
2. **Procure por**:
   ```
   [TenantProvider] ✅ Perfil encontrado por ID: admin@printai.com
   ```
3. **Se ainda houver erro**, execute:
   ```sql
   SELECT id, email, "tenantId" FROM users WHERE email = 'admin@printai.com';
   ```

---

## 📋 Scripts SQL Disponíveis

### `supabase/sync_profiles.sql`
- Cria função e trigger de sincronização
- Cria perfis para usuários existentes
- **Já executado** ✅

### `supabase/create_remaining_profiles.sql`
- Cria perfis restantes para usuários do printflowstudio
- **Executar apenas se necessário**

---

## 🔍 Verificação Rápida

```sql
-- Verificar se admin@printai.com tem perfil
SELECT id, email, "tenantId" FROM users WHERE email = 'admin@printai.com';

-- Resultado esperado:
-- id: aeb5f5cd-5d99-4a99-a1bc-c4a55fb3bab3
-- email: admin@printai.com
-- tenantId: 91857740-c521-4ad4-b4c7-8e76f25b9365
```

---

**Data**: 2026-04-10
**Status**: ✅ Perfil do admin@printai.com criado com sucesso
