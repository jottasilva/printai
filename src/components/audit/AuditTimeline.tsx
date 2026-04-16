'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Clock, User as UserIcon, MessageSquare, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface AuditTimelineProps {
  logs: any[];
}

export function AuditTimeline({ logs }: AuditTimelineProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Clock className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-medium">Nenhum histórico registrado para este item.</p>
      </div>
    )
  }

  return (
    <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 before:content-['']">
      {logs.map((log, index) => (
        <motion.div
          key={log.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative"
        >
          {/* Icon Pillar */}
          <div className={cn(
            "absolute -left-10 p-1.5 rounded-full z-10 bg-white border-2",
            index === 0 ? "border-primary " : "border-slate-200"
          )}>
            {index === 0 ? (
              <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
            )}
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  {log.fromStatus || 'INÍCIO'}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="text-sm font-bold text-primary">
                  {log.toStatus}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                {format(new Date(log.createdAt), "dd MMM, HH:mm", { locale: ptBR })}
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-4 leading-relaxed italic">
              "{log.note || 'Sem observações registradas.'}"
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                  <UserIcon className="w-3 h-3 text-slate-500" />
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {log.user?.name || 'Sistema'}
                </span>
              </div>
              
              {log.duration && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <Clock className="w-3 h-3" />
                  {Math.floor(log.duration / 60)}m
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
