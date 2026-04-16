'use server'

import { prisma } from '@/lib/db';
import { withTenant } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';

/**
 * Cria uma nova requisição de suprimentos (Carrinho Operacional)
 */
export const createSupplyRequest = withTenant(async (data: {
  sectorId: string;
  machineId?: string;
  priority?: string;
  notes?: string;
  items: { productId: string; quantity: number }[];
}, context) => {
  const { tenantId, userId } = context;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Criar a Requisição (Cabeçalho)
    const request = await tx.supplyRequest.create({
      data: {
        tenantId,
        sectorId: data.sectorId,
        machineId: data.machineId,
        userId,
        priority: data.priority || 'NORMAL',
        notes: data.notes,
        status: 'PENDING',
        items: {
          create: data.items.map(item => ({
            tenantId,
            productId: item.productId,
            quantity: item.quantity,
          }))
        }
      },
      include: {
        items: { include: { product: true } }
      }
    });

    return request;
  });

  revalidatePath('/admin/setores');
  revalidatePath('/producao');
  return result;
});

/**
 * Atualiza o status de uma requisição e processa o estoque se necessário
 */
export const updateSupplyRequestStatus = withTenant(async (id: string, status: string) => {
  const result = await prisma.$transaction(async (tx) => {
    const request = await tx.supplyRequest.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!request) throw new Error("Requisição não encontrada");

    // Se o status mudar para 'SHIPPED' (Enviado), fazemos a baixa no estoque
    if (status === 'SHIPPED' && request.status !== 'SHIPPED') {
      for (const item of request.items) {
        // Criar movimentação de saída
        await tx.inventoryMovement.create({
          data: {
            tenantId: request.tenantId,
            productId: item.productId,
            type: 'OUT',
            quantity: item.quantity,
            reason: `Requisição #${request.id.slice(0, 8)}`,
            userId: request.userId,
          }
        });

        // Atualizar saldo no Inventário (simplificado: assume-se um registro de inventário principal)
        const inventory = await tx.inventory.findFirst({
          where: { tenantId: request.tenantId, productId: item.productId }
        });

        if (inventory) {
          await tx.inventory.update({
            where: { id: inventory.id },
            data: { quantity: { decrement: item.quantity } }
          });
        }
      }
    }

    return await tx.supplyRequest.update({
      where: { id },
      data: { status }
    });
  });

  revalidatePath('/admin/setores');
  return result;
});

/**
 * Obtém insumos recomendados para o setor baseado no minQuantity
 */
export const getRecommendedSupplies = withTenant(async (sectorId: string) => {
  const materials = await prisma.sectorMaterial.findMany({
    where: { sectorId },
    include: {
      product: {
        include: {
          inventory: true
        }
      }
    }
  });

  return materials.filter(m => {
    const currentStock = m.product.inventory.reduce((acc, inv) => acc + Number(inv.quantity), 0);
    return currentStock <= Number(m.minQuantity);
  });
});
