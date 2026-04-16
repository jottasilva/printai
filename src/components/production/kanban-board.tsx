'use client'

import { useState, useCallback, useMemo } from 'react'
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
  ChevronLeft,
  Package,
  Activity,
  TrendingUp,
  Settings2,
  AlertTriangle,
  FileText,
  Calendar,
  History,
  Palette,
  Loader2,
  LayoutGrid,
} from 'lucide-react';
import { moveOrderItem, updateOrderItemStatus, getProductionItemLogs, updateItemNote } from '@/app/actions/production'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ViewDialog, DialogContent } from '@/components/ui/dialog-system'
import { Textarea } from '@/components/ui/textarea'
import { MachineSelector } from './MachineSelector'
import { Cpu } from 'lucide-react'

// Tipos de Dados para o Kanban
interface KanbanSector {
  id: string
  name: string
  color: string | null
  icon: string | null
  description: string | null
  kanbanOrder: number
  machines: any[]
}

interface KanbanItem {
  id: string
  description: string | null
  quantity: number | string | any
  status: string
  priority: string
  dueDate: string | null
  notes: string | null
  productionNotes: string | null
  sectorId: string | null
  product: {
    name: string
    thumbnailUrl?: string | null
  }
  order: {
    number: string
    customer: {
      name: string
    }
  }
  assignedUser?: {
    name: string
    avatarUrl?: string | null
  } | null
  machineUsageLogs?: any[]
  createdAt: string
}

// Configuração de Visual para Prioridades
const priorityConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  URGENT: { label: 'Urgente', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: AlertTriangle },
  HIGH: { label: 'Alta', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: AlertCircle },
  NORMAL: { label: 'Normal', color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100', icon: null },
  LOW: { label: 'Baixa', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: null },
}

