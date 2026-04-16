import { Client } from 'pg';
import fs from 'fs';
import * as dotenv from 'dotenv';
import path from 'path';

// Carrega variáveis do .env
dotenv.config();

/**
 * Script para aplicar a correção cirúrgica de RLS
 * Resolve o erro de recursão infinita (42P17)
 */
async function applyFix() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ Erro: DATABASE_URL não encontrada no .env');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('⏳ Conectando ao banco de dados...');
    await client.connect();
    
    const sqlPath = path.join(process.cwd(), 'supabase', 'FIX_RLS_RECURSION_SURGICAL.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🚀 Aplicando script de correção de RLS...');
    await client.query(sql);
    
    console.log('✅ Correção aplicada com sucesso!');
  } catch (err: any) {
    console.error('❌ Erro ao aplicar correção:', err.message);
    if (err.detail) console.error('Detalhe:', err.detail);
  } finally {
    await client.end();
  }
}

applyFix();
