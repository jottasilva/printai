'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Pause, 
  AlertCircle, 
  User as UserIcon,
  Layers,
  ChevronRight,
  MoreVertical,
  MessageSquare
} from 'lucide-react'
import { updateProductionStatus } from '@/app/actions/production'
import { cn } from '@/lib/utils'

const columns = [
  { id: 'PENDING', title: 'Pending', icon: Clock, color: 'text-slate-400' },
  { id: 'QUEUED', title: 'In Queue', icon: Layers, color: 'text-indigo-500' },
  { id: 'IN_PROGRESS', title: 'Active', icon: Play, color: 'text-primary' },
  { id: 'PAUSED', title: 'Paused', icon: Pause, color: 'text-amber-500' },
  { id: 'DONE', title: 'Completed', icon: CheckCircle2, color: 'text-emerald-500' }
]

export function KanbanBoard({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems)

  const handleStatusChange = async (id: string, newStatus: any) => {
    // Optimistic UI update
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ))
    await updateProductionStatus(id, newStatus)
  }

  return (
    <div className="flex gap-8 overflow-x-auto pb-8 h-[calc(100vh-280px)] custom-scrollbar min-h-[600px]">
      {columns.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-[320px] flex flex-col gap-6">
          {/* Column Header */}
          <div className="flex items-center justify-between px-4 pb-2 border-b-2 border-slate-100">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-xl bg-white shadow-sm border border-slate-100", column.color)}>
                <column.icon className="w-5 h-5" />
              </div>
              <h2 className="font-extrabold text-[11px] uppercase tracking-[0.15em] text-slate-500">
                {column.title}
              </h2>
            </div>
            <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-[10px] font-black text-slate-500">
              {items.filter(i => i.status === column.id).length}
            </span>
          </div>

          {/* Column Content */}
          <div className="flex-1 bg-slate-50/20 border border-slate-100/50 rounded-[2.5rem] p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar shadow-inner">
            <AnimatePresence>
              {items
                .filter(i => i.status === column.id)
                .map((item) => (
                  <motion.div
                    key={item.id}
                    layoutId={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-white rounded-3xl p-5 border border-slate-100 shadow-premium hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-default relative overflow-hidden"
                  >
                    {/* Priority Bar */}
                    <div className={cn(
                      "absolute top-0 left-0 bottom-0 w-1.5",
                      item.priority === 'URGENT' ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]" :
                      item.priority === 'HIGH' ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]" :
                      "bg-primary/20"
                    )} />

                    <div className="flex justify-between items-start mb-4 pl-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                          Ref
                        </span>
                        <span className="text-[11px] font-mono font-black text-slate-600">
                          #{item.order.number.split('-').pop()}
                        </span>
                      </div>
                      {item.priority === 'URGENT' && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 rounded-full border border-red-100 text-[10px] font-black text-red-600 uppercase tracking-tighter animate-pulse">
                          <AlertCircle className="w-3 h-3" /> Priority
                        </div>
                      )}
                    </div>

                    <h3 className="font-black text-[15px] text-slate-800 leading-tight mb-2 pl-2 group-hover:text-primary transition-colors">
                      {item.product.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 pl-2 mb-6">
                      <div className="p-1 rounded bg-slate-100">
                        <UserIcon className="w-3 h-3 text-slate-500" />
                      </div>
                      <p className="text-[11px] font-bold text-slate-500">
                        {item.order.customer.name}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Operator</span>
                          <span className="text-[10px] font-black text-slate-600">
                            {item.assignedUserId ? 'Production Team' : 'Unassigned'}
                          </span>
                        </div>
                      </div>
                      
                      {column.id !== 'DONE' && (
                        <button 
                          onClick={() => handleStatusChange(item.id, getNextStatus(column.id))}
                          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 transform group-hover:scale-110"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  )
}

function getNextStatus(current: string) {
  const flow = ['PENDING', 'QUEUED', 'IN_PROGRESS', 'DONE']
  const idx = flow.indexOf(current)
  return flow[idx + 1] || current
}
