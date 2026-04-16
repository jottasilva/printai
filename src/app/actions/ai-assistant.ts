'use server'

import { prisma } from '@/lib/db'
import { getTenantId } from '@/lib/server-utils'
import { revalidatePath } from 'next/cache'
import { MessageRole, ConversationStatus, ConversationChannel } from '@prisma/client'

// ──────────────────────────────────────────────
// CONVERSAS
// ──────────────────────────────────────────────

/**
 * Busca histórico de conversas com customer e última mensagem
 */
export async function getConversations() {
  const { tenantId } = await getTenantId()

  return prisma.conversation.findMany({
    where: { tenantId },
    include: {
      customer: { select: { id: true, name: true, phone: true, email: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true, createdAt: true, role: true },
      },
    },
    orderBy: { lastMessageAt: 'desc' },
  })
}

/**
 * Busca mensagens de uma conversa específica
 */
export async function getMessages(conversationId: string) {
  const { tenantId } = await getTenantId()

  return prisma.message.findMany({
    where: { 
      conversationId,
      tenantId 
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
      isAiGenerated: true,
      contentType: true,
      modelUsed: true,
    },
  })
}

/**
 * Cria uma nova conversa (opcionalmente vinculada a um cliente)
 */
export async function createConversation(channel: ConversationChannel = 'CHAT', customerId?: string) {
  const { tenantId } = await getTenantId()

  const conversation = await prisma.conversation.create({
    data: {
      tenantId,
      customerId: customerId || undefined,
      channel,
      status: 'OPEN',
      aiEnabled: true,
    },
    include: {
      customer: { select: { id: true, name: true, phone: true, email: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true, createdAt: true, role: true },
      },
    },
  })

  revalidatePath('/conversas')
  return conversation
}

/**
 * Envia uma mensagem e gera resposta da IA
 */
export async function sendMessage(conversationId: string, content: string) {
  const { tenantId, userId } = await getTenantId()

  // 1. Salva mensagem do usuário
  const userMessage = await prisma.message.create({
    data: {
      tenantId,
      conversationId,
      role: MessageRole.USER,
      content,
      userId,
    },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
      isAiGenerated: true,
    },
  })

  // 2. Atualiza timestamp da conversa e status
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { 
      lastMessageAt: new Date(),
      status: 'IN_PROGRESS',
    }
  })

  // 3. Gera resposta da IA contextualizada
  let aiContent = "Olá! Como posso ajudar com sua produção hoje?"
  
  const lowerContent = content.toLowerCase()
  
  if (lowerContent.includes("status") || lowerContent.includes("pedido")) {
    aiContent = "📋 Analisando o fluxo de produção de hoje: Temos 12 jobs concluídos e 8 em produção ativa. Notei um atraso crítico no Pedido #4492 aguardando tinta Cyan. Deseja que eu priorize algum pedido específico?"
  } else if (lowerContent.includes("estoque") || lowerContent.includes("papel")) {
    aiContent = "📦 Nosso estoque de papel couchê está em 65%. Temos 15 resmas disponíveis, o que deve durar mais 4 dias com base na média de consumo diário. Recomendo solicitar reposição ao fornecedor."
  } else if (lowerContent.includes("cartão") || lowerContent.includes("visita")) {
    aiContent = "💳 Cartões de Visita disponíveis:\n• Couchê 300g 4x4 (500un): R$ 145,00\n• Couchê 300g + Verniz (500un): R$ 175,00\n• Triplex 350g 4x0 (500un): R$ 120,00\n\nDeseja adicionar algum ao carrinho?"
  } else if (lowerContent.includes("banner") || lowerContent.includes("roll")) {
    aiContent = "🎨 Banners Roll-Up:\n• Lona 440g 80x200cm: R$ 120,00\n• Lona 440g 100x200cm: R$ 155,00\n• Lona Premium 120x200cm: R$ 195,00\n\nTodos incluem estrutura de alumínio. Posso adicionar ao carrinho?"
  } else if (lowerContent.includes("preço") || lowerContent.includes("valor") || lowerContent.includes("quanto")) {
    aiContent = "💰 Para calcular o melhor preço, preciso saber:\n1. Qual produto deseja?\n2. Quantidade necessária\n3. Tipo de acabamento\n\nOu posso enviar nosso catálogo completo com tabela de preços."
  } else if (lowerContent.includes("olá") || lowerContent.includes("oi") || lowerContent.includes("bom dia") || lowerContent.includes("boa tarde")) {
    aiContent = "👋 Olá! Bem-vindo ao sistema Atelier AI. Estou pronto para ajudá-lo com:\n\n• 📋 Status de pedidos e produção\n• 📦 Consulta de estoque\n• 🛒 Montagem de orçamentos\n• 💳 Catálogo de produtos\n\nComo posso ajudá-lo?"
  } else if (lowerContent.includes("obrigado") || lowerContent.includes("valeu")) {
    aiContent = "😊 Fico feliz em ajudar! Se precisar de mais alguma coisa, é só chamar. Bom trabalho!"
  }

  const aiMessage = await prisma.message.create({
    data: {
      tenantId,
      conversationId,
      role: MessageRole.ASSISTANT,
      content: aiContent,
      isAiGenerated: true,
      modelUsed: 'Atelier AI v1.0',
    },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
      isAiGenerated: true,
    },
  })

  revalidatePath('/conversas')
  return { userMessage, aiMessage }
}

