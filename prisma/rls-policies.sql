-- Configuração global de Row-Level Security (RLS) para proteger os dados SaaS
-- Bloqueia por padrão o acesso não autorizado à API de dados (Data API) do Supabase.

-- Ativar RLS em cada tabela gerada pelo Prisma
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory_movements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "suppliers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "supplier_products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quotes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quote_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_item_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "receivables" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payables" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cash_flows" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "system_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "number_sequences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "data_subject_requests" ENABLE ROW LEVEL SECURITY;

-- Política de segurança que força queries via Supabase Client (authenticated role)
-- a não retornarem dados, forçando com que todo I/O seja executado através 
-- do backend com Prisma (que contorna o RLS via pgSuperUser role) e validado em nível lógico.
-- Isso consolida segurança máxima, fechando o acesso da "Data API" para o Client-side publico
CREATE POLICY "Block all public Anon operations" ON "tenants" FOR ALL USING (false);
CREATE POLICY "Block all public Anon operations" ON "customers" FOR ALL USING (false);
CREATE POLICY "Block all public Anon operations" ON "orders" FOR ALL USING (false);
