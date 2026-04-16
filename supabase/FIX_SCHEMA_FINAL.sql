-- =====================================================
-- PrintAI ERP — CORREÇÃO DEFINITIVA DE SCHEMA
-- =====================================================
-- PROBLEMA: Incompatibilidade entre nomenclatura Prisma (camelCase)
--           e scripts SQL anteriores (snake_case)
--
-- SOLUÇÃO: Padronizar TODAS as colunas para camelCase (padrão Prisma)
--          e reconstruir triggers + RLS policies corretamente
--
-- EXECUTAR NO SQL EDITOR DO SUPABASE
-- =====================================================

BEGIN;

-- =====================================================
-- PASSO 1: DIAGNÓSTICO — Verificar estado atual do schema
-- =====================================================

-- Descomente para debug:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- =====================================================
-- PASSO 2: RENOMEAR COLUNAS DE snake_case PARA camelCase
-- =====================================================
-- Só executa se as colunas snake_case existirem

DO $$
DECLARE
  v_has_tenant_id BOOLEAN;
  v_has_tenantId BOOLEAN;
  v_has_email_verified_at BOOLEAN;
  v_has_emailVerifiedAt BOOLEAN;
  v_has_created_at BOOLEAN;
  v_has_createdAt BOOLEAN;
  v_has_updated_at BOOLEAN;
  v_has_updatedAt BOOLEAN;
  v_has_deleted_at BOOLEAN;
  v_has_deletedAt BOOLEAN;
  v_has_max_users BOOLEAN;
  v_has_maxUsers BOOLEAN;
  v_has_max_storage BOOLEAN;
  v_has_maxStorage BOOLEAN;
  v_has_trial_ends_at BOOLEAN;
  v_has_trialEndsAt BOOLEAN;
  v_has_suspended_at BOOLEAN;
  v_has_suspendedAt BOOLEAN;
