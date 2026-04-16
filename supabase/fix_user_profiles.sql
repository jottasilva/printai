-- =====================================================
-- PrintAI ERP - Correção de Perfis de Usuário
-- =====================================================
-- Este script:
-- 1. Verifica se as tabelas estão com nomes corretos (minúsculas)
-- 2. Cria trigger para auto-criar perfil de usuário no registro
-- 3. Cria perfil para usuários existentes sem perfil
-- =====================================================

-- 1. Verificar e renomear tabelas se necessário
-- =====================================================

-- Verifica se a tabela "User" existe e renomeia para "users"
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'User') THEN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
      ALTER TABLE "User" RENAME TO "users";
      RAISE NOTICE 'Tabela User renomeada para users';
    ELSE
      RAISE NOTICE 'Tabela users já existe';
    END IF;
  ELSE
    RAISE NOTICE 'Tabela User não existe (já está correta)';
  END IF;
END $$;

-- Verifica se a tabela "Tenant" existe e renomeia para "tenants"
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Tenant') THEN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tenants') THEN
      ALTER TABLE "Tenant" RENAME TO "tenants";
      RAISE NOTICE 'Tabela Tenant renomeada para tenants';
    ELSE
      RAISE NOTICE 'Tabela tenants já existe';
    END IF;
  ELSE
    RAISE NOTICE 'Tabela Tenant não existe (já está correta)';
  END IF;
END $$;

-- Renomear outras tabelas se necessário (seguindo o padrão do @@map)
DO $$
DECLARE
  table_mapping RECORD;
BEGIN
  FOR table_mapping IN 
    SELECT * FROM (VALUES
      ('Customer', 'customers'),
      ('Address', 'addresses'),
      ('Category', 'categories'),
      ('Product', 'products'),
      ('ProductVariant', 'product_variants'),
      ('Inventory', 'inventories'),
      ('InventoryMovement', 'inventory_movements'),
      ('Supplier', 'suppliers'),
      ('SupplierProduct', 'supplier_products'),
      ('Quote', 'quotes'),
      ('QuoteItem', 'quote_items'),
      ('Order', 'orders'),
      ('OrderItem', 'order_items'),
      ('OrderItemLog', 'order_item_logs'),
      ('Payment', 'payments'),
      ('Receivable', 'receivables'),
      ('Payable', 'payables'),
      ('CashFlow', 'cash_flows'),
      ('Conversation', 'conversations'),
      ('Message', 'messages'),
      ('Subscription', 'subscriptions'),
      ('AuditLog', 'audit_logs'),
      ('SystemLog', 'system_logs'),
      ('NumberSequence', 'number_sequences')
    ) AS mappings(old_name TEXT, new_name TEXT)
  LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = table_mapping.old_name) THEN
      IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = table_mapping.new_name) THEN
        EXECUTE format('ALTER TABLE "%I" RENAME TO %I', table_mapping.old_name, table_mapping.new_name);
        RAISE NOTICE 'Tabela % renomeada para %', table_mapping.old_name, table_mapping.new_name;
      ELSE
        RAISE NOTICE 'Tabela % já existe', table_mapping.new_name;
      END IF;
    END IF;
  END LOOP;
END $$;

-- 2. Criar função e trigger para auto-criar perfil de usuário
-- =====================================================

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
  v_user_role TEXT := 'OWNER';
  v_user_name TEXT;
  v_company_name TEXT;
BEGIN
  -- Obtém dados do metadata
  v_user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  v_company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', 'Minha Empresa');

  -- Verifica se é o primeiro usuário do sistema (cria tenant automaticamente)
  IF NOT EXISTS (SELECT 1 FROM public.tenants WHERE deleted_at IS NULL) THEN
    -- Cria tenant padrão
    INSERT INTO public.tenants (
      id,
      name,
      slug,
      plan,
      status,
      max_users,
      max_storage,
      trial_ends_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_company_name,
      LOWER(REGEXP_REPLACE(v_company_name, '[^a-zA-Z0-9]', '-', 'g')),
      'PROFESSIONAL',
      'TRIAL',
      10,
      5368709120, -- 5GB
      NOW() + INTERVAL '30 days',
      NOW(),
      NOW()
    ) RETURNING id INTO v_tenant_id;
    
    RAISE NOTICE 'Tenant criado automaticamente: %', v_company_name;
  ELSE
    -- Pega o primeiro tenant ativo (para simplificar o primeiro registro)
    SELECT id INTO v_tenant_id 
    FROM public.tenants 
    WHERE deleted_at IS NULL 
    ORDER BY created_at ASC 
    LIMIT 1;
  END IF;

  -- Se não encontrou tenant, aborta
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum tenant disponível para criar perfil de usuário';
  END IF;

  -- Cria o perfil do usuário na tabela users
  INSERT INTO public.users (
    id,
    tenant_id,
    email,
    name,
    role,
    permissions,
    email_verified_at,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    v_tenant_id,
    NEW.email,
    v_user_name,
    v_user_role,
    ARRAY['*'], -- Owner tem todas as permissões
    NOW(),
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Perfil criado automaticamente para usuário: %', NEW.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cria o trigger no Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- 3. Criar perfis para usuários existentes sem perfil
-- =====================================================

INSERT INTO public.users (
  id,
  tenant_id,
  email,
  name,
  role,
  permissions,
  email_verified_at,
  created_at,
  updated_at
)
SELECT 
  au.id,
  (SELECT id FROM public.tenants WHERE deleted_at IS NULL ORDER BY created_at ASC LIMIT 1),
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  'OWNER',
  ARRAY['*'],
  COALESCE(au.email_confirmed_at, NOW()),
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL
  AND au.email_confirmed_at IS NOT NULL;  -- Apenas usuários verificados

-- 4. Habilitar Row Level Security (RLS)
-- =====================================================

-- Ativar RLS em todas as tabelas
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.number_sequences ENABLE ROW LEVEL SECURITY;

-- 5. Criar policies básicas de isolamento de tenant
-- =====================================================

-- Policy para users: usuários podem ver apenas seus próprios dados
DROP POLICY IF EXISTS users_can_view_own_profile ON public.users;
CREATE POLICY users_can_view_own_profile ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy para tenants: usuários podem ver o tenant associado
DROP POLICY IF EXISTS users_can_view_their_tenant ON public.tenants;
CREATE POLICY users_can_view_their_tenant ON public.tenants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.tenant_id = tenants.id 
      AND u.id = auth.uid()
    )
  );

-- Policy genérica para outras tabelas (será refinada posteriormente)
-- Permite acesso a registros do mesmo tenant do usuário logado
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
    EXECUTE format(
      'DROP POLICY IF EXISTS tenant_isolation_policy ON public.%I',
      tbl.tablename
    );
    
    EXECUTE format(
      'CREATE POLICY tenant_isolation_policy ON public.%I
       FOR ALL
       USING (tenant_id IN (
         SELECT tenant_id FROM public.users WHERE id = auth.uid()
       ))',
      tbl.tablename
    );
    
    RAISE NOTICE 'Policy criada para tabela: %', tbl.tablename;
  END LOOP;
END $$;

-- =====================================================
-- Conclusão
-- =====================================================
-- Script executado com sucesso!
-- Verifique os logs acima para confirmar as ações realizadas.
-- =====================================================
