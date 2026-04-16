'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, ChevronRight, ShoppingBag, Info, User, Bot } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  type?: 'text' | 'catalog' | 'image'
  timestamp: Date
}

export function FloatingAIWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Eu sou a assistente da PrintAI. Como posso ajudar com sua gráfica hoje?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      if (messages.length === 1) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: '2',
            role: 'assistant',
            content: 'Posso te mostrar nosso catálogo de produtos, tirar dúvidas sobre pedidos ou ajudar com um orçamento real.',
            type: 'catalog',
            timestamp: new Date()
          }])
        }, 1000)
      }
    }
    scrollToBottom()
  }, [isOpen, messages])

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim()) return

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newUserMessage])
    setInputValue('')

    // Simulando resposta da IA
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Entendi! Para agilizar seu atendimento, vou te transferir para um especialista via WhatsApp. Posso prosseguir?',
        timestamp: new Date()
      }])
    }, 1500)
  }

  const handleAction = (action: string) => {
    const actionMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: action,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, actionMsg])

    if (action.includes('WhatsApp')) {
      window.open('https://wa.me/5511999999999?text=Olá,%20vim%20pelo%20site%20da%20PrintAI%20e%20preciso%20de%20ajuda%20com%20um%20pedido.', '_blank')
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 w-[380px] h-[550px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-5 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-normal text-sm">PrintAI Assistente</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-medium text-indigo-100">Online agora</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 text-gray-800">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                  }`}>
                    {msg.content}
                    
                    {msg.type === 'catalog' && (
                      <div className="mt-4 grid grid-cols-1 gap-2">
                        <button 
                          type="button"
                          onClick={() => handleAction('Ver Catálogo de Produtos')}
                          className="flex items-center justify-between w-full p-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-indigo-700 transition-colors group text-xs font-normal"
                        >
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            Catálogo de Produtos
                          </div>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleAction('Falar com Atendente no WhatsApp')}
                          className="flex items-center justify-between w-full p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-emerald-700 transition-colors group text-xs font-normal"
                        >
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp Direto
                          </div>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escreva sua dúvida..."
                className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none placeholder:text-gray-400 text-gray-900"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 transition-colors shadow-md active:scale-95 disabled:opacity-50 disabled:scale-100"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:bg-emerald-600 transition-all group relative"
      >
        {isOpen ? <X /> : <MessageCircle className="w-7 h-7" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-normal">1</span>
        )}
      </motion.button>
    </div>
  )
}