export function KanbanBoard({ initialItems, sectors }: { initialItems: KanbanItem[], sectors: KanbanSector[] }) {
  const [items, setItems] = useState<KanbanItem[]>(initialItems)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<KanbanItem | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [itemNote, setItemNote] = useState('')
  const [showDetailedCards, setShowDetailedCards] = useState(false)

  // Definição das Colunas (Triagem fixa + Setores do banco)
  const columns = useMemo(() => {
    const dynamicColumns = [...sectors]
      .sort((a, b) => (a.kanbanOrder ?? 0) - (b.kanbanOrder ?? 0))
      .map(s => ({
        id: s.id,
        title: s.name,
        color: s.color || '#378ADD',
        icon: s.icon,
        isSystem: false
      }))

    return [
      { id: 'triagem', title: 'Entrada / Triagem', color: '#908D82', icon: 'Package', isSystem: true },
      ...dynamicColumns
    ]
  }, [sectors])

  // Handlers para Interação com o Board
  const handleOpenDetails = async (item: KanbanItem) => {
    setSelectedItem(item)
    setItemNote(item.productionNotes || '')
    setLoadingLogs(true)
    try {
      const history = await getProductionItemLogs(item.id)
      setLogs(history)
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
    } finally {
      setLoadingLogs(false)
    }
  }

  const handleSaveNote = async () => {
    if (!selectedItem) return
    setSavingNote(true)
    try {
      await updateItemNote(selectedItem.id, itemNote)
      setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, productionNotes: itemNote } : i))
    } catch (error) {
      console.error('Erro ao salvar nota:', error)
    } finally {
      setSavingNote(false)
    }
  }

  const handleMove = useCallback(async (itemId: string, targetSectorId: string | null) => {
    setLoadingId(itemId)
    
    // Atualização Otimista da UI
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, sectorId: targetSectorId === 'triagem' ? null : targetSectorId } : item
    ))

    try {
      // Ajuste para lidar com o valor nulo (triagem)
      const sectorIdToSave = targetSectorId === 'triagem' ? null : targetSectorId
      await moveOrderItem(itemId, sectorIdToSave)
    } catch (error) {
      // Reverter em caso de erro (recuperando dados iniciais ou tratando o erro)
      setItems(initialItems)
      console.error('Erro ao mover item:', error)
    } finally {
      setLoadingId(null)
    }
  }, [initialItems])

  // Filtragem dos Itens por Busca e Prioridade
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesPriority = !filterPriority || item.priority === filterPriority
      return matchesSearch && matchesPriority
    })
  }, [items, searchTerm, filterPriority])

  return (
    <div className="space-y-6">
      {/* Controles do Kanban - Estilo "Tactile Digitalism" */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-sm sticky top-0 z-20">
        <div className="relative w-full md:w-96 group">
          <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Pesquisar pedido, cliente ou produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50/50 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap w-full md:w-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
             {(['ALL', 'URGENT', 'HIGH', 'NORMAL', 'LOW'] as const).map(p => (
              <button
                key={p}
                onClick={() => setFilterPriority(p === 'ALL' ? null : p)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                  (filterPriority === p || (p === 'ALL' && !filterPriority))
                    ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                {p === 'ALL' ? 'Todos' : priorityConfig[p].label}
              </button>
            ))}
          </div>
          <div className="h-8 w-px bg-slate-200 hidden md:block mx-1" />
          <Button 
            variant="ghost"
            className="rounded-xl h-9 text-[10px] uppercase font-bold tracking-widest text-slate-500 hover:bg-slate-100 px-4"
            onClick={() => setShowDetailedCards(!showDetailedCards)}
          >
            {showDetailedCards ? 'Simplificado' : 'Detalhado'}
            <Layers className="w-3.5 h-3.5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Grid de Colunas - Experiência Imersiva */}
      <div className="flex gap-6 overflow-x-auto pb-8 min-h-[750px] scroll-smooth custom-scrollbar">
        {columns.map((column, colIdx) => {
          const columnItems = filteredItems.filter(i => {
            if (column.id === 'triagem') return i.sectorId === null
            return i.sectorId === column.id
          })

          return (
            <div key={column.id} className="flex-shrink-0 w-[320px] flex flex-col gap-4">
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)] transition-transform group-hover:scale-110" 
                    style={{ backgroundColor: column.color }} 
                  />
                  <h2 className="font-bold text-sm text-slate-700 tracking-tight">
                    {column.title}
                  </h2>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-200 border-none px-2 py-0.5 text-[10px]">
                    {columnItems.length}
                  </Badge>
                </div>
              </div>

              <div className={cn(
                "flex-1 rounded-[24px] p-4 flex flex-col gap-4 min-h-[600px] transition-all border border-slate-100",
                colIdx % 2 === 0 ? "bg-slate-50/40" : "bg-white/40"
              )}>
                <AnimatePresence mode="popLayout">
                  {columnItems.map((item) => {
                    const priority = priorityConfig[item.priority] || priorityConfig.NORMAL
                    const isLoading = loadingId === item.id
                    const isFirst = colIdx === 0
                    const isLast = colIdx === columns.length - 1

                    return (
                      <motion.div
                        key={item.id}
                        layoutId={item.id}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: -20 }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className={cn(
                          "bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/50 group relative overflow-hidden",
                          isLoading && "opacity-60 pointer-events-none grayscale"
                        )}
                        style={{ 
                          borderTop: `5px solid ${column.color}`,
                          background: `linear-gradient(to bottom, ${column.color}05, white 50px, white)`
                        }}
                      >
                        {/* Status Loading Overlay */}
                        {isLoading && (
                          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        )}

                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em]">
                            Nº {item.order.number}
                          </span>
                          {item.priority !== 'NORMAL' && (
                            <div className={cn(
                              "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                              priority.bg, priority.color
                            )}>
                              {priority.icon && <priority.icon className="w-2.5 h-2.5" />}
                              {priority.label}
                            </div>
                          )}
                        </div>

                        {/* Card Body */}
                        <div className="space-y-1.5 mb-5 cursor-pointer" onClick={() => handleOpenDetails(item)}>
                           <h3 className="text-sm font-extrabold text-slate-800 leading-snug group-hover:text-primary transition-colors">
                            {item.product.name}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                            <UserIcon className="w-3 h-3 text-slate-300" />
                            {item.order.customer.name}
                          </p>
                        </div>

                        {showDetailedCards && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4 mb-5 pt-4 border-t border-slate-50"
                          >
                             <div className="flex items-center justify-between">
                                <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">Qtd</span>
                                <span className="text-xs text-slate-700 font-black">{item.quantity} un</span>
                             </div>
                             
                             {item.description && (
                               <div className="space-y-1.5">
                                  <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest flex items-center gap-1">
                                    <FileText className="w-2.5 h-2.5" />
                                    Especificações
                                  </span>
                                  <p className="text-[10px] text-slate-500 line-clamp-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 font-medium">
                                    {item.description}
                                  </p>
                               </div>
                             )}

                             <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-1">
                                  <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">Técnico</span>
                                  <p className="text-[10px] text-slate-600 font-bold truncate">
                                    {item.assignedUser?.name || 'Não atribuído'}
                                  </p>
                               </div>
                               <div className="space-y-1 text-right">
                                  <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">Entrega</span>
                                  <div className={cn(
                                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black",
                                    item.dueDate && new Date(item.dueDate) < new Date() 
                                      ? "bg-red-50 text-red-600" 
                                      : "bg-indigo-50 text-indigo-600"
                                  )}>
                                    <Calendar className="w-3 h-3" />
                                    {item.dueDate ? new Date(item.dueDate).toLocaleDateString('pt-BR') : '--'}
                                  </div>
                               </div>
                             </div>
                          </motion.div>
                        )}

                        {/* Quick Actions Footer */}
                        <div className="flex items-center gap-2 pt-4 border-t border-slate-50 mt-auto">
                           {!isFirst && (
                              <button
                                onClick={() => handleMove(item.id, columns[colIdx - 1].id)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95"
                                title="Voltar etapa"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                           )}
                           <button 
                             className="flex-1 h-9 flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.1em] hover:bg-black transition-all shadow-md active:scale-95 px-3"
                             onClick={() => handleOpenDetails(item)}
                           >
                             <Settings2 className="w-3.5 h-3.5" />
                             Painel
                           </button>
                           {!isLast && (
                              <button
                                onClick={() => handleMove(item.id, columns[colIdx + 1].id)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95"
                                title="Avançar etapa"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                           )}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>

      {/* Painel de Detalhes - Modal Premium */}
      <ViewDialog
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        title={selectedItem ? `Produtor · Pedido #${selectedItem.order.number}` : ""}
        size="xl"
      >
        <DialogContent className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-0 overflow-hidden">
           {/* Lado Esquerdo: Informações e Edição */}
           <div className="lg:col-span-12 xl:col-span-8 p-8 space-y-8">
              {!selectedItem ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
                </div>
              ) : (
                <>
                  <div className="flex gap-6 items-center bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100/50">
                    <div className="w-24 h-24 rounded-2xl bg-white shadow-sm border border-indigo-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {selectedItem.product?.thumbnailUrl ? (
                          <img src={selectedItem.product.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-10 h-10 text-indigo-100" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <Badge className="bg-primary text-white mb-2">{selectedItem.product?.name}</Badge>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                          {selectedItem.order?.customer.name}
                        </h2>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Workflow de Produção</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                        <FileText className="w-4 h-4 text-primary" />
                        Instruções para o Operador
                    </h3>
                    <div className="relative group">
                        <Textarea 
                          value={itemNote}
                          onChange={(e) => setItemNote(e.target.value)}
                          className="min-h-[200px] rounded-[1.5rem] text-sm p-5 border-slate-100 bg-slate-50/30 focus-visible:ring-primary/10 transition-all font-medium"
                          placeholder="Descreva as especificações técnicas, acabamentos ou detalhes críticos para esta peça..."
                        />
                        <div className="absolute top-4 right-4 text-[10px] text-slate-300 font-bold uppercase pointer-events-none">Draft</div>
                    </div>
                    <Button 
                      onClick={handleSaveNote} 
                      disabled={savingNote} 
                      className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.01] transition-transform"
                    >
                      {savingNote ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                      Salvar Alterações de Produção
                    </Button>

                    <div className="pt-8 border-t border-slate-100">
                        <MachineSelector 
                          orderItemId={selectedItem.id}
                          sectorMachines={sectors.find(s => s.id === selectedItem.sectorId)?.machines || []}
                          activeLog={selectedItem.machineUsageLogs?.[0]}
                          onStatusChange={() => {
                            // Otimista (seria melhor revalidar o servidor aqui)
                          }}
                        />
                    </div>
                  </div>
                </>
              )}
           </div>

           {/* Lado Direito: Timeline/Logs */}
           <div className="hidden xl:block xl:col-span-4 bg-slate-50/50 border-l border-slate-100 p-8">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-8 flex items-center gap-2">
                <History className="w-3.5 h-3.5" />
                Auditoria de Processo
              </h4>
              
              <div className="space-y-8 relative after:absolute after:left-[7px] after:top-1 after:bottom-1 after:w-px after:bg-slate-200">
                 {loadingLogs ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="animate-pulse flex gap-5">
                        <div className="w-4 h-4 rounded-full bg-slate-200 flex-shrink-0 z-10" />
                        <div className="space-y-2 flex-1">
                          <div className="h-3 bg-slate-200 rounded w-full" />
                          <div className="h-2 bg-slate-100 rounded w-1/2" />
                        </div>
                      </div>
                    ))
                 ) : logs.length > 0 ? (
                   logs.slice(0, 10).map(log => (
                    <div key={log.id} className="flex gap-5 group/log relative">
                       <div className="w-4 h-4 rounded-full bg-white border-4 border-primary flex-shrink-0 z-10 shadow-sm" />
                       <div className="space-y-1 -mt-0.5">
                          <p className="text-[11px] font-extrabold text-slate-700 leading-tight">
                            {log.note || 'Evento de Status'}
                          </p>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold">
                            <span className="text-primary italic">@{log.user?.name || 'Sistema'}</span>
                            <span>•</span>
                            <span>{new Date(log.createdAt).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span>
                          </div>
                       </div>
                    </div>
                   ))
                 ) : (
                   <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                        <Activity className="w-5 h-5 text-slate-200" />
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sem logs recentes</p>
                   </div>
                 )}
              </div>
           </div>
        </DialogContent>
      </ViewDialog>
    </div>
  )
}
