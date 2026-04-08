'use server'

import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

async function getTenantId() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tenantId: true, name: true }
  })

  if (!profile) throw new Error('Profile not found')
  return { tenantId: profile.tenantId, userName: profile.name }
}

export async function getDashboardData() {
  const { tenantId, userName } = await getTenantId()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [activeProducts, pendingOrders, inProductionCount, ordersToday, completedWeek] = await Promise.all([
    prisma.product.count({ where: { tenantId, isActive: true } }),
    prisma.order.count({ where: { tenantId, status: 'DRAFT' } }),
    prisma.orderItem.count({
      where: {
        tenantId,
        status: { in: ['QUEUED', 'IN_PROGRESS', 'PAUSED'] },
      }
    }),
    prisma.order.count({
      where: {
        tenantId,
        createdAt: { gte: today },
      }
    }),
    prisma.order.count({
      where: {
        tenantId,
        status: 'DELIVERED',
        createdAt: { gte: weekAgo },
      }
    })
  ])

  // Get recent activity
  const recentOrders = await prisma.order.findMany({
    where: { tenantId },
    take: 5,
    orderBy: { updatedAt: 'desc' },
    include: {
      customer: { select: { name: true } }
    }
  })

  const recentActivity = recentOrders.map(order => ({
    description: `Pedido ${order.number} - ${order.customer?.name || 'Cliente'} atualizado para ${order.status}`,
    createdAt: order.updatedAt,
  }))

  return {
    userName,
    stats: {
      activeProducts,
      pendingOrders,
      inProduction: inProductionCount,
      ordersToday,
      completedWeek,
    },
    recentActivity,
  }
}
