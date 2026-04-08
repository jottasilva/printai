# Você é um arquiteto de banco de dados sênior, especialista em PostgreSQL, 

# Prisma ORM e sistemas SaaS multi-tenant de alto volume.

# 

# Gere um schema Prisma COMPLETO, production-ready, para o sistema 

# PrintAI ERP — um SaaS B2B para gráficas e empresas de impressão.

# 

# ═══════════════════════════════════════════

# REGRAS GLOBAIS OBRIGATÓRIAS

# ═══════════════════════════════════════════

# 

# 1\. MULTI-TENANCY

# &#x20;  - Toda entidade (sem exceção) deve ter: tenantId String

# &#x20;  - Índice composto obrigatório: \[tenantId, id] em toda tabela

# &#x20;  - Nunca omitir tenantId, nem em tabelas de log ou auxiliares

# 

# 2\. PRIMARY KEYS

# &#x20;  - Sempre UUID: id String @id @default(uuid())

# &#x20;  - Nunca usar Int autoincrement como PK principal

# 

# 3\. TIMESTAMPS

# &#x20;  - createdAt DateTime @default(now())

# &#x20;  - updatedAt DateTime @updatedAt

# &#x20;  - deletedAt DateTime? (soft delete onde especificado)

# 

# 4\. EXTENSIBILIDADE

# &#x20;  - Adicionar campo metadata Json? em entidades principais

# &#x20;    (Tenant, User, Customer, Order, Product, Payment)

# &#x20;  - Permite armazenar dados extras sem migration

# 

# 5\. ÍNDICES

# &#x20;  - Índice composto \[tenantId + campo crítico] em toda tabela

# &#x20;  - Índice GIN para campos de busca full-text (name, description)

# &#x20;  - Índice único composto onde há unicidade por tenant

# &#x20;  - Índices em todas as foreign keys

# 

# 6\. ENUMS VERSIONADOS

# &#x20;  - Todos os enums devem ser explícitos e documentados com comentário

# &#x20;  - Evitar enums que não possam crescer sem migration complexa

# 

# ═══════════════════════════════════════════

# ENTIDADES OBRIGATÓRIAS (com regras específicas)

# ═══════════════════════════════════════════

# 

# ── TENANT \& USERS ──────────────────────────

# 

# Tenant

# &#x20; - Campos: name, slug (único global), plan (enum), status

# &#x20; - Campos: maxUsers, maxStorage, trialEndsAt, suspendedAt

# &#x20; - Campo: settings Json? (configurações white-label por tenant)

# &#x20; - Campo: metadata Json?

# &#x20; - Soft delete: SIM

# 

# Plan (enum): FREE | STARTER | PROFESSIONAL | ENTERPRISE

# TenantStatus (enum): ACTIVE | SUSPENDED | TRIAL | CANCELED

# 

# User

# &#x20; - Campos: email (único por tenant), name, phone, avatarUrl

# &#x20; - Campos: role (enum), permissions String\[] (granular além do role)

# &#x20; - Campos: lastLoginAt, emailVerifiedAt, twoFactorEnabled

# &#x20; - Campos: refreshToken String? (hashed), refreshTokenExpiresAt

# &#x20; - Campo: metadata Json?

# &#x20; - Soft delete: SIM

# &#x20; - Índice único: \[tenantId, email]

# 

# UserRole (enum): OWNER | ADMIN | MANAGER | OPERATOR | VIEWER

# 

# ── CLIENTES ────────────────────────────────

# 

# Customer

# &#x20; - Campos: name, email, phone, document (CPF/CNPJ), documentType

# &#x20; - Campos: type (PERSON | COMPANY), companyName, tradingName

# &#x20; - Campos: creditLimit Decimal, creditUsed Decimal

# &#x20; - Campo: metadata Json?

# &#x20; - Soft delete: SIM

# &#x20; - Índice: \[tenantId, document]

# &#x20; - Índice: \[tenantId, email]

# 

# DocumentType (enum): CPF | CNPJ

# 

# Address

# &#x20; - Campos: street, number, complement, district, city, state, zipCode, country

# &#x20; - Campos: type (enum: BILLING | SHIPPING | BOTH)

# &#x20; - Relação polimórfica: customerId (opcional), supplierId (opcional)

# &#x20; - Índice: \[tenantId, customerId]

# 

# ── PRODUTOS \& CATEGORIAS ───────────────────

# 

