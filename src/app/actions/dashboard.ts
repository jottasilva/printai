'use server'

import { prisma } from '@/lib/db'
import { withTenant } from '@/lib/server-utils'
import { LedgerService } from '@/lib/services/ledger-service'

/**
 * Obtem dados completos do dashboard
 */
export const getDashboardData = withTenant(async () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  // Stats principais & Financeiro (Ledger)
  const [
    activeProducts, 
    pendingOrders, 
    inProductionCount, 
    ordersThisMonth, 
    completedWeek, 
    totalCustomers,
    // Novos saldos do Ledger (A API agora pega o tenantId do contexto se omitido)
    cashBalance,      // 1.1.01
    bankBalance,      // 1.1.02
    revenueBalance,   // 3.1.01
    receivableBalance // 1.2.01
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true, deletedAt: null } }),
    prisma.order.count({ where: { status: 'DRAFT' } }),
    prisma.orderItem.count({
      where: {
        status: { in: ['PENDING', 'QUEUED', 'IN_PROGRESS', 'PAUSED'] },
      }
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: monthStart },
      }
    }),
    prisma.order.count({
      where: {
        status: 'DELIVERED',
        updatedAt: { gte: weekAgo },
      }
    }),
    prisma.customer.count({}),
    LedgerService.getBalance('1.1.01'),
    LedgerService.getBalance('1.1.02'),
    LedgerService.getBalance('3.1.01'),
    LedgerService.getBalance('1.2.01'),
  ])

  // Pedidos por status
  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    _count: { status: true }
  })

  // Produo por status
  const productionByStatus = await prisma.orderItem.groupBy({
    by: ['status'],
    _count: { status: true }
  })

  // Top produtos
  const topProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  })

  const topProductDetails = await Promise.all(
    topProducts
      .filter(item => item.productId)
      .map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId! },
          select: { name: true, sku: true }
        })
        return {
          product: product?.name || 'Produto removido',
          sku: product?.sku || '-',
          quantity: Number(item._sum.quantity || 0)
        }
      })
  )

  // Pedidos recentes
  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { updatedAt: 'desc' },
    include: {
      customer: { select: { name: true, email: true } }
    }
  })

  const recentActivity = recentOrders.map(order => ({
    description: `Pedido ${order.number} - ${order.customer?.name || 'Cliente'} atualizado`,
    createdAt: order.updatedAt,
  }))

  return {
    stats: {
      activeProducts,
      pendingOrders,
      inProduction: inProductionCount,
      ordersThisMonth,
      completedWeek,
      totalCustomers,
      // Valores precisos do Ledger
      availableCash: Number(cashBalance) + Number(bankBalance),
      totalRevenue: Math.abs(Number(revenueBalance)), // Receita é credora no ledger
      pendingReceivables: Number(receivableBalance),
      pendingPayables: 0,
    },
    ordersByStatus: ordersByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>),
    productionByStatus: productionByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>),
    topProducts: topProductDetails,
    recentOrders,
    recentActivity,
  }
});
