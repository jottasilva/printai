'use server'

import { prisma } from '@/lib/db';
import { withTenant } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';
import { MachineStatus, AlertLevel } from '@prisma/client';

export const getSectorOperationalData = withTenant(async (sectorId: string) => {
  const sector = await prisma.sector.findUnique({
    where: { id: sectorId },
    include: {
      machines: true,
      sectorMaterials: {
        include: { product: true }
      },
      anomalyAlerts: {
        where: { isResolved: false },
        orderBy: { createdAt: 'desc' }
      },
      users: true,
      orderItems: {
        where: { status: { notIn: ['DONE', 'SHIPPED', 'REJECTED', 'CANCELED'] } },
        include: { product: true, order: { select: { number: true, customer: { select: { name: true } } } } },
        orderBy: { priority: 'desc' }
      }
    }
  });

  if (!sector) {
    throw new Error('Sector not found.');
  }

  // Obter itens concluídos recentemente para cálculo de OEE/capacidade (Mock)
  const completedToday = await prisma.orderItem.count({
    where: { 
      sectorId, 
      status: 'DONE',
      updatedAt: { gte: new Date(new Date().setHours(0,0,0,0)) }
    }
  });

  return { sector, completedToday };
});

export const manageMachine = withTenant(async (data: { 
  id?: string; 
  sectorId: string; 
  name: string; 
  model?: string; 
  status?: MachineStatus;
  serialNumber?: string;
}) => {
  let machine;
  if (data.id) {
    machine = await prisma.machine.update({
      where: { id: data.id },
      data: {
        name: data.name,
        model: data.model,
        status: data.status,
        serialNumber: data.serialNumber
      }
    });
  } else {
    machine = await prisma.machine.create({
      data: {
        sectorId: data.sectorId,
        name: data.name,
        model: data.model,
        status: data.status || 'OPERATIONAL',
        serialNumber: data.serialNumber
      }
    });
  }

  revalidatePath(`/admin/setores/${data.sectorId}`);
  return machine;
});

export const checkSectorAnomalies = withTenant(async (sectorId: string) => {
  // Simples heurística para disparar anomalia se houver máquina DOWN por muito tempo.
  const downMachines = await prisma.machine.findMany({
    where: { sectorId, status: 'DOWN' }
  });

  for (const mac of downMachines) {
    // Checa se já não tem alerta em aberto
    const existing = await prisma.anomalyAlert.findFirst({
      where: { sectorId, message: { contains: mac.name }, isResolved: false }
    });

    if (!existing) {
      await prisma.anomalyAlert.create({
        data: {
          sectorId,
          level: 'CRITICAL',
          message: `Máquina ${mac.name} encontra-se indisponível e impacta a produção.`
        }
      });
    }
  }

  // Anomalia de Material Crítico
  const materials = await prisma.sectorMaterial.findMany({
    where: { sectorId },
    include: { product: { include: { inventory: true } } }
  });

  for (const mat of materials) {
    const qty = mat.product.inventory.reduce((acc, inv) => acc + Number(inv.availableQuantity), 0);
    if (qty <= Number(mat.minQuantity)) {
      const existing = await prisma.anomalyAlert.findFirst({
        where: { sectorId, message: { contains: mat.product.name }, isResolved: false }
      });
      if (!existing) {
        await prisma.anomalyAlert.create({
          data: {
            sectorId,
            level: 'WARNING',
            message: `Estoque do material crítico ${mat.product.name} está abaixo do mínimo exigido no setor.`
          }
        });
      }
    }
  }

  revalidatePath(`/admin/setores/${sectorId}`);
  return true;
});

export const logConsumption = withTenant(async (sectorId: string, productId: string, quantity: number, userId: string) => {
  // Verifica se há estoque geral para baixar
  const inventory = await prisma.inventory.findFirst({
    where: { productId }
  });

  if (!inventory || Number(inventory.availableQuantity) < quantity) {
    throw new Error('Estoque insuficiente para consumo.');
  }

  // Lógica transacional para reduzir estoque e gerar movimento
  await prisma.$transaction([
    prisma.inventory.update({
      where: { id: inventory.id },
      data: { availableQuantity: { decrement: quantity }, quantity: { decrement: quantity } }
    }),
    prisma.inventoryMovement.create({
      data: {
        inventoryId: inventory.id,
        type: 'OUT',
        quantity: quantity,
        balanceBefore: inventory.availableQuantity,
        balanceAfter: Number(inventory.availableQuantity) - quantity,
        reason: `Consumo setorial (Setor ID: ${sectorId})`,
        userId: userId
      }
    })
  ]);

  revalidatePath(`/admin/setores/${sectorId}`);
  return true;
});

export const toggleSectorStatus = withTenant(async (sectorId: string) => {
  const sector = await prisma.sector.findUnique({
    where: { id: sectorId },
    select: { status: true }
  });

  if (!sector) throw new Error('Setor não encontrado.');

  const newStatus = sector.status === 'PAUSED' ? 'OPERATIONAL' : 'PAUSED';

  await prisma.sector.update({
    where: { id: sectorId },
    data: { status: newStatus }
  });

  revalidatePath(`/admin/setores/${sectorId}`);
  revalidatePath('/admin/setores');
  return newStatus;
});

export const resolveAnomaly = withTenant(async (sectorId: string, alertId: string) => {
  await prisma.anomalyAlert.update({
    where: { id: alertId },
    data: {
      isResolved: true,
      resolvedAt: new Date()
    }
  });

  revalidatePath(`/admin/setores/${sectorId}`);
  return true;
});