# Category

# &#x20; - Campos: name, slug, description, parentId (self-relation para hierarquia)

# &#x20; - Campo: position Int (ordenação)

# &#x20; - Soft delete: SIM

# &#x20; - Índice único: \[tenantId, slug]

# 

# Product

# &#x20; - Campos: name, sku (único por tenant), description, unit

# &#x20; - Campos: type (enum: SIMPLE | VARIABLE | SERVICE | BUNDLE)

# &#x20; - Campos: basePrice Decimal, costPrice Decimal

# &#x20; - Campos: isActive Boolean, isSellable Boolean, isPurchasable Boolean

# &#x20; - Campos: categoryId, thumbnailUrl, images String\[]

# &#x20; - Campo: metadata Json?

# &#x20; - Campo: searchVector String? (para full-text search)

# &#x20; - Soft delete: SIM

# &#x20; - Índice único: \[tenantId, sku]

# &#x20; - Índice GIN: searchVector

# 

# ProductType (enum): SIMPLE | VARIABLE | SERVICE | BUNDLE

# 

# ProductVariant

# &#x20; - Campos: productId, sku (único por tenant), name

# &#x20; - Campos: attributes Json (ex: { cor: "azul", tamanho: "A4" })

# &#x20; - Campos: price Decimal, costPrice Decimal

# &#x20; - Campos: isActive Boolean

# &#x20; - Soft delete: SIM

# &#x20; - Índice único: \[tenantId, sku]

# 

# ── ESTOQUE \& FORNECEDORES ──────────────────

# 

# Inventory

# &#x20; - Campos: productId, variantId (opcional), warehouseId (opcional)

# &#x20; - Campos: quantity Decimal, reservedQuantity Decimal, availableQuantity Decimal

# &#x20; - Campos: minQuantity Decimal, maxQuantity Decimal

# &#x20; - Campo: lastCountAt DateTime?

# &#x20; - IMPORTANTE: availableQuantity = quantity - reservedQuantity (calculado)

# &#x20; - Índice único: \[tenantId, productId, variantId]

# 

# InventoryMovement (entidade NOVA — rastreabilidade)

# &#x20; - Campos: inventoryId, type (enum), quantity Decimal, balanceBefore, balanceAfter

# &#x20; - Campos: reason String, referenceType String?, referenceId String?

# &#x20; - Campos: userId (quem fez), createdAt

# &#x20; - SEM soft delete (imutável por auditoria)

# 

# MovementType (enum): IN | OUT | RESERVE | RELEASE | ADJUSTMENT | LOSS

# 

# Supplier

# &#x20; - Campos: name, document, documentType, email, phone

# &#x20; - Campos: contactName, paymentTerms Int (dias), isActive

# &#x20; - Campo: metadata Json?

# &#x20; - Soft delete: SIM

# 

# SupplierProduct

# &#x20; - Campos: supplierId, productId, supplierSku, supplierName

# &#x20; - Campos: price Decimal, minQuantity Decimal, leadTimeDays Int

# &#x20; - Campos: isPreferred Boolean

# &#x20; - Índice único: \[tenantId, supplierId, productId]

# 

# ── ORÇAMENTOS ──────────────────────────────

# 

# Quote

# &#x20; - Campos: tenantId, customerId, userId (vendedor)

# &#x20; - Campos: number String (único por tenant, sequencial), status (enum)

# &#x20; - Campos: validUntil DateTime, notes String?, internalNotes String?

# &#x20; - Campos: subtotal Decimal, discountAmount Decimal, taxAmount Decimal, total Decimal

# &#x20; - Campos: convertedToOrderId String? (rastrear conversão)

# &#x20; - Campo: metadata Json?

# &#x20; - Soft delete: SIM

# &#x20; - Índice único: \[tenantId, number]

# 

# QuoteStatus (enum): DRAFT | SENT | VIEWED | ACCEPTED | REJECTED | EXPIRED | CONVERTED

# 

# QuoteItem

# &#x20; - Campos: quoteId, productId, variantId (opcional)

# &#x20; - Campos: description String (snapshot do nome)

# &#x20; - Campos: quantity Decimal, unitPrice Decimal, discount Decimal, total Decimal

# &#x20; - Campos: notes String?

# &#x20; - SEM soft delete (deletar com a quote)

# 

# ── PEDIDOS ─────────────────────────────────

# 

# Order

