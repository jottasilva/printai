'use server'

import { prisma } from '@/lib/db';
import { withTenant, getTenantId } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';
import { OrderItemStatus } from '@prisma/client';

export const getProductionKanbanData = withTenant(async () => {
  const sectors = await prisma.sector.findMany({
    where: { status: 'OPERATIONAL' },
    include: {
      machines: {
        where: { status: 'OPERATIONAL' }
      }
    },
    orderBy: { kanbanOrder: 'asc' },
  });

  const activeItems = await prisma.orderItem.findMany({
    where: {
      status: {
        notIn: ['SHIPPED', 'CANCELED']
      }
    },
    include: {
      product: {
        select: {
          name: true,
          thumbnailUrl: true,
        }
      },
      order: {
        select: {
          number: true,
          customer: {
            select: {
              name: true,
            }
          }
        }
      },
      assignedUser: {
        select: {
          name: true,
          avatarUrl: true,
        }
      },
      machineUsageLogs: {
        where: { endTime: null },
        include: {
          machine: {
            select: { name: true }
          }
        },
        take: 1
      }
    },
    orderBy: [
      { priority: 'desc' },
      { dueDate: 'asc' },
      { createdAt: 'asc' }
    ]
  });

  return { sectors, items: activeItems };
});

export const moveOrderItem = withTenant(async (orderItemId: string, targetSectorId: string | null) => {
  const { userId, tenantId } = await getTenantId();
  
  const currentItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { sector: true }
  });

  if (!currentItem) throw new Error("Item não encontrado");

  const targetSector = targetSectorId 
    ? await prisma.sector.findUnique({ where: { id: targetSectorId } })
    : null;

  const item = await prisma.orderItem.update({
    where: { id: orderItemId },
    data: {
      sectorId: targetSectorId,
      status: targetSectorId ? 'IN_PROGRESS' : currentItem.status,
    }
  });

  // Criar Log
  await prisma.orderItemLog.create({
    data: {
      tenantId,
      orderItemId,
      userId,
      fromStatus: currentItem.status,
      toStatus: targetSectorId ? 'IN_PROGRESS' : currentItem.status,
      note: `Movido de [${currentItem.sector?.name || 'Triagem'}] para [${targetSector?.name || 'Triagem'}]`,
    }
  });

  revalidatePath('/producao');
  return item;
});

export const updateOrderItemStatus = withTenant(async (id: string, status: OrderItemStatus) => {
  const item = await prisma.orderItem.update({
    where: { id },
    data: { status }
  });
  revalidatePath('/producao');
  return item;
});

export const getProductionItemLogs = withTenant(async (orderItemId: string) => {
  return await prisma.orderItemLog.findMany({
    where: { orderItemId },
    include: {
      user: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
});

export const updateItemNote = withTenant(async (id: string, note: string) => {
  const item = await prisma.orderItem.update({
    where: { id },
    data: { productionNotes: note }
  });
  revalidatePath('/producao');
  return item;
});
