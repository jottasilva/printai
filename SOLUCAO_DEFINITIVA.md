# 🚀 SOLUÇÃO DEFINITIVA - Perfis de Usuário PrintAI ERP

## 📊 Diagnóstico Completo

### Erro Atual
```
GET /rest/v1/users?id=eq.xxx 403 (Forbidden)
[TenantProvider] Perfil não encontrado. Usuário precisa ser criado no banco.
"Sua conta não está sincronizada com nosso banco de dados."
```

### Causa Raiz
1. ✅ **RLS (Row Level Security) ativado** sem policies configuradas corretamente
2. ✅ **Usuário existe apenas no Supabase Auth** (tabela `auth.users`)
3. ✅ **Perfil não existe na tabela `public.users`** do banco de dados
4. ✅ **Trigger automático não configurado** para criar perfil durante registro

---

## 🎯 Solução em 3 Passos

### PASSO 1: Executar SQL no Supabase (OBRIGATÓRIO)

1. Acesse: **https://app.supabase.com**
2. Selecione seu projeto: `wlxuevhxnxyvvjtocnrc`
3. Vá para **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Copie TODO o conteúdo do arquivo: `supabase/COMPLETE_FIX_PROFILES.sql`
6. Cole no editor
7. Clique em **Run** (ou `Ctrl+Enter`)

#### O Que Este Script Faz

| Etapa | Ação | Status |
|-------|------|--------|
| 1 | Renomeia tabelas (`User` → `users`, `Tenant` → `tenants`) | ✅ |
| 2 | Cria tenant padrão se não existir | ✅ |
| 3 | Desabilita RLS temporariamente | ✅ |
| 4 | Cria função `auto_create_user_profile()` | ✅ |
| 5 | Cria trigger `on_auth_user_created` | ✅ |
| 6 | Cria perfis para usuários existentes sem perfil | ✅ |
| 7 | Reabilita RLS com policies corretas | ✅ |
| 8 | Cria view de debug | ✅ |

#### Log de Sucesso Esperado

```
==========================================
✅ SCRIPT EXECUTADO COM SUCESSO!
==========================================
📊 Resumo:
   - Tenants ativos: 1
   - Perfis criados: 1
   - Usuários Auth: 1
==========================================
🚀 PRÓXIMO PASSO:
   1. Faça logout no app (se estiver logado)
   2. Limpe cookies do navegador
   3. Acesse: http://localhost:3000/login
   4. Faça login normalmente
==========================================
```

---

### PASSO 2: Limpar Cache e Fazer Logout

1. **Limpe cookies do navegador**:
   - Chrome: `Ctrl+Shift+Delete` → Marque "Cookies" → "Limpar dados"
   - Ou no console (F12): `document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));`

2. **Reinicie o servidor de desenvolvimento**:
   ```bash
   # No terminal, pressione Ctrl+C
   npm run dev
   ```

---

### PASSO 3: Testar Login

1. Acesse: `http://localhost:3000/login`
2. Faça login com:
   - **Email**: `admin@printai.com` (ou o email que você registrou)
   - **Senha**: Sua senha
3. **Resultado esperado**: Redirecionamento automático para `/admin` (painel)

---

## 🔍 Verificação de Sucesso

### No Console do Navegador (F12)

Deve aparecer:
```
[Login] ✅ Login realizado com sucesso
[TenantProvider] ✅ Perfil encontrado por ID: seu@email.com
```

### No Supabase Dashboard

Execute esta query no **SQL Editor**:
```sql
SELECT 
  au.email,
  u.name,
  u.role,
  u.tenant_id,
  t.name as tenant_name
FROM auth.users au
JOIN public.users u ON au.id = u.id
JOIN public.tenants t ON u.tenant_id = t.id
WHERE au.email_confirmed_at IS NOT NULL;
```

**Resultado esperado**:
| email | name | role | tenant_id | tenant_name |
|-------|------|------|-----------|-------------|
| admin@printai.com | Admin | OWNER | uuid-xxx | PrintAI Demo |

---

## 🆘 Troubleshooting

### Erro: "E-mail ou senha incorretos"

**Causa**: Credenciais inválidas

**Solução**:
1. Verifique se o email está correto
2. Se esqueceu a senha, crie uma nova conta em `/register`

---

### Erro: "Sua conta não está sincronizada..."

**Causa**: Script SQL não foi executado ou falhou

**Solução**:
1. Verifique os logs de execução no Supabase SQL Editor
2. Execute manualmente para criar perfil:

```sql
-- Substitua SEU_EMAIL pelo email do usuário
INSERT INTO public.users (
  id, tenant_id, email, name, role, permissions,
  email_verified_at, created_at, updated_at
)
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
  AND NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = au.id);
```

---

### Erro: "table does not exist"

**Causa**: Tabelas ainda estão com nomes antigos (maiúsculas)

**Solução**: O script SQL já cuida disso. Verifique se executou corretamente.

---

### Loop Infinito / Página Não Carrega

**Causa**: Cookies antigos ou RLS bloqueando

**Solução**:
1. Limpe TODOS os cookies do domínio `localhost`
2. Reinicie o servidor: `Ctrl+C` → `npm run dev`
3. Tente em aba anônima

---

## 📋 Arquitetura Corrigida

### Fluxo de Login (CORRIGIDO)

```
1. Usuário faz login em /login
   ↓
2. Supabase Auth valida credenciais
   ↓
3. Redirect para /admin
   ↓
4. getTenantId() busca perfil no banco
   ↓
5a. Se encontrou perfil → Exibe painel ✅
5b. Se NÃO encontrou perfil → Logout automático → Redirect para /login
```

### Fluxo de Registro (CORRIGIDO)

```
1. Usuário preenche formulário em /register
   ↓
2. Supabase Auth cria usuário (auth.users)
   ↓
3. Trigger on_auth_user_created dispara
   ↓
4. Função auto_create_user_profile() cria:
   - Tenant (se não existir)
   - Perfil na tabela public.users
   ↓
5. Redirect para /login?message=registration_success
   ↓
6. Usuário faz login → Vai para /admin ✅
```

---

## 🎯 Checklist Final

| Etapa | Status | Ação |
|-------|--------|------|
| 1. Script SQL executado | ⏳ | Execute no Supabase |
| 2. Cookies limpos | ⏳ | Ctrl+Shift+Delete |
| 3. Servidor reiniciado | ⏳ | Ctrl+C → npm run dev |
| 4. Login testado | ⏳ | Acesse /login |
| 5. Painel exibido | ⏳ | Deve ver /admin |

---

## 📞 Precisa de Ajuda?

Se ainda houver problemas após executar o SQL:

1. **Verifique logs do Supabase**:
   - Dashboard → Logs → Database Logs
   
2. **Verifique logs do navegador**:
   - F12 → Console → Procure por erros vermelhos
   
3. **Execute query de debug**:
   ```sql
   SELECT * FROM debug_auth_users;
   ```
   (Requer acesso service_role no Supabase)

---

**Última atualização**: 2026-04-10
**Versão**: 2.0.0 - Solução Definitiva
**Autor**: Especialista PrintAI ERP
