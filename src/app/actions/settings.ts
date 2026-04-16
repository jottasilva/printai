'use server'

import { prisma } from '@/lib/db';
import { withTenant } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';
import { Plan, TenantStatus, UserRole } from '@prisma/client';
import { crypto } from 'crypto';

/**
 * Atualiza configurações básicas do Tenant (Empresa)
 */
export const updateTenantSettings = withTenant(async (data: { 
  name?: string; 
  settings?: any;
}) => {
  const result = await prisma.tenant.update({
    where: { id: undefined as any }, // O middleware do Prisma injetará o ID correto do contexto
    data: {
      name: data.name,
      settings: data.settings,
    }
  });

  revalidatePath('/settings/general');
  return result;
});

/**
 * Cria um convite para um novo membro da equipe
 */
export const createTeamInvite = withTenant(async (data: {
  email: string;
  role: UserRole;
}) => {
  const token = (globalThis as any).crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

  const invite = await prisma.invite.create({
    data: {
      email: data.email,
      role: data.role,
      token,
      expiresAt,
    }
  });

  // Nota: Em um sistema real, aqui dispararíamos o e-mail via Resend/SendGrid.
  // Por enquanto, apenas registramos no banco.
  
  revalidatePath('/settings/general');
  return invite;
});

/**
 * Remove um convite pendente
 */
export const cancelInvite = withTenant(async (id: string) => {
  await prisma.invite.delete({
    where: { id }
  });
  revalidatePath('/settings/general');
});

/**
 * Altera o papel de um usuário existente no tenant
 */
export const updateUserRole = withTenant(async (userId: string, role: UserRole) => {
  const result = await prisma.user.update({
    where: { id: userId },
    data: { role }
  });
  revalidatePath('/settings/general');
  return result;
});
