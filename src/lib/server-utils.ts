import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { runWithTenant, TenantContext } from './tenant-context'

/**
 * Wrapper para Server Actions que injeta automaticamente o contexto do tenant.
 * Isso permite que o Prisma use a extensão de auto-tenancy.
 */
export function withTenant<T, Args extends any[]>(
  action: (...args: Args) => Promise<T>
) {
  return async (...args: Args): Promise<T> => {
    const { tenantId, userId, userEmail, userRole } = await getTenantId();
    
    return runWithTenant(
      { tenantId, userId, userEmail, role: userRole },
      () => action(...args)
    );
  };
}

/**
 * Obtem o ID do tenant do usuário autenticado
 * Lanca erro se não houver usuário ou perfil
 */
export async function getTenantId(): Promise<{ tenantId: string; userId: string; userEmail: string; userRole: string }> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized: User not authenticated')
  }

  // Busca o perfil pelo ID (PK vinculada ao Auth do Supabase)
  let profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, tenantId: true, role: true, email: true }
  })

  // Fallback por Email (caso haja descompasso de IDs em migrações manuais)
  if (!profile && user.email) {
    profile = await prisma.user.findFirst({
      where: { email: user.email },
      select: { id: true, tenantId: true, role: true, email: true }
    })
  }

  if (!profile) {
    console.error(`[Auth Error] Perfil não encontrado para ${user.email} (${user.id})`)
    throw new Error('Profile not found')
  }

  return {
    tenantId: profile.tenantId || '',
    userId: profile.id, // Usamos o ID do perfil encontrado
    userEmail: profile.email || user.email || '',
    userRole: profile.role,
  };
}

/**
 * Verifica se o usuário tem permissão para uma ação específica
 */
export async function checkPermission(role: string, requiredPermission?: string): Promise<boolean> {
  // Admin e Owner têm todas as permissões
  if (role === 'ADMIN' || role === 'OWNER') return true

  // Se não há permissão específica requerida, permite
  if (!requiredPermission) return true

  // Verificação futura de permissões granulares
  return false
}

/**
 * Wrapper seguro para Server Actions
 * Captura erros e retorna formato padronizado
 */
export async function safeAction<T>(action: () => Promise<T>): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await action()
    return { success: true, data }
  } catch (error: any) {
    console.error('[ServerAction Error]', error.message || error)
    return {
      success: false,
      error: error.message || 'Internal server error'
    }
  }
}
