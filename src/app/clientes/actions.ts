'use server'

import { prisma } from '@/lib/db'
import { getTenantId, safeAction, checkPermission } from '@/lib/server-utils'
import { revalidatePath } from 'next/cache'

export async function createCustomer(data: { name: string; email?: string; phone?: string; companyName?: string; document?: string; type: 'INDIVIDUAL' | 'COMPANY' }) {
  return safeAction(async () => {
    const { tenantId, userRole } = await getTenantId()
    if (!await checkPermission(userRole)) throw new Error('Acesso negado')

    if (!data.name || data.name.trim().length === 0) {
      throw new Error('O nome do cliente é obrigatório')
    }

    const customer = await prisma.customer.create({
      data: {
        tenantId,
        name: data.name,
        email: data.email || '',
        phone: data.phone,
        companyName: data.companyName,
        document: data.document || '',
        documentType: data.type === 'COMPANY' ? 'CNPJ' : 'CPF',
        type: data.type,
      }
    })

    revalidatePath('/clientes')
    return customer
  })
}

export async function updateCustomer(id: string, data: { name?: string; email?: string; phone?: string; companyName?: string; document?: string; type?: 'INDIVIDUAL' | 'COMPANY' }) {
  return safeAction(async () => {
    const { tenantId, userRole } = await getTenantId()
    if (!await checkPermission(userRole)) throw new Error('Acesso negado')

    // Verify if customer belongs to tenant
    const existing = await prisma.customer.findFirst({ where: { id, tenantId } })
    if (!existing) throw new Error('Cliente não encontrado')

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.companyName && { companyName: data.companyName }),
        ...(data.document && { document: data.document }),
        ...(data.type && { type: data.type }),
      }
    })

    revalidatePath('/clientes')
    return customer
  })
}

export async function deleteCustomer(id: string) {
  return safeAction(async () => {
    const { tenantId, userRole } = await getTenantId()
    if (!await checkPermission(userRole)) throw new Error('Acesso negado')

    const existing = await prisma.customer.findFirst({ where: { id, tenantId } })
    if (!existing) throw new Error('Cliente não encontrado')

    // Soft delete
    await prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    revalidatePath('/clientes')
    return true
  })
}

export async function getCustomersAction(search?: string, type?: string, pageParam?: string) {
  const { tenantId } = await getTenantId()

  const where: any = {
    tenantId,
    deletedAt: null,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { companyName: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (type && type !== 'ALL') {
    where.type = type === 'COMPANY' ? 'COMPANY' : 'INDIVIDUAL';
  }

  const page = Math.max(1, parseInt(pageParam || '1', 10));
  const take = 10;
  const skip = (page - 1) * take;

  const totalCount = await prisma.customer.count({ where });

  const customers = await prisma.customer.findMany({
    where,
    include: {
      orders: {
        where: { deletedAt: null },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { orders: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take,
    skip,
  });

  const data = customers.map(customer => {
    const totalSpent = customer.orders.reduce((acc: number, order: any) => acc + Number(order.total), 0);
    const lastOrder = customer.orders[0]?.createdAt || null;
    
    return {
      ...customer,
      totalSpent,
      lastOrder,
      orderCount: customer._count.orders,
    };
  });

  const stats = {
    totalActive: await prisma.customer.count({
      where: { tenantId, deletedAt: null }
    }),
  };

  return {
    data: JSON.parse(JSON.stringify(data)),
    stats,
    pagination: {
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / take),
      take
    }
  };
}
