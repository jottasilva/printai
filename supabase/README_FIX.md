# 🔧 Correção de Perfis de Usuário - PrintAI ERP

## 📋 Problema

Usuários que se registram através da página `/register` **não têm perfil criado na tabela `users`**, causando o erro:
```
Erro ao buscar perfil: Could not find the table 'public.User' in the schema cache
```

## 🎯 Causa Raiz

1. O registro cria o usuário **apenas no Supabase Auth**
2. **Não há trigger** para auto-criar o perfil na tabela `users`
3. Os nomes das tabelas estavam incorretos no código (`User` vs `users`)

## ✅ Soluções Aplicadas

### 1. Nomes de Tabelas Corrigidos
- ✅ `tenant-context.tsx` agora usa `'users'` e `'tenants'` (minúsculas)
- ✅ Fallback para busca por email quando ID não corresponde

### 2. Auto-Healing no TenantProvider
- ✅ Primeiro tenta buscar por ID
- ✅ Se falhar, tenta buscar por email
- ✅ Se ambos falharem, redireciona para login com erro claro

### 3. Registro Melhorado
- ✅ Mensagem de sucesso mais clara
- ✅ Tempo de espera maior para trigger processar (4s)
- ✅ Feedback visual melhorado

## 🚀 Como Aplicar a Correção

### Passo 1: Executar SQL de Correção no Supabase

1. Acesse o **SQL Editor** no seu dashboard do Supabase
2. Copie o conteúdo do arquivo `supabase/fix_user_profiles.sql`
3. Cole e execute o script

**O que este script faz:**
- ✅ Renomeia tabelas com nomes antigos (ex: `User` → `users`)
- ✅ Cria trigger automático para novos registros
- ✅ Cria perfis para usuários existentes sem perfil
- ✅ Habilita Row Level Security (RLS)
- ✅ Cria policies básicas de isolamento de tenant

### Passo 2: Verificar Execução

Após executar o SQL, você deve ver logs como:
```
NOTICE:  Tabela User renomeada para users
NOTICE:  Tabela Tenant renomeada para tenants
NOTICE:  Tenant criado automaticamente: Minha Empresa
NOTICE:  Perfil criado automaticamente para usuário: seu@email.com
```

### Passo 3: Testar o Fluxo

1. **Logout**: Se estiver logado, faça logout
2. **Registro**: Crie uma nova conta em `/register`
3. **Login**: Faça login com a nova conta
4. **Verifique**: Deve ser redirecionado para `/admin` sem erros

## 🔍 Verificação de Sucesso

### No Browser Console
Procure por estas mensagens de sucesso:
```
[TenantProvider] Perfil encontrado por email: seu@email.com
```

### No Supabase Dashboard
Execute esta query para verificar perfis:
```sql
SELECT id, email, name, role, tenant_id 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
```

### Verificar Trigger
```sql
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

## 🆘 Troubleshooting

### Erro: "Perfil não encontrado"

**Solução:**
1. Faça logout clicando no botão "Sair da conta" na página de login
2. Aguarde 10 segundos
3. Faça login novamente

### Erro: "Nenhum tenant disponível"

**Causa:** O script SQL não foi executado ou falhou

**Solução:**
1. Verifique os logs de execução no Supabase SQL Editor
2. Execute manualmente a criação de tenant:
```sql
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
```

### Erro: "table already exists"

**Causa:** Tabelas já estão com nomes corretos

**Solução:** Este erro é inofensivo. O script usa `IF NOT EXISTS` para evitar conflitos.

## 📚 Scripts Auxiliares

### Criar Perfil Manualmente para um Usuário
```sql
-- Substitua 'SEU_EMAIL' pelo email do usuário
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

### Listar Usuários Auth Sem Perfil
```sql
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL
  AND au.email_confirmed_at IS NOT NULL;
```

## 🎯 Próximos Passos

1. ✅ **Aplicar SQL de correção** (obrigatório)
2. ✅ **Testar registro e login**
3. ✅ **Verificar se perfis foram criados**
4. 🔄 **Opcional**: Refinar policies de RLS para cada tabela
5. 🔄 **Opcional**: Adicionar mais campos ao perfil durante registro

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique os logs do browser (F12 → Console)
2. Verifique os logs do Supabase (Dashboard → Logs)
3. Execute as queries de verificação acima
4. Documente os erros encontrados

---

**Última atualização**: 2026-04-10
**Versão**: 1.0.0
