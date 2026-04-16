import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Conversation {
  id: string
  lastMessageAt: Date | null
  status: string
  customer?: { name: string } | null
  messages: Array<{ content: string; createdAt: Date }>
}

interface ChatHistoryProps {
  conversations: any[]
  selectedId?: string
  onSelect: (id: string) => void
  onNew: () => void
}

export function ChatHistory({ conversations, selectedId, onSelect, onNew }: ChatHistoryProps) {
  return (
    <section className="w-80 bg-surface-container-low flex flex-col h-full border-r border-slate-200/50 dark:border-slate-800/50">
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Conversas Recentes</span>
          <div className="flex items-center gap-2">
            <span className="bg-primary-container text-on-primary-container text-[10px] font-bold px-2 py-0.5 rounded-full">
              {conversations.length} Ativas
            </span>
            <button 
              onClick={onNew}
              className="p-1 text-on-surface-variant hover:text-primary transition-colors"
              title="Nova conversa"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-px no-scrollbar px-2">
        {conversations.length === 0 && (
          <div className="p-8 text-center bg-surface-container-lowest mx-2 rounded-2xl shadow-sm border border-slate-100">
            <span className="material-symbols-outlined text-[40px] text-slate-200 mb-2">forum</span>
            <p className="text-xs font-bold text-on-surface/40 uppercase tracking-widest">Nenhuma conversa</p>
          </div>
        )}

        {conversations.map((conv) => {
          const isActive = selectedId === conv.id;
          const lastMsg = conv.messages?.[conv.messages.length - 1]; // Pegar a última, não a primeira se estiver invertido
          const title = conv.customer?.name || `Chat #${conv.id.slice(0, 4)}`;
          const status = conv.status || 'AGUARDANDO';

          return (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "p-4 rounded-xl mb-1 cursor-pointer transition-all duration-200",
                isActive 
                  ? "bg-surface-container-lowest shadow-sm border-l-4 border-primary" 
                  : "hover:bg-white/50"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className={cn(
                  "text-sm tracking-tight truncate",
                  isActive ? "font-bold text-on-surface" : "font-semibold text-on-surface/80"
                )}>
                  {title}
                </h3>
                <span className="text-[10px] text-on-surface-variant font-medium">
                  {conv.lastMessageAt ? format(new Date(conv.lastMessageAt), 'HH:mm', { locale: ptBR }) : ''}
                </span>
              </div>
              
              <p className="text-xs text-on-surface-variant truncate mb-2 leading-relaxed">
                {lastMsg?.content || 'Inicie a conversa...'}
              </p>

              <div className="flex items-center gap-2">
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                  status === 'EM ATENDIMENTO' ? "bg-green-100 text-green-700" :
                  status === 'AGUARDANDO' ? "bg-primary-container text-on-primary-container" :
                  "bg-surface-container-highest text-on-surface-variant"
                )}>
                  {status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