// ──────────────────────────────────────────────
// CLIENTES (para vinculação à conversa)
// ──────────────────────────────────────────────

/**
 * Busca clientes do tenant para seleção no chat
 */
export async function getCustomersForChat(search?: string) {
  const { tenantId } = await getTenantId()

  const where: Record<string, unknown> = {
    tenantId,
    deletedAt: null,
  }

  if (search && search.trim()) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ]
  }

  return prisma.customer.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      type: true,
      companyName: true,
    },
    orderBy: { name: 'asc' },
    take: 20,
  })
}

/**
 * Vincula um cliente a uma conversa existente
 */
export async function linkCustomerToConversation(conversationId: string, customerId: string) {
  const { tenantId } = await getTenantId()

  const updated = await prisma.conversation.update({
    where: { id: conversationId, tenantId },
    data: { customerId },
    include: {
      customer: { select: { id: true, name: true, phone: true, email: true } },
    },
  })

  revalidatePath('/conversas')
  return updated
}

/**
 * Atualiza o status de uma conversa
 */
export async function updateConversationStatus(conversationId: string, status: ConversationStatus) {
  const { tenantId } = await getTenantId()

  await prisma.conversation.update({
    where: { id: conversationId, tenantId },
    data: { status },
  })

  revalidatePath('/conversas')
}

// ──────────────────────────────────────────────
// PRODUTOS (para catálogo no chat)
// ──────────────────────────────────────────────

/**
 * Busca produtos para exibição no catálogo do chat
 */
export async function getProductsForCatalog(search?: string) {
  const { tenantId } = await getTenantId()

  const where: Record<string, unknown> = {
    tenantId,
    isActive: true,
    isSellable: true,
    deletedAt: null,
  }

  if (search && search.trim()) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  return prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      sku: true,
      description: true,
      basePrice: true,
      type: true,
      unit: true,
      thumbnailUrl: true,
      category: { select: { name: true } },
      variants: {
        where: { isActive: true, deletedAt: null },
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          attributes: true,
        },
      },
    },
    orderBy: { name: 'asc' },
    take: 50,
  })
}

// ──────────────────────────────────────────────
// PEDIDOS (formalização a partir do carrinho)
// ──────────────────────────────────────────────

interface CartItem {
  productId: string
  variantId?: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

/**
 * Cria um pedido a partir do carrinho do chat
 */
export async function createOrderFromCart(customerId: string, items: CartItem[]) {
  const { tenantId, userId } = await getTenantId()

  if (!customerId) {
    throw new Error('Cliente não vinculado à conversa')
  }

  if (!items || items.length === 0) {
    throw new Error('Carrinho vazio - adicione itens antes de formalizar')
  }

  // Gera número sequencial do pedido
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
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)

  const order = await prisma.order.create({
    data: {
      tenantId,
      customerId,
      userId,
      number: orderNumber,
      status: 'CONFIRMED',
      subtotal,
      total: subtotal,
      remainingAmount: subtotal,
      items: {
        create: items.map((item: CartItem) => ({
          tenantId,
          productId: item.productId,
          variantId: item.variantId || undefined,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          status: 'PENDING',
        })),
      },
    },
    include: {
      items: true,
      customer: { select: { name: true } },
    },
  })

  revalidatePath('/pedidos')
  revalidatePath('/producao')
  revalidatePath('/conversas')

  return order
}
