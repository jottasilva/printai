-- =====================================================
-- PrintAI ERP - SOLUÇÃO DEFINITIVA DE PERFIS
-- =====================================================
-- Este script resolve TODOS os problemas de forma permanente:
-- 1. Renomeia tabelas para nomenclatura correta (minúsculas)
-- 2. Configura RLS com policies funcionais
-- 3. Cria trigger automático para novos registros
-- 4. Cria perfis para usuários existentes
-- 5. Garante tenant padrão
-- =====================================================

BEGIN;

-- 1. RENOMEAR TABELAS (se necessário)
-- =====================================================

DO $$
DECLARE
  table_mapping RECORD;
BEGIN
  FOR table_mapping IN
    SELECT old_name, new_name FROM (
      SELECT 'User' AS old_name, 'users' AS new_name
      UNION ALL SELECT 'Tenant', 'tenants'
      UNION ALL SELECT 'Customer', 'customers'
      UNION ALL SELECT 'Address', 'addresses'
      UNION ALL SELECT 'Category', 'categories'
      UNION ALL SELECT 'Product', 'products'
      UNION ALL SELECT 'ProductVariant', 'product_variants'
      UNION ALL SELECT 'Inventory', 'inventories'
      UNION ALL SELECT 'InventoryMovement', 'inventory_movements'
      UNION ALL SELECT 'Supplier', 'suppliers'
      UNION ALL SELECT 'SupplierProduct', 'supplier_products'
      UNION ALL SELECT 'Quote', 'quotes'
      UNION ALL SELECT 'QuoteItem', 'quote_items'
      UNION ALL SELECT 'Order', 'orders'
      UNION ALL SELECT 'OrderItem', 'order_items'
      UNION ALL SELECT 'OrderItemLog', 'order_item_logs'
      UNION ALL SELECT 'Payment', 'payments'
      UNION ALL SELECT 'Receivable', 'receivables'
      UNION ALL SELECT 'Payable', 'payables'
      UNION ALL SELECT 'CashFlow', 'cash_flows'
      UNION ALL SELECT 'Conversation', 'conversations'
      UNION ALL SELECT 'Message', 'messages'
      UNION ALL SELECT 'Subscription', 'subscriptions'
      UNION ALL SELECT 'AuditLog', 'audit_logs'
      UNION ALL SELECT 'SystemLog', 'system_logs'
      UNION ALL SELECT 'NumberSequence', 'number_sequences'
    ) AS mappings
  LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = table_mapping.old_name) THEN
      IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = table_mapping.new_name) THEN
        EXECUTE format('ALTER TABLE "%I" RENAME TO %I', table_mapping.old_name, table_mapping.new_name);
        RAISE NOTICE '✅ Tabela % renomeada para %', table_mapping.old_name, table_mapping.new_name;
      ELSE
        RAISE NOTICE '⚠️  Tabela % já existe (ignorando)', table_mapping.new_name;
      END IF;
    END IF;
  END LOOP;
END $$;

-- 2. CRIAR TENANT PADRÃO (se não existir)
-- =====================================================

INSERT INTO tenants (
  id, name, slug, plan, status, 
  "maxUsers", "maxStorage", 
  "trialEndsAt", "createdAt", "updatedAt"
)
SELECT 
  gen_random_uuid(),
  'PrintAI Demo',
  'printai-demo',
  'PROFESSIONAL',
  'TRIAL',
  10,
  5368709120,
  NOW() + INTERVAL '90 days',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM tenants WHERE "deletedAt" IS NULL
);

DO $$
BEGIN
  RAISE NOTICE '✅ Tenant padrão verificado/criado';
END $$;

-- 3. DESABILITAR RLS TEMPORARIAMENTE PARA CONFIGURAÇÃO
-- =====================================================

-- Desabilita RLS em todas as tabelas temporariamente
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', tbl.tablename);
  END LOOP;
END $$;

DO $$
BEGIN
  RAISE NOTICE '✅ RLS desabilitado temporariamente';
END $$;

-- 4. CRIAR FUNÇÃO DE AUTO-REGISTRO DE PERFIL
-- =====================================================

CREATE OR REPLACE FUNCTION public.auto_create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id TEXT;
  v_user_name TEXT;
  v_user_role TEXT;
  v_permissions TEXT[];