BEGIN
  -- Verifica colunas da tabela users
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'tenant_id' AND table_schema = 'public'
  ) INTO v_has_tenant_id;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'tenantId' AND table_schema = 'public'
  ) INTO v_has_tenantId;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'email_verified_at' AND table_schema = 'public'
  ) INTO v_has_email_verified_at;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'emailVerifiedAt' AND table_schema = 'public'
  ) INTO v_has_emailVerifiedAt;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'created_at' AND table_schema = 'public'
  ) INTO v_has_created_at;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'createdAt' AND table_schema = 'public'
  ) INTO v_has_createdAt;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'updated_at' AND table_schema = 'public'
  ) INTO v_has_updated_at;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'updatedAt' AND table_schema = 'public'
  ) INTO v_has_updatedAt;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'deleted_at' AND table_schema = 'public'
  ) INTO v_has_deleted_at;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'deletedAt' AND table_schema = 'public'
  ) INTO v_has_deletedAt;

  -- Verifica colunas da tabela tenants
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'max_users' AND table_schema = 'public'
  ) INTO v_has_max_users;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'maxUsers' AND table_schema = 'public'
  ) INTO v_has_maxUsers;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'max_storage' AND table_schema = 'public'
  ) INTO v_has_max_storage;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'maxStorage' AND table_schema = 'public'
  ) INTO v_has_maxStorage;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'trial_ends_at' AND table_schema = 'public'
  ) INTO v_has_trial_ends_at;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'trialEndsAt' AND table_schema = 'public'
  ) INTO v_has_trialEndsAt;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'suspended_at' AND table_schema = 'public'
  ) INTO v_has_suspended_at;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'suspendedAt' AND table_schema = 'public'
  ) INTO v_has_suspendedAt;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'created_at' AND table_schema = 'public'
  ) INTO v_has_created_at;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'createdAt' AND table_schema = 'public'
  ) INTO v_has_createdAt;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'updated_at' AND table_schema = 'public'
  ) INTO v_has_updated_at;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'updatedAt' AND table_schema = 'public'
  ) INTO v_has_updatedAt;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'deleted_at' AND table_schema = 'public'
  ) INTO v_has_deleted_at;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'deletedAt' AND table_schema = 'public'
  ) INTO v_has_deletedAt;

  -- RENOMEAR COLUNAS DA TABELA users
  IF v_has_tenant_id AND NOT v_has_tenantId THEN
    ALTER TABLE public.users RENAME COLUMN tenant_id TO "tenantId";
    RAISE NOTICE '✅ users.tenant_id → "tenantId"';
  END IF;

  IF v_has_email_verified_at AND NOT v_has_emailVerifiedAt THEN
    ALTER TABLE public.users RENAME COLUMN email_verified_at TO "emailVerifiedAt";
    RAISE NOTICE '✅ users.email_verified_at → "emailVerifiedAt"';
  END IF;

  IF v_has_created_at AND NOT v_has_createdAt THEN
    ALTER TABLE public.users RENAME COLUMN created_at TO "createdAt";
    RAISE NOTICE '✅ users.created_at → "createdAt"';
  END IF;

  IF v_has_updated_at AND NOT v_has_updatedAt THEN
    ALTER TABLE public.users RENAME COLUMN updated_at TO "updatedAt";
    RAISE NOTICE '✅ users.updated_at → "updatedAt"';
  END IF;

  IF v_has_deleted_at AND NOT v_has_deletedAt THEN
    ALTER TABLE public.users RENAME COLUMN deleted_at TO "deletedAt";
    RAISE NOTICE '✅ users.deleted_at → "deletedAt"';
  END IF;

  -- RENOMEAR COLUNAS DA TABELA tenants
  IF v_has_max_users AND NOT v_has_maxUsers THEN
    ALTER TABLE public.tenants RENAME COLUMN max_users TO "maxUsers";
    RAISE NOTICE '✅ tenants.max_users → "maxUsers"';
  END IF;

  IF v_has_max_storage AND NOT v_has_maxStorage THEN
    ALTER TABLE public.tenants RENAME COLUMN max_storage TO "maxStorage";
    RAISE NOTICE '✅ tenants.max_storage → "maxStorage"';
  END IF;

  IF v_has_trial_ends_at AND NOT v_has_trialEndsAt THEN
    ALTER TABLE public.tenants RENAME COLUMN trial_ends_at TO "trialEndsAt";
    RAISE NOTICE '✅ tenants.trial_ends_at → "trialEndsAt"';
  END IF;

  IF v_has_suspended_at AND NOT v_has_suspendedAt THEN
    ALTER TABLE public.tenants RENAME COLUMN suspended_at TO "suspendedAt";
    RAISE NOTICE '✅ tenants.suspended_at → "suspendedAt"';
  END IF;

  IF v_has_created_at AND NOT v_has_createdAt THEN
    ALTER TABLE public.tenants RENAME COLUMN created_at TO "createdAt";
    RAISE NOTICE '✅ tenants.created_at → "createdAt"';
  END IF;

  IF v_has_updated_at AND NOT v_has_updatedAt THEN
    ALTER TABLE public.tenants RENAME COLUMN updated_at TO "updatedAt";
    RAISE NOTICE '✅ tenants.updated_at → "updatedAt"';
  END IF;

  IF v_has_deleted_at AND NOT v_has_deletedAt THEN
    ALTER TABLE public.tenants RENAME COLUMN deleted_at TO "deletedAt";
    RAISE NOTICE '✅ tenants.deleted_at → "deletedAt"';
  END IF;

  -- Verifica se ainda há coluna last_login_at em users (pode existir em alguns schemas)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'last_login_at' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN last_login_at TO "lastLoginAt";
    RAISE NOTICE '✅ users.last_login_at → "lastLoginAt"';
  END IF;

  -- Verifica se há coluna two_factor_enabled
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'two_factor_enabled' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN two_factor_enabled TO "twoFactorEnabled";
    RAISE NOTICE '✅ users.two_factor_enabled → "twoFactorEnabled"';
  END IF;

  -- Verifica se há coluna refresh_token
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'refresh_token' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN refresh_token TO "refreshToken";
    RAISE NOTICE '✅ users.refresh_token → "refreshToken"';
  END IF;

  -- Verifica se há coluna refresh_token_expires_at
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'refresh_token_expires_at' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN refresh_token_expires_at TO "refreshTokenExpiresAt";
    RAISE NOTICE '✅ users.refresh_token_expires_at → "refreshTokenExpiresAt"';
  END IF;

  -- Verifica se há coluna avatar_url
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'avatar_url' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN avatar_url TO "avatarUrl";
    RAISE NOTICE '✅ users.avatar_url → "avatarUrl"';
  END IF;

