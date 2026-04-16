import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function auditDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('--- POLICIES ---');
    const policies = await client.query(`
      SELECT 
        tablename, 
        policyname, 
        cmd, 
        qual, 
        with_check 
      FROM pg_policies 
      WHERE schemaname = 'public'
    `);
    console.log(JSON.stringify(policies.rows, null, 2));

    console.log('\n--- FUNCTIONS ---');
    const functions = await client.query(`
      SELECT 
        proname as name, 
        pg_get_functiondef(oid) as definition
      FROM pg_proc 
      WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND proname IN ('get_auth_tenant_id', 'get_tenant_id', 'auto_create_user_profile')
    `);
    console.log(JSON.stringify(functions.rows, null, 2));

    console.log('\n--- RLS STATUS ---');
    const status = await client.query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('users', 'tenants')
    `);
    console.log(JSON.stringify(status.rows, null, 2));

  } catch (err: any) {
    console.error('Audit Error:', err.message);
  } finally {
    await client.end();
  }
}

auditDatabase();
