/**
 * Server Actions para autenticação e gerenciamento de perfis
 * 
 * Arquitetura:
 * - Email/Senha → Supabase Auth (fonte primária)
 * - Perfil/Tenant → PostgreSQL via Prisma (criado por trigger SQL)
 * - Ao logar, o perfil é puxado do banco pelo TenantContext
 * 
 * Fluxo de registro:
 * 1. Valida dados + rate limiting
 * 2. Cria usuário no Supabase Auth (signUp)
 * 3. Trigger SQL `auto_create_user_profile` cria perfil automaticamente
 * 4. Server Action VALIDA que o perfil foi criado (retry com delay)
 * 5. Se falhar, faz rollback (deleta do Auth via admin client)
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { LedgerService } from '@/lib/services/ledger-service'

// ─── Tipos ────────────────────────────────────────────────────

export interface RegisterInput {
  name: string
  email: string
  companyName: string
  password: string
  // Novos campos de onboarding
  cnpj?: string
  telefone?: string
  cep?: string
  logradouro?: string
  numero?: string
  bairro?: string
  cidade?: string
  estado?: string
  prazoProducao?: string
  formasPagamento?: string[]
}

export interface RegisterResult {
  success: boolean
  error?: string
  userId?: string
}

// ─── Constantes ───────────────────────────────────────────────

/** Intervalo mínimo entre registros (em ms) — proteção contra spam */
const REGISTER_COOLDOWN_MS = 30_000 // 30 segundos

/** Número máximo de tentativas para verificar se o trigger criou o perfil */
const PROFILE_CHECK_MAX_RETRIES = 5

/** Delay entre cada tentativa de verificação (em ms) */
const PROFILE_CHECK_DELAY_MS = 800

/** Mapeamento de permissões por role (substitui wildcard ['*']) */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: [
    'users:manage', 'tenants:manage', 'orders:*', 'products:*',
    'customers:*', 'inventory:*', 'financial:*', 'reports:*',
    'conversations:*', 'settings:*',
  ],
  ADMIN: [
    'orders:*', 'products:*', 'customers:*', 'inventory:*',
    'financial:*', 'reports:view', 'conversations:*',
  ],
  MANAGER: [
    'orders:*', 'products:view', 'customers:*', 'inventory:view',
    'financial:view', 'reports:view', 'conversations:*',
  ],
  OPERATOR: [
    'orders:view', 'orders:update', 'products:view', 'conversations:view',
  ],
  VIEWER: [
    'orders:view', 'products:view', 'customers:view', 'reports:view',
  ],
}

// ─── Rate Limiting (in-memory por email) ──────────────────────

/** Map para controlar rate limiting por email (server-side in-memory) */
const registerAttempts = new Map<string, number>()

/**
 * Verifica rate limiting por email.
 * Retorna true se o registro está permitido, false se está em cooldown.
 */
function checkRateLimit(email: string): boolean {
  const lastAttempt = registerAttempts.get(email)

  if (lastAttempt) {
    const elapsed = Date.now() - lastAttempt
    if (elapsed < REGISTER_COOLDOWN_MS) {
      return false // Em cooldown
    }
  }

  return true // Permitido
}

/**
 * Marca o timestamp do último registro para o email.
 */
function setRateLimit(email: string): void {
  registerAttempts.set(email, Date.now())

  // Limpa entradas antigas após o cooldown (evita vazamento de memória)
  setTimeout(() => {
    registerAttempts.delete(email)
  }, REGISTER_COOLDOWN_MS + 1000)
}

// ─── Registro ─────────────────────────────────────────────────

/**
 * Registra novo usuário com criação garantida de perfil.
 * 
 * Fluxo:
 * 1. Rate limiting via cookie
 * 2. Validações básicas
 * 3. Verifica se email já existe no banco
 * 4. Cria usuário no Supabase Auth (signUp)
 * 5. Trigger SQL cria perfil automaticamente (fonte primária)
 * 6. Server Action VALIDA que o perfil foi criado (retry)
 * 7. Se não existir após retries → cria via Prisma (fallback)
 * 8. Se falhar tudo → rollback (deleta do Auth via admin client)
 */