# &#x20; - Campos: tenantId, customerId, userId (atendente), quoteId (opcional)

# &#x20; - Campos: number String (único por tenant, sequencial, ex: "ORD-2024-0001")

# &#x20; - Campos: status (enum), paymentStatus (enum), productionStatus (enum)

# &#x20; - Campos: shippingAddressId, billingAddressId

# &#x20; - Campos: subtotal Decimal, discountAmount Decimal, taxAmount Decimal

# &#x20; - Campos: shippingAmount Decimal, total Decimal

# &#x20; - Campos: paidAmount Decimal, remainingAmount Decimal

# &#x20; - Campos: notes String?, internalNotes String?, cancelReason String?

# &#x20; - Campos: expectedDeliveryAt DateTime?, deliveredAt DateTime?, canceledAt DateTime?

# &#x20; - Campo: metadata Json?

# &#x20; - Soft delete: SIM

# &#x20; - Índice: \[tenantId, status]

# &#x20; - Índice: \[tenantId, customerId]

# &#x20; - Índice único: \[tenantId, number]

# 

# OrderStatus (enum): DRAFT | CONFIRMED | IN\_PRODUCTION | READY | SHIPPED | DELIVERED | CANCELED | REFUNDED

# PaymentStatus (enum): PENDING | PARTIAL | PAID | OVERDUE | REFUNDED | CANCELED

# ProductionStatus (enum): WAITING | IN\_QUEUE | IN\_PROGRESS | PAUSED | DONE | REJECTED

# 

# OrderItem

# &#x20; - Campos: orderId, productId, variantId (opcional)

# &#x20; - Campos: description String (snapshot — nunca referenciar direto)

# &#x20; - Campos: quantity Decimal, unitPrice Decimal (CONGELADO no momento da compra)

# &#x20; - Campos: discount Decimal, total Decimal

# &#x20; - Campos: status (enum independente do pedido)

# &#x20; - Campos: position Int (ordenação no kanban)

# &#x20; - Campos: priority (enum)

# &#x20; - SLA: dueDate DateTime?, startedAt DateTime?, finishedAt DateTime?, pausedAt DateTime?

# &#x20; - Campos: assignedUserId String? (responsável na produção)

# &#x20; - Campos: notes String?, productionNotes String?

# &#x20; - Campo: slaBreached Boolean @default(false)

# &#x20; - Índice: \[tenantId, orderId]

# &#x20; - Índice: \[tenantId, status]

# &#x20; - Índice: \[tenantId, assignedUserId]

# &#x20; - SEM soft delete (item de pedido é imutável historicamente)

# 

# OrderItemStatus (enum): PENDING | QUEUED | IN\_PROGRESS | PAUSED | DONE | CANCELED | REJECTED

# ItemPriority (enum): LOW | NORMAL | HIGH | URGENT

# 

# OrderItemLog (rastreabilidade kanban)

# &#x20; - Campos: orderItemId, userId, fromStatus, toStatus

# &#x20; - Campos: fromPosition Int?, toPosition Int?

# &#x20; - Campos: note String?, duration Int? (minutos no status anterior)

# &#x20; - Campos: createdAt

# &#x20; - SEM soft delete, SEM updatedAt (imutável)

# &#x20; - Índice: \[tenantId, orderItemId]

# 

# ── FINANCEIRO ───────────────────────────────

# 

# Payment

# &#x20; - Campos: tenantId, orderId, customerId

# &#x20; - Campos: method (enum), status (enum)

# &#x20; - Campos: amount Decimal, feeAmount Decimal (taxa do gateway), netAmount Decimal

# &#x20; - Campos: externalId String? (ID no gateway: Stripe, MP, etc.)

# &#x20; - Campos: externalStatus String? (status raw do gateway)

# &#x20; - Campos: gatewayResponse Json? (payload completo do webhook)

# &#x20; - Campos: paidAt DateTime?, refundedAt DateTime?, canceledAt DateTime?

# &#x20; - Campos: dueDate DateTime? (para boleto/pix)

# &#x20; - Campos: pixCode String?, barcodeUrl String?, receiptUrl String?

# &#x20; - Campo: metadata Json?

# &#x20; - SEM soft delete (financeiro é imutável)

# &#x20; - Índice: \[tenantId, orderId]

# &#x20; - Índice: \[tenantId, externalId] (busca por webhook)

# &#x20; - Índice: \[tenantId, status]

# 

