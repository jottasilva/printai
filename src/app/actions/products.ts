'use server'

import { prisma } from '@/lib/db'
import { getTenantId, safeAction } from '@/lib/server-utils'
import { serializeData } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Schema de validação para criação de produto
const ProductSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  sku: z.string().min(2, 'SKU obrigatório'),
  description: z.string().optional(),
  type: z.enum(['SIMPLE', 'VARIABLE', 'SERVICE', 'BUNDLE']).default('SIMPLE'),
  categoryId: z.string().optional(),
  basePrice: z.coerce.number().min(0, 'Preço deve ser positivo'),
  costPrice: z.coerce.number().min(0, 'Preço de custo deve ser positivo').optional(),
  minStock: z.coerce.number().min(0).optional(),
  unit: z.string().default('un'),
  production_time: z.string().optional(),
  substrate: z.string().optional(),
  is_featured: z.boolean().default(false),
  priceTiers: z.array(z.object({
    min_quantity: z.coerce.number().min(1),
    unit_price: z.coerce.number().min(0),
    label: z.string().optional(),
  })).optional(),
  finishes: z.array(z.object({
    name: z.string(),
    cost_modifier: z.coerce.number().default(0),
  })).optional(),
  variants: z.array(z.object({
    name: z.string(),
    sku: z.string(),
    attributes: z.record(z.string()).optional(),
    price: z.coerce.number().min(0),
  })).optional(),
})

export type ProductFormData = z.infer<typeof ProductSchema>

/**
 * Lista todos os produtos do tenant
 */
export async function getProducts(search?: string, category?: string, providedTenantId?: string) {
  let tenantId = providedTenantId;

  if (!tenantId) {
    const auth = await getTenantId();
    tenantId = auth.tenantId;
  }

  const where: any = {
    tenantId,
    deletedAt: null
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (category) {
    where.categoryId = category
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      variants: true,
      category: true,
      inventory: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100, // Limite para performance
  })

  return serializeData(products)
}

/**
 * Cria um novo produto com validação completa
 */
export async function createProduct(formData: ProductFormData) {
  const { tenantId } = await getTenantId()

  const validated = ProductSchema.parse(formData)

  const product = await prisma.product.create({
    data: {
      tenantId,
      name: validated.name,
      sku: validated.sku,
      description: validated.description,
      type: validated.type,
      categoryId: validated.categoryId,
      basePrice: validated.basePrice,
      costPrice: validated.costPrice || 0,
      unit: validated.unit,
      production_time: validated.production_time,
      substrate: validated.substrate,
      is_featured: validated.is_featured,
      product_price_tiers: validated.priceTiers ? {
        create: validated.priceTiers.map(t => ({
          tenant_id: tenantId,
          min_quantity: t.min_quantity,
          unit_price: t.unit_price,
          label: t.label,
        }))
      } : undefined,
      product_finishes: validated.finishes ? {
        create: validated.finishes.map(f => ({
          tenant_id: tenantId,
          name: f.name,
          cost_modifier: f.cost_modifier,
        }))
      } : undefined,
      variants: validated.variants ? {
        create: validated.variants.map(v => ({
          tenantId,
          name: v.name,
          sku: v.sku,
          attributes: v.attributes || {},
          price: v.price,
        }))
      } : undefined,
    },
    include: {
      variants: true,
      category: true,
    }
  })

  // Inicializa estoque se quantidade mínima definida
  if (validated.minStock && validated.minStock > 0) {
    await prisma.inventory.create({
      data: {
        tenantId,
        productId: product.id,
        quantity: validated.minStock,
        minQuantity: validated.minStock,
        availableQuantity: validated.minStock,
      }
    })
  }

  revalidatePath('/produtos')
  return product
}

/**
 * Atualiza um produto existente
 */
export async function updateProduct(id: string, formData: ProductFormData) {
  const { tenantId } = await getTenantId()
  const validated = ProductSchema.parse(formData)

  const existing = await prisma.product.findFirst({
    where: { id, tenantId, deletedAt: null }
  })

  if (!existing) {
    throw new Error('Product not found')
  }

  const product = await prisma.product.update({
    where: { id, tenantId },
    data: {
      name: validated.name,
      sku: validated.sku,
      description: validated.description,
      type: validated.type,
      categoryId: validated.categoryId,
      basePrice: validated.basePrice,
      costPrice: validated.costPrice || 0,
      unit: validated.unit,
      production_time: validated.production_time,
      substrate: validated.substrate,
      is_featured: validated.is_featured,
      // Nota: Para simplificar, estamos substituindo os tiers e acabamentos
      product_price_tiers: validated.priceTiers ? {
        deleteMany: {},
        create: validated.priceTiers.map(t => ({
          tenant_id: tenantId,
          min_quantity: t.min_quantity,
          unit_price: t.unit_price,
          label: t.label,
        }))
      } : undefined,
      product_finishes: validated.finishes ? {
        deleteMany: {},
        create: validated.finishes.map(f => ({
          tenant_id: tenantId,
          name: f.name,
          cost_modifier: f.cost_modifier,
        }))
      } : undefined,
    },
    include: {
      variants: true,
      category: true,
    }
  })

  revalidatePath('/produtos')
  return product
}

/**
 * Soft delete de produto
 */
export async function deleteProduct(id: string) {
  const { tenantId } = await getTenantId()

  await prisma.product.update({
    where: { id, tenantId },
    data: { deletedAt: new Date() }
  })

  revalidatePath('/produtos')
}

/**
 * Busca um produto especfico com detalhes completos
 */
export async function getProductById(id: string) {
  const { tenantId } = await getTenantId()

  return prisma.product.findFirst({
    where: { id, tenantId, deletedAt: null },
    include: {
      variants: true,
      category: true,
      inventory: true,
      quoteItems: true,
      orderItems: true,
      product_price_tiers: true,
      product_finishes: true,
      product_media: true,
      product_unit_conversions: true,
    }
  })
}

/**
 * Busca todas as categorias do tenant
 */
export async function getCategories() {
  const { tenantId } = await getTenantId()
  
  const categories = await prisma.category.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' }
  })
  
  return serializeData(categories)
}
