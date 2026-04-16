'use server'

import { prisma } from '@/lib/db'
import { getTenantId, safeAction } from '@/lib/server-utils'
import { serializeData } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { OrderPaymentStatus } from '@prisma/client'

// --- Schemas de Validação ---

const ItemUpdateSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  quantity: z.number().min(0.001),
  unitPrice: z.number().min(0),
  discount: z.number().default(0),
  notes: z.string().optional(),
})

const OrderFinancialsSchema = z.object({
  discountAmount: z.number().min(0),
  taxAmount: z.number().min(0),
  shippingAmount: z.number().min(0),
})

const PaymentUpdateSchema = z.object({
  id: z.string(),
  amount: z.number().min(0.01),
  method: z.string(),
  paidAt: z.string().or(z.date()),
})

// --- Funções Auxiliares de Recálculo ---

/**
 * Recalcula todos os totais financeiros de um pedido baseado nos itens e pagamentos atuais.
 * Chamada internamente após qualquer modificação estrutural.
 */
async function syncOrderFinancials(orderId: string, tenantId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId, tenantId },
    include: {
      items: true,
      payments: {
        where: { status: 'PAID' }
      }
    }
  })

  if (!order) return

  // 1. Calcular Subtotal (Soma dos itens)
  const subtotal = order.items.reduce((acc, item) => acc + Number(item.total), 0)

  // 2. Calcular Total Final
  // Total = Subtotal + Impostos + Frete - Desconto Global
  const total = subtotal + Number(order.taxAmount) + Number(order.shippingAmount) - Number(order.discountAmount)
  
  // 3. Calcular Valor Pago
  const paidAmount = order.payments.reduce((acc, p) => acc + Number(p.amount), 0)

  // 4. Calcular Restante
  const remainingAmount = Math.max(total - paidAmount, 0)

  // 5. Determinar Status de Pagamento
  let paymentStatus: OrderPaymentStatus = 'PENDING'
  if (remainingAmount <= 0 && total > 0) {
    paymentStatus = 'PAID'
  } else if (paidAmount > 0) {
    paymentStatus = 'PARTIAL'
  }

  // 6. Persistir mudanças
  await prisma.order.update({
    where: { id: orderId, tenantId },
    data: {
      subtotal,
      total,
      paidAmount,
      remainingAmount,
      paymentStatus
    }
  })
}

// --- Server Actions ---

/**
 * Atualiza um item específico do pedido
 */
export async function updateOrderItemAction(orderId: string, itemData: any) {
  return safeAction(async () => {
    const { tenantId } = await getTenantId()
    const validated = ItemUpdateSchema.parse(itemData)

    const itemTotal = (validated.quantity * validated.unitPrice) - validated.discount

    await prisma.orderItem.update({
      where: { id: validated.id, tenantId, orderId },
      data: {
        description: validated.description,
        quantity: validated.quantity,
        unitPrice: validated.unitPrice,
        discount: validated.discount,
        total: itemTotal,
        notes: validated.notes
      }
    })

    await syncOrderFinancials(orderId, tenantId)
    
    revalidatePath('/pedidos')
    revalidatePath('/producao')
    return { success: true }
  })
}

/**
 * Remove um item do pedido
 */
export async function deleteOrderItemAction(orderId: string, itemId: string) {
  return safeAction(async () => {
    const { tenantId } = await getTenantId()

    await prisma.orderItem.delete({
      where: { id: itemId, tenantId, orderId }
    })

    await syncOrderFinancials(orderId, tenantId)
    
    revalidatePath('/pedidos')
    return { success: true }
  })
}

/**
 * Adiciona um novo item a um pedido existente
 */
