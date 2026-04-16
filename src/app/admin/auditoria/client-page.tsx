'use client'

import { useState } from 'react'
import { AuditKanban } from '@/components/audit/AuditKanban'
import { AuditTimeline } from '@/components/audit/AuditTimeline'
import { getItemAuditHistory, moveOrderItemAudit } from '@/app/actions/audit'
import { ViewDialog, DialogContent } from '@/components/ui/dialog-system'
import { useToast } from '@/components/ui/toast'
import { 
  FileSearch, 
  History, 
  Info, 
  Clock, 
  User as UserIcon,
  X,
  ArrowRight,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ClientPageProps {
  initialItems: any[]
  initialSectors: any[]
}

export default function ClientPage({ initialItems, initialSectors }: ClientPageProps) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const toast = useToast()

  const handleSelectItem = async (item: any) => {
    setSelectedItem(item)
    setLoadingLogs(true)
    try {
      const history = await getItemAuditHistory(item.id)
      setLogs(history)
    } catch (error) {
      toast.error('Erro', 'Não foi possível carregar o histórico deste item.')
    } finally {
      setLoadingLogs(false)
    }
  }

  const handleMoveItem = async (itemId: string, sectorId: string | null) => {
    try {
      await moveOrderItemAudit(itemId, sectorId)
      toast.success('Movimentado', 'Item movido com sucesso pela auditoria.')
    } catch (error: any) {
      toast.error('Erro na movimentação', error.message)
      throw error // Repropagar para o Kanban fazer o rollback se necessário
    }
  }

  return (
    <>
      <AuditKanban 
        initialItems={initialItems} 
        initialSectors={initialSectors} 
        onSelectItem={handleSelectItem}
        onMoveItem={handleMoveItem}
      />

      {/* Modal de Auditoria Detalhada (Timeline) */}
      <ViewDialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] border-none shadow-2xl p-0">
          {selectedItem && (
            <div className="flex flex-col h-full">
              {/* Header do Modal */}
              <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-10 rounded-full -mr-16 -mt-16 blur-3xl" />
                
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                      <FileSearch className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">Registro de Auditoria</h2>
                      <p className="text-slate-400 text-sm font-medium">Histórico imutável de produção</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedItem(null)}
                    className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Item do Pedido</span>
                    <p className="text-sm font-bold truncate">#{selectedItem.order.number} - {selectedItem.product.name}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Cliente</span>
                    <p className="text-sm font-bold truncate">{selectedItem.order.customer.name}</p>
                  </div>
                </div>
              </div>

              {/* Corpo do Modal - Timeline */}
              <div className="p-8 bg-slate-50/50 flex-1">
                <div className="flex items-center gap-2 mb-8">
                  <History className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Linha do Tempo da Produção</h3>
                </div>

                {loadingLogs ? (
                  <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                     <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                     <p className="text-sm font-medium">Buscando rastros...</p>
                  </div>
                ) : (
                  <AuditTimeline logs={logs} />
                )}
              </div>

              {/* Footer */}
              <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                <Button 
                  onClick={() => setSelectedItem(null)}
                  className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest bg-slate-900 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  Fechar Auditoria
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </ViewDialog>
    </>
  )
}
