-- PrintAI ERP - Criar perfis restantes para usuários do printflowstudio
-- Executar apenas se necessário

-- Criar perfis faltantes mapeando IDs corretos
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
)
SELECT 
  -- Gerar UUIDs consistentes baseados no email
  CASE email
    WHEN 'admin@printflowstudio.com.br' THEN 'c5d8f5a1-2b3c-4d5e-8f9a-1b2c3d4e5f6a'
    WHEN 'atendimento@printflowstudio.com.br' THEN 'd6e9f6b2-3c4d-5e6f-9a0b-2c3d4e5f6a7b'
    WHEN 'design@printflowstudio.com.br' THEN 'e7f0a7c3-4d5e-6f7a-0b1c-3d4e5f6a7b8c'
    WHEN 'producao@printflowstudio.com.br' THEN 'f8a1b8d4-5e6f-7a8b-1c2d-4e5f6a7b8c9d'
    WHEN 'financeiro@printflowstudio.com.br' THEN 'a9b2c9e5-6f7a-8b9c-2d3e-5f6a7b8c9d0e'
  END,
  '91857740-c521-4ad4-b4c7-8e76f25b9365', -- tenantId
  email,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  'ADMIN',
  ARRAY['*'],
  COALESCE(email_confirmed_at, NOW()),
  created_at,
  NOW()
FROM auth.users
WHERE email LIKE '%printflowstudio%'
  AND email_confirmed_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.email = auth.users.email
  )
ON CONFLICT ("tenantId", email) DO NOTHING;
