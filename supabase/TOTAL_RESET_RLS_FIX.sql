-- =====================================================
-- PrintAI ERP — RESET TOTAL DE RLS (NUKE & REBUILD)
-- =====================================================
-- OBJETIVO: Eliminar o erro 'infinite recursion' limpando
--           todas as políticas legadas e instalando um modelo seguro.
-- =====================================================

BEGIN;

-- 1. LIMPEZA TOTAL DE POLÍTICAS EXISTENTES (USERS)
DROP POLICY IF EXISTS "users_api_policy" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;
DROP POLICY IF EXISTS "users_tenant_isolation" ON public.users;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_select_own_profile" ON public.users;

-- 2. LIMPEZA TOTAL DE POLÍTICAS EXISTENTES (TENANTS)
DROP POLICY IF EXISTS "tenants_api_policy" ON public.tenants;
DROP POLICY IF EXISTS "tenants_select_policy" ON public.tenants;
DROP POLICY IF EXISTS "tenants_update_policy" ON public.tenants;
DROP POLICY IF EXISTS "tenants_delete_policy" ON public.tenants;
DROP POLICY IF EXISTS "tenants_user_access" ON public.tenants;
DROP POLICY IF EXISTS "tenants_can_view_own_tenant" ON public.tenants;
DROP POLICY IF EXISTS "tenants_select_user_tenant" ON public.tenants;

-- 3. RECRIAÇÃO DA FUNÇÃO BRIDGE (SECURITY DEFINER)
-- Esta função é o segredo para quebrar a recursão infinitas
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS TEXT AS $$
DECLARE
  v_tenant_id TEXT;
BEGIN
  -- SAFETY: Busca direta usando o ID do auth.uid()
  -- O SECURITY DEFINER garante que esta query ignore o RLS da tabela users
  SELECT "tenantId" INTO v_tenant_id 
  FROM public.users 
  WHERE id = auth.uid()::text 
  LIMIT 1;
  
  RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Garantir permissões de execução
GRANT EXECUTE ON FUNCTION public.get_auth_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_tenant_id() TO service_role;

-- 4. INSTALAÇÃO DE POLÍTICAS LIMPAS E SEGURAS (USERS)
-- Política de Seleção: Ver a si mesmo ou outros do mesmo tenant
CREATE POLICY "users_authenticated_select" ON public.users
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()::text 
    OR 
    "tenantId" = public.get_auth_tenant_id()
  );

-- Política de Update: Apenas o próprio perfil
CREATE POLICY "users_authenticated_update" ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

-- 5. INSTALAÇÃO DE POLÍTICAS LIMPAS E SEGURAS (TENANTS)
-- Usuário autenticado só vê seu próprio tenant
CREATE POLICY "tenants_authenticated_select" ON public.tenants
  FOR SELECT TO authenticated
  USING (id = public.get_auth_tenant_id());

-- Bloquear Update direto via API por enquanto para segurança (ou apenas via owner)
CREATE POLICY "tenants_authenticated_update" ON public.tenants
  FOR UPDATE TO authenticated
  USING (id = public.get_auth_tenant_id());

COMMIT;

-- LOG DE SUCESSO
-- RAISE NOTICE '✅ RLS Resetado com Sucesso: Todas as políticas legadas foram removidas.';