# PaymentMethod (enum): CASH | PIX | CREDIT\_CARD | DEBIT\_CARD | BANK\_TRANSFER | BOLETO | CHECK | OTHER

# PaymentStatus (enum — separado do OrderPaymentStatus): 

# &#x20; PENDING | PROCESSING | PAID | FAILED | CANCELED | REFUNDED | CHARGEBACK

# 

# Receivable

# &#x20; - Campos: tenantId, customerId, orderId (opcional), paymentId (opcional)

# &#x20; - Campos: description String, amount Decimal, paidAmount Decimal

# &#x20; - Campos: dueDate DateTime, paidAt DateTime?, status (enum)

# &#x20; - Campos: installmentNumber Int?, totalInstallments Int?

# &#x20; - Índice: \[tenantId, dueDate]

# &#x20; - Índice: \[tenantId, customerId]

# 

# Payable

# &#x20; - Campos: tenantId, supplierId (opcional), description String

# &#x20; - Campos: amount Decimal, paidAmount Decimal

# &#x20; - Campos: dueDate DateTime, paidAt DateTime?, status (enum)

# &#x20; - Campos: category String?, costCenter String?

# &#x20; - Índice: \[tenantId, dueDate]

# 

# ReceivableStatus (enum): PENDING | PARTIAL | PAID | OVERDUE | CANCELED | WRITTEN\_OFF

# PayableStatus (enum): PENDING | PARTIAL | PAID | OVERDUE | CANCELED

# 

# CashFlow

# &#x20; - Campos: tenantId, type (INFLOW | OUTFLOW), category String

# &#x20; - Campos: amount Decimal, description String, date DateTime

# &#x20; - Campos: referenceType String? (ex: "Payment", "Payable")

# &#x20; - Campos: referenceId String? (ID da entidade relacionada)

# &#x20; - Campos: balance Decimal (saldo acumulado — calculado no insert)

# &#x20; - SEM soft delete

# &#x20; - Índice: \[tenantId, date]

# &#x20; - Índice: \[tenantId, type, date]

# 

# ── CONVERSAS \& IA ───────────────────────────

# 

# Conversation

# &#x20; - Campos: tenantId, customerId (opcional), channel (enum)

# &#x20; - Campos: status (enum), assignedUserId (opcional)

# &#x20; - Campos: externalId String? (ID no WhatsApp/canal externo)

# &#x20; - Campos: aiEnabled Boolean @default(true)

# &#x20; - Campos: aiModel String? (modelo LLM em uso)

# &#x20; - Campos: totalTokensUsed Int @default(0) (custo tracking)

# &#x20; - Campos: lastMessageAt DateTime?

# &#x20; - Campo: metadata Json?

# &#x20; - Índice: \[tenantId, customerId]

# &#x20; - Índice: \[tenantId, externalId]

# &#x20; - Índice: \[tenantId, status]

# 

# ConversationChannel (enum): WHATSAPP | EMAIL | CHAT | SMS | INSTAGRAM | OTHER

# ConversationStatus (enum): OPEN | AI\_HANDLING | WAITING\_HUMAN | IN\_PROGRESS | RESOLVED | CLOSED

# 

# Message

# &#x20; - Campos: conversationId, tenantId

# &#x20; - Campos: role (enum: USER | ASSISTANT | SYSTEM | TOOL)

# &#x20; - Campos: content String (texto da mensagem)

# &#x20; - Campos: contentType (enum: TEXT | IMAGE | AUDIO | DOCUMENT | TEMPLATE)

# &#x20; - Campos: externalId String? (ID no canal externo)

# &#x20; - Campos: tokensUsed Int? (tokens desta mensagem)

# &#x20; - Campos: modelUsed String? (qual LLM respondeu)

# &#x20; - Campos: isAiGenerated Boolean @default(false)

# &#x20; - Campos: embedding Float\[]? (vetor para RAG — preparado para pgvector)

# &#x20; - Campos: failedAt DateTime?, failReason String?

# &#x20; - SEM soft delete

# &#x20; - Índice: \[tenantId, conversationId]

# &#x20; - Índice: \[tenantId, conversationId, createdAt] (paginação de histórico)

# 

# MessageRole (enum): USER | ASSISTANT | SYSTEM | TOOL

# MessageContentType (enum): TEXT | IMAGE | AUDIO | DOCUMENT | TEMPLATE

# 

# ── ASSINATURAS ─────────────────────────────

