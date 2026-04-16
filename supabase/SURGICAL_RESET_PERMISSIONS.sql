-- ==========================================
-- SURGICAL RESET FOR SUPABASE ACCESS
-- ==========================================

BEGIN;

-- 1. LIMPAR POLÍTICAS EXISTENTES (PARA EVITAR CONFLITOS)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('users', 'tenants')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
        RAISE NOTICE '🗑️ Política removida: % na tabela %', pol.policyname, pol.tablename;
    END LOOP;
END $$;

-- 2. GARANTIR PERMISSÕES DO SCHEMA PARA OS ROLES DO SUPABASE
-- O Supabase (PostgREST) usa os roles 'authenticated' e 'anon'
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated, anon;

-- 3. HABILITAR RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS SIMPLIFICADAS (TRATANDO ID COMO TEXT)

-- POLÍTICA PARA USERS: Ver o próprio perfil ou perfis do mesmo tenant
CREATE POLICY "users_api_policy" ON public.users
FOR ALL
TO authenticated
USING (
    id::text = auth.uid()::text 
    OR 
    "tenantId"::text IN (
        SELECT "tenantId"::text FROM public.users WHERE id::text = auth.uid()::text
    )
);

-- POLÍTICA PARA TENANTS: Ver apenas o tenant ao qual pertence
CREATE POLICY "tenants_api_policy" ON public.tenants
FOR SELECT
TO authenticated
USING (
    id::text IN (
        SELECT "tenantId"::text FROM public.users WHERE id::text = auth.uid()::text
    )
);

-- 5. SINCRONIZAÇÃO FORÇADA PARA O USUÁRIO ADMINISTRADOR
DO $$
DECLARE
    v_tenant_id TEXT;
    v_admin_auth_id TEXT;
BEGIN
    -- Busca ID do Auth para o admin
    SELECT id::text INTO v_admin_auth_id FROM auth.users WHERE email = 'admin@printai.com';
    
    IF v_admin_auth_id IS NOT NULL THEN
        -- Busca ou cria um tenant padrão
        SELECT id::text INTO v_tenant_id FROM tenants LIMIT 1;
        
        IF v_tenant_id IS NULL THEN
            INSERT INTO tenants (id, name, slug, plan, status, "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, 'PrintFlow Studio', 'printflow', 'PROFESSIONAL', 'ACTIVE', NOW(), NOW())
            RETURNING id INTO v_tenant_id;
        END IF;

        -- Upsert no perfil do admin
        INSERT INTO public.users (
            id, "tenantId", email, name, role, permissions, "emailVerifiedAt", "createdAt", "updatedAt"
        ) VALUES (
            v_admin_auth_id,
            v_tenant_id,
            'admin@printai.com',
            'Administrador',
            'OWNER'::"UserRole",
            ARRAY['*'],
            NOW(),
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            "tenantId" = EXCLUDED."tenantId",
            role = 'OWNER'::"UserRole",
            permissions = ARRAY['*'];
            
        RAISE NOTICE '✅ Perfil de admin sincronizado com ID: %', v_admin_auth_id;
    ELSE
        RAISE NOTICE '⚠️ Usuário admin@printai.com não encontrado no Auth.';
    END IF;
END $$;

COMMIT;

-- DEBUG FINAL
SELECT au.email, u.id as profile_id, u."tenantId", u.role 
FROM auth.users au 
LEFT JOIN public.users u ON au.id::text = u.id::text;