END $$;

-- =====================================================
-- PASSO 3: RECREAR TRIGGER DE AUTO-CRIAÇÃO DE PERFIL
-- =====================================================

-- Dropar trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
DROP FUNCTION IF EXISTS public.auto_create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_profile() CASCADE;

-- Criar nova função com nomenclatura camelCase
CREATE OR REPLACE FUNCTION public.auto_create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id TEXT;
  v_user_name TEXT;
  v_user_role TEXT := 'ADMIN';
  v_permissions TEXT[];
  v_slug TEXT;
  v_company_name TEXT;
  v_is_first_user BOOLEAN;
BEGIN
  -- Obtém nome do metadata ou usa parte do email
  v_user_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'name', ''),
    split_part(NEW.email, '@', 1)
  );

  -- Obtém nome da empresa do metadata
  v_company_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'company_name', ''),
    split_part(NEW.email, '@', 1) || '-empresa'
  );

  -- Gera slug
  v_slug := LOWER(REGEXP_REPLACE(v_company_name, '[^a-z0-9]+', '-', 'g'));
  v_slug := REGEXP_REPLACE(v_slug, '(^-|-$)', '', 'g');

  -- Busca tenant existente (primeiro ativo)
  SELECT id INTO v_tenant_id
  FROM public.tenants
  WHERE "deletedAt" IS NULL
  ORDER BY "createdAt" ASC
  LIMIT 1;

  -- Se não existe tenant, cria um novo
  IF v_tenant_id IS NULL THEN
    INSERT INTO public.tenants (
      id, name, slug, plan, status,
      "maxUsers", "maxStorage",
      "trialEndsAt", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid()::text,
      v_company_name,
      v_slug,
      'PROFESSIONAL',
      'TRIAL',
      10,
      5368709120,
      NOW() + INTERVAL '90 days',
      NOW(),
      NOW()
    ) RETURNING id INTO v_tenant_id;
  END IF;

  -- Verifica se é o primeiro usuário (recebe OWNER)
  SELECT COUNT(*) = 0 INTO v_is_first_user
  FROM public.users
  WHERE "tenantId" = v_tenant_id;

  IF v_is_first_user THEN
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

  -- Cria perfil do usuário (com ON CONFLICT para evitar duplicação)
  INSERT INTO public.users (
    id,
    "tenantId",
    email,
    name,
    role,
    permissions,
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

  RAISE NOTICE '✅ Perfil criado para usuário: % (role: %)', NEW.email, v_user_role;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_user_profile();

-- =====================================================
-- PASSO 4: CRIAR PERFIS PARA USUÁRIOS EXISTENTES SEM PERFIL
-- =====================================================

DO $$
DECLARE
  v_tenant_id TEXT;
  v_user RECORD;
  v_user_name TEXT;
  v_user_role TEXT := 'ADMIN';
  v_permissions TEXT[];
  v_is_first_user BOOLEAN;
  v_count INTEGER := 0;
BEGIN
  -- Busca primeiro tenant ativo
  SELECT id INTO v_tenant_id
  FROM public.tenants
  WHERE "deletedAt" IS NULL
  ORDER BY "createdAt" ASC
  LIMIT 1;

  -- Se não existe tenant, cria um
  IF v_tenant_id IS NULL THEN
    INSERT INTO public.tenants (
      id, name, slug, plan, status,
      "maxUsers", "maxStorage",
      "trialEndsAt", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid()::text,
      'PrintAI Demo',
      'printai-demo',
      'PROFESSIONAL',
      'TRIAL',
      10,
      5368709120,
      NOW() + INTERVAL '90 days',
      NOW(),
      NOW()
    ) RETURNING id INTO v_tenant_id;
  END IF;

  -- Itera sobre usuários do auth.users sem perfil
  FOR v_user IN
    SELECT au.id, au.email, au.raw_user_meta_data, au.email_confirmed_at, au.created_at
    FROM auth.users au
    LEFT JOIN public.users u ON au.id::text = u.id
    WHERE u.id IS NULL
  LOOP
    -- Define nome
    v_user_name := COALESCE(
      NULLIF(v_user.raw_user_meta_data->>'name', ''),
      split_part(v_user.email, '@', 1)
    );

    -- Verifica se é primeiro usuário
    SELECT COUNT(*) = 0 INTO v_is_first_user
    FROM public.users
    WHERE "tenantId" = v_tenant_id;

    IF v_is_first_user THEN
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

    -- Cria perfil
    BEGIN
      INSERT INTO public.users (
        id, "tenantId", email, name, role, permissions,
        "emailVerifiedAt", "createdAt", "updatedAt"
      ) VALUES (
        v_user.id::text,
        v_tenant_id::text,
        v_user.email,
        v_user_name,
        v_user_role::"UserRole",
        v_permissions,
        COALESCE(v_user.email_confirmed_at, NOW()),
        COALESCE(v_user.created_at, NOW()),
        NOW()
      );
      v_count := v_count + 1;
      RAISE NOTICE '✅ Perfil criado para usuário existente: % (role: %)', v_user.email, v_user_role;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '⚠️ Falha ao criar perfil para %: %', v_user.email, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE '✅ Total de perfis criados para usuários existentes: %', v_count;
END $$;

-- =====================================================
-- PASSO 5: RECREAR ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Dropar policies antigas
DROP POLICY IF EXISTS "users_tenant_isolation" ON public.users;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_api_policy" ON public.users;
DROP POLICY IF EXISTS "users_select_own_profile" ON public.users;
DROP POLICY IF EXISTS "tenants_user_access" ON public.tenants;
DROP POLICY IF EXISTS "tenants_can_view_own_tenant" ON public.tenants;
DROP POLICY IF EXISTS "tenants_api_policy" ON public.tenants;
DROP POLICY IF EXISTS "tenants_select_user_tenant" ON public.tenants;

-- Policy para users: usuário pode ver seu próprio perfil E todos os users do seu tenant
CREATE POLICY "users_select_policy" ON public.users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()::text
    OR
    "tenantId" IN (
      SELECT "tenantId" FROM public.users WHERE id = auth.uid()::text
    )
  );

