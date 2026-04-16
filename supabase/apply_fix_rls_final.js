const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

/**
 * Script em JS puro para aplicar a correção de RLS
 * Evita problemas de compilação TS e top-level await
 */
async function applyFix() {
  const connectionString = "postgresql://postgres:Canguru%409909@db.wlxuevhxnxyvvjtocnrc.supabase.co:5432/postgres";
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('⏳ Conectando ao banco de dados Supabase...');
    await client.connect();
    
    const sql = `
-- =====================================================
-- PrintAI ERP — CORREÇÃO CIRÚRGICA DE RECURSÃO RLS
-- =====================================================
BEGIN;

-- 1. Criar função auxiliar que ignora o RLS para obter o tenantId
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS TEXT AS $$
DECLARE
  v_tenant_id TEXT;
BEGIN
  -- SAFETY: Busca o tenantId do usuário atual sem disparar RLS (bypass via SECURITY DEFINER)
  SELECT "tenantId" INTO v_tenant_id 
  FROM public.users 
  WHERE id = auth.uid()::text 
  LIMIT 1;
  
  RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Garantir permissões
GRANT EXECUTE ON FUNCTION public.get_auth_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_tenant_id() TO service_role;

-- 3. Atualizar Política de Seleção de Usuários para quebrar a recursão
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
CREATE POLICY "users_select_policy" ON public.users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()::text -- Ver o próprio perfil
    OR
    "tenantId" = public.get_auth_tenant_id() -- Ver outros do mesmo tenant (NÃO RECURSIVO)
  );

-- 4. Atualizar Política de Seleção de Tenants
DROP POLICY IF EXISTS "tenants_select_policy" ON public.tenants;
CREATE POLICY "tenants_select_policy" ON public.tenants
  FOR SELECT
  TO authenticated
  USING (
    id = public.get_auth_tenant_id()
  );

-- 5. Atualizar Política de Update de Tenants
DROP POLICY IF EXISTS "tenants_update_policy" ON public.tenants;
CREATE POLICY "tenants_update_policy" ON public.tenants
  FOR UPDATE
  TO authenticated
  USING (
    id = public.get_auth_tenant_id()
  );

COMMIT;
    `;
    
    console.log('🚀 Executando SQL para resolver loop infinito de RLS...');
    await client.query(sql);
    
    console.log('✅ Correção RLS aplicada com sucesso!');
  } catch (err) {
    console.error('❌ Erro crítico ao aplicar correção:', err.message);
  } finally {
    await client.end();
  }
}

applyFix();
