import { AsyncLocalStorage } from 'async_hooks'

export interface TenantContext {
  tenantId: string
  userId: string
  userEmail?: string
  role?: string
}

const tenantStorage = new AsyncLocalStorage<TenantContext>()

/**
 * Define o contexto do tenant para a execução atual
 */
export function runWithTenant<T>(context: TenantContext, fn: () => Promise<T>): Promise<T> {
  return tenantStorage.run(context, fn)
}

/**
 * Tenta obter o contexto do tenant atual.
 * Retorna undefined se não houver contexto definido.
 */
export function getTenantContext(): TenantContext | undefined {
  return tenantStorage.getStore()
}

/**
 * Obtém o tenantId do contexto atual.
 * Lança erro se não houver contexto (proteção de segurança).
 */
export function requireTenantId(): string {
  const context = getTenantContext()
  if (!context) {
    throw new Error('[TenantContext] Tentativa de acesso ao banco fora do escopo de tenant.')
  }
  return context.tenantId
}
