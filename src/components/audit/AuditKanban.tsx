'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  User as UserIcon, 
  Clock, 
  AlertTriangle, 
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Search,
  Timer
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// --- Tipos ---

interface AuditItem {
  id: string
  description: string | null
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  sectorId: string | null
  product: { name: string; thumbnailUrl: string | null }
  order: { number: string; customer: { name: string } }
  assignedUser?: { name: string; avatarUrl: string | null } | null
}

interface AuditSector {
  id: string
  name: string
  color: string | null
  icon: string | null
}

// --- Componente de Card (Sortable) ---

function SortableItem({ item, onClick }: { item: AuditItem, onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id, data: { type: 'item', item } })

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  }

  const priorityColors: any = {
    URGENT: "bg-red-500 text-white",
    HIGH: "bg-amber-500 text-white",
    NORMAL: "bg-slate-100 text-slate-500",
    LOW: "bg-emerald-500 text-white"
  }

  // Cálculo de tempo no setor (tempo desde o updatedAt)
  const timeInSector = formatDistanceToNow(new Date(item.updatedAt), { locale: ptBR, addSuffix: false })

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
        isDragging && "opacity-30 border-primary"
      )}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Impedir que o clique para abrir detalhes seja disparado durante o drag
        if (isDragging) return
        onClick()
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          ORD-{item.order.number}
        </span>
        <Badge className={cn("text-[9px] px-1.5 py-0 border-none", priorityColors[item.priority])}>
          {item.priority}
        </Badge>
      </div>

      <h4 className="text-sm font-bold text-slate-800 mb-3 leading-tight group-hover:text-primary transition-colors">
        {item.product.name}
      </h4>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
        <div className="flex items-center gap-1.5 font-bold text-[10px] text-slate-400">
          <Clock className="w-3 h-3" />
          {timeInSector}
        </div>
        
        {item.assignedUser && (
           <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-slate-500">{item.assignedUser.name.split(' ')[0]}</span>
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                {item.assignedUser.avatarUrl ? (
                  <img src={item.assignedUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-2.5 h-2.5 text-slate-400" />
                )}
              </div>
           </div>
        )}
      </div>
    </div>
  )
}

// --- Componente de Coluna ---

function KanbanColumn({ sector, items, onClickItem }: { sector: AuditSector, items: AuditItem[], onClickItem: (item: AuditItem) => void }) {
  return (
    <div className="flex-shrink-0 w-[300px] flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sector.color || '#cbd5e1' }} />
          <h3 className="text-sm font-bold text-slate-700 tracking-tight">{sector.name}</h3>
          <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold px-1.5 py-0 text-[10px]">
            {items.length}
          </Badge>
        </div>
      </div>

      <div className="flex-1 bg-slate-50/50 rounded-2xl p-3 border border-slate-100 flex flex-col gap-3 min-h-[500px]">
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map(item => (
            <SortableItem key={item.id} item={item} onClick={() => onClickItem(item)} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

// --- Componente Principal ---

export function AuditKanban({ 
  initialSectors, 
  initialItems, 
  onMoveItem, 
  onSelectItem 
}: { 
  initialSectors: AuditSector[], 
  initialItems: AuditItem[],
  onMoveItem: (itemId: string, sectorId: string | null) => Promise<void>,
  onSelectItem: (item: AuditItem) => void
}) {
  const [items, setItems] = useState(initialItems)
  const [activeId, setActiveId] = useState<string | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const sectors = useMemo(() => [
    { id: 'triagem', name: 'Triagem', color: '#94a3b8', icon: null },
    ...initialSectors
  ], [initialSectors])

  const findSectorOfItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return null
    return item.sectorId || 'triagem'
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Se dropou em cima de uma coluna (procurando pelo ID do setor)
    const overSectorId = sectors.find(s => s.id === overId)?.id || findSectorOfItem(overId)
    
    if (!overSectorId) return

    const currentSectorId = findSectorOfItem(activeId)

    if (currentSectorId !== overSectorId) {
      const targetSectorId = overSectorId === 'triagem' ? null : overSectorId
      
      // Update local otimista
      setItems(prev => prev.map(item => 
        item.id === activeId ? { ...item, sectorId: targetSectorId, updatedAt: new Date().toISOString() } : item
      ))

      try {
        await onMoveItem(activeId, targetSectorId)
      } catch (error) {
        setItems(initialItems) // Rollback
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-12 pt-2 custom-scrollbar">
        {sectors.map(sector => (
          <KanbanColumn
            key={sector.id}
            sector={sector}
            items={items.filter(i => (i.sectorId || 'triagem') === sector.id)}
            onClickItem={onSelectItem}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.4',
            },
          },
        }),
      }}>
        {activeId ? (
          <div className="rotate-3">
             <SortableItem 
              item={items.find(i => i.id === activeId)!} 
              onClick={() => {}} 
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
