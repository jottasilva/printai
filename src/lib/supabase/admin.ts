import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase com service_role para operações administrativas.
 * 
 * ATENÇÃO: Este client tem acesso TOTAL ao banco, ignorando RLS.
 * Usar APENAS em Server Actions/API Routes, NUNCA no client-side.
 */

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      '[Supabase Admin] Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas.'
    )
  }

  return createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
