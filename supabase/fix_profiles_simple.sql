-- =====================================================
-- PrintAI ERP - SCRIPT DE CORREÇÃO DE PERFIS (SIMPLIFICADO)
-- =====================================================
-- Este script resolve o problema de perfis faltantes:
-- 1. Cria trigger automático para novos registros no auth.users
-- 2. Cria perfis para usuários existentes sem perfil
-- =====================================================

BEGIN;

-- 1. CRIAR FUNÇÃO DE AUTO-REGISTRO DE PERFIL
-- =====================================================

CREATE OR REPLACE FUNCTION public.auto_create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
  v_user_name TEXT;
  v_slug TEXT;
  v_company_name TEXT;
BEGIN
  -- Obtém nome do metadata ou usa parte do email
  v_user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Obtém nome da empresa do metadata
  v_company_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'company_name', ''),
    split_part(NEW.email, '@', 1) || ' Empresa'
  );

  -- Gera slug da empresa
  v_slug := LOWER(REGEXP_REPLACE(v_company_name, '[^a-zA-Z0-9]', '-', 'g'));

  -- Obtém tenant existente ou cria novo
  SELECT id INTO v_tenant_id
  FROM tenants
  WHERE deleted_at IS NULL
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    INSERT INTO tenants (
      id, name, slug, plan, status,
      max_users, max_storage,
      trial_ends_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
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

  -- Cria perfil do usuário
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
    CASE
      WHEN (SELECT COUNT(*) FROM public.users) = 0 THEN 'OWNER'
      ELSE 'ADMIN'
    END,
    ARRAY['*'],
    COALESCE(NEW.email_confirmed_at, NOW()),
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CRIAR TRIGGER
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_user_profile();

-- 3. CRIAR PERFIS PARA USUÁRIOS EXISTENTES
-- =====================================================

DO $$
DECLARE
  v_tenant_id UUID;
  v_user RECORD;
  v_company_name TEXT;
  v_slug TEXT;
BEGIN
  -- Obtém primeiro tenant
  SELECT id INTO v_tenant_id
  FROM tenants
  WHERE deleted_at IS NULL
  ORDER BY created_at ASC
  LIMIT 1;

  -- Se não existe tenant, cria um
  IF v_tenant_id IS NULL THEN
    INSERT INTO tenants (
      id, name, slug, plan, status,
      max_users, max_storage,
      trial_ends_at, created_at, updated_at
    ) VALUES (
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
    ) RETURNING id INTO v_tenant_id;
  END IF;

  -- Cria perfis para usuários sem perfil
  FOR v_user IN
    SELECT 
      au.id, 
      au.email, 
      au.raw_user_meta_data, 
      au.email_confirmed_at, 
      au.created_at
    FROM auth.users au
    LEFT JOIN public.users u ON au.id = u.id
    WHERE u.id IS NULL
  LOOP
    -- Extrai nome da empresa
    v_company_name := COALESCE(
      NULLIF(v_user.raw_user_meta_data->>'company_name', ''),
      split_part(v_user.email, '@', 1) || ' Empresa'
    );
    v_slug := LOWER(REGEXP_REPLACE(v_company_name, '[^a-zA-Z0-9]', '-', 'g'));

    INSERT INTO public.users (
      id, tenant_id, email, name, role, permissions,
      email_verified_at, created_at, updated_at
    ) VALUES (
      v_user.id,
      v_tenant_id,
      v_user.email,
      COALESCE(v_user.raw_user_meta_data->>'name', split_part(v_user.email, '@', 1)),
      CASE
        WHEN (SELECT COUNT(*) FROM public.users) = 0 THEN 'OWNER'
        ELSE 'ADMIN'
      END,
      ARRAY['*'],
      COALESCE(v_user.email_confirmed_at, NOW()),
      v_user.created_at,
      NOW()
    );
  END LOOP;
END $$;

-- 4. HABILITAR RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS em tenants e users
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy para users: usuário pode ver todos os users do seu tenant
DROP POLICY IF EXISTS "users_tenant_isolation" ON public.users;
CREATE POLICY "users_tenant_isolation" ON public.users
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
    OR
    id = auth.uid()
  );

-- Policy para tenants: usuário pode ver seu tenant
DROP POLICY IF EXISTS "tenants_user_access" ON public.tenants;
CREATE POLICY "tenants_user_access" ON public.tenants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.tenant_id = tenants.id
      AND u.id = auth.uid()
    )
  );

COMMIT;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- Ele irá:
-- 1. Criar trigger que automaticamente cria perfis para novos usuários
-- 2. Criar perfis para usuários existentes que não têm
-- 3. Configurar Row Level Security básico
-- =====================================================