export async function addOrderItemAction(orderId: string, itemData: any) {
  return safeAction(async () => {
    const { tenantId } = await getTenantId()
    
    const itemTotal = (itemData.quantity * itemData.unitPrice) - (itemData.discount || 0)

    await prisma.orderItem.create({
      data: {
        tenantId,
        orderId,
        productId: itemData.productId,
        variantId: itemData.variantId,
        description: itemData.description || '',
        quantity: itemData.quantity,
        unitPrice: itemData.unitPrice,
        discount: itemData.discount || 0,
        total: itemTotal,
        status: 'PENDING'
      }
    })

    await syncOrderFinancials(orderId, tenantId)
    
    revalidatePath('/pedidos')
    return { success: true }
  })
}

/**
 * Atualiza valores financeiros globais (Desconto, Frete, Imposto)
 */
export async function updateOrderFinancialsAction(orderId: string, financials: any) {
  return safeAction(async () => {
    const { tenantId } = await getTenantId()
    const validated = OrderFinancialsSchema.parse(financials)

    await prisma.order.update({
      where: { id: orderId, tenantId },
      data: {
        discountAmount: validated.discountAmount,
        taxAmount: validated.taxAmount,
        shippingAmount: validated.shippingAmount,
      }
    })

    await syncOrderFinancials(orderId, tenantId)
    
    revalidatePath('/pedidos')
    return { success: true }
  })
}

/**
 * Atualiza um pagamento existente
 */
export async function updatePaymentAction(orderId: string, paymentData: any) {
  return safeAction(async () => {
    const { tenantId } = await getTenantId()
    const validated = PaymentUpdateSchema.parse(paymentData)

    await prisma.payment.update({
      where: { id: validated.id, tenantId, orderId },
      data: {
        amount: validated.amount,
        netAmount: validated.amount, // Simplificado
        method: validated.method,
        paidAt: new Date(validated.paidAt)
      }
    })

    await syncOrderFinancials(orderId, tenantId)
    
    revalidatePath('/pedidos')
    return { success: true }
  })
}

/**
 * Remove um pagamento
 */
export async function deletePaymentAction(orderId: string, paymentId: string) {
  return safeAction(async () => {
    const { tenantId } = await getTenantId()

    await prisma.payment.delete({
      where: { id: paymentId, tenantId, orderId }
    })

    await syncOrderFinancials(orderId, tenantId)
    
    revalidatePath('/pedidos')
    return { success: true }
  })
}

/**
 * Atualiza o método de envio (armazenado em metadata) e valores de frete
 */
export async function updateOrderShippingMethodAction(orderId: string, shippingData: { method: string, amount: number }) {
  return safeAction(async () => {
    const { tenantId } = await getTenantId()

    const order = await prisma.order.findUnique({
      where: { id: orderId, tenantId },
      select: { metadata: true }
    })

    const currentMetadata = (order?.metadata as any) || {}
    
    await prisma.order.update({
      where: { id: orderId, tenantId },
      data: {
        shippingAmount: shippingData.amount,
        metadata: {
          ...currentMetadata,
          shippingMethod: shippingData.method
        }
      }
    })

    await syncOrderFinancials(orderId, tenantId)
    
    revalidatePath('/pedidos')
    return { success: true }
  })
}

/**
 * Atualiza endereço de entrega
 */
export async function updateOrderShippingAction(orderId: string, addressData: any) {
  return safeAction(async () => {
    const { tenantId } = await getTenantId()

    // Se houver shippingAddressId, atualiza o endereço existente
    // Se não, cria um novo e vincula
    const order = await prisma.order.findUnique({
      where: { id: orderId, tenantId },
      select: { shippingAddressId: true }
    })

    if (order?.shippingAddressId) {
      await prisma.address.update({
        where: { id: order.shippingAddressId, tenantId },
        data: addressData
      })
    } else {
      const newAddress = await prisma.address.create({
        data: {
          ...addressData,
          tenantId,
          type: 'SHIPPING'
        }
      })
      await prisma.order.update({
        where: { id: orderId, tenantId },
        data: { shippingAddressId: newAddress.id }
      })
    }

    revalidatePath('/pedidos')
    return { success: true }
  })
}
