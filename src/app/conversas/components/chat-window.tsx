import React, { useRef, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
  createdAt: Date
  isAiGenerated: boolean
}

interface ChatWindowProps {
  messages: Message[]
  onSendMessage: (val: string) => void
  isSending?: boolean
}

export function ChatWindow({ messages, onSendMessage, isSending }: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim() || isSending) return
    onSendMessage(inputValue)
    setInputValue('')
  }

  return (
    <section className="flex-1 flex flex-col bg-surface-container-lowest h-full overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-surface-container-low bg-white/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm" 
              alt="Cliente" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAb3S1m5gq8HJvf5sYKWTEYJSMHLKGVjIu1tjGAXbfMqX2QBIx6kYfAQhirqkZIATEKDhgJ2Dta8KKeIN4x64SZy9BexF0ulyz9RFD8bO_3Vtw7XxU60-cfWv7wbOdLzhazDo9V-njn8wy3etZlkn_2PnovzrnIJCafjF1gQzs8rg0cF_dZHnlStlGWaud1lC7CaVZRkPi1afYeIRgGItHBma6uULUCPkaxWcNKXldUO0G5RmG5voRBnrFlo88YDJjGeu_ytpbJKcvR" 
            />
            <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-surface">Ricardo Barbosa</h2>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Online agora</p>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[20px]">call</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col no-scrollbar bg-slate-50/30"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20">
            <span className="material-symbols-outlined text-[64px] text-primary">forum</span>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em]">Inicie o atendimento</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center my-4">
              <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full uppercase tracking-tighter">
                Hoje, {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
              </span>
            </div>

            {messages.map((msg) => {
              const isAi = msg.role === 'ASSISTANT' || msg.isAiGenerated;
              
              return (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[80%] animate-in fade-in slide-in-from-bottom-2",
                    isAi ? "items-end self-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "p-4 rounded-2xl shadow-sm text-sm leading-relaxed",
                    isAi 
                      ? "bg-primary text-on-primary rounded-tr-none shadow-md" 
                      : "bg-white border border-slate-100 text-on-surface rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 mt-1 px-1",
                    isAi ? "flex-row" : "flex-row-reverse"
                  )}>
                    <span className="text-[10px] text-on-surface-variant/60 font-medium">
                      {format(new Date(msg.createdAt), 'HH:mm', { locale: ptBR })}
                    </span>
                    {isAi && (
                      <span className="material-symbols-outlined text-[14px] text-on-primary/60" style={{ fontVariationSettings: "'FILL' 1" }}>
                        done_all
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {isSending && (
          <div className="flex flex-col items-end self-end max-w-[80%] animate-pulse">
            <div className="bg-primary/80 text-on-primary p-4 rounded-2xl rounded-tr-none shadow-md">
              <div className="flex gap-1.5 items-center h-5">
                <div className="w-1.5 h-1.5 bg-on-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-on-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-on-primary/40 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-surface-container-low">
        <form 
          onSubmit={handleSubmit}
          className="flex items-center gap-3 bg-surface-container-low p-2 rounded-xl focus-within:ring-2 focus-within:ring-primary/20 transition-all border border-transparent focus-within:border-primary/10"
        >
          <button type="button" className="p-2 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[22px]">attach_file</span>
          </button>
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isSending}
            placeholder="Escreva sua mensagem..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-on-surface placeholder:text-slate-400"
          />
          <button type="button" className="p-2 text-on-surface-variant hover:text-primary transition-colors hidden sm:block">
            <span className="material-symbols-outlined text-[22px]">mood</span>
          </button>
          <button 
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center shadow-lg transition-all active:scale-95",
              !inputValue.trim() || isSending 
                ? "bg-slate-200 text-slate-400 shadow-none" 
                : "bg-primary text-on-primary hover:bg-primary-dim hover:shadow-primary/20"
            )}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </button>
        </form>
      </div>
    </section>
  );
}