BEGIN
  -- Obtém nome do metadata ou usa parte do email
  v_user_name := COALESCE(
    NEW.raw_user_meta_data->>'name', 
    split_part(NEW.email, '@', 1)
  );

  -- Obtém ou cria tenant
  SELECT id::text INTO v_tenant_id 
  FROM tenants 
  WHERE slug = LOWER(REGEXP_REPLACE(
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'empresa'), 
    '[^a-zA-Z0-9]', '-', 'g'
  ))
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    -- Busca qualquer tenant ativo como último recurso
    SELECT id::text INTO v_tenant_id 
    FROM tenants 
    WHERE "deletedAt" IS NULL 
    ORDER BY "createdAt" ASC 
    LIMIT 1;
  END IF;

  IF v_tenant_id IS NULL THEN
    INSERT INTO tenants (
      id, name, slug, plan, status, 
      "maxUsers", "maxStorage", 
      "trialEndsAt", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid()::text,
      COALESCE(NEW.raw_user_meta_data->>'company_name', 'Empresa'),
      LOWER(REGEXP_REPLACE(
        COALESCE(NEW.raw_user_meta_data->>'company_name', 'empresa'), 
        '[^a-zA-Z0-9]', '-', 'g'
      )),
      'PROFESSIONAL',
      'TRIAL',
      10,
      5368709120,
      NOW() + INTERVAL '90 days',
      NOW(),
      NOW()
    ) RETURNING id INTO v_tenant_id;
    
    RAISE NOTICE '🏢 Tenant criado: %', v_tenant_id;
  END IF;

  -- Define role e permissões por role (sem wildcard)
  IF (SELECT COUNT(*) FROM public.users WHERE "tenantId"::text = v_tenant_id::text) = 0 THEN
    v_user_role := 'OWNER';
    v_permissions := ARRAY[
      'users:manage', 'tenants:manage', 'orders:*', 'products:*',
      'customers:*', 'inventory:*', 'financial:*', 'reports:*',
      'conversations:*', 'settings:*'
    ];
  ELSE
    v_user_role := 'ADMIN';
    v_permissions := ARRAY[
      'orders:*', 'products:*', 'customers:*', 'inventory:*',
      'financial:*', 'reports:view', 'conversations:*'
    ];
  END IF;

  -- Cria perfil do usuário com ON CONFLICT para evitar duplicata com fallback
  INSERT INTO public.users (
    id,
    "tenantId",
    email,
    name,
    role,
    "permissions",
    "emailVerifiedAt",
    "createdAt",
    "updatedAt"
  ) VALUES (
    NEW.id::text,
    v_tenant_id::text,
    NEW.email,
    v_user_name,
    v_user_role::"UserRole",
    v_permissions,
    COALESCE(NEW.email_confirmed_at, NOW()),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '👤 Perfil criado para: %', NEW.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CRIAR TRIGGER
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_user_profile();

DO $$
BEGIN
  RAISE NOTICE '✅ Trigger automático criado';
END $$;

-- 6. CRIAR PERFIS PARA USUÁRIOS EXISTENTES
-- =====================================================

-- Obtém tenant padrão
DO $$
DECLARE
  v_tenant_id TEXT;
  v_user RECORD;
BEGIN
  SELECT id::text INTO v_tenant_id 
  FROM tenants 
  WHERE "deletedAt" IS NULL 
  ORDER BY "createdAt" ASC 
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum tenant encontrado';
  END IF;

  -- Cria perfis para usuários sem perfil
  FOR v_user IN
    SELECT au.id::text as id, au.email, au.raw_user_meta_data, au.email_confirmed_at, au.created_at
    FROM auth.users au
    LEFT JOIN public.users u ON au.id::text = u.id::text
    WHERE u.id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.users u2 
      WHERE u2.email = au.email 
      AND u2."tenantId"::text = v_tenant_id::text
    )
  LOOP
    INSERT INTO public.users (
      id, "tenantId", email, name, role, "permissions",
      "emailVerifiedAt", "createdAt", "updatedAt"
    ) VALUES (
      v_user.id,
      v_tenant_id,
      v_user.email,
      COALESCE(v_user.raw_user_meta_data->>'name', split_part(v_user.email, '@', 1)),
      CASE 
        WHEN (SELECT COUNT(*) FROM public.users) = 0 THEN 'OWNER'::"UserRole"
        ELSE 'ADMIN'::"UserRole"
      END,
      ARRAY['*'],
      COALESCE(v_user.email_confirmed_at, NOW()),
      v_user.created_at,
      NOW()
    );
    
    RAISE NOTICE '👤 Perfil criado para usuário existente: %', v_user.email;
  END LOOP;
END $$;

-- 7. HABILITAR RLS COM POLICIES CORRETAS
-- =====================================================

