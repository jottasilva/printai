import { Sidebar } from '@/components/sidebar';
import { getShippingData } from '@/app/actions/shipping';
import { ShippingDetailsModal } from '@/components/shipping/ShippingDetailsModal';
import { 
  Truck, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  ArrowRight,
  RefreshCcw,
  Tags,
  MapPin,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default async function EnviosPage() {
  const data = await getShippingData();
  const { stats, shippers } = data;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans text-[#2a3439] dark:text-slate-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 ml-64">
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-4">
            <div className="space-y-1">
               <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Logística & Expedição</span>
               </div>
               <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Centro de Distribuição</h2>
               <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
                  Gerenciamento inteligente de fluxos de transporte e monitoramento de entregas em tempo real.
               </p>
            </div>
            <div className="flex gap-3">
              <button className="h-12 px-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                <RefreshCcw className="w-4 h-4" />
                Sincronizar
              </button>
              <button className="h-12 px-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-slate-200 dark:shadow-none">
                <Tags className="w-4 h-4" />
                Lote de Etiquetas
              </button>
            </div>
          </div>

          {/* KPI Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Pronto p/ Coleta', val: stats.waitingCollection, icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
              { label: 'Em Trânsito', val: stats.inTransit, icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
              { label: 'Entregue Hoje', val: stats.deliveredToday, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
              { label: 'Alertas/Atrasos', val: stats.delays, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' },
            ].map((kpi, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl flex items-center gap-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                 <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", kpi.bg)}>
                    <kpi.icon className={cn("w-7 h-7", kpi.color)} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{kpi.label}</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{kpi.val}</p>
                 </div>
              </div>
            ))}
          </div>

          {/* Table & Filters Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
             {/* Filters Header */}
             <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex-1 min-w-[300px] relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input className="w-full pl-12 pr-4 h-12 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 rounded-xl text-sm transition-all outline-none dark:text-white" placeholder="Localizar remessa por pedido ou código..." type="text"/>
                </div>
                <div className="flex gap-3">
                   <select className="h-12 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm font-bold text-slate-600 dark:text-slate-300 outline-none focus:border-indigo-500/30 transition-all min-w-[160px]">
                      <option value="">Transportadora</option>
                      <option>Correios</option>
                      <option>Jadlog</option>
                      <option>Expresso</option>
                   </select>
                   <button className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 transition-all">
                      <Filter className="w-4 h-4" />
                   </button>
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificador</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente / Destino</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expedição</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cronograma</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Atual</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ação</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {shippers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-8 py-20 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                <Search className="w-8 h-8" />
                              </div>
                              <p className="text-sm font-bold text-slate-400">Nenhum fluxo de saída identificado.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        shippers.map((sh) => (
                          <tr key={sh.id} className="hover:bg-slate-50/80 dark:hover:bg-indigo-500/5 transition-all group">
                             <td className="px-8 py-6">
                                <div className="flex flex-col">
                                   <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">#{sh.id}</span>
                                   <span className="text-[10px] font-bold text-indigo-500 font-mono">ID: {sh.orderId.substring(0, 8)}</span>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-black text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100/50 dark:border-indigo-500/10">
                                      {sh.cliente.substring(0, 2).toUpperCase()}
                                   </div>
                                   <div className="flex flex-col">
                                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{sh.cliente}</span>
                                      <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                                         <MapPin className="w-3 h-3" />
                                         <span className="text-[10px] font-medium">{sh.address?.city} / {sh.address?.state}</span>
                                      </div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex flex-col gap-1.5">
                                   <div className="flex items-center gap-2">
                                      <Truck className="w-3 h-3 text-slate-400" />
                                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{sh.transportadora}</span>
                                   </div>
                                   <code className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-indigo-500 dark:text-indigo-400 w-fit">
                                      {sh.rastreio}
                                   </code>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex flex-col gap-1">
                                   <div className="flex items-center gap-2 text-slate-500">
                                      <Calendar className="w-3 h-3" />
                                      <span className="text-xs font-medium">{sh.dataEnvio}</span>
                                      <ArrowRight className="w-3 h-3" />
                                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{sh.dataEstimada}</span>
                                   </div>
                                   <div className="w-24 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                      <div className="w-2/3 h-full bg-indigo-500 rounded-full"></div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <Badge className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border-none shadow-sm", 
                                  sh.status === 'Entregue' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : 
                                  sh.status === 'Em Trânsito' ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                                  "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                )}>
                                   {sh.status}
                                </Badge>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <ShippingDetailsModal shipment={sh as any} />
                             </td>
                          </tr>
                        ))
                      )}
                   </tbody>
                </table>
             </div>
          </div>

          {/* Footer Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2 bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                   <Truck size={120} />
                </div>
                <div className="relative z-10 max-w-lg">
                   <h3 className="text-2xl font-black mb-3">Eficiência na Ponta de Entrega</h3>
                   <p className="text-slate-400 text-sm leading-relaxed mb-6">
                      Seu tempo médio de trânsito está <span className="text-emerald-400 font-bold">15% menor</span> comparado ao mês anterior. 
                      Aproveite para renegociar contratos com transportadoras baseados nestes indicadores de performance.
                   </p>
                   <div className="flex gap-4">
                      <Button className="bg-white text-slate-900 font-black h-11 px-8 rounded-xl text-xs uppercase tracking-widest">Ver Performance</Button>
                      <Button variant="outline" className="border-slate-700 text-white font-black h-11 px-8 rounded-xl text-xs uppercase tracking-widest">Exportar Dados</Button>
                   </div>
                </div>
             </div>

             <div className="bg-indigo-600 dark:bg-indigo-500 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                   <h4 className="text-sm font-black uppercase tracking-widest opacity-80 mb-6">Próximas Coletas</h4>
                   <div className="space-y-4">
                      {[
                        { time: '14:30', company: 'Jadlog Express' },
                        { time: '16:00', company: 'Correios (PLP)' },
                      ].map((pickup, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/5">
                           <span className="text-sm font-black">{pickup.time}</span>
                           <span className="text-xs font-bold opacity-90">{pickup.company}</span>
                        </div>
                      ))}
                   </div>
                   <Button className="w-full mt-6 bg-white/10 hover:bg-white/20 border-white/10 font-bold text-[10px] uppercase tracking-[0.2em] h-10">Solicitar Extra</Button>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
