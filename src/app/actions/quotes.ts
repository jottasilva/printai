'use server'

import { prisma } from '@/lib/db'
import { getTenantId } from '@/lib/server-utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

/**
 * Schema de validação para criação de orçamento
 */
const QuoteItemSchema = z.object({
  productId: z.string().min(1, 'Produto obrigatório'),
  variantId: z.string().optional().nullable(),
  description: z.string().min(1, 'Descrição obrigatória'),
  quantity: z.coerce.number().min(1, 'Quantidade mínima é 1'),
  unitPrice: z.coerce.number().min(0, 'Preço deve ser positivo'),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().optional().nullable(),
})

const QuoteSchema = z.object({
  customerId: z.string().min(1, 'Cliente obrigatório'),
  validUntil: z.coerce.date(),
  notes: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  items: z.array(QuoteItemSchema).min(1, 'Adicione pelo menos 1 item'),
})

export type QuoteFormData = z.infer<typeof QuoteSchema>

/**
 * Lista todos os orçamentos do tenant com filtros
 */
export async function getQuotes(search?: string, status?: string) {
  const { tenantId } = await getTenantId()

  const where: any = {
    tenantId,
    deletedAt: null,
  }

  if (search) {
    where.OR = [
      { number: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  if (status && status !== 'ALL') {
    where.status = status
  }

  return prisma.quote.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true, document: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
        },
      },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
}

/**
 * Busca um orçamento específico com detalhes completos
 */
export async function getQuoteById(id: string) {
  const { tenantId } = await getTenantId()

  return prisma.quote.findFirst({
    where: { id, tenantId, deletedAt: null },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      user: { select: { id: true, name: true, email: true } },
    },
  })
}

/**
 * Gera o próximo número sequencial para orçamentos
 */
async function getNextQuoteNumber(tenantId: string): Promise<string> {
  const currentYear = new Date().getFullYear()

  const seq = await prisma.numberSequence.upsert({
    where: {
      tenantId_entity_year: {
        tenantId,
        entity: 'QUOTE',
        year: currentYear,
      },
    },
    update: { lastNumber: { increment: 1 } },
    create: {
      tenantId,
      entity: 'QUOTE',
      year: currentYear,
      lastNumber: 1,
    },
  })

  return `ORC-${currentYear}-${String(seq.lastNumber).padStart(4, '0')}`
}

/**
 * Cria um novo orçamento com validação completa
 */
export async function createQuote(formData: QuoteFormData) {
  const { tenantId, userId } = await getTenantId()
  const validated = QuoteSchema.parse(formData)

  const number = await getNextQuoteNumber(tenantId)

  // Calcula totais
  const itemsWithTotal = validated.items.map((item) => {
    const total = item.quantity * item.unitPrice - item.discount
    return { ...item, total }
  })

  const subtotal = itemsWithTotal.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const discountAmount = itemsWithTotal.reduce((sum, item) => sum + item.discount, 0)
  const total = subtotal - discountAmount

  const quote = await prisma.quote.create({
    data: {
      tenantId,
      customerId: validated.customerId,
      userId,
      number,
      status: 'DRAFT',
      validUntil: validated.validUntil,
      notes: validated.notes,
      internalNotes: validated.internalNotes,
      subtotal,
      discountAmount,
      taxAmount: 0,
      total,
      items: {
        create: itemsWithTotal.map((item) => ({
          tenantId,
          productId: item.productId,
          variantId: item.variantId || null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          total: item.total,
          notes: item.notes,
        })),
      },
    },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  })

  revalidatePath('/orcamentos')
  return quote
}

/**
 * Atualiza o status de um orçamento
 */
export async function updateQuoteStatus(id: string, status: string) {
  const { tenantId } = await getTenantId()

  const existing = await prisma.quote.findFirst({
    where: { id, tenantId, deletedAt: null },
  })

  if (!existing) throw new Error('Orçamento não encontrado ou acesso negado')

  const quote = await prisma.quote.update({
    where: { id },
    data: { status: status as any },
  })

  revalidatePath('/orcamentos')
  return quote
}

/**
 * Converte um orçamento em pedido
 */
export async function convertQuoteToOrder(quoteId: string) {
  const { tenantId, userId } = await getTenantId()

  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, tenantId, deletedAt: null },
    include: { items: true },
  })

  if (!quote) throw new Error('Orçamento não encontrado')
  if (quote.status === 'CONVERTED') throw new Error('Orçamento já foi convertido')

  // Gera número do pedido
  const currentYear = new Date().getFullYear()
  const orderSeq = await prisma.numberSequence.upsert({
    where: {
      tenantId_entity_year: {
        tenantId,
        entity: 'ORDER',
        year: currentYear,
      },
    },
    update: { lastNumber: { increment: 1 } },
    create: {
      tenantId,
      entity: 'ORDER',
      year: currentYear,
      lastNumber: 1,
    },
  })
  const orderNumber = `PED-${currentYear}-${String(orderSeq.lastNumber).padStart(4, '0')}`

  // Cria o pedido a partir do orçamento
  const order = await prisma.order.create({
    data: {
      tenantId,
      customerId: quote.customerId,
      userId,
      quoteId: quote.id,
      number: orderNumber,
      status: 'CONFIRMED',
      subtotal: quote.subtotal,
      discountAmount: quote.discountAmount,
      taxAmount: quote.taxAmount,
      total: quote.total,
      remainingAmount: quote.total,
      notes: quote.notes,
      internalNotes: quote.internalNotes,
      items: {
        create: quote.items.map((item) => ({
          tenantId,
          productId: item.productId,
          variantId: item.variantId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          total: item.total,
          notes: item.notes,
        })),
      },
    },
  })

  // Atualiza status do orçamento
  await prisma.quote.update({
    where: { id: quoteId },
    data: {
      status: 'CONVERTED',
      convertedToOrderId: order.id,
    },
  })

  revalidatePath('/orcamentos')
  revalidatePath('/pedidos')
  return order
}

/**
 * Soft delete de orçamento
 */
export async function deleteQuote(id: string) {
  const { tenantId } = await getTenantId()

  // Garante que o usuário só delete orçamentos do seu próprio tenant
  await prisma.quote.update({
    where: { 
      id,
      tenantId // Segurança: impede deletar de outro tenant
    },
    data: { deletedAt: new Date() },
  })

  revalidatePath('/orcamentos')
}

/**
 * Lista clientes para autocomplete
 */
export async function searchCustomers(search: string) {
  const { tenantId } = await getTenantId()

  return prisma.customer.findMany({
    where: {
      tenantId,
      deletedAt: null,
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { document: { contains: search, mode: 'insensitive' } },
      ],
    },
    select: { id: true, name: true, email: true, phone: true, document: true, documentType: true },
    take: 10,
  })
}

/**
 * Lista produtos para seleção
 */
export async function searchProducts(search: string, categoryId?: string) {
  const { tenantId } = await getTenantId()

  const where: any = {
    tenantId,
    deletedAt: null,
    isActive: true,
    isSellable: true,
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  return prisma.product.findMany({
    where,
    include: {
      category: { select: { id: true, name: true } },
      variants: { where: { isActive: true, deletedAt: null } },
    },
    take: 20,
    orderBy: { name: 'asc' },
  })
}

/**
 * Lista categorias para filtro
 */
export async function getCategories() {
  const { tenantId } = await getTenantId()

  return prisma.category.findMany({
    where: { tenantId, deletedAt: null },
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  })
}
