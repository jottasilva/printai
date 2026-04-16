'use server'

import { prisma } from '@/lib/db';
import { withTenant, getTenantId } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';
import { OrderItemStatus } from '@prisma/client';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export interface AuditFilters {
  sectorId?: string;
  userId?: string;
  status?: OrderItemStatus;
  startDate?: string;
  endDate?: string;
  customerName?: string;
  orderNumber?: string;
}

/**
 * Busca dados de produção para o Kanban de Auditoria com filtros avançados
 */
export const getAuditProductionData = withTenant(async (filters: AuditFilters = {}) => {
  const { tenantId } = await getTenantId();

  const where: any = {
    tenantId,
    deletedAt: null,
  };

  if (filters.sectorId) where.sectorId = filters.sectorId;
  if (filters.userId) where.assignedUserId = filters.userId;
  if (filters.status) where.status = filters.status;
  
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
  }

  if (filters.orderNumber) {
    where.order = { number: { contains: filters.orderNumber, mode: 'insensitive' } };
  }

  if (filters.customerName) {
    where.order = { 
      ...where.order,
      customer: { name: { contains: filters.customerName, mode: 'insensitive' } } 
    };
  }

  const sectors = await prisma.sector.findMany({
    where: { tenantId, status: 'OPERATIONAL' },
    orderBy: { kanbanOrder: 'asc' },
  });

  const items = await prisma.orderItem.findMany({
    where,
    include: {
      product: { select: { name: true, thumbnailUrl: true } },
      order: {
        select: {
          number: true,
          customer: { select: { name: true } }
        }
      },
      assignedUser: { select: { name: true, avatarUrl: true } },
      sector: { select: { name: true, color: true } }
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  return { sectors, items };
});

/**
 * Retorna o histórico completo de logs de um item específico
 */
export const getItemAuditHistory = withTenant(async (orderItemId: string) => {
  return await prisma.orderItemLog.findMany({
    where: { orderItemId },
    include: {
      user: { select: { name: true, avatarUrl: true } },
      orderItem: {
        include: {
          product: { select: { name: true } },
          order: { select: { number: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
});

/**
 * Calcula métricas agregadas da planta industrial
 */
export const getAuditMetrics = withTenant(async () => {
  const { tenantId } = await getTenantId();

  // 1. Total de itens em produção
  const activeCount = await prisma.orderItem.count({
    where: { 
      tenantId, 
      status: { notIn: ['SHIPPED', 'CANCELED'] } 
    }
  });

  // 2. Itens parados (sem log nas últimas 24h)
  const yesterday = subDays(new Date(), 1);
  const stalledItemsCount = await prisma.orderItem.count({
    where: {
      tenantId,
      status: { notIn: ['SHIPPED', 'CANCELED'] },
      updatedAt: { lte: yesterday }
    }
  });

  // 3. Gargalo (Setor com mais itens)
  const sectorCounts = await prisma.orderItem.groupBy({
    by: ['sectorId'],
    where: { 
      tenantId, 
      sectorId: { not: null },
      status: { notIn: ['SHIPPED', 'CANCELED'] }
    },
    _count: { _all: true },
    orderBy: { _count: { sectorId: 'desc' } },
    take: 1
  });

  let bottleneckSector = "Nenhum";
  if (sectorCounts.length > 0) {
    const s = await prisma.sector.findUnique({
      where: { id: sectorCounts[0].sectorId! },
      select: { name: true }
    });
    bottleneckSector = s?.name || "Desconhecido";
  }

  // 4. Produtividade por Operador (Logs nas últimas 24h)
  const operatorStats = await prisma.orderItemLog.groupBy({
    by: ['userId'],
    where: {
      tenantId,
      createdAt: { gte: startOfDay(new Date()) }
    },
    _count: { _all: true },
    orderBy: { _count: { userId: 'desc' } },
    take: 5
  });

  const topOperators = await Promise.all(operatorStats.map(async (stat) => {
    const user = await prisma.user.findUnique({
      where: { id: stat.userId },
      select: { name: true }
    });
    return {
      name: user?.name || "Desconhecido",
      actions: stat._count._all
    };
  }));

  return {
    activeCount,
    stalledItemsCount,
    bottleneckSector,
    topOperators
  };
});

/**
 * Movimenta item pela auditoria com log especializado
 */
export const moveOrderItemAudit = withTenant(async (orderItemId: string, targetSectorId: string | null, note?: string) => {
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

  await prisma.orderItemLog.create({
    data: {
      tenantId,
      orderItemId,
      userId,
      fromStatus: currentItem.status,
      toStatus: targetSectorId ? 'IN_PROGRESS' : currentItem.status,
      note: note || `AUDITORIA: Movimentado de [${currentItem.sector?.name || 'Triagem'}] para [${targetSector?.name || 'Triagem'}]`,
    }
  });

  revalidatePath('/admin/auditoria');
  revalidatePath('/producao');
  return item;
});
