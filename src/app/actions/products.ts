'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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

export async function getProducts() {
  const tenantId = await getTenantId()
  
  return prisma.product.findMany({
    where: { 
      tenantId,
      deletedAt: null
    },
    include: {
      variants: true,
      category: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createProduct(formData: any) {
  const tenantId = await getTenantId()
  
  const product = await prisma.product.create({
    data: {
      tenantId,
      name: formData.name,
      sku: formData.sku,
      description: formData.description,
      type: formData.type || 'SIMPLE',
      categoryId: formData.categoryId,
      basePrice: formData.basePrice || 0,
      costPrice: formData.costPrice || 0,
      variants: {
        create: formData.variants || []
      }
    }
  })

  revalidatePath('/produtos')
  return product
}

export async function deleteProduct(id: string) {
  const tenantId = await getTenantId()

  await prisma.product.update({
    where: { id, tenantId },
    data: { deletedAt: new Date() }
  })

  revalidatePath('/produtos')
}
