const { Client } = require('pg');

async function listAllPolicies() {
  const connectionString = "postgresql://postgres:Canguru%409909@db.wlxuevhxnxyvvjtocnrc.supabase.co:5432/postgres";
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('--- POLICIES LIST ---');
    const res = await client.query(`
      SELECT tablename, policyname 
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'tenants')
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error listing policies:', err.message);
  } finally {
    await client.end();
  }
}

listAllPolicies();