# 

# Subscription

# &#x20; - Campos: tenantId, plan (enum), status (enum)

# &#x20; - Campos: externalId String? (ID no Stripe/gateway)

# &#x20; - Campos: currentPeriodStart, currentPeriodEnd DateTime

# &#x20; - Campos: cancelAtPeriodEnd Boolean, canceledAt DateTime?

# &#x20; - Campos: priceAmount Decimal, currency String @default("BRL")

# &#x20; - Índice único: \[tenantId] (um tenant = uma subscription ativa)

# 

# SubscriptionStatus (enum): ACTIVE | PAST\_DUE | CANCELED | TRIALING | PAUSED | INCOMPLETE

# 

# ── LOGS \& AUDITORIA ────────────────────────

# 

# SystemLog

# &#x20; - Campos: tenantId (opcional — logs do sistema podem ser globais)

# &#x20; - Campos: level (enum), message String, context Json?

# &#x20; - Campos: service String (ex: "OrderService"), method String?

# &#x20; - Campos: traceId String? (rastreabilidade distribuída)

# &#x20; - Campos: duration Int? (ms), httpStatus Int?

# &#x20; - SEM soft delete, SEM updatedAt

# &#x20; - Índice: \[tenantId, level, createdAt]

# &#x20; - Índice: \[traceId]

# 

# LogLevel (enum): DEBUG | INFO | WARN | ERROR | FATAL

# 

# AuditLog

# &#x20; - Campos: tenantId, userId, userEmail String (snapshot)

# &#x20; - Campos: action String (ex: "order.created", "user.deleted")

# &#x20; - Campos: entity String (ex: "Order"), entityId String

# &#x20; - Campos: before Json? (estado anterior), after Json? (estado novo)

# &#x20; - Campos: ip String?, userAgent String?

# &#x20; - Campos: traceId String?

# &#x20; - SEM soft delete, SEM updatedAt (imutável)

# &#x20; - Índice: \[tenantId, entity, entityId]

# &#x20; - Índice: \[tenantId, userId, createdAt]

# &#x20; - Índice: \[tenantId, action, createdAt]

# 

# ═══════════════════════════════════════════

# REQUISITOS TÉCNICOS DO SCHEMA

# ═══════════════════════════════════════════

# 

# TIPOS DE DADOS:

# \- Valores monetários: sempre Decimal (nunca Float)

# \- Datas: sempre DateTime com timezone (UTC)

# \- Arrays: usar String\[] ou Int\[] do Prisma quando aplicável

# \- JSON: usar Json? para dados sem estrutura fixa

# 

# SEQUÊNCIAS (para números de pedido/orçamento):

# \- Criar modelo auxiliar: NumberSequence

# &#x20; - Campos: tenantId, entity String, lastNumber Int

# &#x20; - Índice único: \[tenantId, entity]

# &#x20; - Usado para gerar ORD-2024-0001, QUO-2024-0001, etc.

# 

# RELAÇÕES:

# \- Usar onDelete: Cascade apenas para entidades filho direto

# \- Usar onDelete: Restrict para entidades críticas (ex: Customer com Orders)

# \- Usar onDelete: SetNull para referências opcionais

# 

# PREPARAÇÃO PARA PGVECTOR (embeddings):

# \- Adicionar comentário no campo embedding de Message

# &#x20; indicando: /// @db.Vector(1536) — ativar após instalar extensão pgvector

# 

# ═══════════════════════════════════════════

# FORMATO DE SAÍDA

# ═══════════════════════════════════════════

# 

# Retorne APENAS o schema.prisma completo, sem explicações externas.

# O schema deve:

# 1\. Começar com o bloco generator client e datasource db

# 2\. Ter todos os enums no topo, agrupados e comentados

# 3\. Ter os models organizados por domínio (tenant, users, clientes, etc.)

# 4\. Ter comentários /// acima de cada model explicando sua função

# 5\. Ser 100% válido e executável com: npx prisma validate

# 6\. Estar pronto para: npx prisma migrate dev

# 7\. Não ter campos duplicados, relações circulares não tratadas

# &#x20;  ou tipos inválidos do Prisma

# 

# Ao final, adicione um bloco de comentário com:

# \- Total de models gerados

# \- Total de enums gerados  

# \- Campos que requerem extensões PostgreSQL adicionais (ex: pgvector)

# \- Recomendações de migration para produção

# 



