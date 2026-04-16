'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useSidebar } from '@/contexts/sidebar-context'
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  createConversation,
  getProductsForCatalog,
  getCustomersForChat,
  createOrderFromCart,
  linkCustomerToConversation,
  updateConversationStatus,
} from '@/app/actions/ai-assistant'

// ──────────────────────────────────────────────
// TIPOS
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

interface ProductItem {
  id: string
  name: string
  sku: string
  description: string | null
  basePrice: number | { toNumber?: () => number } | any
  type: string
  unit: string
  thumbnailUrl: string | null
  category: { name: string } | null
  variants: Array<{
    id: string
    name: string
    sku: string
    price: number | { toNumber?: () => number } | any
    attributes: any
  }>
}

interface CustomerItem {
  id: string
  name: string
  email: string
  phone: string | null
  type: string
  companyName: string | null
}

// ──────────────────────────────────────────────
// UTILITÁRIOS
// ──────────────────────────────────────────────

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

/** Normaliza preço de Decimal do Prisma para number */
function toNumber(val: any): number {
  if (typeof val === 'number') return val
  if (val && typeof val.toNumber === 'function') return val.toNumber()
  return parseFloat(String(val)) || 0
}

/** Formata valor para BRL */
function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

// ──────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────

export default function ConversasPage() {
  // Estado principal
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>()
  const [messages, setMessages] = useState<any[]>([])
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [inputText, setInputText] = useState('')
  
  // Carrinho
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  
  // Catálogo
  const [products, setProducts] = useState<ProductItem[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  
  // Clientes
  const [customers, setCustomers] = useState<CustomerItem[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerPicker, setShowCustomerPicker] = useState(false)
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  
  // Pedido
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null)

  // Tab ativa da coluna direita
  const [rightTab, setRightTab] = useState<'catalog' | 'cart'>('catalog')
  
  // Busca no chat
  const [chatSearchQuery, setChatSearchQuery] = useState('')
  
  const { isCollapsed } = useSidebar()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const productSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const customerSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ──────────────────────────────────────────────
  // CARREGAMENTO INICIAL
  // ──────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const [convData, prodData] = await Promise.all([
          getConversations(),
          getProductsForCatalog(),
        ])
        setConversations(convData)
        setProducts(prodData as ProductItem[])
        if (convData.length > 0) {
          setSelectedChatId(convData[0].id)
        }
      } catch (err) {
        console.error("Erro ao carregar dados iniciais:", err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Carregar mensagens quando trocar de chat
  useEffect(() => {
    if (!selectedChatId) return

    async function loadMsg() {
      try {
        const data = await getMessages(selectedChatId!)
        setMessages(data)
      } catch (err) {
        console.error("Erro ao carregar mensagens:", err)
      }
    }
    loadMsg()
    // Reset carrinho ao trocar de chat
    setCartItems([])
    setOrderSuccess(null)
  }, [selectedChatId])

  // ──────────────────────────────────────────────
  // BUSCA DE PRODUTOS (debounce)
  // ──────────────────────────────────────────────

  useEffect(() => {
    if (productSearchTimeoutRef.current) {
      clearTimeout(productSearchTimeoutRef.current)
    }

    productSearchTimeoutRef.current = setTimeout(async () => {
      setIsLoadingProducts(true)
      try {
        const data = await getProductsForCatalog(productSearch || undefined)
        setProducts(data as ProductItem[])
      } catch (err) {
        console.error("Erro ao buscar produtos:", err)
      } finally {
        setIsLoadingProducts(false)
      }
    }, 300)

    return () => {
      if (productSearchTimeoutRef.current) {
        clearTimeout(productSearchTimeoutRef.current)
      }
    }
  }, [productSearch])

  // ──────────────────────────────────────────────
  // BUSCA DE CLIENTES (debounce)
  // ──────────────────────────────────────────────

  useEffect(() => {
    if (!showCustomerPicker) return

    if (customerSearchTimeoutRef.current) {
      clearTimeout(customerSearchTimeoutRef.current)
    }

    customerSearchTimeoutRef.current = setTimeout(async () => {
      setIsLoadingCustomers(true)
      try {
        const data = await getCustomersForChat(customerSearch || undefined)
        setCustomers(data as CustomerItem[])
      } catch (err) {
        console.error("Erro ao buscar clientes:", err)
      } finally {
        setIsLoadingCustomers(false)
      }
    }, 300)

    return () => {
      if (customerSearchTimeoutRef.current) {
        clearTimeout(customerSearchTimeoutRef.current)
      }
    }
  }, [customerSearch, showCustomerPicker])

  // ──────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────

  const handleSendMessage = async () => {
    if (!selectedChatId || isSending || !inputText.trim()) return

    const content = inputText
    setInputText('')
    setIsSending(true)
    
    const tempUserMsg = {
      id: 'temp-' + Date.now(),
      role: 'USER',
      content,
      createdAt: new Date(),
      isAiGenerated: false
    }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      const response = await sendMessage(selectedChatId, content)
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempUserMsg.id)
        return [...filtered, response.userMessage, response.aiMessage]
      })
      const updatedConvs = await getConversations()
      setConversations(updatedConvs)
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err)
      // Remove mensagem temporária em caso de erro
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id))
    } finally {
      setIsSending(false)
    }
  }

  const handleNewChat = async () => {
    try {
      const newChat = await createConversation()
      setConversations(prev => [newChat, ...prev])
      setSelectedChatId(newChat.id)
      setMessages([])
      setCartItems([])
      setOrderSuccess(null)
    } catch (err) {
      console.error("Erro ao criar nova conversa:", err)
    }
  }

  const handleAddToCart = useCallback((product: ProductItem, variant?: ProductItem['variants'][0]) => {
    const price = variant ? toNumber(variant.price) : toNumber(product.basePrice)
    const name = variant ? `${product.name} - ${variant.name}` : product.name
    const desc = variant 
      ? `SKU: ${variant.sku}` 
      : `SKU: ${product.sku}${product.category ? ` • ${product.category.name}` : ''}`

    const existingIndex = cartItems.findIndex(
      item => item.productId === product.id && item.variantId === (variant?.id || undefined)
    )

    if (existingIndex >= 0) {
      // Incrementa quantidade
      setCartItems(prev => prev.map((item, i) => {
        if (i === existingIndex) {
          const newQty = item.quantity + 1
          return { ...item, quantity: newQty, total: newQty * item.unitPrice }
        }
        return item
      }))
    } else {
      // Adiciona novo item
      setCartItems(prev => [...prev, {
        productId: product.id,
        variantId: variant?.id,
        name,
        description: desc,
        quantity: 1,
        unitPrice: price,
        total: price,
      }])
    }

    setRightTab('cart')
  }, [cartItems])

  const handleRemoveFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpdateCartQuantity = (index: number, delta: number) => {
    setCartItems(prev => prev.map((item, i) => {
      if (i === index) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty, total: newQty * item.unitPrice }
      }
      return item
    }))
  }

  const handleLinkCustomer = async (customerId: string) => {
    if (!selectedChatId) return
    try {
      const updated = await linkCustomerToConversation(selectedChatId, customerId)
      setConversations(prev => prev.map(c => c.id === selectedChatId ? { ...c, ...updated } : c))
      setShowCustomerPicker(false)
      setCustomerSearch('')
    } catch (err) {
      console.error("Erro ao vincular cliente:", err)
    }
  }

  const handleCreateOrder = async () => {
    if (!selectedChatId || cartItems.length === 0) return
    
    const selectedChat = conversations.find(c => c.id === selectedChatId)
    if (!selectedChat?.customerId) {
      setShowCustomerPicker(true)
      return
    }

    setIsCreatingOrder(true)
    try {
      const order = await createOrderFromCart(selectedChat.customerId, cartItems)
      setOrderSuccess((order as any).number)
      setCartItems([])
      
      // Envia mensagem automática na conversa
      await sendMessage(selectedChatId, `✅ Pedido ${(order as any).number} formalizado com sucesso! Total: ${formatBRL(toNumber((order as any).total))}`)
      
      const [updatedMsgs, updatedConvs] = await Promise.all([
        getMessages(selectedChatId),
        getConversations(),
      ])
      setMessages(updatedMsgs)
      setConversations(updatedConvs)
    } catch (err: any) {
      console.error("Erro ao criar pedido:", err)
      alert(err.message || 'Erro ao formalizar pedido')
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const handleCloseConversation = async () => {
    if (!selectedChatId) return
    try {
      await updateConversationStatus(selectedChatId, 'CLOSED')
      const updatedConvs = await getConversations()
      setConversations(updatedConvs)
    } catch (err) {
      console.error("Erro ao fechar conversa:", err)
    }
  }

  // ──────────────────────────────────────────────
  // DADOS DERIVADOS
  // ──────────────────────────────────────────────

  const selectedChat = conversations.find(c => c.id === selectedChatId)
  const cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0)

  const filteredConversations = chatSearchQuery
    ? conversations.filter(c => {
        const name = c.customer?.name?.toLowerCase() || ''
        const lastMsg = c.messages?.[0]?.content?.toLowerCase() || ''
        const search = chatSearchQuery.toLowerCase()
        return name.includes(search) || lastMsg.includes(search)
      })
    : conversations

  const statusLabels: Record<string, string> = {
    OPEN: 'AGUARDANDO',
    AI_HANDLING: 'IA ATENDENDO',
    WAITING_HUMAN: 'AGUARD. HUMANO',
    IN_PROGRESS: 'EM ATENDIMENTO',
    RESOLVED: 'RESOLVIDO',
    CLOSED: 'FECHADO',
  }

  // ──────────────────────────────────────────────
  // LOADING
  // ──────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Conectando ao Inkwell System...</p>
        </div>
      </div>
    )
  }

  // ──────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-[#f7f9fb] text-[#2a3439] overflow-hidden">
      <Sidebar />

      <main className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        isCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}>
        {/* HEADER */}
        <header className="flex justify-between items-center w-full px-8 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/50 z-40 shrink-0">
          <div className="flex items-center gap-8">
            <span className="text-xl font-black text-slate-900 tracking-tighter">Central de Atendimento</span>
            <nav className="hidden md:flex gap-6 items-end h-full">
              <button className="text-sm font-medium text-slate-500 pb-4 transition-all duration-200 hover:text-slate-800">Fila de Espera</button>
              <button className="text-sm font-medium text-slate-900 border-b-2 border-slate-900 pb-4 transition-all duration-200">Meus Chats</button>
              <button className="text-sm font-medium text-slate-500 pb-4 transition-all duration-200 hover:text-slate-800">Histórico</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-slate-400 text-lg">search</span>
              <input 
                className="pl-10 pr-4 py-1.5 bg-[#f0f4f7] border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-slate-200 transition-all outline-none" 
                placeholder="Buscar conversas..." 
                type="text"
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
              />
            </div>
            <button className="text-slate-500 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="text-slate-500 hover:text-slate-900 transition-colors" onClick={handleNewChat} title="Novo Chat">
              <span className="material-symbols-outlined">add_comment</span>
            </button>
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-slate-400">person</span>
            </div>
          </div>
        </header>

        {/* 3-COL APP CONTENT */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* ═══════════ LEFT: CONVERSATION LIST ═══════════ */}
          <section className="w-80 bg-[#f0f4f7] flex flex-col border-r border-[#e1e9ee] shrink-0">
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-[11px] font-bold text-[#566166] uppercase tracking-wider">Conversas Recentes</span>
                <div className="flex items-center gap-2">
                  <span className="bg-[#dae2fd] text-[#4a5167] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {filteredConversations.length} Ativas
                  </span>
                  <button 
                    onClick={handleNewChat}
                    className="p-1 text-[#566166] hover:text-[#565e74] transition-colors"
                    title="Nova conversa"
                  >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-px custom-sidebar-scroll px-2">
              {filteredConversations.length === 0 && (
                <div className="p-8 text-center bg-white mx-2 rounded-2xl shadow-sm border border-slate-100">
                  <span className="material-symbols-outlined text-[40px] text-slate-200 mb-2">forum</span>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhuma conversa</p>
                </div>
              )}

              {filteredConversations.map((chat) => {
                const isActive = selectedChatId === chat.id
                const lastMsg = chat.messages?.[0]
                const title = chat.customer?.name || `Chat #${chat.id.slice(0, 6).toUpperCase()}`
                const status = statusLabels[chat.status] || chat.status

                return (
                  <div 
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={cn(
                      "p-4 rounded-xl mb-1 cursor-pointer transition-all duration-200",
                      isActive 
                        ? "bg-white shadow-sm border-l-4 border-[#565e74]" 
                        : "hover:bg-white/50"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={cn("text-sm truncate", isActive ? "font-bold" : "font-semibold")}>
                        {title}
                      </h3>
                      <span className="text-[10px] text-[#566166] shrink-0 ml-2">
                        {chat.lastMessageAt ? format(new Date(chat.lastMessageAt), 'HH:mm', { locale: ptBR }) : '--:--'}
                      </span>
                    </div>
                    <p className="text-xs text-[#566166] truncate mb-2">
                      {lastMsg?.content || 'Inicie a conversa...'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                        chat.status === 'IN_PROGRESS' ? "bg-green-100 text-green-700" :
                        chat.status === 'CLOSED' || chat.status === 'RESOLVED' ? "bg-slate-200 text-slate-500" :
                        "bg-[#dae2fd] text-[#4a5167]"
                      )}>
                        {status}
                      </span>
                      {chat.customer && (
                        <span className="text-[9px] text-[#566166] truncate">
                          {chat.channel === 'WHATSAPP' ? '📱' : '💬'} {chat.customer.phone || chat.customer.email}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ═══════════ CENTER: CHAT AREA ═══════════ */}
          <section className="flex-1 flex flex-col bg-white min-w-0">
            {selectedChatId ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-[#f0f4f7] shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                        {selectedChat?.customer ? (
                          <span className="text-sm font-bold text-[#565e74]">
                            {selectedChat.customer.name.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-slate-400">smart_toy</span>
                        )}
                      </div>
                      <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#2a3439]">
                        {selectedChat?.customer?.name || 'Cliente não vinculado'}
                      </h2>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-green-600 font-medium">
                          {selectedChat?.customer ? (selectedChat.customer.phone || selectedChat.customer.email) : ''}
                        </p>
                        {!selectedChat?.customer && (
                          <button 
                            onClick={() => setShowCustomerPicker(true)}
                            className="text-[10px] text-[#565e74] underline hover:text-[#4a5268]"
                          >
                            Vincular cliente
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedChat?.customer && (
                      <button 
                        onClick={() => setShowCustomerPicker(true)}
                        className="p-2 text-[#566166] hover:bg-[#f0f4f7] rounded-lg transition-colors"
                        title="Trocar cliente"
                      >
                        <span className="material-symbols-outlined text-lg">person_search</span>
                      </button>
                    )}
                    <button 
                      onClick={handleCloseConversation}
                      className="p-2 text-[#566166] hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                      title="Encerrar conversa"
                    >
                      <span className="material-symbols-outlined text-lg">cancel</span>
                    </button>
                    <button className="p-2 text-[#566166] hover:bg-[#f0f4f7] rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                  </div>
                </div>

                {/* Customer Picker Modal */}
                {showCustomerPicker && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                      <div className="p-5 border-b border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-[#2a3439]">Vincular Cliente à Conversa</h3>
                          <button onClick={() => { setShowCustomerPicker(false); setCustomerSearch('') }} className="text-slate-400 hover:text-slate-600">
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        </div>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                          <input
                            className="w-full pl-10 pr-4 py-2.5 bg-[#f0f4f7] border border-[#e1e9ee] rounded-lg text-sm focus:ring-2 focus:ring-[#565e74]/20 transition-all outline-none"
                            placeholder="Buscar por nome, email ou telefone..."
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {isLoadingCustomers ? (
                          <div className="p-8 text-center">
                            <div className="w-8 h-8 border-3 border-slate-300 border-t-[#565e74] rounded-full animate-spin mx-auto"></div>
                          </div>
                        ) : customers.length === 0 ? (
                          <div className="p-8 text-center text-sm text-slate-400">
                            {customerSearch ? 'Nenhum cliente encontrado' : 'Digite para buscar clientes'}
                          </div>
                        ) : (
                          customers.map(cust => (
                            <button
                              key={cust.id}
                              onClick={() => handleLinkCustomer(cust.id)}
                              className="w-full p-4 text-left hover:bg-[#f0f4f7] transition-colors border-b border-slate-50 last:border-0"
                            >
                              <p className="text-sm font-bold text-[#2a3439]">{cust.name}</p>
                              <p className="text-xs text-[#566166]">
                                {cust.email}{cust.phone ? ` • ${cust.phone}` : ''}
                                {cust.companyName ? ` • ${cust.companyName}` : ''}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col custom-sidebar-scroll">
                  <div className="flex justify-center">
                    <span className="text-[10px] font-bold text-[#566166] bg-[#f0f4f7] px-3 py-1 rounded-full uppercase tracking-tighter">
                      {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </span>
                  </div>

                  {messages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                      <span className="material-symbols-outlined text-[64px] text-[#565e74]">forum</span>
                      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em]">Inicie o atendimento</p>
                    </div>
                  )}

                  {messages.map((msg, idx) => {
                    const isAssistant = msg.role === 'ASSISTANT'
                    return (
                      <div 
                        key={msg.id || idx}
                        className={cn(
                          "flex flex-col max-w-[80%] animate-in fade-in slide-in-from-bottom-1",
                          msg.role === 'USER' ? "items-end self-end" : "items-start"
                        )}
                      >
                        <div className={cn(
                          "p-4 rounded-2xl shadow-sm leading-relaxed text-sm whitespace-pre-line",
                          msg.role === 'USER' 
                            ? "bg-[#565e74] text-white rounded-tr-none shadow-md" 
                            : "bg-[#f0f4f7] text-[#2a3439] rounded-tl-none border border-[#e1e9ee]"
                        )}>
                          {msg.content}
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 mt-1",
                          msg.role === 'USER' ? "mr-1" : "ml-1"
                        )}>
                          <span className="text-[10px] text-[#566166]">
                            {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : ''}
                          </span>
                          {msg.role === 'USER' && (
                            <span className="material-symbols-outlined text-[12px] text-[#565e74]" style={{ fontVariationSettings: "'FILL' 1" }}>done_all</span>
                          )}
                          {isAssistant && msg.isAiGenerated && (
                            <span className="text-[9px] text-[#565e74]/60 font-medium ml-1">IA</span>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {isSending && (
                    <div className="flex flex-col items-start max-w-[80%]">
                      <div className="bg-[#f0f4f7] border border-[#e1e9ee] p-4 rounded-2xl rounded-tl-none">
                        <div className="flex gap-1.5 items-center h-5">
                          <div className="w-1.5 h-1.5 bg-[#565e74]/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-1.5 h-1.5 bg-[#565e74]/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-1.5 h-1.5 bg-[#565e74]/40 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-[#f0f4f7] shrink-0">
                  <div className="flex items-center gap-3 bg-[#f0f4f7] p-2 rounded-xl focus-within:ring-2 focus-within:ring-[#565e74]/10 transition-all">
                    <button className="p-2 text-[#566166] hover:text-[#565e74] transition-colors">
                      <span className="material-symbols-outlined">attach_file</span>
                    </button>
                    <input 
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 outline-none" 
                      placeholder="Escreva sua mensagem..." 
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    />
                    <button className="p-2 text-[#566166] hover:text-[#565e74] transition-colors hidden sm:block">
                      <span className="material-symbols-outlined">mood</span>
                    </button>
                    <button 
                      onClick={handleSendMessage}
                      disabled={isSending || !inputText.trim()}
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center shadow-lg transition-all active:scale-95",
                        (!inputText.trim() || isSending)
                          ? "bg-slate-200 text-slate-400 shadow-none"
                          : "bg-[#565e74] text-white hover:bg-[#4a5268] hover:shadow-[#565e74]/20"
                      )}
                    >
                      {isSending ? (
                        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                <span className="material-symbols-outlined text-6xl opacity-20">chat_bubble</span>
                <p className="text-sm font-medium">Selecione uma conversa para começar</p>
                <Button variant="outline" onClick={handleNewChat} className="rounded-full shadow-sm">
                  Iniciar Nova Conversa
                </Button>
              </div>
            )}
          </section>

          {/* ═══════════ RIGHT: CATALOG & CART ═══════════ */}
          <section className="w-80 bg-[#f0f4f7] border-l border-[#e1e9ee] flex flex-col overflow-hidden shrink-0">
            
            {/* Tabs */}
            <div className="flex border-b border-[#e1e9ee] shrink-0">
              <button 
                onClick={() => setRightTab('catalog')}
                className={cn(
                  "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all",
                  rightTab === 'catalog' 
                    ? "text-[#565e74] border-b-2 border-[#565e74] bg-white/50"
                    : "text-[#566166] hover:text-[#2a3439]"
                )}
              >
                <span className="material-symbols-outlined text-sm align-middle mr-1">inventory_2</span>
                Catálogo
              </button>
              <button 
                onClick={() => setRightTab('cart')}
                className={cn(
                  "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all relative",
                  rightTab === 'cart' 
                    ? "text-[#565e74] border-b-2 border-[#565e74] bg-white/50"
                    : "text-[#566166] hover:text-[#2a3439]"
                )}
              >
                <span className="material-symbols-outlined text-sm align-middle mr-1">shopping_cart</span>
                Carrinho
                {cartItems.length > 0 && (
                  <span className="absolute top-2 right-4 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto custom-sidebar-scroll">
              {rightTab === 'catalog' ? (
                /* ─── CATALOGO ─── */
                <div className="p-4">
                  {/* Busca */}
                  <div className="relative mb-4">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                    <input 
                      className="w-full pl-10 pr-4 py-2 bg-white border border-[#e1e9ee] rounded-lg text-xs focus:ring-2 focus:ring-slate-100 transition-all outline-none" 
                      placeholder="Buscar no catálogo..." 
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>

                  {/* Lista de Produtos */}
                  <div className="space-y-2">
                    {isLoadingProducts ? (
                      <div className="p-8 text-center">
                        <div className="w-6 h-6 border-2 border-slate-300 border-t-[#565e74] rounded-full animate-spin mx-auto"></div>
                      </div>
                    ) : products.length === 0 ? (
                      <div className="p-8 text-center">
                        <span className="material-symbols-outlined text-3xl text-slate-200">inventory_2</span>
                        <p className="text-xs text-slate-400 mt-2">Nenhum produto encontrado</p>
                      </div>
                    ) : (
                      products.map(product => (
                        <div key={product.id} className="bg-white p-3 rounded-lg border border-transparent hover:border-slate-200 hover:shadow-sm transition-all group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-10 w-10 bg-slate-100 rounded flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                                {product.thumbnailUrl ? (
                                  <img className="object-cover h-full w-full" src={product.thumbnailUrl} alt={product.name} />
                                ) : (
                                  <span className="material-symbols-outlined text-slate-300 text-lg">image</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#2a3439] truncate">{product.name}</p>
                                <p className="text-[10px] text-[#566166]">
                                  {product.category?.name || product.sku} • {formatBRL(toNumber(product.basePrice))}
                                </p>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleAddToCart(product)}
                              className="p-1.5 text-[#565e74] hover:bg-[#dae2fd] rounded transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                              title="Adicionar ao carrinho"
                            >
                              <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                            </button>
                          </div>

                          {/* Variantes */}
                          {product.variants.length > 0 && (
                            <div className="mt-2 ml-13 space-y-1 pl-[52px]">
                              {product.variants.map(variant => (
                                <div key={variant.id} className="flex items-center justify-between text-[10px] py-1 hover:bg-slate-50 rounded px-1 -mx-1">
                                  <span className="text-[#566166]">{variant.name} — {formatBRL(toNumber(variant.price))}</span>
                                  <button 
                                    onClick={() => handleAddToCart(product, variant)}
                                    className="text-[#565e74] hover:text-[#4a5268] p-0.5"
                                  >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* ─── CARRINHO ─── */
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#742fe5] text-lg">shopping_cart_checkout</span>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-[#2a3439]">Carrinho</h3>
                    </div>
                    <span className="text-[10px] font-bold text-[#566166]">
                      {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Itens'}
                    </span>
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="p-8 text-center">
                      <span className="material-symbols-outlined text-3xl text-slate-200">remove_shopping_cart</span>
                      <p className="text-xs text-slate-400 mt-2">Carrinho vazio</p>
                      <p className="text-[10px] text-slate-300 mt-1">Adicione produtos do catálogo</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-4">
                        {cartItems.map((item, index) => (
                          <div key={`${item.productId}-${item.variantId || ''}-${index}`} className="bg-white p-3 rounded-lg border border-slate-100">
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-[#2a3439] truncate">{item.name}</p>
                                <p className="text-[10px] text-[#566166]">{item.description}</p>
                              </div>
                              <button 
                                onClick={() => handleRemoveFromCart(index)}
                                className="p-1 text-slate-300 hover:text-red-500 transition-colors shrink-0"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleUpdateCartQuantity(index, -1)}
                                  className="w-6 h-6 rounded bg-[#f0f4f7] text-[#566166] flex items-center justify-center hover:bg-[#e1e9ee] text-xs font-bold"
                                >
                                  −
                                </button>
                                <span className="text-xs font-bold text-[#2a3439] w-8 text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => handleUpdateCartQuantity(index, 1)}
                                  className="w-6 h-6 rounded bg-[#f0f4f7] text-[#566166] flex items-center justify-center hover:bg-[#e1e9ee] text-xs font-bold"
                                >
                                  +
                                </button>
                              </div>
                              <span className="text-xs font-bold text-[#2a3439]">{formatBRL(item.total)}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="pt-3 border-t border-[#e1e9ee] flex justify-between items-center mb-4">
                        <span className="text-xs font-black text-[#2a3439] uppercase tracking-tighter">Total Estimado</span>
                        <span className="text-lg font-black text-[#565e74] tracking-tighter">{formatBRL(cartTotal)}</span>
                      </div>

                      {/* Sucesso do pedido */}
                      {orderSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                            <div>
                              <p className="text-xs font-bold text-green-800">Pedido criado!</p>
                              <p className="text-[10px] text-green-600">{orderSuccess}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Ações */}
                      <div className="space-y-2">
                        <button 
                          onClick={handleCreateOrder}
                          disabled={isCreatingOrder || cartItems.length === 0}
                          className="w-full py-3 bg-[#565e74] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#4a5268] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCreatingOrder ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                              Processando...
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-lg">assignment_turned_in</span>
                              Formalizar Pedido
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => setCartItems([])}
                          className="w-full py-2 text-red-500 text-[11px] font-bold uppercase tracking-widest hover:underline transition-all"
                        >
                          Limpar Carrinho
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Status */}
            <div className="mt-auto p-4 bg-slate-200/20 border-t border-slate-200/50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#565e74] animate-pulse"></div>
                <span className="text-[10px] font-bold text-[#565e74] uppercase tracking-widest">Sincronizado com Produção</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
