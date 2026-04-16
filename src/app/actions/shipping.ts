'use server';

import { prisma } from '@/lib/db';
import { getTenantId, withTenant } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';

/**
 * Obtém dados consolidados para o dashboard de envios
 * Utiliza withTenant para injeção automática de contexto multi-tenancy
 */
export const getShippingData = withTenant(async () => {
  const [waitingCollection, inTransit, deliveredToday, shippers] = await Promise.all([
    // Aguardando Coleta (Itens prontos mas não enviados ainda)
    prisma.orderItem.count({
      where: {
        status: 'DONE',
      },
    }),
    // Em Trânsito (Itens enviados mas não entregues)
    prisma.orderItem.count({
      where: {
        status: 'SHIPPED',
      },
    }),
    // Entregues Hoje
    prisma.order.count({
      where: {
        status: 'DELIVERED',
        deliveredAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    // Lista de envios recentes (Injeção via prefixo multi-tenant no findMany)
    prisma.order.findMany({
      where: {
        OR: [
          { status: 'SHIPPED' },
          { status: 'DELIVERED' },
          { items: { some: { status: 'SHIPPED' } } }
        ]
      },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
        shippingAddress: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 20,
    }),
  ]);

  // Calcula atrasos (ex: prontos há mais de 24h e não coletados)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const delays = await prisma.orderItem.count({
    where: {
      status: 'DONE',
      finishedAt: {
        lt: yesterday,
      },
    },
  });

  return {
    stats: {
      waitingCollection,
      inTransit,
      deliveredToday,
      delays,
    },
    shippers: shippers.map(s => ({
      id: s.number,
      orderId: s.id,
      cliente: s.customer.name,
      transportadora: s.carrier || 'Não informada',
      rastreio: s.trackingCode || '-',
      dataEnvio: s.shippedAt ? format(s.shippedAt, 'dd/MM/yyyy') : '-',
      dataEstimada: s.expectedDeliveryAt ? format(s.expectedDeliveryAt, 'dd/MM/yyyy') : 'Não estimada',
      status: s.status === 'SHIPPED' ? 'Em Trânsito' : s.status === 'DELIVERED' ? 'Entregue' : 'Pronto p/ Coleta',
      address: s.shippingAddress ? {
        street: s.shippingAddress.street,
        number: s.shippingAddress.number,
        city: s.shippingAddress.city,
        state: s.shippingAddress.state,
        zipCode: s.shippingAddress.zipCode
      } : null,
      items: s.items.map(i => ({
        id: i.id,
        name: i.product.name,
        quantity: i.quantity.toNumber(),
        status: i.status
      }))
    })),
  };
});

/**
 * Atualiza detalhes completos da remessa
 */
export async function updateShippingDetails(
  orderNumber: string, 
  data: { 
    carrier: string; 
    trackingCode: string; 
    status: string;
    expectedDeliveryAt?: Date;
    notes?: string;
  }
) {
  const { tenantId } = await getTenantId();

  // Mapeamento de status da UI para o banco
  const statusMap: Record<string, any> = {
    'Em Trânsito': 'SHIPPED',
    'Entregue': 'DELIVERED',
    'Pronto p/ Coleta': 'SHIPPED', // Se editar código, assume que foi enviado
  };

  const newStatus = statusMap[data.status] || data.status;

  await prisma.order.update({
    where: {
      tenantId_number: {
        tenantId,
        number: orderNumber,
      },
    },
    data: {
      carrier: data.carrier,
      trackingCode: data.trackingCode,
      status: newStatus,
      shippedAt: newStatus === 'SHIPPED' ? new Date() : undefined,
      deliveredAt: newStatus === 'DELIVERED' ? new Date() : undefined,
      expectedDeliveryAt: data.expectedDeliveryAt,
      internalNotes: data.notes,
      items: {
        updateMany: {
          where: { 
            OR: [
              { status: 'DONE' },
              { status: 'SHIPPED' }
            ]
          },
          data: {
            status: newStatus,
            carrier: data.carrier,
            trackingCode: data.trackingCode,
          },
        },
      },
    },
  });

  revalidatePath('/producao/enviadas');
}

/**
 * Legado: Mantido para compatibilidade se necessário, mas redirecionado
 * @deprecated Use updateShippingDetails
 */
export async function updateTracking(orderId: string, carrier: string, trackingCode: string) {
  return updateShippingDetails(orderId, { 
    carrier, 
    trackingCode, 
    status: 'Em Trânsito' 
  });
}
