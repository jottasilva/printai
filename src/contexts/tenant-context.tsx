'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './auth-context'
import { createClient } from '@/lib/supabase/client'

type Tenant = {
  id: string
  name: string
  slug: string
  plan: string
  status: string
}

type UserProfile = {
  id: string
  role: string
  name: string
  email?: string
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
  const supabase = createClient()

  useEffect(() => {
    const fetchTenantData = async () => {
      if (!authUser) {
        setTenant(null)
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        // 1. Buscar Perfil (User)
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('*')
          .eq('id', authUser.id);

        if (userError || !userData?.[0]) {
          console.error('❌ Erro ao buscar perfil:', userError || 'Usuário não encontrado');
          setLoading(false);
          return;
        }

        const profileData = userData[0];
        setProfile(profileData);
        console.log('✅ Perfil carregado:', profileData.email);

        // 2. Buscar Tenant
        if (profileData.tenantId) {
          const { data: tenantData, error: tenantError } = await supabase
            .from('Tenant')
            .select('*')
            .eq('id', profileData.tenantId);

          if (tenantError || !tenantData?.[0]) {
            console.error('❌ Erro ao buscar tenant:', tenantError || 'Tenant não encontrado');
          } else {
            setTenant(tenantData[0]);
            console.log('✅ Tenant carregado:', tenantData[0].name);
          }
        }
      } catch (err) {
        console.error('❌ Erro inesperado no TenantProvider:', err);
      } finally {
        setLoading(false);
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
