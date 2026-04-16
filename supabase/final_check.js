const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const admin_email = 'admin@printai.com';
    
    const authRes = await client.query('SELECT id, email FROM auth.users WHERE email = $1', [admin_email]);
    const publicRes = await client.query('SELECT id, email FROM public.users WHERE email = $1', [admin_email]);

    console.log('--- AUTH USERS ---');
    console.log(JSON.stringify(authRes.rows, null, 2));
    
    console.log('--- PUBLIC USERS ---');
    console.log(JSON.stringify(publicRes.rows, null, 2));

    if (authRes.rows.length > 0 && publicRes.rows.length > 0) {
      const match = authRes.rows[0].id === publicRes.rows[0].id;
      console.log(`MATCH: ${match}`);
    } else {
      console.log('One or both users missing.');
    }

  } catch (err) {
    console.error(err.message);
  } finally {
    await client.end();
  }
}

run();
