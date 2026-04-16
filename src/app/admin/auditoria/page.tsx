import { Suspense } from 'react'
import { getAuditProductionData, getAuditMetrics, getItemAuditHistory, moveOrderItemAudit, AuditFilters as AuditFiltersType } from '@/app/actions/audit'
import { AuditMetrics } from '@/components/audit/AuditMetrics'
import { AuditKanban } from '@/components/audit/AuditKanban'
import { AuditFilters } from '@/components/audit/AuditFilters'
import { AuditTimeline } from '@/components/audit/AuditTimeline'
import { ViewDialog, DialogContent } from '@/components/ui/dialog-system'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Factory, 
  History, 
  BarChart3, 
  Search, 
  LayoutDashboard,
  Kanban,
  FileSearch,
  Activity
} from 'lucide-react'
import { Metadata } from 'next'
import ClientPage from './client-page'

export const metadata: Metadata = {
  title: 'Auditoria de Planta | PrintAI',
  description: 'Rastreabilidade e métricas de produção em tempo real.',
}

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function AuditoriaPage({ searchParams }: PageProps) {
  // Parsing filters from searchParams
  const filters: AuditFiltersType = {
    sectorId: searchParams.sector === 'ALL' ? undefined : (searchParams.sector as string),
    status: searchParams.status === 'ALL' ? undefined : (searchParams.status as any),
    startDate: searchParams.start as string,
    customerName: searchParams.q as string,
    orderNumber: searchParams.q as string,
  }

  const [productionData, metrics] = await Promise.all([
    getAuditProductionData(filters),
    getAuditMetrics()
  ])

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1600px]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-2xl">
              <Factory className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Auditoria de Planta</h1>
          </div>
          <p className="text-slate-500 font-medium text-sm">Gestão, rastreabilidade e métricas industriais em tempo real.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
           <div className="px-4 py-2 border-r border-slate-50">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status do Sistema</span>
             <div className="flex items-center gap-2 mt-0.5">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-xs font-bold text-slate-700">Operacional</span>
             </div>
           </div>
           <div className="px-4 py-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Última Atualização</span>
              <span className="text-xs font-bold text-slate-700">{new Date().toLocaleTimeString()}</span>
           </div>
        </div>
      </header>

      <Suspense fallback={<div>Carregando métricas...</div>}>
         <AuditMetrics metrics={metrics} />
      </Suspense>

      <AuditFilters sectors={productionData.sectors} />

      <main className="mt-8 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-slate-100/50 p-6">
        <ClientPage 
          initialItems={productionData.items as any} 
          initialSectors={productionData.sectors} 
        />
      </main>
    </div>
  )
}