-- Policy para users: insert apenas via trigger (não permitir insert direto por API)
CREATE POLICY "users_insert_policy" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (FALSE); -- Bloqueia insert direto, apenas trigger pode criar

-- Policy para users: update apenas próprio perfil
CREATE POLICY "users_update_policy" ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

-- Policy para users: delete bloqueado (soft-delete via aplicação)
CREATE POLICY "users_delete_policy" ON public.users
  FOR DELETE
  TO authenticated
  USING (FALSE);

-- Policy para tenants: usuário pode ver seu tenant
CREATE POLICY "tenants_select_policy" ON public.tenants
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT "tenantId" FROM public.users WHERE id = auth.uid()::text
    )
  );

-- Policy para tenants: bloquear insert/update/delete via API
CREATE POLICY "tenants_insert_policy" ON public.tenants
  FOR INSERT
  TO authenticated
  WITH CHECK (FALSE);

CREATE POLICY "tenants_update_policy" ON public.tenants
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT "tenantId" FROM public.users WHERE id = auth.uid()::text
    )
  );

CREATE POLICY "tenants_delete_policy" ON public.tenants
  FOR DELETE
  TO authenticated
  USING (FALSE);

-- =====================================================
-- PASSO 6: GARANTIR QUE ÍNDICES EXISTEM
-- =====================================================

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_users_tenantId ON public.users("tenantId");
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenantId_role ON public.users("tenantId", role);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);

