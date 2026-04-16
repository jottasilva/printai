-- ======================================================
-- 🏢 PROMPT PROFISSIONAL — BANCO COMPLETO (GRÁFICA SaaS)
-- SCRIPT IDEMPOTENTE E SEGURO (MANTÉM DADOS EXISTENTES)
-- ======================================================

BEGIN;

-- ==========================================
-- 1. FUNÇÕES AUXILIARES
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================
-- 2. TABELA: tenants (COMPANIES) - EXPANSÃO
-- ==========================================
-- Garantir que a tabela base existe (caso seja um projeto novo)
CREATE TABLE IF NOT EXISTS public.tenants (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Adição de colunas estruturais e comerciais
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS nome_fantasia TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS razao_social TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS site TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Endereço
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS cep TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS logradouro TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS numero TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS complemento TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS bairro TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS cidade TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS estado TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS pais TEXT DEFAULT 'Brasil';

-- Operacional
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS horario_funcionamento TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS dias_funcionamento TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS prazo_producao_padrao TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS aceita_urgente BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS tempo_urgente TEXT;

-- Comercial
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS formas_pagamento JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS aceita_pagamento_online BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS pedido_minimo_valor DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS taxa_urgencia DECIMAL(12,2) DEFAULT 0;

-- Frete
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS retirada_local BOOLEAN DEFAULT TRUE;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS entrega_propria BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS valor_frete_base DECIMAL(12,2) DEFAULT 0;

-- Campos Padrão
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Index
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_cnpj ON public.tenants(cnpj) WHERE cnpj IS NOT NULL;

-- ==========================================
-- 3. TABELA: users - EXPANSÃO
-- ==========================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cargo TEXT; -- owner, atendente, designer, producao, entregador
-- permissoes já existe como ARRAY ou JSON no schema anterior, garantimos como JSONB se necessário
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ==========================================
-- 4. TABELA: products
-- ==========================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "tenantId" TEXT NOT NULL REFERENCES public.tenants(id),
    nome TEXT NOT NULL,
    descricao TEXT,
    preco_base DECIMAL(12,2) DEFAULT 0,
    prazo_producao TEXT,
    categoria TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 5. TABELA: services
-- ==========================================
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "tenantId" TEXT NOT NULL REFERENCES public.tenants(id),
    nome TEXT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 6. TABELA: orders
-- ==========================================
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "tenantId" TEXT NOT NULL REFERENCES public.tenants(id),
    numero_pedido TEXT UNIQUE NOT NULL,
    cliente_nome TEXT,
    cliente_contato TEXT,
    produto_id TEXT REFERENCES public.products(id),
    quantidade INTEGER DEFAULT 1,
    status TEXT DEFAULT 'novo', -- novo, producao, pronto, entregue
    valor DECIMAL(12,2) DEFAULT 0,
    data_entrega TIMESTAMP,
    arte_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 7. TABELA: settings
-- ==========================================
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "tenantId" TEXT NOT NULL UNIQUE REFERENCES public.tenants(id),
    slug_empresa TEXT UNIQUE NOT NULL,
    cor_primaria TEXT DEFAULT '#3B82F6',
    cor_secundaria TEXT DEFAULT '#1E293B',
    tema TEXT DEFAULT 'light',
    mensagem_boas_vindas TEXT,
    whatsapp_padrao TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 8. TRIGGERS DE ATUALIZAÇÃO
-- ==========================================
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS tr_set_updated_at ON public.%I', t);
        EXECUTE format('CREATE TRIGGER tr_set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t);
    END LOOP;
END $$;

-- ==========================================
-- 9. PERMISSÕES (GRANTS)
-- ==========================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon, service_role;

-- ==========================================
-- 10. POLÍTICAS RLS (MULTI-TENANT)
-- ==========================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN VALUES ('products'), ('services'), ('orders'), ('settings')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I_tenant_isolation ON public.%I', tbl, tbl);
        EXECUTE format(
            'CREATE POLICY %I_tenant_isolation ON public.%I 
             FOR ALL 
             TO authenticated 
             USING ("tenantId"::text = (SELECT "tenantId"::text FROM public.users WHERE id::text = auth.uid()::text))',
            tbl, tbl
        );
    END LOOP;
END $$;

COMMIT;
