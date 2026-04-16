-- Criar função de sincronização de perfil
DROP FUNCTION IF EXISTS sync_user_profile() CASCADE;

CREATE FUNCTION sync_user_profile() 
RETURNS TRIGGER AS $$
BEGIN
  -- Verifica se perfil já existe
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id::text) THEN
    -- Cria perfil automaticamente
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
      (SELECT id FROM public.tenants WHERE deleted_at IS NULL ORDER BY created_at ASC LIMIT 1),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'role', 'ADMIN'),
      ARRAY['*'],
      COALESCE(NEW.email_confirmed_at, NOW()),
      NEW.created_at,
      NOW()
    );
    
    RAISE NOTICE '✅ Perfil criado para: %', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger no login
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS NULL AND NEW.last_sign_in_at IS NOT NULL)
  EXECUTE FUNCTION sync_user_profile();

-- Criar perfis para todos usuários sem perfil
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
  au.id::text,
  (SELECT id FROM public.tenants WHERE deleted_at IS NULL ORDER BY created_at ASC LIMIT 1),
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'role', 'ADMIN'),
  ARRAY['*'],
  COALESCE(au.email_confirmed_at, NOW()),
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.users u ON au.id::text = u.id
WHERE u.id IS NULL
  AND au.email_confirmed_at IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Verificar resultado
SELECT 
  au.email,
  CASE WHEN u.id IS NOT NULL THEN '✅ Tem perfil' ELSE '❌ Sem perfil' END as status,
  u.name,
  u.role
FROM auth.users au
LEFT JOIN public.users u ON au.id::text = u.id
WHERE au.email_confirmed_at IS NOT NULL
ORDER BY au.created_at DESC;
