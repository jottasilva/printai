DO 
DECLARE
    auth_id uuid;
    found_profile_id text;
    admin_email text := 'admin@printai.com';
BEGIN
    -- 1. Pega o ID correto no auth.users
    SELECT id INTO auth_id FROM auth.users WHERE email = admin_email;
    
    IF auth_id IS NULL THEN
        RAISE NOTICE 'Usuário % não encontrado no Auth do Supabase.', admin_email;
        RETURN;
    END IF;

    -- 2. Verifica se existe perfil e qual o ID dele
    SELECT id INTO found_profile_id FROM public.users WHERE email = admin_email;

    IF found_profile_id IS NULL THEN
        RAISE NOTICE 'Perfil não encontrado para %. Criando...', admin_email;
        -- Criar perfil se não existir (precisa de um tenantId válido)
        INSERT INTO public.users (id, "tenantId", email, role, name, "createdAt", "updatedAt")
        SELECT auth_id, id, admin_email, 'OWNER', 'Super Admin', now(), now()
        FROM public.tenants LIMIT 1;
    ELSIF found_profile_id <> auth_id::text THEN
        RAISE NOTICE 'Descompasso de IDs detectado. Atualizando perfil de % para match com Auth.', admin_email;
        UPDATE public.users SET id = auth_id::text WHERE email = admin_email;
    ELSE
        RAISE NOTICE 'Perfil e Auth já estão em sincronia para %.', admin_email;
    END IF;
END ;
