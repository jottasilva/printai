'use server'

import { prisma } from '@/lib/db';
import { withTenant } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';
import { getDistinctColor } from '@/lib/color-utils';

export const getSectors = withTenant(async () => {
  return await prisma.sector.findMany({
    include: {
      _count: {
        select: {
          machines: true,
          users: true,
        }
      }
    },
    orderBy: { kanbanOrder: 'asc' },
  });
});

export const getSectorById = withTenant(async (id: string) => {
  return await prisma.sector.findUnique({
    where: { id },
    include: {
      machines: {
        include: {
          assignedUsers: {
            include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } }
          }
        }
      },
      sectorMaterials: {
        include: {
          product: {
            include: {
              inventory: true
            }
          }
        }
      },
      _count: {
        select: {
          machines: true,
          users: true,
        }
      }
    }
  });
});

export const createSector = withTenant(async (data: { name: string; description?: string; color?: string; icon?: string; kanbanOrder?: number }) => {
  // Buscar cores existentes para evitar duplicatas apenas se cor não for enviada
  let finalColor = data.color;
  
  if (!finalColor) {
    const existingSectors = await prisma.sector.findMany({ select: { color: true } });
    const existingColors = existingSectors.map(s => s.color).filter(Boolean) as string[];
    finalColor = getDistinctColor(existingColors);
  }

  const sector = await prisma.sector.create({
    data: {
      ...data,
      color: finalColor
    },
  });
  revalidatePath('/admin/setores');
  revalidatePath('/producao');
  return sector;
});

export const updateSector = withTenant(async (id: string, data: { name?: string; description?: string; color?: string; icon?: string; kanbanOrder?: number }) => {
  const sector = await prisma.sector.update({
    where: { id },
    data,
  });
  revalidatePath('/admin/setores');
  revalidatePath('/producao');
  return sector;
});

export const deleteSector = withTenant(async (id: string) => {
  try {
    // A extensão do Prisma já garante que o delete só ocorra se o id pertencer ao tenantId do contexto
    await prisma.sector.delete({
      where: { id },
    });
    revalidatePath('/admin/setores');
  } catch (error: any) {
    if (error.code === 'P2003') {
      throw new Error("Não é possível deletar um setor que possui usuários vinculados. Remova ou mova os usuários primeiro.");
    }
    // Se P2025 (Record not found), significa que o ID não existe ou pertence a outro tenant (bloqueado pelo RLS lógico)
    if (error.code === 'P2025') {
       throw new Error("Setor não encontrado ou você não tem permissão para excluí-lo.");
    }
    throw error;
  }
});

/**
 * Reordena múltiplos setores em uma única transação
 */
export const reorderSectors = withTenant(async (idOrder: string[]) => {
  await prisma.$transaction(
    idOrder.map((id, index) =>
      prisma.sector.update({
        where: { id },
        data: { kanbanOrder: index },
      })
    )
  );
  revalidatePath('/admin/setores');
  revalidatePath('/producao');
});