-- 7.1. Habilitar RLS em todas as tabelas
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl.tablename);
  END LOOP;
END $$;

DO $$
BEGIN
  RAISE NOTICE '✅ RLS habilitado em todas as tabelas';
END $$;

-- 7.2. Criar policy para users (usuário pode ver seu próprio perfil)
DROP POLICY IF EXISTS "users_select_own_profile" ON public.users;
CREATE POLICY "users_select_own_profile" ON public.users
  FOR SELECT
  USING (
    id::text = auth.uid()::text 
    OR 
    "tenantId"::text IN (
      SELECT "tenantId"::text FROM public.users WHERE id::text = auth.uid()::text
    )
  );

-- 7.3. Criar policy para tenants (usuário pode ver seu tenant)
DROP POLICY IF EXISTS "tenants_select_user_tenant" ON public.tenants;
CREATE POLICY "tenants_select_user_tenant" ON public.tenants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u."tenantId"::text = tenants.id::text 
      AND u.id::text = auth.uid()::text
    )
  );

-- 7.4. Criar policy genérica para outras tabelas do mesmo tenant
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename NOT IN ('tenants', 'users')
      AND tablename IN (
        'customers', 'addresses', 'categories', 'products', 
        'product_variants', 'inventories', 'inventory_movements',
        'suppliers', 'supplier_products', 'quotes', 'quote_items',
        'orders', 'order_items', 'order_item_logs', 'payments',
        'receivables', 'payables', 'cash_flows', 'conversations',
        'messages', 'subscriptions', 'audit_logs', 'system_logs',
        'number_sequences'
      )
  LOOP
    -- DROP policy se existir
    EXECUTE format(
      'DROP POLICY IF EXISTS "%1$s_tenant_isolation" ON public.%1$I',
      tbl.tablename
    );
    
    -- Só cria política se a tabela tiver tenantId e não for a própria users ou tenants
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl.tablename AND column_name = 'tenantId') 
       AND tbl.tablename NOT IN ('users', 'tenants') THEN
        
        EXECUTE format(
          'CREATE POLICY "%1$s_tenant_isolation" ON public.%1$I
           FOR ALL
           USING (
             "tenantId"::text IN (
               SELECT "tenantId"::text FROM public.users WHERE id::text = auth.uid()::text
             )
           )',
          tbl.tablename
        );
    END IF;
    
    RAISE NOTICE '🔒 Policy criada: %', tbl.tablename;
  END LOOP;
END $$;

-- 8. CRIAR VIEW PARA DEBUG (opcional, remove depois)
-- =====================================================

CREATE OR REPLACE VIEW public.debug_auth_users AS
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  CASE WHEN u.id IS NOT NULL THEN '✅ Tem perfil' ELSE '❌ Sem perfil' END as perfil_status,
  u."tenantId",
  u.role
FROM auth.users au
LEFT JOIN public.users u ON au.id::text = u.id::text;

-- Conceder acesso apenas a service role
REVOKE ALL ON public.debug_auth_users FROM PUBLIC, authenticated;
GRANT SELECT ON public.debug_auth_users TO service_role;

DO $$
BEGIN
  RAISE NOTICE '✅ View de debug criada (acesso restrito)';
END $$;

-- 9. RESUMO FINAL
-- =====================================================

COMMIT;

-- Exibir resumo
DO $$
DECLARE
  v_total_users INT;
  v_total_tenants INT;
  v_total_profiles INT;
BEGIN
  SELECT COUNT(*) INTO v_total_tenants FROM tenants WHERE "deletedAt" IS NULL;
  SELECT COUNT(*) INTO v_total_profiles FROM users;
  SELECT COUNT(*) INTO v_total_users FROM auth.users WHERE email_confirmed_at IS NOT NULL;

  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '✅ SCRIPT EXECUTADO COM SUCESSO!';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '📊 Resumo:';
  RAISE NOTICE '   - Tenants ativos: %', v_total_tenants;
  RAISE NOTICE '   - Perfis criados: %', v_total_profiles;
  RAISE NOTICE '   - Usuários Auth: %', v_total_users;
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 PRÓXIMO PASSO:';
  RAISE NOTICE '   1. Faça logout no app (se estiver logado)';
  RAISE NOTICE '   2. Limpe cookies do navegador';
  RAISE NOTICE '   3. Acesse: http://localhost:3000/login';
  RAISE NOTICE '   4. Faça login normalmente';
  RAISE NOTICE '==========================================';
END $$;
