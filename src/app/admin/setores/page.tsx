import { Sidebar } from '@/components/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Settings2, Activity, MoreHorizontal, LayoutGrid,
  Cpu, Package, AlertTriangle, ArrowUpRight,
  Plus, Search, Filter, ShieldCheck, Factory
} from 'lucide-react';
import { getSectors } from '@/app/actions/sectors';
import { getProducts } from '@/app/actions/products';
import { Badge } from '@/components/ui/badge';
import { serializeData } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SectorList } from '@/components/admin/SectorList';
import { AuditView } from '@/components/admin/AuditView';
import { SupplyCart } from '@/components/admin/SupplyCart';
import { NewSectorButton } from '@/components/admin/NewSectorButton';
import { prisma } from '@/lib/db';
import { getTenantId } from '@/lib/server-utils';

export const metadata = {
  title: 'Setores Industriais | PrintAI',
  description: 'Centro de Comando Industrial — gerencie setores, maquinário e suprimentos.',
};

export default async function SetoresPage() {
  const { tenantId } = await getTenantId();

  // Data Fetching
  const rawSectors = await getSectors();
  const sectors = serializeData(rawSectors);

  const rawProducts = await getProducts();
  const products = serializeData(rawProducts);

  // Anomalias recentes
  const recentAnomalies = await prisma.anomalyAlert.findMany({
    where: { tenantId, isResolved: false },
    include: { sector: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // KPIs
  const totalMachines = sectors.reduce((acc: number, s: any) => acc + (s._count?.machines || 0), 0);
  const criticalAnomalies = recentAnomalies.filter((a) => a.level === 'CRITICAL').length;

  return (
    <div className="flex min-h-screen bg-[#F0F2F5] dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-12 ml-64">
        <div className="max-w-[1600px] mx-auto space-y-10">

          {/* ── Top Command Bar ── */}
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-2">
                  OPERACIONAL
                </Badge>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Planta Industrial v4.0
                </span>
              </div>
              <h1 className="text-4xl font-light text-[#1A2B3B] dark:text-white tracking-tight">
                Centro de <span className="font-bold text-primary">Comando Industrial</span>
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Avatares decorativos */}
              <div className="flex -space-x-3 overflow-hidden p-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="inline-block h-10 w-10 rounded-2xl ring-4 ring-[#F0F2F5] dark:ring-slate-950 bg-slate-300 dark:bg-slate-800"
                  />
                ))}
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl ring-4 ring-[#F0F2F5] dark:ring-slate-950 bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-500">
                  +12
                </div>
              </div>
              {/* Botão que abre o Drawer — client component isolado */}
              <NewSectorButton />
            </div>
          </div>

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              label="Eficiência Global"
              value="84.2%"
              trend="+2.1%"
              icon={<Activity className="w-5 h-5" />}
              color="text-emerald-500"
            />
            <StatsCard
              label="Máquinas Ativas"
              value={totalMachines.toString()}
              trend="98% UP"
              icon={<Cpu className="w-5 h-5" />}
              color="text-blue-500"
            />
            <StatsCard
              label="Requisições Pendentes"
              value="07"
              trend="02 PRIORITÁRIAS"
              icon={<Package className="w-5 h-5" />}
              color="text-amber-500"
            />
            <StatsCard
              label="Alertas Críticos"
              value={criticalAnomalies.toString()}
              trend={criticalAnomalies > 0 ? 'AÇÃO NECESSÁRIA' : 'TUDO LIMPO'}
              icon={<AlertTriangle className="w-5 h-5" />}
              color={criticalAnomalies > 0 ? 'text-red-500' : 'text-slate-400'}
            />
          </div>

          {/* ── Tabs ── */}
          <Tabs defaultValue="overview" className="space-y-8">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-1">
              <TabsList className="bg-transparent h-auto p-0 gap-8">
                {[
                  { value: 'overview', label: 'VISÃO GERAL' },
                  { value: 'machines', label: 'MAQUINÁRIO' },
                  { value: 'supplies', label: 'SUPRIMENTOS' },
                  { value: 'audit', label: 'AUDITORIA' },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="relative pb-4 px-0 rounded-none bg-transparent text-slate-400 font-bold text-[11px] tracking-widest transition-all border-b-2 border-transparent data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="hidden md:flex items-center gap-3">
                <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-400 hover:text-primary">
                  <Filter className="w-3.5 h-3.5 mr-2" /> Filtrar
                </Button>
                <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-400 hover:text-primary">
                  <Search className="w-3.5 h-3.5 mr-2" /> Buscar
                </Button>
              </div>
            </div>

            {/* ── Visão Geral ── */}
            <TabsContent value="overview" className="space-y-10 animate-in fade-in duration-500">
              <div className="space-y-6">
                {/* Cabeçalho da lista de setores */}
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                    Setores Ativos
                  </h3>
                  <Badge variant="secondary" className="text-[10px] font-bold">
                    {sectors.length} configurados
                  </Badge>
                </div>

                <SectorList sectors={sectors} />
              </div>

              {/* Bloco IA — full width */}
              <Card className="border-none shadow-sm bg-[#1A2B3B] text-white rounded-[2.5rem] p-10 overflow-hidden relative group">
                <Factory className="absolute bottom-[-30px] right-[-30px] w-56 h-56 opacity-5 group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-bold">Otimização IA</h4>
                      <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                        Nossa inteligência está monitorando gargalos de produção em tempo real.
                        Acções preditivas reduzem o tempo de parada em até 40%.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-2xl border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold h-12 px-8 shrink-0"
                  >
                    Gerar Relatório de OEE
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* ── Maquinário ── */}
            <TabsContent value="machines" className="animate-in slide-in-from-bottom-4 duration-500">
              <Card className="border-none shadow-sm rounded-[2.5rem] p-20 text-center space-y-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-white/20">
                <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  <Cpu className="h-10 w-10" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-xl font-bold">Gestão de Ativos</h3>
                  <p className="text-sm text-slate-500">
                    Visualize e gerencie toda a infraestrutura de hardware da sua planta industrial em um só lugar.
                  </p>
                </div>
                <Button variant="outline" className="rounded-xl font-bold">
                  Ver Inventário de Máquinas
                </Button>
              </Card>
            </TabsContent>

            {/* ── Suprimentos ── */}
            <TabsContent value="supplies" className="animate-in slide-in-from-bottom-4 duration-500">
              <Card className="border-none shadow-sm rounded-[2.5rem] p-20 text-center space-y-4 bg-white dark:bg-slate-900">
                <div className="h-20 w-20 rounded-3xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mx-auto text-amber-600">
                  <Package className="h-10 w-10" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-xl font-bold">Requisição Operacional</h3>
                  <p className="text-sm text-slate-500">
                    Utilize o carrinho flutuante no canto inferior direito para solicitar insumos para qualquer setor.
                  </p>
                </div>
              </Card>
            </TabsContent>

            {/* ── Auditoria ── */}
            <TabsContent value="audit" className="animate-in slide-in-from-bottom-4 duration-500">
              <AuditView anomalies={serializeData(recentAnomalies)} />
            </TabsContent>
          </Tabs>
        </div>

        <SupplyCart availableProducts={products} sectors={sectors} />
      </main>
    </div>
  );
}

/* ── StatsCard ── */
function StatsCard({ label, value, trend, icon, color }: any) {
  return (
    <Card className="border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-500">
      <CardContent className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className={`h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] py-1">
            {trend}
          </Badge>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <h3 className="text-3xl font-bold tracking-tighter">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
