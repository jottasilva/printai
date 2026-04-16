import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { getTenantId, safeAction } from '@/lib/server-utils';
import { Sidebar } from '@/components/sidebar';
import { InventoryClient } from './inventory-client';

export const metadata = {
  title: 'Estoque | PrintAI',
  description: 'Gestão de Materiais e Insumos',
};

async function getInventoryData(searchParams: { [key: string]: string | string[] | undefined }) {
  const { tenantId } = await getTenantId();
  
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;

  const whereClause: any = {
    tenantId,
    ...(search && {
      product: {
        name: { contains: search, mode: 'insensitive' }
      }
    }),
  };

  const inventories = await prisma.inventory.findMany({
    where: whereClause,
    include: {
      product: {
        select: {
          name: true,
          sku: true,
          unit: true,
          costPrice: true,
        }
      },
      variant: {
        select: {
          name: true,
          sku: true,
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  // Calculate totals for stats
  const totalItems = inventories.length;
  const requireRestock = inventories.filter(i => Number(i.availableQuantity) <= Number(i.minQuantity)).length;
  
  const totalCost = inventories.reduce((acc, curr) => {
    const cost = curr.product?.costPrice ? Number(curr.product.costPrice) : 0;
    return acc + (Number(curr.availableQuantity) * cost);
  }, 0);

  // Fetch recent movements
  const recentMovements = await prisma.inventoryMovement.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      inventory: {
        include: {
          product: { select: { name: true, unit: true } }
        }
      }
    }
  });

  return {
    inventories: inventories.map(i => ({
      ...i,
      quantity: Number(i.quantity),
      availableQuantity: Number(i.availableQuantity),
      minQuantity: Number(i.minQuantity),
      product: {
        ...i.product,
        costPrice: Number(i.product?.costPrice || 0)
      }
    })),
    stats: {
      totalItems,
      requireRestock,
      totalCost,
    },
    recentMovements: recentMovements.map(m => ({
      ...m,
      quantity: Number(m.quantity),
      balanceAfter: Number(m.balanceAfter),
    }))
  };
}

export default async function EstoquePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { inventories, stats, recentMovements } = await getInventoryData(searchParams);

  return (
    <div className="flex h-screen bg-surface dark:bg-slate-950 font-body">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-10 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
            <InventoryClient 
              initialInventories={inventories} 
              stats={stats} 
              recentMovements={recentMovements} 
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
