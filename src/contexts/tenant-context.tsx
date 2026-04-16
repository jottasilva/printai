'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { useAuth } from './auth-context'
import { createClient } from '@/lib/supabase/client'

type Tenant = {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  cnpj?: string
  telefone?: string
  cep?: string
  logradouro?: string
  numero?: string
  bairro?: string
  cidade?: string
  estado?: string
  prazo_producao_padrao?: string
  formas_pagamento?: string[]
  createdAt?: string
  updatedAt?: string
}

type UserProfile = {
  id: string
  role: string
  name: string
  email?: string
  tenantId?: string
  avatar_url?: string
  permissions?: string[]
}

type TenantContextType = {
  tenant: Tenant | null
  profile: UserProfile | null
  loading: boolean
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  profile: null,
  loading: true
})

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const { user: authUser, loading: authLoading } = useAuth()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const fetchTenantData = async () => {
      // Se não há usuário autenticado, limpa estado
      if (!authUser) {
        setTenant(null)
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        // 1. Buscar Perfil (User) - tenta por ID primeiro
        // NOTA: As colunas no banco devem estar em camelCase (padrão Prisma)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, "tenantId", email, name, role, permissions, "avatarUrl", "createdAt", "updatedAt"')
          .eq('id', authUser.id)
          .maybeSingle()

        if (userError) {
          console.error('[TenantProvider] ❌ Erro ao buscar perfil por ID:', {
            message: userError.message,
            code: userError.code,
            details: userError.details,
            hint: userError.hint
          })

          // Se é erro de coluna não encontrada, indica problema de schema
          if (userError.code === '42703' || userError.message?.includes('does not exist')) {
            console.error(
              '[TenantProvider] 🚨 ERRO DE SCHEMA: Colunas não encontradas! ' +
              'Execute o script: supabase/FIX_SCHEMA_FINAL.sql'
            )
          }
        }

        if (!userData) {
          console.warn('[TenantProvider] Perfil não encontrado por ID, tentando por email...')

          // Fallback: tenta buscar por email
          const { data: userDataByEmail, error: emailError } = await supabase
            .from('users')
            .select('id, "tenantId", email, name, role, permissions, "avatarUrl", "createdAt", "updatedAt"')
            .eq('email', authUser.email)
            .maybeSingle()

          if (emailError) {
            console.error('[TenantProvider] ❌ Erro ao buscar perfil por email:', emailError.message)
          }

          if (!userDataByEmail) {
            // Perfil definitivamente não existe
            console.error('[TenantProvider] ⚠️ Perfil não existe no banco. Usuário deve executar script SQL.')
            // NÃO redireciona - apenas mantém profile como null
            // O app vai lidar com isso mostrando página de configuração
            setProfile(null)
            setTenant(null)
            setLoading(false)
            return
          }

          // Perfil encontrado por email
          console.log('[TenantProvider] ✅ Perfil encontrado por email:', userDataByEmail.email)
          setProfile(userDataByEmail)

          // 2. Buscar Tenant
          if (userDataByEmail.tenantId) {
            const { data: tenantData, error: tenantError } = await supabase
              .from('tenants')
              .select('id, name, slug, plan, status, cnpj, telefone, cep, logradouro, numero, bairro, cidade, estado, prazo_producao_padrao, formas_pagamento, "createdAt", "updatedAt"')
              .eq('id', userDataByEmail.tenantId)
              .maybeSingle()

            if (tenantError) {
              console.error('[TenantProvider] ❌ Erro ao buscar tenant:', tenantError.message)
            } else if (tenantData) {
              setTenant(tenantData)
            }
          }

          setLoading(false)
          return
        }

        // Perfil encontrado por ID
        console.log('[TenantProvider] ✅ Perfil encontrado por ID:', userData.email)
        setProfile(userData)

        // 2. Buscar Tenant
        if (userData.tenantId) {
          const { data: tenantData, error: tenantError } = await supabase
            .from('tenants')
            .select('id, name, slug, plan, status, cnpj, telefone, cep, logradouro, numero, bairro, cidade, estado, prazo_producao_padrao, formas_pagamento, "createdAt", "updatedAt"')
            .eq('id', userData.tenantId)
            .maybeSingle()

          if (tenantError) {
            console.error('[TenantProvider] ❌ Erro ao buscar tenant:', tenantError.message)
          } else if (tenantData) {
            setTenant(tenantData)
          }
        }
      } catch (err) {
        console.error('[TenantProvider] ❌ Erro inesperado:', err)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchTenantData()
    }
  }, [authUser, authLoading, supabase])

  return (
    <TenantContext.Provider value={{ tenant, profile, loading }}>
      {children}
    </TenantContext.Provider>
  )
}

export const useTenant = () => useContext(TenantContext)
