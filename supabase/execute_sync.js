const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const sql = `
      DO $$
      DECLARE
          auth_id uuid;
          found_profile_id text;
          admin_email text := 'admin@printai.com';
      BEGIN
          -- 1. Pega o ID correto no auth.users
          SELECT id INTO auth_id FROM auth.users WHERE email = admin_email;
          
          IF auth_id IS NULL THEN
              RAISE NOTICE 'Admin user not found in auth.users';
              RETURN;
          END IF;

          -- 2. Verifica public.users
          SELECT id INTO found_profile_id FROM public.users WHERE email = admin_email;

          IF found_profile_id IS NULL THEN
              RAISE NOTICE 'Profile missing for %. Creating...', admin_email;
              INSERT INTO public.users (id, "tenantId", email, role, name, "createdAt", "updatedAt")
              SELECT auth_id::text, id, admin_email, 'OWNER', 'Super Admin', now(), now()
              FROM public.tenants LIMIT 1;
          ELSIF found_profile_id <> auth_id::text THEN
              RAISE NOTICE 'IDs mismatch for %. Auth: %, Profile: %. Updating...', admin_email, auth_id, found_profile_id;
              UPDATE public.users SET id = auth_id::text WHERE email = admin_email;
          ELSE
              RAISE NOTICE 'IDs are ALREADY synced for %.', admin_email;
          END IF;
      END $$;
    `;

    const res = await client.query(sql);
    console.log('Sync completed successfully.');
  } catch (err) {
    console.error('Error during sync:', err.message);
  } finally {
    await client.end();
  }
}

run();