export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const supabase = createClient()

  try {
    const normalizedEmail = input.email.toLowerCase()

    // 1. Rate limiting por email
    if (!checkRateLimit(normalizedEmail)) {
      return {
        success: false,
        error: 'Você registrou uma conta recentemente. Aguarde 30 segundos antes de tentar novamente.',
      }
    }

    // 2. Validações básicas
    if (!input.name.trim()) return { success: false, error: 'Nome é obrigatório' }
    if (!input.email.trim()) return { success: false, error: 'Email é obrigatório' }
    if (!input.companyName.trim()) return { success: false, error: 'Nome da empresa é obrigatório' }
    if (input.password.length < 8) return { success: false, error: 'Senha deve ter no mínimo 8 caracteres' }

    // 3. Verifica se usuário já existe no banco
    const existingUser = await prisma.user.findFirst({
      where: { email: normalizedEmail }
    })

    if (existingUser) {
      return { success: false, error: 'Este email já está cadastrado. Faça login ou recupere sua senha.' }
    }

    // 4. Cria usuário no Supabase Auth
    // O trigger SQL 'auto_create_user_profile' vai criar o perfil automaticamente
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: input.password,
      options: {
        data: {
          name: input.name,
          company_name: input.companyName,
          cnpj: input.cnpj,
          telefone: input.telefone,
          cep: input.cep,
          logradouro: input.logradouro,
          numero: input.numero,
          bairro: input.bairro,
          cidade: input.cidade,
          estado: input.estado,
          prazo_producao: input.prazoProducao,
          formas_pagamento: input.formasPagamento,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`,
      }
    })

    if (authError) {
      if (authError.message.includes('already exists') || authError.message.includes('User already registered')) {
        return { success: false, error: 'Este email já está cadastrado. Faça login ou recupere sua senha.' }
      }
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Erro ao criar usuário. Tente novamente.' }
    }

    const userId = authData.user.id

    // 5. Marca rate limit
    setRateLimit(normalizedEmail)

    // 6. Aguarda e valida que o trigger SQL criou o perfil
    try {
      await waitForProfileCreation(userId, normalizedEmail, input)
    } catch (profileError: any) {
      console.error('[Register] ❌ Erro ao garantir perfil:', profileError.message)

      // 7. Rollback: remove usuário do Supabase Auth usando admin client
      try {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        if (deleteError) {
          console.error('[Register] ⚠️ Falha no rollback do Auth:', deleteError.message)
        } else {
          console.log('[Register] ✅ Rollback do Auth executado com sucesso')
        }
      } catch (rollbackError: any) {
        console.error('[Register] ⚠️ Erro inesperado no rollback:', rollbackError.message)
      }

      return { success: false, error: 'Erro ao configurar perfil. Tente novamente.' }
    }

    // 8. Log de auditoria
    try {
      await logUserCreation(userId, normalizedEmail, input.name)
    } catch (logError) {
      // Log de auditoria não deve bloquear o registro
      console.warn('[Register] ⚠️ Falha ao registrar auditoria:', logError)
    }

    revalidatePath('/login')

    return { success: true, userId }

  } catch (error: any) {
    console.error('[Register] ❌ Erro inesperado:', error)
    return { success: false, error: 'Erro interno do servidor. Tente novamente.' }
  }
}

// ─── Verificação e Fallback do Perfil ─────────────────────────

/**
 * Aguarda o trigger SQL criar o perfil, com retries.
 * Se após todas as tentativas o perfil não existir, cria via Prisma (fallback).
 * 
 * Estratégia:
 * 1. Aguarda PROFILE_CHECK_DELAY_MS
 * 2. Verifica se o perfil existe por ID
 * 3. Se não existe, repete até PROFILE_CHECK_MAX_RETRIES
 * 4. Se esgotou retries, cria via Prisma como fallback
 */
async function waitForProfileCreation(
  userId: string,
  email: string,
  input: RegisterInput
): Promise<void> {
  // Tenta verificar se o trigger já criou o perfil
  for (let attempt = 1; attempt <= PROFILE_CHECK_MAX_RETRIES; attempt++) {
    await delay(PROFILE_CHECK_DELAY_MS)

    const profile = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, tenantId: true }
    })

    if (profile) {
      console.log(`[Register] ✅ Perfil criado pelo trigger (tentativa ${attempt})`)

      // Atualiza permissões para o padrão correto da role
      const userWithRole = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      })

      if (userWithRole) {
        const permissions = ROLE_PERMISSIONS[userWithRole.role] || ROLE_PERMISSIONS.VIEWER
        await prisma.user.update({
          where: { id: userId },
          data: { permissions }
        })
      }

      // Inicializa o Ledger para este tenant (idempotente)
      await LedgerService.initTenantLedger(profile.tenantId);

      return // Perfil criado com sucesso pelo trigger
    }

    console.log(`[Register] ⏳ Perfil não encontrado (tentativa ${attempt}/${PROFILE_CHECK_MAX_RETRIES})`)
  }

  // Fallback: trigger não criou o perfil, criar via Prisma
  console.warn('[Register] ⚠️ Trigger não criou perfil. Criando via fallback Prisma...')
  await createProfileFallback(userId, email, input)
}

/**
 * Cria perfil via Prisma como fallback quando o trigger SQL falha.
 * Usa busca de tenant APENAS pelo slug da empresa (sem condição genérica).
 */
async function createProfileFallback(
  userId: string,
  email: string,
  input: RegisterInput
): Promise<void> {
  const companyName = input.companyName
  const slug = generateSlug(companyName)

  // Busca tenant APENAS pelo slug da empresa (correção da lógica frágil)
  let tenant = await prisma.tenant.findFirst({
    where: { slug }
  })

  if (!tenant) {
    // Cria novo tenant para esta empresa
    tenant = await prisma.tenant.create({
      data: {
        name: companyName,
        slug,
        plan: 'PROFESSIONAL',
        status: 'TRIAL',
        maxUsers: 10,
        maxStorage: 5368709120, // 5GB
        trialEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias
        settings: {
          cnpj: input.cnpj,
          telefone: input.telefone,
          cep: input.cep,
          logradouro: input.logradouro,
          numero: input.numero,
          bairro: input.bairro,
          cidade: input.cidade,
          estado: input.estado,
          prazo_producao_padrao: input.prazoProducao,
          formas_pagamento: input.formasPagamento,
        }
      }
    })
    console.log(`[Register] 🏢 Tenant criado via fallback: ${tenant.id} (${slug})`)
  }

  // Verifica se é o primeiro usuário (recebe OWNER)
  const isFirstUser = (await prisma.user.count({ where: { tenantId: tenant.id } })) === 0
  const role = isFirstUser ? 'OWNER' : 'ADMIN'
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.VIEWER

  // 4. Cria perfil (com ON CONFLICT safety via try/catch)
  try {
    await prisma.user.create({
      data: {
        id: userId,
        tenantId: tenant.id,
        email,
        name: input.name || email.split('@')[0],
        role,
        permissions,
        emailVerifiedAt: new Date(),
      }
    })
    console.log(`[Register] ✅ Perfil criado via fallback: ${email} (role: ${role})`)

    // 5. Inicializa o Ledger para este tenant
    await LedgerService.initTenantLedger(tenant.id);
    
  } catch (createError: any) {
    // Se o trigger criou entre as verificações, apenas ignora o conflito
    if (createError.code === 'P2002') {
      console.log('[Register] ℹ️ Perfil já existe (provável criação tardia pelo trigger)')
      // Mesmo assim, garante que o ledger esteja inicializado (idempotente)
      await LedgerService.initTenantLedger(tenant.id);
      return
    }
    throw createError
  }
}

// ─── Audit Log ────────────────────────────────────────────────

/**
 * Registra a criação de usuário no AuditLog para auditoria.
 * Usa o modelo AuditLog existente no schema com as FKs obrigatórias.
 */
async function logUserCreation(userId: string, email: string, name: string): Promise<void> {
  // Busca o perfil recém-criado para obter o tenantId (FK obrigatória)
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: { tenantId: true }
  })

  if (!profile) {
    console.warn('[Audit] ⚠️ Perfil não encontrado para audit log. Pulando...')
    return
  }

  await prisma.auditLog.create({
    data: {
      tenantId: profile.tenantId,
      userId,
      userEmail: email,
      action: 'USER_CREATED',
      entity: 'User',
      entityId: userId,
      after: {
        name,
        email,
        action: 'Registro de novo usuário',
        timestamp: new Date().toISOString(),
      },
    }
  })
}

// ─── Utilitários ──────────────────────────────────────────────

/**
 * Gera slug a partir do nome da empresa.
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'empresa'
}

/**
 * Aguarda um período em ms (para retry).
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── Ações Auxiliares ─────────────────────────────────────────

/**
 * Reenvia email de confirmação.
 */
export async function resendConfirmationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.toLowerCase(),
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`,
    }
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Solicita redefinição de senha.
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
