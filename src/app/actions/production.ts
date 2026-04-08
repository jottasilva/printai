'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { OrderItemStatus } from '@prisma/client'

async function getTenantId() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tenantId: true }
  })

  if (!profile) throw new Error('Profile not found')
  return profile.tenantId
}

export async function getProductionItems() {
  const tenantId = await getTenantId()
  
  return prisma.orderItem.findMany({
    where: { 
      tenantId,
      status: {
        notIn: ['CANCELED', 'REJECTED']
      }
    },
    include: {
      product: true,
      variant: true,
      order: {
        include: {
          customer: true
        }
      }
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'asc' }
    ]
  })
}

export async function updateProductionStatus(id: string, status: OrderItemStatus) {
  const tenantId = await getTenantId()

  const data: any = { status }

  if (status === 'IN_PROGRESS') {
    data.startedAt = new Date()
  } else if (status === 'DONE') {
    data.finishedAt = new Date()
  }

  await prisma.orderItem.update({
    where: { id, tenantId },
    data
  })

  revalidatePath('/producao')
  revalidatePath('/')
}

export async function updateItemNote(id: string, note: string) {
  const tenantId = await getTenantId()

  await prisma.orderItem.update({
    where: { id, tenantId },
    data: { productionNotes: note }
  })

  revalidatePath('/producao')
}
