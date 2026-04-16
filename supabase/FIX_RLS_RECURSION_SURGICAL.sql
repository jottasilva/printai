-- =====================================================
-- PrintAI ERP — CORREÇÃO CIRÚRGICA DE RECURSÃO RLS
-- =====================================================
-- PROBLEMA: Política de 'users_select_policy' causava loop infinito
--           ao consultar public.users recursivamente.
-- SOLUÇÃO: Usar SECURITY DEFINER para quebrar a recursão.
-- =====================================================

BEGIN;

-- 1. Criar função auxiliar que ignora o RLS para obter o tenantId
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS TEXT AS $$
DECLARE
  v_tenant_id TEXT;
BEGIN
  -- SAFETY: Busca o tenantId do usuário atual sem disparar RLS
  SELECT "tenantId" INTO v_tenant_id 
  FROM public.users 
  WHERE id = auth.uid()::text 
  LIMIT 1;
  
  RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Garantir que a função pode ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION public.get_auth_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_tenant_id() TO service_role;

-- 3. Atualizar Políticas da Tabela 'users'
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
CREATE POLICY "users_select_policy" ON public.users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()::text -- Ver o próprio perfil
    OR
    "tenantId" = public.get_auth_tenant_id() -- Ver outros do mesmo tenant (SEM RECURSÃO)
  );

-- 4. Atualizar Políticas da Tabela 'tenants' para maior consistência
DROP POLICY IF EXISTS "tenants_select_policy" ON public.tenants;
CREATE POLICY "tenants_select_policy" ON public.tenants
  FOR SELECT
  TO authenticated
  USING (
    id = public.get_auth_tenant_id()
  );

-- 5. Atualizar Políticas de Update (Opcional, mas recomendado usar a função)
DROP POLICY IF EXISTS "tenants_update_policy" ON public.tenants;
CREATE POLICY "tenants_update_policy" ON public.tenants
  FOR UPDATE
  TO authenticated
  USING (
    id = public.get_auth_tenant_id()
  );

COMMIT;

RAISE NOTICE '✅ Correção de recursão RLS aplicada com sucesso!';
