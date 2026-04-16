const { Client } = require('pg');

async function checkUser() {
  const connectionString = "postgresql://postgres:Canguru%409909@db.wlxuevhxnxyvvjtocnrc.supabase.co:5432/postgres";
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('--- USER AUDIT ---');
    const res = await client.query(`
      SELECT id, email, "tenantId", role, name
      FROM public.users
      ORDER BY email ASC
    `);
    console.log('Users in DB:');
    console.table(res.rows);

    console.log('\n--- TENANTS AUDIT ---');
    const tenants = await client.query('SELECT id, name, slug FROM public.tenants');
    console.log('Tenants in DB:');
    console.table(tenants.rows);

  } catch (err) {
    console.error('Audit Error:', err.message);
  } finally {
    await client.end();
  }
}

checkUser();