-- Garantir constraint unique para tenantId + email
-- NOTA: Se índice/constraint já existe, removemos e recriamos para garantir consistência
DO $$
DECLARE
  v_has_constraint BOOLEAN;
  v_has_index BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_tenantId_email_key'
  ) INTO v_has_constraint;

  SELECT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'users_tenantId_email_key'
  ) INTO v_has_index;

  -- Se já existe, não faz nada
  IF v_has_constraint OR v_has_index THEN
    RAISE NOTICE 'ℹ️ Constraint/index users_tenantId_email_key já existe, OK!';
  ELSE
    -- Não existe, cria a constraint
    ALTER TABLE public.users
    ADD CONSTRAINT "users_tenantId_email_key" UNIQUE ("tenantId", email);
    RAISE NOTICE '✅ Constraint unique criada: users_tenantId_email_key';
  END IF;
END $$;

-- =====================================================
-- PASSO 7: VALIDAR MIGRAÇÃO
-- =====================================================

DO $$
DECLARE
  v_users_count INTEGER;
  v_tenants_count INTEGER;
  v_users_without_tenant INTEGER;
  v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Conta usuários
  SELECT COUNT(*) INTO v_users_count FROM public.users;
  SELECT COUNT(*) INTO v_tenants_count FROM public.tenants;

  -- Verifica usuários sem tenant
  SELECT COUNT(*) INTO v_users_without_tenant
  FROM public.users
  WHERE "tenantId" IS NULL OR "tenantId" = '';

  IF v_users_without_tenant > 0 THEN
    v_errors := array_append(v_errors, 
      format('⚠️ %s usuário(s) sem tenant associado!', v_users_without_tenant)
    );
  END IF;

  -- Verifica usuários do auth sem perfil
  IF EXISTS (
    SELECT 1 FROM auth.users au
    LEFT JOIN public.users u ON au.id::text = u.id
    WHERE u.id IS NULL
  ) THEN
    v_errors := array_append(v_errors, 
      '⚠️ Ainda existem usuários do auth.users sem perfil no public.users!'
    );
  END IF;

  -- Log de validação
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 RESUMO DA MIGRAÇÃO:';
  RAISE NOTICE '   Usuários na tabela public.users: %', v_users_count;
  RAISE NOTICE '   Tenants na tabela public.tenants: %', v_tenants_count;
  RAISE NOTICE '   Usuários sem tenant: %', v_users_without_tenant;
  RAISE NOTICE '========================================';

  IF array_length(v_errors, 1) > 0 THEN
    FOREACH v_errors[1] IN ARRAY v_errors
    LOOP
      RAISE WARNING '%', v_errors[1];
    END LOOP;
  ELSE
    RAISE NOTICE '✅ Migração concluída com sucesso!';
  END IF;
END $$;

COMMIT;

-- =====================================================
-- INSTRUÇÕES PÓS-EXECUÇÃO:
-- =====================================================
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Verifique os logs de saída (NOTICE/WARNING)
-- 3. Execute a query abaixo para validar o schema:
--
--    SELECT column_name, data_type, is_nullable
--    FROM information_schema.columns
--    WHERE table_name = 'users' AND table_schema = 'public'
--    ORDER BY ordinal_position;
--
-- 4. Valide que as colunas estão em camelCase:
--    - "tenantId" (TEXT)
--    - "emailVerifiedAt" (TIMESTAMP)
--    - "createdAt" (TIMESTAMP)
--    - "updatedAt" (TIMESTAMP)
--    - "deletedAt" (TIMESTAMP)
--    - etc.
--
-- 5. Após executar, reinicie o servidor Next.js:
--    npm run dev
-- =====================================================
