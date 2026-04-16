'use server'

import { prisma } from '@/lib/db';
import { getTenantId } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// Mapeamento de permissões por role (sincronizado com auth.ts)
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

export async function getUsers() {
  const { tenantId } = await getTenantId();
  return await prisma.user.findMany({
    where: { tenantId },
    include: { sector: true },
    orderBy: { name: 'asc' },
  });
}

export async function getUserById(id: string) {
  const { tenantId } = await getTenantId();
  return await prisma.user.findUnique({
    where: { id, tenantId },
    include: { sector: true },
  });
}

export async function createUser(data: { name: string; email: string; role: string; sectorId?: string }) {
  const { tenantId } = await getTenantId();
  const supabaseAdmin = getSupabaseAdmin();
  
  // 1. Criar usuário no Supabase Auth via Admin (sem necessidade de confirmação imediata para add interno)
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    email_confirm: true,
    user_metadata: {
      name: data.name,
    }
  });

  if (authError) {
    throw new Error(`Erro no Supabase Auth: ${authError.message}`);
  }

  const userId = authUser.user.id;
  const permissions = ROLE_PERMISSIONS[data.role] || ROLE_PERMISSIONS.VIEWER;

  // 2. Criar registro no Prisma (se o trigger falhar ou para garantir consistência imediata)
  const user = await prisma.user.create({
    data: {
      id: userId,
      tenantId,
      email: data.email,
      name: data.name,
      role: data.role as any,
      permissions,
      sectorId: data.sectorId || null,
    },
  });

  revalidatePath('/admin/usuarios');
  return user;
}

export async function updateUserSector(userId: string, sectorId: string | null) {
  const { tenantId } = await getTenantId();
  const user = await prisma.user.update({
    where: { id: userId, tenantId },
    data: { sectorId },
  });
  revalidatePath('/admin/usuarios');
  return user;
}

export async function deleteUser(id: string) {
  const { tenantId } = await getTenantId();
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    // 1. Verificar se o usuário existe no DB local e pertence ao tenant
    const existingUser = await prisma.user.findFirst({
      where: { id, tenantId }
    });

    if (!existingUser) {
      throw new Error("Usuário não encontrado ou você não tem permissão para removê-lo.");
    }

    // 2. Deletar do Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    
    // Se o erro não for 404 (já deletado), bloqueamos a deleção local para evitar dessincronização
    if (authError && authError.status !== 404) {
      throw new Error(`Erro ao remover credenciais: ${authError.message}`);
    }

    // 3. Deletar do Prisma
    await prisma.user.delete({
      where: { id, tenantId },
    });
    
    revalidatePath('/admin/usuarios');
  } catch (error: any) {
    console.error(`[deleteUser] ${error.message}`);
    throw error;
  }
}
export async function updateUser(id: string, data: { 
  name: string; 
  email: string; 
  role: string; 
  sectorId?: string | null;
  employeeId?: string | null;
  jobTitle?: string | null;
  admissionDate?: Date | null;
  managerId?: string | null;
  personalEmail?: string | null;
  commercialPhone?: string | null;
}) {
  const { tenantId } = await getTenantId();
  const supabaseAdmin = getSupabaseAdmin();

  // 1. Atualizar no Supabase Auth
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
    email: data.email,
    user_metadata: { name: data.name }
  });

  if (authError) {
    throw new Error(`Erro ao atualizar credenciais: ${authError.message}`);
  }

  const permissions = ROLE_PERMISSIONS[data.role] || ROLE_PERMISSIONS.VIEWER;

  // 2. Atualizar no Prisma
  const user = await prisma.user.update({
    where: { id, tenantId },
    data: {
      name: data.name,
      email: data.email,
      role: data.role as any,
      permissions,
      sectorId: data.sectorId || null,
      employeeId: data.employeeId || null,
      jobTitle: data.jobTitle || null,
      admissionDate: data.admissionDate || null,
      managerId: data.managerId || null,
      personalEmail: data.personalEmail || null,
      commercialPhone: data.commercialPhone || null,
    },
  });

  revalidatePath('/admin/usuarios');
  return user;
}

export async function updateProfile(data: { 
  name: string; 
  phone?: string; 
  avatarUrl?: string; 
  personalEmail?: string;
  commercialPhone?: string;
  theme?: string;
  language?: string;
  timezone?: string;
  notificationsConfig?: any;
}) {
  const { userId, tenantId } = await getTenantId();

  const user = await prisma.user.update({
    where: { id: userId, tenantId },
    data: {
      name: data.name,
      phone: data.phone || null,
      avatarUrl: data.avatarUrl || null,
      personalEmail: data.personalEmail || null,
      commercialPhone: data.commercialPhone || null,
      theme: data.theme || 'light',
      language: data.language || 'pt-BR',
      timezone: data.timezone || 'America/Sao_Paulo',
      notificationsConfig: data.notificationsConfig || undefined,
    },
  });

  revalidatePath('/settings');
  revalidatePath('/'); // Para atualizar o sidebar
  return user;
}
