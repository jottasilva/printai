'use server'

import { revalidatePath } from 'next/cache'
import { withTenant } from '@/lib/server-utils'
import { serializeData } from '@/lib/utils'
import { prisma } from '@/lib/db'
import { OrderStatus, OrderPaymentStatus, ProductionStatus } from '@prisma/client'
import { LedgerService } from '@/lib/services/ledger-service'

/**
 * Busca listagem de ordens com cliente
 */
export const getOrders = withTenant(async (search?: string, status?: string) => {
  const where: any = {
    deletedAt: null
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

  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true, phone: true, document: true } },
      items: true,
      payments: true
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return serializeData(orders)
});

/**
 * Atualiza status do Pedido
 */
export const updateOrderStatus = withTenant(async (id: string, status: OrderStatus) => {
  await prisma.order.update({
    where: { id },
    data: { status }
  })

  revalidatePath('/pedidos')
  revalidatePath('/dashboard')
});

/**
 * Soft delete de pedido
 */
export const deleteOrder = withTenant(async (id: string) => {
  await prisma.order.update({
    where: { id },
    data: { deletedAt: new Date() }
  })

  revalidatePath('/pedidos')
});

/**
 * Cria um novo pedido manual
 */
export const createOrder = withTenant(async (data: any) => {
  // Gera número do pedido
  const currentYear = new Date().getFullYear()
  
  // O Prisma extension cuidará do tenantId no upsert/create/update
  const orderSeq = await prisma.numberSequence.upsert({
    where: {
      tenantId_entity_year: {
        tenantId: 'WILL_BE_REPLACED_BY_EXTENSION', // Mock para o TS, a extensão injeta o correto
        entity: 'ORDER',
        year: currentYear,
      },
    },
    update: { lastNumber: { increment: 1 } },
    create: {
      entity: 'ORDER',
      year: currentYear,
      lastNumber: 1,
    },
  })
  
  const orderNumber = `PED-${currentYear}-${String(orderSeq.lastNumber).padStart(4, '0')}`

  const order = await prisma.order.create({
    data: {
      customerId: data.customerId,
      number: orderNumber,
      status: 'CONFIRMED',
      subtotal: data.subtotal,
      total: data.total,
      remainingAmount: data.total,
      items: {
        create: data.items.map((item: any) => ({
          productId: item.productId,
          variantId: item.variantId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          status: 'PENDING',
        })),
      },
    },
  })

  revalidatePath('/pedidos')
  revalidatePath('/producao')
  return order
});

/**
 * Registra um pagamento para um pedido existente
 */
export const registerOrderPayment = withTenant(async ({
  orderId,
  amount,
  method,
  discount = 0,
  receiptBase64,
}: {
  orderId: string
  amount: number
  method: any
  discount?: number
  receiptBase64?: string
}) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true, tenant: true }
  })

  if (!order) throw new Error('Pedido não encontrado.')

  const parsedAmount = Number(amount)
  const parsedDiscount = Number(discount)

  const newDiscountAmount = Number(order.discountAmount) + parsedDiscount
  const newTotal = Number(order.subtotal) + Number(order.taxAmount) + Number(order.shippingAmount) - newDiscountAmount
  
  const newPaidAmount = Number(order.paidAmount) + parsedAmount
  const newRemainingAmount = Math.max(newTotal - newPaidAmount, 0)

  let paymentStatus: OrderPaymentStatus = 'PENDING'
  if (newRemainingAmount <= 0) {
    paymentStatus = 'PAID'
  } else if (newPaidAmount > 0) {
    paymentStatus = 'PARTIAL'
  }

  // 1. Cria o pagamento
  const payment = await prisma.payment.create({
    data: {
      orderId,
      customerId: order.customerId,
      method,
      status: 'PAID',
      amount: parsedAmount,
      netAmount: parsedAmount,
      paidAt: new Date(),
      dueDate: new Date(),
      receiptUrl: receiptBase64 || null, 
    }
  })

  // 2. Lançamento Contábil (Ledger)
  // Débito: Banco (1.1.02)
  // Crédito: Vendas de Produtos (3.1.01) ou Serviços (3.1.02) - Simplificado para Produtos aqui
  await LedgerService.postEntry({
    tenantId: order.tenantId,
    debitAccountCode: '1.1.02', // Banco
    creditAccountCode: '3.1.01', // Receita
    amount: parsedAmount,
    description: `Recebimento Ref. Pedido ${order.number}`,
    referenceEntity: 'Payment',
    referenceId: payment.id,
  });

  // 3. Atualiza os totais e o novo status de pagamento do pedido
  await prisma.order.update({
    where: { id: orderId },
    data: {
      discountAmount: newDiscountAmount,
      total: newTotal,
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      paymentStatus
    }
  })

  revalidatePath('/pedidos')
  revalidatePath('/producao')
  
  return { success: true, paymentStatus, newRemainingAmount }
});

/**
 * Atualiza notas internas do pedido
 */
export const updateOrderInternalNotes = withTenant(async (id: string, notes: string) => {
  await prisma.order.update({
    where: { id },
    data: { internalNotes: notes }
  })

  revalidatePath('/pedidos')
});

/**
 * Atualiza data prevista de entrega
 */
export const updateOrderExpectedDelivery = withTenant(async (id: string, date: Date | null) => {
  await prisma.order.update({
    where: { id },
    data: { expectedDeliveryAt: date }
  })

  revalidatePath('/pedidos')
});

